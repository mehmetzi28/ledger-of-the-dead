// ===== R20 PR A: THE VILLAGES OF THE LIVING =====
// Three villages on the Valley map give the living faces: Miller's Ford (river farmers), Greyhollow (a mining town) and
// Saint Aldric's (a pilgrim town). Each has a standing with you (-100 hatred .. +100 allegiance, from VIL_ST0) and a
// population. Standing moves with deeds: a weekly favor done, trade, tribute, sieges won or lost (they hear of it), bodies
// raised from the graveyard they bury their dead in, the town's dread (Terror a point down a day, Calm a point up), the
// pilgrims on the road and the shrines. Standing sets the stall's prices (up to 25% either way); at VIL_SHUT and below the
// village will not trade or ask favors. Walking there is a walk like any site's (it must leave a watch); trade and tribute
// keep that watch, and so does an escort favor: a fight on the cart's road (a run flagged r.sv='escort'), like the road's encounters.
// S.vil = {mill:{st, pop, fav:{w, k, done}, td, cw, aid, met, gone}, grey:{...}, aldric:{...}, salt, bless, knight}.
// PR B: the dark path and the bright one. A raid (a watch, a fight against the militia and the village's best) takes
// its people as bodies (Farmhand, Hardened or Pious: a corpse condition, +15 to raise), gold and goods, costs standing
// there and everywhere, raises the dread and brings the next siege sooner (VIL_RAID_TIER: a tier harder too, off: the
// bots' early sieges fell with it); a village emptied of
// people is abandoned (its graveyard digs twice as deep). Allegiance (+60, +100) pays: Miller's Ford's militia hold a
// siege wave once a week and its salt keeps the Embalmery's bodies 3 days longer; Greyhollow delivers ore each week and
// its forge-master reforges at the best roll; Saint Aldric's blessing stays and, at +100, its knight rides with you (a
// living companion in every gate run and siege: never raised, never evolved, as strong as the village's standing). At
// -60 and below a village sends a mob with each siege.
const VIL_ST0=-20, VIL_SHUT=-60, VIL_ALLY=60, VIL_FRIEND=20, VIL_TRADE=1, VIL_TRIB=25, VIL_TRIB_ST=5, VIL_FAV=10, VIL_SIEGE_WON=3, VIL_SIEGE_LOST=5,
  VIL_GRAVE=3, VIL_BAND=1, VIL_PILGRIM=3, VIL_TAKE=5, VIL_DESECRATE=5, VIL_PRICE=400, VIL_SALT=6, VIL_SALT_MAX=6, VIL_POT=.7, VIL_ORE=20, VIL_CHARM=60,
  VIL_RELIC=15, VIL_INCENSE=10, VIL_INCENSE_DREAD=3, VIL_BLESS=.05, VIL_BLESS_DAYS=7, VIL_FAV_GOLD=20,
  VIL_RAID_ST=40, VIL_RAID_ALL=10, VIL_RAID_DREAD=8, VIL_RAID_POP=[40,60], VIL_RAID_N=[4,6], VIL_RAID_GOLD=40, VIL_RAID_SOONER=2, VIL_RAID_TIER=false, VIL_MOB=1,
  VIL_KNIGHT_AT=100, VIL_ALLY_ORE=2, VIL_EMB=3, VIL_GY_BIG=2;
const VIL_PEOPLE={mill:{cd:'farmhand',p:[['Farmhand','vanguard'],['Miller','striker']],best:'vanguard'},grey:{cd:'hardened',p:[['Miner','vanguard'],['Foreman','reaper']],best:'reaper'},
  aldric:{cd:'pious',p:[['Pilgrim','mender'],['Monk','mender'],['Pilgrim','striker']],best:'knight'}};
const KNIGHT=['Knight of Saint Aldric','vanguard',1.4,1.1], KNIGHT_NICK='Ser Aldwin';
Object.assign(CORPSE_CONDS,{   // the people of the villages, taken in a raid (R20 PR B)
  farmhand:{name:'Farmhand',raise:15,trait:'stalwart',when:'Taken in a raid on Miller\'s Ford.',story:'Raised from the fields: it works without complaint.'},
  hardened:{name:'Hardened',raise:15,trait:'thick',   when:'Taken in a raid on Greyhollow.',story:'Raised from the seams: hard as the rock it cut.'},
  pious:   {name:'Pious',   raise:15,trait:'warded',  when:'Taken in a raid on Saint Aldric\'s.',story:'Raised from its prayers: no rot will touch it.'}});
let VIL_ON=true;   // the balance bot's off-switch ("off":["villages"]): no hooks move standing
const VILLAGES={
  mill:  {name:'Miller\'s Ford', node:'vm', gy:'gy0', pop:220, who:'River farmers, practical and slow to trust.', people:'farmhands and millers',
    favors:['den','cart','ford'], goods:['salt','draught']},
  grey:  {name:'Greyhollow',     node:'vg', gy:'gy3', pop:160, who:'A mining town, hard and proud. They know the Old Iron Mine.', people:'miners and foremen',
    favors:['mine','cart','worker'], goods:['ore','charm']},
  aldric:{name:'Saint Aldric\'s', node:'va', gy:'gy1', pop:260, who:'A pilgrim town on the old road, devout and afraid of you.', people:'pilgrims, monks and a knight',
    favors:['bury','shrine','cart'], goods:['relic','incense']}
};
const VIL_IDS=Object.keys(VILLAGES);
const VIL_BANDS=[{id:'hate',min:-100,name:'Hatred'},{id:'fear',min:-59,name:'Fear'},{id:'wary',min:-20,name:'Wary'},{id:'friend',min:VIL_FRIEND,name:'Friendly'},{id:'ally',min:VIL_ALLY,name:'Allegiance'}];
const FAVOR_TEXT={den:'Clear the Wolf Den: its beasts take their sheep.',cart:'Escort their cart down the road (a fight).',ford:'Drive the drowned from the Ford: search its shallows.',
  mine:'Clear the Old Iron Mine: the iron things dig toward their tunnels.',worker:'Send them a worker: one of the bodies you dug today.',
  bury:'Bury the dead at a battlefield instead of raising them.',shrine:'Keep a shrine: pray, swear or sing at a shrine or the gallows (never desecrate).'};
const FAVOR_NAME={den:'The wolves',cart:'The cart',ford:'The drowned',mine:'The mine',worker:'A worker',bury:'The dead',shrine:'A shrine kept'};
const GOOD_TEXT={salt:'Grain-salt: keeps one dug body through a dawn',draught:'A Healing Draught',ore:'A lump of ore',charm:'An iron charm (once a week)',relic:'A relic: devotion to your god',incense:'Incense for the town: dread falls'};
const vilNode=id=>VIL_IDS.find(v=>VILLAGES[v].node===id)||null;
const vilWeek=()=>Math.floor(Math.max(0,S.day-1)/7);
function vilAll(){ if(!S.vil||typeof S.vil!=='object') S.vil={}; for(const v of VIL_IDS){ const x=S.vil[v]; if(!x||typeof x!=='object') S.vil[v]={st:VIL_ST0,pop:VILLAGES[v].pop}; } return S.vil; }
const vil=v=>vilAll()[v];
const vilSt=v=>{ const x=S.vil&&S.vil[v]; return x&&isFinite(x.st)?x.st:VIL_ST0; };
function vilBand(v){ const s=vilSt(v); let b=VIL_BANDS[0]; for(const x of VIL_BANDS) if(s>=x.min) b=x; return b; }
const vilGone=v=>!!(S.vil&&S.vil[v]&&S.vil[v].gone);
const vilShut=v=>vilGone(v)||vilSt(v)<=VIL_SHUT;
const vilAlly=(v,n)=>VIL_ON&&!vilGone(v)&&vilSt(v)>=(n||VIL_ALLY);
const knightOn=()=>VIL_ON&&!!(S&&S.vil&&S.vil.knight)&&vilAlly('aldric');
function stand(v,n,why){   // move a village's standing; a new band is announced
  if(!VIL_ON||!VILLAGES[v]||!n||vilGone(v)) return 0; const x=vil(v), b0=vilBand(v).id; x.st=clamp(Math.round(x.st+n),-100,100); const b=vilBand(v);
  if(b.id!==b0){ notify(VILLAGES[v].name+': your standing is now '+b.name+(why?' ('+why+')':''),VIL_BANDS.indexOf(b)>VIL_BANDS.findIndex(y=>y.id===b0)?'ok':'bad'); tally('vband_'+b.id); }
  if(x.st>=VIL_ALLY) unlockStory('vil_'+v+'2');
  if(v==='aldric'){ const s=vilAll(); if(!s.knight&&x.st>=VIL_KNIGHT_AT){ s.knight=1; tally('knightJoined'); notify(KNIGHT_NICK+', the knight of Saint Aldric\'s, swears to ride with you: he will fight beside you in every gate and on the walls while the village holds you in allegiance.','ok'); }
    else if(s.knight&&x.st<VIL_ALLY){ delete s.knight; notify(KNIGHT_NICK+' rides home to Saint Aldric\'s. He will not fight for a keeper they no longer trust.','bad'); } }
  return n;
}
const standAll=(n,why)=>VIL_IDS.forEach(v=>stand(v,n,why));
const vilPriceK=v=>1-vilSt(v)/VIL_PRICE;
const vilPrice=(v,base)=>Math.max(1,Math.round(base*priceK()*vilPriceK(v)));
const vilPot=v=>Math.max(1,Math.round(POTIONS.hp.price()*VIL_POT*vilPriceK(v)));
const vilBlessK=()=>S.vil&&(S.vil.bless>=S.day||vilAlly('aldric'))?1+VIL_BLESS:1;   // healK: Saint Aldric's blessing (for a week after a favor, always in allegiance)
const ironKit=()=>{ const L=DUNGEONS[4].mobs.map(m=>KIT_OF[m[0]]).filter(k=>k&&KITS[k]); return L.length?L[dayHash(vilWeek(),L.length,77)%L.length]:null; };
// ----- favors: one a week per village, from a hash of the week (never Math.random)
function vilFav(v){   // this week's favor (made on first look): {w, k, done}
  const x=vil(v), w=vilWeek(); if(!x.fav||x.fav.w!==w){ const L=VILLAGES[v].favors; x.fav={w,k:L[dayHash(w,L.length,VIL_IDS.indexOf(v)+11)%L.length],done:0}; } return x.fav;
}
const favOpen=(v,k)=>VIL_ON&&!vilShut(v)&&vilFav(v).k===k&&!vilFav(v).done;
function favHook(k){ for(const v of VIL_IDS) if(favOpen(v,k)) favDone(v); }   // a deed elsewhere that a village asked for (the den, the mine, the ford, a shrine)
function favDone(v){   // the favor is done: standing and the village's thanks
  const f=vilFav(v); if(f.done) return ''; f.done=1; tally('favors'); tally('fav_'+v); stand(v,VIL_FAV,'a favor done'); let m;
  if(v==='mill'){ const s=vilAll(); s.salt=Math.min(VIL_SALT_MAX,(s.salt|0)+2); const pot=S.belt&&S.belt.hp<beltMax(); if(pot) S.belt.hp++; m='Miller\'s Ford thanks you with two sacks of grain-salt'+(pot?' and a Healing Draught':'')+'.'; }
  else if(v==='grey'){ const M=mapSt(), g=VIL_FAV_GOLD*priceK(); M.ore=Math.min(ORE_HOLD,(M.ore|0)+2); S.gold+=g; m='Greyhollow pays its debt: two lumps of ore and '+g+' gold.'; }
  else { vilAll().bless=S.day+VIL_BLESS_DAYS; m='Saint Aldric\'s blesses your dead: menders heal '+Math.round(VIL_BLESS*100)+'% more for '+VIL_BLESS_DAYS+' days.'; }
  notify(m,'ok'); return m;
}
// ----- the stall, the tribute and the favors you take at the village itself
function vilOpts(v){   // {k, t, why}
  const out=[], add=(k,t,why)=>out.push({k,t,why:why||''}), gold=c=>S.gold>=c?'':'Needs '+c+' gold.', shut=vilShut(v)?'They will not deal with you.':'', s=vilAll();
  for(const g of VILLAGES[v].goods){
    if(g==='salt'){ const c=vilPrice(v,VIL_SALT); add('salt','Buy grain-salt: '+c+' gold',shut||((s.salt|0)>=VIL_SALT_MAX?'You hold all the salt you can carry.':gold(c))); }
    if(g==='draught'){ const c=vilPot(v); add('draught','Buy a Healing Draught: '+c+' gold',shut||(S.belt&&S.belt.hp>=beltMax()?'Your belt is full.':gold(c))); }
    if(g==='ore'){ const c=vilPrice(v,VIL_ORE); add('ore','Buy a lump of ore: '+c+' gold',shut||(((S.map&&S.map.ore)|0)>=ORE_HOLD?'You hold all the ore you can carry.':gold(c))); }
    if(g==='charm'){ const c=vilPrice(v,VIL_CHARM), k=ironKit(); add('charm','Buy an iron charm'+(k?' ('+KITS[k].name+')':'')+': '+c+' gold',shut||(vilSt(v)<VIL_FRIEND?'Only for friends (standing '+VIL_FRIEND+').':vil(v).cw===vilWeek()?'One a week.':!k?'No charm this week.':gold(c))); }
    if(g==='relic'){ const c=vilPrice(v,VIL_RELIC), f=faithOf(); add('relic','Buy a relic: +'+DEV_SHRINE+' devotion, '+c+' gold',shut||(!f?'You have no god.':f==='dis'?'They will not sell a relic to the Profane.':gold(c))); }
    if(g==='incense'){ const c=vilPrice(v,VIL_INCENSE); add('incense','Buy incense for the town: dread -'+VIL_INCENSE_DREAD+', '+c+' gold',shut||(!dreadOn()?'The town knows no dread yet.':gold(c))); }
  }
  const t=VIL_TRIB*priceK(); add('tribute','Pay tribute: '+t+' gold, standing +'+VIL_TRIB_ST,shut?'They will not take your gold.':vil(v).td===S.day?'You paid today.':gold(t));
  if(!vilGone(v)) add('raid','Raid the village: a fight, a watch',S.mode!=='town'?'Only from town.':'');
  const f=vilFav(v); if(!shut&&!f.done){ if(f.k==='cart') add('escort','Escort the cart: a fight on the road',S.mode!=='town'?'Only from town.':'');
    if(f.k==='worker'){ const B=(S.map&&S.map.bodies)||[]; add('worker','Send them a worker'+(B.length?': '+cleanText(B[0].c.name):''),B.length?'':'Dig a body first: they want one of today\'s.'); } }
  return out;
}
function vilWhy(id,k){ const v=vilNode(id); if(!v) return 'No such village.'; const o=vilOpts(v).find(x=>x.k===k); if(!o) return 'No such choice.'; if(o.why) return o.why;
  if(S.mode!=='town') return 'Only from town.'; if(!mapCan(id,1)) return 'Too far for the watches left today.'; return ''; }
function vilAct(id,k){   // walk there and take the choice; returns a line, '' for a fight begun, or null
  if(vilWhy(id,k)) return null; const v=vilNode(id), V=VILLAGES[v], x=vil(v), s=vilAll(); let m=null;
  if(k==='escort') return svStart(id,false,v)?'':null;
  if(k==='raid') return raidStart(id)?'':null;   /* the walk and the watch (game-roads.js) */
  if(!mapGo(id,1)) return null;
  if(k==='salt'){ const c=vilPrice(v,VIL_SALT); S.gold-=c; s.salt=(s.salt|0)+1; m='You buy a sack of grain-salt for '+c+' gold ('+s.salt+' held). A salted body keeps through a dawn.'; }
  if(k==='draught'){ const c=vilPot(v); S.gold-=c; S.belt.hp++; m='The miller\'s wife sells you a Healing Draught for '+c+' gold.'; }
  if(k==='ore'){ const c=vilPrice(v,VIL_ORE), M=mapSt(); S.gold-=c; M.ore=(M.ore|0)+1; tally('ore'); m='You buy a lump of ore for '+c+' gold ('+M.ore+' held).'; }
  if(k==='charm'){ const c=vilPrice(v,VIL_CHARM), kk=ironKit(); S.gold-=c; x.cw=vilWeek(); S.charms=Array.isArray(S.charms)?S.charms:[]; S.charms.push({k:kk,src:'Greyhollow'}); tally('charms'); m='The smith of Greyhollow sells you an iron charm: '+charmName({k:kk})+', for '+c+' gold (in the Army tab\'s pouch).'; }
  if(k==='relic'){ const c=vilPrice(v,VIL_RELIC), f=faithOf(); S.gold-=c; deed(f,DEV_SHRINE/DEED_K[f]); m='You buy a saint\'s finger-bone for '+c+' gold. '+FAITH[f].name+' is pleased.'; }
  if(k==='incense'){ const c=vilPrice(v,VIL_INCENSE); S.gold-=c; dread(-VIL_INCENSE_DREAD); m='Incense from Saint Aldric\'s burns in your streets ('+c+' gold). The living breathe easier.'; }
  if(k==='tribute'){ const c=VIL_TRIB*priceK(); S.gold-=c; x.td=S.day; tally('tribute'); stand(v,VIL_TRIB_ST,'tribute'); m='You pay '+V.name+' a tribute of '+c+' gold. They take it, and remember it.'; }
  if(k==='worker'){ const M=S.map, b=M.bodies.shift(); m='You send '+cleanText(b.c.name)+' to Greyhollow to work the seams. '+favDone(v); }
  if(m===null) return null; vilMet(v);
  if(['salt','draught','ore','charm','relic','incense'].includes(k)){ stand(v,VIL_TRADE); tally('vilTrade'); }
  notify(m,'ok'); return m;
}
const vilMet=v=>{ if(!vilGone(v)) unlockStory('vil_'+v+'1'); };   // first dealings: the village's first passage
// ----- the dark path: raiding a village
function raidStart(id){   // the walk (it must leave a watch), then the raid spends one: a fight against the militia and the village's best
  const v=vilNode(id); if(!v||vilGone(v)||S.mode!=='town'||!mapCan(id,2)||!mapGo(id,1)) return false; S.watches--; tally('mapSites');
  const sg=Math.max(0,Math.min(GATE_N-1,topGate())); S.runs++; S.notices=[];
  S.run={di:sg,sv:'raid',svId:id,svE:null,svV:v,room:0,rooms:1,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:null,heat:0};
  S.mode='battle'; titheSouls(); log('Your dead come down on '+VILLAGES[v].name+' at dusk. The militia bar the road; bells ring behind them.'); spawnRoom(); return true;
}
function raidRoom(list,r){   // svRoom: three of the militia and the village's best (an elite; at Saint Aldric's, its knight, unless he rides with you)
  const sg=r.di, lv=RK[sg].lv+1, F=SIEGE_FOES, P=VIL_PEOPLE[r.svV]; ['vanguard','striker','vanguard'].forEach(ro=>list.push(svFoe(F[ro][0],ro,F[ro][1],F[ro][2],sg,lv)));
  if(P.best==='knight'&&!knightOn()) list.unshift(svFoe(KNIGHT[0],KNIGHT[1],KNIGHT[2],KNIGHT[3],sg,lv+1,true));
  else { const ro=P.best==='knight'?'mender':P.best; list.unshift(svFoe(F[ro][0],ro,F[ro][1],F[ro][2],sg,lv+1,true)); }
  return list;
}
function raidWon(r){   // svCleared: its people as bodies, gold and goods; standing, the dread and the Inquisition pay for it
  const v=r.svV, V=VILLAGES[v], x=vil(v), P=VIL_PEOPLE[v], M=mapSt(), sg=r.di, n=VIL_RAID_N[0]+Math.floor(Math.random()*(VIL_RAID_N[1]-VIL_RAID_N[0]+1)), take=Math.min(n,Math.max(0,x.pop));
  for(let i=0;i<take;i++){ const p=P.p[i%P.p.length], f=SIEGE_FOES[p[1]]; mapBody({name:p[0],base:f[0],role:p[1],rankI:sg,lvl:Math.max(1,S.player.lvl-2),hf:f[1],af:f[2],boss:false,elite:false,cd:P.cd},V.node); }
  const g=Math.round(VIL_RAID_GOLD*priceK()*(1+sg*.1)); S.gold+=g; let goods='';
  if(v==='mill'){ const s=vilAll(); s.salt=Math.min(VIL_SALT_MAX,(s.salt|0)+2); goods=', two sacks of grain-salt'; }
  if(v==='grey'){ M.ore=Math.min(ORE_HOLD,(M.ore|0)+2); goods=', two lumps of ore'; }
  if(v==='aldric'&&faithOf()==='dis'){ deed('dis',DEV_SHRINE/DEED_K.dis); goods=', and the Dissonance drinks the bells\' silence'; }
  const lost=VIL_RAID_POP[0]+Math.floor(Math.random()*(VIL_RAID_POP[1]-VIL_RAID_POP[0]+1)); x.pop=Math.max(0,x.pop-lost); tally('raidsV'); tally('raid_'+v);
  stand(v,-VIL_RAID_ST,'a raid'); VIL_IDS.filter(o=>o!==v).forEach(o=>stand(o,-VIL_RAID_ALL,'a raid on '+V.name)); dread(VIL_RAID_DREAD); const inq=raidInquisition();
  r.events.push({m:'You take '+take+' of '+V.name+'\'s people (to raise before dawn), '+g+' gold'+goods+'. '+x.pop+' souls are left there.',c:'ok'});
  if(inq) r.events.push({m:inq,c:'bad'});
  if(x.pop<=0){ x.gone=1; delete x.fav; tally('abandoned'); if(v==='aldric') delete vilAll().knight; unlockStory('vil_'+v+'3',r); r.events.push({m:V.name+' is abandoned. No one will trade or ask favors there again; its graveyard at '+VALLEY_NODES[V.gy].name+' lies open and deep.',c:'bad'}); }
  return Math.round(RK[r.di].clear*.5);
}
function raidInquisition(){   // a raid reaches the Inquisition: the next siege comes sooner and a tier harder
  if(!siegeOpen()) return ''; const g=sg(); let m=''; if(g.rd) return '';   /* once until that siege is fought */
  if(g.next&&!g.pending&&g.next>S.day+1){ g.next=Math.max(S.day+1,g.next-VIL_RAID_SOONER); m='The Inquisition hears of the raid: the next siege comes '+VIL_RAID_SOONER+' days sooner'; }
  g.rd=1; if(STIERS_ON&&VIL_RAID_TIER){ const t=stierRaw(); if(t<STIER_MAX){ g.tier=t+1; g.rd=2; m=(m?m+', and at tier '+g.tier:'The Inquisition hears of the raid: the next siege comes at tier '+g.tier)+' ('+STIERS[g.tier-1].name+')'; } }   /* one siege only: siegeEnd takes the tier back (raidTierBack) */
  return m?m+'.':'';
}
function raidTierBack(){ const g=sg(); if(!g.rd) return; const up=g.rd===2; delete g.rd; if(up) g.tier=Math.max(1,stierRaw()-1); }   // siegeEnd: the raid's tier was for one siege
// ----- the bright path: allegiance
function knightUnit(){   // the companion: a living ally made for the fight (a thrall: never saved past it, never raised, never evolved)
  const P=S.player, st=vilSt('aldric'), lv=clamp(P.lvl-3+Math.floor((st-VIL_ALLY)/10),1,P.lvl+1), rk=Math.max(0,Math.min(GATE_N-1,topGate()));
  const m={uid:++S.uid,armed:false,eq:null,nick:KNIGHT_NICK,name:KNIGHT[0],kind:KNIGHT[0],role:KNIGHT[1],rankI:rk,lvl:lv,lvl0:lv,xp:0,boss:false,elite:false,hf:KNIGHT[2],af:KNIGHT[3],hp:1,maxHp:null,atk:0,stage:0,traits:['stalwart'],thrall:true,knight:1};
  syncMinion(m); m.hp=m.maxHp; return m;
}
function knightJoin(r){ if(!knightOn()||!r||S.army.some(m=>m.knight)) return false; S.army.push(knightUnit()); tally('knightRides'); log(KNIGHT_NICK+' of Saint Aldric\'s rides at your side.','ok'); return true; }   // startRun, beginSiege
const knightLeave=()=>{ if(S&&S.army) S.army=S.army.filter(m=>!m.knight); };   // returnTown
function vilAid(r){   // beginSiege: Miller's Ford's militia hold the first wave, once a week, in allegiance
  if(!vilAlly('mill')||!r||r.room!==0) return false; const x=vil('mill'); if(x.aid===vilWeek()) return false; x.aid=vilWeek(); r.room=1; tally('vilAid'); log('The militia of Miller\'s Ford hold the first wave at the river road. The living who reach your walls are fewer.','ok'); return true;
}
function vilMobs(list,r){   // townSiegeWave: each village at -60 or worse sends a mob with the first wave
  if(!VIL_ON||!S.vil||!r||r.room!==0) return; const t=list.find(e=>!e.boss&&e.role==='vanguard')||list.find(e=>!e.boss); if(!t) return;
  for(const v of VIL_IDS) if(!vilGone(v)&&vilSt(v)<=VIL_SHUT){ for(let i=0;i<VIL_MOB;i++) list.push(Object.assign({},t,{id:'e'+(++S.uid),elite:false,st:undefined,dots:undefined})); tally('vilMobs'); log('A mob from '+VILLAGES[v].name+' marches with them, torches and pitchforks.','bad'); }
}
const vilEmbDays=()=>vilAlly('mill',VIL_KNIGHT_AT)?VIL_EMB:0;   // embDays: Miller's Ford's salt stores
const vilForge=()=>vilAlly('grey',VIL_KNIGHT_AT);   // hfReroll: Greyhollow's forge-master
const vilGyK=id=>VIL_IDS.some(v=>vilGone(v)&&VILLAGES[v].gy===id)?VIL_GY_BIG:1;   // siteBodies: an abandoned village's graveyard
// ----- the battlefield burial (Saint Aldric's favor) and the escort fight
const buryOpen=id=>VALLEY_NODES[id]&&VALLEY_NODES[id].k==='field'&&favOpen('aldric','bury')&&siteReady(id);
function buryField(id){   // walk a fresh battlefield and bury its dead: no bodies, the favor done
  if(!buryOpen(id)||S.mode!=='town'||!mapGo(id,1)) return null; delete siteState(id).fresh; tally('buried'); tally('mapSites');
  const m='You bury the fallen at '+VALLEY_NODES[id].name+' as Saint Aldric\'s asked. '+favDone('aldric'); return m;
}
function escortRoom(list,r){   // svRoom: what waits on the cart's road (Miller's Ford: wolves; Greyhollow: iron things; Saint Aldric's: the nearest gate's kinds)
  const sg=r.di, lv=RK[sg].lv+1, v=r.svV;
  if(v==='mill'){ const b=BEASTS; list.push(svFoe(b.wolf[0],b.wolf[1],b.wolf[2],b.wolf[3],sg,lv,true)); list.push(svFoe(b.wolf[0],b.wolf[1],b.wolf[2],b.wolf[3],sg,lv)); list.push(svFoe(b.crow[0],b.crow[1],b.crow[2],b.crow[3],sg,lv)); }
  else { const M=(v==='grey'?DUNGEONS[4].mobs:DUNGEONS[nearGate(VILLAGES[v].node)].mobs).filter(m=>m[1]!=='hexer'); for(let i=0;i<3;i++){ const m=pick(M); list.push(svFoe(m[0],m[1],m[2],m[3],sg,lv,i===0)); } }
  return list;
}
function escortWon(r){ tally('escorts'); r.events.push({m:'The cart reaches '+VILLAGES[r.svV].name+' whole. '+favDone(r.svV),c:'ok'}); }
// ----- hooks into the other systems
function vilDawn(){   // closeDay: the town's dread reaches the villages; Greyhollow's weekly ore
  if(!VIL_ON||!S.vil) return;
  if(S.day%7===1&&vilAlly('grey')){ const M=mapSt(); M.ore=Math.min(ORE_HOLD,(M.ore|0)+VIL_ALLY_ORE); tally('oreDelivered'); notify('Greyhollow\'s cart brings '+VIL_ALLY_ORE+' lumps of ore, as it does each week for its friends.','ok'); }
  if(!dreadOn()) return; const b=dreadBand().id;
  if(b==='terror') standAll(-VIL_BAND,'the Terror'); else if(b==='calm') standAll(VIL_BAND,'a calm town');
}
function vilSalt(M){   // mapDawn: grain-salt keeps dug bodies through the dawn (one sack a body); returns the bodies kept
  const s=S.vil, B=M.bodies||[]; if(!s||!(s.salt>0)||!B.length) return []; const n=Math.min(s.salt,B.length), keep=B.slice(0,n); s.salt-=n; if(!s.salt) delete s.salt; tally('salted',n);
  notify('Grain-salt keeps '+n+' dug bod'+(n>1?'ies':'y')+' through the dawn.','ok'); return keep;
}
function vilGrave(sid){ if(!VIL_ON) return; for(const v of VIL_IDS) if(VILLAGES[v].gy===sid) stand(v,-VIL_GRAVE,'their dead raised'); }   // siteRaise: a body from a village's graveyard rose
// ----- the save
function vilFix(g){   // normalizeSave
  if(!('vil' in g)) return; const q=g.vil&&typeof g.vil==='object'?g.vil:{}, o={};
  for(const v of VIL_IDS){ const x=q[v]&&typeof q[v]==='object'?q[v]:{}, y={st:clamp(Math.round(isFinite(x.st)?+x.st:VIL_ST0),-100,100),pop:clamp(Math.floor(isFinite(x.pop)?+x.pop:VILLAGES[v].pop),0,999)};
    const f=x.fav; if(f&&typeof f==='object'&&VILLAGES[v].favors.includes(f.k)&&isFinite(f.w)) y.fav={w:Math.max(0,Math.floor(f.w)),k:f.k,done:f.done?1:0};
    if(isFinite(x.td)&&x.td>0) y.td=Math.floor(x.td); if(isFinite(x.cw)&&x.cw>=0) y.cw=Math.floor(x.cw); if(isFinite(x.aid)&&x.aid>=0) y.aid=Math.floor(x.aid); if(x.gone||y.pop<=0){ y.gone=1; y.pop=0; delete y.fav; } o[v]=y; }
  if(isFinite(q.salt)&&q.salt>0) o.salt=Math.min(VIL_SALT_MAX,Math.floor(q.salt)); if(isFinite(q.bless)&&q.bless>0) o.bless=Math.floor(q.bless); if(q.knight&&o.aldric&&!o.aldric.gone) o.knight=1;
  g.vil=o;
}
// ----- titles, tip
[['vl_mill','Friend of the Ford','Win Miller\'s Ford\'s allegiance (standing '+VIL_ALLY+').',()=>vilSt('mill')>=VIL_ALLY,{hpp:3},3],
 ['vl_grey','Greyhollow\'s Debt','Win Greyhollow\'s allegiance (standing '+VIL_ALLY+').',()=>vilSt('grey')>=VIL_ALLY,{goldp:3},3],
 ['vl_aldric','Saint\'s Keeper','Win Saint Aldric\'s allegiance (standing '+VIL_ALLY+').',()=>vilSt('aldric')>=VIL_ALLY,{xpp:3},3],
 ['vl_empty','Empty Valley','Raid all three villages until no one is left in them.',()=>VIL_IDS.every(vilGone),{dmgp:4},4],
 ['vl_neither','Neither Feared nor Loved','Reach day 100 with every village standing within 10 of nothing.',()=>S.day>=100&&!!S.vil&&VIL_IDS.every(v=>!vilGone(v)&&Math.abs(vilSt(v))<=10),{goldp:4},4],
 ['vl_knight','The Knight\'s Oath','Win the oath of Saint Aldric\'s knight (standing '+VIL_KNIGHT_AT+').',()=>T_('knightJoined')>=1,{hpp:4},4]
].forEach(([id,name,req,ok,b,r])=>{ for(const k in b) b[k]=Math.max(b[k],Math.round(b[k]*RARITY_MUL[r])); TITLE_RARITY[id]=r; const t={id,grp:'Deeds',name,req,ok,b,r}; TITLES.push(t); TITLE[id]=t; });
TIPS.push({id:'villages',t:'The villages',m:'Three villages of the living stand in the valley. Each remembers what you do: favors, trade, tribute, sieges, the dead you raise from their graveyards. Visit one from the Valley map to see its stall and this week\'s favor.',when:()=>S.mode==='town'&&MAP_ON&&S.day>=6});
TIP_META.villages=['sys','villages'];
STORY.push(   // R20 PR B: each village's first dealings, allegiance and abandonment
  {act:4,id:'vil_mill1',t:'Miller\'s Ford',when:()=>false,m:'The miller met you at the ford with a lantern and a cudgel, and did not use either. He looked at your dead for a long time. "They worked these fields once," he said. "Some of them I knew." Then he named a price for his salt, and it was a fair one.'},
  {act:4,id:'vil_mill2',t:'The ford keeps faith',when:()=>false,m:'Miller\'s Ford has stopped barring its doors at night. The children leave bread on the stones by the river for the dead who walk past, and the militia drill on the far bank in case the living come for you. The Ledger writes the village\'s name in a plain hand, without ornament, as one writes the name of a neighbour.'},
  {act:4,id:'vil_mill3',t:'The fields lie fallow',when:()=>false,m:'No smoke rises over Miller\'s Ford. The wheel turns with no one to stop it, grinding nothing, and the river carries flour to the sea. The Ledger has their names now, every one, and it is a long page. It does not say whether you wanted them.'},
  {act:4,id:'vil_grey1',t:'Greyhollow',when:()=>false,m:'The foreman of Greyhollow spat at your feet and then shook your hand, which is how they do business in the hills. "The iron things dig toward our tunnels," she said. "Kill them, and we will talk. Do not kill them, and we will still talk, but louder." The Ledger noted the debt.'},
  {act:4,id:'vil_grey2',t:'A debt paid in ore',when:()=>false,m:'Greyhollow sends its ore down the hill each week without being asked, and the forge-master has started signing her work with your mark. The miners say the dead are better neighbours than the abbey ever was. The Ledger records the debt as settled, and then, after a pause, as owed the other way.'},
  {act:4,id:'vil_grey3',t:'The seams fall silent',when:()=>false,m:'Greyhollow is empty. Picks lie where they were dropped, and the lamps in the deep seams burn down one by one with no one to trim them. The mountain keeps the miners it did not give you. The Ledger writes the town\'s last line in iron-grey ink.'},
  {act:4,id:'vil_aldric1',t:'Saint Aldric\'s',when:()=>false,m:'The bells of Saint Aldric\'s rang the whole time you stood at its gate, and the monks would not look at you. Only the knight did, from the wall, with his hand on his sword. "Buy what you came for," the abbot said at last, "and go before the bells crack."'},
  {act:4,id:'vil_aldric2',t:'The bells fall quiet',when:()=>false,m:'Saint Aldric\'s no longer rings its bells when you come. The abbot says it is because they have cracked; the knight says it is because they have learned. Your menders hum the village\'s hymns now, without knowing the words. The Ledger does not know what to make of a keeper the pious can bear.'},
  {act:4,id:'vil_aldric3',t:'No one left to pray',when:()=>false,m:'The pilgrims\' road is empty, and the bells of Saint Aldric\'s hang still. You have the monks, and the pilgrims, and the abbot who rang for you. The Ledger wrote their names gladly. For a long while afterward its pages smell of incense, and it will not say why.'});
['vil_mill1','vil_mill2','vil_mill3','vil_grey1','vil_grey2','vil_grey3','vil_aldric1','vil_aldric2','vil_aldric3'].forEach(id=>{ STORY_BY[id]=STORY.find(x=>x.id===id); });
