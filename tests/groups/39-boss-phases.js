// Boss Phases tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Phases: at half HP a boss enters its second phase once, and speaks',()=>{
  const rk=bossFight(0); rk.hp=rk.maxHp*.3; checkPhase(); ok(!rk.phase2,'the Rat King, a first boss, keeps one phase'); flee();
  const b=bossFight(1); b.hp=b.maxHp*.6; checkPhase(); ok(!b.phase2); b.hp=b.maxHp*.5; checkPhase(); ok(b.phase2); eq(b.fast,1); ok(b.abilT<=2);
  ok(S.run.log.some(l=>/Two hundred years/.test(l.m))&&S.run.log.some(l=>/second phase/.test(l.m))); eq(T_('phases'),1); checkPhase(); eq(T_('phases'),1,'only once');
  const x=foe({hp:10}); S.run.enemies.push(x); x.hp=1; checkPhase(); ok(!x.phase2,'only bosses');
});
test('Phases: every second-phase move is announced, alternating with Sundering Blow',()=>{
  const b=bossFight(1), P=S.player; P.stats.constitution=900; P.hp=pMax(); b.hp=b.maxHp/2; checkPhase(); b.abilT=1;
  ok(bossTurn(b)); ok(b.charging); eq(b.move,'sunder'); eq(P.hp,pMax(),'warning only');
  ok(bossTurn(b)); ok(!b.charging); eq(P.hp,pMax()-Math.round(pMax()*.35)); eq(b.abilT,2);
  eq(bossTurn(b),false); ok(bossTurn(b)); ok(b.charging); eq(b.move,'bonewall','its own move, now telegraphed'); ok(bossTurn(b)); ok(b.shield>0);
});
test('Phases: Taunt turns Sundering Blow onto a vanguard; Focus crits and Grave Chill break a charge',()=>{
  const b=bossFight(2), P=S.player; P.stats.constitution=900; P.hp=pMax(); const v=mkMinion({role:'vanguard'}); v.hp=v.maxHp=1e6; fix(.5);
  S.run.taunt=2; fireAbility(b,'sunder'); eq(P.hp,pMax()); eq(v.hp,1e6-H(b.atk*2.2));
  S.run.taunt=0; fireAbility(b,'sunder'); eq(P.hp,pMax()-Math.round(pMax()*.35));
  P.hp=pMax(); mkMinion({role:'striker'}); b.charging=true; b.move='sunder'; ok(command('striker')); act('strike'); ok(!b.charging,'focus broke it'); ok(S.run.log.some(l=>/focused strike/.test(l.m)&&/Sundering Blow is lost/.test(l.m)));
  b.charging=true; b.move='sunder'; b.stun=1; S.run.cmd={}; act('strike'); ok(!b.charging); ok(S.run.log.some(l=>/frozen/.test(l.m)&&/Sundering Blow is lost/.test(l.m)));
});
test('Phases: the boss card shows its phase and the move it is charging',()=>{
  const b=bossFight(3); b.phase2=true; b.charging=true; b.move='sunder'; const h=renderAll('phase'); ok(/Second phase/.test(h)&&/Charging Sundering Blow/.test(h));
});

})();
