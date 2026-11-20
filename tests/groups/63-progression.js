// Mastery paths, capstones and New Game+ pacts (src/game-progression.js, src/ui-progression.js).
(function(){
const {test,ok,eq,near,fix,fresh,setLvl,foe,arena,mkMinion,renderAll,cdx,canon}=window.LOTD_T;
const learn=(p,n)=>{ let left=n; for(const id of PATHS[p].skills){ const k=Math.min(SK_MAX,left); if(k>0) S.player.skills[id]=k; left-=k; } };
const heal=h=>Math.round(h*(1+(xb('healp')+conHeal())/100));   // healing you receive, as healAlly scales it
const throne=()=>{ S.ti=S.ti||{}; S.ti.clr=Object.assign(S.ti.clr||{},{5:1}); };

test('Paths: every skill is on exactly one path; capstones need the level and the points, ties follow the choice',()=>{
  const all=[].concat(...Object.values(PATHS).map(P=>P.skills)); eq(all.length,SKILLS.length); eq(new Set(all).size,SKILLS.length); ok(all.every(id=>SKILL[id]),'known skills');
  eq(pathOf('chill'),'frost'); eq(pathOf('sanguine'),'blood'); eq(pathOf('blast'),'rot'); eq(pathOf('spear'),'bone');
  eq(Object.keys(CAPS).length,8); ok(Object.values(CAPS).every(C=>PATHS[C.path]&&C.name&&C.desc().length>20));
  fresh(29); learn('frost',12); eq(pathPts('frost'),12); eq(capPath(),null,'level 29: none');
  setLvl(30); eq(capPath(),'frost'); eq(capsOn().join(),'frost1'); setLvl(50); eq(capsOn().join(),'frost1,frost2');
  fresh(50); learn('rot',CAP_MIN-1); eq(capPath(),null,'too few points');
  fresh(50); learn('bone',10); learn('blood',10); eq(capTied().join(),'bone,blood'); eq(capPath(),'bone','first in order');
  ok(choosePath('blood')); eq(capPath(),'blood'); ok(!choosePath('nope'));
  S.player.skills.thrift=1; eq(capPath(),'bone','a clear lead beats the choice');
  S.player.sp=0; resetSkills(); eq(capPath(),null,'forgetting recounts');
});

test('Capstones: Bone gives Ward at each room and then Thorns',()=>{
  fresh(30); learn('bone',10); arena([foe()]); S.player.shield=0; roomStart(S.run.enemies); eq(S.player.shield,Math.round(pMax()*CAP_WARD)); ok(!hasFlag('thorns'));
  setLvl(50); S.player.shield=0; roomStart(S.run.enemies); eq(S.player.shield,Math.round(pMax()*CAP_WARD*2)); ok(hasFlag('thorns'),'Thorns');
  fresh(50); arena([foe()]); S.player.shield=0; roomStart(S.run.enemies); eq(S.player.shield,0,'no path, no Ward');
});

test('Capstones: Blood sends overhealing to the most wounded minion, and every kill heals',()=>{
  fresh(30); learn('blood',10); arena([foe()]); const a=mkMinion({}), b=mkMinion({}); a.maxHp=b.maxHp=100; a.hp=80; b.hp=20;
  S.player.hp=pMax()-10; healAlly(S.player,110); eq(b.hp,20+Math.round((heal(110)-10)*CAP_FEED),'half of the overheal'); eq(a.hp,80);
  setLvl(50); const e=foe({hp:0}); S.run.enemies=[e,foe()]; S.player.hp=1; a.hp=10; checkDeaths(); eq(S.player.hp,1+heal(Math.round(pMax()*CAP_COV))); eq(a.hp,10+Math.round(100*CAP_COV));
});

test('Capstones: Frost makes frozen foes take more and burns those that lost a turn, without finishing them',()=>{
  fresh(30); learn('frost',10); arena([foe()]); const e=S.run.enemies[0]; e.stun=1; hurtFoe(e,100); eq(e.hp,1000-Math.round(100*CAP_RIME));
  e.stun=0; e.hp=1000; hurtFoe(e,100); eq(e.hp,900,'not frozen');
  setLvl(50); fix(.5); e.froze=S.run.turn-1; e.hp=900; progTick(); ok(e.hp<900,'Deep Winter'); ok(hasSt(e,'chilled'),'Chilled'); const h=e.hp; progTick(); eq(e.hp,h,'once per frozen turn');
  e.froze=S.run.turn-1; e.capW=null; e.hp=2; progTick(); eq(e.hp,1,'never finishes a foe');
});

test('Capstones: Rot heals you from ticking wounds and spreads poison when a foe falls',()=>{
  fresh(30); learn('rot',10); arena([foe(),foe()]); const [e,o]=S.run.enemies; e.dots={poison:{d:100,t:2}}; S.player.hp=1; tickDots(); eq(S.player.hp,1+heal(Math.round(100*CAP_FESTER)));
  setLvl(50); e.hp=0; delete o.dots; checkDeaths(); ok(o.dots&&o.dots.poison,'poison spread'); eq(o.dots.poison.d,Math.round(pSiph()*CAP_BLOOM));
});

test('Pacts: chosen at New Game+, at most three, kept in the save, through reloads and repairs',()=>{
  fresh(30); throne(); ok(startNGP(null,['hides','claws','bogus','claws','regen','dry'])); eq(S.pacts.join(),'hides,claws,regen'); eq(S.ngp,1);
  const g=normalizeSave(JSON.parse(JSON.stringify(snapshot()))); eq(g.pacts.join(),'hides,claws,regen');
  eq(normalizeSave({v:2,player:{lvl:3},ngp:1,pacts:['dry','x',5,'dry']}).pacts.join(),'dry'); eq(normalizeSave({v:2,player:{lvl:3}}).pacts.length,0,'old saves');
  eq(normalizeSave({v:2,player:{lvl:3},pacts:['dry']}).pacts.length,0,'no pacts outside New Game+'); eq(normalizeSave({v:2,player:{lvl:3,capPath:'x'}}).player.capPath,undefined);
  eq(freshState().pacts.length,0); fresh(30); throne(); startNGP(null); eq(S.pacts.length,0,'none by default'); eq(pactReward(),1);
});

test('Pacts: each handicap works and the rewards follow',()=>{
  fresh(30); S.ngp=1; S.pacts=['hides','claws']; const e=foe({hp:1000,atk:100}); foeRise([e]); eq(e.maxHp,Math.round(1000*(1+PACT_HP))); eq(e.atk,Math.round(100*(1+PACT_ATK)));
  near(ngpReward(),(1+NGP_REWARD)*(1+0.4),1e-9); near(pactDrop(),1.2,1e-9);
  S.pacts=['regen']; arena([foe({hp:500})]); S.run.enemies[0].maxHp=1000; progTick(); eq(S.run.enemies[0].hp,500+Math.round(1000*PACT_REGEN));
  S.pacts=[]; const c={lvl:30,rankI:0,base:'Tunnel Rat'}, base=raiseChance(c); S.pacts=['deaf']; eq(raiseChance(c),base-PACT_RAISE);
  S.pacts=['dry']; S.belt={hp:1,mp:0}; S.player.hp=1; ok(!drink('hp')); eq(S.belt.hp,1); ok(!/data-k="pot:hp"/.test(renderAll('battle')),'no potion button');
  S.pacts=['bitter']; S.player.hp=1; eq(healAlly(S.player,100),Math.round(heal(100)*(1-PACT_BITTER)));
  S.mode='town'; S.run=null; S.pacts=['night']; S.watches=0; endDay(); eq(S.watches,WATCHES-1);
  fresh(30); throne(); startNGP(null,['night']); eq(S.watches,WATCHES-1,'the first day too');
});

test('Pacts: titles for finishing a cycle under one and under three pacts',()=>{
  fresh(30); S.ngp=1; S.pacts=['dry']; S.ti=S.ti||{}; S.ti.clr={}; checkTitles(); ok(!S.ti.got.pk1);
  throne(); checkTitles(); ok(S.ti.got.pk1); ok(!S.ti.got.pk3); S.pacts=['dry','night','deaf']; checkTitles(); ok(S.ti.got.pk3);
  eq(TITLE.pk3.r,5); ok(TITLE.pk1.b.goldp>=4);
});

test('Progression on screen: Skills tab paths, the New Game+ pact picker, the Status chips, two Codex pages, Turkish',()=>{
  fresh(50); learn('bone',10); learn('blood',10); ui.tab='skills'; let h=renderAll('skills');
  ok(/Mastery paths/.test(h)&&h.includes('Bone path')&&h.includes(CAPS.bone2.name)&&h.includes('data-a="cappath" data-k="blood"'),'paths and a tie');
  ACTIONS.cappath('blood'); eq(S.player.capPath,'blood');
  fresh(30); throne(); ui.tab='settings'; h=renderAll('settings'); ok(h.includes('data-a="ngppact" data-k="hides"'),'picker');
  ['hides','claws','regen','dry'].forEach(k=>ACTIONS.ngppact(k)); eq(ui.ngpPacts.join(),'hides,claws,regen','three at most'); ACTIONS.ngppact('claws'); eq(ui.ngpPacts.join(),'hides,regen');
  h=renderAll('settings'); ok(/2 of 3 pacts: \+35% XP and gold/.test(h));
  ACTIONS.ngp(); ACTIONS.ngp(); eq(S.ngp,1); eq(S.pacts.join(),'hides,regen'); eq(ui.ngpPacts,null);
  ui.tab='gates'; h=renderAll('gates'); ok(h.includes(PACTS.hides.name)&&h.includes('+35% XP and gold'),'status chips');
  ok(CODEX.some(c=>c[0]==='capstones')&&CODEX.some(c=>c[0]==='pacts'));
  h=cdx('pacts'); ok(h.includes(PACTS.night.name)&&h.includes('This cycle: '+PACTS.hides.name)); h=cdx('capstones'); ok(h.includes(CAPS.rot2.name));
  const strs=[].concat(...Object.values(CAPS).map(C=>[C.name,C.desc()]),...Object.values(PACTS).map(A=>[A.name,A.desc()]),Object.values(PATHS).map(P=>P.name+' path'),
    [TITLE.pk1.name,TITLE.pk3.name,TITLE.pk1.req,TITLE.pk3.req,'Mastery paths','Capstones','Pacts','Sworn','Follow','No pacts','2 of 3 pacts: +35% XP and gold, +17.5% gear drops.']);
  strs.forEach(s=>ok(trText(s)!==s,'Turkish for: '+s));
});
})();
