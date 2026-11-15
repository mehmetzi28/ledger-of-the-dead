/* Ledger of the Dead: test helpers, the rules check (invariants) and the runner. The tests themselves live in
 * tests/groups/, one file per system, listed in FILES below in the order they run.
 *
 * Node (recommended):   node tests/run-tests.js            (or: node tests/run-tests.js market   to run matching tests)
 * Browser:              with the game open on http://localhost:5173, load this file with a script tag, then
 *                       await LOTD_TESTS.load(); LOTD_TESTS.run()   Your game and saves are backed up and put back afterwards.
 * Adding tests:         put them in the group file for that system (or a new file added to FILES). Group files
 *                       get every helper from window.LOTD_T; a helper used by several groups belongs in this file.
 *
 * Each test starts from a fresh level-1 game with a seeded random number generator, so results are repeatable.
 * Group names come before the colon in each test name.
 */
(function(){
const TESTS=[];
const test=(name,fn)=>TESTS.push({name,fn});
const NODE=!!window.__listeners;

// ---------- assertions
const fmt=v=>{ try{ return JSON.stringify(v); }catch(e){ return String(v); } };
function ok(c,msg){ if(!c) throw new Error(msg||'expected true'); }
function eq(a,b,msg){ if(a!==b) throw new Error((msg?msg+': ':'')+'expected '+fmt(b)+', got '+fmt(a)); }
function near(a,b,tol,msg){ if(!(Math.abs(a-b)<=tol)) throw new Error((msg?msg+': ':'')+'expected '+b+' ±'+tol+', got '+a); }
function finite(v,msg){ if(typeof v!=='number'||!isFinite(v)) throw new Error((msg||'value')+' is not a finite number: '+v); }
const BAD_TEXT=/undefined|\bNaN\b|\[object Object\]|Infinity/;
function cleanHTML(h,where){ const m=h.match(BAD_TEXT); if(m){ const i=h.indexOf(m[0]); throw new Error((where||'page')+' shows "'+m[0]+'": …'+h.slice(Math.max(0,i-80),i+40).replace(/\s+/g,' ')+'…'); } }

// ---------- randomness
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const seed=n=>{ Math.random=mulberry32(n); };
const fix=v=>{ Math.random=()=>v; };
const seq=(list,after)=>{ let i=0; Math.random=()=>i<list.length?list[i++]:(after==null?.5:after); };
const H=b=>Math.max(1,Math.round(b*(.85+.5*.3)));   // what hit(b) returns while Math.random is fixed at .5

// ---------- state helpers
function fresh(lvl){ newGame(); S.firstRaise=0; S.notices=[]; for(const k in ui) delete ui[k]; ui.confirm=null; ui.tab='gates'; S.omen={day:S.day,id:null}; if(lvl&&lvl>1) setLvl(lvl); return S; }   // firstRaise=0: tests start past the sure first raise (tests/groups/56-first-hour.js covers it)
function setLvl(l){ S.player.lvl=l; S.player.hp=pMax(); S.player.mana=pMana(); }
function foe(o){ const e=Object.assign({id:'e'+(++S.uid),name:'Test Foe',base:'Tunnel Rat',role:'vanguard',rankI:0,lvl:1,hf:1,af:1,boss:false,elite:false,maxHp:1000,hp:1000,atk:1,dead:false},o); if(o&&o.hp!=null&&o.maxHp==null) e.maxHp=o.hp; return e; }
function arena(list,di){ di=di||0; S.mode='town'; S.run=null; if(S.player.lvl<RK[di].unlock) setLvl(RK[di].unlock); S.watches=WATCHES; startRun(di); const r=S.run; r.enemies=list; r.target=list[0].id; r.log=[]; return r; }
function mkMinion(o){
  const m=Object.assign({uid:++S.uid,armed:false,eq:null,nick:'Mn'+S.uid,name:'Tunnel Rat',kind:'Tunnel Rat',role:'striker',rankI:0,lvl:1,xp:0,boss:false,elite:false,hf:1,af:1,hp:1,maxHp:null,atk:0,lvl0:null,stage:0,traits:[]},o);
  if(m.lvl0==null) m.lvl0=m.lvl; syncMinion(m); m.hp=m.maxHp; S.army.push(m); return m;
}
function corpse(o){ return Object.assign({id:'c'+(++S.uid),armed:false,name:'Tunnel Rat',base:'Tunnel Rat',role:'striker',rankI:0,lvl:1,hf:.85,af:1.1,boss:false,elite:false,tried:false,result:null,minion:null},o); }
function raiseScene(list,lvl){ arena([foe()],0); if(lvl) setLvl(lvl); S.mode='raise'; S.run.corpses=list; return S.run; }
const wear=id=>{ S.equip[ITEM[id].slot]={u:++S.uid,id}; };
const give=id=>{ const it={u:++S.uid,id}; S.inv.push(it); return it; };
const canon=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((a,x)=>(a[x]=v[x],a),{}):v);
function firstDiff(a,b,p){ p=p||''; if(canon(a)===canon(b)) return null;
  if(!a||!b||typeof a!=='object'||typeof b!=='object') return p+': '+fmt(a)+' vs '+fmt(b);
  for(const k of new Set(Object.keys(a).concat(Object.keys(b)))){ const d=firstDiff(a[k],b[k],p+'.'+k); if(d) return d; } return p; }
function renderAll(where){ render(); cleanHTML(app.innerHTML,where); return app.innerHTML.replace(/·/g,'&middot;').replace(/→/g,'&rarr;').replace(/−/g,'&minus;'); }   // a real browser turns entities into characters; tests match the entity form
const TABS=['gates','gear','bes','skills','market','town','tower','titles','settings','help','hist','rec','lore','codex'];
function richState(){
  fresh(30); const P=S.player; P.sp=4; P.pts=2; SKILLS.forEach(s=>P.skills[s.id]=3);
  S.gold=99999; S.belt={hp:3,mp:3}; S.bagLv=BAG_COST.length; S.salts=SALT_MAX; S.ngp=2; S.day=40;
  Object.keys(ITEM).forEach(id=>give(id));
  wear('w11'); wear('w12'); wear('w10');
  Object.keys(TROPHY).forEach(k=>S.trophies[k]=2);
  allNames().forEach(n=>S.kills[n]=KNOW_AT+1);
  S.tower.best=120; TW_UNIQ.forEach((u,i)=>S.tower.got['w'+(i+1)]=true);
  checkTitles(); TITLES.forEach(t=>S.ti.got[t.id]=1); S.ti.sel='d_all'; S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1};
  mkMinion({name:'Warren Bandit',kind:'Warren Bandit',armed:true,eq:{weapon:{u:++S.uid,id:'2-wa'},armor:{u:++S.uid,id:'2-aa'},relic:{u:++S.uid,id:'2-ta'}},traits:['thick']});
  mkMinion({name:'The Rat King',kind:'The Rat King',role:'reaper',boss:true,traits:['vicious','leech'],lvl:20,lvl0:10,stage:2});
  mkMinion({name:'Imp',kind:'Imp',tw:30,rankI:3,lvl:20,traits:['gravebound'],stage:1});
  mkMinion({name:'Ashen Drowned Priest',kind:'Drowned Priest',role:'mender',rankI:1,elite:true,lvl:12,traits:['stalwart','frenzied']});
  S.inv.forEach((it,i)=>{ if(!ITEM[it.id].uq&&i%2) it.ro=rollItem(it.id,true); });
  S.hist=[]; for(let i=0;i<25;i++){ const r={di:i%6,tw:i%5===0?10+i:0,tw0:i%5===0?10:0,won:3,kills:9,gained:400,goldTot:120,items:2,raised:1,mod:i%3?null:'drought',cleared:i%2===0}; S.mode='town'; recordRun(S,r,['cleared','fell','fled','left'][i%4]); }
  S.mod={day:S.day,gi:2,id:'horde'};
  S.notices=[{m:'A notice.',c:'info'},{m:'A bad one.',c:'bad'}];
  return S;
}
function invariants(where){
  const P=S.player, w=' ('+where+')';
  ok(['town','battle','raise','defeat'].includes(S.mode),'unknown mode '+S.mode+w);
  finite(P.hp,'player hp'+w); finite(P.mana,'player mana'+w); finite(P.xp,'xp'+w); finite(S.gold,'gold'+w); finite(P.shield,'shield'+w);
  ok(P.hp<=pMax(),'player hp '+P.hp+' above max '+pMax()+w); ok(P.mana>=0&&P.mana<=pMana(),'mana '+P.mana+' outside 0..'+pMana()+w);
  ok(S.gold>=0,'gold below zero'+w); ok(S.watches>=0&&S.watches<=WATCHES,'watches '+S.watches+w); ok(P.xp>=0&&P.xp<need(P.lvl),'xp '+P.xp+' not rolled into a level'+w);
  ok(armyUsed()<=ARMY_CAP+bl('crypt'),'army larger than its cap'+w); finite(S.dust||0,'dust'+w); ok((S.dust||0)>=0,'dust below zero'+w);
  for(const m of S.army){ finite(m.hp,'minion hp'+w); finite(m.maxHp,'minion maxHp'+w); finite(m.atk,'minion atk'+w); ok(m.hp<=m.maxHp,m.nick+' hp above max'+w); ok(m.lvl<=Math.max(P.lvl+2,m.lvl0),m.nick+' grew past the level cap'+w);
    const c=JSON.parse(JSON.stringify(m)); syncMinion(c); ok(c.maxHp===m.maxHp&&c.atk===m.atk,m.nick+' has stale stats ('+m.maxHp+'/'+m.atk+', should be '+c.maxHp+'/'+c.atk+')'+w); }
  const seen=new Set(), all=S.inv.concat(Object.values(S.equip).filter(Boolean)); S.army.forEach(m=>m.eq&&Object.values(m.eq).forEach(x=>x&&all.push(x)));
  for(const it of all){ ok(ITEM[it.id],'unknown item '+it.id+w); ok(!seen.has(it.u),'two items share id '+it.u+w); seen.add(it.u); ok(it.u<=S.uid,'item id above S.uid'+w); }
  for(const k in S.trophies) ok(TROPHY[k]&&S.trophies[k]>0,'bad trophy entry '+k+w);
  for(const k of ['hp','mp']) ok(S.belt[k]>=0&&S.belt[k]<=BELT_MAX,'belt '+k+' = '+S.belt[k]+w);
  if(S.run) for(const e of S.run.enemies){ finite(e.hp,'foe hp'+w); finite(e.atk,'foe atk'+w); ok(e.hp>=0&&e.hp<=e.maxHp,e.name+' hp '+e.hp+'/'+e.maxHp+w); }
  if(S.mode==='town') ok(!S.run,'a run is left over in town'+w); else ok(S.run,'no run outside town'+w);
}

// helpers shared by several test groups
function bossFight(di,lvl){ setLvl(Math.max(RK[di].unlock,lvl||1)); const b=makeEnemy(di,RK[di].lv+3,true); b.hp=b.maxHp=1e7; arena([b],di); return b; }
const earn=(...ids)=>{ checkTitles(); ids.forEach(id=>S.ti.got[id]=1); };
function eventScene(id,lvl){ arena([foe({hp:0,dead:true})],0); if(lvl) setLvl(lvl); fix(.99); roomWon(); S.run.event=Object.assign(rollEvent(),{id}); if(id==='pedlar'){ S.run.event.pot='hp'; S.run.event.price=Math.ceil(POTIONS.hp.price()/2); } return S.run; }
function cursedRun(id,di){ di=di||0; setLvl(Math.max(RK[di].unlock,5)); S.ti={clr:{[di]:1}}; S.mod={day:S.day,gi:di,id}; S.watches=3; startRun(di); eq(S.run.mod,id); return S.run; }
function wonRoom(room){ arena([foe({hp:0,dead:true})]); S.run.room=room||0; fix(.99); roomWon(); return S.run; }
const master=id=>{ setLvl(40); S.player.skills[id]=SK_MAX; };
const board=list=>{ S.bounty={day:S.day,list:list.map(b=>Object.assign({claimed:false,base:bountyVal(b.id),n:BOUNTIES[b.id].n},b))}; return S.bounty.list; };
const cdx=k=>{ ui.tab='codex'; ACTIONS.cx(k); return renderAll('codex '+k); };

// The test groups, in the order they run. Node (tests/run-tests.js) and the browser loader both use this list.
const FILES=["01-data.js", "02-player-stats.js", "03-xp-and-levels.js", "04-days-and-quests.js", "05-enemies-and-rooms.js", "06-combat.js", "07-raising.js", "08-minions-traits-and-evolution.js", "09-gear-bearers.js", "10-items-and-drops.js", "11-skills.js", "12-gold-loot-and-the-market.js", "13-forge-and-brewing.js", "14-boss-abilities.js", "15-hell-tower.js", "16-unique-item-effects.js", "17-titles.js", "18-tips.js", "19-saves.js", "20-new-game.js", "21-ui.js", "22-sound.js", "24-gear-rolls.js", "25-events.js", "26-cursed-gates.js", "27-status-effects.js", "28-history.js", "29-bag-tools.js", "30-doors.js", "31-gear-sets.js", "32-skill-upgrades.js", "33-minion-commands.js", "34-story.js", "35-music-display-save-files.js", "36-town-buildings.js", "37-bounty-board.js", "38-elite-affixes.js", "39-boss-phases.js", "40-minion-fusion.js", "41-salvage-and-enchanting.js", "42-codex.js", "43-icons.js", "44-screens.js", "45-item-locks-and-army-care.js", "46-feel.js", "47-safety.js", "48-late-game-backups-previews.js", "49-play-test-fixes.js", "50-difficulty-and-secrets.js", "51-measured-tuning.js", "52-help-records-blessings.js", "53-omens-search-hints.js", "54-lore.js", "55-raids-rift-and-tuning.js", "56-first-hour.js", "57-battle-effects.js", "99-playthrough.js"];
window.LOTD_T={test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx};

// =====================================================================================================
// RUNNER
function run(opts){
  opts=opts||{}; const filter=(opts.filter||'').toLowerCase();
  const keep={S,rnd:Math.random,sfx:SFX.on,ui:Object.assign({},ui),store:{}}, ours=k=>k.startsWith(SAVE_KEY)||k.startsWith('lotd');
  for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(ours(k)) keep.store[k]=localStorage.getItem(k); }
  SFX.on=false; const results=[]; const t0=Date.now();
  for(const t of TESTS){
    if(filter&&!t.name.toLowerCase().includes(filter)) continue;
    const ks=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(ours(k)&&k!=='lotd-sound') ks.push(k); } ks.forEach(k=>localStorage.removeItem(k));
    if(opts.trace) console.log('… '+t.name);
    seed(12345); let res={name:t.name,ok:true};
    try{ fresh(); t.fn(); }catch(e){ res={name:t.name,ok:false,err:(e&&e.message)||String(e)}; }
    results.push(res); if(!opts.quiet) console[res.ok?'log':'error']((res.ok?'ok   ':'FAIL ')+t.name+(res.ok?'':'\n     '+res.err));
  }
  Math.random=keep.rnd; S=keep.S; SFX.on=keep.sfx; for(const k in ui) delete ui[k]; Object.assign(ui,keep.ui);
  const now=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(ours(k)) now.push(k); } now.forEach(k=>localStorage.removeItem(k)); for(const k in keep.store) localStorage.setItem(k,keep.store[k]);
  if(S) try{ render(); }catch(e){}
  const pass=results.filter(r=>r.ok).length, out={pass,fail:results.length-pass,results,ms:Date.now()-t0};
  if(!opts.quiet) console.log(pass+' passed, '+out.fail+' failed');
  return out;
}
async function load(base){ base=base||'/tests/groups/'; for(const f of FILES){ await new Promise((ok,bad)=>{ const s=document.createElement('script'); s.src=base+f+'?'+Date.now(); s.onload=ok; s.onerror=()=>bad(new Error('could not load '+f)); document.head.appendChild(s); }); } return TESTS.length; }
window.LOTD_TESTS={run,load,files:FILES,get count(){ return TESTS.length; },invariants,cleanHTML,mulberry32};   // invariants and cleanHTML are also used by tests/fuzz.js
})();
