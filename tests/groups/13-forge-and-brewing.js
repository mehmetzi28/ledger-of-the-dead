// Forge And Brewing tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Forge: six trophies from one gate and some gold forge that gate\'s gear',()=>{
  S.trophies={'Tunnel Rat':6,'Skeleton Guard':9}; S.gold=100; eq(forgePoints(0),6); fix(.5);
  const r=forgeGear(0,'weapon'); ok(r&&!r.master); eq(ITEM[r.it.id].set,0); eq(ITEM[r.it.id].slot,'weapon'); eq(S.gold,100-forgeGold(0)); eq(S.trophies['Tunnel Rat'],undefined); eq(S.trophies['Skeleton Guard'],9,'other gates untouched');
  eq(forgeGear(0,'weapon'),null,'out of trophies'); eq(forgeGear(1,'cape'),null,'bad slot');
});
test('Forge: a boss heart counts as 5 and is spent last',()=>{
  S.trophies={'Tunnel Rat':7,'b:The Rat King':1}; S.gold=100; eq(forgePoints(0),12); fix(.5); forgeGear(0,'armor'); eq(S.trophies['b:The Rat King'],1); eq(S.trophies['Tunnel Rat'],1);
  S.trophies={'Tunnel Rat':2,'b:The Rat King':1}; forgeGear(0,'relic'); eq(Object.keys(S.trophies).length,0);
});
test('Forge: 20% masterworks come from the next gate (never past the last)',()=>{
  S.trophies={'Tunnel Rat':6}; S.gold=100; fix(0); const r=forgeGear(0,'relic'); ok(r.master); eq(ITEM[r.it.id].set,1); eq(S.ti.master,1);
  S.trophies={'Throne Guard':6}; S.gold=1e4; const r2=forgeGear(5,'weapon'); ok(!r2.master); eq(ITEM[r2.it.id].set,5);
});
test('Forge: needs gold and bag space, only in town',()=>{
  S.trophies={'Tunnel Rat':12}; S.gold=0; eq(forgeGear(0,'weapon'),null); S.gold=100; while(S.inv.length<bagMax()) give('0-ta'); eq(forgeGear(0,'weapon'),null); S.inv=[]; arena([foe()]); eq(forgeGear(0,'weapon'),null);
});
test('Forge: any four trophies brew a potion',()=>{
  S.trophies={'Tunnel Rat':2,'t:Imp':2}; ok(brew('hp')); eq(S.belt.hp,1); eq(Object.keys(S.trophies).length,0);
  S.trophies={'Tunnel Rat':3}; ok(!brew('mp'),'only 3'); S.trophies={'Tunnel Rat':40}; S.belt.mp=3; ok(!brew('mp'),'belt full'); ok(!brew('x'));
});

})();
