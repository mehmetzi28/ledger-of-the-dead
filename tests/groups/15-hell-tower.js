// Hell Tower tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Tower: opens after three gate clears and level 10, from floor 1 or a checkpoint',()=>{
  setLvl(10); S.ti={clr:{0:1,1:1}}; startTower(1); eq(S.mode,'town','two clears'); S.ti.clr[2]=1; setLvl(9); startTower(1); eq(S.mode,'town','level 9'); setLvl(10); startTower(11); eq(S.mode,'town','no checkpoint yet');
  startTower(1); eq(S.mode,'battle'); eq(S.run.tw,1); eq(S.watches,WATCHES-1); eq(foeArmor(),TW.armor); eq(S.run.enemies.length,3);
});
test('Tower: checkpoints every ten floors, endlessly',()=>{ S.tower.best=35; eq(towerStarts().join(),'1,11,21,31'); S.tower.best=250; ok(towerStarts().includes(251)); eq(towerStarts().length,26); });
test('Tower: the progress bar stays inside its frame past floor 100',()=>{ richState(); S.tower.best=150; ui.tab='tower'; const h=renderAll('tower 150'); ok(/tw-prog"><i style="width:100%"/.test(h),'capped at 100%'); });
test('Tower: wardens every tenth floor, with more guards higher up',()=>{
  setLvl(60); S.tower.best=200; const r=S.run={tw:10,di:5,room:0,rooms:1,enemies:[],corpses:[],events:[],log:[],turn:1,fx:{},loot:[],spoils:[],lostLoot:[]}; S.mode='battle';
  spawnRoom(); ok(r.enemies[0].boss); eq(r.enemies[0].name,'The Gate Hound'); eq(r.enemies.length,3); eq(r.enemies[0].abil,'heads','its signature first'); ok(r.enemies[0].kit.includes('swarm'),'beside the borrowed move');
  r.tw=50; spawnRoom(); eq(r.enemies.length,4); eq(r.enemies[0].abilT,BOSS_ABIL[r.enemies[0].abil].every-1,'faster from floor 50');
  r.tw=100; spawnRoom(); eq(r.enemies.length,5); eq(r.enemies[0].name,'Abaddon, King of Hell');
  r.tw=110; spawnRoom(); eq(r.enemies[0].name,'Abyssal Gate Hound');
  r.tw=55; spawnRoom(); ok(r.enemies.every(e=>!e.boss)); ok(r.enemies.filter(e=>e.role==='mender').length<=1);
});
test('Tower: foes get stronger every floor',()=>{ let p=towerStats(1,twLvl(1),1,1); for(let f=2;f<=150;f++){ const s=towerStats(f,twLvl(f),1,1); ok(s.hp>p.hp&&s.atk>=p.atk,'floor '+f); p=s; } ok(towerStats(100,56,1,1,true).hp>towerStats(99,56,1,1,true).hp*1.4,'last warden is a step up'); });
test('Tower: a warden gives its unique the first time, rarely after',()=>{
  setLvl(30); S.run={loot:[],spoils:[],events:[]}; towerBossLoot(10,S.run); ok(S.tower.got.w1); eq(S.inv.filter(x=>x.id==='w1').length,1); fix(.99); towerBossLoot(10,S.run); eq(S.inv.filter(x=>x.id==='w1').length,1);
  fix(0); S.run.gold=0; towerBossLoot(10,S.run); eq(S.inv.filter(x=>x.id==='w1').length,1,'no second copy while you carry one'); eq(S.run.gold,300,'melted for gold'); ok(S.run.events.some(e=>/already carry one/.test(e.m)));
  S.inv=S.inv.filter(x=>x.id!=='w1'); towerBossLoot(10,S.run); eq(S.inv.filter(x=>x.id==='w1').length,1,'lost it (New Game+): it can drop again'); towerBossLoot(100,S.run); ok(['w10','w11','w12'].every(id=>S.tower.got[id]));
});
test('Drops: a gate unique you already carry turns into ordinary gear; the odds were halved twice',()=>{
  eq(UQ.join(),'1,0.85,0.75,0.6,0.5,0.35'); eq(UQ_MOB,.01); near(tableFor(0,'vanguard',false,false).find(r=>r.id==='u0').p,UQ[0]*.01/100,1e-12,'ordinary foes: 1% of a boss'); setLvl(5); arena([foe()],0); const b=makeEnemy(0,3,true);
  fix(.9999); let d=rollDrops(b); ok(d.includes('u0'),'the unique row is last, so .9999 picks it'); eq(d.filter(x=>x==='u0').length,1,'never twice from one boss');
  addItem('u0',null); d=rollDrops(b); ok(d.length&&!d.includes('u0')&&d.every(id=>ITEM[id]&&!ITEM[id].uq),'owned: ordinary gear instead');
  S.inv=S.inv.filter(x=>x.id!=='u0'); const m=mkMinion({armed:true,eq:{weapon:{u:++S.uid,id:'u0'},armor:null,relic:null}}); ok(ownsItem('u0'),'gear on a minion counts'); ok(!rollDrops(b).includes('u0'));
});
test('Tower: abyssal wardens past 100 pay gold and a legendary',()=>{ S.run={loot:[],spoils:[],events:[],gold:0}; towerBossLoot(120,S.run); eq(S.run.gold,4800); eq(S.run.loot.length,1); eq(ITEM[S.run.loot[0]].tier,4); });
test('Tower: climbing records your best floor; floor 100 ends the climb; 101 starts from its checkpoint',()=>{
  setLvl(60); S.tower.best=90; startTower(91); const r=S.run; r.tw=100; r.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(S.tower.best,100); ok(r.cleared); descend(); eq(S.mode,'raise','no floor 101 from here');
  returnTown(); ok(towerStarts().includes(101)); S.watches=3; startTower(101); eq(S.run.tw,101); eq(S.mode,'battle');
});
test('Tower: going deeper climbs one floor',()=>{ setLvl(20); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); startTower(1); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(S.tower.best,1); descend(); eq(S.run.tw,2); eq(S.mode,'battle'); });
test('Tower: wardens grow angrier after turn 8',()=>{ arena([foe()]); S.run.turn=10; eq(enrage(foe({tw:10,boss:true})),1+2*.07); eq(enrage(foe({tw:100,boss:true})),1+2*.12); eq(enrage(foe({tw:10})),1); eq(enrage(foe({boss:true})),1); S.run.turn=5; eq(enrage(foe({tw:10,boss:true})),1); });
test('Tower: a strong necromancer beats floor 10 and takes its unique',()=>{
  setLvl(40); const P=S.player; P.stats.strength=2000; P.stats.constitution=2000; P.hp=pMax(); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); startTower(1); let n=0;
  while(n++<400&&S.tower.best<10){ if(S.mode==='battle') act('strike'); else if(S.mode==='raise') descend(); else break; }
  eq(S.tower.best,10); ok(S.tower.got.w1); ok(S.inv.some(x=>x.id==='w1')); checkTitles(); ok(S.ti.got.t10);
});

})();
