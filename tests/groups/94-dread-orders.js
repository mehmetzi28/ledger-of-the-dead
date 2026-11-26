// The town's dread, daily orders, upkeep and the Bell Tower's wall defenses (src/game-dread.js, R5 PR B).
(function(){
const {test,ok,eq,near,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wonRoom,fix,renderAll,invariants}=window.LOTD_T;
const town=(lv,b)=>{ fresh(lv||30); S.mode='town'; S.gold=1e6; S.dust=1e4; S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1}; S.build=Object.assign({crypt:1,forge:1},b||{}); S.watches=WATCHES; S.dread=DREAD_START; return S; };
const band=d=>{ S.dread=d; return dreadBand().id; };

test('Dread: asleep until the sieges begin, then moved by what you do, clamped to 0-100',()=>{
  fresh(10); S.build={}; ok(!dreadOn()); eq(dread(10),0); eq(dreadOf(),DREAD_START); eq(dreadBand().id,'uneasy','no band effects yet');
  town(30); ok(dreadOn()); const c=corpse({}); raiseScene([c],30); fix(0); S.dread=30; tryRaise(c.id); near(dreadOf(),30+DREAD_RAISE,1e-9,'a raise in the gates');
  S.mode='town'; S.run=null; S.dread=30; build('ossuary'); eq(dreadOf(),30+DREAD_BUILD,'a new level');
  S.dread=30; townSiegeWon({fallen:[],corpses:[],events:[]}); eq(dreadOf(),30-DREAD_SIEGE_WON); S.build.bell=5; S.spec={bell:{5:'a'}}; S.dread=30; townSiegeWon({fallen:[],corpses:[],events:[]}); eq(dreadOf(),30-2*DREAD_SIEGE_WON,'Toll of the Dead');
  S.dread=30; S.siege=S.siege||{}; siegeLost(true); eq(dreadOf(),30+DREAD_SIEGE_LOST);
  S.dread=99; dread(50); eq(dreadOf(),100); dread(-500); eq(dreadOf(),0);
  S.dread=30; S.mode='town'; S.gold=1e5; const g=S.gold, t=titheCost(); eq(payTithe(),t); eq(g-S.gold,Math.round(1e5*TITHE_K)); eq(dreadOf(),30-DREAD_TITHE); eq(payTithe(),0,'once a day');
});
test('Dread: drifts toward 40 at dawn and announces a new band',()=>{
  town(30); S.dread=30; dreadDawn(); eq(dreadOf(),31); S.dread=60; dreadDawn(); eq(dreadOf(),59); S.dread=40; dreadDawn(); eq(dreadOf(),40);
  S.notices=[]; S.dread=49.5; dread(1); ok(S.notices.some(n=>/The town is afraid now/.test(n.m)),'a band notice'); eq(T_('band_afraid'),1);
  eq(band(0),'calm'); eq(band(19.9),'calm'); eq(band(20),'uneasy'); eq(band(50),'afraid'); eq(band(80),'terror'); eq(band(100),'terror');
});
test('Dread bands: prices, siege gaps, wave strength and pay; Terror shuts the black market and brings two elites',()=>{
  town(30); band(30); const p=POTIONS.hp.price(), s=saltPrice(), d=Object.values(ITEM).find(x=>!x.uq&&x.set===1), b=shopPrice(d), pay=siegePayK();
  band(10); ok(POTIONS.hp.price()<p&&saltPrice()<s&&shopPrice(d)<b,'Calm is cheaper'); band(90); ok(POTIONS.hp.price()>p&&shopPrice(d)===Math.round(buyPrice(d)*1.25),'Terror is dearer'); near(siegePayK(),pay*1.3,1e-9);
  for(const [x,G] of [[10,[9,12]],[30,[7,10]],[60,[6,9]],[90,[5,7]]]){ band(x); for(let dd=1;dd<40;dd++){ S.day=dd; const v=siegeGap(); ok(v>=G[0]&&v<=G[1],x+': gap '+v); } }
  S.day=14; band(90); ok(!bmOpen(),'no black market in Terror'); band(30); ok(bmOpen());
  band(90); const L=[{maxHp:100,hp:100,atk:10,boss:true},{maxHp:100,hp:100,atk:10},{maxHp:100,hp:100,atk:10},{maxHp:100,hp:100,atk:10}]; dreadWave(L,{room:2});
  eq(L.filter(e=>e.elite).length,2,'two elites with the Captain'); eq(L[0].maxHp,115); band(10); const L2=[{maxHp:100,hp:100,atk:10}]; dreadWave(L2,{room:0}); eq(L2[0].maxHp,90);
});
test('Dread bands: Calm mourners bring a body; the Afraid leave a tribute',()=>{
  town(30,{embalm:2}); S.embalm=[]; band(5); S.day=7+CALL_DAY; dreadDawn(); eq(S.embalm.length,1,'a body at the gate'); eq(T_('mourners'),1);
  band(60); S.day=7+TRIBUTE_DAY; const g=S.gold; dreadDawn(); ok(S.gold>g,'a tribute'); eq(T_('tributes'),1);
});
test('Orders: the quest stays until a building stands; then three orders a day from the day, Math.random untouched',()=>{
  fresh(10); S.build={}; ok(!ordersOn()); eq(orders(),null); ok(/Daily quest/.test(renderAll('quest')));
  town(30); const r=Math.random; Math.random=()=>{ throw new Error('orders must not use Math.random'); }; let O; try{ O=orders(); } finally{ Math.random=r; }
  eq(O.list.length,3); eq(O.day,S.day); ok(orders()===O,'the same day'); eq(O.pick,-1); O.list.forEach(o=>ok(ORDERS[o.k],o.k));
  let hunts=0; for(let d=1;d<=100;d++){ S.day=d; S.orders=null; const L=orders().list; if(L.some(o=>o.k==='hunt')) hunts++; ok(new Set(L.map(o=>o.k)).size===L.length,'no repeats'); }
  ok(hunts>=45&&hunts<=75,'a Hunt about 60% of days: '+hunts);
  ui.tab='gates'; const h=renderAll('orders'); ok(/Daily orders/.test(h)&&/data-a="ord"/.test(h));
  S.quest={kills:8,rooms:4,clears:1,claimed:false}; const pts=S.player.pts, x0=S.player.xp; claimQuest(); eq(S.player.pts,pts,'no stat point from the old quest'); ok(S.player.xp>x0,'a day\'s work still pays XP'); eq(T_('dayWork'),1);
});
test('Orders: take one in town, once; a Hunt pays a point when its gate or a deeper one falls',()=>{
  town(30); S.orders={day:S.day,list:[{k:'hunt',g:2},{k:'debt'},{k:'clean',g:1}],pick:-1,n:0,done:false};
  S.mode='battle'; ok(!pickOrder(0),'in town only'); S.mode='town'; ok(pickOrder(0)); ok(!pickOrder(1),'once');
  const P=S.player, pts=P.pts; orderEv('clear',1); eq(P.pts,pts,'a shallower gate'); orderEv('clear',3); eq(P.pts,pts+QUEST_PTS); ok(S.orders.done); orderEv('clear',3); eq(P.pts,pts+QUEST_PTS,'pays once');
  eq(T_('ord_hunt'),1); ok(S.notices.some(n=>/Order fulfilled \(Hunt\)/.test(n.m)));
  S.orders={day:S.day,list:[{k:'hunt',g:0}],pick:0,n:0,done:false}; const c=S.ti.claims||0; startRun(0); const r=S.run; r.room=r.rooms-1; arena([foe({hp:0,dead:true})],0); S.run.room=S.run.rooms-1; fix(.99); roomWon(); ok(S.orders.done,'a real clear'); eq(S.ti.claims,c+1);
});
test('Orders: Harvest, Clean kill, Climb, Tribute, Old debt, Stand watch and Plunder pay what they say, with XP',()=>{
  const go=(o,fn)=>{ town(30,{yard:2}); S.orders={day:S.day,list:[o],pick:0,n:0,done:false}; const x0=S.player.xp, l0=S.player.lvl; fn(); ok(S.orders.done,o.k+' done'); ok(S.player.xp>x0||S.player.lvl>l0,o.k+' pays XP'); };
  go({k:'harvest',role:'striker'},()=>{ const d=S.dust; orderEv('raise',{role:'reaper'}); orderEv('raise',{role:'striker'}); orderEv('raise',{role:'striker'}); ok(!S.orders.done); orderEv('raise',{role:'striker'}); eq(S.dust-d,ORD_DUST*(topGate()+3)); });
  go({k:'clean',g:1},()=>{ orderEv('room',{ok:false,di:3}); ok(!S.orders.done,'a minion fell'); orderEv('room',{ok:true,di:0}); ok(!S.orders.done,'too shallow'); orderEv('room',{ok:true,di:2}); });
  const c=corpse({}); S.cleanDay=S.day; eq(cleanRaise(),CLEAN_RAISE); S.day++; eq(cleanRaise(),0);
  go({k:'climb'},()=>{ S.tower.best=30; const n=Object.values(S.trophies).reduce((a,b)=>a+b,0); orderEv('floor'); orderEv('floor'); orderEv('floor'); eq(Object.values(S.trophies).reduce((a,b)=>a+b,0),n+1); });
  go({k:'tribute'},()=>{ S.dread=40; orderEv('comm'); eq(dreadOf(),40-DREAD_TITHE); });
  go({k:'debt'},()=>{ const g=S.gold; orderEv('bounty',400); eq(S.gold-g,200); });
  go({k:'watch'},()=>{ mkMinion({lvl:30}); const m=mkMinion({lvl:5}); ok(toReserve(m.uid)); const w=S.watches; ok(standWatch()); eq(S.watches,w-1); ok(m.lvl>5||m.xp>0,'the Yard trained'); });
  town(30); band(90); S.orders=null; const O=orders(); const i=O.list.findIndex(o=>o.k==='plunder'); ok(i>=0,'Terror offers Plunder'); const g=S.gold, d=dreadOf(); ok(pickOrder(i)); ok(S.gold>g); eq(dreadOf(),Math.min(100,d+DREAD_PLUNDER)); ok(S.orders.done,'at once');
});
test('Orders: a bounty, a commission, a Tower floor and a raise feed them from the real systems; saves keep sound orders',()=>{
  town(30); S.orders={day:S.day,list:[{k:'harvest',role:'striker'}],pick:0,n:0,done:false}; const c=corpse({role:'striker'}); raiseScene([c],30); fix(0); tryRaise(c.id); eq(S.orders.n,1,'a raise counts');
  const g=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{orders:{day:3,list:[{k:'hunt',g:2},{k:'nope'},{k:'harvest',role:'x'},{k:'clean',g:99},{k:'debt'}],pick:7,n:'z'},dread:'x',unpaid:{crypt:1,fake:1},titheDay:'q'}))));
  eq(JSON.stringify(g.orders.list.map(o=>o.k)),'["hunt","debt"]'); eq(g.orders.pick,-1); eq(g.orders.n,0); eq(g.dread,DREAD_START); eq(JSON.stringify(g.unpaid),'{"crypt":1}'); ok(!('titheDay' in g));
  const g2=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{dread:250})))); eq(g2.dread,100);
});
test('Upkeep: levels past 2 cost gold at dawn; an unpaid building loses its top level and its pick until a dawn pays',()=>{
  town(30,{crypt:4,yard:3}); S.ti.clr={0:1,1:1,2:1}; const g=topGate(); eq(upkeepOf('crypt'),2*UPKEEP*(g+1)); eq(upkeepOf('forge'),0); eq(upkeepAll(),3*UPKEEP*(g+1));
  S.gold=1e5; eq(upkeepDawn(),upkeepAll()); eq(S.gold,1e5-upkeepAll()); eq(Object.keys(S.unpaid).length,0);
  S.spec={yard:{3:'a'}}; ok(hasSpec('yard',3,'a')); S.gold=0; S.dread=30; upkeepDawn(); ok(S.unpaid.crypt&&S.unpaid.yard); eq(bl('crypt'),3); eq(blRaw('crypt'),4); ok(!hasSpec('yard',3,'a'),'the pick is off'); eq(dreadOf(),30+DREAD_UNPAID);
  S.gold=1e5; upkeepDawn(); eq(bl('crypt'),4); ok(hasSpec('yard',3,'a')); ok(S.notices.some(n=>/Upkeep paid/.test(n.m)));
  S.siege=S.siege||{}; S.siege.dmg='crypt'; eq(upkeepAll(),UPKEEP*(g+1),'a burned building costs nothing'); S.siege.dmg=null;
  ui.tab='town'; ui.tlist=true; const h=renderAll('upkeep'); ok(/Upkeep: \d+ gold a day/.test(h)&&/adds \d+ gold a day in upkeep/.test(h)&&/data-a="tithe"/.test(h)&&/dread-card/.test(h)); invariants('upkeep');
  fresh(30); S.mode='town'; S.build={crypt:1,forge:1}; S.gold=5; S.watches=0; const d0=S.day; endDay(); eq(S.day,d0+1,'dawn runs with no upkeep due');
});
test('Bell Tower: wall defenses by level',()=>{
  fresh(30); arena([foe({hp:1e6})],0); S.build={bell:5}; S.spec={};
  const mk=(boss)=>({id:'x'+(++S.uid),name:'Militia Spearman',base:'Militia Spearman',maxHp:1000,hp:1000,atk:10,boss:!!boss});
  let L=[mk(),mk()]; bellDefense(L,{room:0}); ok(L[0].dots&&L[0].dots.bleed,'caltrops'); eq(L[0].hp,950,'arrow slits');
  L=[mk()]; bellDefense(L,{room:1}); ok(L[0].hp<=1000-50-Math.round(100*(1-foeRes(L[0],'fire')))+1,'burning oil');
  L=[mk(true)]; bellDefense(L,{room:2}); eq(L[0].stun,1,'the bells'); ok(S.player.shield>=Math.round(pMax()*.1),'sanctuary');
  S.build={bell:1}; S.player.shield=0; L=[mk()]; bellDefense(L,{room:1}); eq(L[0].hp,1000,'level 1 only bleeds wave 1'); eq(S.player.shield,0);
});
test('Dread and orders: the Codex and Turkish',()=>{
  const c=codexSection('town'); ['dread','Daily orders','Upkeep','Bell Tower defenses','Calm','Terror','Plunder'].forEach(s=>ok(c.includes(s),s));
  VIEW.lang='tr'; DREAD_BANDS.forEach(b=>{ ok(trText(b.name)!==b.name,b.name); ok(trText(b.fx)!==b.fx,b.fx); });
  Object.keys(ORDERS).forEach(k=>{ ok(trText(ORDERS[k].name)!==ORDERS[k].name,k); }); BELL_DEF.forEach(x=>{ ok(trText(x[0])!==x[0],x[0]); ok(trText(x[1])!==x[1],x[1]); });
  ['Clear the Rat Warren or a deeper gate','Raise 3 striker minions','Win a room in the Rat Warren with no minion downed','Spend a watch in town with the Charnel Yard','Fill a commission','Climb 3 floors of the Hell Tower','Claim a bounty','Take gold and bodies from the town',
   'Order fulfilled (Hunt): +1 stat point and +120 XP.','Upkeep unpaid: Crypt loses a level until a dawn can pay.','The town is calm now. Prices and sieges as usual (every 7-10 days).','Pay a tithe (500 gold)'].forEach(s=>ok(trText(s)!==s,s));
  VIEW.lang='en';
});
})();
