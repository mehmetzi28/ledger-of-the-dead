// Expeditions: targets, nights, the three steps, spoils carried home, the dawn choice and road events (src/game-exp.js, R6).
(function(){
const {test,ok,eq,near,fresh,setLvl,fix,seq,mkMinion,renderAll,invariants}=window.LOTD_T;
const cmdr=o=>mkMinion(Object.assign({elite:true,traits:['commander'],lvl:20,rankI:2,role:'vanguard'},o));
const war=lv=>{ fresh(lv||30); S.mode='town'; S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1}; S.watches=WATCHES; return S; };
const squad=()=>{ const c=cmdr(), s=mkMinion({lvl:20,role:'striker'}), m=mkMinion({lvl:20,role:'mender'}); return [c,s,m]; };
const out=(units,t,nights,o)=>Object.assign({cu:units[0].uid,units,t,nights:nights||1,night:0,odds:.6},o||{});

test('Expeditions: the War table offers gates, today\'s cursed gate, a Tower band, hunts for mastered kinds and a scavenge',()=>{
  war(30); const T=expTargets(); eq(T.filter(t=>t.k==='gate').length,raidGates().length); ok(T.some(t=>t.k==='scav')); ok(!T.some(t=>t.k==='band'),'no band before floor '+EXP_BAND_AT); ok(!T.some(t=>t.k==='hunt'),'no mastery, no hunt');
  S.tower=S.tower||{}; S.tower.best=45; const b=expTargets().find(t=>t.k==='band'); ok(b); eq(b.f,30,'the band below your best'); eq(expNights('band').join(),'2');
  const kind=DUNGEONS[0].mobs[0][0]; S.kills[kind]=1e5; ok(expTargets().some(t=>t.k==='hunt'&&t.kind===kind),'a hunt once mastered');
  ok(tValid({k:'gate',di:0})); ok(!tValid({k:'gate',di:5}),'an uncleared gate'); ok(!tValid({k:'band',di:5,f:90}),'a band you have not reached'); ok(!tValid({k:'nope',di:0}));
  eq(tName({k:'gate',di:0}),'the '+DUNGEONS[0].name); ok(/^a hunt for /.test(tName({k:'hunt',di:0,kind})));
});
test('Expeditions: each step is the cube root of the odds, then its cover; the risky path skips the Approach, a scavenge the Fight',()=>{
  war(30); const [c,s,m]=squad(), t={k:'gate',di:1}, b=Math.cbrt(.6), o={odds:.6};
  let p=expOdds([c,s,m],t,o); near(p.approach,b,1e-9); near(p.haul,b,1e-9); ok(p.fight>b-1e-9,'a striker covers the Fight');
  c.role='striker'; p=expOdds([c,s,m],t,o); near(p.approach,b-EXP_NO_VAN,1e-9,'no vanguard'); c.role='vanguard';
  s.role='mender'; p=expOdds([c,s,m],t,o); ok(p.fight<b-EXP_NO_FIGHT+EXP_FIGHT_MAX+1e-9&&p.fight<b,'no striker or reaper'); s.role='striker';
  eq(expOdds([c,s,m],t,Object.assign({risky:1},o)).approach,1); eq(expOdds([c,s,m],{k:'scav',di:1},o).fight,1);
  near(expOdds([c,s,m],{k:'curse',di:1},o).haul,b-EXP_CURSE,1e-9,'a cursed gate is harder'); near(expOdds([c,s,m],t,Object.assign({pressed:2},o)).haul,b-2*EXP_PRESS,1e-9,'pressing on');
  const lo=expOdds([c,s,m],t,{odds:.0001}); ok(lo.haul>=EXP_STEP_MIN&&lo.approach>=EXP_STEP_MIN,'clamped');
  const q=expOdds([c,s,m],t,o); near(expNightOdds([c,s,m],t,o),q.approach*q.fight*q.haul,1e-9);
});
test('Expeditions: a failed Approach loses the night and nothing else; a failed Fight costs followers, the Commander shielding the first once',()=>{
  war(30); let [c,s,m]=squad(); const g0=S.gold; S.army=[]; seq([.999],0); let r=resolveRaid(out([c,s,m],{k:'gate',di:1}));
  ok(r.home); eq(r.won,false); eq(r.lost,0,'no losses on a failed Approach'); eq(S.gold,g0,'no spoils'); eq(S.army.length,3,'everyone home');
  war(30); [c,s,m]=squad(); S.army=[]; seq([0,.999,0,0],0); const x=out([c,s,m],{k:'gate',di:1}); r=resolveRaid(x); eq(r.lost,1,'one falls, the other is shielded'); eq(x.saved,1);
  war(30); [c,s,m]=squad(); S.army=[]; s.atk=1; seq([.999],0); const y=out([c,s,m],{k:'gate',di:1},2,{pick:'risky',night:1,won:1,pressed:1,sp:{g:10,items:[],tro:{},dust:0}}); r=resolveRaid(y); eq(r.lost,1); ok(!S.army.includes(s)&&!y.units.includes(s),'the risky path takes the weakest outright');
  invariants('expedition losses');
});
test('Expeditions: two nights carry spoils home; pressing on pays more; the dawn choice brings a squad home with what it carries',()=>{
  war(30); const [c,s,m]=squad(); ok(sendRaid(c.uid,1,[s.uid,m.uid],{k:'gate',di:1},2)); eq(S.raidOrders[0].nights,2); marchRaids(); eq(S.raids.length,1);
  fix(0); resolveRaids(); eq(S.raids.length,1,'still out after night 1'); const x=S.raids[0]; eq(x.night,1); ok(x.sp.g>0,'carrying'); eq(expOut().length,1); ok(/data-a="expc"/.test((ui.tab='gates',ui.gsub='war',renderAll('war'))),'the dawn buttons');
  const g1=x.sp.g, g0=S.gold; ok(expChoose(0,'home')); eq(S.raids.length,0); eq(S.gold-g0,g1,'banked at once'); ok(!expChoose(0,'press'),'nothing left out');
  war(30); const u=squad(); S.army=[]; fix(0); const y=out(u,{k:'gate',di:1},2); resolveRaid(y); const one=y.sp.g; resolveRaid(y); ok(y.sp.g>=one*2.4,'the pressed night pays +50%'); eq(T_('expLong'),1,'Long Road counted'); eq(T_('expClean'),1);
  ok(!expChoose(0,'nope'));
});
test('Expeditions: no mender halves each night\'s take; a failed Haul halves what is carried',()=>{
  const take=(roles,rolls)=>{ war(30); const c=cmdr(), a=mkMinion({lvl:20,role:roles[0]}); S.army=[]; seq(rolls,0); const x=out([c,a],{k:'gate',di:1},2,{night:1,won:1,pressed:1,sp:{g:1000,items:[],tro:{},dust:0}}); expNight(x); return x.sp.g; };
  const full=take(['mender'],[0,0,0,1,1]), noM=take(['striker'],[0,0,0,1,1]), hf=take(['mender'],[0,0,.999,1,1]);
  ok(noM<full,'no mender: less'); ok(hf<full&&hf<1000+ (full-1000),'a failed Haul halves the 1000 carried'); ok(hf>=500,'half of it is kept');
});
test('Expeditions: hunts bring trophies, a band Tower trophies, a scavenge bone dust; the Codex states the rules',()=>{
  war(40); const kind=DUNGEONS[0].mobs[0][0]; S.kills[kind]=1e5; const x={t:{k:'hunt',di:0,kind},units:squad()}; fix(.5); const sp=expSpoils(x,1); eq(sp.tro[kind],EXP_HUNT_TRO); eq(sp.items.length,0);
  const sc=expSpoils({t:{k:'scav',di:1},units:x.units},1); ok(sc.dust>0&&!sc.g); const bd=expSpoils({t:{k:'band',di:5,f:20},units:x.units},1); ok(Object.keys(bd.tro).every(k=>/^[tb]:/.test(k)));
  const h=window.LOTD_T.cdx('raids'); ok(/three steps/.test(h)&&/risky path/.test(h)&&/Rally/.test(h)&&/hunt for a kind you have mastered/.test(h));
});
test('Expeditions: one night in ten brings a road event: a patrol, an old camp or another keeper\'s squad',()=>{
  war(30); const u=squad(); S.army=[]; seq([0,0,0,0,.5],0); const x=out(u,{k:'gate',di:1},2); const r=expNight(x); ok(r.ev&&['patrol','camp','keeper'].includes(r.ev),'an event'); ok(typeof r.evm==='string'&&r.evm.length>10);
  war(30); const v=squad(); S.army=[]; let n=0; for(let i=0;i<5;i++){ seq([0,0,0,.99],0); const y=out(v,{k:'gate',di:1}); y.units=v.slice(); if(expNight(y).ev) n++; } eq(n,0,'none above '+EXP_EVENT);
  war(30); const w=squad(); S.army=[]; const camp=out(w,{k:'gate',di:1},2); fix(0); for(let i=0;i<40&&!(camp.log||[]).some(r=>r.ev==='camp');i++){ camp.night=0; camp.units=w.slice(); camp.sp={g:0,items:[],tro:{},dust:0}; Math.random=(()=>{ let k=0; const L=[0,0,0,0,(i%3)/3+.01]; return ()=>k<L.length?L[k++]:0; })(); expNight(camp); }
  ok((camp.log||[]).some(r=>r.ev==='camp'),'an old camp turns up'); ok(camp.sp.dust>0,'its bone dust is carried');
});
test('Expeditions: saves keep squads in the field and fix bad ones; old raids become one-night gate expeditions',()=>{
  war(30); const u=squad(); S.army=u.slice(); ok(sendRaid(u[0].uid,1,[u[1].uid],{k:'gate',di:1},2)); marchRaids(); fix(0); resolveRaids();
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.raids.length,1); eq(g.raids[0].nights,2); eq(g.raids[0].night,1); eq(g.raids[0].t.k,'gate'); eq(g.raids[0].sp.g,S.raids[0].sp.g);
  const f=expFix({di:2}); eq(f.t.k,'gate'); eq(f.t.di,2); eq(f.nights,1);
  const h=expFix({t:{k:'hunt',di:0,kind:'Nobody'},nights:9,night:-4,sp:{g:'x',items:['nope'],tro:{zz:3},dust:-1},log:[null,{n:'2',roll:{fight:1,bogus:1},lost:[5]}]}); eq(h.t.k,'gate','an unknown kind'); eq(h.nights,1); eq(h.night,0); eq(h.sp.g,0); eq(h.sp.items.length,0); eq(Object.keys(h.sp.tro).length,0); eq(h.log.length,1); eq(Object.keys(h.log[0].roll).join(),'fight');
  eq(JSON.stringify(expOrderFix({t:{k:'band',di:5,f:37},nights:1})),JSON.stringify({t:{k:'band',di:5,f:30},nights:2}));
});
test('Expeditions: the War table picks targets and nights; Turkish for the new words',()=>{
  war(30); const u=squad(); S.army=u.slice(); S.tower=S.tower||{}; S.tower.best=30; ui.tab='gates'; ui.gsub='war'; let h=renderAll('war table');
  ok(/data-a="rtgt"/.test(h)&&/data-a="rnight"/.test(h)&&/Approach \d+%/.test(h)); ACTIONS.rtgt('band:5:20:'); eq(ui.rt,'band:5:20:'); h=renderAll('band'); ok(/Send on Tower floors 20-29/.test(h));
  ACTIONS.rtgt('gate:1:0:'); ACTIONS.rnight('2'); eq(ui.rn,2); ui.rsq=[u[1].uid]; ACTIONS.raid(); eq((S.raidOrders||[]).length,1); eq(S.raidOrders[0].nights,2);
  VIEW.lang='tr'; try{ ['Press on','Risky path','Come home','Last expeditions','Approach held','Haul failed','Long Road','Rally your dead 100 times.','Mn1 is back from the Rat Warren with nothing.','An old camp on the road: 20 bone dust in its ashes.'].forEach(s=>ok(trText(s)!==s,'untranslated: '+s)); } finally { VIEW.lang='en'; }
});
})();
