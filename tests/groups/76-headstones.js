// Headstones: an uncapped gold sink over Memorial names (src/game-phases-town.js carveHead, memorialHTML in src/ui-panels.js).
(function(){
const {test,ok,eq,near,setLvl,mkMinion,renderAll,cdx,invariants}=window.LOTD_T;
const names=n=>Array.from({length:n},(x,i)=>({nick:'H'+i,kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:5,st:0,tr:[],role:'striker',day:1,g:0}));

test('Headstones: carving costs gold and raises the minions\' max HP; the next tier costs more; the bonus is softly capped',()=>{
  setLvl(20); S.memorial=names(3); S.mode='town'; const m=mkMinion({nick:'Live',lvl:20}), hp=m.maxHp;
  eq(headTiers(),0); eq(headBonus(),0); eq(headCost(S.memorial[0]),HEAD_GOLD); S.gold=HEAD_GOLD-1; ok(!carveHead(0),'too poor');
  ui.tab='mem'; ok(/data-a="head"[^>]*disabled/.test(renderAll('poor head')),'a disabled button');
  S.gold=1e7; ok(carveHead(0)); eq(S.gold,1e7-HEAD_GOLD); eq(S.memorial[0].hs,1); ok(headBonus()>0&&headBonus()<=HEAD_K,'about HEAD_K for one tier');
  near(m.maxHp,hp*(1+headBonus()),1); eq(headCost(S.memorial[0]),Math.round(HEAD_GOLD*HEAD_GROW),'the next tier costs more');
  const g=S.gold; ACTIONS.head('0'); eq(S.memorial[0].hs,2); eq(S.gold,g-Math.round(HEAD_GOLD*HEAD_GROW)); ok(T_('headG')>0,'spend is counted');
  const h=renderAll('headstones'); ok(h.includes('Headstone, tier 2')&&h.includes('Headstones: 2 tiers carved'),'shown'); ok(h.includes('Raise headstone')&&h.includes('Carve a headstone'),'buttons');
  S.memorial[1].hs=HEAD_TOP; S.memorial[2].hs=HEAD_TOP; ok(headBonus()<HEAD_CAP&&headBonus()>HEAD_CAP*.99,'never past the cap'); ok(!carveHead(1),'a top stone cannot rise'); syncArmy(); near(m.maxHp,hp*(1+headBonus()),1); ok(m.maxHp>hp,'stronger');
  S.mode='dungeon'; ok(!carveHead(0),'town only'); S.mode='town'; invariants('headstones'); ok(cdx('minions').includes('headstone'),'Codex line');
});

test('Headstones: old Memorial entries load without them, bad values are repaired, a headstone keeps its name in a full Memorial',()=>{
  setLvl(5); S.memorial=names(2); const old=normalizeSave(JSON.parse(JSON.stringify(S))); ok(!('hs' in old.memorial[0]),'none on an old entry'); eq(headTiers(),0);
  S.memorial=[Object.assign(names(1)[0],{hs:'x'}),Object.assign(names(1)[0],{hs:-2}),Object.assign(names(1)[0],{hs:3.7}),Object.assign(names(1)[0],{hs:1e9})];
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); ok(!('hs' in g.memorial[0])&&!('hs' in g.memorial[1])); eq(g.memorial[2].hs,3); eq(g.memorial[3].hs,HEAD_TOP);
  S.memorial=names(MEM_MAX); S.memorial[MEM_MAX-1].hs=2; memorialize(mkMinion({nick:'Newest'})); eq(S.memorial.length,MEM_MAX); ok(S.memorial.some(e=>e.hs===2),'the headstone name stays');
});

test('Headstones: a released minion is not in the Memorial, so it has no headstone; every new line has Turkish',()=>{
  setLvl(10); S.memorial=[]; S.mode='town'; const x=mkMinion({nick:'Freed'}); release(x.uid); eq(S.memorial.length,0); ok(!carveHead(0),'nothing to carve');
  const T=s=>ok(trText(s)!==s,'no Turkish for "'+s+'"');
  ['Headstone, tier 3','Carve a headstone · 3000 gold','Raise headstone · 4500 gold','Headstones: 4 tiers carved. Your minions have +1.8% max HP for good, at most +6%.',
   'In town you may carve a headstone over any name here and raise it with gold, tier by tier. Each tier gives your minions a little more max HP for good, at most +6% in all.',
   'A headstone for N1, tier 2. Your minions have +1.0% max HP for good.'].forEach(T);
});
})();
