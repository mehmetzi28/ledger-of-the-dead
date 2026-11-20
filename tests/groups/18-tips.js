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
test('Tips: one guidance box at a time; a story note waits under a tip, the next tip follows what you did',()=>{
  const tips=h=>(h.match(/class="tip"/g)||[]).length;
  newGame(); ui.tab='gates'; let h=renderAll('fresh game'); eq(tips(h),1,'a fresh game shows exactly one tip'); ok(/Spend your points/.test(h),'the stats tip');
  ok(!/From the Ledger/.test(h),'the intro story note waits'); ok(/The Ledger is open/.test(h),'the real notice still shows');
  ACTIONS.dismiss(); ok(S.notices.some(n=>n.c==='story'),'Dismiss keeps the note it hid');
  S.player.pts=0; h=renderAll('points spent'); eq(tips(h),0); ok(/From the Ledger/.test(h),'then the story note shows');
  arena([foe()]); h=renderAll('first fight'); eq(tips(h),1); eq(currentTip().id,'battle','before the first fight: how a fight works');
  ACTIONS.tip('battle'); S.mode='raise'; S.run.corpses=[corpse()]; eq(currentTip().id,'raise','then raising');
  mkMinion({traits:[Object.keys(TRAITS)[0]]}); ACTIONS.tip('raise'); eq(currentTip().id,'trait','after the first raise: its trait');
  S.run.events.push({m:'From the Ledger, "x": y',c:'story'}); eq(currentTip(),null,'a room log with a story note holds the tip for the next screen');
  S.run.events=[]; ACTIONS.tipsoff(); eq(currentTip(),null); S.mode='town'; S.run=null; S.player.pts=3; notify('From the Ledger, "x": y','story'); h=renderAll('tips off'); eq(tips(h),0,'Stop showing tips stops all'); ok(/From the Ledger/.test(h),'story with tips off');
});
test('Tips: an old save with seen tips (and an unknown one) loads and skips them',()=>{
  fresh(); const old=JSON.parse(JSON.stringify(S)); old.tips={stats:1,battle:1,gone_tip:1}; const g=normalizeSave(old); ok(g&&g.tips.stats&&g.tips.gone_tip);
  adoptSave(g); S.mode='town'; S.player.pts=3; eq(currentTip(),null,'stats seen'); arena([foe()]); ok(!currentTip()||currentTip().id!=='battle','battle seen');
});

})();
