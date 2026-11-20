// Days And Quests tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Days: ending a day with the quest undone costs nothing, cleared gates or not',()=>{
  const P=S.player; S.ti={clr:{0:1}}; P.xp=40; endDay(); eq(S.day,2); eq(S.watches,WATCHES); eq(P.xp,40); ok(!P.debuff); eq(P.hp,pMax()); eq(pMax(),48);
});
test('Days: an old saved dawn debuff is dropped at the next dawn',()=>{ S.player.debuff=true; endDay(); ok(!('debuff' in S.player)); });
test('Days: a finished quest is claimed once for 1 point and 15% of a level',()=>{
  const P=S.player; S.quest={kills:8,rooms:4,clears:1,claimed:false}; ok(questDone());
  eq(QUEST_PTS,1); eq(QUEST_XP,.15); claimQuest(); eq(P.pts,3+QUEST_PTS); eq(P.xp,Math.round(need(1)*QUEST_XP)); eq(S.ti.claims,1); ok(S.quest.claimed); ok(/\+1 stat point and/.test(S.notices[0].m));
  claimQuest(); eq(P.pts,3+QUEST_PTS,'second claim gives nothing'); eq(S.ti.claims,1);
});
test('Days: an unclaimed finished quest is claimed when the day ends',()=>{ S.quest={kills:9,rooms:5,clears:1,claimed:false}; endDay(); eq(S.ti.claims,1); ok(!S.player.debuff); });
test('Days: the daily quest counts cleared rooms (gate rooms and Tower floors), and old saves migrate',()=>{
  eq(QUEST.rooms,4); eq(S.quest.rooms,0); wonRoom(0); eq(S.quest.rooms,1); returnTown(); setLvl(20); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); startTower(1); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(S.quest.rooms,2,'a Tower floor counts');
  returnTown(); const c=corpse({}); raiseScene([c],20); fix(0); tryRaise(c.id); eq(S.quest.raises,undefined,'raising no longer feeds the quest'); returnTown();
  ok(/Clear rooms/.test(renderAll('quest')));
  const g=normalizeSave({v:2,player:{lvl:3},quest:{kills:5,raises:2,clears:0,claimed:false}}); eq(g.quest.rooms,0); eq('raises' in g.quest,false); eq(g.quest.kills,5);
});
test('Days: the quest panel says an unfinished quest simply lapses; finishing still pays',()=>{
  const P=S.player; P.xp=40; S.ti={clr:{0:1}}; let h=renderAll('quest'); ok(/Unfinished at dawn, it simply lapses./.test(h)); ok(!/Penalty/.test(h));
  endDay(); eq(P.xp,40,'no XP lost'); ok(!S.notices.some(n=>/Penalty/.test(n.m)));
  S.quest={kills:8,rooms:4,clears:1,claimed:false}; endDay(); eq(S.ti.claims,1,'finishing still pays');
});
test('Days: an unfinished quest cannot be claimed',()=>{ S.quest={kills:8,rooms:3,clears:1,claimed:false}; claimQuest(); ok(!S.quest.claimed); eq(S.player.pts,3); });
test('Days: resting skips to the next day, only from town',()=>{ restDay(); eq(S.day,2); arena([foe()]); restDay(); eq(S.day,2); });
test('Days: the third watch ends the day when you walk back into town',()=>{
  for(let i=0;i<WATCHES;i++){ startRun(0); ok(S.mode==='battle','run '+i); flee(); }
  eq(S.day,2); eq(S.watches,WATCHES); eq(S.runs,3);
});
test('Days: no runs without a watch left',()=>{ S.watches=0; startRun(0); eq(S.mode,'town'); });

})();
