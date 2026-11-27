// ===== R20 PR A: THE VILLAGES OF THE LIVING =====
// Three villages on the Valley map give the living faces: Miller's Ford (river farmers), Greyhollow (a mining town) and
// Saint Aldric's (a pilgrim town). Each has a standing with you (-100 hatred .. +100 allegiance, from VIL_ST0) and a
// population. Standing moves with deeds: a weekly favor done, trade, tribute, sieges won or lost (they hear of it), bodies
// raised from the graveyard they bury their dead in, the town's dread (Terror a point down a day, Calm a point up), the
// pilgrims on the road and the shrines. Standing sets the stall's prices (up to 25% either way); at VIL_SHUT and below the
// village will not trade or ask favors. Walking there is a walk like any site's (it must leave a watch); trade and tribute
// keep that watch, and so does an escort favor: a fight on the cart's road (a run flagged r.sv='escort'), like the road's encounters.
// S.vil = {mill:{st, pop, fav:{w, k, done}, td}, grey:{...}, aldric:{...}, salt, bless}. Raids, allegiance and the
// companion come in PR B.
const VIL_ST0=-20, VIL_SHUT=-60, VIL_ALLY=60, VIL_FRIEND=20, VIL_TRADE=1, VIL_TRIB=25, VIL_TRIB_ST=5, VIL_FAV=10, VIL_SIEGE_WON=3, VIL_SIEGE_LOST=5,
  VIL_GRAVE=3, VIL_BAND=1, VIL_PILGRIM=3, VIL_TAKE=5, VIL_DESECRATE=5, VIL_PRICE=400, VIL_SALT=6, VIL_SALT_MAX=6, VIL_POT=.7, VIL_ORE=20, VIL_CHARM=60,
  VIL_RELIC=15, VIL_INCENSE=10, VIL_INCENSE_DREAD=3, VIL_BLESS=.05, VIL_BLESS_DAYS=7, VIL_FAV_GOLD=20;
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
const vilShut=v=>vilSt(v)<=VIL_SHUT;
function stand(v,n,why){   // move a village's standing; a new band is announced
  if(!VIL_ON||!VILLAGES[v]||!n) return 0; const x=vil(v), b0=vilBand(v).id; x.st=clamp(Math.round(x.st+n),-100,100); const b=vilBand(v);
  if(b.id!==b0){ notify(VILLAGES[v].name+': your standing is now '+b.name+(why?' ('+why+')':''),VIL_BANDS.indexOf(b)>VIL_BANDS.findIndex(y=>y.id===b0)?'ok':'bad'); tally('vband_'+b.id); }
  return n;
}
const standAll=(n,why)=>VIL_IDS.forEach(v=>stand(v,n,why));
const vilPriceK=v=>1-vilSt(v)/VIL_PRICE;
const vilPrice=(v,base)=>Math.max(1,Math.round(base*priceK()*vilPriceK(v)));
const vilPot=v=>Math.max(1,Math.round(POTIONS.hp.price()*VIL_POT*vilPriceK(v)));
const vilBlessK=()=>S.vil&&S.vil.bless>=S.day?1+VIL_BLESS:1;   // healK: Saint Aldric's blessing
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
  const f=vilFav(v); if(!shut&&!f.done){ if(f.k==='cart') add('escort','Escort the cart: a fight on the road',S.mode!=='town'?'Only from town.':'');
    if(f.k==='worker'){ const B=(S.map&&S.map.bodies)||[]; add('worker','Send them a worker'+(B.length?': '+cleanText(B[0].c.name):''),B.length?'':'Dig a body first: they want one of today\'s.'); } }
  return out;
}
function vilWhy(id,k){ const v=vilNode(id); if(!v) return 'No such village.'; const o=vilOpts(v).find(x=>x.k===k); if(!o) return 'No such choice.'; if(o.why) return o.why;
  if(S.mode!=='town') return 'Only from town.'; if(!mapCan(id,1)) return 'Too far for the watches left today.'; return ''; }
function vilAct(id,k){   // walk there and take the choice; returns a line, '' for a fight begun, or null
  if(vilWhy(id,k)) return null; const v=vilNode(id), V=VILLAGES[v], x=vil(v), s=vilAll(); let m=null;
  if(k==='escort') return svStart(id,false,v)?'':null;   /* the walk and the watch (game-roads.js) */
  if(!mapGo(id,1)) return null;
  if(k==='salt'){ const c=vilPrice(v,VIL_SALT); S.gold-=c; s.salt=(s.salt|0)+1; m='You buy a sack of grain-salt for '+c+' gold ('+s.salt+' held). A salted body keeps through a dawn.'; }
  if(k==='draught'){ const c=vilPot(v); S.gold-=c; S.belt.hp++; m='The miller\'s wife sells you a Healing Draught for '+c+' gold.'; }
  if(k==='ore'){ const c=vilPrice(v,VIL_ORE), M=mapSt(); S.gold-=c; M.ore=(M.ore|0)+1; tally('ore'); m='You buy a lump of ore for '+c+' gold ('+M.ore+' held).'; }
  if(k==='charm'){ const c=vilPrice(v,VIL_CHARM), kk=ironKit(); S.gold-=c; x.cw=vilWeek(); S.charms=Array.isArray(S.charms)?S.charms:[]; S.charms.push({k:kk,src:'Greyhollow'}); tally('charms'); m='The smith of Greyhollow sells you an iron charm: '+charmName({k:kk})+', for '+c+' gold (in the Army tab\'s pouch).'; }
  if(k==='relic'){ const c=vilPrice(v,VIL_RELIC), f=faithOf(); S.gold-=c; deed(f,DEV_SHRINE/DEED_K[f]); m='You buy a saint\'s finger-bone for '+c+' gold. '+FAITH[f].name+' is pleased.'; }
  if(k==='incense'){ const c=vilPrice(v,VIL_INCENSE); S.gold-=c; dread(-VIL_INCENSE_DREAD); m='Incense from Saint Aldric\'s burns in your streets ('+c+' gold). The living breathe easier.'; }
  if(k==='tribute'){ const c=VIL_TRIB*priceK(); S.gold-=c; x.td=S.day; tally('tribute'); stand(v,VIL_TRIB_ST,'tribute'); m='You pay '+V.name+' a tribute of '+c+' gold. They take it, and remember it.'; }
  if(k==='worker'){ const M=S.map, b=M.bodies.shift(); m='You send '+cleanText(b.c.name)+' to Greyhollow to work the seams. '+favDone(v); }
  if(m===null) return null;
  if(['salt','draught','ore','charm','relic','incense'].includes(k)){ stand(v,VIL_TRADE); tally('vilTrade'); }
  notify(m,'ok'); return m;
}
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
function vilDawn(){   // closeDay: the town's dread reaches the villages
  if(!VIL_ON||!S.vil||!dreadOn()) return; const b=dreadBand().id;
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
    if(isFinite(x.td)&&x.td>0) y.td=Math.floor(x.td); if(isFinite(x.cw)&&x.cw>=0) y.cw=Math.floor(x.cw); o[v]=y; }
  if(isFinite(q.salt)&&q.salt>0) o.salt=Math.min(VIL_SALT_MAX,Math.floor(q.salt)); if(isFinite(q.bless)&&q.bless>0) o.bless=Math.floor(q.bless);
  g.vil=o;
}
// ----- titles, tip
[['vl_mill','Friend of the Ford','Win Miller\'s Ford\'s allegiance (standing '+VIL_ALLY+').',()=>vilSt('mill')>=VIL_ALLY,{hpp:3},3],
 ['vl_grey','Greyhollow\'s Debt','Win Greyhollow\'s allegiance (standing '+VIL_ALLY+').',()=>vilSt('grey')>=VIL_ALLY,{goldp:3},3],
 ['vl_aldric','Saint\'s Keeper','Win Saint Aldric\'s allegiance (standing '+VIL_ALLY+').',()=>vilSt('aldric')>=VIL_ALLY,{xpp:3},3]
].forEach(([id,name,req,ok,b,r])=>{ for(const k in b) b[k]=Math.max(b[k],Math.round(b[k]*RARITY_MUL[r])); TITLE_RARITY[id]=r; const t={id,grp:'Deeds',name,req,ok,b,r}; TITLES.push(t); TITLE[id]=t; });
TIPS.push({id:'villages',t:'The villages',m:'Three villages of the living stand in the valley. Each remembers what you do: favors, trade, tribute, sieges, the dead you raise from their graveyards. Visit one from the Valley map to see its stall and this week\'s favor.',when:()=>S.mode==='town'&&MAP_ON&&S.day>=6});
TIP_META.villages=['sys','villages'];
