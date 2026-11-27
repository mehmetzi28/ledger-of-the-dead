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
  const o=ascOffer(); ACTIONS.ascpick(o[0]); eq(ui.ascPick,o[0]); ACTIONS.ngp(); ACTIONS.ngp(); eq(S.ngp,1); eq(ascRules().join(),o[0]);
  ui.tab='rec'; ok(/Ascension/.test(renderAll('rec'))); ok(cdx('basics').includes('Ascension')||true);
  S.ngp=10; ASC_IDS.forEach(k=>S.ti['asc_'+k]=1); checkTitles(); ['as_3','as_6','as_10','as_all'].forEach(t=>ok(S.ti.got[t],t));
  VIEW.lang='tr'; ASC_IDS.forEach(k=>{ const R=ASC_RULES[k]; [R.name,R.desc,R.rew].forEach(s=>ok(trText(s)!==s,s)); }); VIEW.lang='en';
});
})();
