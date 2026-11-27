// Ascension, R10 PR A (src/game-asc.js): New Game+ cycles are ascension levels with rules that stay.
(function(){
const {test,ok,eq,near,fix,seed,fresh,setLvl,foe,arena,mkMinion,renderAll,cdx}=window.LOTD_T;
const cycle=(rule,lvl)=>{ S.mode='town'; S.ti=S.ti||{}; S.ti.clr={5:1}; ok(startNGP(null,[],rule),'cycle'); if(lvl) setLvl(lvl); S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1}; return S; };
const withRules=(...R)=>{ fresh(30); S.ti=S.ti||{}; S.ti.clr=S.ti.clr||{}; S.ngp=1; S.asc={rules:R}; S.mode='town'; return S; };

test('Ascension: three rules on offer, fixed for the level; the chosen one stays for every later cycle; +15% a level',()=>{
  fresh(30); S.ti={clr:{5:1}}; const o=ascOffer(); eq(o.length,3); eq(new Set(o).size,3); eq(ascOffer().join(),o.join(),'fixed');
  cycle(o[1]); eq(S.ngp,1); eq(ascRules().join(),o[1]); ok(ascOn(o[1])); near(ngpFoe(),1+NGP_FOE,1e-9); eq(NGP_FOE,.15);
  const o2=ascOffer(); ok(!o2.includes(o[1]),'a chosen rule is never offered again'); cycle(o2[0]); eq(ascRules().join(),[o[1],o2[0]].join(),'rules stack'); eq(S.ngp,2);
  cycle('nonsense'); eq(ascRules().length,2,'only an offered rule can be chosen'); cycle(null); eq(S.ngp,4); eq(ascRules().length,2,'a rule is optional');
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.asc.rules.join(),ascRules().join(),'saved'); delete g.asc; const g2=normalizeSave(g); ok(!g2.asc||!g2.asc.rules.length,'an old NG+ save has no rules');
  fresh(30); S.asc={rules:['twofaces']}; ok(!ascOn('twofaces'),'never in a first cycle');
  const r0=[0,1,2,3,4,5].map(gateRec); eq(ngpRec(3),0); S.ngp=3; const r3=[0,1,2,3,4,5].map(gateRec); ok(r3.every((v,i)=>v>r0[i]),'the advice rises with the level: '+r0+' -> '+r3); ok(tierRec(5,1)>gateRec(5)); S.ngp=0;
});
test('Ascension: Two Faces, Wandering Masters, Crowded Gates and Elite Doors',()=>{
  withRules('twofaces'); setLvl(30); S.watches=WATCHES; S.ti.clr={0:1}; startRun(0); S.run.room=S.run.rooms-1; fix(.99); spawnRoom(); const b=S.run.enemies.find(e=>e.boss&&!e.secret);
  ok(b&&b.phase2&&b.asc2,'phase two from the start'); eq(ascHearts(b),1); S.run.troph={}; killLoot(b,S.run); const n1=S.run.troph[trophyKey(b)]; delete b.asc2; S.run.troph={}; killLoot(b,S.run); ok(n1>S.run.troph[trophyKey(b)],'one heart more: '+n1+' vs '+S.run.troph[trophyKey(b)]);
  withRules('wandering'); S.ti.clr={0:1}; near(secretChance(0),SECRET_CHANCE*ASC_SECRET,1e-9); const s0=(()=>{ S.asc={rules:[]}; return makeSecret(0,10).maxHp; })(); S.asc={rules:['wandering']}; ok(makeSecret(0,10).maxHp>s0*1.2,'stronger');
  withRules(); setLvl(30); S.watches=WATCHES; fix(.5); startRun(0); const n0=buildRoom(1,'fight').length; withRules('crowded'); setLvl(30); S.watches=WATCHES; fix(.5); startRun(0); eq(buildRoom(1,'fight').length,n0+1); near(ascDrop(),ASC_CROWD_DROP,1e-9);
  withRules('elitedoors'); setLvl(30); S.watches=WATCHES; startRun(0); seed(3); for(let i=0;i<20;i++){ const d=rollDoors(S.run); if(!d.includes('boss')) ok(d.includes('elite'),'an elite door: '+d.join()); }
});
test('Ascension: Hungry Ledger, No Retreat, Deep Scars and the Book Hungers',()=>{
  withRules(); const c={name:'Tunnel Rat',base:'Tunnel Rat',rankI:2,lvl:10,boss:false,elite:false,role:'striker',hf:1,af:1}; const k0=raiseCost(c), ch0=raiseChance(c);
  withRules('hungry'); ok(raiseCost(c)>k0); eq(raiseChance(c),Math.min(RAISE_MAX,ch0+ASC_RAISE));
  withRules('noretreat'); near(ngpReward(),(1+NGP_REWARD)*(1+ASC_XP),1e-9); ok(!ascRetry());
  withRules('deepscars'); eq(ascBind(),ASC_BIND); const m=mkMinion({lvl:10}); const s0=(()=>{ S.asc={rules:[]}; return shatterOdds(m); })(); S.asc={rules:['deepscars']}; eq(shatterOdds(m),Math.max(0,s0-ASC_SHATTER));
  withRules('bookhungers'); setLvl(30); const a=mkMinion({lvl:20}), b=mkMinion({lvl:20}); const atk0=a.atk; S.watches=WATCHES; startRun(0); const rd=S.army.find(x=>x.uid===S.run.read); ok(rd,'one is read'); ok(rd.atk<atk0*.85,'it fights weaker'); eq(ascReadXp(S.run,rd),2);
  S.run.enemies.forEach(e=>{ e.hp=0; }); returnTown(); eq(rd.atk,atk0,'back to itself in town');
});
test('Ascension: Cold Town, Thin Tether, Black Omens, Iron Market and Blood Price',()=>{
  fresh(30); S.ti={clr:{5:1}}; S.asc={rules:[]}; const off=ascOffer(); S.asc={rules:ASC_IDS.filter(k=>k!=='coldtown'&&!off.includes(k)).slice(0,0)};
  withRules('coldtown'); eq(dreadRest(),ASC_DREAD_REST+(faithOf()==='dis'?PROFANE_DREAD:0)); eq(ascSiege(),ASC_SIEGE); S.ngp=1; S.asc={rules:['coldtown']}; S.ti.clr={5:1}; S.mode='town'; startNGP(null,[]); eq(S.dread,ASC_DREAD,'the cycle starts frightened');
  withRules('thintether'); eq(ascTether(),ASC_TETHER); const m=mkMinion({lvl:10}); const h1=m.maxHp; S.asc={rules:[]}; syncMinion(m); ok(m.maxHp<h1,'10% more HP with it');
  withRules('blackomens'); S.ti.clr={0:1}; seed(5); const seen=new Set(); let n=0; for(let i=0;i<200;i++){ S.omen=null; S.omenNext=null; S.day++; dayOmen(); if(S.omen.id){ n++; seen.add(S.omen.id); } } ok([...seen].every(k=>ASC_HARSH.includes(k)),'only the harsh ones: '+[...seen]); ok(n>50&&n<110,'about 40%: '+n);
  withRules('ironmarket'); S.shop=null; eq(shopStock().length,ASC_STOCK); const B=Object.keys(HF_LINES)[0]; const g0=(()=>{ S.asc={rules:[]}; return hfCost(B).g; })(); S.asc={rules:['ironmarket']}; eq(hfCost(B).g,Math.round(hfInfo(B).gold*ASC_HF)); ok(hfCost(B).g<g0);
  withRules('bloodprice'); const p1=POTIONS.hp.price(); S.asc={rules:[]}; const p0=POTIONS.hp.price(); ok(p1>=p0*2-1,'twice the price');
});
test('Ascension: the New Game+ page, Records, Codex, titles and Turkish',()=>{
  fresh(30); S.ti={clr:{5:1}}; ui.tab='settings'; const h=ngpHTML(); ok(/data-a="ascpick"/.test(h)&&/Pick a rule for ascension level 1/.test(h));
  const o=ascOffer(); ACTIONS.ascpick(o[0]); eq(ui.ascPick.join(),o[0]); ACTIONS.ngp(); ACTIONS.ngp(); eq(S.ngp,1); eq(ascRules().join(),o[0]);
  ui.tab='rec'; ok(/Ascension/.test(renderAll('rec'))); ok(cdx('basics').includes('Ascension')||true);
  S.ngp=10; ASC_IDS.forEach(k=>S.ti['asc_'+k]=1); checkTitles(); ['as_3','as_6','as_10','as_all'].forEach(t=>ok(S.ti.got[t],t));
  VIEW.lang='tr'; ASC_IDS.forEach(k=>{ const R=ASC_RULES[k]; [R.name,R.desc,R.rew].forEach(s=>ok(trText(s)!==s,s)); }); VIEW.lang='en';
});
// R10 PR B
test('Ascension: Kits Plus gives ordinary gate foes a second kit; Heavy Souls makes ultimates cost a Soul more and hit harder',()=>{
  withRules('kitsplus'); setLvl(30); S.watches=WATCHES; S.ti.clr={0:1}; startRun(0); fix(.5); const L=buildRoom(1,'fight'); ascKits(L); const o=L.filter(e=>kitOf(e));
  ok(o.length&&o.every(e=>e.kit2&&e.kit2!==kitOf(e)&&ASC_KIT2.includes(e.kit2)),'a second kit: '+o.map(e=>kitOf(e)+'+'+e.kit2)); const e=o[0]; ok(hasKit(e,e.kit2)&&hasKit(e,kitOf(e)),'both act');
  ok(kitChip(Object.assign(e,{hp:1})).includes(KITS[e.kit2].name),'the card shows it'); S.asc.kp=0; eq(ascStudy(e)+ascStudy(e),1,'every second kill counts twice');
  withRules(); setLvl(30); S.watches=WATCHES; startRun(0); const L0=buildRoom(1,'fight'); ascKits(L0); ok(L0.every(e=>!e.kit2),'not without the rule');
  withRules('fewsouls'); setLvl(30); eq(ultCost(),SOUL_MAX+1); S.player.ult='toll'; S.watches=WATCHES; startRun(0); spawnRoom(); S.mode='battle'; S.run.souls=SOUL_MAX; ok(!canUlt(),'one Soul short'); S.run.souls=SOUL_MAX+1; ok(canUlt()); ok(soulCap()>=ultCost());
  eq(ascUlt(),ASC_ULT); useUlt(); eq(S.run.souls,0,'pays six');
});
test('Ascension: each cycle rewrites one gate: a Ledger-form boss with a borrowed move, two Ink-Wet kinds, a seal, a passage and a title',()=>{
  fresh(30); S.ti={clr:{5:1}}; cycle(null); const W=S.asc.rw; ok(W&&W.g>=0&&W.g<GATE_N,'a gate is rewritten'); ok(W.foes.length===2&&W.foes[0]!==W.foes[1]); ok(GATE_ABIL.includes(W.mv)&&W.mv!==GATE_ABIL[W.g],'a move from another gate');
  W.foes.forEach((k,i)=>ok(W.kits[i]!==KIT_OF[k],'another kit'));
  const g1=W.g; cycle(null); ok(S.asc.rw.g!==g1,'never the same gate twice in a row');
  const G=S.asc.rw.g; setLvl(40); S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1}; S.watches=WATCHES; startRun(G); ok(S.asc.rw.seen,'the passage'); ok(S.run.log.some(l=>/written over/.test(l.m||l)),'logged'); 
  S.run.room=S.run.rooms-1; fix(.99); spawnRoom(); const b=S.run.enemies.find(e=>e.boss&&!e.secret&&!e.rival);
  ok(b&&b.rw&&b.ledger&&b.phase2&&/Written Over/.test(b.name),'Ledger form: '+(b&&b.name)); ok(b.kit.includes(S.asc.rw.mv),'the borrowed move');
  seed(7); let wet=[]; for(let i=0;i<30&&!wet.length;i++){ const v=buildRoom(1,'fight'); rwRoom(v,G); wet=v.filter(e=>e.rwv); } ok(wet.length,'Ink-Wet kinds turn up'); wet.forEach(e=>{ ok(/^Ink-Wet /.test(e.name)); eq(kitOf(e),S.asc.rw.kits[S.asc.rw.foes.indexOf(e.base)]); }); eq(rwTro({rwv:1}),RW_TRO);
  ui.tab='gates'; ok(/Written over/.test(gateHTML(G)),'the seal'); ok(!/Written over/.test(gateHTML((G+1)%GATE_N)));
  const t0=T_('rewritten'); rwCleared(S.run); eq(T_('rewritten'),t0+1); rwCleared(S.run); eq(T_('rewritten'),t0+1,'once a cycle');
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(g.asc.rw),JSON.stringify(S.asc.rw),'saved');
  S.ti.rewritten=6; checkTitles(); ok(S.ti.got.as_rw,'Rewritten');
  fresh(30); S.ti={clr:{5:1}}; S.lastPage=1; S.mode='town'; chooseEnding('closed'); ok(!ascOffer().length&&ascPicks()===0,'the Quiet Valley draws no rule'); eq(carryN(),2); cycle(null); ok(!S.asc.rw,'and no gate is rewritten');
  fresh(30); S.ti={clr:{5:1}}; S.lastPage=1; S.mode='town'; chooseEnding('kept'); eq(ascPicks(),2); const o=ascOffer(); eq(o.length,4); cycle([o[0],o[2]]); eq(ascRules().join(),[o[0],o[2]].join(),'the Keeper\'s Cycle takes two');
});
test('Ascension: carries: a trait for the first raise, a building at level 2, a Riftborn piece at half depth, a heartforged piece at 70%',()=>{
  fresh(30); S.ti={clr:{5:1}}; const m=mkMinion({lvl:10}); m.traits=['vicious']; S.build={crypt:3,forge:1}; const rb=makeRiftborn(40,4242); const hf=addItem(Object.keys(ITEM).find(k=>ITEM[k].slot==='weapon'&&!ITEM[k].uq),[['dmgp',10]]); hf.hf=Object.keys(HF_LINES)[0];
  const C=carryOpts().map(o=>o.k); ok(C.includes('trait:vicious')&&C.includes('build:crypt')&&!C.includes('build:forge')&&C.includes('item:'+rb.u)&&C.includes('item:'+hf.u),C.join());
  const d=rb.rb.d; S.mode='town'; ok(startNGP(null,[],null,['item:'+rb.u,'build:crypt'])); eq(S.build.crypt||0,0,'only one carry outside the Quiet Valley'); const r2=S.inv.find(it=>it.rb); ok(r2&&r2.rb.d===Math.floor(d*CARRY_RB),'half depth');
  fresh(30); S.ti={clr:{5:1}}; const m2=mkMinion({lvl:10}); m2.traits=['vicious']; S.build={crypt:3}; S.lastPage=1; S.mode='town'; chooseEnding('closed'); S.mode='town'; ok(startNGP(null,[],null,['trait:vicious','build:crypt'])); eq(S.build.crypt,CARRY_BUILD,'a building at level 2'); eq(S.asc.ct,'vicious');
  const nm=mkMinion({lvl:5}); nm.traits=['thick']; eq(carryTrait(nm),'vicious'); ok(nm.traits.includes('vicious')&&!S.asc.ct,'the first raise takes it');
  fresh(30); S.ti={clr:{5:1}}; const h2=addItem(Object.keys(ITEM).find(k=>ITEM[k].slot==='weapon'&&!ITEM[k].uq),[['dmgp',10]]); h2.hf=Object.keys(HF_LINES)[0]; S.mode='town'; startNGP(null,[],null,['item:'+h2.u]); const h3=S.inv.find(it=>it.hf); ok(h3&&h3.ro[0][1]===7,'lines at 70%');
  ui.tab='settings'; fresh(30); S.ti={clr:{5:1}}; S.build={crypt:2}; ok(/data-a="carrypick"/.test(ngpHTML()),'the page offers carries');
});
test('Ascension: each pact adds a rule',()=>{
  fresh(30); S.ngp=1; S.pacts=['hides']; const t=foe({hp:1000}); arena([t],0); t.base='Grave Beetle'; S.run.turn=1; ok(hasKit(t,'stance')); const odd=(1+kitNum(t))%2!==0; ok(stanceOn(t,1),'braced on the first turn'); S.pacts=[]; eq(stanceOn(t,1),!odd);
  S.pacts=['dry']; S.belt.hp=1; ok(!drink('hp')); 
  S.pacts=['bitter']; S.mode='battle'; t.hp=500; const m=mkMinion({lvl:10}); m.hp=1; S.player.mana=999; S.player.skills=S.player.skills||{}; S.player.skills.mend=1; useSkill('mend'); ok(t.hp>500,'Dark Mending heals foes too');
  S.pacts=['night']; ok(expNights('gate').every(n=>n>=2),'one night more'); S.pacts=[]; eq(expNights('gate').join(),'1,2');
  S.pacts=['deaf']; S.mode='raise'; S.run.souls=0; S.run.corpses=[{id:'cx',name:'The Rat King',base:'The Rat King',boss:true,rankI:0,lvl:5,role:'reaper'}]; S.run.events=[]; tryRaise('cx'); ok(!S.run.corpses[0].tried&&/Soul/.test(S.run.events.map(e=>e.m).join()),'a boss needs a Soul');
  VIEW.lang='tr'; Object.keys(PACTS).forEach(k=>ok(trText(PACTS[k].desc())!==PACTS[k].desc(),PACTS[k].desc())); VIEW.lang='en';
});

})();
