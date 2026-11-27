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
test('Builds: each path\'s signature opens at level 40 for the leaning path, once a room, and does what it says',()=>{
  fresh(30); setLvl(39); const P=S.player; PATHS.frost.skills.forEach(id=>P.skills[id]=3); eq(sgnPath(),null,'not before level 40'); setLvl(SGN_LV); eq(sgnPath(),'frost');
  PATHS.bone.skills.forEach(id=>P.skills[id]=3); P.capPath='bone'; eq(sgnPath(),'bone','a tie goes to the chosen path'); PATHS.bone.skills.forEach(id=>P.skills[id]=0); delete P.capPath;
  const a=foe({hp:1e6}), b=foe({hp:1e6,boss:true}); arena([a,b]); b.charging=true; b.move=Object.keys(BOSS_ABIL)[0]; P.mana=99; ok(canSgn()); const t0=S.run.turn; ok(useSgn()); eq(S.run.turn,t0,'a free action: the turn goes on'); eq(S.mode,'battle'); ok(a.stun>0,'White Silence freezes'); ok(!(b.stun>0)&&hasSt(b,'chilled')&&!b.charging,'a boss is chilled and its charge breaks'); eq(P.mana,99-SGN_COST); ok(!canSgn(),'once a room'); ok(!useSgn());
  S.run.sgnU=0; PATHS.frost.skills.forEach(id=>P.skills[id]=0); PATHS.blood.skills.forEach(id=>P.skills[id]=3); eq(sgnPath(),'blood');
  const m=mkMinion({lvl:30}); m.hp=1; const x=foe({hp:1e6}), y=foe({hp:1e6,boss:true}); arena([x,y]); P.mana=99; useSgn(); near(1e6-x.hp,1e6*SGN_DRAIN,2); near(1e6-y.hp,1e6*SGN_DRAIN_BOSS,2); ok(m.hp>1,'the drain mends the most hurt');
  PATHS.blood.skills.forEach(id=>P.skills[id]=0); PATHS.bone.skills.forEach(id=>P.skills[id]=3); S.run.sgnU=0; P.mana=99; useSgn(); ok(m.mw>=Math.round(m.maxHp*SGN_WARD),'Ossuary Gate wards');
  PATHS.bone.skills.forEach(id=>P.skills[id]=0); PATHS.rot.skills.forEach(id=>P.skills[id]=3); const p1=foe({hp:1e6}), p2=foe({hp:1e6}); arena([p1,p2]); addDot(p1,'poison',5,3); S.run.sgnU=0; P.mana=99; useSgn(); ok(p1.hp<1e6-5,'a poisoned foe bursts'); ok(p2.dots&&p2.dots.blight,'every foe is blighted');
  const last=foe({hp:1}); arena([last]); addDot(last,'poison',5,3); S.run.sgnU=0; P.mana=99; useSgn(); ok(S.mode!=='battle','a room the signature ends is won');
});
test('Builds: skill runes drop from wardens, masters and guardians, slot in town one per skill, and crumble to dust as duplicates',()=>{
  fresh(30); const P=S.player; eq(RUNE_IDS.length,16); RUNE_IDS.forEach(id=>ok(SKILL[RUNES[id].sk]&&SKILL[RUNES[id].sk].type==='active',id));
  S.mode='town'; ok(!slotRune('spear','spear_a'),'not owned'); gainRune('spear_a'); ok(runeOwned('spear_a')); ok(slotRune('spear','spear_a')); eq(P.runes.spear,'spear_a'); ok(!slotRune('spear','chill_a'),'the wrong skill');
  const d0=S.dust||0; gainRune('spear_a'); eq(S.dust,d0+RUNE_DUST); eq(S.runes.filter(x=>x==='spear_a').length,1); ok(slotRune('spear',null)); ok(!P.runes.spear);
  const w=foe({hp:1,boss:true}); w.tw=5; w.base=TW_BOSS[0]; arena([w]); const n0=S.runes.length, d1=S.dust; w.hp=0; checkDeaths(); eq(S.runes.length+(S.dust-d1)/RUNE_DUST,n0+2,'a warden leaves two runes the first time');
  const g=JSON.parse(JSON.stringify(S)); g.runes.push('nope','chill_a'); g.player.runes={spear:'chill_a',chill:'chill_a',reap:'reap_b'}; runesFix(g); ok(!g.runes.includes('nope')); eq(g.player.runes.chill,'chill_a'); ok(!g.player.runes.spear&&!g.player.runes.reap,'bad and unowned slots go');
  const h={player:{}}; runesFix(h); ok(!('runes' in h)&&!('runes' in h.player),'a save without runes gets none');
});
test('Builds: each rune changes its skill',()=>{
  fresh(30); setLvl(40); const P=S.player; S.runes=RUNE_IDS.slice(); P.runes={}; ['spear','chill','reap','curse','frenzy','blast','mend','lance'].forEach(id=>P.skills[id]=1);
  let a=foe({hp:1e6}), b=foe({hp:1e6}), c=foe({hp:1e6}); arena([a,b,c]); P.runes.spear='spear_b'; P.mana=999; fix(.5); useSkill('spear',b); ok(hasSt(b,'sundered'),'Sundering Spear');
  P.runes.chill='chill_a'; S.run.cd={}; useSkill('chill',b); ok(a.hp<1e6&&c.hp<1e6,'Avalanche hits the rest');
  P.runes.curse='curse_b'; S.run.cd={}; useSkill('curse',a); eq(a.resD,RUNE_DEEP,'Deep Curse');
  P.runes.frenzy='frenzy_b'; S.run.cd={}; const hp=P.hp; useSkill('frenzy'); ok(P.hp<hp,'Last Frenzy costs HP'); eq(S.run.frenzy,4);
  P.runes.reap='reap_b'; const k=foe({hp:1}); arena([k,foe({hp:1e6})]); S.run.souls=0; S.run.cd={}; P.mana=999; useSkill('reap',k); eq(S.run.souls,1,'Soul Harvest');
  P.runes.reap='reap_a'; const k2=foe({hp:1}); arena([k2,foe({hp:1e6})]); S.run.cd={}; S.run.reapRs=0; P.mana=999; useSkill('reap',k2); eq(skCd('reap'),0,'Second Harvest'); eq(S.run.reapRs,1);
  S.run.sweep=1; ok(!hasRune('reap','a'),'no runes in a Sweep'); S.run.sweep=0;
});
test('Builds: signatures and runes on the Skills tab, the Codex, titles and Turkish',()=>{
  fresh(30); setLvl(40); PATHS.rot.skills.forEach(id=>S.player.skills[id]=3); S.runes=RUNE_IDS.slice(); S.mode='town'; ui.tab='skills';
  const h=renderAll('skills'); ok(h.includes('Bloom of Ruin'),'the signature shows'); ok(h.includes(RUNES.spear_a.name),'the rune row shows');
  ok(cdx('skills').includes('Runes'),'the Codex'); S.player.runes={blast:'blast_a'}; const st=statusHTML(); ok(st.includes('Build: Rot')&&st.includes('Signature: Bloom of Ruin')&&st.includes('Chain'),'the build line');
  S.ti=S.ti||{}; S.ti.got=S.ti.got||{}; S.ti.sgnCast=100; checkTitles(); ok(S.ti.got.b_runes&&S.ti.got.b_sgn);
  VIEW.lang='tr'; [SGN.frost.name,SGN.blood.desc(),SGN.rot.desc(),RUNES.lance_a.desc,RUNES.reap_b.name].forEach(s=>ok(trText(s)!==s,s)); VIEW.lang='en';
});
})();
