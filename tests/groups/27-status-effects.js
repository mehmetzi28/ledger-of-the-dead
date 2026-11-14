// Status Effects tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Status: a new dose refreshes, it ticks each turn, then wears off',()=>{
  const t=foe({hp:1000}); arena([t]); addDot(t,'poison',10,2); addDot(t,'poison',6,3); eq(t.dots.poison.d,10); eq(t.dots.poison.t,3); addDot(t,'poison',0.2,5); eq(t.dots.poison.t,3,'tiny doses are ignored');
  tickDots(); eq(t.hp,990); tickDots(); tickDots(); eq(t.hp,970); eq(t.dots,undefined); const dead=foe({hp:0}); addDot(dead,'poison',5,3); eq(dead.dots,undefined,'the dead cannot be poisoned');
});
test('Status: bleeding ignores your ward, can down minions, and can kill you',()=>{
  arena([foe({hp:1e6})]); const P=S.player; P.shield=500; addDot(P,'bleed',7,2); tickDots(); eq(P.hp,pMax()-7); eq(P.shield,500);
  const m=mkMinion({}); m.hp=3; addDot(m,'burn',10,2); tickDots(); eq(m.hp,0); ok(S.run.log.some(l=>/succumbs/.test(l.m)));
  P.shield=0; P.hp=5; addDot(P,'bleed',50,2); fix(.5); act('strike'); eq(S.mode,'defeat','bled out');
});
test('Status: enemy striker crits cause bleeding, Cinder Wave burns',()=>{
  const s=foe({role:'striker',atk:20,hp:1e6}); arena([s]); S.player.stats.constitution=200; S.player.hp=pMax(); seq([.5,.9,.5,.5,.1],.5); act('strike'); ok(S.player.dots&&S.player.dots.bleed,'bleeding after a crit'); eq(S.player.dots.bleed.d,6);
  fresh(); const b=bossFight(2); const m=mkMinion({}); m.hp=m.maxHp=1e5; S.player.stats.constitution=500; S.player.hp=pMax(); fireAbility(b); ok(S.player.dots.burn); ok(m.dots.burn);
});
test('Status: Venomous minions poison what they hit',()=>{ const t=foe({hp:1e6}); arena([t],3); const m=mkMinion({traits:['venom']}); m.atk=200; fix(.5); act('strike'); ok(t.dots&&t.dots.poison); eq(t.dots.poison.d,Math.round(200*.15*pierceMul(.5))); ok(TRAITS.venom); });
test('Status: a Healing Draught cures you, Dark Mending cures your whole side',()=>{
  arena([foe({hp:1e6})]); const P=S.player; S.belt.hp=2; addDot(P,'bleed',5,3); fix(.5); act('pot:hp'); eq(P.dots,undefined,'drinkable even at full HP when bleeding'); eq(S.belt.hp,1);
  const m=mkMinion({}); S.player.skills.mend=1; S.player.mana=100; ok(!canUse('mend')); addDot(m,'burn',5,3); addDot(P,'burn',5,3); ok(canUse('mend'),'usable to cure alone'); act('sk:mend'); eq(m.dots,undefined); eq(P.dots,undefined);
});
test('Status: effects end when you leave a room and never reach a save',()=>{
  arena([foe({hp:0,dead:true})]); fix(.5); const m=mkMinion({}); addDot(S.player,'bleed',3,3); addDot(m,'poison',3,3); const snap=snapshot(); eq(snap.player.dots,undefined); eq(snap.army[0].dots,undefined); ok(S.player.dots,'live game untouched');
  roomWon(); descend(); eq(S.player.dots,undefined); eq(m.dots,undefined);
  addDot(S.player,'bleed',3,3); flee(); eq(S.player.dots,undefined);
  eq(normalizeSave({v:2,player:{lvl:2,dots:{bleed:{d:9,t:9}}},army:[{role:'striker',lvl:1,rankI:0,name:'Imp',dots:{poison:{d:1,t:1}}}]}).player.dots,undefined);
});

})();
