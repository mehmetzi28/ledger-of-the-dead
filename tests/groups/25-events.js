// Events tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Events: rolled after some gate rooms, never after the last room or in the Tower',()=>{
  arena([foe({hp:0,dead:true})]); fix(0); roomWon(); ok(S.run.event,'event after room 1'); ok(EVENTS[S.run.event.id]);
  descend(); eq(S.run.event,null,'gone when you move on'); S.run.room=3; S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(S.run.event,null,'not after the boss');
  fresh(); setLvl(20); startTower(1); S.run.enemies=[foe({hp:0,dead:true})]; fix(0); roomWon(); eq(S.run.event,null,'not in the Tower');
  fresh(); seed(31); let n=0; for(let i=0;i<1000;i++){ S.mode='town'; S.run=null; S.watches=3; startRun(0); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); if(S.run.event) n++; } near(n/1000,EVENT_CHANCE,.04);
});
test('Events: the blood shrine trades 20% max HP for 15% more damage this gate',()=>{
  const r=eventScene('shrine'); const P=S.player; P.hp=pMax(); const m=dmgMul(); ok(resolveEvent('bleed')); eq(P.hp,pMax()-Math.round(pMax()*.2)); ok(r.bless); near(dmgMul(),m*1.15,1e-9); ok(r.event.done);
  ok(!resolveEvent('bleed'),'only once'); descend(); near(dmgMul(),m*1.15,1e-9,'lasts all gate'); flee(); eq(foeArmor(),0);
  eventScene('shrine'); S.player.hp=1; ok(!resolveEvent('bleed'),'no blood to spare'); ok(!S.run.bless);
});
test('Events: the pedlar sells a potion at half price',()=>{
  eventScene('pedlar'); const ev=S.run.event; S.gold=0; ok(!resolveEvent('buy'),'too poor'); S.gold=100; ok(resolveEvent('buy')); eq(S.belt.hp,1); eq(S.gold,100-ev.price); eq(ev.price,Math.ceil(POTIONS.hp.price()/2));
  eventScene('pedlar'); S.belt.hp=BELT_MAX; S.gold=100; ok(!resolveEvent('buy'),'belt full'); ok(resolveEvent('pass')); eq(S.gold,100);
});
test('Events: a coffer holds gold and gear, or a trap that never kills',()=>{
  eventScene('coffer'); fix(0); const g=S.gold; ok(resolveEvent('open')); ok(S.gold>g); eq(S.run.spoils.length,1); ok(/Inside/.test(S.run.event.done));
  eventScene('coffer'); fix(.99); S.player.hp=pMax(); ok(resolveEvent('open')); eq(S.player.hp,pMax()-Math.round(pMax()*.25));
  eventScene('coffer'); fix(.99); S.player.hp=3; resolveEvent('open'); eq(S.player.hp,1,'the trap leaves you at 1 HP at worst');
});
test('Events: a straggler can be raised for free or finished for XP',()=>{
  eventScene('straggler',3); const n=S.run.corpses.length; fix(.5); ok(resolveEvent('raise')); const c=S.run.corpses[n]; ok(c&&c.free); eq(raiseCost(c),0); eq(raiseChance(c),raiseChance(Object.assign({},c,{free:false}))+STRAGGLER_BONUS);
  S.player.mana=0; fix(0); tryRaise(c.id); eq(S.army.length,1,'raised with no mana');
  eventScene('straggler',3); const xp=S.player.xp, lv=S.player.lvl; ok(resolveEvent('finish')); ok(S.player.xp>xp||S.player.lvl>lv); ok(/XP/.test(S.run.event.done));
});
test('Events: only on the raise screen, and unknown choices do nothing',()=>{ const r=eventScene('coffer'); ok(!resolveEvent('dance')); ok(!r.event.done); S.mode='battle'; ok(!resolveEvent('open')); S.mode='raise'; r.event=null; ok(!resolveEvent('pass')); });

})();
