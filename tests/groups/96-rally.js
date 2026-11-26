// Rally: a Commander's free order in battle, and the Elder Commander's stronger Taunt and Bone Shield (src/game-exp.js, R6).
(function(){
const {test,ok,eq,near,fix,foe,arena,mkMinion,renderAll}=window.LOTD_T;
const cmdr=o=>mkMinion(Object.assign({elite:true,traits:['commander'],lvl:20,rankI:2,role:'striker'},o));

test('Rally: only in battle with a living Commander, once a room, and counted',()=>{
  arena([foe({hp:1e6,atk:0})]); ok(!canRally(),'no Commander'); const c=cmdr(); ok(canRally()); const t=S.run.turn; ok(rally('dmg')); eq(S.run.turn,t,'free'); ok(!rally('cleanse'),'once a room'); eq(T_('rallies'),1);
  arena([foe({hp:1e6,atk:0})]); ok(canRally(),'again next room'); ok(!rally('nope')); c.hp=0; ok(!canRally(),'not with a fallen Commander');
  S.mode='town'; S.run=null; ok(!canRally());
});
test('Rally: Strike harder lifts your minions\' damage this turn by 20%, 25% with two Commanders; never your own',()=>{
  arena([foe({hp:1e6,atk:0})]); cmdr(); ok(rally('dmg')); eq(S.run.rally,S.run.turn); near(rallyK(true),1+RALLY_DMG,1e-9); HITTER=S.player; eq(rallyK(),1,'your own blows'); HITTER=S.army[0]; near(rallyK(),1+RALLY_DMG,1e-9); HITTER=null;
  arena([foe({hp:1e6,atk:0})]); cmdr(); cmdr(); rally('dmg'); near(rallyK(true),1+RALLY_DMG+RALLY_TWO,1e-9); S.run.turn++; HITTER=S.army[0]; eq(rallyK(),1,'only this turn'); HITTER=null;
  const hit=r=>{ arena([foe({hp:1e6,atk:0})]); S.army=[]; const c=cmdr(); c.atk=200; S.player.mana=100; fix(.5); if(r) rally('dmg'); const e=S.run.enemies[0], h=e.hp; act('ward'); return h-e.hp; };
  const a=hit(false), b=hit(true); ok(a>0,'the Commander strikes'); near(b/a,1+RALLY_DMG,.06,'20% harder');
});
test('Rally: Steady takes one condition off every living minion',()=>{
  arena([foe({hp:1e6,atk:0})]); const c=cmdr(), m=mkMinion({}); m.st={stun:1,slow:2}; c.dots={bleed:{d:3,t:2}}; ok(rally('cleanse')); eq(Object.keys(m.st).length,1); eq(Object.keys(c.dots).length,0);
  ok(S.run.log.some(l=>/steadies the line/.test(l.m||l)),'logged');
});
test('Rally: an Elder Commander makes Taunt last a turn longer and Bone Shield 25% stronger',()=>{
  arena([foe({hp:1e6,atk:0})]); mkMinion({role:'vanguard'}); command('vanguard'); eq(S.run.taunt,2);
  arena([foe({hp:1e6,atk:0})]); S.army=[]; mkMinion({role:'vanguard'}); cmdr({stage:ELDER_STAGE}); ok(elderCmdr()); command('vanguard'); eq(S.run.taunt,3);
  const ward=e=>{ arena([foe({hp:1e6,atk:0})]); S.army=[]; S.player.shield=0; const m=mkMinion({role:'mender'}); m.atk=10; if(e) cmdr({stage:ELDER_STAGE}); command('mender'); return S.player.shield; };
  eq(ward(true),Math.round(15*ELDER_SHIELD)); eq(ward(false),15);
});
test('Rally: the buttons show beside the commands and work',()=>{
  arena([foe({hp:1e6,atk:0})]); cmdr(); let h=renderAll('rally'); ok(/data-a="rally"/.test(h)&&/Strike harder/.test(h)); ACTIONS.rally('cleanse'); eq(S.run.cmd.rally,'cleanse'); h=renderAll('rally given'); ok(/Steady &middot; given/.test(h));
});
})();
