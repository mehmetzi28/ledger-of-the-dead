// Rough render timings in Node with the tests' fake browser: node tools/perf.js   (LOTD_HTML=path measures another copy of index.html)
// It times script load, then render() for every town tab and a battle with a late-game state (tests' richState). The fake DOM does no layout
// or painting, so these are the game's own string-building costs only; the browser adds parse, style and paint on top.
const zlib=require('zlib'), fs=require('fs'), path=require('path');
const file=process.env.LOTD_HTML||path.join(__dirname,'..','index.html'), html=fs.readFileSync(file);
console.log('index.html '+(html.length/1024).toFixed(0)+' KB, gzip '+(zlib.gzipSync(html,{level:9}).length/1024).toFixed(0)+' KB');
let t=performance.now(); const ctx=require('../tests/load-game')(['game-tests.js']); console.log('script load+eval '+(performance.now()-t).toFixed(0)+' ms');
require('vm').runInContext(`(function(){
  const T=window.LOTD_T, ms=(n,f)=>{ f(); const t=performance.now(); for(let i=0;i<n;i++) f(); return (performance.now()-t)/n; }, out=[];
  T.richState(); Math.random=T.mulberry32(5);
  for(const tab of T.TABS){ ui.tab=tab; out.push([tab,ms(20,render),app.innerHTML.length]); }
  ui.tab='codex'; for(const k of ['basics','bosses','gear']){ ui.cx=k; out.push(['codex:'+k,ms(20,render),app.innerHTML.length]); }
  ui.cxq='poison'; out.push(['codex search',ms(10,render),app.innerHTML.length]); ui.cxq='';
  T.arena([T.foe({}),T.foe({}),T.foe({boss:true,base:'The Rat King',name:'The Rat King',role:'reaper'})]); out.push(['battle',ms(30,render),app.innerHTML.length]);
  S.mode='town'; S.run=null; ui.tab='gates';
  out.push(['save()',ms(30,save),0]);
  window.__perf=out;
})()`,ctx);
for(const [k,v,n] of ctx.__perf) console.log(k.padEnd(14)+v.toFixed(2).padStart(8)+' ms   '+(n/1024).toFixed(0).padStart(5)+' KB html');
