// History tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('History: every way out of a run is recorded with its numbers',()=>{
  arena([foe({hp:1})]); fix(.5); act('strike'); returnTown(); let h=S.hist[S.hist.length-1]; eq(h.res,'left'); eq(h.rooms,1); eq(h.kills,1); ok(h.xp>0&&h.gold>0); eq(h.g,0);
  arena([foe()]); flee(); eq(S.hist[S.hist.length-1].res,'fled');
  arena([foe({atk:1e6})]); S.player.hp=1; act('strike'); returnTown(); eq(S.hist[S.hist.length-1].res,'fell');
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); S.watches=3; startRun(0); let n=0; while(n++<300&&!(S.mode==='raise'&&S.run.cleared)){ if(S.mode==='battle') act('strike'); else descend(); } returnTown();
  h=S.hist[S.hist.length-1]; eq(h.res,'cleared'); eq(h.rooms,4);
  const L=S.life; eq(L.runs,4); eq(L.clears,1); eq(L.deaths,1); eq(L.fled,1); eq(L.rooms,5); ok(L.kills>=5); eq(L.gold,S.hist.reduce((a,x)=>a+x.gold,0));
});
test('History: Tower runs record their floors; only the last 20 runs are kept',()=>{
  setLvl(30); S.tower.best=20; startTower(11); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); descend(); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); returnTown();
  const h=S.hist[0]; eq(h.g,-1); eq(h.f0,11); eq(h.f1,12); eq(h.rooms,2);
  for(let i=0;i<30;i++){ S.watches=3; startRun(0); flee(); } eq(S.hist.length,HIST_N); eq(S.life.runs,31);
});
test('History: closing the tab mid-run records it in the save, not twice',()=>{
  startRun(0); const snap=snapshot(); eq(snap.hist.length,1); eq(snap.life.runs,1); eq(S.hist.length,0,'live game untouched');
  save(); S=null; loadGame(); eq(S.hist.length,1); eq(S.life.runs,1);
});
test('History: lifetime totals survive New Game+, damaged history is cleaned',()=>{
  S.life.runs=50; S.ti={clr:{5:1}}; ok(startNGP()); eq(S.life.runs,50); eq(S.hist.length,0);
  const g=normalizeSave({v:2,player:{lvl:2},hist:[{d:1,res:'left'},null,'x',{d:'a'}],life:{runs:'x',kills:5,bogus:9}}); eq(g.hist.length,1); eq(g.life.runs,0); eq(g.life.kills,5); eq(g.life.bogus,undefined);
});
test('History: the History tab renders',()=>{ ui.tab='hist'; ok(/No runs yet/.test(renderAll('empty history'))); richState(); ui.tab='hist'; const h=renderAll('full history'); ok(/Hell Tower, floor/.test(h)&&/Drought/.test(h)); });

})();
