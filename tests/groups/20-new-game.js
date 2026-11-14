// New Game+ tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('NG+: locked until the Throne of Ash is cleared',()=>{ ok(!canNGP()); ok(!startNGP()); S.ti={clr:{5:1}}; ok(canNGP()); arena([foe()]); ok(!startNGP(),'town only'); });
test('NG+: restarts at level 1, keeps titles, bestiary, tips and one unique',()=>{
  setLvl(40); S.ti={clr:{0:1,5:1},got:{g0:3},raised:9}; S.kills={'Tunnel Rat':30}; S.tips={stats:1}; give('u3'); give('u1'); S.gold=5000; mkMinion({});
  ok(startNGP('u3')); eq(S.ngp,1); eq(S.player.lvl,1); eq(S.gold,0); eq(S.army.length,0); eq(S.kills['Tunnel Rat'],30); eq(S.ti.got.g0,3); eq(S.tips.stats,1);
  eq(S.inv.map(x=>x.id).join(),'u3'); eq(Object.keys(S.ti.clr).length,0); ok(!canNGP()); ok(S.notices.some(n=>/New Game\+ 1/.test(n.m)));
});
test('NG+: a unique you do not own cannot be carried; NG+ stacks',()=>{ S.ti={clr:{5:1}}; S.ngp=1; ok(startNGP('w12')); eq(S.inv.length,0); eq(S.ngp,2); near(ngpFoe(),1.6,1e-9); near(ngpReward(),1.5,1e-9); });
test('NG+: foes in NG+ rooms really are tougher',()=>{ seed(4); startRun(0); const a=S.run.enemies[0].maxHp; fresh(); S.ngp=1; seed(4); startRun(0); eq(S.run.enemies[0].maxHp,Math.round(a*1.3)); });

})();
