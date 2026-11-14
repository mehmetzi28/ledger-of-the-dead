// Omen days, Codex search, secret-master hints, new-record flashes and the newest tips.
(function(){
const {test,ok,eq,fix,setLvl,foe,arena,renderAll,wonRoom}=window.LOTD_T;
test('Omens: none before a first clear; a quarter of dawns after; each one does what it says',()=>{
  S.omen=undefined; delete S.omen; S.ti=S.ti||{}; S.ti.clr={}; fix(0); eq(omen(),null,'no omens before a clear');
  S.omen=undefined; delete S.omen; S.ti.clr={0:1}; fix(.9); eq(omen(),null); S.day++; fix(.1); ok(OMENS[omen()],'an omen'); const id=omen(); fix(.99); eq(omen(),id,'it lasts the day');
  S.omen={day:S.day,id:'bloodmoon'}; eq(eliteChance(),.2); S.omen.id=null; eq(eliteChance(),.1);
  setLvl(20); const c={rankI:0,lvl:1,boss:false,elite:false}; S.player.stats.will=0; const r0=raiseChance(c); S.omen.id='paletide'; eq(raiseChance(c),Math.min(RAISE_MAX,r0+OMEN_RAISE));
  S.omen.id=null; const b=foe({boss:true,lvl:10}), x0=killXp(b); S.omen.id='ashfall'; ok(Math.abs(killXp(b)-x0*OMEN_BOSS_XP)<=1,'bosses pay more');
  eq(normalizeSave({v:2,player:{lvl:5},omen:{day:3,id:'bogus'}}).omen,undefined); eq(normalizeSave({v:2,player:{lvl:5},omen:{day:3,id:'ashfall'}}).omen.id,'ashfall');
});
test('Omens: shown above the gates and in the Codex',()=>{
  S.mode='town'; S.ti=S.ti||{}; S.ti.clr={0:1}; S.omen={day:S.day,id:'paletide'}; ui.tab='gates'; ok(/omen-line[\s\S]*Pale Tide/.test(renderAll('gates omen')));
  ui.tab='codex'; ui.cx='omens'; const h=renderAll('cx omens'); ok(h.includes('Blood Moon')&&h.includes('Ashfall')&&/Today/.test(h));
  S.omen.id=null; ui.tab='gates'; ok(!renderAll('no omen').includes('omen-line'));
});
test('Codex search: finds rows and paragraphs on every page, groups them, and clears',()=>{
  S.mode='town'; ui.tab='codex'; ui.cx='basics'; ui.cxq='lifedrain'; let h=renderAll('search');
  ok(/match/.test(h)&&h.includes('Unique powers')&&h.includes('Lifedrain'),'finds the unique power'); ok(!h.includes('cx-nav'),'pages hidden while searching');
  ui.cxq='zzqx'; h=renderAll('none'); ok(/Nothing in the Codex mentions/.test(h)); ui.cxq='a'; ok(renderAll('short').includes('cx-nav'),'one letter is not a search');
  ACTIONS.cxclear(); eq(ui.cxq,''); ui.cxq='<b>"'; ok(!renderAll('escape').includes('value="<b>'),'the box escapes what you type'); ui.cxq='';
});
test('Secret hints: after ten clears of a gate a torn page hints at its master, never naming it, and stops once met',()=>{
  setLvl(30); S.ti=S.ti||{}; S.ti.clrN0=SECRET_HINT-1; S.kills={}; S.watches=3; startRun(0); S.run.room=3; S.run.enemies=[foe({hp:0,dead:true})]; S.notices=[]; roomWon();
  ok(S.notices.some(n=>n.m.includes(SECRET[0].hint)),'torn page'); ok(!S.notices.some(n=>n.m.includes(SECRET[0].name)),'no name'); returnTown();
  S.mode='town'; ui.tab='codex'; ui.cx='gates'; ok(renderAll('hint').includes(SECRET[0].hint)); S.kills[SECRET[0].name]=1; S.notices=[]; ok(!renderAll('met').includes(SECRET[0].hint),'gone once met');
  SECRET.forEach(B=>{ ok(B.hint&&!B.hint.includes(B.name.replace(/^The /,'')),B.name+' hint keeps the secret'); });
});
test('Records: beating a record flashes once a run; a first record stays quiet',()=>{
  setLvl(30); S.rec={}; MOMENTS.length=0; const t=foe({hp:1e7}); arena([t]); hurtFoe(t,100); eq(MOMENTS.length,0,'first record is quiet');
  hurtFoe(t,200); ok(MOMENTS.some(m=>/New record: biggest hit, 200/.test(m.t))); MOMENTS.length=0; hurtFoe(t,300); eq(MOMENTS.length,0,'once per run'); eq(S.rec.hit.v,300); flee();
  S.rec.fast={0:{t:30,day:1}}; MOMENTS.length=0; S.watches=3; startRun(0); S.run.tt=12; S.run.cleared=true; returnTown(); ok(MOMENTS.some(m=>/Rat Warren in 12 turns/.test(m.t)));
});
test('Tips: full devotion, Records, Nightmare and omens',()=>{
  const tip=id=>TIPS.find(t=>t.id===id); S.mode='town';
  ok(tip('bless')&&tip('records')&&tip('nightmare')&&tip('omen'));
  S.runs=9; ok(!tip('records').when()); S.runs=10; ok(tip('records').when());
  S.ti=S.ti||{}; S.ti.clr={0:1}; S.heatMax={}; ok(!tip('nightmare').when()); S.heatMax={0:2}; ok(tip('nightmare').when());
  S.omen={day:S.day,id:null}; ok(!tip('omen').when()); S.omen.id='ashfall'; ok(tip('omen').when());
  setLvl(30); S.gold=1e6; delete S.faith; ok(!tip('bless').when()); swear('dis'); ok(!tip('bless').when()); S.faith.day=S.day-DEVOTION[2]; ok(tip('bless').when());
});
})();
