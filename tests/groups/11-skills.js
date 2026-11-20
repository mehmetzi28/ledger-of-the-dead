// Skills tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Skills: learning needs a point, the right level, and town',()=>{
  const P=S.player; learnSkill('spear'); eq(sk('spear'),0,'no points');
  P.sp=10; learnSkill('spear'); eq(sk('spear'),0,'level 1 is too low'); setLvl(2); learnSkill('spear'); eq(sk('spear'),1); eq(P.sp,9);
  learnSkill('spear'); eq(sk('spear'),1,'rank 2 needs level 7'); setLvl(12); learnSkill('spear'); learnSkill('spear'); eq(sk('spear'),3); learnSkill('spear'); eq(sk('spear'),3,'max rank 3'); eq(P.sp,7);
  learnSkill('reap'); eq(sk('reap'),0); setLvl(18); learnSkill('reap'); eq(sk('reap'),1); learnSkill('nope'); eq(P.sp,6);
  arena([foe()],0); learnSkill('mend'); eq(sk('mend'),0,'not in battle');
});
test('Skills: forgetting returns every point; Bone Armor follows learning and forgetting',()=>{
  const P=S.player; setLvl(20); P.sp=6; learnSkill('bonearmor'); learnSkill('bonearmor'); learnSkill('spear'); ok(pMax()>Math.round((24+24+80))); eq(P.hp,pMax());
  resetSkills(); eq(P.sp,6); eq(Object.keys(P.skills).length,0); eq(P.hp,pMax()); ok(P.hp<=pMax());
});
test('Skills: actives are blocked in town, by silence, cooldown and low mana',()=>{
  S.player.skills.spear=1; ok(!canUse('spear'),'town'); arena([foe({hp:1e6})]); S.player.mana=100; ok(canUse('spear'));
  S.run.silence=2; ok(!canUse('spear'),'silenced'); S.run.silence=0; S.player.mana=5; ok(!canUse('spear'),'mana'); S.player.mana=100;
  fix(.5); act('sk:spear'); eq(skCd('spear'),2); ok(!canUse('spear'),'cooldown'); act('strike'); act('strike'); ok(canUse('spear'),'ready again after 2 turns');
  ok(!canUse('bonearmor'),'passives are never used'); ok(!canUse('reap'),'not learned');
});
test('Skills: Bone Spear pierces half of armor',()=>{
  const t=foe({hp:1e6}); arena([t],3); fix(.5); S.player.skills.spear=1; S.player.mana=100; act('sk:spear');
  eq(1e6-t.hp,H((pAtk()+pSiph())*.85*(1-DIFF.armor[3]*.5)*skMul()),'Intelligence adds skill damage');
});
test('Skills: Corpse Explosion hits every foe through armor and uses up a body',()=>{
  const a=foe({hp:1e6}), b=foe({hp:1e6}); arena([a,b],2); fix(.5); S.player.skills.blast=1; S.player.mana=100;
  ok(!canUse('blast'),'needs a body'); const c=corpse(); S.run.corpses=[c]; act('sk:blast'); const d=H(pSiph()*.8*skMul());
  eq(1e6-a.hp,d); eq(1e6-b.hp,d); eq(c.result,'exploded'); ok(c.tried);
});
test('Skills: Dark Mending heals hurt minions only',()=>{
  arena([foe({hp:1e6})]); S.player.skills.mend=1; S.player.mana=100; const m=mkMinion({lvl:10}); ok(!canUse('mend'),'nobody hurt');
  m.hp=1; ok(canUse('mend')); fix(.5); act('sk:mend'); ok(m.hp>=1+Math.round(m.maxHp*.23)-1-1);
});
test('Skills: Curse of Frailty adds damage for 3 turns',()=>{
  const t=foe({hp:1e6}); arena([t]); fix(.5); S.player.skills.curse=1; S.player.mana=100; act('sk:curse'); ok(t.curse); near(t.curse.mul,1.25,1e-9);
  act('strike'); ok(t.curse,'still cursed'); act('strike'); eq(t.curse,undefined,'gone after 3 turns');
});
test('Skills: Grave Chill freezes foes; bosses may resist; frozen foes skip their turn',()=>{
  const t=foe({hp:1e6,atk:9999}); arena([t]); S.player.skills.chill=1; S.player.mana=100; fix(.5); act('sk:chill'); ok(!t.stun,'stun used up this turn');
  eq(S.player.hp,pMax(),'frozen foe did not hit'); S.player.skills.chill=3; S.run.cd={}; S.player.mana=100;
  const b=foe({hp:1e6,boss:true,atk:1}); S.run.enemies=[b]; S.run.target=b.id; fix(.99); useSkill('chill',b); ok(!b.stun,'boss resisted'); S.run.cd={}; fix(0); useSkill('chill',b); eq(b.stun,2,'rank 3 freezes for 2 turns');
});
test('Skills: freezing a charging boss cancels its move',()=>{
  setLvl(23); const b=makeEnemy(5,25,true); b.hp=b.maxHp=1e7; arena([b],5); fix(.5); b.charging=true; b.stun=1; const hp=S.player.hp;
  act('strike'); ok(!b.charging); eq(b.abilT,BOSS_ABIL.decree.every); eq(S.ti.cancels,1); eq(S.player.hp,hp); checkTitles(); ok(S.ti.got.d_cancel);
});
test('Skills: Unholy Frenzy boosts minion damage for 3 turns',()=>{
  const t=foe({hp:1e6}); arena([t]); fix(.5); S.player.skills.frenzy=2; S.player.mana=100; const m=mkMinion({}); m.atk=100;
  act('sk:frenzy'); eq(S.run.frenzy,2); near(S.run.frenzyMul,1.5,1e-9); const before=t.hp; act('strike'); eq(before-t.hp,H(pAtk()*dmgMul())+H(100*dmgMul()*1.5));
});
test('Skills: Reap ignores armor and doubles on a foe below 35%',()=>{
  const a=foe({hp:1e6}), b=foe({hp:3e5,maxHp:1e6}); arena([a,b],4); fix(.5); S.player.skills.reap=1; S.player.mana=100;
  act('sk:reap'); const d=1e6-a.hp; eq(d,H(pSiph()*1.5*skMul())); S.run.cd={}; S.player.mana=100; setTarget(b.id); act('sk:reap'); eq(3e5-b.hp,2*d);
});
test('Skills: Soul Well adds mana each turn, Necrotic Edge sharpens Strike',()=>{
  const t=foe({hp:1e6}); arena([t]); fix(.5); S.player.skills.soulwell=2; S.player.skills.edge=3; S.player.mana=0;
  act('strike'); eq(S.player.mana,3+1+2); eq(1e6-t.hp,H(pAtk()*dmgMul()*1.3));
});
test('Skills: active skills map to keys 4 and up in battle',()=>{ S.player.skills.spear=1; S.player.skills.reap=1; S.player.skills.bonearmor=1; eq(activeSkills().map(s=>s.id).join(),'spear,reap'); });

test('Skills: Grave Chill by rank: 1 freezes a turn, 2 adds a Chill even when resisted, 3 freezes 2 turns; bosses resist 50/40/30%',()=>{
  const b=foe({hp:1e6,boss:true,atk:1}); arena([b]); const P=S.player; P.mana=999;
  P.skills.chill=1; fix(.55); useSkill('chill',b); ok(!b.stun,'50% at rank 1'); ok(!hasSt(b,'chilled'),'no chill at rank 1'); S.run.cd={}; fix(.45); useSkill('chill',b); eq(b.stun,1);
  b.stun=0; P.skills.chill=2; S.run.cd={}; fix(.65); useSkill('chill',b); ok(!b.stun,'40% at rank 2'); eq(b.st.chilled,2,'chilled although it resisted'); const h=b.hp; hurtFoe(b,100); eq(h-b.hp,Math.round(100*CHILL_MUL));
  P.skills.chill=3; S.run.cd={}; fix(.75); useSkill('chill',b); ok(!b.stun,'30% at rank 3'); S.run.cd={}; fix(.65); useSkill('chill',b); eq(b.stun,2);
  ['1 turn','Bosses resist 50%'].forEach(x=>ok(SKILL.chill.desc(1).includes(x))); ok(/Chilled/.test(SKILL.chill.desc(2))&&!/Chilled/.test(SKILL.chill.desc(1))); ok(/2 turns/.test(SKILL.chill.desc(3))&&/30%/.test(SKILL.chill.desc(3)));
  ok(trText(SKILL.chill.desc(2))!==SKILL.chill.desc(2)&&!/Chilled|Bosses/.test(trText(SKILL.chill.desc(2))),'Turkish');
  [SKILL.curse.desc(3),SKILL.frenzy.desc(3),SKILL.mend.desc(1)].forEach(d=>ok(!/ turns| damage|minions/.test(trText(d)),trText(d)));
});

})();
