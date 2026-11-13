// UI fuzzer: plays the real game by clicking random enabled buttons (and pressing battle keys), the way a curious player would.
// After every click it checks the game's rules (tests/game-tests.js invariants), that the page shows no "undefined"/"NaN",
// and that a save/load round trip keeps the game identical. Any crash or broken rule is reported with its seed and last clicks.
//   node tests/fuzz.js                 30 seeds x 4000 clicks
//   node tests/fuzz.js 100 8000        100 seeds x 8000 clicks
//   node tests/fuzz.js 1 4000 777      one seed (777) to replay a failure
const load=require('./load-game');
const seeds=+process.argv[2]||30, steps=+process.argv[3]||4000, first=+process.argv[4]||1;
let failures=0; const t0=Date.now(), seen={};
for(let sd=first;sd<first+seeds;sd++){
  const ctx=load(['game-tests.js']), T=ctx.LOTD_TESTS, vm=require('vm'), run=c=>vm.runInContext(c,ctx);
  const rand=T.mulberry32(sd*7919);   // the fuzzer's own choices
  run("Math.random=LOTD_TESTS.mulberry32("+sd+")");   // the game's dice
  // a third of the seeds start fresh, a third mid-game (Tower open), a third late (every gate cleared, NG+ ready)
  const stage=sd%3, lvl=[1,14,36][stage];
  run(`SFX.on=false; newGame(); S.notices=[];
    if(${lvl}>1){ const P=S.player; P.lvl=${lvl}; P.pts=0; P.sp=${lvl}-1; P.stats={strength:4+${lvl},constitution:6+${lvl},intelligence:6+${lvl},will:4+Math.round(${lvl}/2)};
      S.gold=${lvl}*400; S.belt={hp:2,mp:2}; S.salts=2; const top=${stage===1?2:5};
      for(const sl of GEAR_SLOTS){ const d=Object.values(ITEM).find(x=>!x.uq&&x.set===top&&x.slot===sl); const it=addItem(d.id); equip(it.u); }
      for(let i=0;i<8;i++) addItem(pick(Object.values(ITEM).filter(x=>!x.uq&&x.set<=top)).id);
      S.ti={clr:{}}; for(let i=0;i<=top;i++) S.ti.clr[i]=1; S.tower.best=${stage===1?10:60};
      for(const k of Object.keys(TROPHY).slice(0,10)) S.trophies[k]=7;
      const mk=(role,name,o)=>{ const m=Object.assign({uid:++S.uid,armed:false,eq:null,nick:freeNick(),name,kind:name,role,rankI:top,lvl:${lvl},xp:0,boss:false,elite:false,hf:1,af:1,hp:1,maxHp:null,atk:0,lvl0:${lvl}-3,stage:0,traits:[pick(TRAIT_IDS)]},o); syncMinion(m); m.hp=m.maxHp; S.army.push(m); };
      mk('vanguard','Throne Guard'); mk('striker','Ash Revenant'); mk('mender','Whisper Choir'); mk('reaper','The Pale Sovereign',{boss:true}); mk('vanguard','Ash Praetorian',{armed:true,eq:{weapon:null,armor:null,relic:null}});
      if(${stage}===2){ addItem('u3'); S.ti.clr[5]=1; }
      P.hp=pMax(); P.mana=pMana(); }
    ui.tab='gates'; render();`);
  const click=(a,k)=>ctx.__listeners.click[0]({target:{closest:()=>({dataset:{a,k},disabled:false})}});
  const key=k=>ctx.__listeners.keydown[0]({key:k,preventDefault(){}});
  const trail=[]; let err=null;
  for(let i=0;i<steps&&!err;i++){
    const html=ctx.document.getElementById('app').innerHTML, btns=[];
    for(const m of html.matchAll(/<button([^>]*)>/g)){
      const at=m[1], a=(at.match(/data-a="([^"]+)"/)||[])[1]; if(!a||/\sdisabled/.test(at)) continue;
      const k=(at.match(/data-k="([^"]*)"/)||[])[1];
      // newgame wipes progress and copycode needs a clipboard: keep them rare
      const w=a==='newgame'?.02:a==='copycode'?0:['act','raise','descend','door','enter','tower','town','learn','alloc','equip','event','cmd','target','skmod'].includes(a)?6:1;
      if(w) btns.push({a,k,w});
    }
    const mode=run('S.mode');
    try{
      if(mode==='battle'&&rand()<.25){ const k='1234567qw'[Math.floor(rand()*9)]; trail.push('key '+k); key(k); }
      else if(btns.length){ let x=rand()*btns.reduce((s,b)=>s+b.w,0), b=btns[0]; for(const c of btns){ x-=c.w; if(x<=0){ b=c; break; } } trail.push(b.a+(b.k!=null?':'+b.k:'')); click(b.a,b.k); }
      else { trail.push('no buttons in '+mode); err='no enabled buttons on the '+mode+' screen'; break; }
      run("LOTD_TESTS.invariants('fuzz')"); T.cleanHTML(ctx.document.getElementById('app').innerHTML,mode+' screen');
      if(run("S.mode")==='town'&&rand()<.05){   // a save/load round trip must not change the game
        const r=run("(()=>{ save(); const a=JSON.stringify(S); S=null; loadGame(); const b=JSON.stringify(S); return a===b?'':'changed'; })()");
        if(r){ const d=run("(()=>{ const x=JSON.parse(localStorage.getItem(SAVE_KEY)); const f=(a,b,p)=>{ if(JSON.stringify(a)===JSON.stringify(b)) return null; if(!a||!b||typeof a!=='object') return p+': '+JSON.stringify(a)+' vs '+JSON.stringify(b); for(const k of new Set(Object.keys(a).concat(Object.keys(b)))){ const r=f(a[k],b[k],p+'.'+k); if(r) return r; } return p; }; return f(x,JSON.parse(JSON.stringify(S)),'S'); })()");
          if(d) throw new Error('save/load changed the game at '+d); }
        run('render()');
      }
    }catch(e){ err=(e&&e.message)||String(e); }
    if(trail.length>12) trail.shift();
  }
  const st=run("({day:S.day,lvl:S.player.lvl,tower:S.tower.best,titles:Object.keys((S.ti&&S.ti.got)||{}).length})");
  if(err){ const sig=err.replace(/\d+/g,'#').slice(0,120); failures++; if(!seen[sig]){ seen[sig]=1; console.log('\nFAIL seed '+sd+': '+err+'\n  last clicks: '+trail.join(' > ')); } }
  else process.stdout.write('.');
  if(sd===first+seeds-1||sd%10===0) process.stdout.write(' [seed '+sd+' day '+st.day+' lv '+st.lvl+' tower '+st.tower+' titles '+st.titles+']\n');
}
console.log('\n'+(seeds-failures)+'/'+seeds+' seeds clean, '+failures+' failed ('+((Date.now()-t0)/1000).toFixed(1)+' s)');
process.exit(failures?1:0);
