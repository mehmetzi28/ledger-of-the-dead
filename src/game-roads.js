// ===== R19 PR B: THE VALLEY'S OTHER SITES, THE ROADS AND SCOUTING =====
// The nodes and roads are in game-map.js. A site is a place that is not a gate: one visit is one choice or one fight, then it
// rests SITE_REST[kind] days (S.map.sites[id].rest, the day it is ready again). Choice sites walk there when you pick (a site
// needs a watch in hand but none left over); the mine and the wolf den are fights (a run: the walk, then a watch).
//   shrine (one per god)   pray (your god: devotion), swear (unsworn), convert (another's), desecrate (the Profane)
//   crossroads             the day's stranger: a pedlar (a potion at half price), a bounty (trophies for gold), the raven, a map-seller
//   hermit's hut           trophies for a torn page, or a lesson (a kind you are studying is studied at once)
//   old iron mine          two rooms of the Iron Orchard's kinds at your best gate's level: ore (each makes heart-forging 10% cheaper)
//   gallows hill           cut down the hanged (a hexer's body), or sing for them (the Choir's devotion, else the town calms)
//   the nine stones        call tomorrow's omen, any of the gods' omens, once a week
//   the ford               pay the ferryman (a step less on every longer walk today), or search the shallows (a Preserved body)
//   the wolf den           beasts (Dire Wolf, Carrion Crows, Grave Bear): pelts; every DEN_PELTS of them make a charm
// Road encounters: each step walked has ENC_CH (more at Terror) of one, held until dawn (S.map.enc): a patrol of the living (fight
// or bribe), a wandering elite (fight), a corpse cart (bodies for gold), a pilgrim (spare: the town calms; or take the body).
// Scouting: a step to look down a road at an unknown place next to a known one. The War Room at level 2 scouts one at dawn; the
// raven (the crossroads stranger, or the Library at level 3) scouts one too and shows where the nemeses walk.
const SITE_REST={shrine:7,cross:3,hermit:7,mine:5,gallows:7,stones:7,ford:3,den:5};
const SITE_KINDS=Object.keys(SITE_REST), SITE_FIGHT=['mine','den'];
const ENC_CH=.05, ENC_TERROR=.05, ENC_KINDS=['patrol','elite','cart','pilgrim'], CART_N=2, CART_GOLD=6, BRIBE_GOLD=8, PILGRIM_DREAD=2;
const ORE_K=.1, ORE_MAX=5, ORE_HOLD=10, DEN_PELTS=3, FORD_TOLL=3, HERMIT_TRO=4, BOUNTY_TRO=3, BOUNTY_GOLD=12, RAVEN_GOLD=300, MAPSELL_GOLD=60, GALLOWS_DREAD=1, SCOUT_STEPS=1;
const BEASTS={wolf:['Dire Wolf','striker',.9,1.2],crow:['Carrion Crows','reaper',.6,1.15],bear:['Grave Bear','vanguard',1.6,.9]};   // [name, role, hp factor, atk factor]
const BEAST_NAMES=Object.values(BEASTS).map(b=>b[0]);
Object.assign(KIT_OF,{'Dire Wolf':'pack','Carrion Crows':'skirm','Grave Bear':'frenzy'});
const isSite=id=>!!VALLEY_NODES[id]&&SITE_KINDS.includes(VALLEY_NODES[id].k);
const siteKind=id=>(VALLEY_NODES[id]||{}).k;
const beastKills=()=>BEAST_NAMES.reduce((a,n)=>a+((S.kills&&S.kills[n])|0),0);
const oreUse=()=>Math.min(ORE_MAX,(S.map&&S.map.ore)|0);
const oreK=()=>MAP_ON?1-ORE_K*oreUse():1;   // heartforge: each ore held (up to ORE_MAX) takes 10% off the gold, and is spent
const ravenOn=()=>!!(S.map&&S.map.raven);
const priceK=()=>Math.max(1,S.player.lvl);
// ----- choices: what a site offers now ({k, t: the button, why: '' or why not})
function crossOffer(id){ const h=dayHash(S.day,7919,MAP_IDS.indexOf(id)); const o=['pedlar','bounty','stranger'][h%3]; return o==='stranger'&&ravenOn()?'mapsell':o; }
const crossPot=id=>Object.keys(POTIONS)[dayHash(S.day,31,MAP_IDS.indexOf(id))%Object.keys(POTIONS).length];
function bountyKind(){ const t=S.trophies||{}; return Object.keys(t).filter(k=>!k.startsWith('b:')&&t[k]>=BOUNTY_TRO).sort((a,b)=>t[b]-t[a]||(a<b?-1:1))[0]||null; }
function hermitKind(){ const t=S.trophies||{}; return Object.keys(t).filter(k=>!k.startsWith('b:')&&t[k]>=HERMIT_TRO).sort((a,b)=>t[b]-t[a]||(a<b?-1:1))[0]||null; }
function lessonKind(){ const K=S.kills||{}; return allNames().concat(SIEGE_NAMES,BEAST_NAMES).filter(n=>(K[n]|0)>0&&(K[n]|0)<KNOW_AT).sort((a,b)=>(K[b]|0)-(K[a]|0)||(a<b?-1:1))[0]||null; }
function gallowsBody(id){ for(let g=nearGate(id);g>=0;g--){ const m=DUNGEONS[g].mobs.find(x=>x[1]==='hexer'); if(m) return {m,g}; } return null; }
function stoneOmens(id){ const L=[...new Set(GODS.flatMap(g=>godOmens(g)))].filter(o=>OMENS[o]); const h=dayHash(Math.floor(S.day/7),97,MAP_IDS.indexOf(id)); return [0,1,2].map(i=>L[(h+i*5)%L.length]).filter((o,i,a)=>a.indexOf(o)===i); }
function siteOpts(id){
  const n=VALLEY_NODES[id]; if(!isSite(id)) return []; const out=[], add=(k,t,why)=>out.push({k,t,why:why||''}), P=S.player, f=faithOf(), gold=c=>S.gold>=c?'':'Needs '+c+' gold.';
  if(n.k==='shrine'){ const g=n.g;
    if(f===g) add('pray','Pray: +'+DEV_SHRINE+' devotion');
    else if(!f) add('swear','Swear your oath to '+FAITH[g].name,faithOpen()?'':'You may swear an oath from level '+FAITH_LV+'.');
    else { add('convert','Convert to '+FAITH[g].name+' (keep half your devotion)'); if(f==='dis') add('desecrate','Desecrate it: gold and devotion'); } }
  if(n.k==='cross'){ const o=crossOffer(id);
    if(o==='pedlar'){ const k=crossPot(id), c=Math.ceil(POTIONS[k].price()/2); add('pedlar','Buy a '+POTIONS[k].name+' for '+c+' gold',S.belt[k]>=beltMax()?'Your belt is full.':gold(c)); }
    if(o==='bounty'){ const k=bountyKind(); add('bounty','Hand over '+BOUNTY_TRO+' trophies for '+BOUNTY_GOLD*priceK()+' gold',k?'':'Needs '+BOUNTY_TRO+' trophies of one kind.'); }
    if(o==='stranger') add('raven','Buy the stranger\'s raven for '+RAVEN_GOLD+' gold',gold(RAVEN_GOLD));
    if(o==='mapsell') add('mapsell','Buy a map of two unknown places for '+MAPSELL_GOLD+' gold',!scoutable().length?'Nothing on the roads is unknown to you.':gold(MAPSELL_GOLD)); }
  if(n.k==='hermit'){ const k=hermitKind(), why=k?'':'Needs '+HERMIT_TRO+' trophies of one kind.';
    add('page','Trade '+HERMIT_TRO+' trophies for a torn page',why||(nextPage()<0?'He has no page you can read yet.':''));
    const l=lessonKind(); add('lesson','Trade '+HERMIT_TRO+' trophies for a lesson'+(l?' on '+l:''),why||(l?'':'You are studying no kind.')); }
  if(n.k==='mine') add('fight','Go down the mine (two rooms)',S.mode!=='town'?'Only from town.':'');
  if(n.k==='den') add('fight','Go into the den',S.mode!=='town'?'Only from town.':'');
  if(n.k==='gallows'){ const b=gallowsBody(id); add('cut','Cut down the hanged: a hexer\'s body',b?'':'No hexer hangs here yet.'); add('sing',f==='choir'?'Sing for them: +'+DEV_SHRINE+' devotion':'Sing for them: the town calms'); }
  if(n.k==='stones') for(const o of stoneOmens(id)) add('call:'+o,'Call '+OMENS[o].name+' for tomorrow',S.omenNext&&S.omenNext.day===S.day+1&&S.omenNext.by==='stones'?'Tomorrow is already called.':'');
  if(n.k==='ford'){ add('toll','Pay the ferryman '+FORD_TOLL*priceK()+' gold: a step less on longer walks today',S.map&&S.map.ford===S.day?'You paid today.':gold(FORD_TOLL*priceK())); add('search','Search the shallows for a drowned body'); }
  return out;
}
const siteNeed=()=>1;   // every site wants a watch left after the walk: a fight spends it, a choice keeps it (a day never ends on the road)
function siteWhy(id,k){ const o=siteOpts(id).find(x=>x.k===k); if(!o) return 'No such choice.'; if(o.why) return o.why; if(S.mode!=='town') return 'Only from town.'; if(!siteReady(id)) return 'It rests.'; if(!mapCan(id,siteNeed(id))) return 'Too far for the watches left today.'; return ''; }
function siteAct(id,k){   // walk there and take the choice; returns a line for the screen, or null
  if(siteWhy(id,k)) return null; const n=VALLEY_NODES[id];
  if(SITE_FIGHT.includes(n.k)) return svStart(id)?'':null;
  const c=siteChoice(id,k,true); if(c===null) return null;   // dry run first: nothing is spent on a refused choice
  if(!mapGo(id,1)) return null; const m=siteChoice(id,k,false); if(m===null) return null;
  siteState(id).rest=S.day+SITE_REST[n.k]; tally('mapSites'); tally('site_'+n.k); notify(m,'ok'); return m;
}
function siteChoice(id,k,dry){   // the choice itself; dry: only say whether it can be done (null: no)
  const n=VALLEY_NODES[id], P=S.player, f=faithOf();
  if(k==='pray'){ if(f!==n.g) return null; if(!dry){ deed(n.g,DEV_SHRINE/DEED_K[n.g]); favHook('shrine'); } return 'You pray at '+n.name+'. '+FAITH[n.g].name+' hears you.'; }
  if(k==='swear'){ if(f||!faithOpen()) return null; if(!dry){ if(!swear(n.g)) return null; favHook('shrine'); } return 'You swear your oath to '+FAITH[n.g].name+' at '+n.name+'.'; }
  if(k==='convert'){ if(!f||f===n.g) return null; if(!dry){ if(!convert(n.g)) return null; favHook('shrine'); } return 'You kneel to '+FAITH[n.g].name+' at '+n.name+'. Half your devotion comes with you.'; }
  if(k==='desecrate'){ if(f!=='dis'||n.g==='dis') return null; const g=Math.round((10+P.lvl*3)*(1+topGate())*ngpReward()); if(!dry){ S.gold+=g; deed('dis',10/DEED_K.dis); tally('desecrated'); stand('aldric',-VIL_DESECRATE,'a shrine broken'); } return 'You break '+n.name+' and take '+g+' gold from its offerings.'; }
  if(k==='pedlar'){ if(crossOffer(id)!=='pedlar') return null; const p=crossPot(id), c=Math.ceil(POTIONS[p].price()/2); if(S.gold<c||S.belt[p]>=beltMax()) return null; if(!dry){ S.gold-=c; S.belt[p]++; } return 'A pedlar at the crossroads sells you a '+POTIONS[p].name+' for '+c+' gold.'; }
  if(k==='bounty'){ if(crossOffer(id)!=='bounty') return null; const t=bountyKind(), g=BOUNTY_GOLD*priceK(); if(!t) return null; if(!dry){ S.trophies[t]-=BOUNTY_TRO; if(!S.trophies[t]) delete S.trophies[t]; S.gold+=g; tally('bountyCross'); } return 'A bounty-man pays '+g+' gold for '+BOUNTY_TRO+' trophies.'; }
  if(k==='raven'){ if(crossOffer(id)!=='stranger'||S.gold<RAVEN_GOLD) return null; if(!dry){ S.gold-=RAVEN_GOLD; mapSt().raven=1; tally('raven'); } return 'A stranger in grey sells you a raven. It will scout the roads at dawn and watch the nemeses for you.'; }
  if(k==='mapsell'){ if(crossOffer(id)!=='mapsell'||S.gold<MAPSELL_GOLD||!scoutable().length) return null; const L=scoutable().slice(0,2); if(!dry){ S.gold-=MAPSELL_GOLD; L.forEach(x=>{ mapSt().seen[x]=true; }); } return 'A map-seller marks '+L.map(nodeName).join(' and ')+' on your map.'; }
  if(k==='page'){ const t=hermitKind(); if(!t||nextPage()<0) return null; if(!dry){ S.trophies[t]-=HERMIT_TRO; if(!S.trophies[t]) delete S.trophies[t]; const i=S.pages|0; S.pages=i+1; tally('pages'); moment('Torn page '+(i+1)+'/'+LORE_PAGES.length,'gold'); return 'The hermit gives you a torn page of the Ledger ('+(i+1)+'/'+LORE_PAGES.length+'): "'+LORE_PAGES[i].t+'". Read it on the Lore page (Ledger tab).'; } return ''; }
  if(k==='lesson'){ const t=hermitKind(), l=lessonKind(); if(!t||!l) return null; if(!dry){ S.trophies[t]-=HERMIT_TRO; if(!S.trophies[t]) delete S.trophies[t]; S.kills[l]=KNOW_AT; tally('lessons'); } return 'The hermit tells you all he knows of '+l+'. You have studied its kind.'; }
  if(k==='cut'){ const b=gallowsBody(id); if(!b) return null; if(!dry){ const m=b.m; mapBody({name:m[0],base:m[0],role:m[1],rankI:b.g,lvl:siteLvl(b.g),hf:m[2]||1,af:m[3]||1,boss:false,elite:false,old:1},id); } return 'You cut down the hanged '+b.m[0]+'. Its body waits to be raised before dawn.'; }
  if(k==='sing'){ if(!dry){ if(f==='choir') deed('choir',DEV_SHRINE/DEED_K.choir); else dread(-GALLOWS_DREAD); favHook('shrine'); } return f==='choir'?'You sing for the hanged, and the Choir sings with you.':'You sing for the hanged. The living hear of it, and the town breathes easier.'; }
  if(k.startsWith('call:')){ const o=k.slice(5); if(!stoneOmens(id).includes(o)) return null; if(!dry){ S.omenNext={day:S.day+1,id:o,by:'stones'}; tally('stoneCalls'); } return 'You call '+OMENS[o].name+' at the Nine Stones. Tomorrow belongs to it.'; }
  if(k==='toll'){ const c=FORD_TOLL*priceK(); if(S.gold<c||(S.map&&S.map.ford===S.day)) return null; if(!dry){ S.gold-=c; mapSt().ford=S.day; tally('mapFord'); } return 'The ferryman will carry you: a step less on every longer walk today.'; }
  if(k==='search'){ if(!dry){ const g=nearGate(id), m=pick(DUNGEONS[g].mobs.filter(x=>x[1]!=='hexer')); mapBody({name:m[0],base:m[0],role:m[1],rankI:g,lvl:siteLvl(g),hf:m[2]||1,af:m[3]||1,boss:false,elite:false,cd:'preserved'},id); tally('mapFord'); favHook('ford'); } return 'You pull a drowned body from the shallows, cold and whole (Preserved).'; }
  return null;
}
function mapBody(c,s){ const M=mapSt(); M.bodies=(M.bodies||[]).concat([{c,s}]).slice(-MAP_BODIES); M.dug=(M.dug||0)+1; }
// ----- fights: the mine, the den, and the road
function svFoe(name,role,hf,af,rk,lvl,elite){ const s=mobStats(rk,lvl,hf,af,false,!!elite); return {id:'e'+(++S.uid),name:(elite?pick(ELITE)+' ':'')+name,base:name,role,rankI:rk,lvl,hf,af,boss:false,elite:!!elite,maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false}; }
function svStart(id,enc,esc){   // a site's fight (a watch, after the walk), a road encounter's (no watch: it found you on the road) or a village's escort (esc: the village, R20; on the road, no watch)
  if(S.mode!=='town') return false;
  if(esc){ if(!VILLAGES[esc]||VILLAGES[esc].node!==id||!mapGo(id,1)) return false; tally('mapSites'); }   /* the cart's road: no watch, like the road's own fights */
  else if(enc){ const E=S.map&&S.map.enc; if(!E||!['patrol','elite'].includes(E.k)) return false; }
  else { if(!SITE_FIGHT.includes(siteKind(id))||!siteReady(id)||!mapGo(id,1)) return false; S.watches--; siteState(id).rest=S.day+SITE_REST[siteKind(id)]; tally('mapSites'); tally('site_'+siteKind(id)); }
  const sg=Math.max(0,Math.min(GATE_N-1,topGate())), k=esc?'escort':enc?'enc':siteKind(id);
  S.runs++; S.notices=[];
  S.run={di:sg,sv:k,svId:enc?S.map.enc.s:id,svE:enc?S.map.enc.k:null,svV:esc||null,room:0,rooms:k==='mine'?2:1,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:null,heat:0};
  if(enc) delete S.map.enc;
  S.mode='battle'; titheSouls();
  log(k==='escort'?'You walk beside the cart from '+VILLAGES[esc].name+'. Something follows it.':k==='mine'?'You climb down into the Old Iron Mine. Something still digs in the dark.':k==='den'?'You crawl into the Wolf Den. The bones in the doorway are fresh.':S.run.svE==='patrol'?'A patrol of the living bars the road.':'Something from the gates walks the road, far from home.');
  spawnRoom(); return true;
}
function svRoom(list,r,room){   // buildRoom for a site's fight
  if(r.sv==='escort') return escortRoom(list,r);
  const sg=r.di, lv=RK[sg].lv+room+(r.sv==='den'?1:0);
  if(r.sv==='mine'){ const M=DUNGEONS[4].mobs.filter(m=>m[1]!=='hexer'), n=room===0?3:4; for(let i=0;i<n;i++){ const m=pick(M); list.push(svFoe(m[0],m[1],m[2],m[3],sg,lv,room===1&&i===0)); } }
  else if(r.sv==='den'){ const b=BEASTS; list.push(svFoe(b.bear[0],b.bear[1],b.bear[2],b.bear[3],sg,lv+1,true)); list.push(svFoe(b.wolf[0],b.wolf[1],b.wolf[2],b.wolf[3],sg,lv)); list.push(svFoe(b.wolf[0],b.wolf[1],b.wolf[2],b.wolf[3],sg,lv)); list.push(svFoe(b.crow[0],b.crow[1],b.crow[2],b.crow[3],sg,lv)); }
  else if(r.svE==='patrol'){ const F=SIEGE_FOES; ['vanguard','striker','striker'].forEach(ro=>list.push(svFoe(F[ro][0],ro,F[ro][1],F[ro][2],sg,lv))); }
  else { const g=nearGate(r.svId||'T'), M=DUNGEONS[g].mobs, m=pick(M); list.push(svFoe(m[0],m[1],m[2],m[3],g,RK[g].lv+2,true)); for(let i=0;i<2;i++){ const a=pick(M); list.push(svFoe(a[0],a[1],a[2],a[3],g,RK[g].lv+1)); } }
  return list;
}
function svCleared(r){   // the last room of a site's fight: what it pays
  r.cleared=true; const M=mapSt();
  if(r.sv==='mine'){ const o=1+(Math.random()<.5?1:0); M.ore=Math.min(ORE_HOLD,(M.ore|0)+o); tally('ore',o); favHook('mine'); r.events.push({m:'You carry '+o+' ore out of the mine ('+M.ore+' held). Each makes heart-forging '+Math.round(ORE_K*100)+'% cheaper.',c:'ok'}); }
  else if(r.sv==='den'){ M.pelt=(M.pelt|0)+1; tally('denClears'); favHook('den'); if(M.pelt>=DEN_PELTS){ M.pelt-=DEN_PELTS; const b=pick(BEAST_NAMES); S.charms=Array.isArray(S.charms)?S.charms:[]; S.charms.push({k:KIT_OF[b],src:b}); tally('charms'); r.events.push({m:'The pelts are cured into a charm: '+charmName({k:KIT_OF[b]})+' (in the Army tab\'s pouch).',c:'ok'}); }
    else r.events.push({m:'You skin the den\'s beasts: '+M.pelt+'/'+DEN_PELTS+' pelts toward a charm.',c:'ok'}); }
  else if(r.sv==='escort') escortWon(r);
  else { tally('encWon'); r.events.push({m:'The road is clear again.',c:'ok'}); }
  return Math.round(RK[r.di].clear*(r.sv==='enc'?.25:.5));
}
const svWhere=r=>r.sv==='escort'?'the road to '+(VILLAGES[r.svV]||{name:'a village'}).name:r.sv==='enc'?'the road':r.sv==='mine'?'the Old Iron Mine':'the Wolf Den';
// ----- road encounters
function encRoll(d,path){   // mapGo: each step walked may meet something on the road (held until dawn)
  const M=mapSt(); if(!MAP_ON||M.enc||!(d>0)) return; const ch=ENC_CH+(typeof dreadBand==='function'&&dreadBand().id==='terror'?ENC_TERROR:0);
  for(let i=0;i<d;i++) if(Math.random()<ch){ const s=path[Math.min(path.length-1,1+Math.floor(Math.random()*Math.max(1,path.length-1)))]||'T'; M.enc={k:pick(ENC_KINDS),s,d:S.day}; tally('encMet'); notify(encText(M.enc)+' It waits on the Valley map until dawn.','info'); return; }
}
function encText(E){ const w=nodeName(E.s);
  return E.k==='patrol'?'A patrol of the living stopped you near '+w+'.':E.k==='elite'?'Something from the gates walks the road near '+w+'.':E.k==='cart'?'A corpse cart creaks along the road near '+w+'.':'A pilgrim kneels by the road near '+w+'.'; }
const encGold=k=>(k==='cart'?CART_GOLD*CART_N:BRIBE_GOLD)*priceK();
function encOpts(){ const E=S.map&&S.map.enc; if(!E) return []; const out=[], add=(k,t,why)=>out.push({k,t,why:why||''}), g=encGold(E.k), gw=S.gold>=g?'':'Needs '+g+' gold.';
  if(E.k==='patrol'){ add('fight','Fight them'); add('bribe','Bribe them: '+g+' gold',gw); }
  if(E.k==='elite') add('fight','Fight it');
  if(E.k==='cart') add('buy','Buy '+CART_N+' bodies: '+g+' gold',gw);
  if(E.k==='pilgrim'){ add('spare','Let the pilgrim go: the town calms'); add('take','Take the pilgrim\'s body'); }
  add('leave','Leave it on the road'); return out; }
function encAct(k){   // returns a line, or null
  const E=S.map&&S.map.enc; if(!E||S.mode!=='town'||!encOpts().some(o=>o.k===k&&!o.why)) return null;
  if(k==='fight') return svStart(null,true)?'':null;
  const g=encGold(E.k); let m=null;
  if(k==='bribe'){ S.gold-=g; m='You pay the patrol '+g+' gold and walk on.'; }
  if(k==='buy'){ S.gold-=g; const sg=Math.max(0,Math.min(GATE_N-1,topGate())); for(let i=0;i<CART_N;i++){ const x=pick(DUNGEONS[sg].mobs); mapBody({name:x[0],base:x[0],role:x[1],rankI:sg,lvl:siteLvl(sg),hf:x[2]||1,af:x[3]||1,boss:false,elite:false,fresh:1},E.s); } tally('cartBought'); m='The carter sells you '+CART_N+' bodies for '+g+' gold.'; }
  if(k==='spare'){ dread(-PILGRIM_DREAD); tally('pilgrims'); stand('aldric',VIL_PILGRIM,'a pilgrim spared'); m='You let the pilgrim go. Word of it reaches the town.'; }
  if(k==='take'){ const F=SIEGE_FOES.mender; mapBody({name:F[0],base:F[0],role:'mender',rankI:Math.max(0,topGate()),lvl:Math.max(1,S.player.lvl-2),hf:F[1],af:F[2],boss:false,elite:false,fresh:1},E.s); dread(PILGRIM_DREAD); stand('aldric',-VIL_TAKE,'a pilgrim taken'); m='You take the pilgrim. The town hears of that too.'; }
  if(k==='leave') m='You leave it on the road.';
  delete S.map.enc; if(m) notify(m,'info'); return m;
}
// ----- scouting and the raven
const scoutable=()=>MAP_IDS.filter(id=>!mapSeen(id)&&VALLEY_ADJ[id].some(([v])=>mapSeen(v)));
function scoutWhy(id){ if(!MAP_ON) return 'The map is off.'; if(S.mode!=='town') return 'Only from town.'; if(!scoutable().includes(id)) return 'No known road leads there.'; const M=S.map||{};
  return S.watches-Math.floor((((M.st)||0)+SCOUT_STEPS)/MAP_STEP)>=1?'':'No watch left today.'; }
function scout(id){   // a step of walking to look down a road: the place is known (you stay where you stand)
  if(scoutWhy(id)) return false; const M=mapSt(); M.st=(M.st||0)+SCOUT_STEPS; M.steps=(M.steps||0)+SCOUT_STEPS; while(M.st>=MAP_STEP){ M.st-=MAP_STEP; S.watches--; tally('mapW'); }
  M.seen[id]=true; tally('scouted'); tally('mapSteps',SCOUT_STEPS); return true; }
function roadsDawn(){   // closeDay: the War Room's scouts and the raven each look down one road
  if(!S.map||!MAP_ON) return; const M=S.map; M.seen=M.seen||{};
  if(!M.raven&&bl('library')>=3){ M.raven=1; notify('A raven has nested in the Library. It will scout the roads at dawn and watch the nemeses for you.','ok'); }
  const look=who=>{ const L=scoutable(); if(!L.length) return; const id=L[dayHash(S.day,MAP_IDS.length,who.length)%L.length]; M.seen[id]=true; tally('scouted'); notify(who+' found '+nodeName(id)+' on the Valley map.','info'); };
  if(bl('war')>=2) look('The War Room\'s scouts'); if(M.raven) look('Your raven');
}
// ----- what the map shows of the other systems: nemeses (with the raven), squads in the field, tonight's siege road
const mapNems=()=>ravenOn()?(S.nem||[]).filter(n=>DUNGEONS[n.g]).map(n=>({n,at:gateNode(n.g)})):[];
const mapSquads=()=>(S.raids||[]).map(x=>({x,at:x.t&&x.t.k==='band'?'tw':DUNGEONS[x.di]?gateNode(x.di):null})).filter(o=>o.at&&VALLEY_NODES[o.at]);
const MAP_SIEGE_FROM={north:[50,-2],river:[102,44],grave:[46,86],all:[0,70]};
const mapSiegeRoad=()=>typeof siegeWarned==='function'&&siegeWarned()?siegeRoad():null;
// ----- the save
function roadsFix(q,o){   // mapFix: the PR B fields
  if(Array.isArray(q.rw)) o.rw=[...new Set(q.rw.filter(j=>Number.isInteger(j)&&j>=0&&j<VALLEY_ROADS.length))].sort((a,b)=>a-b);
  if(isFinite(q.ford)&&q.ford>0) o.ford=Math.floor(q.ford);
  if(isFinite(q.ore)&&q.ore>0) o.ore=Math.min(ORE_HOLD,Math.floor(q.ore));
  if(isFinite(q.pelt)&&q.pelt>0) o.pelt=Math.min(DEN_PELTS-1,Math.floor(q.pelt));
  if(q.raven) o.raven=1;
  const E=q.enc; if(E&&typeof E==='object'&&ENC_KINDS.includes(E.k)&&VALLEY_NODES[E.s]) o.enc={k:E.k,s:E.s,d:isFinite(E.d)?Math.floor(E.d):0};
}
// ----- titles: the map's four (two more than PR A's)
[['v_cart','Cartographer','Know every place on the Valley map.',()=>!!S.map&&MAP_IDS.every(mapSeen),{xpp:3},3],
 ['v_road','Every Road','Walk every road of the valley.',()=>!!S.map&&Array.isArray(S.map.rw)&&S.map.rw.length>=VALLEY_ROADS.length,{goldp:4},4],
 ['v_ford','Ford-Crosser','Cross the Ford 10 times: by the ferry or through the shallows.',()=>T_('mapFord')>=10,{hpp:2},2],
 ['v_wolf','Wolf-Skinner','Kill 30 beasts in the Wolf Den.',()=>beastKills()>=30,{dmgp:3},3]
].forEach(([id,name,req,ok,b,r])=>{ for(const k in b) b[k]=Math.max(b[k],Math.round(b[k]*RARITY_MUL[r])); TITLE_RARITY[id]=r; const t={id,grp:'Deeds',name,req,ok,b,r}; TITLES.push(t); TITLE[id]=t; });
TIPS.push({id:'roads',t:'The roads',m:'The valley has more than gates: shrines, a crossroads, a hermit, a mine, a wolf den and more. Places you do not know yet show as smudges: scout one from the Valley map for a step. Something may wait on the road when you walk; it stays until dawn.',when:()=>S.mode==='town'&&MAP_ON&&S.day>=4&&scoutable().length>0});
TIP_META.roads=['sys','valley'];
