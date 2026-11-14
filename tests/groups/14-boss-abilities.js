// Boss Abilities tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Bosses: each gate boss has its own move',()=>{ for(let di=0;di<6;di++){ setLvl(30); const b=makeEnemy(di,10,true); eq(b.abil,GATE_ABIL[di]); eq(b.abilT,BOSS_ABIL[GATE_ABIL[di]].every); } });
test('Bosses: Call the Swarm adds two foes, at most 4 per fight and 5 alive',()=>{
  const b=bossFight(0); eq(bossTurn(b),false); eq(bossTurn(b),false); eq(bossTurn(b),true); eq(S.run.enemies.length,3);
  for(let i=0;i<5;i++) fireAbility(b); eq(b.summoned,SUMMON_CAP); ok(liveFoes().length<=5); S.run.enemies.forEach(e=>ok(e.atk>0&&e.hp>0));
});
test('Bosses: Bone Wall shields every foe, capped at 40% of HP',()=>{ const b=bossFight(1); const x=foe({hp:100}); S.run.enemies.push(x); fireAbility(b); eq(x.shield,20); fireAbility(b); fireAbility(b); eq(x.shield,40); });
test('Bosses: Cinder Wave is telegraphed, then burns you and every minion',()=>{
  const b=bossFight(2); const m=mkMinion({}); m.hp=m.maxHp=1e5; const P=S.player; P.stats.constitution=1e3; P.hp=pMax(); const h=P.hp;
  bossTurn(b); bossTurn(b); eq(bossTurn(b),true); ok(b.charging); eq(P.hp,h,'warning only');
  eq(bossTurn(b),true); ok(!b.charging); ok(P.hp<h); ok(m.hp<1e5); eq(b.abilT,BOSS_ABIL.cinder.every);
});
test('Bosses: Hymn of Silence silences skills for 2 turns and mends foes',()=>{
  const b=bossFight(3); b.hp=b.maxHp/2; S.player.skills.spear=1; S.player.mana=100; fireAbility(b); eq(S.run.silence,3); ok(!canUse('spear')); eq(b.hp,b.maxHp*.6);
  skillTick(); skillTick(); skillTick(); ok(canUse('spear'),'silence fades');
});
test('Bosses: Seedfall mends every foe and sprouts a new one',()=>{ const b=bossFight(4); b.hp=b.maxHp/2; fireAbility(b); eq(b.hp,b.maxHp*.65); eq(S.run.enemies.length,2); });
test('Bosses: Royal Decree hits for 45% of max HP, and Bone Ward soaks it',()=>{
  const b=bossFight(5); const P=S.player; P.hp=pMax(); fireAbility(b); eq(P.hp,pMax()-Math.round(pMax()*.45)); P.hp=pMax(); P.shield=1e5; fireAbility(b); eq(P.hp,pMax());
});
test('Bosses: a boss spends its turn charging instead of hitting',()=>{
  const b=bossFight(5); b.atk=1e6; b.abilT=1; fix(.5); const P=S.player; P.stats.constitution=500; P.hp=pMax(); act('strike'); ok(b.charging); eq(P.hp,pMax());
});

})();
