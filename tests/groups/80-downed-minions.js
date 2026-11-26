// Downed minions (src/game-runs.js roomWon, shatterOdds): a minion downed in a fight shatters when the room ends or binds back; the odds and the outcome are shown, never hidden.
(function(){
const {test,ok,eq,fix,foe,arena,mkMinion,renderAll}=window.LOTD_T;

test('Downed minions: the shatter chance is 25% less 1.5% per Will, never under 5%; Grave-bound, Bone Bank and sieges make it 0',()=>{
  arena([foe({hp:999})]); const m=mkMinion({}), g=mkMinion({traits:['gravebound']});
  S.player.stats.will=0; eq(shatterOdds(m),SHATTER_BASE); S.player.stats.will=4; eq(shatterOdds(m),Math.max(SHATTER_MIN,SHATTER_BASE-A('will')*SHATTER_WILL));
  S.player.stats.will=99; eq(shatterOdds(m),SHATTER_MIN,'the floor'); eq(shatterOdds(g),0,'Grave-bound');
  S.run.siege=true; eq(shatterOdds(m),0,'home ground'); S.run.siege=false;
});

test('Downed minions: after a won room (the boss room too) the bound-back and the shattered lead the log, with their odds',()=>{
  S.player.stats.will=0; arena([foe({hp:0,dead:true})]); S.run.room=S.run.rooms-1;   /* the gate's last room: the clear runs the same roll */
  const a=mkMinion({nick:'Grim'}), b=mkMinion({nick:'Rattle'}), c=mkMinion({nick:'Hale'}); a.hp=0; b.hp=0;
  fix(.99); roomWon(); ok(S.run.cleared,'the gate is cleared');
  ok(S.army.includes(a)&&S.army.includes(b),'a 99 roll binds them back'); eq(a.hp,Math.ceil(a.maxHp*BIND_HP)); ok(c.hp>0);
  eq(S.run.events[0].m,'Downed but bound back together at 40% HP: Grim, Rattle. The chance to shatter was '+SHATTER_BASE+'%.'); eq(S.run.events[0].c,'down');
  eq(S.run.events.filter(e=>/bound back/.test(e.m)).length,1,'one line for all of them');
  arena([foe({hp:0,dead:true})]); const d=mkMinion({nick:'Brine'}); d.hp=0; fix(0); roomWon();
  const e=S.run.events[0]; ok(!S.army.includes(d)); ok(e.m.startsWith('Brine, ')&&e.m.endsWith(', shattered and is gone ('+SHATTER_BASE+'% chance).'),e.m); eq(e.c,'bad');
  arena([foe({hp:0,dead:true})]); const g=mkMinion({nick:'Bound',traits:['gravebound']}); g.hp=0; fix(0); roomWon();
  eq(S.run.events[0].m,'Downed but bound back together at 40% HP: Bound. None of them could shatter.');
});

test('Downed minions: the battle shows a downed minion\'s odds; the screen after the fight shows the line; Turkish covers both',()=>{
  S.player.stats.will=0; arena([foe({hp:999})]); const m=mkMinion({nick:'Grim'}); m.hp=0; S.mode='battle'; renderAll();
  ok(app.innerHTML.includes('Down: '+SHATTER_BASE+'% to shatter after the room'),'battle');
  eq(trText('Down: 25% to shatter after the room'),'Yerde: oda bitince %25 parçalanma şansı'); eq(trText('Down: cannot shatter'),'Yerde: parçalanamaz');
  S.run.enemies.forEach(f=>{ f.hp=0; f.dead=true; }); fix(.99); roomWon(); renderAll();
  ok(app.innerHTML.includes('note down'),'raise screen'); ok(app.innerHTML.includes('Downed but bound back together'));
  ok(!/Downed but/.test(trText('Downed but bound back together at 40% HP: Grim, Rattle. The chance to shatter was 25%.')),'Turkish pattern');
  ok(!/None of them/.test(trText('Downed but bound back together at 40% HP: Grim. None of them could shatter.')));
  ok(!/shattered and is gone/.test(trText('Brine, the Tunnel Rat, shattered and is gone (25% chance).')));
});
})();
