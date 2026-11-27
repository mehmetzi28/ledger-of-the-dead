// Corruption and the phylactery, R21 PR A (src/game-phyl.js, src/ui-panels.js): the meter and what moves it, binding at
// level 30 and corruption 25, Death's Door once a day, the floor, shattering at the Temple, the other edge (50, 75, 100), the save.
(function(){
const {test,ok,eq,fresh,arena,foe,renderAll,invariants,canon}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const base=(lv)=>{ fresh(lv||30); S.mode='town'; S.run=null; S.watches=WATCHES; S.gold=1e6; S.notices=[]; S.player.corr=0; delete S.player.phyl; delete S.player.named; delete S.player.hunP; delete S.player.hun; S.dread=DREAD_START; };
const rm=()=>({room:0,log:[],events:[],enemies:[]});
const res=(nick)=>({uid:++S.uid,nick,name:'Tunnel Rat',kind:'Tunnel Rat',role:'striker',rankI:0,lvl:3,xp:0,hf:1,af:1,hp:10,maxHp:10,atk:2,traits:[],stage:0});

test('Corruption: clamped to 0..100, five bands, a new band is announced; nothing moves while it is off',()=>{
  base(); eq(corrBand().name,'Clean'); corrAdd(500); eq(corr(),100); eq(corrBand().name,'Named'); corrAdd(-500); eq(corr(),0);
  S.notices=[]; S.player.corr=24; corrAdd(1,'a test'); ok(S.notices.some(n=>/^Corruption 25: Stained \(a test\)/.test(n.m)),'announced');
  eq(CORR_BANDS.map(b=>b.min).join(),'0,25,50,75,100');
  PHYL_ON=false; try{ eq(corrAdd(10),0); eq(corr(),0,'reads 0 while off'); ok(!phylCan()); } finally { PHYL_ON=true; }
});
test('Corruption rises with dark power: a boss raised, Corpse Explosion, Reap, Execute, the altar, a broken shrine, an Eternal, a raid, a Terror day',()=>{
  base(); corrRaised({boss:true}); eq(corr(),CORR_BOSS); corrRaised({boss:false}); eq(corr(),CORR_BOSS,'an ordinary raise adds nothing'); eq(S.player.rday,S.day,'but counts as raising today');
  S.player.corr=0; corrSkill('blast'); corrSkill('reap'); corrSkill('spear'); eq(corr(),.4); corrExec(); eq(corr(),CORR_DARK_DAY,'the order, up to the cap'); for(let i=0;i<20;i++) corrSkill('reap'); eq(corr(),CORR_DARK_DAY,'at most the cap a day'); S.day++; corrSkill('reap'); eq(corr(),CORR_DARK_DAY+CORR_DARK,'a new day');
  S.player.corr=0; corrAltar(); corrEternal(); corrRaid(); eq(corr(),CORR_ALTAR+CORR_ETERNAL+CORR_RAID);
  // the hooks are wired into the systems they name
  ok(/corrRaised\(c\)/.test(String(tryRaise)),'tryRaise'); ok(/corrSkill\(id\)/.test(String(useSkill)),'useSkill'); ok(/corrRaid\(\)/.test(String(raidWon)),'raidWon'); ok(/corrAltar/.test(String(siteChoice)),'desecrate');
  base(); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1}; S.build=Object.assign({crypt:1,forge:1},S.build||{}); ok(dreadOn(),'sieges open'); S.dread=95; S.player.rday=S.day; S.day++; S.player.rday=S.day-1; corrDawn(); eq(corr(),CORR_TERROR,'a day at Terror');
});
test('Corruption falls with restraint: a day without raising, the dead buried, the Memorial honoured, Morrow or the Choir at rank 5',()=>{
  base(); S.player.corr=40; S.player.rday=S.day; S.day++; corrDawn(); eq(corr(),40,'raised yesterday'); S.day++; corrDawn(); eq(corr(),40-CORR_CLEAN,'a clean day');
  S.player.corr=40; corrBury(4); eq(corr(),40-4*CORR_BURY); corrMem(); eq(corr(),40-4*CORR_BURY-CORR_MEM);
  ok(/corrBury/.test(String(buryField)),'buryField'); ok(/corrMem\(\)/.test(String(honour)),'honour');
  for(const g of ['hon','choir','ulm','dis']){ S.faith={id:g,dev:1e6,dd:0,dday:0,vb:0,cv:0}; S.player.corr=40; S.player.rday=S.day; S.day++; corrDawn(); eq(corr(),g==='hon'||g==='choir'?40-CORR_GOD:40,g); }
});
test('The phylactery: offered at level 30 and corruption 25, three vessels, binding sets the floor at 25',()=>{
  base(29); S.player.corr=30; ok(!phylCan(),'level 29'); base(30); S.player.corr=24; ok(!phylCan(),'corruption 24'); S.player.corr=25; ok(phylCan());
  ui.tab='hero'; let h=renderAll('offer'); ok(h.includes('data-a="phylbind"'),'the offer shows'); eq(VESSEL_IDS.length,3);
  ok(!phylBind('nope'),'a real vessel'); ok(phylBind('lantern')); ok(phylOn()); eq(S.player.phyl.v,'lantern'); ok(!phylCan(),'once'); ok(S.story.phyl_bound!=null,'The vessel');
  corrAdd(-100); eq(corr(),PHYL_FLOOR,'the floor'); h=renderAll('bound'); ok(h.includes('A skull lantern'),'the vessel on the card'); ok(!h.includes('data-a="phylbind"'));
});
test('Death\'s Door: once a day a killing blow leaves the hero at 1 HP; the vessel mends at dawn',()=>{
  base(); S.player.corr=30; phylBind('ring'); arena([foe({hp:1e6})]); const P=S.player; P.hp=0; ok(!playerFalls(),'held'); eq(P.hp,1); eq(S.player.phyl.cr,1); eq(T_('door'),1);
  P.hp=0; ok(playerFalls(),'only once a day'); eq(S.mode,'defeat');
  S.mode='town'; S.run=null; S.day++; corrDawn(); eq(S.player.phyl.cr,0,'mended');
  base(); arena([foe({hp:1e6})]); S.player.hp=0; ok(playerFalls(),'unbound: no door');
});
test('Shattering at the Temple: 20,000 gold, corruption to 0, the vessel and the name gone, Mortal Again',()=>{
  base(); S.player.corr=60; phylBind('clasp'); S.player.named=1; S.build=Object.assign({},S.build,{temple:0}); ok(!phylShatterReady(),'needs the Temple');
  S.build.temple=1; S.gold=PHYL_SHATTER-1; ok(!phylShatter(),'needs the gold'); S.gold=PHYL_SHATTER; ok(phylShatter()); eq(S.gold,0); eq(corr(),0); ok(!phylOn()); ok(!S.player.named);
  checkTitles(); ok(S.ti.got.ph_mortal,'Mortal Again');
  ok(CONFIRM_ACTS.includes('phylshatter'),'two presses');
});
test('Corruption 50: one more foe each siege wave, the villages cool a step a day',()=>{
  base(); S.run=rm(); const L=()=>[{id:'a',name:'Militia Spearman',role:'striker',boss:false,hp:10,maxHp:10,atk:2},{id:'b',name:'Captain',role:'vanguard',boss:true,hp:100,maxHp:100,atk:10}];
  let l=L(); S.player.corr=49; phylWave(l,S.run); eq(l.length,2); S.player.corr=50; l=L(); phylWave(l,S.run); eq(l.length,3); ok(l[2].id!=='a'&&!l[2].boss,'a new foe');
  ok(/phylWave\(list,r\)/.test(String(townSiegeWave)),'every wave');
  vilAll(); const st=vilSt('mill'); S.player.rday=S.day; S.day++; S.player.rday=S.day-1; corrDawn(); eq(vilSt('mill'),st-1);
});
test('Corruption 75: the Hunger at dawn asks for a Reserve minion (+5% damage) or takes 5% max HP; it lapses and a run refuses it',()=>{
  base(); S.player.corr=80; let n=0; for(let i=0;i<400;i++){ delete S.player.hunP; S.player.rday=S.day; S.day++; S.player.rday=S.day-1; S.player.corr=80; corrDawn(); if(S.player.hunP===S.day) n++; } ok(n>15&&n<70,'about one dawn in ten: '+n);
  S.player.hunP=S.day; S.reserve=[]; ok(hungerOpen()); eq(hungerAnswer(true),null,'nothing to give'); const m=res('Bob'); S.reserve=[m];
  const d0=dmgMul(); ok(/Bob/.test(hungerAnswer(true))); eq(S.reserve.length,0); ok(Math.abs(dmgMul()/d0-1.05)<1e-9,'+5% damage'); ok(!hungerOpen());
  delete S.player.hun; const h0=pMax(); S.player.hunP=S.day; hungerAnswer(false); eq(pMax(),Math.round(h0*.95)||pMax(),'-5% HP'); ok(pMax()<h0);
  S.day++; eq(pMax(),h0,'until dawn');
  S.player.hunP=S.day; hungerLeave(); eq(S.player.hun.k,'hp','a run refuses'); S.player.hunP=S.day-1; S.player.corr=0; corrDawn(); ok(!S.player.hunP,'an old one lapses');
});
test('Corruption 100: named for good; siege captains come harder; the Hunger reads your own echo once',()=>{
  base(); S.notices=[]; corrAdd(100); ok(S.player.named); ok(S.story.phyl_named!=null); corrAdd(-60); ok(S.player.named,'stays named');
  S.run=rm(); const b={id:'b',name:'Captain',role:'vanguard',boss:true,hp:100,maxHp:100,atk:10}; phylWave([b],S.run); eq(b.maxHp,Math.round(100*NAMED_BOSS));
  ok(/phylEcho\(e\)/.test(String(callEchoes)),'callEchoes');
});
test('New Game+ keeps the soul bound at the floor; the save repairs bad state; Turkish, the Codex, the tip and the title',()=>{
  base(); S.player.corr=70; phylBind('ring'); const old=S.player; S.player={lvl:1}; phylNgp(old); eq(S.player.phyl.v,'ring'); eq(S.player.corr,PHYL_FLOOR); S.player=old;
  const P={corr:'x',phyl:{v:'bad'},named:'yes',hunP:-1,hun:{d:'z'}}; phylFix(P); eq(P.corr,0); ok(!P.phyl); eq(P.named,1); ok(!('hunP' in P)); ok(!P.hun);
  const Q={corr:3,phyl:{v:'clasp',cr:5}}; phylFix(Q); eq(Q.corr,PHYL_FLOOR,'the floor holds in a save'); eq(Q.phyl.cr,1);
  const s=canon(); const g=normalizeSave(JSON.parse(JSON.stringify(S))); ok(g&&g.player.phyl&&g.player.phyl.v==='ring','round trip');
  ok(tr('Corruption 30: Stained (a boss raised)').startsWith('Yozlaşma 30'),'tr band'); ok(tr('Mortal Again')!=='Mortal Again'); ok(tr('The phylactery')!=='The phylactery');
  ok(CODEX.some(t=>t[0]==='phyl'),'Codex tab'); ok(cxPhylHTML().includes('What raises it')); ok(TIPS.some(t=>t.id==='phyl')); eq(TITLE.ph_mortal.r,4);
  invariants();
});
})();
