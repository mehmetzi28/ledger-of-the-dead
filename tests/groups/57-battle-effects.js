// Battle effects tests (src/fx.js, the PixiJS layer). Helpers and the runner live in tests/game-tests.js; this file only adds tests.
// In Node there is no PIXI and no DOM: the layer never starts, and every hook must be a no-op.
(function(){
const {test,ok,eq,seed,fix,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,canon,renderAll,invariants,NODE}=window.LOTD_T;
function noLayer(fn){   // in a browser the real layer may be running: hold it as "failed" for the test so nothing loads or plays
  const st=FXL.st; if(!NODE) FXL.st='failed';
  try{ fn(); } finally{ FXL.st=st; FXL.spy=null; FXL.q.length=0; }
}
function spied(fn){ const calls=[]; FXL.spy=(k,key)=>calls.push(k+':'+key); try{ fn(calls); } finally{ FXL.spy=null; } return calls; }
function playGate(steps){   // a real gate run: fight, raise every body, go on, until the boss room is won or steps run out
  S.watches=WATCHES; startRun(0); let boss=false;
  for(let i=0;i<steps&&S.run&&S.mode!=='town';i++){
    if(S.mode==='battle'){ if(S.run.room===S.run.rooms-1) boss=true; act(S.player.mana>=siphonCost()&&i%3===0?'siphon':'strike'); }
    else if(S.mode==='raise'){ for(const c of S.run.corpses) if(!c.tried) tryRaise(c.id); if(S.run.cleared) break; descend(); }
    else break;
    renderAll('fx play '+i); invariants('fx play '+i);
  }
  return boss;
}

test('Battle effects: with no PIXI every hook is a no-op, and a full battle, raises and a boss room run clean',()=>noLayer(()=>{
  if(NODE){ ok(typeof window.PIXI==='undefined','no library in the Node harness'); eq(FXL.st,'off'); }
  seed(77); setLvl(12); S.army=[]; mkMinion({lvl:8}); mkMinion({lvl:8,role:'striker'});
  ok(playGate(400),'reached the boss room'); ok(S.run.cleared||S.mode==='defeat','the gate ended');
  eq(FXL.q.length,0,'nothing queued while the layer is off'); eq(FXL.live.length,0); ok(FXL.app===null);
  fxe('strike',null); fxe('strike','nobody'); fxe('ult',{id:'e1'},{id:'toll'}); fxSync(); eq(FXL.q.length,0);
}));

test('Battle effects: hooks fire on strike, crit, siphon, ward, a minion hit, a foe hit, deaths, raises and a boss room',()=>noLayer(()=>{
  setLvl(10); const a=foe({hp:3}), b=foe({atk:5}); arena([a,b]); const m=mkMinion({});
  let c=spied(()=>{ fix(.5); act('strike'); });
  ok(c.includes('strike:'+a.id),'strike'); ok(c.includes('death:'+a.id),'a foe dies'); ok(c.includes('mhit:'+b.id),'a minion hit sparks on its target'); ok(c.some(x=>/^hurt:(p|m\d+)$/.test(x)),'a foe hits back');
  ok(c.indexOf('strike:'+a.id)<c.indexOf('death:'+a.id),'the death comes after the blow that caused it');
  c=spied(()=>{ fix(0); act('strike'); }); ok(c.includes('strike:'+b.id),'a crit is still a strike');
  S.player.mana=99; c=spied(()=>{ fix(.5); act('siphon'); }); ok(c.includes('siphon:'+b.id),'siphon');
  S.player.mana=99; c=spied(()=>{ act('ward'); }); ok(c.includes('ward:p'),'ward');
  c=spied(()=>{ hurtAlly(m,m.hp+5); hurtAlly(S.player,1); }); ok(c.includes('death:m'+m.uid),'a minion that falls'); ok(!c.includes('death:p'),'not the Necromancer: the defeat screen covers that');
  const ok1=corpse(), bad=corpse(); raiseScene([ok1,bad],20);
  c=spied(()=>{ fix(0); tryRaise(ok1.id); fix(.999); tryRaise(bad.id); }); ok(c.includes('raise:'+ok1.id),'raise'); ok(c.includes('rfail:'+bad.id),'failed raise');
  arena([foe()]); S.run.room=S.run.rooms-1; c=spied(()=>{ spawnRoom(); }); ok(c.includes('boss:'+S.run.enemies[0].id),'a boss room starts');
}));

test('Battle effects: the cards carry the data-u keys the layer aims at, and hooks never move the numbers',()=>noLayer(()=>{
  setLvl(10); const e=foe(), m=mkMinion({}); arena([e,foe({hp:0,dead:true})]);
  let h=renderAll('fx keys'); ok(h.includes('data-u="p"'),'the Necromancer'); ok(h.includes('data-u="m'+m.uid+'"'),'a minion'); ok(h.includes('data-u="'+e.id+'"'),'a foe');
  ok(h.includes('data-u="'+S.run.enemies[1].id+'"'),'a fallen foe keeps its key'); eq(fxKey(m),'m'+m.uid); eq(fxKey(S.player),'p'); eq(fxKey(null),null);
  const c=corpse(); raiseScene([c],10); S.run.lastXp=0; h=renderAll('fx raise'); ok(h.includes('data-u="'+c.id+'"'),'a body on the raise screen');
  const fight=spy=>{ fresh(); seed(4242); setLvl(14); mkMinion({lvl:10}); mkMinion({lvl:10,role:'reaper'}); S.watches=WATCHES; startRun(1);
    if(spy) FXL.spy=()=>{}; for(let i=0;i<30&&S.mode==='battle';i++) act(i%4===1?'siphon':'strike'); FXL.spy=null; return canon({run:S.run,p:S.player,army:S.army,rnd:Math.random()}); };
  eq(fight(true),fight(false),'the same seed gives the same fight with the hooks spied on');
}));

test('Battle effects: Light, Reduce motion and the OS reduced-motion setting keep the library from loading',()=>{
  if(!NODE) return;   // needs the fake document
  const keep={st:FXL.st,tag:FXL.tag,later:FXL.later,mm:window.matchMedia,ce:document.createElement,head:document.head,fx:VIEW.fx,calm:VIEW.calm,info:console.info};
  const made=[]; let added=0;
  try{
    window.matchMedia=()=>({matches:false}); document.createElement=t=>{ const el={tag:t}; made.push(el); return el; }; document.head={appendChild(){ added++; }};
    FXL.later=f=>f(); FXL.st='off'; FXL.tag=false; console.info=()=>{};
    VIEW.calm=false; VIEW.fx='light'; ok(!fxAllowed()); fxSync(); eq(FXL.st,'off','Light'); eq(made.length,0);
    VIEW.fx='full'; VIEW.calm=true; ok(!fxAllowed()); fxSync(); eq(FXL.st,'off','Reduce motion'); eq(made.length,0);
    VIEW.calm=false; window.matchMedia=()=>({matches:true}); ok(!fxAllowed()); fxSync(); eq(FXL.st,'off','OS reduced motion'); eq(made.length,0);
    window.matchMedia=()=>({matches:false}); ok(fxAllowed(),'Full, calm off, no OS request'); fxSync();
    eq(FXL.st,'loading'); eq(made.length,1); eq(made[0].tag,'script'); eq(made[0].src,'lib/pixi.min.js','relative path, so it works from disk too'); eq(added,1);
    fxSync(); eq(made.length,1,'loaded once');
    VIEW.fx='light'; fxSync(); eq(FXL.st,'off','switched off while loading'); made[0].onload(); eq(FXL.st,'off','a late load does not start it');
    VIEW.fx='full'; FXL.st='loading'; made[0].onload(); eq(FXL.st,'failed','loaded but no PIXI: off, quietly'); fxSync(); eq(made.length,1,'never retried');
    FXL.st='loading'; made[0].onerror(); eq(FXL.st,'failed','a missing file');
    fxe('strike',S.player); eq(FXL.q.length,0,'still a no-op');
  } finally {
    FXL.st=keep.st; FXL.tag=keep.tag; FXL.later=keep.later; window.matchMedia=keep.mm; document.createElement=keep.ce; document.head=keep.head; VIEW.fx=keep.fx; VIEW.calm=keep.calm; console.info=keep.info;
    if(keep.ce===undefined) delete document.createElement; if(keep.head===undefined) delete document.head;
  }
});

test('Battle effects: the Effects setting says Full draws them, in Turkish too',()=>{
  VIEW.fx='auto'; ui.tab='settings'; let h=renderAll('fx setting'); ok(/Full also draws battle effects/.test(h));
  const en='Light uses simpler icon shading and still backgrounds, for phones. Full also draws battle effects. Auto picks Light on small or slow devices';
  for(const t of [en+' (now: Full).',en+' (now: Light).',en+'.']) ok(/savaş efektlerini de çizer/.test(trText(t)),'Turkish: '+t);
  VIEW.fx='auto';
});

})();
