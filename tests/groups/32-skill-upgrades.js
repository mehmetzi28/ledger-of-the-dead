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
  eq(1e6-a.hp,H((pAtk()+pSiph())*1.15*pierceMul(1)*skMul())); eq(b.hp,1e6);
  S.player.skMod.spear='b'; S.run.cd={}; const a2=a.hp; act('sk:spear'); eq(1e6-b.hp,Math.round((a2-a.hp)*.5));
});
test('Upgrades: passive upgrades change your numbers',()=>{
  const P=S.player; master('bonearmor'); const h=pMax(); P.skMod.bonearmor='a'; eq(pMax(),h,'Ossified wards instead of adding HP'); P.skMod.bonearmor='b'; const w=pWard(); delete P.skMod.bonearmor; eq(w,Math.round(pWard()*MARROW)); eq(MARROW,1.5);
  master('mastery'); const c=corpse({lvl:40,rankI:3}); const ch=raiseChance(c), cost=raiseCost(corpse({rankI:3})); P.skMod.mastery='a'; eq(raiseChance(c),ch,'Gravecaller lifts levels, not the chance'); P.skMod.mastery='b'; eq(raiseCost(corpse({rankI:3})),Math.ceil(17*.75)); ok(raiseCost(corpse({rankI:3}))<cost);
  master('soulwell'); P.skMod.soulwell='b'; eq(siphonCost(),6); master('gravepact'); const m=mkMinion({lvl:20,rankI:4}), mh=m.maxHp; P.skMod.gravepact='a'; syncMinion(m); eq(m.maxHp,mh,'Blood Oath is crit chance, not power');
});
test('Upgrades: every rank-3 choice is its own mechanic, never a copy of the rank bonus',()=>{
  SKILLS.forEach(s=>{ const M=SKILL_MODS[s.id]; ok(M.a[1]!==M.b[1],s.id); ok(!/^\+\d+% (more )?(max HP|gold|XP|max mana|healing)/.test(M.a[1])&&!/^\+\d+% (more )?(max HP|gold|XP|max mana|healing)/.test(M.b[1]),s.id+' still a flat clone'); });
  SKILLS.forEach(s=>['a','b'].forEach(c=>{ const M=SKILL_MODS[s.id][c]; ok(trText(M[0])!==M[0]&&trText(M[1])!==M[1],'Turkish: '+M[0]+' / '+M[1]); }));
  const P=S.player; setLvl(40); ['robber','scholar','calcify','sanguine','deathless'].forEach(id=>P.skills[id]=3); const k=['goldp','xpp','drp','healp','manap','hpp'], b=k.map(x=>skB(x));
  ['robber','scholar','calcify','sanguine','deathless'].forEach(id=>['a','b'].forEach(c=>{ P.skMod[id]=c; eq(canon(k.map(x=>skB(x))),canon(b),id+' '+c+' adds no flat bonus'); delete P.skMod[id]; }));
});
test('Upgrades: Ossified wards each room, Overflow, Deep Well, Gravecaller, Frugal Rites and Grave Sense',()=>{
  const P=S.player; master('bonearmor'); P.skMod.bonearmor='a'; P.shield=0; S.watches=3; startRun(0); eq(P.shield,Math.round(pMax()*OSSIFIED),'a Ward to start the room'); flee();
  master('soulwell'); P.skMod.soulwell='a'; arena([foe({hp:1e6})]); P.mana=10; S.run.souls=0; gainSoul(); eq(P.mana,10+OVERFLOW_MANA);
  master('deathless'); P.skills.reap=3; eq(skCost(SKILL.reap),18); P.skMod.deathless='a'; eq(skCost(SKILL.reap),Math.round(18*DEEP_WELL)); P.mana=50; S.run.cd={}; fix(.5); act('sk:reap'); ok(P.mana>=50-Math.round(18*DEEP_WELL),'pays the lower cost');
  flee(); master('mastery'); P.skMod.mastery='a'; const c=corpse({lvl:5}); raiseScene([c],40); fix(0); P.mana=99; tryRaise(c.id); eq(S.army[S.army.length-1].lvl,7,'two levels higher');
  master('thrift'); P.skMod.thrift='a'; const c2=corpse({rankI:3}); raiseScene([c2],40); fix(.999); P.mana=50; const cost=raiseCost(c2); tryRaise(c2.id); eq(c2.result,'failed'); eq(P.mana,50-cost+Math.floor(cost*FRUGAL));
  P.skMod.thrift='b'; const c3=corpse({}); eq(saltChance(c3),Math.min(SALT_CAP,raiseChance(c3)+30));
});
test('Upgrades: Deep Pockets, Keen Eye, Insight and Field Notes',()=>{
  const P=S.player; master('robber'); master('scholar'); arena([foe()]); const el=foe({elite:true,lvl:10}); fix(.5); const r=S.run; r.gold=0; killLoot(el,r); const g0=r.gold; r.gold=0; P.skMod.robber='a'; killLoot(el,r); near(r.gold,g0*POCKETS,2);
  P.skMod.robber='b'; r.troph={}; fix(.7); killLoot(foe({lvl:3}),r); eq(r.troph['Tunnel Rat'],1,'Keen Eye: a trophy at 70%'); delete P.skMod.robber; r.troph={}; killLoot(foe({lvl:3}),r); eq(r.troph['Tunnel Rat'],undefined);
  const o=foe(), x0=killXp(el), o0=killXp(o); P.skMod.scholar='a'; ok(Math.abs(killXp(el)-x0*INSIGHT)<=1); eq(killXp(o),o0,'ordinary foes unchanged');
  P.skMod.scholar='b'; S.kills={}; S.ti=S.ti||{}; S.ti.notes=0; for(let i=0;i<6;i++) studyFoe('Grave Beetle'); eq(S.kills['Grave Beetle'],9,'every second kill counts twice: 1.5x');
  S.kills['Tunnel Rat']=KNOW_AT-1; S.ti.notes=1; S.notices=[]; studyFoe('Tunnel Rat'); eq(S.kills['Tunnel Rat'],KNOW_AT+1); ok(S.notices.some(n=>/studied Tunnel Rat/.test(n.m)),'the threshold it jumps over still counts');
});
test('Upgrades: Petrified refuses crits, Barbed Hide bites back, Blood Feast wards, Clear Mind refills, Iron Will holds',()=>{
  const P=S.player; master('calcify'); master('sanguine'); master('deathless'); const s=foe({role:'striker',atk:40,hp:1e6}); arena([s]); P.stats.constitution=300; P.hp=pMax();
  P.skMod.calcify='a'; seq([.5,.5,.5,.5,.1],.5); act('strike'); ok(!(P.dots&&P.dots.bleed),'no wound from a refused crit'); ok(!S.run.log.some(l=>/crit/.test(l.m)&&/hits you/.test(l.m)));
  P.skMod.calcify='b'; const h0=s.hp; fix(.5); act('strike'); ok(h0-s.hp>H(pAtk()*pierceMul(strPen())*(1+.1*sk('edge'))),'the hide bites back');
  P.skMod.sanguine='a'; P.hp=pMax()-5; P.shield=0; healAlly(P,50); eq(P.hp,pMax()); ok(P.shield>0&&P.shield<=Math.round(pMax()*FEAST_CAP),'overheal became ward');
  P.skMod.sanguine='b'; P.hp=pMax()-300; P.mana=0; const got=healAlly(P,100); eq(P.mana,Math.round(got*CLEAR_MIND));
  P.skMod.deathless='b'; P.shield=0; P.hp=pMax(); hurtAlly(P,100); const full=pMax()-P.hp; P.hp=Math.floor(pMax()*.2); const lo=P.hp; hurtAlly(P,100); ok(lo-P.hp<full,'less damage when low');
});
test('Upgrades: Deep Mending revives, Bigger Bang sunders, Grave Gas blights, Blood Oath crits',()=>{
  const t=foe({hp:1e6}); arena([t]); const P=S.player; P.mana=999; fix(.5);
  master('mend'); P.skMod.mend='a'; const m=mkMinion({}); m.hp=0; ok(canUse('mend'),'usable for a downed minion alone'); act('sk:mend'); eq(m.hp,Math.round(m.maxHp*MEND_REVIVE));
  master('blast'); P.skMod.blast='a'; S.run.corpses=[corpse()]; act('sk:blast'); ok(hasSt(t,'sundered'));
  P.skMod.blast='b'; S.run.cd={}; S.run.corpses=[corpse()]; act('sk:blast'); ok(t.dots.blight&&t.dots.poison,'poison and blight');
  master('gravepact'); P.skMod.gravepact='a'; S.army=[]; const v=mkMinion({role:'vanguard'}); v.atk=100; S.run.log=[]; fix(.05); act('strike'); ok(S.run.log.some(l=>/Mn\d+ hits .*\(crit\)/.test(l.m)),'a vanguard can crit');
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
