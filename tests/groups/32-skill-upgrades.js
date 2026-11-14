// Skill Upgrades tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Upgrades: every skill offers two upgrades, chosen once at rank 3, in town',()=>{
  eq(Object.keys(SKILL_MODS).length,SKILLS.length); SKILLS.forEach(s=>{ const M=SKILL_MODS[s.id]; ok(M&&M.a&&M.b,s.id); ok(!BAD_TEXT.test(M.a.join()+M.b.join())); });
  S.player.skills.spear=2; ok(!chooseMod('spear','a'),'not mastered'); master('spear'); ok(!chooseMod('spear','c')); ok(chooseMod('spear','b')); eq(skMod('spear'),'b'); ok(!chooseMod('spear','a'),'only once');
  master('reap'); arena([foe()]); ok(!chooseMod('reap','a'),'not in battle');
});
test('Upgrades: forgetting skills clears the choice; saves keep only valid choices',()=>{
  master('spear'); chooseMod('spear','a'); resetSkills(); eq(skMod('spear'),null); eq(Object.keys(S.player.skMod).length,0);
  const g=normalizeSave({v:2,player:{lvl:30,skills:{spear:3,reap:2},skMod:{spear:'a',reap:'b',fly:'a',curse:'z'}}}); eq(canon(g.player.skMod),canon({spear:'a'}));
});
test('Upgrades: Bone Spear Impaler pierces all armor, Splinter hits a second foe',()=>{
  const a=foe({hp:1e6}), b=foe({hp:1e6}); arena([a,b],3); master('spear'); S.mode='town'; chooseMod('spear','a'); S.mode='battle'; S.player.mana=200; fix(.5); act('sk:spear');
  eq(1e6-a.hp,H((pAtk()+pSiph())*1.15*pierceMul(1))); eq(b.hp,1e6);
  S.player.skMod.spear='b'; S.run.cd={}; const a2=a.hp; act('sk:spear'); eq(1e6-b.hp,Math.round((a2-a.hp)*.5));
});
test('Upgrades: passive upgrades change your numbers',()=>{
  const P=S.player; master('bonearmor'); const h=pMax(); P.skMod.bonearmor='a'; near(pMax(),h/1.18*1.24,1); P.skMod.bonearmor='b'; const w=pWard(); delete P.skMod.bonearmor; eq(w,Math.round(pWard()*1.3));
  master('mastery'); const c=corpse({lvl:40,rankI:3}); const ch=raiseChance(c), cost=raiseCost(corpse({rankI:3})); P.skMod.mastery='a'; eq(raiseChance(c),ch+6); P.skMod.mastery='b'; eq(raiseCost(corpse({rankI:3})),Math.ceil(17*.75)); ok(raiseCost(corpse({rankI:3}))<cost);
  master('soulwell'); P.skMod.soulwell='b'; eq(siphonCost(),6); master('gravepact'); const m=mkMinion({lvl:20,rankI:4}), mh=m.maxHp; P.skMod.gravepact='a'; syncMinion(m); ok(m.maxHp>mh);
});
test('Upgrades: active upgrades change what the skill does',()=>{
  const t=foe({hp:1e6}), o=foe({hp:1e6}); arena([t,o]); const P=S.player; fix(.5); P.mana=999;
  master('curse'); P.skMod.curse='b'; act('sk:curse'); ok(t.curse&&o.curse,'Spreading curses everyone'); near(o.curse.mul,1+.45*.8,1e-9);
  P.skMod.curse='a'; S.run.cd={}; delete t.curse; act('sk:curse'); eq(t.curse.t,5-1,'Lingering lasts 5 turns');
  master('frenzy'); P.skMod.frenzy='a'; act('sk:frenzy'); eq(S.run.frenzy,4);
  master('blast'); P.skMod.blast='b'; S.run.corpses=[corpse()]; act('sk:blast'); ok(t.dots&&t.dots.poison,'Grave Gas poisons');
  master('reap'); P.skMod.reap='b'; const low=foe({hp:1,maxHp:1e6}); S.run.enemies.push(low); setTarget(low.id); P.mana=50; act('sk:reap'); ok(P.mana>=50-18+10,'Soul Reap refunds mana');
  master('edge'); P.skMod.edge='b'; P.hp=10; const hp=P.hp; setTarget(t.id); act('strike'); ok(P.hp>hp-2,'Vampiric heals');
});
test('Upgrades: the Skills tab offers the choice and shows what you chose',()=>{ master('spear'); ui.tab='skills'; ok(/data-a="skmod" data-k="spear\|a"/.test(renderAll('choose'))); ACTIONS.skmod('spear|a'); ok(/Upgrade: <b>Impaler/.test(renderAll('chosen'))); });

})();
