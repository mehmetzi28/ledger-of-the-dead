// Doors tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Doors: after a gate room you choose from 2-3 doors, the first always a fight; before the boss only the boss',()=>{
  seed(12); for(let i=0;i<200;i++){ S.mode='battle'; const r=wonRoom(i%2); ok(r.doors.length>=2&&r.doors.length<=3); eq(r.doors[0],'fight'); eq(new Set(r.doors).size,r.doors.length); r.doors.forEach(k=>ok(DOORS[k])); fresh(); }
  const r=wonRoom(2); eq(r.doors.join(),'boss'); const b=wonRoom(3); ok(b.cleared); eq(b.doors,null,'none after the boss');
  fresh(); setLvl(20); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); startTower(1); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(S.run.doors,null,'not in the Tower');
  fix(0); eq(rollDoors({room:0,rooms:4}).length,3,'never loops even with fixed randomness');
});
test('Doors: descending with no choice takes the first door; a door that is not offered is refused',()=>{
  const r=wonRoom(0); r.doors=['fight','rest']; ok(!descend('treasure')); eq(S.mode,'raise'); ok(descend()); eq(S.mode,'battle'); eq(r.room,1); eq(r.roomKind,'fight');
});
test('Doors: an elite room has stronger foes and pays more',()=>{
  seed(9); const r=wonRoom(0); r.doors=['fight','elite']; r.pre=null; seed(9); const keep=JSON.stringify(S); descend('fight'); const plain=r.enemies.map(e=>[e.maxHp,e.atk]);
  S=JSON.parse(keep); seed(9); descend('elite'); S.run.enemies.forEach((e,i)=>{ eq(e.maxHp,Math.round(plain[i][0]*ELITE_ROOM)); });
  seed(6); let n=0; for(let i=0;i<4000;i++) n+=rollDrops(foe({base:'Tunnel Rat',role:'striker'})).length; near(n/4000,.28*ELITE_DROP,.03);
  fix(.5); const a={}; killLoot(foe({lvl:10}),a); S.run.roomKind=null; const b={}; killLoot(foe({lvl:10}),b); eq(a.gold,Math.round(b.gold*ELITE_GOLD));
});
test('Doors: a rest room heals without a fight, then offers doors again',()=>{
  const r=wonRoom(1); r.doors=['fight','rest']; const P=S.player; P.hp=10; P.mana=0; const m=mkMinion({}); m.hp=1;
  ok(descend('rest')); eq(S.mode,'raise'); eq(r.room,2); eq(r.quiet,'rest'); eq(P.hp,Math.min(pMax(),10+Math.round(pMax()*DIFF.heal)+Math.round(pMax()*REST_HEAL))); ok(m.hp>1);
  eq(r.doors.join(),'boss','next is the boss'); eq(r.corpses.length,0); ok(/rest/.test(r.events[0].m)); renderAll('rest room'); ok(descend()); eq(S.run.enemies[0].boss,true);
});
test('Doors: a vault gives gold and gear without a fight',()=>{ const r=wonRoom(0); r.doors=['fight','treasure']; const g=S.gold; ok(descend('treasure')); ok(S.gold>g); eq(r.spoils.length,1); eq(r.quiet,'treasure'); ok(r.goldTot>0); renderAll('vault'); });
test('Doors: door buttons render and work through clicks',()=>{ const r=wonRoom(0); r.doors=['fight','elite','rest']; const h=renderAll('doors'); ok(/data-a="door" data-k="elite"/.test(h)); ACTIONS.door('rest'); eq(r.quiet,'rest'); });

})();
