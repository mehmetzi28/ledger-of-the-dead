// Loads index.html's script into a Node vm with a small fake browser (no packages needed).
// Used by run-tests.js and run-balance.js. Returns the vm context; extra files run in the same global scope.
const fs=require('fs'), path=require('path'), vm=require('vm');
module.exports=function loadGame(extraFiles){
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const m=html.match(/<script>([\s\S]*)<\/script>/);
  if(!m) throw new Error('No inline <script> found in index.html');
  const store=new Map(), classes=new Set(), listeners={};
  const ctx={
    console, setTimeout, clearTimeout, performance, btoa, atob, navigator:{},
    localStorage:{getItem:k=>store.has(k)?store.get(k):null, setItem:(k,v)=>{ store.set(k,String(v)); }, removeItem:k=>{ store.delete(k); },
      clear:()=>store.clear(), key:i=>[...store.keys()][i]??null, get length(){ return store.size; }},
    requestAnimationFrame:()=>0, matchMedia:()=>({matches:true}), innerWidth:1200, innerHeight:800, devicePixelRatio:1,
    addEventListener:(t,f)=>{ (listeners['w:'+t]=listeners['w:'+t]||[]).push(f); },   // window listeners, kept apart from document ones
    document:{
      body:{classList:{toggle:(c,v)=>{ (v===undefined?!classes.has(c):v)?classes.add(c):classes.delete(c); }, contains:c=>classes.has(c), add:c=>classes.add(c), remove:c=>classes.delete(c)}},
      activeElement:null,
      getElementById:id=>id==='app'?app:id==='embers'?{}:null,
      addEventListener:(t,f)=>{ (listeners[t]=listeners[t]||[]).push(f); },
      execCommand:()=>false,
    },
    __listeners:listeners,
  };
  const app={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
  ctx.window=ctx;
  vm.createContext(ctx);
  vm.runInContext(m[1],ctx,{filename:'index.html'});
  for(const f of extraFiles||[]) vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),ctx,{filename:f});
  return ctx;
};
