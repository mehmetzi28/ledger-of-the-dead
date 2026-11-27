// ===== THE TOWN'S DREAD, DAILY ORDERS AND UPKEEP (R5 PR B) =====
// Dread (S.dread, 0-100, from 30) is how much the living fear the necropolis. It wakes with the sieges (siegeOpen) and moves
// with what you do: raising in the gates, raids on the near gates and new building levels raise it; sieges won, commissions
// and a tithe calm it; each dawn it drifts a point toward 40. Its band sets market prices, the siege gap, wave strength and
// pay, and brings its own dawn: Calm mourners bring a body, the Afraid leave a tribute, Terror shuts the black market and
// offers the Plunder order. Daily orders (S.orders) replace the daily quest once a building stands: three drawn each dawn
// from a hash of the day (Math.random is never touched), pick one, it pays once; only Hunt pays a stat point. Upkeep: every
// building level past 2 costs gold at dawn; an unpaid building loses its top level (S.unpaid) until a dawn pays it.
const DREAD_START=30, DREAD_REST=40, DREAD_RAISE=.1, DREAD_SIEGE_WON=6, DREAD_SIEGE_LOST=10, DREAD_RAID=3, DREAD_COMM=3,
  DREAD_TITHE=5, TITHE_K=.05, DREAD_BUILD=2, DREAD_UNPAID=1, DREAD_PLUNDER=8, TRIBUTE_K=.25, UPKEEP=15, ORD_DUST=10, ORD_HUNT=.6,
  CLEAN_RAISE=5, CALL_DAY=3, TRIBUTE_DAY=5;
const DREAD_BANDS=[
  {id:'calm',  name:'Calm',  min:0, price:.9,  gap:[9,12], wave:.9,  pay:1,    fx:'Market prices 10% lower, pedlars twice as common, sieges every 9-12 days and 10% weaker; once a week mourners bring a body to the Embalmery.'},
  {id:'uneasy',name:'Uneasy',min:20,price:1,   gap:[7,10], wave:1,   pay:1,    fx:'Prices and sieges as usual (every 7-10 days).'},
  {id:'afraid',name:'Afraid',min:50,price:1.1, gap:[6,9],  wave:1.1, pay:1.15, fx:'Market prices 10% higher; sieges every 6-9 days, 10% stronger, 15% better pay; once a week the living leave a tribute at the gate.'},
  {id:'terror',name:'Terror',min:80,price:1.25,gap:[5,7],  wave:1.15,pay:1.3,  fx:'Market prices 25% higher, no black market; sieges every 5-7 days, 15% stronger, the Captain brings two elites, 30% better pay; the Plunder order.'}
];
const dreadOn=()=>!!S&&siegeOpen();
const dreadOf=()=>S&&isFinite(S.dread)?S.dread:DREAD_START;
function dreadBand(){ if(!dreadOn()) return DREAD_BANDS[1]; const d=dreadOf(); let b=DREAD_BANDS[0]; for(const x of DREAD_BANDS) if(d>=x.min) b=x; return b; }
function dread(n){   // move the meter; a new band is announced
  if(!dreadOn()||!n) return 0; const b0=dreadBand().id; S.dread=Math.round(clamp(dreadOf()+n,0,100)*10)/10; const b=dreadBand();
  if(b.id!==b0){ notify('The town is '+b.name.toLowerCase()+' now. '+b.fx,b.min>=50?'bad':'ok'); tally('band_'+b.id); } return n;
}
const dreadPriceK=()=>dreadBand().price;   // stock, potions, salts
const dreadGap=()=>dreadBand().gap;   // siegeGap
const dreadPayK=()=>dreadBand().pay;   // siegePayK
const tollK=()=>hasSpec('bell',5,'a')?2:1;   // Toll of the Dead
function dreadWave(list,r){   // townSiegeWave: the band's strength; Terror's Captain brings two elites
  const k=dreadBand().wave; if(k!==1) for(const e of list){ e.maxHp=e.hp=Math.max(1,Math.round(e.maxHp*k)); e.atk=Math.max(1,Math.round(e.atk*k)); }
  if(dreadBand().id==='terror'&&list.some(e=>e.boss)) list.filter(e=>!e.boss&&!e.elite).slice(0,2).forEach(e=>{ e.elite=true; e.maxHp=e.hp=Math.round(e.maxHp*1.5); e.atk=Math.round(e.atk*1.25); });
}
const titheCost=()=>Math.max(100,Math.round(S.gold*TITHE_K));
const titheReady=()=>dreadOn()&&S.mode==='town'&&S.titheDay!==S.day&&S.gold>=titheCost();
function payTithe(){ if(!titheReady()) return 0; const c=titheCost(); S.gold-=c; S.titheDay=S.day; dread(-DREAD_TITHE); tally('tithes'); sfx('coin'); return c; }
function dreadDawn(){   // closeDay: drift, then the band's own dawn
  if(!dreadOn()) return; const d=dreadOf(), rest=dreadRest(); if(d!==rest) dread(d>rest?-Math.min(1,d-rest):Math.min(1,rest-d));   /* the Profane's rest sits higher (game-pantheon.js) */
  const b=dreadBand().id;
  if(b==='calm'&&S.day%7===CALL_DAY&&bl('embalm')&&(S.embalm||[]).length<embHold()){ const g=topGate(), mob=pick(DUNGEONS[g].mobs);
    const c={name:mob[0],base:mob[0],role:mob[1],rankI:g,lvl:Math.max(1,S.player.lvl-2),hf:mob[2]||1,af:mob[3]||1,boss:false,elite:false};
    if(embKeep(c,true)){ tally('mourners'); notify('Mourners from the town leave '+withArticle(c.base)+' at the gate. The Embalmery takes it in.','ok'); } }
  if(b==='afraid'&&S.day%7===TRIBUTE_DAY){ const g=Math.round(siegeGoldPay()*TRIBUTE_K); S.gold+=g; tally('tributes'); notify('The frightened living leave a tribute at the gate: +'+g+' gold.','ok'); }
}
// ----- the Bell Tower's wall defenses, one per level
const BELL_DEF=[['Caltrops','wave 1 starts bleeding'],['Burning oil','wave 2 is scalded for 10% of its HP as fire'],['Great bells','the Captain acts a turn late'],['Arrow slits','each wave loses 5% of its HP'],['Sanctuary','you start each wave with a shield of 10% of your max HP']];
function bellDefense(list,r){   // townSiegeWave, before the fight starts
  const n=bl('bell'); if(!n||!r) return;
  if(n>=1&&r.room===0) list.forEach(e=>addDot(e,'bleed',Math.max(1,Math.round(e.maxHp*.02)),3));
  if(n>=2&&r.room===1) list.forEach(e=>{ e.hp=Math.max(1,e.hp-Math.round(e.maxHp*.1*(1-foeRes(e,'fire')))); });
  if(n>=3) list.filter(e=>e.boss).forEach(e=>{ e.stun=Math.max(e.stun||0,1); });
  if(n>=4) list.forEach(e=>{ e.hp=Math.max(1,e.hp-Math.round(e.maxHp*.05)); });
  if(n>=5){ const P=S.player; P.shield=Math.max(P.shield||0,Math.round(pMax()*.1)); }
}
// ----- upkeep
const upkeepOf=(k,lv)=>Math.max(0,(lv==null?blRaw(k):lv)-2)*UPKEEP*(topGate()+1);
const upkeepAll=()=>Object.keys(BUILD).reduce((a,k)=>a+(sg().dmg===k?0:upkeepOf(k)),0);
function upkeepDawn(){   // closeDay: pay each building in order; one that cannot be paid loses its top level until a dawn pays it
  const was=S.unpaid||{}; S.unpaid={}; let paid=0; const left=[];
  for(const k of Object.keys(BUILD)){ const c=sg().dmg===k?0:upkeepOf(k); if(!c) continue; if(S.gold>=c){ S.gold-=c; paid+=c; } else { S.unpaid[k]=1; left.push(BUILD[k].name); } }
  if(paid) tally('upkeepG',paid);
  if(left.length){ dread(DREAD_UNPAID); notify('Upkeep unpaid: '+left.join(', ')+' lose'+(left.length>1?'':'s')+' a level until a dawn can pay.','bad'); }
  else if(Object.keys(was).length) notify('Upkeep paid: every building works again.','ok');
  if(Object.keys(was).length!==Object.keys(S.unpaid).length) syncArmy();
  return paid;
}
// ----- daily orders
const ORDERS={
  hunt:   {name:'Hunt',      t:o=>'Clear the '+DUNGEONS[o.g].name+' or a deeper gate',              pay:()=>'+'+QUEST_PTS+' stat point and '+b100(QUEST_XP)+'% of a level'},
  harvest:{name:'Harvest',   t:o=>'Raise 3 '+ROLES[o.role].label.toLowerCase()+' minions',            pay:()=>ORD_DUST*(topGate()+3)+' bone dust', n:3},
  clean:  {name:'Clean kill',t:o=>'Win a room in the '+DUNGEONS[o.g].name+' with no minion downed',     pay:()=>'+'+CLEAN_RAISE+'% raise chance tomorrow'},
  watch:  {name:'Stand watch',t:()=>'Spend a watch in town with the Charnel Yard',                      pay:()=>'the Yard trains twice at once'},
  tribute:{name:'Tribute',   t:()=>'Fill a commission',                                                pay:()=>'the town calms (dread -'+DREAD_TITHE+')'},
  climb:  {name:'Climb',     t:()=>'Climb 3 floors of the Hell Tower',                                  pay:()=>'a Tower trophy', n:3},
  debt:   {name:'Old debt',  t:()=>'Claim a bounty',                                                    pay:()=>'half its gold again'},
  plunder:{name:'Plunder',   t:()=>'Take gold and bodies from the town',                                 pay:()=>plunderGold()+' gold at once, dread +'+DREAD_PLUNDER}
};
const ordersOn=()=>!!S&&builtLevels()>0;
const plunderGold=()=>Math.round(siegeGoldPay()*.5);
function ordHash(n){ let a=(Math.imul(S.day+11,2654435761)^Math.imul(n+5,40503)^Math.imul((S.ngp||0)+3,97))>>>0; a^=a>>>15; a=Math.imul(a,2246822519)>>>0; return ((a^(a>>>13))>>>0)/4294967296; }   // no Math.random
function makeOrders(){
  const g=topGate(), roles=Object.keys(ROLES), pool=['harvest','clean','debt'], out=[];
  if(bl('yard')) pool.push('watch'); if(S.comm&&S.comm.week===weekOf(S.day)&&S.comm.list.some(c=>!c.done)) pool.push('tribute');   /* the week's board as it stands: drawing it here would touch Math.random */ if(towerOpen()) pool.push('climb');
  if(ordHash(0)<ORD_HUNT) out.push({k:'hunt',g:Math.max(0,g-(ordHash(1)<.5?1:0))});
  if(dreadBand().id==='terror') out.push({k:'plunder'});
  let i=2; while(out.length<3&&pool.length){ const k=pool.splice(Math.floor(ordHash(i++)*pool.length),1)[0], o={k};
    if(k==='harvest') o.role=roles[Math.floor(ordHash(i++)*roles.length)]; if(k==='clean') o.g=Math.max(0,g-1); out.push(o); }
  return out;
}
function orders(){ if(!ordersOn()) return null; if(!S.orders||S.orders.day!==S.day) S.orders={day:S.day,list:makeOrders(),pick:-1,n:0,done:false}; return S.orders; }
const orderNow=()=>{ const o=orders(); return o&&o.pick>=0&&!o.done?o.list[o.pick]:null; };
function pickOrder(i){
  const O=orders(); if(!O||O.pick>=0||S.mode!=='town'||!O.list[i]) return false; O.pick=i; tally('ordersPicked');
  if(O.list[i].k==='plunder') orderDone(); return true;
}
function orderDone(){
  const O=S.orders, o=O.list[O.pick]; O.done=true; S.ti=S.ti||{}; S.ti.claims=(S.ti.claims||0)+1; tally('orders'); tally('ord_'+o.k); let m='';
  const xp=Math.round(need(S.player.lvl)*QUEST_XP); addXp(xp);   /* every order pays the old quest's XP; only a Hunt adds the stat point */
  if(o.k==='hunt'){ S.player.pts+=QUEST_PTS; m='+'+QUEST_PTS+' stat point and +'+xp+' XP'; }
  else if(o.k==='harvest'){ const d=ORD_DUST*(topGate()+3); S.dust=(S.dust||0)+d; m='+'+d+' bone dust'; }
  else if(o.k==='clean'){ S.cleanDay=S.day+1; m='+'+CLEAN_RAISE+'% raise chance tomorrow'; }
  else if(o.k==='watch'){ const n=yardDawn()+yardDawn(); m='the Charnel Yard trains twice ('+n+' level'+(n===1?'':'s')+')'; }
  else if(o.k==='tribute'){ dread(-DREAD_TITHE); m='the town calms'; }
  else if(o.k==='climb'){ const ks=Object.keys(TROPHY).filter(k=>k.startsWith('t:')), k=ks[Math.min(ks.length-1,Math.floor((S.tower.best||1)/25))]; if(k){ S.trophies[k]=(S.trophies[k]||0)+1; m='+1 '+TROPHY[k].name; } }
  else if(o.k==='debt'){ const g=Math.round((O.bg||0)*.5)||100*(topGate()+1); S.gold+=g; m='+'+g+' gold'; }
  else if(o.k==='plunder'){ const g=plunderGold(); S.gold+=g; dread(DREAD_PLUNDER); m='+'+g+' gold, and the town hates you more'; }
  notify('Order fulfilled ('+ORDERS[o.k].name+'): '+m+(o.k==='hunt'?'':', +'+xp+' XP')+'.','ok'); sfx('coin');
}
function orderEv(k,x){   // progress, from the systems that do the work
  const o=orderNow(); if(!o) return; const O=S.orders;
  if(k==='clear'&&o.k==='hunt'&&x>=o.g) orderDone();
  else if(k==='raise'&&o.k==='harvest'&&x&&x.role===o.role){ if(++O.n>=3) orderDone(); }
  else if(k==='room'&&o.k==='clean'&&x&&x.ok&&x.di>=o.g) orderDone();
  else if(k==='floor'&&o.k==='climb'){ if(++O.n>=3) orderDone(); }
  else if(k==='comm'&&o.k==='tribute') orderDone();
  else if(k==='bounty'&&o.k==='debt'){ O.bg=x||0; orderDone(); }
}
function standWatch(){ const o=orderNow(); if(!o||o.k!=='watch'||S.mode!=='town'||S.watches<1) return false; S.watches--; orderDone(); if(S.watches<=0) endDay(); return true; }
function dayWork(){ const xp=Math.round(need(S.player.lvl)*QUEST_XP); addXp(xp); tally('dayWork'); notify('A day\'s work done without an order: +'+xp+' XP.',''); }   // claimQuest
const cleanRaise=()=>S&&S.cleanDay===S.day?CLEAN_RAISE:0;   // townRaise
function ordersTxt(o){ return ORDERS[o.k].name+': '+ORDERS[o.k].t(o); }
// ----- save
function dreadFix(g){
  g.dread=isFinite(g.dread)?clamp(+g.dread,0,100):DREAD_START;
  const u={}; if(g.unpaid&&typeof g.unpaid==='object') for(const k in g.unpaid) if(BUILD[k]&&g.unpaid[k]) u[k]=1; g.unpaid=u;
  const O=g.orders; if(O&&typeof O==='object'&&isFinite(O.day)&&Array.isArray(O.list)){
    const list=O.list.filter(o=>o&&ORDERS[o.k]&&(o.g==null||DUNGEONS[o.g])&&(o.k!=='harvest'||ROLES[o.role])&&(o.k!=='hunt'&&o.k!=='clean'||DUNGEONS[o.g])).slice(0,3);
    g.orders={day:Math.floor(O.day),list,pick:Number.isInteger(O.pick)&&O.pick>=0&&O.pick<list.length?O.pick:-1,n:Math.max(0,Math.floor(+O.n||0)),done:!!O.done}; if(typeof O.bg==='number'&&isFinite(O.bg)) g.orders.bg=Math.max(0,O.bg);
  } else g.orders=null;
  for(const k of ['titheDay','cleanDay']) if(g[k]!=null&&!isFinite(g[k])) delete g[k];
}
// ----- UI: the orders panel (instead of the daily quest), the dread card and upkeep lines on the Town tab
function ordersHTML(){
  const O=orders(), town=S.mode==='town', o=O.pick>=0?O.list[O.pick]:null;
  const prog=x=>ORDERS[x.k].n?' ('+Math.min(O.n,ORDERS[x.k].n)+'/'+ORDERS[x.k].n+')':'';
  return '<section class="win'+foldCls('quest')+'" aria-labelledby="h-quest"><h2 class="win-h" id="h-quest">Daily orders &middot; Day '+S.day+'<span class="fold-sum">'+(O.done?'fulfilled':o?'in hand':'pick one')+'</span>'+foldBtn('quest')+'</h2>'
   +O.list.map((x,i)=>'<div class="q-row'+(O.pick===i?' on':'')+'"><span class="box'+(O.pick===i&&O.done?' on':'')+'"></span><span><b>'+ORDERS[x.k].name+'</b>: '+ORDERS[x.k].t(x)+(O.pick===i?prog(x):'')+'<br><small class="u-sub">Pays '+ORDERS[x.k].pay(x)+'</small></span>'
     +(O.pick<0&&town?'<button class="btn small" data-a="ord" data-k="'+i+'">Take</button>':'')
     +(O.pick===i&&!O.done&&x.k==='watch'&&town?'<button class="btn small primary" data-a="standwatch"'+(S.watches<1?' disabled':'')+'>Stand watch</button>':'')+'</div>').join('')
   +(O.done?'<p class="q-note ok">Today\'s order is fulfilled.</p>':o?'':'<p class="q-note">'+(town?'Take one order for today. Only a Hunt pays a stat point.':'Orders are taken in town.')+'</p>')
   +brief('orders','Three orders are posted at dawn; you take one and it pays once when done, always with '+b100(QUEST_XP)+'% of a level. They lapse at dawn.','q-note')+'</section>';
}
function dreadHTML(){
  if(!dreadOn()) return ''; const d=Math.round(dreadOf()), b=dreadBand(), up=upkeepAll();
  return '<div class="dread-card note"><i>Dread</i><span><b>'+b.name+'</b> <span>('+d+'/100).</span> <span>'+b.fx+'</span></span>'
   +'<div class="meter dread-m" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+d+'" aria-label="Dread"><i style="width:'+d+'%"></i></div>'
   +(up?'<small class="u-sub">Upkeep: '+up+' gold a day at dawn.'+(Object.keys(S.unpaid||{}).length?' Unpaid: '+Object.keys(S.unpaid).map(k=>BUILD[k].name).join(', ')+'.':'')+'</small>':'')
   +(S.mode==='town'?'<button class="btn small" data-a="tithe"'+(titheReady()?'':' disabled')+' title="Pay the Old Shrine '+b100(TITHE_K)+'% of your gold, once a day: dread -'+DREAD_TITHE+'">Pay a tithe ('+titheCost()+' gold)</button>':'')
   +brief('dread','Raising in the gates, raids on the two nearest gates and new building levels frighten the town; sieges won, commissions and tithes calm it. Each dawn it drifts a point toward '+DREAD_REST+'.','q-note')+'</div>';
}
function upkeepLine(k){
  const lv=blRaw(k), now=upkeepOf(k), nx=lv<BUILD_MAX?upkeepOf(k,lv+1):0;
  return (now?'<div class="u-sub">Upkeep: '+now+' gold a day'+(S.unpaid&&S.unpaid[k]?' <span class="u-tag bad">Unpaid: a level is off</span>':'')+'.</div>':'')
   +(nx>now?'<div class="u-sub">Level '+(lv+1)+' adds '+(nx-now)+' gold a day in upkeep.</div>':'');
}
