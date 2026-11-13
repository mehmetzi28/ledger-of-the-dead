// Runs tests/game-tests.js against index.html in Node, with a small fake browser (no packages needed).
//   node tests/run-tests.js            run everything
//   node tests/run-tests.js save       only tests whose name contains "save"
// Exit code is 1 if any test fails, so it can gate a commit or CI.
const fs=require('fs'), path=require('path'), vm=require('vm');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const m=html.match(/<script>([\s\S]*)<\/script>/);
if(!m){ console.error('No inline <script> found in index.html'); process.exit(1); }

function fakeStorage(){
  const d=new Map();
  return {getItem:k=>d.has(k)?d.get(k):null, setItem:(k,v)=>{ d.set(k,String(v)); }, removeItem:k=>{ d.delete(k); },
    clear:()=>d.clear(), key:i=>[...d.keys()][i]??null, get length(){ return d.size; }};
}
const classes=new Set();
const app={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
const listeners={};
const ctx={
  console, setTimeout, clearTimeout, performance, btoa, atob, navigator:{},
  localStorage:fakeStorage(),
  requestAnimationFrame:()=>0, matchMedia:()=>({matches:true}), innerWidth:1200, innerHeight:800, devicePixelRatio:1,
  addEventListener:()=>{},
  document:{
    body:{classList:{toggle:(c,v)=>{ (v===undefined?!classes.has(c):v)?classes.add(c):classes.delete(c); }, contains:c=>classes.has(c), add:c=>classes.add(c), remove:c=>classes.delete(c)}},
    activeElement:null,
    getElementById:id=>id==='app'?app:id==='embers'?{}:null,
    addEventListener:(t,f)=>{ (listeners[t]=listeners[t]||[]).push(f); },
    execCommand:()=>false,
  },
  __listeners:listeners,
};
ctx.window=ctx;
vm.createContext(ctx);
try{ vm.runInContext(m[1],ctx,{filename:'index.html'}); }
catch(e){ console.error('index.html failed to load:\n'+(e.stack||e)); process.exit(1); }
vm.runInContext(fs.readFileSync(path.join(__dirname,'game-tests.js'),'utf8'),ctx,{filename:'game-tests.js'});

const filter=process.argv[2]||'';
const res=ctx.LOTD_TESTS.run({filter,quiet:true,trace:!!process.env.TRACE});   // TRACE=1 prints each test name before it runs (finds a hang)
let group='';
for(const r of res.results){
  const g=r.name.split(':')[0]; if(g!==group){ group=g; console.log('\n'+g); }
  console.log((r.ok?'  \x1b[32mok\x1b[0m   ':'  \x1b[31mFAIL\x1b[0m ')+r.name.slice(g.length+1).trim()+(r.ok?'':'\n         '+r.err));
}
console.log('\n'+res.pass+' passed, '+res.fail+' failed ('+res.results.length+' tests, '+res.ms+' ms)');
process.exit(res.fail?1:0);
