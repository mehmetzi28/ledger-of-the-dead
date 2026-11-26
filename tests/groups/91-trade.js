// Commissions and the black market (src/game-brew.js, R4 PR B).
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,renderAll}=window.LOTD_T;
const town=d=>{ fresh(40); S.mode='town'; S.day=d||8; S.gold=1e5; S.dust=100; S.build={crypt:1,forge:1,ossuary:1,altar:1}; return S; };

test('Commissions: three a week, new each week, valid orders only',()=>{
  town(8); const a=commissions(); eq(a.length,COMM_N); a.forEach(c=>ok(['tro','hf','min'].includes(c.k))); eq(S.comm.week,weekOf(8));
  S.day=13; ok(commissions()===a,'the same week'); S.day=15; ok(commissions()!==a,'a new week'); eq(S.comm.week,weekOf(15));
  for(let i=0;i<30;i++){ S.comm=null; commissions().forEach(c=>{ if(c.k==='tro'){ ok(c.g<=topGate()&&c.n>=4&&c.n<=8); ok(DUNGEONS[c.g].mobs.some(m=>m[1]===c.role),'the gate has that role'); } if(c.k==='hf') ok(T_('heartforged')>0); }); }
});
test('Commissions: a trophy order takes the parts and pays more than selling them; a filled one cannot be filled twice',()=>{
  town(8); S.comm={week:weekOf(8),list:[{k:'tro',role:'striker',g:0,n:4}]}; const ks=Object.keys(TROPHY).filter(k=>!k.startsWith('b:')&&TROPHY[k].role==='striker'&&trophyGate(k)===0); ok(ks.length>0);
  S.trophies={}; S.trophies[ks[0]]=3; ok(!commCan(0),'three is not four'); S.trophies[ks[0]]=5; const g=S.gold, d=S.dust, p=commFill(0); ok(p); eq(S.gold-g,p.g); eq(S.dust-d,p.d); eq(S.trophies[ks[0]],1);
  ok(p.g>4*TROPHY[ks[0]].value*2,'pays well over the price'); ok(!commFill(0),'once'); eq(T_('commissions'),1);
});
test('Commissions: a heartforged piece or a grown minion can be handed over',()=>{
  town(8); const it=addItem(Object.values(ITEM).find(d=>!d.uq&&d.slot==='armor').id); it.hf='The Rat King'; S.comm={week:weekOf(8),list:[{k:'hf',slot:'armor'},{k:'min',role:'striker',st:1}]};
  ok(commFill(0)); ok(!S.inv.includes(it),'the piece goes'); const m=mkMinion({lvl:20,role:'striker'}); m.stage=0; ok(!commCan(1),'not grown'); m.stage=1; const n=S.army.length; ok(commFill(1)); eq(S.army.length,n-1);
  const g=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{comm:{week:1,list:[{k:'tro',role:'x',g:0,n:4},{k:'hf',slot:'armor'},{k:'nope'}]}})))); eq(g.comm.list.length,1);
});
test('Black market: open every seventh day; each trade is exact and once a week',()=>{
  town(6); ok(!bmOpen()); S.day=7; ok(bmOpen()); S.day=13; ok(!bmOpen()); S.day=14; ok(bmOpen());
  const c=Object.keys(TROPHY).filter(k=>!k.startsWith('b:')&&!k.startsWith('t:')&&trophyGate(k)>=2); S.trophies={}; S.trophies[c[0]]=BM_DUST_TRO+2; const d=S.dust; ok(bmTrade('dust')); eq(S.dust-d,BM_DUST); eq(S.trophies[c[0]],2); ok(!bmTrade('dust'),'once a week');
  S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1}; S.trophies['b:The Rat King']=3; const key='b:'+DUNGEONS[2].boss[0]; ok(bmTrade('heart')); ok(!S.trophies['b:The Rat King']); eq(S.trophies[key],1);
  S.tower.best=30; const tk=Object.keys(TROPHY).filter(k=>k.startsWith('t:')); S.trophies[tk[0]]=BM_TW; ok(bmTrade('warden')); eq(S.trophies['b:'+TW_BOSS[2]],1); ok(!S.trophies[tk[0]]);
  S.trophies['b:'+SECRET[0].name]=1; const n=S.inv.length; ok(bmTrade('piece','relic')); eq(S.inv.length,n+1); eq(ITEM[S.inv[n].id].slot,'relic');
  const g=S.gold; ok(bmTrade('soul')); eq(g-S.gold,BM_SOUL_GOLD); ok(S.prep.soul); S.watches=WATCHES; setLvl(30); startRun(0); eq(S.run.souls,1); ok(!S.prep.soul,'spent');
  S.mode='town'; S.run=null; S.day=21; ok(!bmUsed('dust'),'a new week');
});
test('Trade: the board, the stall, the Codex and Turkish',()=>{
  town(7); S.comm=null; ui.tab='gates'; let h=renderAll('board'); ok(/Commissions/.test(h)); ui.tab='market'; ui.mk='bm'; h=renderAll('bm'); ok(/data-a="bmt"/.test(h));
  S.day=8; h=renderAll('shut'); ok(/The stall is shut/.test(h)&&/day 14/.test(h));
  const c=codexSection('trade'); ok(c.includes('Black market')&&c.includes('Commissions')); const s=codexSection('supplies'); ok(s.includes('Iron Draught')&&s.includes('Second Draft'));
  VIEW.lang='tr'; Object.values(BM_TRADES).forEach(T=>ok(trText(T.name)!==T.name,T.name)); commissions().forEach(x=>ok(trText(commTxt(x))!==commTxt(x),commTxt(x))); VIEW.lang='en';
});
})();
