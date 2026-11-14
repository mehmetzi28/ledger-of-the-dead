// Tips tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Tips: shown one at a time, the first time they apply',()=>{
  eq(currentTip().id,'stats'); dismissTip('stats'); eq(currentTip(),null); S.player.sp=1; eq(currentTip().id,'skill');
  S.tips.off=1; eq(currentTip(),null); delete S.tips.off; dismissTip('skill'); arena([foe()]); eq(currentTip().id,'battle');
});
test('Tips: no tip throws in any screen',()=>{
  const all=()=>TIPS.forEach(t=>{ t.when(); });
  all(); arena([foe()],3); all(); S.mode='raise'; all(); S.mode='defeat'; all(); S.run=null; S.mode='town'; S.player.lvl=12; all();
});

})();
