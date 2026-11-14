// Xp And Levels tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('XP: the curve rises every level',()=>{ eq(need(1),64); for(let l=1;l<80;l++) ok(need(l+1)>need(l)); });
test('XP: leveling gives 3 stat points, 1 skill point and refills HP/mana',()=>{
  const P=S.player; P.hp=1; P.mana=0; const ups=addXp(need(1)); eq(ups,1); eq(P.lvl,2); eq(P.xp,0); eq(P.pts,6); eq(P.sp,1); eq(P.hp,pMax()); eq(P.mana,pMana());
});
test('XP: a big gain rolls over several levels',()=>{ const P=S.player; let t=0; for(let l=1;l<6;l++) t+=need(l); const ups=addXp(t+5); eq(ups,5); eq(P.lvl,6); eq(P.xp,5); eq(P.sp,5); });
test('XP: a new skill unlocking is announced',()=>{ addXp(need(1)); ok(S.notices.some(n=>/Bone Spear/.test(n.m)),'level 2 names Bone Spear'); });
test('XP: minions level up to your level + 2 and no further',()=>{
  const m=mkMinion({}); minionXp(m,1e7); eq(m.lvl,3); ok(m.xp<mneed(3)); eq(minionXp(m,1e7),0);
});
test('XP: kill XP grows with level, rank, boss, elite, tower floor and NG+',()=>{
  const e=foe({lvl:5}); const b=killXp(e);
  ok(killXp(foe({lvl:6}))>b); ok(killXp(foe({lvl:5,rankI:2}))>b); eq(killXp(foe({lvl:5,boss:true})),Math.round((4+12.5)*2.5));
  ok(killXp(foe({lvl:5,elite:true}))>b); ok(killXp(foe({lvl:5,tw:12}))>b); S.ngp=1; eq(killXp(e),Math.round(16.5*1.25));
});

})();
