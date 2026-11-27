// Hero builds 2.0, R11 (src/game-builds.js): fifth skills, new ultimates, Endurance, titles.
(function(){
const {test,ok,eq,near,fix,seed,fresh,setLvl,foe,arena,mkMinion,master,renderAll,cdx}=window.LOTD_T;
test('Builds: every path has five skills; Hoarfrost Lance freezes, chills the neighbors, and its upgrades',()=>{
  Object.keys(PATHS).forEach(p=>eq(PATHS[p].skills.length,5,p)); eq(pathOf('lance'),'frost'); eq(pathOf('pest'),'rot');
  fresh(30); setLvl(40); const P=S.player; P.skills.lance=1; const a=foe({hp:1e6}), b=foe({hp:1e6}), c=foe({hp:1e6}); arena([a,b,c]); P.mana=99; fix(.5); ok(canUse('lance')); useSkill('lance',b);
  ok(b.hp<1e6,'it hurts'); ok(b.stun>0,'frozen'); ok(hasSt(a,'chilled')&&hasSt(c,'chilled'),'the neighbors are chilled'); eq(skCd('lance'),SKILL.lance.cd+1);
  const d1=1e6-b.hp; P.skills.lance=3; P.skMod.lance='a'; S.run.cd={}; b.hp=1e6; b.stun=1; useSkill('lance',b); ok(1e6-b.hp>d1*LANCE_SHATTER*.9,'Shatterpoint: '+(1e6-b.hp)+' vs '+d1);
  P.skMod.lance='b'; S.run.cd={}; a.stun=0; c.stun=0; useSkill('lance',b); ok(a.stun>0||c.stun>0,'Rime Spread freezes a neighbor');
  const bo=foe({hp:1e6,boss:true}); arena([bo]); P.skMod.lance=null; P.skills.lance=1; fix(.99); P.mana=99; useSkill('lance',bo); ok(!(bo.stun>0),'a boss can resist');
});
test('Builds: Pestilence makes wounds tick harder per wound; Contagion and Virulence',()=>{
  fresh(30); setLvl(40); const P=S.player; const e=foe({hp:1e6}); arena([e]); addDot(e,'poison',100,5); const h0=e.hp; tickDots(); const t0=h0-e.hp;
  P.skills.pest=2; e.hp=1e6; addDot(e,'bleed',1,5); addDot(e,'burn',1,5); delete e.dots.bleed; delete e.dots.burn; addDot(e,'blight',100,5); eq(pestN(e),2); near(pestK(e),1+PEST_STEP*2*2,1e-9);
  P.skills.pest=3; P.skMod.pest='a'; const x=foe({hp:10}), y=foe({hp:1e6}); arena([x,y]); addDot(x,'poison',5,3); addDot(x,'blight',5,3); x.hp=0; checkDeaths(); ok(y.dots&&(y.dots.poison||y.dots.blight),'Contagion passes a wound on');
  P.skMod.pest='b'; fix(0); ok(pestCrit(),'Virulence can crit'); P.skMod.pest='a'; ok(!pestCrit());
  ok(t0>0);
});
test('Builds: Endurance grows your side\'s damage after turn 5 with Constitution, capped',()=>{
  fresh(30); setLvl(40); const P=S.player; P.stats.constitution=200; arena([foe({hp:1e6})]); S.run.turn=5; eq(endureK(),1); S.run.turn=6; near(endureK(),1+CON_ENDURE*200/10,1e-9); S.run.turn=200; near(endureK(),1+CON_ENDURE_CAP,1e-9);
  const m6=(S.run.turn=6,dmgMul()), m1=(S.run.turn=1,dmgMul()); ok(m6>m1,'it feeds every hit');
});
test('Builds: Requiem has every minion act again; The Long Name raises the fallen as thralls for the room',()=>{
  fresh(30); setLvl(25); S.mode='town'; chooseUlt('requiem'); const m=mkMinion({lvl:20}), n=mkMinion({lvl:20}); const e=foe({hp:1e9}); arena([e]); S.run.souls=SOUL_MAX; ok(useUlt()); eq(S.run.requiem,S.run.turn); const h=e.hp; requiemStrikes(); ok(e.hp<h,'a second action');
  S.mode='town'; S.run=null; chooseUlt('longname'); const w=foe({hp:10}), big=foe({hp:1e9}); arena([w,big]); S.run.souls=SOUL_MAX; useUlt(); const n0=S.army.length; w.hp=0; checkDeaths(); eq(S.army.length,n0+1,'a thrall rises'); const t=S.army[S.army.length-1]; ok(t.thrall&&t.ln); eq(armyUsed(),n0,'it holds no slot');
  lnClear(); eq(S.army.length,n0,'gone after the room');
  const b=foe({hp:10,boss:true}); arena([b,foe({hp:1e9})]); S.run.lname=S.run.turn+2; b.hp=0; checkDeaths(); ok(!S.army.some(x=>x.ln),'not a boss');
});
test('Builds: titles, Codex and Turkish',()=>{
  fresh(30); S.ti=S.ti||{}; S.ti.got=S.ti.got||{}; S.ti.longHaul=1; PATHS.frost.skills.forEach(id=>S.player.skills[id]=3); checkTitles(); ok(S.ti.got.b_haul&&S.ti.got.b_five);
  ok(cdx('skills').includes('Hoarfrost Lance')||renderAll('skills').includes('Hoarfrost Lance'));
  VIEW.lang='tr'; [SKILL.lance.desc(2),SKILL.pest.desc(2),ULTS.requiem.desc,ULTS.longname.desc,SKILL_MODS.lance.a[1],SKILL_MODS.pest.b[1]].forEach(s=>ok(trText(s)!==s,s)); VIEW.lang='en';
});
})();
