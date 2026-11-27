// Enemies And Rooms tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Enemies: stats grow with level and gate; bosses and elites are tougher',()=>{
  const a=mobStats(0,1,1,1); ok(mobStats(0,5,1,1).hp>a.hp); ok(mobStats(1,1,1,1).atk>a.atk);
  const b=mobStats(0,1,1,1,true); near(b.hp/a.hp,3.2,.1); const e=mobStats(0,1,1,1,false,true); near(e.hp/a.hp,1.5,.1);
});
test('Enemies: rooms hold 2, then 3, then 3-4 foes, and the last room has the boss',()=>{
  startRun(0); const r=S.run; eq(r.enemies.length,2);
  r.room=1; spawnRoom(); eq(r.enemies.length,3);
  r.room=2; spawnRoom(); ok(r.enemies.length>=3&&r.enemies.length<=4);
  r.room=3; spawnRoom(); ok(r.enemies[0].boss); eq(r.enemies[0].name,'The Rat King'); eq(r.enemies.length,3); eq(r.enemies[0].abil,'swarm');
});
test('Enemies: a room never holds two menders',()=>{
  setLvl(30); for(let di=0;di<6;di++){ S.watches=3; startRun(di); for(let i=0;i<150;i++){ S.run.room=i%4; spawnRoom(); ok(S.run.enemies.filter(e=>e.role==='mender').length<=1,'gate '+di); } S.run=null; S.mode='town'; }
});
test('Enemies: elites get a prefix and every foe gets an id, level and HP',()=>{
  setLvl(30); let elites=0; for(let i=0;i<300;i++){ const e=makeEnemy(i%6,5,false); if(e.elite){ elites++; ok(ELITE.some(p=>e.name.startsWith(p+' '))); } ok(e.id&&e.hp>0&&e.atk>0&&e.hp===e.maxHp); }
  ok(elites>10&&elites<60,'about 10% elites, got '+elites);
});
test('Enemies: foe armor and attack follow the gate tables',()=>{
  eq(foeArmor(),0,'no armor in town'); setLvl(30);
  for(let di=0;di<6;di++){ S.watches=3; startRun(di); eq(foeArmor(),DIFF.armor[di]); near(dmgMul(),1-DIFF.armor[di],1e-9); S.run=null; S.mode='town'; }
});
test('Enemies: New Game+ adds 15% HP and attack per ascension level',()=>{
  const a=foe({hp:100,atk:10}); S.ngp=1; foeScale([a],1); eq(a.maxHp,115); eq(a.hp,115); eq(a.atk,Math.round(10*1.15));
  S.ngp=0; const b=foe({hp:100,atk:10}); foeScale([b],2); eq(b.hp,100); eq(b.atk,20);
});
test('Enemies: gates stay locked below their level',()=>{ startRun(1); eq(S.mode,'town'); setLvl(4); startRun(1); eq(S.mode,'battle'); eq(S.run.di,1); });

})();
