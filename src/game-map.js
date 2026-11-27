// ===== R19 PR A: THE VALLEY MAP =====
// The valley as a place: nodes (the town, the gates, the Tower, the sites) joined by roads of 1-3 steps. A watch
// is MAP_STEP steps. The hero stands somewhere (S.map.pos): a run from the node you stand on costs no travel, from elsewhere the
// road is walked first, and the steps walked today add up (S.map.st): every MAP_STEP of them spends a watch. A trip that would
// leave no watch for the run itself is refused. At dawn the Ledger pulls you home (the town, no steps left over).
// Fog: the town and the first two gates are known; an open gate's node is known; clearing a gate shows its neighbours. Sites:
// old graveyards (dig a few old bodies of the nearest gate's kinds, -10 to raise, then rest 5 days) and battlefields (the fallen
// of the last siege, +10 to raise, once after each siege). Dug bodies wait in S.map.bodies until dawn and rise in town.
// The layout is fixed data, the same for every save: S.map = {pos, st, seen, sites:{id:{rest, fresh}}, steps, dug, bodies}.
const MAP_STEP=3, MAP_GY_REST=5, MAP_GY_N=[2,4], MAP_BF_N=[3,6], MAP_OLD=10, MAP_FRESH=10, MAP_BODIES=8;
let MAP_ON=true;   // the balance bot's off-switch ("off":["map"]): every node is where you stand, as before the map
// x, y on a 100 x 76 vellum. k: town, gate (g: its DUNGEONS index), tower, grave (an old graveyard), field (a battlefield)
const VALLEY_NODES={
  T:  {k:'town', name:'The necropolis',     x:50,y:40},
  g0: {k:'gate', g:0, x:40,y:49}, g1:{k:'gate',g:1,x:61,y:50}, g2:{k:'gate',g:2,x:33,y:33}, g3:{k:'gate',g:3,x:66,y:31},
  g4: {k:'gate', g:4, x:27,y:57}, g5:{k:'gate',g:5,x:53,y:17}, g6:{k:'gate',g:6,x:84,y:60},
  tw: {k:'tower',name:'The Hell Tower',     x:50,y:5},
  gy0:{k:'grave',name:'Potter\'s Field',     x:46,y:61}, gy1:{k:'grave',name:'Lych Hill',x:76,y:41}, gy2:{k:'grave',name:'The Ash Pits',x:19,y:38}, gy3:{k:'grave',name:'Orchard Graves',x:14,y:63},
  bf0:{k:'field',name:'The Hill Road field', x:58,y:62}, bf1:{k:'field',name:'The North Gate field',x:30,y:20},
  // R19 PR B (game-roads.js): the other sites. A shrine's g is its god.
  cr: {k:'cross',  name:'The Crossroads',    x:44,y:30}, hm:{k:'hermit',name:'The Hermit\'s Hut',x:18,y:13}, st:{k:'stones',name:'The Nine Stones',x:10,y:26},
  mn: {k:'mine',   name:'The Old Iron Mine', x:34,y:68}, gl:{k:'gallows',name:'Gallows Hill',x:74,y:69}, fd:{k:'ford',name:'The Ford',x:71,y:56},
  wd: {k:'den',    name:'The Wolf Den',      x:88,y:15},
  sh0:{k:'shrine',g:'hon',  name:'Morrow\'s Lamp',   x:90,y:27}, sh1:{k:'shrine',g:'vesh',name:'The Cold Well',x:91,y:41}, sh2:{k:'shrine',g:'ulm',name:'Furrow Cross',x:20,y:51},
  sh3:{k:'shrine',g:'choir',name:'The Hollow Bell',   x:65,y:8},  sh4:{k:'shrine',g:'dis', name:'The Black Altar',x:8,y:43}
};
const VALLEY_ROADS=[['T','g0',1],['T','g1',1],['g0','g1',1],['T','g2',2],['g0','g2',1],['T','g3',2],['g1','g3',1],['T','g4',2],['g0','g4',1],
  ['T','g5',2],['g3','g5',1],['g2','g5',2],['T','tw',2],['g5','tw',1],['g1','g6',2],
  ['g0','gy0',1],['T','gy0',2],['g1','gy1',1],['g3','gy1',1],['g2','gy2',1],['g4','gy3',1],['g4','gy2',2],['g1','bf0',1],['T','bf0',2],['g2','bf1',1],['g5','bf1',1],
  ['T','cr',1],['cr','g2',1],['cr','g3',2],['cr','bf1',1],['hm','bf1',2],['hm','gy2',2],['st','gy2',1],['st','hm',2],['mn','g4',1],['mn','gy0',1],
  ['fd','g1',1],['fd','g6',1],['fd','bf0',1],['gl','fd',1],['gl','g6',1],['wd','g3',2],['wd','sh0',2],['sh0','g3',2],['sh0','sh1',1],['sh1','gy1',1],['sh1','g6',2],
  ['sh2','g4',1],['sh2','gy2',1],['sh2','gy3',2],['sh3','tw',1],['sh3','g5',1],['sh4','gy2',1],['sh4','sh2',2],['sh4','st',2]];
const MAP_IDS=Object.keys(VALLEY_NODES), MAP_START=['T','g0','g1'];
const VALLEY_ADJ=(()=>{ const a={}; for(const id of MAP_IDS) a[id]=[]; for(const [p,q,n] of VALLEY_ROADS){ a[p].push([q,n]); a[q].push([p,n]); } return a; })();
const nodeName=id=>{ const n=VALLEY_NODES[id]; return !n?'':n.k==='gate'?(DUNGEONS[n.g]||{}).name||'':n.name; };
const gateNode=di=>'g'+di;
const mapSt=()=>{ if(!S.map||typeof S.map!=='object') S.map={pos:'T',st:0,seen:{},sites:{},steps:0,dug:0,bodies:[]}; return S.map; };
const mapPos=()=>MAP_ON&&S.map&&VALLEY_NODES[S.map.pos]?S.map.pos:'T';
function mapPath(a,b){   // the fewest-steps road from a to b (Dijkstra over a small fixed graph): {d, path:[a..b]}; d Infinity off the map
  if(!VALLEY_NODES[a]||!VALLEY_NODES[b]) return {d:Infinity,path:[]}; if(a===b) return {d:0,path:[a]};
  const d={[a]:0}, from={}, done=new Set(); for(;;){ let u=null; for(const k in d) if(!done.has(k)&&(u==null||d[k]<d[u])) u=k; if(u==null) return {d:Infinity,path:[]};
    if(u===b){ const p=[b]; while(p[0]!==a) p.unshift(from[p[0]]); return {d:d[u],path:p}; } done.add(u);
    for(const [v,n] of VALLEY_ADJ[u]) if(d[v]==null||d[u]+n<d[v]){ d[v]=d[u]+n; from[v]=u; } }
}
const mapDist=(a,b)=>mapPath(a,b).d;
const roadIx=(a,b)=>VALLEY_ROADS.findIndex(([p,q])=>(p===a&&q===b)||(p===b&&q===a));
function mapSeen(id){   // known on the map: the start, an open gate, the Tower once open, anything next to a cleared gate, or scouted
  const n=VALLEY_NODES[id]; if(!n) return false; if(MAP_START.includes(id)||(S.map&&S.map.seen&&S.map.seen[id])) return true;
  if(n.k==='gate'&&!gateLocked(n.g)) return true; if(n.k==='tower'&&towerOpen()) return true;
  const clr=S.ti&&S.ti.clr||{}; return VALLEY_ADJ[id].some(([v])=>VALLEY_NODES[v].k==='gate'&&clr[VALLEY_NODES[v].g]);
}
const tripSteps=id=>{ if(!MAP_ON) return 0; const d=mapDist(mapPos(),id); return d>=2&&S.map&&S.map.ford===S.day?d-1:d; };   /* the ferryman's boat: a step less on every longer walk today (game-roads.js) */
function mapCan(id,need){   // can you walk there and still have `need` watches (1 for a run, 0 for a site)?
  if(!MAP_ON) return true; if(!VALLEY_NODES[id]||!mapSeen(id)) return false; const w=Math.floor((((S.map&&S.map.st)||0)+tripSteps(id))/MAP_STEP);
  return S.watches>0&&S.watches-w>=(need==null?1:need);
}
function mapGo(id,need){   // walk there: the steps add up today and every MAP_STEP of them spends a watch
  if(!MAP_ON) return true; if(!mapCan(id,need)) return false; const M=mapSt(), d=tripSteps(id); if(!d) { M.pos=id; return true; }
  const p=mapPath(mapPos(),id).path; M.rw=Array.isArray(M.rw)?M.rw:[]; for(let i=1;i<p.length;i++){ const j=roadIx(p[i-1],p[i]); if(j>=0&&!M.rw.includes(j)) M.rw.push(j); } M.rw.sort((a,b)=>a-b);   /* Every Road */
  M.st=(M.st||0)+d; M.steps=(M.steps||0)+d; while(M.st>=MAP_STEP){ M.st-=MAP_STEP; S.watches--; tally('mapW'); } M.pos=id; tally('mapSteps',d); encRoll(d,p); return true;
}
function mapDawn(){ if(!S.map) return; const M=S.map, lost=(M.bodies||[]).length; M.pos='T'; M.st=0; M.bodies=[]; delete M.enc; if(lost) notify(lost+' dug bod'+(lost>1?'ies':'y')+' crumbled back into the earth at dawn.','info'); }
// ----- sites
const siteState=id=>{ const M=mapSt(); M.sites=M.sites||{}; return M.sites[id]=M.sites[id]||{}; };
const siteRest=id=>Math.max(0,((S.map&&S.map.sites&&S.map.sites[id]&&S.map.sites[id].rest)||0)-S.day);
function siteReady(id){ const n=VALLEY_NODES[id]; if(!n) return false; if(n.k==='grave') return siteRest(id)===0; if(n.k==='field') return !!(S.map&&S.map.sites&&S.map.sites[id]&&S.map.sites[id].fresh); return SITE_REST[n.k]?siteRest(id)===0:false; }
function nearGate(id){ let best=0, bd=Infinity; for(let i=0;i<GATE_N;i++){ const d=mapDist(id,gateNode(i)); if(d<bd||(d===bd&&i>best)){ bd=d; best=i; } } return Math.min(best,Math.max(0,topGate())); }
const siteLvl=g=>Math.max(1,Math.min(S.player.lvl,tierRec(g,0)));
function siteBodies(id){   // what the site gives: old bodies of the nearest gate, or the fallen of the last siege
  const n=VALLEY_NODES[id], out=[];
  if(n.k==='grave'){ const g=nearGate(id), N=MAP_GY_N[0]+Math.floor(Math.random()*(MAP_GY_N[1]-MAP_GY_N[0]+1));
    for(let i=0;i<N;i++){ const m=pick(DUNGEONS[g].mobs); out.push({name:m[0],base:m[0],role:m[1],rankI:g,lvl:siteLvl(g),hf:m[2]||1,af:m[3]||1,boss:false,elite:false,old:1}); } }
  if(n.k==='field'){ const g=Math.max(0,Math.min(GATE_N-1,topGate())), N=MAP_BF_N[0]+Math.floor(Math.random()*(MAP_BF_N[1]-MAP_BF_N[0]+1)), roles=['vanguard','striker','mender','vanguard','striker'];
    for(let i=0;i<N;i++){ const r=roles[i%roles.length], f=SIEGE_FOES[r]; out.push({name:f[0],base:f[0],role:r,rankI:g,lvl:Math.max(1,S.player.lvl-2),hf:f[1],af:f[2],boss:false,elite:false,fresh:1}); } }
  return out;
}
function siteVisit(id){   // walk there (the walk must leave a watch: a day never ends on the road) and take what it gives
  const n=VALLEY_NODES[id]; if(!n||S.mode!=='town'||!['grave','field'].includes(n.k)||!siteReady(id)||!mapGo(id,1)) return null;
  const M=mapSt(), b=siteBodies(id), st=siteState(id); if(n.k==='grave') st.rest=S.day+MAP_GY_REST; else delete st.fresh;
  M.bodies=(M.bodies||[]).concat(b.map(c=>({c,s:id}))).slice(-MAP_BODIES); M.dug=(M.dug||0)+b.length; tally(n.k==='grave'?'mapDug':'mapField',b.length); tally('mapSites');
  notify((n.k==='grave'?'You dig at '+n.name+': ':'You walk '+n.name+': ')+b.length+' bod'+(b.length>1?'ies':'y')+' to raise before dawn.','ok');
  return b;
}
function siteRaise(i){   // raise a dug body in town: the usual raise (no mana: you stand over it at leisure), old bones -10, fresh dead +10
  const M=S.map, x=M&&(M.bodies||[])[i]; if(!x||S.mode!=='town') return null;
  const c=Object.assign({id:'map'+i,tried:false},x.c), run0=S.run, mode0=S.mode, mana=S.player.mana; let res=null;
  S.run={corpses:[c],events:[],raised:0,di:c.rankI|0,enemies:[],log:[]}; S.mode='raise';
  try{ S.player.mana=Math.max(mana,raiseCost(c)); tryRaise(c.id,false,true); if(c.tried) res={ok:c.result==='raised',m:(S.run.events[0]||{}).m||null,minion:c.minion}; } finally{ S.run=run0; S.mode=mode0; S.player.mana=mana; }
  if(c.tried){ M.bodies.splice(i,1); if(res&&res.ok) tally('mapRaised'); } return res;
}
const mapRaise=c=>c&&c.old?-MAP_OLD:c&&c.fresh?MAP_FRESH:0;   // raiseChance: old bones and fresh dead
function mapSiege(){ for(const id of MAP_IDS) if(VALLEY_NODES[id].k==='field') siteState(id).fresh=1; }   // siegeEnd: the battlefields fill
function mapFix(g){   // normalizeSave
  if(!('map' in g)) return; const q=g.map&&typeof g.map==='object'?g.map:{}, o={pos:VALLEY_NODES[q.pos]?q.pos:'T',st:clamp(Math.floor(+q.st||0),0,MAP_STEP-1),seen:{},sites:{},steps:Math.max(0,Math.floor(+q.steps||0)),dug:Math.max(0,Math.floor(+q.dug||0)),bodies:[]};
  if(q.seen&&typeof q.seen==='object') for(const id in q.seen) if(VALLEY_NODES[id]&&q.seen[id]) o.seen[id]=true;
  if(q.sites&&typeof q.sites==='object') for(const id in q.sites){ const s=q.sites[id]; if(!VALLEY_NODES[id]||!s||typeof s!=='object') continue; const t={}; if(isFinite(s.rest)&&s.rest>0) t.rest=Math.floor(s.rest); if(s.fresh) t.fresh=1; if(Object.keys(t).length) o.sites[id]=t; }
  if(Array.isArray(q.bodies)) o.bodies=q.bodies.filter(x=>x&&x.c&&typeof x.c.base==='string'&&typeof x.c.name==='string'&&VALLEY_NODES[x.s]).slice(0,MAP_BODIES).map(x=>{ const c={}; for(const k of ['name','base','role','rankI','lvl','hf','af','boss','elite','old','fresh','cd']) if(k==='boss'||k==='elite') c[k]=false; else if(x.c[k]!=null) c[k]=x.c[k]; c.name=cleanText(c.name); c.base=cleanText(c.base); c.lvl=clamp(c.lvl|0,1,999); c.rankI=clamp(c.rankI|0,0,RANKS.length-1); c.hf=isFinite(c.hf)&&c.hf>0?+c.hf:1; c.af=isFinite(c.af)&&c.af>0?+c.af:1; if(!['vanguard','striker','mender','reaper','hexer'].includes(c.role)) c.role='striker'; if(c.cd!=null&&!CORPSE_CONDS[c.cd]) delete c.cd; return {c,s:x.s}; });
  roadsFix(q,o); g.map=o;
}
[['v_dig','Grave Digger','Dig 100 bodies out of the valley\'s old graveyards.',()=>T_('mapDug')>=100,{hpp:3},3],
 ['v_walk','Wayfarer','Walk 300 steps on the valley\'s roads.',()=>((S.map&&S.map.steps)||0)>=300,{goldp:3},2]
].forEach(([id,name,req,ok,b,r])=>{ for(const k in b) b[k]=Math.max(b[k],Math.round(b[k]*RARITY_MUL[r])); TITLE_RARITY[id]=r; const t={id,grp:'Deeds',name,req,ok,b,r}; TITLES.push(t); TITLE[id]=t; });
TIPS.push({id:'valley',t:'The valley',m:'The Gates tab has a Valley map. A run from where you stand is free; walking to another gate costs steps, and every '+MAP_STEP+' steps spend a watch. Old graveyards and battlefields between the gates hold bodies to dig and raise in town before dawn.',when:()=>S.mode==='town'&&MAP_ON&&S.day>=2});
TIP_META.valley=['sys','valley'];
