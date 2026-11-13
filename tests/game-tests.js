/* Ledger of the Dead: tests for every game system.
 *
 * Node (recommended):   node tests/run-tests.js            (or: node tests/run-tests.js market   to run one group)
 * Browser:              with the game open on http://localhost:5173, paste this file into the console (or load it with a
 *                       script tag), then run  LOTD_TESTS.run()   Your game and saves are backed up and put back afterwards.
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
function fresh(lvl){ newGame(); S.notices=[]; for(const k in ui) delete ui[k]; ui.confirm=null; ui.tab='gates'; if(lvl&&lvl>1) setLvl(lvl); return S; }
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
function renderAll(where){ render(); cleanHTML(app.innerHTML,where); return app.innerHTML; }
const TABS=['gates','gear','bes','skills','market','tower','titles','settings','help','hist'];
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
  ok(S.army.length<=10,'army larger than 10'+w);
  for(const m of S.army){ finite(m.hp,'minion hp'+w); finite(m.maxHp,'minion maxHp'+w); finite(m.atk,'minion atk'+w); ok(m.hp<=m.maxHp,m.nick+' hp above max'+w); ok(m.lvl<=Math.max(P.lvl+2,m.lvl0),m.nick+' grew past the level cap'+w);
    const c=JSON.parse(JSON.stringify(m)); syncMinion(c); ok(c.maxHp===m.maxHp&&c.atk===m.atk,m.nick+' has stale stats ('+m.maxHp+'/'+m.atk+', should be '+c.maxHp+'/'+c.atk+')'+w); }
  const seen=new Set(), all=S.inv.concat(Object.values(S.equip).filter(Boolean)); S.army.forEach(m=>m.eq&&Object.values(m.eq).forEach(x=>x&&all.push(x)));
  for(const it of all){ ok(ITEM[it.id],'unknown item '+it.id+w); ok(!seen.has(it.u),'two items share id '+it.u+w); seen.add(it.u); ok(it.u<=S.uid,'item id above S.uid'+w); }
  for(const k in S.trophies) ok(TROPHY[k]&&S.trophies[k]>0,'bad trophy entry '+k+w);
  for(const k of ['hp','mp']) ok(S.belt[k]>=0&&S.belt[k]<=BELT_MAX,'belt '+k+' = '+S.belt[k]+w);
  if(S.run) for(const e of S.run.enemies){ finite(e.hp,'foe hp'+w); finite(e.atk,'foe atk'+w); ok(e.hp>=0&&e.hp<=e.maxHp,e.name+' hp '+e.hp+'/'+e.maxHp+w); }
  if(S.mode==='town') ok(!S.run,'a run is left over in town'+w); else ok(S.run,'no run outside town'+w);
}

// =====================================================================================================
// DATA
test('Data: every gate has 7 enemies with known roles and a reaper boss',()=>{
  eq(DUNGEONS.length,6);
  DUNGEONS.forEach((D,i)=>{ eq(D.mobs.length,7,D.name); D.mobs.forEach(m=>{ ok(ROLES[m[1]],m[0]+' role'); ok(m[2]>0&&m[3]>0,m[0]+' factors'); });
    eq(D.mobs.filter(m=>m[1]==='mender').length,2,D.name+' menders'); eq(D.boss[1],'reaper',D.name+' boss role'); ok(ARMED.has(D.mobs[6][0]),D.name+' gear-bearer'); });
});
test('Data: enemy names are unique across gates and the Tower',()=>{ const a=allNames(); eq(new Set(a).size,a.length); });
test('Data: 60 items, each with a slot, tier and real stats',()=>{
  eq(Object.keys(ITEM).length,60);
  for(const d of Object.values(ITEM)){ ok(SLOTS[d.slot],d.id+' slot'); ok(d.tier>=0&&d.tier<TIERS.length,d.id+' tier'); ok(d.name&&!BAD_TEXT.test(d.name),d.id+' name');
    for(const k in d.stats){ ok(STATL[k],d.id+' unknown stat '+k); finite(d.stats[k],d.id+'.'+k); ok(d.stats[k]>=0,d.id+'.'+k+' negative'); }
    ok(Object.values(d.stats).some(v=>v>0),d.id+' has no stats'); if(d.flag) ok(FLAGS[d.flag],d.id+' flag text'); }
});
test('Data: item stats grow with each gate set',()=>{ for(const k of KINDS) for(let s=1;s<6;s++){ const a=ITEM[(s-1)+'-'+k].stats, b=ITEM[s+'-'+k].stats; const sum=o=>Object.values(o).reduce((x,y)=>x+y,0); ok(sum(b)>sum(a),k+' set '+s); } });
test('Data: every gate enemy has a signature item from its own gate',()=>{
  DUNGEONS.forEach((D,i)=>D.mobs.forEach(m=>{ const id=SIG[m[0]]; ok(id&&ITEM[id],m[0]+' has no signature'); eq(ITEM[id].set,i,m[0]+' signature set'); }));
});
test('Data: every enemy has a trophy, and boss hearts are worth more',()=>{
  DUNGEONS.forEach(D=>{ D.mobs.forEach(m=>ok(TROPHY[m[0]],m[0])); ok(TROPHY['b:'+D.boss[0]],D.boss[0]); ok(TROPHY['b:'+D.boss[0]].value>TROPHY[D.mobs[0][0]].value); });
  TW_MOBS.forEach(m=>ok(TROPHY['t:'+m[0]],m[0])); TW_BOSS.forEach(n=>ok(TROPHY['b:'+n],n));
  for(const k in TROPHY){ ok(TROPHY[k].value>0,k); ok(!BAD_TEXT.test(TROPHY[k].name),k); }
});
test('Data: every enemy, item and the player has an icon',()=>{
  const miss=allNames().filter(n=>!IC[n]).concat(Object.values(ITEM).map(d=>d.glyph||('i_'+d.kind)).filter(k=>!IC[k]));
  ['Necromancer','?','_'].forEach(k=>{ if(!IC[k]) miss.push(k); });
  eq(miss.length,0,'missing icons: '+miss.join(', '));
});
test('Data: titles, skills, tips and boss moves have unique ids and readable text',()=>{
  const ids=a=>a.map(x=>x.id); const uniq=(a,n)=>eq(new Set(a).size,a.length,n+' ids');
  uniq(ids(TITLES),'title'); uniq(ids(SKILLS),'skill'); uniq(ids(TIPS),'tip');
  eq(SKILLS.length,12); SKILLS.forEach(s=>{ for(let r=1;r<=SK_MAX;r++) ok(!BAD_TEXT.test(s.desc(r)),s.id+' rank '+r); if(s.type==='active') ok(s.cost>0&&s.cd>0,s.id+' cost/cd'); });
  GATE_ABIL.forEach(a=>ok(BOSS_ABIL[a],a)); TITLES.forEach(t=>ok(t.name&&t.req&&!BAD_TEXT.test(t.req),t.id));
});
test('Data: tier weights add up to 100',()=>{ TIER_W.forEach((r,i)=>eq(r.reduce((a,b)=>a+b,0),100,'row '+i)); });
test('Data: difficulty tables have one entry per gate',()=>{ eq(DIFF.gate.length,6); eq(DIFF.armor.length,6); eq(DIFF.foeAtk.length,6); eq(SAFE.length,6); DIFF.armor.forEach(a=>ok(a>=0&&a<1)); for(let i=1;i<6;i++) ok(SAFE[i]>SAFE[i-1]&&RK[i].unlock>RK[i-1].unlock); });

// =====================================================================================================
// PLAYER STATS
test('Stats: a new game starts at level 1 with 3 points, full HP and mana',()=>{
  const P=S.player; eq(P.lvl,1); eq(P.pts,3); eq(P.sp,0); eq(P.stats.strength,4); eq(P.stats.constitution,4); eq(P.stats.intelligence,4); eq(P.stats.will,4);
  eq(pMax(),52); eq(P.hp,pMax()); eq(P.mana,pMana()); eq(pAtk(),10); eq(S.watches,WATCHES); eq(S.gold,0); eq(S.day,1);
});
test('Stats: spending points raises the right numbers and current HP/mana',()=>{
  const P=S.player, h=pMax(), m=pMana(), a=pAtk();
  alloc('constitution'); eq(pMax(),h+6); eq(P.hp,h+6);
  alloc('intelligence'); eq(pMana(),m+5); eq(P.mana,m+5);
  alloc('strength'); eq(pAtk(),Math.round(a+1.5)); eq(P.pts,0);
  alloc('will'); eq(P.stats.will,4,'no points left');
});
test('Stats: points cannot be spent in battle',()=>{ S.player.pts=3; arena([foe()]); alloc('strength'); eq(S.player.stats.strength,4); eq(S.player.pts,3); });
test('Stats: a point never lifts HP or mana above a scaled max (bug found by the fuzzer)',()=>{
  const P=S.player; P.pts=20; P.debuff=true; P.skills.bonearmor=3; P.hp=pMax(); for(let i=0;i<6;i++){ const h=pMax(), hp=P.hp; alloc('constitution'); ok(P.hp<=pMax(),'HP above max'); eq(P.hp,hp+(pMax()-h)); }
  checkTitles(); S.ti.got.t50=1; wearTitle('t50'); P.mana=pMana(); for(let i=0;i<6;i++){ alloc('intelligence'); ok(P.mana<=pMana(),'mana above max'); eq(P.mana,pMana()); }
  const m=mkMinion({lvl:5}), mh=m.maxHp; alloc('will'); alloc('will'); ok(m.maxHp>mh,'Will reaches the army'); alloc('bogus'); eq(P.stats.bogus,undefined);
});
test('Stats: gear adds to stats, debuff cuts HP 20%, Bone Armor adds 6% per rank',()=>{
  const base=pMax(); wear('0-aa'); eq(pMax(),base+ITEM['0-aa'].stats.hp); S.equip.armor=null;
  S.player.debuff=true; eq(pMax(),Math.round(base*.8)); S.player.debuff=false;
  S.player.skills.bonearmor=3; eq(pMax(),Math.round(base*1.18));
});
test('Stats: army slots grow with Will and level, capped at 10',()=>{
  eq(slots(),2); S.player.stats.will=9; eq(slots(),4); S.player.lvl=10; eq(slots(),6); S.player.stats.will=99; eq(slots(),10);
});
test('Stats: rank letter follows level',()=>{ [[1,0],[4,1],[8,2],[12,3],[17,4],[23,5],[60,5]].forEach(([l,r])=>{ S.player.lvl=l; eq(pRankI(),r,'level '+l); }); });

// =====================================================================================================
// XP AND LEVELS
test('XP: the curve rises every level',()=>{ eq(need(1),64); for(let l=1;l<80;l++) ok(need(l+1)>need(l)); });
test('XP: leveling gives 3 stat points, 1 skill point and refills HP/mana',()=>{
  const P=S.player; P.hp=1; P.mana=0; const ups=addXp(need(1)); eq(ups,1); eq(P.lvl,2); eq(P.xp,0); eq(P.pts,6); eq(P.sp,1); eq(P.hp,pMax()); eq(P.mana,pMana());
});
test('XP: a big gain rolls over several levels',()=>{ const P=S.player; let t=0; for(let l=1;l<6;l++) t+=need(l); const ups=addXp(t+5); eq(ups,5); eq(P.lvl,6); eq(P.xp,5); eq(P.sp,5); });
test('XP: a new skill unlocking is announced',()=>{ addXp(need(1)); ok(S.notices.some(n=>/Bone Spear/.test(n.m)),'level 2 names Bone Spear'); });
test('XP: minions level up to your level + 2 and no further',()=>{
  const m=mkMinion({}); minionXp(m,1e7); eq(m.lvl,3); ok(m.xp<mneed(3)); eq(minionXp(m,1e7),0);
});
test('XP: kill XP grows with level, rank, boss, elite, tower floor and NG+',()=>{
  const e=foe({lvl:5}); const b=killXp(e);
  ok(killXp(foe({lvl:6}))>b); ok(killXp(foe({lvl:5,rankI:2}))>b); eq(killXp(foe({lvl:5,boss:true})),Math.round((4+12.5)*2.5));
  ok(killXp(foe({lvl:5,elite:true}))>b); ok(killXp(foe({lvl:5,tw:12}))>b); S.ngp=1; eq(killXp(e),Math.round(16.5*1.25));
});

// =====================================================================================================
// DAYS AND QUESTS
test('Days: ending a day with the quest undone costs XP and HP',()=>{
  const P=S.player; P.xp=40; endDay(); eq(S.day,2); eq(S.watches,WATCHES); eq(P.xp,40-Math.round(need(1)*.25)); ok(P.debuff); eq(P.hp,pMax()); eq(pMax(),Math.round(52*.8));
});
test('Days: the debuff lifts the next day',()=>{ endDay(); ok(S.player.debuff); S.quest={kills:8,raises:2,clears:1,claimed:false}; endDay(); ok(!S.player.debuff); });
test('Days: a finished quest is claimed once for 2 points and XP',()=>{
  const P=S.player; S.quest={kills:8,raises:2,clears:1,claimed:false}; ok(questDone());
  claimQuest(); eq(P.pts,5); ok(P.xp>0||P.lvl>1); eq(S.ti.claims,1); ok(S.quest.claimed);
  claimQuest(); eq(P.pts,5,'second claim gives nothing'); eq(S.ti.claims,1);
});
test('Days: an unclaimed finished quest is claimed when the day ends',()=>{ S.quest={kills:9,raises:3,clears:1,claimed:false}; endDay(); eq(S.ti.claims,1); ok(!S.player.debuff); });
test('Days: an unfinished quest cannot be claimed',()=>{ S.quest={kills:8,raises:1,clears:1,claimed:false}; claimQuest(); ok(!S.quest.claimed); eq(S.player.pts,3); });
test('Days: resting skips to the next day, only from town',()=>{ restDay(); eq(S.day,2); arena([foe()]); restDay(); eq(S.day,2); });
test('Days: the third watch ends the day when you walk back into town',()=>{
  for(let i=0;i<WATCHES;i++){ startRun(0); ok(S.mode==='battle','run '+i); flee(); }
  eq(S.day,2); eq(S.watches,WATCHES); eq(S.runs,3);
});
test('Days: no runs without a watch left',()=>{ S.watches=0; startRun(0); eq(S.mode,'town'); });

// =====================================================================================================
// ENEMIES AND ROOMS
test('Enemies: stats grow with level and gate; bosses and elites are tougher',()=>{
  const a=mobStats(0,1,1,1); ok(mobStats(0,5,1,1).hp>a.hp); ok(mobStats(1,1,1,1).atk>a.atk);
  const b=mobStats(0,1,1,1,true); near(b.hp/a.hp,3.2,.1); const e=mobStats(0,1,1,1,false,true); near(e.hp/a.hp,1.5,.1);
});
test('Enemies: rooms hold 2, then 3, then 3-4 foes, and the last room has the boss',()=>{
  startRun(0); const r=S.run; eq(r.enemies.length,2);
  r.room=1; spawnRoom(); eq(r.enemies.length,3);
  r.room=2; spawnRoom(); ok(r.enemies.length>=3&&r.enemies.length<=4);
  r.room=3; spawnRoom(); ok(r.enemies[0].boss); eq(r.enemies[0].name,'The Rat King'); eq(r.enemies.length,3); eq(r.enemies[0].abil,'swarm');
});
test('Enemies: a room never holds two menders',()=>{
  setLvl(30); for(let di=0;di<6;di++){ S.watches=3; startRun(di); for(let i=0;i<150;i++){ S.run.room=i%4; spawnRoom(); ok(S.run.enemies.filter(e=>e.role==='mender').length<=1,'gate '+di); } S.run=null; S.mode='town'; }
});
test('Enemies: elites get a prefix and every foe gets an id, level and HP',()=>{
  setLvl(30); let elites=0; for(let i=0;i<300;i++){ const e=makeEnemy(i%6,5,false); if(e.elite){ elites++; ok(ELITE.some(p=>e.name.startsWith(p+' '))); } ok(e.id&&e.hp>0&&e.atk>0&&e.hp===e.maxHp); }
  ok(elites>10&&elites<60,'about 10% elites, got '+elites);
});
test('Enemies: foe armor and attack follow the gate tables',()=>{
  eq(foeArmor(),0,'no armor in town'); setLvl(30);
  for(let di=0;di<6;di++){ S.watches=3; startRun(di); eq(foeArmor(),DIFF.armor[di]); near(dmgMul(),1-DIFF.armor[di],1e-9); S.run=null; S.mode='town'; }
});
test('Enemies: New Game+ adds 30% HP and attack per level',()=>{
  const a=foe({hp:100,atk:10}); S.ngp=1; foeScale([a],1); eq(a.maxHp,130); eq(a.hp,130); eq(a.atk,13);
  S.ngp=0; const b=foe({hp:100,atk:10}); foeScale([b],2); eq(b.hp,100); eq(b.atk,20);
});
test('Enemies: gates stay locked below their level',()=>{ startRun(1); eq(S.mode,'town'); setLvl(4); startRun(1); eq(S.mode,'battle'); eq(S.run.di,1); });

// =====================================================================================================
// COMBAT
test('Combat: Strike hits through armor, gives mana and ends the turn',()=>{
  const t=foe({hp:10000}); arena([t]); fix(.5); const P=S.player; P.mana=0;
  const d=H(pAtk()*dmgMul()); act('strike'); eq(t.hp,10000-d); eq(d,7); eq(P.mana,4,'+3 strike, +1 per turn'); eq(S.run.turn,2); eq(P.hp,pMax()-1,'the foe hits back for 1');
});
test('Combat: Soul Siphon needs 8 mana, drains and heals',()=>{
  const t=foe({hp:10000}); arena([t]); fix(.5); const P=S.player;
  P.mana=7; act('siphon'); eq(S.run.turn,1,'no turn spent'); eq(P.mana,7);
  P.mana=20; P.hp=10; const d=H(pSiph()*dmgMul()); act('siphon'); eq(t.hp,10000-d); eq(P.hp,10+Math.round(d*.35)-1); eq(P.mana,20-8+1);
});
test('Combat: Bone Ward shields you (capped at 60% max HP) and soaks hits first',()=>{
  arena([foe({atk:1})]); fix(.5); const P=S.player; P.mana=20; act('ward'); eq(P.shield,Math.min(Math.round(pMax()*.6),pWard())-1); eq(P.hp,pMax());
  P.mana=60; for(let i=0;i<5;i++) act('ward'); ok(P.shield<=Math.round(pMax()*.6));
  P.mana=5; const s=P.shield; act('ward'); eq(S.run.turn,7,'not enough mana: no turn'); ok(P.shield===s);
});
test('Combat: foe shields soak damage before HP, curses add damage',()=>{
  const e=foe({hp:100}); arena([e]); e.shield=8; hurtFoe(e,10); eq(e.shield,0); eq(e.hp,98);
  e.curse={mul:1.5,t:3}; hurtFoe(e,10); eq(e.hp,83); hurtFoe(e,1000); eq(e.hp,0,'HP never goes below zero');
});
test('Combat: a kill leaves a body, counts for the quest and bestiary, and wins the room',()=>{
  const t=foe({hp:1,lvl:1}); arena([t]); fix(.5); act('strike');
  eq(S.mode,'raise'); eq(S.run.corpses.length,1); eq(S.quest.kills,1); eq(S.kills['Tunnel Rat'],1); eq(S.player.xp,killXp(t)); ok(S.gold>0,'gold banked');
  eq(S.run.corpses[0].base,'Tunnel Rat'); ok(!S.run.corpses[0].tried);
});
test('Combat: falling ends the run, costs XP and the room\'s gold and trophies',()=>{
  arena([foe({atk:9999})]); fix(.5); const P=S.player; P.xp=50; P.hp=1; S.run.gold=25; S.run.troph={'Tunnel Rat':2}; S.gold=7;
  act('strike'); eq(S.mode,'defeat'); eq(P.xp,50-Math.round(need(1)*DIFF.deathXp)); eq(S.run.gold,0); eq(Object.keys(S.run.troph).length,0); eq(S.gold,7); eq(S.ti.deaths,1);
  returnTown(); eq(S.mode,'town'); eq(P.hp,pMax());
});
test('Combat: going deeper heals a little and resets cooldowns; leaving heals fully',()=>{
  arena([foe({hp:1})]); fix(.5); act('strike'); const P=S.player; P.hp=10; S.run.cd={spear:2}; S.run.silence=2;
  descend(); eq(S.mode,'battle'); eq(S.run.room,1); eq(P.hp,10+Math.round(pMax()*DIFF.heal)); eq(Object.keys(S.run.cd).length,0); eq(S.run.silence,0); eq(S.run.enemies.length,3);
  flee(); eq(S.mode,'town'); eq(P.hp,pMax()); ok(S.notices.some(n=>/fled/.test(n.m)));
});
test('Combat: a strong necromancer clears the whole Rat Warren',()=>{
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); startRun(0); let n=0;
  while(n++<300){ if(S.mode==='battle') act('strike'); else if(S.mode==='raise'){ if(S.run.cleared) break; descend(); } else break; }
  ok(S.run.cleared,'cleared'); eq(S.run.room,3); eq(S.ti.clr[0],1); eq(S.quest.clears,1); ok(S.kills['The Rat King']>=1);
  returnTown(); checkTitles(); ok(S.ti.got.g0,'Ratcatcher title');
});
test('Combat: foe menders heal hurt allies, weakened by armor',()=>{
  const md=foe({role:'mender',atk:10,hp:10000}), hurt=foe({hp:10,maxHp:100}); arena([md,hurt]); fix(.5); act('strike');
  eq(hurt.hp,10+Math.round(10*.9*(1-DIFF.armor[0])));
});
test('Combat: minion menders heal you, reapers cleave a second foe',()=>{
  const a=foe({hp:10000}), b=foe({hp:10000}); arena([a,b]); fix(.5);
  const md=mkMinion({role:'mender'}); md.atk=20; const rp=mkMinion({role:'reaper'}); rp.atk=100; S.player.hp=10;
  act('strike'); ok(S.player.hp>=10+18-2,'healed by the mender'); const d=H(100*dmgMul()); eq(b.hp,10000-Math.round(d*.5));
});
test('Combat: vanguards draw most enemy blows',()=>{
  arena([foe({hp:1e6,atk:1})]); seed(5); const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e6; S.player.stats.constitution=1e4; S.player.hp=pMax();
  let onV=0; for(let i=0;i<300;i++){ const h=v.hp; act('strike'); if(v.hp<h) onV++; } ok(onV>170&&onV<260,'vanguard took '+onV+' of 300 blows');
});
test('Combat: the target can be chosen and moves on when it dies',()=>{
  const a=foe({hp:1}), b=foe({hp:1000}); arena([a,b]); setTarget(b.id); eq(S.run.target,b.id); setTarget('nope'); eq(S.run.target,b.id);
  setTarget(a.id); fix(.5); act('strike'); eq(currentTarget().id,b.id);
});
test('Combat: nothing happens on unknown actions or outside battle',()=>{ act('strike'); eq(S.mode,'town'); arena([foe()]); act('dance'); eq(S.run.turn,1); });

// =====================================================================================================
// RAISING
test('Raising: chance rises with Will and level, falls for rank, elites and bosses, clamped 5-90',()=>{
  const c=corpse({lvl:1}); const base=raiseChance(c); eq(base,Math.round(35+4*2.2));
  S.player.stats.will=10; ok(raiseChance(c)>base); S.player.stats.will=4;
  ok(raiseChance(corpse({elite:true}))<base); ok(raiseChance(corpse({boss:true}))<raiseChance(corpse({elite:true})));
  eq(raiseChance(corpse({lvl:99})),5); S.player.lvl=99; eq(raiseChance(c),90); S.player.lvl=1;
  S.player.skills.mastery=2; eq(raiseChance(c),base+8);
});
test('Raising: a success adds a named minion with a trait (bosses two)',()=>{
  const c=corpse(), b=corpse({boss:true,name:'The Rat King',base:'The Rat King',role:'reaper'}); const r=raiseScene([c,b],5); fix(0); const P=S.player; P.mana=100;
  tryRaise(c.id); eq(S.army.length,1); eq(P.mana,100-raiseCost(c)); eq(c.result,'raised'); ok(c.tried); eq(S.army[0].traits.length,1); eq(S.army[0].hp,S.army[0].maxHp); eq(S.quest.raises,1); eq(S.ti.raised,1); eq(r.raised,1);
  tryRaise(b.id); eq(S.army[1].traits.length,2); ok(S.army[1].traits[0]!==S.army[1].traits[1]); ok(S.army[0].nick!==S.army[1].nick,'unique names');
  tryRaise(c.id); eq(S.army.length,2,'a body can only be tried once');
});
test('Raising: a failure still spends the mana',()=>{ const c=corpse(); raiseScene([c]); fix(.999); S.player.mana=50; tryRaise(c.id); eq(S.army.length,0); eq(c.result,'failed'); eq(S.player.mana,50-raiseCost(c)); });
test('Raising: blocked when the army is full or mana is short',()=>{
  const c=corpse(); raiseScene([c]); fix(0); S.player.mana=0; tryRaise(c.id); ok(!c.tried); ok(/mana/.test(S.run.events[0].m));
  S.player.mana=100; while(S.army.length<slots()) mkMinion({}); tryRaise(c.id); ok(!c.tried); ok(/full/.test(S.run.events[0].m)); eq(S.player.mana,100);
});
test('Raising: Grave Salts add 20% (up to 95%) and are used up',()=>{
  const c=corpse(); raiseScene([c]); S.salts=2; S.player.mana=100; eq(saltChance(c),raiseChance(c)+SALT_BONUS); eq(saltChance(corpse({lvl:-99})),95);
  fix((raiseChance(c)+5)/100); tryRaise(c.id,true); eq(S.army.length,1,'salt turned a miss into a raise'); eq(S.salts,1);
});
test('Raising: gear-bearers rise with three empty gear slots',()=>{ const c=corpse({armed:true,name:'Warren Bandit',base:'Warren Bandit'}); raiseScene([c]); fix(0); S.player.mana=99; tryRaise(c.id); const m=S.army[0]; ok(m.armed); eq(Object.keys(m.eq).join(),'weapon,armor,relic'); eq(S.ti.armed,1); });
test('Raising: cost depends on rank and boss',()=>{ eq(raiseCost(corpse()),8); eq(raiseCost(corpse({rankI:2})),14); eq(raiseCost(corpse({boss:true})),12); });
test('Raising: only possible on the raise screen',()=>{ const c=corpse(); arena([foe()]); S.run.corpses=[c]; S.player.mana=99; fix(0); tryRaise(c.id); eq(S.army.length,0); });

// =====================================================================================================
// MINIONS, TRAITS AND EVOLUTION
test('Minions: Thick-boned adds 25% HP, Vicious 20% attack',()=>{
  setLvl(40); const o={lvl:40,rankI:5}, a=mkMinion(o), b=mkMinion(Object.assign({traits:['thick']},o)), c=mkMinion(Object.assign({traits:['vicious']},o));
  near(b.maxHp/a.maxHp,1.25,.02); near(c.atk/a.atk,1.2,.03); eq(c.maxHp,a.maxHp);
});
test('Minions: Will, minion power gear and Grave Pact make minions stronger',()=>{
  const a=mkMinion({lvl:10}); const h=a.maxHp; S.player.stats.will=20; syncMinion(a); ok(a.maxHp>h);
  const h2=a.maxHp; S.player.skills.gravepact=3; syncMinion(a); near(a.maxHp/h2,1.18,.02); const h3=a.maxHp; wear('0-tc'); syncMinion(a); ok(a.maxHp>h3);
});
test('Minions: Stalwart and Swarmguard cut damage taken',()=>{
  arena([foe()]); const a=mkMinion({traits:['stalwart']}); a.hp=a.maxHp=1000; hurtAlly(a,100); eq(a.hp,920);
  const b=mkMinion({}); b.hp=b.maxHp=1000; wear('w4'); hurtAlly(b,100); eq(b.hp,925);
});
test('Minions: Leeching heals, Frenzied can strike twice',()=>{
  const t=foe({hp:1e6}); arena([t]); const m=mkMinion({traits:['leech','frenzied']}); m.atk=100; m.hp=10; m.maxHp=1000;
  seq([.5,.9,.5,.5,.1,.5]); act('strike'); ok(m.hp>10,'leech healed'); const d=H(100*dmgMul()); ok(1e6-t.hp>=H(pAtk()*dmgMul())+d,'minion hit');
});
test('Minions: downed minions shatter or bind back; Grave-bound and Bone Bank never shatter',()=>{
  arena([foe({hp:0,dead:true})]); fix(0); const a=mkMinion({}), b=mkMinion({traits:['gravebound']}); a.hp=0; b.hp=0;
  roomWon(); ok(!S.army.includes(a),'shattered'); ok(S.army.includes(b)); eq(b.hp,Math.ceil(b.maxHp*.4));
  S.mode='battle'; const c=mkMinion({}); c.hp=0; wear('u0'); roomWon(); ok(S.army.includes(c),'Bone Bank kept it');
});
test('Minions: shattered gear-bearers drop their gear into the bag',()=>{
  arena([foe({hp:0,dead:true})]); fix(0); const m=mkMinion({armed:true,eq:{weapon:{u:++S.uid,id:'0-wa'},armor:null,relic:null}}); m.hp=0; roomWon();
  ok(S.inv.some(it=>it.id==='0-wa'));
});
test('Minions: evolve at +5 and +10 levels, gaining a trait and 15% stats each time',()=>{
  setLvl(30); const m=mkMinion({lvl:1}); const h=m.maxHp; m.lvl=6; checkEvolve(m); syncMinion(m); eq(m.stage,1); eq(m.traits.length,1); eq(mName(m),'Greater Tunnel Rat'); eq(S.ti.evolved,1);
  m.lvl=11; checkEvolve(m); eq(m.stage,2); eq(m.traits.length,2); eq(S.ti.elder,1); m.lvl=40; checkEvolve(m); eq(m.stage,2,'Elder is the last stage');
  const p=mkMinion({lvl:30,rankI:5}), q=mkMinion({lvl:30,rankI:5,stage:2}); near(q.maxHp/p.maxHp,1+2*STAGE_BONUS,.01,'Elder HP bonus'); near(q.atk/p.atk,1+2*STAGE_BONUS,.02,'Elder attack bonus');
});
test('Minions: evolving through XP or the Bone Altar works too',()=>{ setLvl(30); const m=mkMinion({lvl:1}); minionXp(m,1e5); eq(m.stage,2); const k=mkMinion({lvl:1}); S.gold=1e6; for(let i=0;i<5;i++) empower(k.uid); eq(k.stage,1); });
test('Minions: names read naturally',()=>{
  eq(mName({name:'The Rat King',stage:2}),'The Elder Rat King'); eq(mName({name:'Crypt Ghoul',stage:1}),'Greater Crypt Ghoul'); eq(mName({name:'Imp'}),'Imp');
  eq(withArticle('Elder Imp'),'an Elder Imp'); eq(withArticle('Greater Imp'),'a Greater Imp'); eq(withArticle('The Elder Rat King'),'The Elder Rat King'); eq(theName('Imp'),'the Imp'); eq(theName('The Rat King'),'The Rat King');
});
test('Minions: releasing returns gear; trait rolls never repeat',()=>{
  const m=mkMinion({armed:true,eq:{weapon:{u:++S.uid,id:'0-wa'},armor:{u:++S.uid,id:'0-aa'},relic:null}}); release(m.uid); eq(S.army.length,0); eq(S.inv.length,2);
  const have=[]; let t; while((t=rollTrait(have))) have.push(t); eq(have.length,TRAIT_IDS.length); eq(new Set(have).size,have.length);
});

// =====================================================================================================
// GEAR-BEARERS
test('Gear-bearers: giving gear raises stats, taking it back returns it',()=>{
  const m=mkMinion({armed:true,eq:{weapon:null,armor:null,relic:null},lvl:5}); const a=m.atk, h=m.maxHp; const w=give('2-wa'), ar=give('2-aa');
  giveGear(m.uid,w.u); ok(m.atk>a); giveGear(m.uid,ar.u); ok(m.maxHp>h); eq(S.inv.length,0);
  const w2=give('3-wa'); giveGear(m.uid,w2.u); eq(m.eq.weapon.id,'3-wa'); ok(S.inv.some(x=>x.id==='2-wa'),'old weapon back in bag');
  takeGear(m.uid,'armor'); eq(m.eq.armor,null); eq(m.maxHp,Math.min(m.maxHp,m.maxHp)); ok(m.hp<=m.maxHp);
});
test('Gear-bearers: ordinary minions cannot hold gear; full bag blocks taking gear; no swaps in battle',()=>{
  const n=mkMinion({}); const it=give('0-wa'); giveGear(n.uid,it.u); eq(S.inv.length,1);
  const m=mkMinion({armed:true,eq:{weapon:{u:++S.uid,id:'0-wa'},armor:null,relic:null}}); while(S.inv.length<bagMax()) give('0-ta');
  takeGear(m.uid,'weapon'); ok(m.eq.weapon,'kept when the bag is full'); ok(S.notices.some(x=>/bag is full/.test(x.m)));
  S.inv=[]; arena([foe()]); takeGear(m.uid,'weapon'); ok(m.eq.weapon,'not in battle');
});
test('Gear-bearers: gear converts sensibly into minion attack and HP',()=>{ const o=gearBonus({eq:{weapon:{id:'0-wa'},armor:{id:'0-aa'},relic:{id:'0-tc'}}}); ok(o.atk>0&&o.hp>0&&o.mpow>0); eq(gearBonus({}).atk,0); });

// =====================================================================================================
// ITEMS AND DROPS
test('Items: the bag holds 30, uniques always fit',()=>{ eq(bagMax(),30); for(let i=0;i<30;i++) ok(addItem('0-wa')); eq(addItem('0-wa'),null); ok(addItem('u0')); eq(S.inv.length,31); });
test('Items: equipping swaps slots and keeps HP/mana in step',()=>{
  const a=give('0-aa'), b=give('1-aa'); const P=S.player, h=pMax(); equip(a.u); eq(S.equip.armor.u,a.u); eq(P.hp,h+ITEM['0-aa'].stats.hp);
  equip(b.u); eq(S.equip.armor.u,b.u); ok(S.inv.some(x=>x.u===a.u)); unequip('armor'); eq(S.equip.armor,null); eq(P.hp,pMax()); eq(S.inv.length,2);
  discard(a.u); eq(S.inv.length,1);
});
test('Items: no equipping in battle',()=>{ const a=give('0-aa'); arena([foe()]); equip(a.u); eq(S.equip.armor,null); });
test('Items: every drop table adds up to 100% and only lists real items',()=>{
  for(let di=0;di<6;di++) for(const role of Object.keys(ROLES)) for(const boss of [false,true]) for(const el of [false,true]){
    const rows=tableFor(di,role,boss,el); near(rows.reduce((a,r)=>a+r.p,0),1,1e-9,'gate '+di+' '+role); rows.forEach(r=>ok(ITEM[r.id],r.id)); ok(rows.some(r=>r.id==='u'+di)); }
  for(const f of [1,10,25,50,99,100,150]) for(const role of Object.keys(ROLES)){ const rows=towerTable(f,role,f%10===0,false); near(rows.reduce((a,r)=>a+r.p,0),1,1e-9,'floor '+f); }
});
test('Items: ordinary foes drop gear 28% of the time, elites 65%, bosses always',()=>{
  seed(3); let n=0, e=0, b=0; const N=4000;
  for(let i=0;i<N;i++){ n+=rollDrops(foe({base:'Tunnel Rat',role:'striker'})).length; e+=rollDrops(foe({elite:true})).length; const d=rollDrops(foe({boss:true,role:'reaper'})); ok(d.length>=1); b+=d.length; }
  near(n/N,.28,.03); near(e/N,.65,.03); near(b/N,1.6,.04);
});
test('Items: bosses drop their gate unique about as often as the table says',()=>{
  seed(9); let u=0; const N=20000; for(let i=0;i<N;i++) for(const id of rollDrops(foe({boss:true,role:'reaper'}))) if(id==='u0') u++; near(u/(N*1.6),UQ[0]/100,.01);
});
test('Items: loot that does not fit the bag is listed as lost',()=>{
  arena([foe({hp:0,dead:true})]); while(S.inv.length<bagMax()) give('0-ta'); S.run.loot=['0-wa','u0']; roomWon(); eq(S.run.lostLoot.join(),ITEM['0-wa'].name); ok(S.inv.some(x=>x.id==='u0'));
});

// =====================================================================================================
// SKILLS
test('Skills: learning needs a point, the right level, and town',()=>{
  const P=S.player; learnSkill('spear'); eq(sk('spear'),0,'no points');
  P.sp=10; learnSkill('spear'); eq(sk('spear'),0,'level 1 is too low'); setLvl(2); learnSkill('spear'); eq(sk('spear'),1); eq(P.sp,9);
  learnSkill('spear'); eq(sk('spear'),1,'rank 2 needs level 7'); setLvl(12); learnSkill('spear'); learnSkill('spear'); eq(sk('spear'),3); learnSkill('spear'); eq(sk('spear'),3,'max rank 3'); eq(P.sp,7);
  learnSkill('reap'); eq(sk('reap'),0); setLvl(18); learnSkill('reap'); eq(sk('reap'),1); learnSkill('nope'); eq(P.sp,6);
  arena([foe()],0); learnSkill('mend'); eq(sk('mend'),0,'not in battle');
});
test('Skills: forgetting returns every point; Bone Armor follows learning and forgetting',()=>{
  const P=S.player; setLvl(20); P.sp=6; learnSkill('bonearmor'); learnSkill('bonearmor'); learnSkill('spear'); ok(pMax()>Math.round((24+24+80))); eq(P.hp,pMax());
  resetSkills(); eq(P.sp,6); eq(Object.keys(P.skills).length,0); eq(P.hp,pMax()); ok(P.hp<=pMax());
});
test('Skills: actives are blocked in town, by silence, cooldown and low mana',()=>{
  S.player.skills.spear=1; ok(!canUse('spear'),'town'); arena([foe({hp:1e6})]); S.player.mana=100; ok(canUse('spear'));
  S.run.silence=2; ok(!canUse('spear'),'silenced'); S.run.silence=0; S.player.mana=5; ok(!canUse('spear'),'mana'); S.player.mana=100;
  fix(.5); act('sk:spear'); eq(skCd('spear'),2); ok(!canUse('spear'),'cooldown'); act('strike'); act('strike'); ok(canUse('spear'),'ready again after 2 turns');
  ok(!canUse('bonearmor'),'passives are never used'); ok(!canUse('reap'),'not learned');
});
test('Skills: Bone Spear pierces half of armor',()=>{
  const t=foe({hp:1e6}); arena([t],3); fix(.5); S.player.skills.spear=1; S.player.mana=100; act('sk:spear');
  eq(1e6-t.hp,H((pAtk()+pSiph())*.85*(1-DIFF.armor[3]*.5)));
});
test('Skills: Corpse Explosion hits every foe through armor and uses up a body',()=>{
  const a=foe({hp:1e6}), b=foe({hp:1e6}); arena([a,b],2); fix(.5); S.player.skills.blast=1; S.player.mana=100;
  ok(!canUse('blast'),'needs a body'); const c=corpse(); S.run.corpses=[c]; act('sk:blast'); const d=H(pSiph()*.8);
  eq(1e6-a.hp,d); eq(1e6-b.hp,d); eq(c.result,'exploded'); ok(c.tried);
});
test('Skills: Dark Mending heals hurt minions only',()=>{
  arena([foe({hp:1e6})]); S.player.skills.mend=1; S.player.mana=100; const m=mkMinion({lvl:10}); ok(!canUse('mend'),'nobody hurt');
  m.hp=1; ok(canUse('mend')); fix(.5); act('sk:mend'); ok(m.hp>=1+Math.round(m.maxHp*.23)-1-1);
});
test('Skills: Curse of Frailty adds damage for 3 turns',()=>{
  const t=foe({hp:1e6}); arena([t]); fix(.5); S.player.skills.curse=1; S.player.mana=100; act('sk:curse'); ok(t.curse); near(t.curse.mul,1.25,1e-9);
  act('strike'); ok(t.curse,'still cursed'); act('strike'); eq(t.curse,undefined,'gone after 3 turns');
});
test('Skills: Grave Chill freezes foes; bosses may resist; frozen foes skip their turn',()=>{
  const t=foe({hp:1e6,atk:9999}); arena([t]); S.player.skills.chill=1; S.player.mana=100; fix(.5); act('sk:chill'); ok(!t.stun,'stun used up this turn');
  eq(S.player.hp,pMax(),'frozen foe did not hit'); S.player.skills.chill=3; S.run.cd={}; S.player.mana=100;
  const b=foe({hp:1e6,boss:true,atk:1}); S.run.enemies=[b]; S.run.target=b.id; fix(.99); useSkill('chill',b); ok(!b.stun,'boss resisted'); S.run.cd={}; fix(0); useSkill('chill',b); eq(b.stun,2,'rank 3 freezes for 2 turns');
});
test('Skills: freezing a charging boss cancels its move',()=>{
  setLvl(23); const b=makeEnemy(5,25,true); b.hp=b.maxHp=1e7; arena([b],5); fix(.5); b.charging=true; b.stun=1; const hp=S.player.hp;
  act('strike'); ok(!b.charging); eq(b.abilT,BOSS_ABIL.decree.every); eq(S.ti.cancels,1); eq(S.player.hp,hp); checkTitles(); ok(S.ti.got.d_cancel);
});
test('Skills: Unholy Frenzy boosts minion damage for 3 turns',()=>{
  const t=foe({hp:1e6}); arena([t]); fix(.5); S.player.skills.frenzy=2; S.player.mana=100; const m=mkMinion({}); m.atk=100;
  act('sk:frenzy'); eq(S.run.frenzy,2); near(S.run.frenzyMul,1.5,1e-9); const before=t.hp; act('strike'); eq(before-t.hp,H(pAtk()*dmgMul())+H(100*dmgMul()*1.5));
});
test('Skills: Reap ignores armor and doubles on a foe below 35%',()=>{
  const a=foe({hp:1e6}), b=foe({hp:3e5,maxHp:1e6}); arena([a,b],4); fix(.5); S.player.skills.reap=1; S.player.mana=100;
  act('sk:reap'); const d=1e6-a.hp; eq(d,H(pSiph()*1.5)); S.run.cd={}; S.player.mana=100; setTarget(b.id); act('sk:reap'); eq(3e5-b.hp,2*d);
});
test('Skills: Soul Well adds mana each turn, Necrotic Edge sharpens Strike',()=>{
  const t=foe({hp:1e6}); arena([t]); fix(.5); S.player.skills.soulwell=2; S.player.skills.edge=3; S.player.mana=0;
  act('strike'); eq(S.player.mana,3+1+2); eq(1e6-t.hp,H(pAtk()*dmgMul()*1.3));
});
test('Skills: active skills map to keys 4 and up in battle',()=>{ S.player.skills.spear=1; S.player.skills.reap=1; S.player.skills.bonearmor=1; eq(activeSkills().map(s=>s.id).join(),'spear,reap'); });

// =====================================================================================================
// GOLD, LOOT AND THE MARKET
test('Market: kills drop gold, and trophies (bosses 1, elites 2, others 60%)',()=>{
  arena([foe()]); const r=S.run; fix(.5); killLoot(foe({boss:true,base:'The Rat King'}),r); eq(r.troph['b:The Rat King'],1);
  killLoot(foe({elite:true}),r); eq(r.troph['Tunnel Rat'],2); killLoot(foe(),r); eq(r.troph['Tunnel Rat'],3); fix(.7); killLoot(foe(),r); eq(r.troph['Tunnel Rat'],3); ok(r.gold>=4);
  const g=r.gold; bankLoot(r); eq(S.gold,g); eq(S.trophies['Tunnel Rat'],3); eq(r.gold,0);
});
test('Market: the shop sells 4 pieces from your top gate and the one below, restocking daily and on a new gate',()=>{
  const st=shopStock(); eq(st.length,4); eq(new Set(st.map(s=>s.id)).size,4); st.forEach(s=>eq(ITEM[s.id].set,0));
  eq(shopStock(),st,'same stock all day'); setLvl(4); const st2=shopStock(); ok(st2!==st,'restocked on the new gate'); st2.forEach(s=>ok(ITEM[s.id].set<=1));
  S.day++; ok(shopStock()!==st2,'restocked on a new day'); setLvl(60); shopStock().forEach(s=>ok(ITEM[s.id].set>=4&&!ITEM[s.id].uq));
});
test('Market: buying gear costs the set price and fills the bag',()=>{
  const st=shopStock(); S.gold=1000; const p=buyPrice(ITEM[st[0].id]); ok(buyStock(0)); eq(S.gold,1000-p); ok(st[0].sold); eq(S.inv[0].id,st[0].id);
  ok(!buyStock(0),'sold out'); S.gold=0; ok(!buyStock(1),'too poor'); S.gold=1e5; while(S.inv.length<bagMax()) give('0-ta'); ok(!buyStock(1),'bag full'); ok(!buyStock(9),'no such slot');
});
test('Market: potions cost more with level, fill a belt of 3, and are drunk in battle',()=>{
  S.gold=1000; ok(buyPotion('hp')); eq(S.gold,1000-20); ok(buyPotion('hp')); ok(buyPotion('hp')); ok(!buyPotion('hp'),'belt full'); eq(S.belt.hp,3); ok(buyPotion('mp')); ok(!buyPotion('elixir'));
  setLvl(10); eq(POTIONS.hp.price(),65);
  arena([foe({hp:1e6})]); ok(!buyPotion('mp'),'not in battle'); fix(.5); const P=S.player;
  act('pot:hp'); eq(S.run.turn,1,'full HP: refuses'); P.hp=10; act('pot:hp'); eq(P.hp,10+Math.round(pMax()*.35)-1); eq(S.belt.hp,2); eq(S.run.turn,2);
  P.mana=0; act('pot:mp'); eq(P.mana,Math.round(pMana()*.4)+1); eq(S.belt.mp,0); act('pot:mp'); eq(S.run.turn,3,'empty belt: refuses');
});
test('Market: gear sells for a quarter, uniques never, only in town',()=>{
  const a=give('1-wa'), u=give('u0'); eq(sellItem(a.u),20); eq(S.gold,20); eq(sellItem(u.u),0); ok(S.inv.includes(u)); eq(sellItem(999),0);
  const b=give('0-wa'); arena([foe()]); eq(sellItem(b.u),0);
});
test('Market: trophies sell one at a time or all at once',()=>{
  S.trophies={'Tunnel Rat':3,'b:The Rat King':1}; eq(sellTrophy('Tunnel Rat'),3); eq(S.trophies['Tunnel Rat'],2); eq(sellTrophy('Tunnel Rat',true),6); eq(S.trophies['Tunnel Rat'],undefined);
  eq(sellAllTrophies(),TROPHY['b:The Rat King'].value); eq(Object.keys(S.trophies).length,0); eq(S.ti.soldTro,4); eq(sellTrophy('nope'),0);
});
test('Market: the Bone Altar levels a minion for gold, up to your level + 2',()=>{
  setLvl(5); const m=mkMinion({lvl:1}); S.gold=1000; const c=empowerCost(m); ok(empower(m.uid)); eq(m.lvl,2); eq(S.gold,1000-c); eq(m.hp,m.maxHp); eq(S.ti.emp,1);
  m.lvl=7; ok(!empower(m.uid),'capped'); m.lvl=2; S.gold=0; ok(!empower(m.uid),'too poor');
});
test('Market: bag upgrades add 5 slots, four times',()=>{
  S.gold=1e5; for(let i=0;i<4;i++){ ok(buyBag()); eq(bagMax(),35+5*i); } ok(!buyBag(),'maxed'); eq(S.gold,1e5-BAG_COST.reduce((a,b)=>a+b,0));
});
test('Market: Grave Salts stack to 3',()=>{ S.gold=1000; for(let i=0;i<3;i++) ok(buySalt()); ok(!buySalt()); eq(S.salts,3); eq(S.gold,1000-3*saltPrice()); });

// =====================================================================================================
// FORGE AND BREWING
test('Forge: six trophies from one gate and some gold forge that gate\'s gear',()=>{
  S.trophies={'Tunnel Rat':6,'Skeleton Guard':9}; S.gold=100; eq(forgePoints(0),6); fix(.5);
  const r=forgeGear(0,'weapon'); ok(r&&!r.master); eq(ITEM[r.it.id].set,0); eq(ITEM[r.it.id].slot,'weapon'); eq(S.gold,100-forgeGold(0)); eq(S.trophies['Tunnel Rat'],undefined); eq(S.trophies['Skeleton Guard'],9,'other gates untouched');
  eq(forgeGear(0,'weapon'),null,'out of trophies'); eq(forgeGear(1,'cape'),null,'bad slot');
});
test('Forge: a boss heart counts as 5 and is spent last',()=>{
  S.trophies={'Tunnel Rat':7,'b:The Rat King':1}; S.gold=100; eq(forgePoints(0),12); fix(.5); forgeGear(0,'armor'); eq(S.trophies['b:The Rat King'],1); eq(S.trophies['Tunnel Rat'],1);
  S.trophies={'Tunnel Rat':2,'b:The Rat King':1}; forgeGear(0,'relic'); eq(Object.keys(S.trophies).length,0);
});
test('Forge: 20% masterworks come from the next gate (never past the last)',()=>{
  S.trophies={'Tunnel Rat':6}; S.gold=100; fix(0); const r=forgeGear(0,'relic'); ok(r.master); eq(ITEM[r.it.id].set,1); eq(S.ti.master,1);
  S.trophies={'Throne Guard':6}; S.gold=1e4; const r2=forgeGear(5,'weapon'); ok(!r2.master); eq(ITEM[r2.it.id].set,5);
});
test('Forge: needs gold and bag space, only in town',()=>{
  S.trophies={'Tunnel Rat':12}; S.gold=0; eq(forgeGear(0,'weapon'),null); S.gold=100; while(S.inv.length<bagMax()) give('0-ta'); eq(forgeGear(0,'weapon'),null); S.inv=[]; arena([foe()]); eq(forgeGear(0,'weapon'),null);
});
test('Forge: any four trophies brew a potion',()=>{
  S.trophies={'Tunnel Rat':2,'t:Imp':2}; ok(brew('hp')); eq(S.belt.hp,1); eq(Object.keys(S.trophies).length,0);
  S.trophies={'Tunnel Rat':3}; ok(!brew('mp'),'only 3'); S.trophies={'Tunnel Rat':40}; S.belt.mp=3; ok(!brew('mp'),'belt full'); ok(!brew('x'));
});

// =====================================================================================================
// BOSS ABILITIES
function bossFight(di,lvl){ setLvl(Math.max(RK[di].unlock,lvl||1)); const b=makeEnemy(di,RK[di].lv+3,true); b.hp=b.maxHp=1e7; arena([b],di); return b; }
test('Bosses: each gate boss has its own move',()=>{ for(let di=0;di<6;di++){ setLvl(30); const b=makeEnemy(di,10,true); eq(b.abil,GATE_ABIL[di]); eq(b.abilT,BOSS_ABIL[GATE_ABIL[di]].every); } });
test('Bosses: Call the Swarm adds two foes, at most 4 per fight and 5 alive',()=>{
  const b=bossFight(0); eq(bossTurn(b),false); eq(bossTurn(b),false); eq(bossTurn(b),true); eq(S.run.enemies.length,3);
  for(let i=0;i<5;i++) fireAbility(b); eq(b.summoned,SUMMON_CAP); ok(liveFoes().length<=5); S.run.enemies.forEach(e=>ok(e.atk>0&&e.hp>0));
});
test('Bosses: Bone Wall shields every foe, capped at 40% of HP',()=>{ const b=bossFight(1); const x=foe({hp:100}); S.run.enemies.push(x); fireAbility(b); eq(x.shield,20); fireAbility(b); fireAbility(b); eq(x.shield,40); });
test('Bosses: Cinder Wave is telegraphed, then burns you and every minion',()=>{
  const b=bossFight(2); const m=mkMinion({}); m.hp=m.maxHp=1e5; const P=S.player; P.stats.constitution=1e3; P.hp=pMax(); const h=P.hp;
  bossTurn(b); bossTurn(b); eq(bossTurn(b),true); ok(b.charging); eq(P.hp,h,'warning only');
  eq(bossTurn(b),true); ok(!b.charging); ok(P.hp<h); ok(m.hp<1e5); eq(b.abilT,BOSS_ABIL.cinder.every);
});
test('Bosses: Hymn of Silence silences skills for 2 turns and mends foes',()=>{
  const b=bossFight(3); b.hp=b.maxHp/2; S.player.skills.spear=1; S.player.mana=100; fireAbility(b); eq(S.run.silence,3); ok(!canUse('spear')); eq(b.hp,b.maxHp*.6);
  skillTick(); skillTick(); skillTick(); ok(canUse('spear'),'silence fades');
});
test('Bosses: Seedfall mends every foe and sprouts a new one',()=>{ const b=bossFight(4); b.hp=b.maxHp/2; fireAbility(b); eq(b.hp,b.maxHp*.65); eq(S.run.enemies.length,2); });
test('Bosses: Royal Decree hits for 45% of max HP, and Bone Ward soaks it',()=>{
  const b=bossFight(5); const P=S.player; P.hp=pMax(); fireAbility(b); eq(P.hp,pMax()-Math.round(pMax()*.45)); P.hp=pMax(); P.shield=1e5; fireAbility(b); eq(P.hp,pMax());
});
test('Bosses: a boss spends its turn charging instead of hitting',()=>{
  const b=bossFight(5); b.atk=1e6; b.abilT=1; fix(.5); const P=S.player; P.stats.constitution=500; P.hp=pMax(); act('strike'); ok(b.charging); eq(P.hp,pMax());
});

// =====================================================================================================
// HELL TOWER
test('Tower: opens at level 10, from floor 1 or a checkpoint',()=>{
  setLvl(9); startTower(1); eq(S.mode,'town'); setLvl(10); startTower(11); eq(S.mode,'town','no checkpoint yet');
  startTower(1); eq(S.mode,'battle'); eq(S.run.tw,1); eq(S.watches,WATCHES-1); eq(foeArmor(),TW.armor); eq(S.run.enemies.length,3);
});
test('Tower: checkpoints every ten floors, endlessly',()=>{ S.tower.best=35; eq(towerStarts().join(),'1,11,21,31'); S.tower.best=250; ok(towerStarts().includes(251)); eq(towerStarts().length,26); });
test('Tower: wardens every tenth floor, with more guards higher up',()=>{
  setLvl(60); S.tower.best=200; const r=S.run={tw:10,di:5,room:0,rooms:1,enemies:[],corpses:[],events:[],log:[],turn:1,fx:{},loot:[],spoils:[],lostLoot:[]}; S.mode='battle';
  spawnRoom(); ok(r.enemies[0].boss); eq(r.enemies[0].name,'The Gate Hound'); eq(r.enemies.length,3); eq(r.enemies[0].abil,'swarm');
  r.tw=50; spawnRoom(); eq(r.enemies.length,4); eq(r.enemies[0].abilT,BOSS_ABIL[r.enemies[0].abil].every-1,'faster from floor 50');
  r.tw=100; spawnRoom(); eq(r.enemies.length,5); eq(r.enemies[0].name,'Abaddon, King of Hell');
  r.tw=110; spawnRoom(); eq(r.enemies[0].name,'Abyssal Gate Hound');
  r.tw=55; spawnRoom(); ok(r.enemies.every(e=>!e.boss)); ok(r.enemies.filter(e=>e.role==='mender').length<=1);
});
test('Tower: foes get stronger every floor',()=>{ let p=towerStats(1,twLvl(1),1,1); for(let f=2;f<=150;f++){ const s=towerStats(f,twLvl(f),1,1); ok(s.hp>p.hp&&s.atk>=p.atk,'floor '+f); p=s; } ok(towerStats(100,56,1,1,true).hp>towerStats(99,56,1,1,true).hp*1.4,'last warden is a step up'); });
test('Tower: a warden gives its unique the first time, rarely after',()=>{
  setLvl(30); S.run={loot:[],spoils:[],events:[]}; towerBossLoot(10,S.run); ok(S.tower.got.w1); eq(S.inv.filter(x=>x.id==='w1').length,1); fix(.99); towerBossLoot(10,S.run); eq(S.inv.filter(x=>x.id==='w1').length,1);
  fix(0); towerBossLoot(10,S.run); eq(S.inv.filter(x=>x.id==='w1').length,2); towerBossLoot(100,S.run); ok(['w10','w11','w12'].every(id=>S.tower.got[id]));
});
test('Tower: abyssal wardens past 100 pay gold and a legendary',()=>{ S.run={loot:[],spoils:[],events:[],gold:0}; towerBossLoot(120,S.run); eq(S.run.gold,4800); eq(S.run.loot.length,1); eq(ITEM[S.run.loot[0]].tier,4); });
test('Tower: climbing records your best floor; floor 100 ends the climb; 101 starts from its checkpoint',()=>{
  setLvl(60); S.tower.best=90; startTower(91); const r=S.run; r.tw=100; r.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(S.tower.best,100); ok(r.cleared); descend(); eq(S.mode,'raise','no floor 101 from here');
  returnTown(); ok(towerStarts().includes(101)); S.watches=3; startTower(101); eq(S.run.tw,101); eq(S.mode,'battle');
});
test('Tower: going deeper climbs one floor',()=>{ setLvl(20); startTower(1); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(S.tower.best,1); descend(); eq(S.run.tw,2); eq(S.mode,'battle'); });
test('Tower: wardens grow angrier after turn 8',()=>{ arena([foe()]); S.run.turn=10; eq(enrage(foe({tw:10,boss:true})),1+2*.07); eq(enrage(foe({tw:100,boss:true})),1+2*.12); eq(enrage(foe({tw:10})),1); eq(enrage(foe({boss:true})),1); S.run.turn=5; eq(enrage(foe({tw:10,boss:true})),1); });
test('Tower: a strong necromancer beats floor 10 and takes its unique',()=>{
  setLvl(40); const P=S.player; P.stats.strength=2000; P.stats.constitution=2000; P.hp=pMax(); startTower(1); let n=0;
  while(n++<400&&S.tower.best<10){ if(S.mode==='battle') act('strike'); else if(S.mode==='raise') descend(); else break; }
  eq(S.tower.best,10); ok(S.tower.got.w1); ok(S.inv.some(x=>x.id==='w1')); checkTitles(); ok(S.ti.got.t10);
});

// =====================================================================================================
// UNIQUE ITEM EFFECTS
test('Uniques: Undying revives once at 30%, then you fall',()=>{
  wear('u2'); arena([foe({atk:1e7})]); fix(.5); const P=S.player; P.hp=1; act('strike'); eq(S.mode,'battle'); eq(S.run.revives,1); ok(P.hp>0);
  act('strike'); eq(S.mode,'defeat');
});
test('Uniques: Deathless revives twice at 50%',()=>{ wear('w12'); const r=arena([foe()]); S.player.hp=0; ok(!playerFalls()); eq(S.player.hp,Math.round(pMax()*.5)); ok(!playerFalls()); ok(playerFalls()); eq(S.mode,'defeat'); eq(r.revives,2); });
test('Uniques: Echo can strike twice',()=>{ wear('u1'); const t=foe({hp:1e7}); arena([t]); seq([.5,.9,.1,.5]); act('strike'); eq(1e7-t.hp,2*H(pAtk()*dmgMul())); });
test('Uniques: Execute adds 50% below 35% HP',()=>{ wear('w1'); const a=foe({hp:1e7}), b=foe({hp:3e6,maxHp:1e7}); arena([a,b]); fix(.5); act('strike'); const d=1e7-a.hp; setTarget(b.id); act('strike'); eq(3e6-b.hp,Math.round(d*1.5)); });
test('Uniques: Hellfire scorches every other foe, Cleave one other',()=>{
  wear('w11'); const a=foe({hp:1e7}), b=foe({hp:1e7}), c=foe({hp:1e7}); arena([a,b,c]); fix(.5); act('strike'); const d=1e7-a.hp; eq(1e7-b.hp,Math.round(d*.4)); eq(1e7-c.hp,Math.round(d*.4));
  S.equip.weapon=null; wear('w7'); const x=foe({hp:1e7}), y=foe({hp:1e7}); S.run.enemies=[x,y]; S.run.target=x.id; act('strike'); eq(1e7-y.hp,Math.round((1e7-x.hp)*.6));
});
test('Uniques: Ruin adds 25% to all damage',()=>{ arena([foe()],3); const m=dmgMul(); wear('w10'); near(dmgMul(),m*1.25,1e-9); });
test('Uniques: Lifedrain and Chorus empower Soul Siphon',()=>{
  wear('u3'); const a=foe({hp:1e7}), b=foe({hp:1e7}); arena([a,b]); fix(.5); const P=S.player; P.mana=50; P.hp=1; act('siphon'); const d=1e7-a.hp; eq(P.hp,1+Math.round(d*.8)-2);
  S.equip.weapon=null; wear('w5'); P.mana=50; const a2=a.hp, b2=b.hp; act('siphon'); eq(b2-b.hp,Math.round((a2-a.hp)*.5));
});
test('Uniques: Thorns hurt attackers, Halo heals each turn',()=>{
  wear('w2'); const t=foe({hp:1e6,atk:100}); arena([t]); S.player.hp=pMax(); fix(.5); act('strike'); eq(1e6-t.hp,H(pAtk()*dmgMul())+Math.round(100*.2*(1-DIFF.armor[0])));
  S.equip.armor=null; wear('w9'); S.player.hp=10; t.atk=1; act('strike'); eq(S.player.hp,10-1+Math.round(pMax()*.04));
});
test('Uniques: Soul Harvest and Censer restore on kills',()=>{
  wear('u4'); arena([foe({hp:1})]); fix(.5); S.player.mana=0; act('strike'); eq(S.player.mana,9);
  fresh(); wear('w3'); arena([foe({hp:1})]); fix(.5); S.player.mana=0; S.player.hp=10; act('strike'); eq(S.player.mana,13); eq(S.player.hp,10+Math.round(pMax()*.05));
});
test('Uniques: Infernal starts every fight with a ward',()=>{ wear('w8'); setLvl(5); startRun(0); eq(S.player.shield,Math.round(pMax()*.25)); });
test('Uniques: Cheap Dead halves raise cost, Bind Souls raises two levels higher',()=>{
  const c=corpse(); const full=raiseCost(c); wear('u5'); eq(raiseCost(c),Math.ceil(full/2)); S.equip.armor=null;
  wear('w6'); raiseScene([c],5); fix(0); S.player.mana=99; tryRaise(c.id); eq(S.army[0].lvl,3);
});
test('Uniques: holding one earns Touched by Legend',()=>{ give('u0'); checkTitles(); ok(S.ti.got.d_uq); });

// =====================================================================================================
// TITLES
test('Titles: earned once, worn automatically, with one notice',()=>{
  checkTitles(); eq(Object.keys(S.ti.got).length,0); S.ti.raised=1; checkTitles(); ok(S.ti.got.d_raise1); eq(S.ti.sel,'d_raise1'); eq(titleName(),'First Whisper');
  const n=S.notices.length; checkTitles(); eq(S.notices.length,n,'no second notice');
});
test('Titles: every condition can be checked on a new game without errors',()=>{ checkTitles(); TITLES.forEach(t=>{ const v=t.ok(); ok(v===true||v===false||v===undefined||typeof v==='number','title '+t.id+' returned '+v); }); });
test('Titles: deed counters add up',()=>{ tally('x'); tally('x',4); eq(S.ti.x,5); });
const earn=(...ids)=>{ checkTitles(); ids.forEach(id=>S.ti.got[id]=1); };
test('Titles: 100 titles, each with a small, readable bonus',()=>{
  eq(TITLES.length,100); eq(new Set(TITLES.map(t=>t.name)).size,100,'unique names');
  for(const t of TITLES){ const ks=Object.keys(t.b); ok(ks.length>=1&&ks.length<=2,t.id+' bonus count'); ks.forEach(k=>{ ok(TBUFF_L[k]||STATL[k],t.id+' unknown bonus '+k); ok(t.b[k]>0&&t.b[k]<=(TBUFF_L[k]?10:25),t.id+' '+k+' is not small'); ok(k!=='slot',t.id+' gives army slots'); }); ok(buffTxt(t.b)&&!BAD_TEXT.test(buffTxt(t.b)),t.id+' text'); }
  ['Gates','Hell Tower','Curses and events','Deeds'].forEach(g=>ok(TITLES.some(t=>t.grp===g),g));
});
test('Titles: a bonus only applies while that title is worn',()=>{
  const P=S.player, h=pMax(); earn('g2','g0'); S.ti.sel=null; eq(pMax(),h,'earned but not worn');
  ok(wearTitle('g2')); eq(S.ti.sel,'g2'); eq(pMax(),Math.round(h*1.03)); eq(P.hp,pMax(),'HP rises with it');
  ok(wearTitle('g0')); eq(pMax(),h+10,'switching swaps the bonus'); ok(wearTitle('g0')); eq(S.ti.sel,null); eq(pMax(),h); eq(P.hp,h,'HP drops back to the new max');
  ok(!wearTitle('t100'),'not earned'); arena([foe()]); ok(!wearTitle('g2'),'not in battle'); eq(S.ti.sel,null);
});
test('Titles: every kind of bonus does what it says',()=>{
  const P=S.player; earn('g3','t20','d_uq','d_study','t50','d_lv25','g4','t30','t10','t60','d_tower1','d_cancel','d_kill100');
  arena([foe()],2); const m=dmgMul(); wearTitle; S.mode='town'; wearTitle('g3'); S.mode='battle'; near(dmgMul(),m*1.03,1e-9,'damage');
  S.mode='town'; wearTitle('t20'); S.mode='battle'; P.hp=1000; S.player.stats.constitution=500; P.hp=pMax(); const hp=P.hp; hurtAlly(P,100); eq(hp-P.hp,98,'damage taken -2%');
  const e=foe({lvl:6}); S.mode='town'; wearTitle('d_study'); const x=killXp(e); wearTitle('d_study'); eq(x,Math.round(killXp(e)*1.03),'XP');
  fix(.5); wearTitle('d_uq'); const r={}; killLoot(foe({lvl:20}),r); wearTitle('d_uq'); const r2={}; killLoot(foe({lvl:20}),r2); eq(r.gold,Math.round(r2.gold*1.05),'gold');
  const mana=pMana(); wearTitle('t50'); eq(pMana(),Math.round(mana*1.05),'mana %');
  wearTitle('d_lv25'); eq(A('intelligence'),S.player.stats.intelligence+2); eq(A('will'),S.player.stats.will+1);
  const mn=mkMinion({lvl:20,rankI:4}), a=mn.maxHp; wearTitle('g4'); syncMinion(mn); ok(mn.maxHp>a,'minion power reaches the army');
  wearTitle('t10'); eq(G('crit'),2); wearTitle('t60'); eq(G('raise'),4); wearTitle('d_tower1'); eq(G('ward'),3); wearTitle('d_cancel'); eq(G('siph'),3); wearTitle('d_kill100'); eq(G('atk'),2);
  wearTitle('t30'); eq(G('regen'),1);
});
test('Titles: a new title is worn automatically only when you wear none',()=>{
  S.ti={raised:1}; checkTitles(); eq(S.ti.sel,'d_raise1'); S.ti.raised=50; checkTitles(); ok(S.ti.got.d_raise50); eq(S.ti.sel,'d_raise1','your choice is kept');
  ok(S.notices.some(n=>/Worn, it gives/.test(n.m)));
});
test('Titles: an automatically worn title updates HP, mana and the army at once (bug found by the fuzzer)',()=>{
  const m=mkMinion({lvl:20,rankI:4}); const mh=m.maxHp; S.ti={evolved:1}; checkTitles(); eq(S.ti.sel,'d_evolve');
  const c=JSON.parse(JSON.stringify(m)); syncMinion(c); eq(m.maxHp,c.maxHp,'army refreshed'); ok(m.maxHp>mh);
  fresh(); const P=S.player, h=pMax(); S.ti={deaths:1}; checkTitles(); eq(S.ti.sel,'d_death'); eq(pMax(),h+15); eq(P.hp,pMax(),'HP rose with the title');
  S.ti.got={}; S.ti.deaths=0; checkTitles(); eq(S.ti.sel,null); eq(P.hp,h,'losing a title never leaves HP above max');
});
test('Titles: a worn title that is somehow unknown gives nothing and is cleared',()=>{ S.ti={got:{zz:1},sel:'zz'}; eq(titleB('hpp'),0); S.ti={got:{},sel:'g2'}; S.player.hp=pMax(); checkTitles(); eq(S.ti.sel,null); ok(S.player.hp<=pMax()); });
test('Titles: the worn title survives saving and loading',()=>{ earn('g2'); wearTitle('g2'); const h=pMax(); save(); S=null; loadGame(); eq(S.ti.sel,'g2'); eq(pMax(),h); });
test('Titles: new deeds are counted as you play',()=>{
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); S.ti={clr:{0:1}}; S.mod={day:1,gi:0,id:'horde'}; fix(.05); startRun(0); let n=0;
  while(n++<300&&!(S.mode==='raise'&&S.run.cleared)){ if(S.mode==='battle') act('strike'); else descend(); }
  eq(S.ti.clrN0,1); eq(S.ti.cur_horde,1); eq(S.ti.cursed,1); ok(S.ti.crits>=4,'crits counted'); ok(S.ti.bosses>=1); returnTown();
  S.watches=3; startRun(0); S.run.enemies=[foe({hp:1,boss:true,elite:false}),foe({hp:1e6,atk:5})]; S.run.target=S.run.enemies[0].id; act('strike'); ok(S.run.hurt,'hurt this run');
  fresh(); P.hp; setLvl(20); startTower(1); eq(S.ti.twRuns,1); flee();
  eventScene('shrine'); resolveEvent('bleed'); eq(S.ti.shrine,1); eventScene('pedlar'); S.gold=99; resolveEvent('buy'); eq(S.ti.pedlar,1);
  eventScene('coffer'); fix(.99); resolveEvent('open'); eq(S.ti.coffer,1); eq(S.ti.trap,1); eventScene('straggler',3); fix(.5); resolveEvent('raise'); fix(0); tryRaise(S.run.corpses[S.run.corpses.length-1].id); eq(S.ti.straggler,1);
  const b=corpse({boss:true,name:'The Rat King',base:'The Rat King',role:'reaper'}); raiseScene([b],10); S.player.mana=99; fix(0); tryRaise(b.id); eq(S.ti.raisedBoss,1);
  arena([foe({hp:1e6})]); fix(.5); S.belt={hp:2,mp:2}; addDot(S.player,'bleed',3,3); act('pot:hp'); S.player.mana=0; act('pot:mp'); eq(S.ti.drank,2); eq(S.ti.cures,1);
  S.player.skills={spear:1,chill:1}; S.player.mana=200; S.run.cd={}; act('sk:spear'); act('sk:chill'); eq(S.ti.sk_spear,1); eq(S.ti.frozen,1);
  const v=mkMinion({traits:['venom']}); v.atk=50; act('strike'); ok(S.ti.poisoned>=1);
  flee(); const it=give('1-wa'); sellItem(it.u); eq(S.ti.soldItems,1);
});
test('Titles: flawless clears and last-breath wins are recognised',()=>{
  const P=S.player; P.stats.strength=400; P.hp=pMax(); startRun(0); S.run.room=3; S.run.enemies=[foe({hp:1})]; S.run.target=S.run.enemies[0].id; fix(.5); act('strike'); ok(S.run.cleared); eq(S.ti.flawless,1);
  fresh(); arena([foe({hp:1})]); S.player.hp=3; fix(.5); act('strike'); eq(S.ti.lastBreath,1); fresh(); arena([foe({hp:1})]); act('strike'); eq((S.ti||{}).lastBreath,undefined);
});
test('Titles: the Titles page shows every bonus and what you wear',()=>{ earn('g2'); wearTitle('g2'); ui.tab='titles'; const h=renderAll('titles'); ok(/When worn: \+3% Max HP/.test(h)); ok(/Wearing <b>Ashwalker<\/b>/.test(h)); ok(/Curses and events/.test(h)); });
test('Titles: the big deeds unlock',()=>{
  const s=richState(); S.ti.got={}; S.ti.sel=null; S.player.lvl=50; S.ti.raised=200; S.ti.deaths=10; S.ti.claims=7; S.ti.cancels=10; S.ti.master=1; S.ti.soldTro=500; S.ti.emp=25; S.ti.evolved=1; S.ti.elder=1; S.ti.armed=1; S.tower.best=150; S.ngp=3;
  allNames().forEach(n=>S.kills[n]=2000);
  S.player.lvl=75; S.ti.raised=500; S.tower.best=200; S.day=100; for(let i=0;i<6;i++) S.ti['clrN'+i]=25; Object.keys(MODS).forEach(m=>S.ti['cur_'+m]=1);
  Object.assign(S.ti,{twRuns:50,cursed:25,shrine:10,pedlar:10,coffer:15,trap:5,straggler:10,poisoned:200,cures:25,drank:100,sk_spear:100,sk_blast:50,frozen:50,sk_reap:100,crits:1000,flawless:1,lastBreath:1,bosses:25,elites:100,reforged:25,soldItems:100,raisedBoss:1});
  S.ti.fullGear=true; Object.assign(S.life,{gold:50000,items:200,runs:100,rooms:1000}); const L=give('4-wa'); L.ro=[['will',1],['hp',9],['crit',2]];
  S.army=[]; TRAIT_IDS.forEach((t,i)=>mkMinion({traits:[t],stage:i<3?2:0,lvl:20})); while(S.army.length<slots()) mkMinion({});
  checkTitles(); const miss=TITLES.filter(t=>!S.ti.got[t.id]).map(t=>t.id); eq(miss.join(),'','titles not earned');
});

// =====================================================================================================
// TIPS
test('Tips: shown one at a time, the first time they apply',()=>{
  eq(currentTip().id,'stats'); dismissTip('stats'); eq(currentTip(),null); S.player.sp=1; eq(currentTip().id,'skill');
  S.tips.off=1; eq(currentTip(),null); delete S.tips.off; dismissTip('skill'); arena([foe()]); eq(currentTip().id,'battle');
});
test('Tips: no tip throws in any screen',()=>{
  const all=()=>TIPS.forEach(t=>{ t.when(); });
  all(); arena([foe()],3); all(); S.mode='raise'; all(); S.mode='defeat'; all(); S.run=null; S.mode='town'; S.player.lvl=12; all();
});

// =====================================================================================================
// SAVES
test('Saves: save and load bring back the same game',()=>{
  const s=richState(); S.mode='town'; save(); const before=canon(JSON.parse(localStorage.getItem(SAVE_KEY))); S=null; loadGame();
  const d=firstDiff(JSON.parse(before),JSON.parse(canon(S))); eq(d,null,'differs at');
});
test('Saves: closing the tab mid-run counts as walking out (watch spent, run gone)',()=>{
  startRun(0); eq(S.watches,2); S.player.hp=1; const snap=snapshot(); eq(snap.mode,'town'); eq(snap.run,null); eq(snap.player.hp,pMax()); eq(S.mode,'battle','the live game is untouched');
  save(); S=null; loadGame(); eq(S.mode,'town'); eq(S.watches,2); eq(S.player.hp,pMax());
});
test('Saves: loading after the last watch ends the day',()=>{ S.watches=0; save(); S=null; loadGame(); eq(S.day,2); eq(S.watches,WATCHES); });
test('Saves: old v1 saves migrate stat names and get skill points',()=>{
  const g=normalizeSave({v:1,player:{lvl:5,stats:{might:9,vigor:7,intellect:6,will:5}}}); eq(g.v,2); eq(g.player.stats.strength,9); eq(g.player.stats.constitution,7); eq(g.player.stats.intelligence,6); eq(g.player.sp,4); eq(g.player.stats.might,undefined);
  eq(normalizeSave({v:2,player:{lvl:5,sp:1}}).player.sp,1,'existing points kept');
});
test('Saves: junk is rejected',()=>{ [null,undefined,'x',5,[],{},{player:{}},{v:2,player:{lvl:0}},{v:3,player:{lvl:2}},{v:2,player:{lvl:'9'}}].forEach((x,i)=>eq(normalizeSave(x),null,'case '+i)); });
test('Saves: damaged saves are repaired',()=>{
  const g=normalizeSave({v:2,uid:3,gold:NaN,player:{lvl:3.7,xp:'a',stats:{strength:'x'},skills:{spear:1,fly:2}},
    inv:[{u:50,id:'0-wa'},{u:51,id:'nope'},null],equip:{weapon:{u:9,id:'bad'}},army:[{role:'striker',lvl:2,rankI:0,name:'Imp',traits:['vicious','fake'],stage:9},{role:'wizard',lvl:1,rankI:0}],
    trophies:{'Tunnel Rat':2.6,'Fake':3,'Imp':-1},belt:{hp:99,mp:-1},bagLv:99,salts:-4,shop:{day:1,stock:[{id:'nope'}]},quest:'x'});
  eq(g.player.lvl,3); eq(g.player.xp,0); eq(g.player.stats.strength,4); eq(Object.keys(g.player.skills).join(),'spear'); eq(g.gold,0);
  eq(g.inv.length,1); eq(g.equip.weapon,null); eq(g.army.length,1); eq(g.army[0].traits.join(),'vicious'); eq(g.army[0].stage,2); eq(g.army[0].uid,51); eq(g.uid,51);
  eq(canon(g.trophies),canon({'Tunnel Rat':2})); eq(g.belt.hp,BELT_MAX); eq(g.belt.mp,0); eq(g.bagLv,BAG_COST.length); eq(g.salts,0); eq(g.shop,null); eq(g.quest.kills,0); eq(g.mode,'town');
  ok(adoptSave(g),'the repaired save loads'); invariants('repaired save');
});
test('Saves: an unreadable save is kept aside and a new game starts',()=>{
  localStorage.setItem(SAVE_KEY,'{not json'); S.day=9; loadGame(); eq(S.day,1); eq(localStorage.getItem(SAVE_KEY+'-broken'),'{not json'); ok(S.notices.some(n=>n.c==='bad'));
});
test('Saves: a bad load never replaces the current game',()=>{
  S.day=7; const cur=S; ok(!adoptSave({v:2,player:{lvl:1e308}}),'impossible numbers'); ok(S===cur); ok(!adoptSave('junk')); ok(!importCode('LOTD1:@@@')); ok(!importCode('hello')); ok(!importCode('')); ok(S===cur); eq(S.day,7);
});
test('Saves: three save slots write, read, load and delete',()=>{
  S.gold=321; ok(slotWrite(1)); ok(slotRead(1)); eq(slotRead(1).data.gold,321); eq(slotRead(2),null);
  S.gold=0; ok(slotLoad(1)); eq(S.gold,321); slotDelete(1); eq(slotRead(1),null); ok(!slotLoad(1));
  arena([foe()]); ok(!slotWrite(2),'no slot saves mid-run'); localStorage.setItem(slotKey(3),'{"data":{"bad":1}}'); eq(slotRead(3),null);
});
test('Saves: save codes round-trip, even with non-English text',()=>{
  S.gold=4321; mkMinion({nick:'Çağrı Ğü 墓'}); const code=exportCode(); ok(code.startsWith(CODE_TAG)); S.gold=0; S.army=[];
  ok(importCode(' '+code.slice(0,20)+'\n'+code.slice(20)+' '),'whitespace is ignored'); eq(S.gold,4321); eq(S.army[0].nick,'Çağrı Ğü 墓');
});
test('Saves: a full browser storage does not crash the game',()=>{
  if(!NODE) return; const orig=localStorage.setItem; localStorage.setItem=()=>{ throw new Error('QuotaExceeded'); };
  try{ save(); eq(slotWrite(1),false); eq(storageOk(),false); }finally{ localStorage.setItem=orig; } ok(storageOk());
});
test('Saves: item and minion ids stay unique after loading',()=>{
  const g=normalizeSave({v:2,uid:1,player:{lvl:2},inv:[{u:5,id:'0-wa'}],army:[{role:'striker',lvl:2,rankI:0,name:'Imp',uid:9}]}); adoptSave(g); eq(S.uid,9); const it=addItem('0-ta'); eq(it.u,10);
});

// =====================================================================================================
// NEW GAME+
test('NG+: locked until the Throne of Ash is cleared',()=>{ ok(!canNGP()); ok(!startNGP()); S.ti={clr:{5:1}}; ok(canNGP()); arena([foe()]); ok(!startNGP(),'town only'); });
test('NG+: restarts at level 1, keeps titles, bestiary, tips and one unique',()=>{
  setLvl(40); S.ti={clr:{0:1,5:1},got:{g0:3},raised:9}; S.kills={'Tunnel Rat':30}; S.tips={stats:1}; give('u3'); give('u1'); S.gold=5000; mkMinion({});
  ok(startNGP('u3')); eq(S.ngp,1); eq(S.player.lvl,1); eq(S.gold,0); eq(S.army.length,0); eq(S.kills['Tunnel Rat'],30); eq(S.ti.got.g0,3); eq(S.tips.stats,1);
  eq(S.inv.map(x=>x.id).join(),'u3'); eq(Object.keys(S.ti.clr).length,0); ok(!canNGP()); ok(S.notices.some(n=>/New Game\+ 1/.test(n.m)));
});
test('NG+: a unique you do not own cannot be carried; NG+ stacks',()=>{ S.ti={clr:{5:1}}; S.ngp=1; ok(startNGP('w12')); eq(S.inv.length,0); eq(S.ngp,2); near(ngpFoe(),1.6,1e-9); near(ngpReward(),1.5,1e-9); });
test('NG+: foes in NG+ rooms really are tougher',()=>{ seed(4); startRun(0); const a=S.run.enemies[0].maxHp; fresh(); S.ngp=1; seed(4); startRun(0); eq(S.run.enemies[0].maxHp,Math.round(a*1.3)); });

// =====================================================================================================
// UI
test('UI: every town tab renders without blank values',()=>{ for(const t of TABS){ ui.tab=t; renderAll('fresh game, '+t+' tab'); } richState(); for(const t of TABS){ ui.tab=t; renderAll('late game, '+t+' tab'); } });
test('UI: every bestiary entry opens without blank values',()=>{ richState(); ui.tab='bes'; allNames().forEach(n=>{ ui.bes=n; renderAll('bestiary: '+n); }); fresh(); ui.tab='bes'; ui.bes='Tunnel Rat'; renderAll('unstudied bestiary'); });
test('UI: battle, raise and defeat screens render in gates and the Tower',()=>{
  richState(); startRun(5); renderAll('gate battle'); const b=makeEnemy(5,30,true); b.charging=true; b.shield=50; b.stun=1; b.curse={mul:1.5,t:2}; S.run.enemies.push(b); S.run.frenzy=2; S.run.frenzyMul=1.4; S.run.silence=2; S.run.cd={spear:2}; renderAll('busy gate battle');
  S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); eq(S.mode,'raise'); renderAll('raise screen'); fix(0); S.player.mana=999; S.army=[]; S.run.corpses.slice(0,2).forEach(c=>tryRaise(c.id)); renderAll('raise screen after raising');
  S.mode='defeat'; renderAll('defeat screen'); returnTown();
  S.watches=3; startTower(91); renderAll('tower battle'); ok(document.body.classList.contains('hell'),'hell backdrop in the Tower');
  flee(); ui.tab='gates'; renderAll('back in town'); ok(!document.body.classList.contains('hell')); ui.tab='tower'; renderAll('tower tab'); ok(document.body.classList.contains('hell'));
});
test('UI: every button on every screen has a handler',()=>{
  const seen=new Set(); const grab=h=>{ for(const m of h.matchAll(/data-a="([^"]+)"/g)) seen.add(m[1]); };
  richState(); TABS.forEach(t=>{ ui.tab=t; grab(renderAll(t)); }); ui.tab='market'; ui.confirm='new'; grab(renderAll()); ui.exp=exportCode(); ui.tab='settings'; grab(renderAll());
  startRun(5); grab(renderAll()); S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); grab(renderAll()); S.mode='defeat'; grab(renderAll());
  const miss=[...seen].filter(a=>!ACTIONS[a]); eq(miss.join(),'','buttons without a handler'); ok(seen.size>25,'found '+seen.size+' kinds of buttons');
});
test('UI: settings open only in town',()=>{ ACTIONS.settings(); eq(ui.tab,'settings'); ACTIONS.settings(); eq(ui.tab,'gates'); arena([foe()]); ACTIONS.settings(); eq(ui.tab,'gates'); ok(/gearbtn[^>]*disabled/.test(renderAll())); });
test('UI: risky buttons ask twice',()=>{
  S.day=5; ACTIONS.newgame(); eq(S.day,5); ACTIONS.newgame(); eq(S.day,1);
  const a=give('0-wa'); ACTIONS.discard(String(a.u)); eq(S.inv.length,1); ACTIONS.discard(String(a.u)); eq(S.inv.length,0);
  const b=give('1-wa'); ACTIONS.sellitem(String(b.u)); eq(S.gold,0); ACTIONS.sellitem(String(b.u)); eq(S.gold,20);
  const m=mkMinion({}); ACTIONS.release(String(m.uid)); eq(S.army.length,1); ACTIONS.release(String(m.uid)); eq(S.army.length,0);
  S.player.skills={}; setLvl(5); S.player.sp=1; ACTIONS.learn('spear'); eq(sk('spear'),1); ACTIONS.skreset(); eq(sk('spear'),1); ACTIONS.skreset(); eq(sk('spear'),0);
});
test('UI: save slot and save code buttons work end to end',()=>{
  S.gold=77; ACTIONS.slotsave('2'); ok(slotRead(2)); eq(ui.msg.c,'ok'); S.gold=1; ACTIONS.slotsave('2'); eq(slotRead(2).data.gold,77,'overwrite asks first'); ACTIONS.slotsave('2'); eq(slotRead(2).data.gold,1);
  S.gold=50; ACTIONS.slotload('2'); eq(S.gold,50); ACTIONS.slotload('2'); eq(S.gold,1); ACTIONS.slotdel('2'); ACTIONS.slotdel('2'); eq(slotRead(2),null);
  S.gold=999; ACTIONS.mkcode(); ok(ui.exp.startsWith(CODE_TAG)); S.gold=0; ui.imp=ui.exp; ACTIONS.loadcode(); ACTIONS.loadcode(); eq(S.gold,999); eq(ui.msg.c,'ok');
  ui.imp='nonsense'; ACTIONS.loadcode(); ACTIONS.loadcode(); eq(ui.msg.c,'bad'); eq(S.gold,999);
});
test('UI: market buttons report what happened',()=>{
  S.gold=1e5; S.trophies={'Tunnel Rat':10}; const m=mkMinion({}); setLvl(5);
  ACTIONS.buypot('hp'); ok(/Healing/.test(ui.msg.m)); ACTIONS.buyitem('0'); ok(/Bought/.test(ui.msg.m)); ACTIONS.selltro('Tunnel Rat'); ok(/Sold/.test(ui.msg.m)); ACTIONS.selltroall('Tunnel Rat'); ok(/Sold 9/.test(ui.msg.m));
  ACTIONS.buysalt(); ok(/Salts/.test(ui.msg.m)); ACTIONS.buybag(); ok(/35/.test(ui.msg.m)); ACTIONS.empower(String(m.uid)); ok(/level 2/.test(ui.msg.m));
  S.trophies={'Tunnel Rat':10}; ACTIONS.forge('0|armor'); ok(/forge/.test(ui.msg.m)); ACTIONS.brew('mp'); ok(/brew/.test(ui.msg.m)); S.trophies={}; ACTIONS.sellalltro(); eq(ui.msg,null);
  ui.tab='market'; renderAll('market after shopping');
});
test('UI: tips, titles and sound switches',()=>{
  ACTIONS.tip('stats'); ok(S.tips.stats); ACTIONS.tipsoff(); ok(S.tips.off); ACTIONS.tipson(); ok(!S.tips.off); ACTIONS.tipsreset(); eq(Object.keys(S.tips).length,0);
  S.ti={got:{g0:1},sel:null}; ACTIONS.wear('g0'); eq(S.ti.sel,'g0'); ACTIONS.wear('g0'); eq(S.ti.sel,null);
  const was=SFX.on; ACTIONS.sound(); eq(SFX.on,!was); eq(localStorage.getItem('lotd-sound'),SFX.on?'on':'off'); ACTIONS.sound(); eq(SFX.on,was);
});
test('UI: a whole run can be played through the buttons alone',()=>{
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); fix(.5); ACTIONS.enter('0'); eq(S.mode,'battle'); let n=0;
  while(n++<200&&!(S.mode==='raise'&&S.run.cleared)){ if(S.mode==='battle') ACTIONS.act('strike'); else ACTIONS.descend(); render(); }
  ok(S.run.cleared); fix(0); P.mana=999; S.run.corpses.forEach(c=>ACTIONS.raise(c.id)); ok(S.army.length>0); ACTIONS.town(); eq(S.mode,'town'); renderAll('after a full run');
});
test('UI: clicks and number keys reach the game',()=>{
  if(!NODE) return; const click=(a,k,dis)=>window.__listeners.click[0]({target:{closest:()=>({dataset:{a,k},disabled:!!dis})}});
  click('tab','market'); eq(ui.tab,'market'); ok(/Market/i.test(app.innerHTML)); click('tab','gear',true); eq(ui.tab,'market','disabled buttons do nothing');
  ui.confirm='new'; click('tab','gates'); eq(ui.confirm,null,'another click cancels a pending confirm');
  arena([foe({hp:1e6})]); fix(.5); window.__listeners.keydown[0]({key:'1',preventDefault(){}}); eq(S.run.turn,2); S.player.skills.spear=1; S.player.mana=99; window.__listeners.keydown[0]({key:'4',preventDefault(){}}); ok(skCd('spear')>0,'key 4 = first skill');
});

// =====================================================================================================
// SOUND
test('Sound: effects never throw, even without Web Audio, and stay quiet when off',()=>{
  if(!NODE) return; const was=SFX.on; SFX.on=true; try{ ['strike','skill','hurt','heal','kill','raise','fail','coin','level','warn','boss','death','nope'].forEach(k=>sfx(k)); }finally{ SFX.on=was; }
  let made=0; window.AudioContext=function(){ made++; throw new Error('no audio'); }; SFX.on=false; sfx('coin'); eq(made,0); SFX.on=true; SFX.last={}; sfx('coin'); eq(made,1); SFX.on=was; delete window.AudioContext; SFX.ctx=null;
});

// =====================================================================================================
// PLAYTHROUGH
// =====================================================================================================
// GEAR ROLLS
test('Rolls: rarer tiers roll more bonus lines, uniques never roll',()=>{
  seed(21); const lines=t=>{ let max=0, sum=0; const id=Object.values(ITEM).find(d=>!d.uq&&d.tier===t).id; for(let i=0;i<2000;i++){ const r=rollItem(id); const n=r?r.length:0; max=Math.max(max,n); sum+=n; } return {max,avg:sum/2000}; };
  const c=lines(0), u=lines(1), r=lines(2), e=lines(3), l=lines(4);
  eq(c.max,1); eq(r.max,2); eq(l.max,3); ok(c.avg<u.avg&&u.avg<r.avg&&r.avg<e.avg&&e.avg<l.avg,'average lines rise with tier');
  eq(rollItem('u0'),null); eq(rollItem('w12'),null); eq(rollItem('nope'),null);
});
test('Rolls: lines use real stats, never repeat a stat, and grow with the gate set',()=>{
  seed(5); let lo=0, hi=0;
  for(let i=0;i<500;i++){ const r=rollItem('4-wa',true); ok(r.length>=1); eq(new Set(r.map(x=>x[0])).size,r.length); r.forEach(x=>{ ok(ROLL_KEYS[x[0]]&&STATL[x[0]],x[0]); ok(x[1]>=1&&Number.isInteger(x[1])); }); }
  for(let i=0;i<500;i++){ (rollItem('0-wa',true)||[]).forEach(x=>lo+=x[1]/ROLL_KEYS[x[0]]); (rollItem('5-wa',true)||[]).forEach(x=>hi+=x[1]/ROLL_KEYS[x[0]]); } ok(hi>lo*5,'set 5 rolls far higher than set 0');
});
test('Rolls: bonus lines count for you and for gear-bearers',()=>{
  const it={u:++S.uid,id:'0-wa',ro:[['strength',5],['hp',40]]}; S.equip.weapon=it; eq(A('strength'),9); eq(G('hp'),40); eq(itStat(it,'atk'),ITEM['0-wa'].stats.atk);
  const plain=gearBonus({eq:{weapon:{id:'0-wa'}}}), rolled=gearBonus({eq:{weapon:it}}); eq(rolled.atk,plain.atk+10); eq(rolled.hp,plain.hp+40);
});
test('Rolls: found and forged gear rolls; each line adds a quarter to the sell price',()=>{
  fix(0); const it=addItem('2-wa'); ok(it.ro&&it.ro.length===2,'rolled 2 lines'); eq(sellValue(it),Math.round(sellPrice(ITEM['2-wa'])*1.5)); eq(sellItem(it.u),Math.round(50*1.5));
  const plain=addItem('2-wa',null); eq(plain.ro,undefined); eq(sellValue(plain),50);
});
test('Rolls: the merchant shows the rolls you will get',()=>{
  seed(8); setLvl(30); const st=shopStock(); const s=st.find(x=>x.ro)||st[0]; s.ro=s.ro||[['will',3]]; S.gold=1e6; ok(buyStock(st.indexOf(s))); eq(canon(S.inv[S.inv.length-1].ro),canon(s.ro));
});
test('Rolls: reforging re-rolls for gold, always leaves a line, only in town and never on uniques',()=>{
  const it=give('3-ab'); S.gold=1000; const c=reforgeCost(it); eq(c,Math.round(480*REFORGE_COST)); ok(reforge(it.u)); eq(S.gold,1000-c); ok(it.ro&&it.ro.length>=1); eq(S.ti.reforged,1);
  S.gold=0; ok(!reforge(it.u),'too poor'); S.gold=1e4; const u=give('u0'); ok(!reforge(u.u)); ok(!reforge(999));
  const w={u:++S.uid,id:'3-aa'}; S.equip.armor=w; S.player.hp=pMax(); seq([.1,.1,.1,.1,0,.5,.1,0],.5); ok(reforge(w.u),'equipped gear can be reforged'); ok(S.player.hp<=pMax());
  arena([foe()]); ok(!reforge(it.u),'not in battle');
});
test('Rolls: damaged rolls in a save are cleaned up',()=>{
  const g=normalizeSave({v:2,player:{lvl:3},inv:[{u:1,id:'0-wa',ro:[['atk',3],['fly',9],['hp',-2],['hp','x'],['crit',2.6],['will',1],['mana',4]]},{u:2,id:'u0',ro:[['atk',5]]},{u:3,id:'0-ta',ro:'junk'}],
    shop:{day:1,g:0,stock:[{id:'0-wa',ro:[['bogus',1]]}]}});
  eq(canon(g.inv[0].ro),canon([['atk',3],['crit',3],['will',1]])); eq(g.inv[1].ro,undefined,'uniques never keep rolls'); eq(g.inv[2].ro,undefined); eq(g.shop.stock[0].ro,undefined);
});
test('Rolls: the bag compares each piece with what you wear',()=>{
  S.equip.weapon={u:++S.uid,id:'0-wa'}; const b=give('1-wa'); b.ro=[['will',2]]; const h=cmpHTML(b); ok(/class="up"/.test(h)&&/Will/.test(h)); ok(!/class="down"/.test(h));
  const c=give('0-wb'); ok(/class="down"/.test(cmpHTML(c)),'losing Strike shows in red'); eq(cmpHTML(S.equip.weapon),''); ok(/empty/.test(cmpHTML(give('0-aa'))));
});

// =====================================================================================================
// EVENTS
function eventScene(id,lvl){ arena([foe({hp:0,dead:true})],0); if(lvl) setLvl(lvl); fix(.99); roomWon(); S.run.event=Object.assign(rollEvent(),{id}); if(id==='pedlar'){ S.run.event.pot='hp'; S.run.event.price=Math.ceil(POTIONS.hp.price()/2); } return S.run; }
test('Events: rolled after some gate rooms, never after the last room or in the Tower',()=>{
  arena([foe({hp:0,dead:true})]); fix(0); roomWon(); ok(S.run.event,'event after room 1'); ok(EVENTS[S.run.event.id]);
  descend(); eq(S.run.event,null,'gone when you move on'); S.run.room=3; S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(S.run.event,null,'not after the boss');
  fresh(); setLvl(20); startTower(1); S.run.enemies=[foe({hp:0,dead:true})]; fix(0); roomWon(); eq(S.run.event,null,'not in the Tower');
  fresh(); seed(31); let n=0; for(let i=0;i<1000;i++){ S.mode='town'; S.run=null; S.watches=3; startRun(0); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); if(S.run.event) n++; } near(n/1000,EVENT_CHANCE,.04);
});
test('Events: the blood shrine trades 20% max HP for 15% more damage this gate',()=>{
  const r=eventScene('shrine'); const P=S.player; P.hp=pMax(); const m=dmgMul(); ok(resolveEvent('bleed')); eq(P.hp,pMax()-Math.round(pMax()*.2)); ok(r.bless); near(dmgMul(),m*1.15,1e-9); ok(r.event.done);
  ok(!resolveEvent('bleed'),'only once'); descend(); near(dmgMul(),m*1.15,1e-9,'lasts all gate'); flee(); eq(foeArmor(),0);
  eventScene('shrine'); S.player.hp=1; ok(!resolveEvent('bleed'),'no blood to spare'); ok(!S.run.bless);
});
test('Events: the pedlar sells a potion at half price',()=>{
  eventScene('pedlar'); const ev=S.run.event; S.gold=0; ok(!resolveEvent('buy'),'too poor'); S.gold=100; ok(resolveEvent('buy')); eq(S.belt.hp,1); eq(S.gold,100-ev.price); eq(ev.price,Math.ceil(POTIONS.hp.price()/2));
  eventScene('pedlar'); S.belt.hp=BELT_MAX; S.gold=100; ok(!resolveEvent('buy'),'belt full'); ok(resolveEvent('pass')); eq(S.gold,100);
});
test('Events: a coffer holds gold and gear, or a trap that never kills',()=>{
  eventScene('coffer'); fix(0); const g=S.gold; ok(resolveEvent('open')); ok(S.gold>g); eq(S.run.spoils.length,1); ok(/Inside/.test(S.run.event.done));
  eventScene('coffer'); fix(.99); S.player.hp=pMax(); ok(resolveEvent('open')); eq(S.player.hp,pMax()-Math.round(pMax()*.25));
  eventScene('coffer'); fix(.99); S.player.hp=3; resolveEvent('open'); eq(S.player.hp,1,'the trap leaves you at 1 HP at worst');
});
test('Events: a straggler can be raised for free or finished for XP',()=>{
  eventScene('straggler',3); const n=S.run.corpses.length; fix(.5); ok(resolveEvent('raise')); const c=S.run.corpses[n]; ok(c&&c.free); eq(raiseCost(c),0); eq(raiseChance(c),raiseChance(Object.assign({},c,{free:false}))+STRAGGLER_BONUS);
  S.player.mana=0; fix(0); tryRaise(c.id); eq(S.army.length,1,'raised with no mana');
  eventScene('straggler',3); const xp=S.player.xp, lv=S.player.lvl; ok(resolveEvent('finish')); ok(S.player.xp>xp||S.player.lvl>lv); ok(/XP/.test(S.run.event.done));
});
test('Events: only on the raise screen, and unknown choices do nothing',()=>{ const r=eventScene('coffer'); ok(!resolveEvent('dance')); ok(!r.event.done); S.mode='battle'; ok(!resolveEvent('open')); S.mode='raise'; r.event=null; ok(!resolveEvent('pass')); });

// =====================================================================================================
// CURSED GATES
test('Curses: none until you clear a gate; then one cleared gate is cursed all day',()=>{
  eq(dayMod().gi,-1); eq(gateMod(0),null); S.ti={clr:{0:1}}; eq(dayMod().gi,-1,'already decided for today'); endDay(); const m=dayMod(); eq(m.gi,0); ok(MODS[m.id]); eq(gateMod(0),m.id);
  const again=dayMod(); ok(again===m,'same all day'); setLvl(30); S.ti.clr={0:1,1:1,5:1}; seed(3); const seen=new Set(); for(let d=0;d<60;d++){ S.day++; seen.add(dayMod().gi); } ok([...seen].every(g=>[0,1,5].includes(g))); eq(seen.size,3);
});
test('Curses: never on a gate you are too low for',()=>{ S.ti={clr:{0:1,3:1}}; setLvl(5); for(let d=0;d<40;d++){ S.day++; ok(dayMod().gi!==3); } });
function cursedRun(id,di){ di=di||0; setLvl(Math.max(RK[di].unlock,5)); S.ti={clr:{[di]:1}}; S.mod={day:S.day,gi:di,id}; S.watches=3; startRun(di); eq(S.run.mod,id); return S.run; }
test('Curses: Horde adds a foe to every room, Bulwark adds 30% HP, Fury 25% attack',()=>{
  cursedRun('horde'); eq(S.run.enemies.length,3); S.run.room=3; spawnRoom(); eq(S.run.enemies.length,4);
  fresh(); seed(4); startRun(0); const base=S.run.enemies.map(e=>[e.maxHp,e.atk]);
  fresh(); seed(4); S.ti={clr:{0:1}}; S.mod={day:1,gi:0,id:'bulwark'}; startRun(0); S.run.enemies.forEach((e,i)=>{ eq(e.maxHp,Math.round(base[i][0]*1.3)); eq(e.atk,base[i][1]); });
  fresh(); seed(4); S.ti={clr:{0:1}}; S.mod={day:1,gi:0,id:'fury'}; startRun(0); S.run.enemies.forEach((e,i)=>{ eq(e.maxHp,base[i][0]); ok(e.atk>=Math.round(base[i][1]*1.25)-1); });
});
test('Curses: Drought stops mana coming back at the end of a turn',()=>{ cursedRun('drought'); const t=foe({hp:1e6}); S.run.enemies=[t]; S.run.target=t.id; S.player.mana=0; fix(.5); act('strike'); eq(S.player.mana,3); });
test('Curses: Volatile dead burst on death, soaked by ward, never below 1 HP',()=>{
  cursedRun('volatile'); const a=foe({hp:1,atk:40}), b=foe({hp:1e6}); S.run.enemies=[a,b]; S.run.target=a.id; fix(.5); const P=S.player; P.hp=pMax();
  act('strike'); ok(a.dead); eq(P.hp,pMax()-20-1,'20 from the burst, 1 from the other foe');
  const c=foe({hp:1,atk:40}); S.run.enemies.push(c); setTarget(c.id); P.shield=15; P.hp=50; act('strike'); eq(P.hp,50-5-1); eq(P.shield,0);
  const d=foe({hp:1,atk:400}); S.run.enemies=[d]; S.run.target=d.id; P.hp=3; act('strike'); eq(P.hp,1,'a burst alone never kills'); eq(S.mode,'raise');
});
test('Curses: cursed runs pay double gold and trophies, more XP and more gear',()=>{
  const r=cursedRun('fury'); const e=foe({lvl:4}); const x=killXp(e); S.run.mod=null; eq(x,Math.round(killXp(e)*MOD_XP)); S.run.mod='fury';
  fix(.5); killLoot(foe({elite:true}),r); eq(r.troph['Tunnel Rat'],4,'elite trophies doubled');
  seed(6); let n=0; for(let i=0;i<4000;i++) n+=rollDrops(foe({base:'Tunnel Rat',role:'striker'})).length; near(n/4000,.28*MOD_DROP,.03);
});
test('Curses: the Tower is never cursed',()=>{ setLvl(20); S.ti={clr:{0:1}}; S.mod={day:1,gi:5,id:'horde'}; startTower(1); eq(runMod(),null); eq(S.run.enemies.length,3); });

// =====================================================================================================
// STATUS EFFECTS
test('Status: a new dose refreshes, it ticks each turn, then wears off',()=>{
  const t=foe({hp:1000}); arena([t]); addDot(t,'poison',10,2); addDot(t,'poison',6,3); eq(t.dots.poison.d,10); eq(t.dots.poison.t,3); addDot(t,'poison',0.2,5); eq(t.dots.poison.t,3,'tiny doses are ignored');
  tickDots(); eq(t.hp,990); tickDots(); tickDots(); eq(t.hp,970); eq(t.dots,undefined); const dead=foe({hp:0}); addDot(dead,'poison',5,3); eq(dead.dots,undefined,'the dead cannot be poisoned');
});
test('Status: bleeding ignores your ward, can down minions, and can kill you',()=>{
  arena([foe({hp:1e6})]); const P=S.player; P.shield=500; addDot(P,'bleed',7,2); tickDots(); eq(P.hp,pMax()-7); eq(P.shield,500);
  const m=mkMinion({}); m.hp=3; addDot(m,'burn',10,2); tickDots(); eq(m.hp,0); ok(S.run.log.some(l=>/succumbs/.test(l.m)));
  P.shield=0; P.hp=5; addDot(P,'bleed',50,2); fix(.5); act('strike'); eq(S.mode,'defeat','bled out');
});
test('Status: enemy striker crits cause bleeding, Cinder Wave burns',()=>{
  const s=foe({role:'striker',atk:20,hp:1e6}); arena([s]); S.player.stats.constitution=200; S.player.hp=pMax(); seq([.5,.9,.5,.5,.1],.5); act('strike'); ok(S.player.dots&&S.player.dots.bleed,'bleeding after a crit'); eq(S.player.dots.bleed.d,6);
  fresh(); const b=bossFight(2); const m=mkMinion({}); m.hp=m.maxHp=1e5; S.player.stats.constitution=500; S.player.hp=pMax(); fireAbility(b); ok(S.player.dots.burn); ok(m.dots.burn);
});
test('Status: Venomous minions poison what they hit',()=>{ const t=foe({hp:1e6}); arena([t],3); const m=mkMinion({traits:['venom']}); m.atk=200; fix(.5); act('strike'); ok(t.dots&&t.dots.poison); eq(t.dots.poison.d,Math.round(200*.15*pierceMul(.5))); ok(TRAITS.venom); });
test('Status: a Healing Draught cures you, Dark Mending cures your whole side',()=>{
  arena([foe({hp:1e6})]); const P=S.player; S.belt.hp=2; addDot(P,'bleed',5,3); fix(.5); act('pot:hp'); eq(P.dots,undefined,'drinkable even at full HP when bleeding'); eq(S.belt.hp,1);
  const m=mkMinion({}); S.player.skills.mend=1; S.player.mana=100; ok(!canUse('mend')); addDot(m,'burn',5,3); addDot(P,'burn',5,3); ok(canUse('mend'),'usable to cure alone'); act('sk:mend'); eq(m.dots,undefined); eq(P.dots,undefined);
});
test('Status: effects end when you leave a room and never reach a save',()=>{
  arena([foe({hp:0,dead:true})]); fix(.5); const m=mkMinion({}); addDot(S.player,'bleed',3,3); addDot(m,'poison',3,3); const snap=snapshot(); eq(snap.player.dots,undefined); eq(snap.army[0].dots,undefined); ok(S.player.dots,'live game untouched');
  roomWon(); descend(); eq(S.player.dots,undefined); eq(m.dots,undefined);
  addDot(S.player,'bleed',3,3); flee(); eq(S.player.dots,undefined);
  eq(normalizeSave({v:2,player:{lvl:2,dots:{bleed:{d:9,t:9}}},army:[{role:'striker',lvl:1,rankI:0,name:'Imp',dots:{poison:{d:1,t:1}}}]}).player.dots,undefined);
});

// =====================================================================================================
// HISTORY
test('History: every way out of a run is recorded with its numbers',()=>{
  arena([foe({hp:1})]); fix(.5); act('strike'); returnTown(); let h=S.hist[S.hist.length-1]; eq(h.res,'left'); eq(h.rooms,1); eq(h.kills,1); ok(h.xp>0&&h.gold>0); eq(h.g,0);
  arena([foe()]); flee(); eq(S.hist[S.hist.length-1].res,'fled');
  arena([foe({atk:1e6})]); S.player.hp=1; act('strike'); returnTown(); eq(S.hist[S.hist.length-1].res,'fell');
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); S.watches=3; startRun(0); let n=0; while(n++<300&&!(S.mode==='raise'&&S.run.cleared)){ if(S.mode==='battle') act('strike'); else descend(); } returnTown();
  h=S.hist[S.hist.length-1]; eq(h.res,'cleared'); eq(h.rooms,4);
  const L=S.life; eq(L.runs,4); eq(L.clears,1); eq(L.deaths,1); eq(L.fled,1); eq(L.rooms,5); ok(L.kills>=5); eq(L.gold,S.hist.reduce((a,x)=>a+x.gold,0));
});
test('History: Tower runs record their floors; only the last 20 runs are kept',()=>{
  setLvl(30); S.tower.best=20; startTower(11); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); descend(); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); returnTown();
  const h=S.hist[0]; eq(h.g,-1); eq(h.f0,11); eq(h.f1,12); eq(h.rooms,2);
  for(let i=0;i<30;i++){ S.watches=3; startRun(0); flee(); } eq(S.hist.length,HIST_N); eq(S.life.runs,31);
});
test('History: closing the tab mid-run records it in the save, not twice',()=>{
  startRun(0); const snap=snapshot(); eq(snap.hist.length,1); eq(snap.life.runs,1); eq(S.hist.length,0,'live game untouched');
  save(); S=null; loadGame(); eq(S.hist.length,1); eq(S.life.runs,1);
});
test('History: lifetime totals survive New Game+, damaged history is cleaned',()=>{
  S.life.runs=50; S.ti={clr:{5:1}}; ok(startNGP()); eq(S.life.runs,50); eq(S.hist.length,0);
  const g=normalizeSave({v:2,player:{lvl:2},hist:[{d:1,res:'left'},null,'x',{d:'a'}],life:{runs:'x',kills:5,bogus:9}}); eq(g.hist.length,1); eq(g.life.runs,0); eq(g.life.kills,5); eq(g.life.bogus,undefined);
});
test('History: the History tab renders',()=>{ ui.tab='hist'; ok(/No runs yet/.test(renderAll('empty history'))); richState(); ui.tab='hist'; const h=renderAll('full history'); ok(/Hell Tower, floor/.test(h)&&/Drought/.test(h)); });

// =====================================================================================================
// BAG TOOLS
test('Bag: sorts best first, by slot, or newest',()=>{
  const a=give('0-ta'), b=give('3-wa'), c=give('1-aa'); ui.sort='tier'; eq(sortedBag().map(x=>x.u).join(),[b.u,c.u,a.u].join()); ui.sort='slot'; eq(sortedBag().map(x=>x.u).join(),[b.u,c.u,a.u].join());
  ui.sort='new'; eq(sortedBag()[0].u,c.u); ACTIONS.sort('bogus'); eq(ui.sort,'tier');
});
test('Bag: selling junk sells only Common and Uncommon pieces from the bag, after asking',()=>{
  give('0-wa'); give('1-aa'); const keep=give('2-wa'), u=give('u0'); S.equip.weapon={u:++S.uid,id:'0-wb'};
  ACTIONS.junk(); eq(S.inv.length,4,'asks first'); ACTIONS.junk(); eq(S.inv.map(x=>x.u).sort().join(),[keep.u,u.u].sort().join()); eq(S.gold,sellPrice(ITEM['0-wa'])+sellPrice(ITEM['1-aa'])); ok(S.equip.weapon,'worn gear is safe'); ok(/junk/.test(ui.msg.m));
  arena([foe()]); eq(sellJunk(),null);
});
test('Bag: the gear tab shows tools, rolls and comparisons',()=>{ const it=give('2-wa'); it.ro=[['will',3]]; give('0-ta'); ui.tab='gear'; const h=renderAll('gear tab'); ok(/data-a="sort"/.test(h)&&/data-a="junk"/.test(h)&&/data-a="reforge"/.test(h)&&/class="roll"/.test(h)&&/class="cmp"/.test(h)); });
test('UI: events, curses and status effects render',()=>{
  richState(); S.ti.clr={0:1}; S.mod={day:S.day,gi:0,id:'volatile'}; ui.tab='gates'; ok(/Cursed today/.test(renderAll('cursed gate card')));
  S.watches=3; startRun(0); addDot(S.player,'bleed',5,2); addDot(S.run.enemies[0],'poison',4,3); S.run.bless=true; const h=renderAll('battle with effects'); ok(/Bleeding 5/.test(h)&&/Poisoned 4/.test(h)&&/Cursed:/.test(h)&&/Blood-blessed/.test(h));
  S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); fix(.99); roomWon(); for(const id of Object.keys(EVENTS)){ S.run.event=Object.assign({id},id==='pedlar'?{pot:'mp',price:9}:{}); const x=renderAll('event '+id); ok(x.includes(EVENTS[id].name)); }
  ACTIONS.event('pass'); ok(!/event-box/.test(renderAll('after the event')));
});

// =====================================================================================================
// DOORS
function wonRoom(room){ arena([foe({hp:0,dead:true})]); S.run.room=room||0; fix(.99); roomWon(); return S.run; }
test('Doors: after a gate room you choose from 2-3 doors, the first always a fight; before the boss only the boss',()=>{
  seed(12); for(let i=0;i<200;i++){ S.mode='battle'; const r=wonRoom(i%2); ok(r.doors.length>=2&&r.doors.length<=3); eq(r.doors[0],'fight'); eq(new Set(r.doors).size,r.doors.length); r.doors.forEach(k=>ok(DOORS[k])); fresh(); }
  const r=wonRoom(2); eq(r.doors.join(),'boss'); const b=wonRoom(3); ok(b.cleared); eq(b.doors,null,'none after the boss');
  fresh(); setLvl(20); startTower(1); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(S.run.doors,null,'not in the Tower');
  fix(0); eq(rollDoors({room:0,rooms:4}).length,3,'never loops even with fixed randomness');
});
test('Doors: descending with no choice takes the first door; a door that is not offered is refused',()=>{
  const r=wonRoom(0); r.doors=['fight','rest']; ok(!descend('treasure')); eq(S.mode,'raise'); ok(descend()); eq(S.mode,'battle'); eq(r.room,1); eq(r.roomKind,'fight');
});
test('Doors: an elite room has stronger foes and pays more',()=>{
  seed(9); const r=wonRoom(0); r.doors=['fight','elite']; seed(9); const keep=JSON.stringify(S); descend('fight'); const plain=r.enemies.map(e=>[e.maxHp,e.atk]);
  S=JSON.parse(keep); seed(9); descend('elite'); S.run.enemies.forEach((e,i)=>{ eq(e.maxHp,Math.round(plain[i][0]*ELITE_ROOM)); });
  seed(6); let n=0; for(let i=0;i<4000;i++) n+=rollDrops(foe({base:'Tunnel Rat',role:'striker'})).length; near(n/4000,.28*ELITE_DROP,.03);
  fix(.5); const a={}; killLoot(foe({lvl:10}),a); S.run.roomKind=null; const b={}; killLoot(foe({lvl:10}),b); eq(a.gold,Math.round(b.gold*ELITE_GOLD));
});
test('Doors: a rest room heals without a fight, then offers doors again',()=>{
  const r=wonRoom(1); r.doors=['fight','rest']; const P=S.player; P.hp=10; P.mana=0; const m=mkMinion({}); m.hp=1;
  ok(descend('rest')); eq(S.mode,'raise'); eq(r.room,2); eq(r.quiet,'rest'); eq(P.hp,Math.min(pMax(),10+Math.round(pMax()*DIFF.heal)+Math.round(pMax()*REST_HEAL))); ok(m.hp>1);
  eq(r.doors.join(),'boss','next is the boss'); eq(r.corpses.length,0); ok(/rest/.test(r.events[0].m)); renderAll('rest room'); ok(descend()); eq(S.run.enemies[0].boss,true);
});
test('Doors: a vault gives gold and gear without a fight',()=>{ const r=wonRoom(0); r.doors=['fight','treasure']; const g=S.gold; ok(descend('treasure')); ok(S.gold>g); eq(r.spoils.length,1); eq(r.quiet,'treasure'); ok(r.goldTot>0); renderAll('vault'); });
test('Doors: door buttons render and work through clicks',()=>{ const r=wonRoom(0); r.doors=['fight','elite','rest']; const h=renderAll('doors'); ok(/data-a="door" data-k="elite"/.test(h)); ACTIONS.door('rest'); eq(r.quiet,'rest'); });

// =====================================================================================================
// GEAR SETS
test('Sets: two and three pieces of one gate set give their bonuses',()=>{
  const h=pMax(); wear('0-wa'); eq(setCount(0),1); eq(pMax(),h); wear('0-aa'); eq(setCount(0),2); eq(G('hp'),ITEM['0-aa'].stats.hp+15,'2-piece +15 HP');
  wear('0-ta'); eq(setCount(0),3); eq(xb('goldp'),10,'3-piece +10% gold'); S.equip.relic={u:++S.uid,id:'1-ta'}; eq(setCount(0),2); eq(xb('goldp'),0);
});
test('Sets: a gate unique counts toward its set, Tower gear never does',()=>{
  wear('5-wa'); wear('u5'); eq(setCount(5),2); eq(G('mpow'),ITEM.u5.stats.mpow+8); wear('w10'); eq(setCount(5),2); S.equip.armor={u:++S.uid,id:'w2'}; eq(setCount(5),1);
});
test('Sets: percent bonuses really apply',()=>{
  arena([foe()],2); const m=dmgMul(); wear('2-wa'); wear('2-aa'); wear('2-tc'); near(dmgMul(),m*1.05,1e-9);
  fresh(); wear('4-wa'); wear('4-aa'); wear('4-tc'); arena([foe()],4); const P=S.player; P.stats.constitution=500; P.hp=pMax(); const hp=P.hp; hurtAlly(P,100); eq(hp-P.hp,95);
});
test('Sets: items show their set and which bonuses are active',()=>{ wear('3-wa'); wear('3-aa'); const it=give('3-ta'); const h=itemCard(it,''); ok(/Choir of Bones set \(2\/3 worn\)/.test(h)); ok(/class="on">2:/.test(h)); ok(!/class="on">3:/.test(h)); ok(!/set/.test(itemCard({u:1,id:'w1'},'')),'tower gear has no set'); ui.tab='gear'; ok(/Choir of Bones set \(2\/3\)/.test(renderAll('equipment'))); });

// =====================================================================================================
// SKILL UPGRADES
const master=id=>{ setLvl(40); S.player.skills[id]=SK_MAX; };
test('Upgrades: every skill offers two upgrades, chosen once at rank 3, in town',()=>{
  eq(Object.keys(SKILL_MODS).length,SKILLS.length); SKILLS.forEach(s=>{ const M=SKILL_MODS[s.id]; ok(M&&M.a&&M.b,s.id); ok(!BAD_TEXT.test(M.a.join()+M.b.join())); });
  S.player.skills.spear=2; ok(!chooseMod('spear','a'),'not mastered'); master('spear'); ok(!chooseMod('spear','c')); ok(chooseMod('spear','b')); eq(skMod('spear'),'b'); ok(!chooseMod('spear','a'),'only once');
  master('reap'); arena([foe()]); ok(!chooseMod('reap','a'),'not in battle');
});
test('Upgrades: forgetting skills clears the choice; saves keep only valid choices',()=>{
  master('spear'); chooseMod('spear','a'); resetSkills(); eq(skMod('spear'),null); eq(Object.keys(S.player.skMod).length,0);
  const g=normalizeSave({v:2,player:{lvl:30,skills:{spear:3,reap:2},skMod:{spear:'a',reap:'b',fly:'a',curse:'z'}}}); eq(canon(g.player.skMod),canon({spear:'a'}));
});
test('Upgrades: Bone Spear Impaler pierces all armor, Splinter hits a second foe',()=>{
  const a=foe({hp:1e6}), b=foe({hp:1e6}); arena([a,b],3); master('spear'); S.mode='town'; chooseMod('spear','a'); S.mode='battle'; S.player.mana=200; fix(.5); act('sk:spear');
  eq(1e6-a.hp,H((pAtk()+pSiph())*1.15*pierceMul(1))); eq(b.hp,1e6);
  S.player.skMod.spear='b'; S.run.cd={}; const a2=a.hp; act('sk:spear'); eq(1e6-b.hp,Math.round((a2-a.hp)*.5));
});
test('Upgrades: passive upgrades change your numbers',()=>{
  const P=S.player; master('bonearmor'); const h=pMax(); P.skMod.bonearmor='a'; near(pMax(),h/1.18*1.24,1); P.skMod.bonearmor='b'; const w=pWard(); delete P.skMod.bonearmor; eq(w,Math.round(pWard()*1.3));
  master('mastery'); const c=corpse({lvl:40,rankI:3}); const ch=raiseChance(c), cost=raiseCost(corpse({rankI:3})); P.skMod.mastery='a'; eq(raiseChance(c),ch+6); P.skMod.mastery='b'; eq(raiseCost(corpse({rankI:3})),Math.ceil(17*.75)); ok(raiseCost(corpse({rankI:3}))<cost);
  master('soulwell'); P.skMod.soulwell='b'; eq(siphonCost(),6); master('gravepact'); const m=mkMinion({lvl:20,rankI:4}), mh=m.maxHp; P.skMod.gravepact='a'; syncMinion(m); ok(m.maxHp>mh);
});
test('Upgrades: active upgrades change what the skill does',()=>{
  const t=foe({hp:1e6}), o=foe({hp:1e6}); arena([t,o]); const P=S.player; fix(.5); P.mana=999;
  master('curse'); P.skMod.curse='b'; act('sk:curse'); ok(t.curse&&o.curse,'Spreading curses everyone'); near(o.curse.mul,1+.45*.8,1e-9);
  P.skMod.curse='a'; S.run.cd={}; delete t.curse; act('sk:curse'); eq(t.curse.t,5-1,'Lingering lasts 5 turns');
  master('frenzy'); P.skMod.frenzy='a'; act('sk:frenzy'); eq(S.run.frenzy,4);
  master('blast'); P.skMod.blast='b'; S.run.corpses=[corpse()]; act('sk:blast'); ok(t.dots&&t.dots.poison,'Grave Gas poisons');
  master('reap'); P.skMod.reap='b'; const low=foe({hp:1,maxHp:1e6}); S.run.enemies.push(low); setTarget(low.id); P.mana=50; act('sk:reap'); ok(P.mana>=50-18+10,'Soul Reap refunds mana');
  master('edge'); P.skMod.edge='b'; P.hp=10; const hp=P.hp; setTarget(t.id); act('strike'); ok(P.hp>hp-2,'Vampiric heals');
});
test('Upgrades: the Skills tab offers the choice and shows what you chose',()=>{ master('spear'); ui.tab='skills'; ok(/data-a="skmod" data-k="spear\|a"/.test(renderAll('choose'))); ACTIONS.skmod('spear|a'); ok(/Upgrade: <b>Impaler/.test(renderAll('chosen'))); });

// =====================================================================================================
// MINION COMMANDS
test('Orders: each kind of minion takes one free order per room',()=>{
  arena([foe({hp:1e6})]); ok(!canCommand('vanguard'),'no vanguard'); const v=mkMinion({role:'vanguard'}); ok(canCommand('vanguard')); const t=S.run.turn;
  ok(command('vanguard')); eq(S.run.turn,t,'free'); ok(!command('vanguard'),'once a room'); eq(S.ti.commands,1);
  S.run.enemies=[foe({hp:0,dead:true})]; fix(.99); roomWon(); descend(); ok(canCommand('vanguard'),'again next room'); v.hp=0; ok(!canCommand('vanguard'),'not with the dead');
});
test('Orders: Taunt makes foes hit only your vanguards for 2 turns',()=>{
  const e=foe({hp:1e6,atk:5}); arena([e]); const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e6; const P=S.player; seed(3); command('vanguard');
  for(let i=0;i<2;i++){ const hp=P.hp; act('strike'); eq(P.hp,hp,'turn '+i+': you are untouched'); } eq(S.run.taunt,0); let hit=false; for(let i=0;i<20&&!hit;i++){ const hp=P.hp; act('strike'); if(P.hp<hp) hit=true; } ok(hit,'after Taunt you can be hit again');
});
test('Orders: Focus makes strikers crit, Execute doubles reapers on weak foes, Bone Shield wards you',()=>{
  const t=foe({hp:1e6}); arena([t]); const s=mkMinion({role:'striker'}); s.atk=100; fix(.5); command('striker'); act('strike'); eq(1e6-t.hp,H(pAtk()*dmgMul())+Math.round(H(100*dmgMul())*1.8)); ok(!S.run.focus,'only one turn');
  fresh(); const w=foe({hp:3e5,maxHp:1e6}); arena([w]); const r=mkMinion({role:'reaper'}); r.atk=100; fix(.5); command('reaper'); act('strike'); eq(3e5-w.hp,H(pAtk()*dmgMul())+H(100*dmgMul()*2));
  fresh(); arena([foe()]); const m=mkMinion({role:'mender'}); m.atk=20; command('mender'); eq(S.player.shield,30);
});
test('Orders: order buttons show in battle',()=>{ arena([foe()]); mkMinion({role:'vanguard'}); mkMinion({role:'mender'}); const h=renderAll('orders'); ok(/data-a="cmd" data-k="vanguard"/.test(h)&&/data-a="cmd" data-k="mender"/.test(h)); ACTIONS.cmd('mender'); ok(/Bone Shield &middot; given/.test(renderAll('given'))); });

// =====================================================================================================
// STORY
test('Story: twelve passages; the first opens with a new game',()=>{ eq(STORY.length,12); STORY.forEach(s=>ok(s.t&&s.m.length>80&&!BAD_TEXT.test(s.m),s.id)); ok(S.story.intro); newGame(); ok(S.notices.some(n=>n.c==='story'&&/drowned chapel/.test(n.m))); });
test('Story: the first clear of each gate tells its part, once',()=>{
  const P=S.player; P.stats.strength=400; P.hp=pMax(); startRun(0); S.run.room=3; S.run.enemies=[foe({hp:1})]; S.run.target=S.run.enemies[0].id; fix(.5); act('strike');
  ok(S.story.g0); ok(S.run.events.some(e=>e.c==='story'&&/Rat King/.test(e.m))); returnTown(); const n=Object.keys(S.story).length;
  S.watches=3; startRun(0); S.run.room=3; S.run.enemies=[foe({hp:1})]; S.run.target=S.run.enemies[0].id; act('strike'); eq(Object.keys(S.story).length,n); ok(!S.run.events.some(e=>e.c==='story'));
});
test('Story: Tower milestones and New Game+ have passages, and they survive saves and New Game+',()=>{
  setLvl(60); S.tower.best=49; startTower(41); S.run.tw=50; S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); ok(S.story.t25&&S.story.t50); ok(!S.story.t75); returnTown();
  save(); S=null; loadGame(); ok(S.story.t50); S.ti={clr:{5:1}}; ok(startNGP()); ok(S.story.t50&&S.story.ngp); eq(normalizeSave({v:2,player:{lvl:1},story:{intro:3,fake:1,g0:'x'}}).story.fake,undefined);
});
test('Story: bosses speak when the fight starts and when they fall',()=>{
  Object.keys(BOSS_LINES).forEach(n=>ok(allNames().includes(n),n)); DUNGEONS.forEach(D=>ok(BOSS_LINES[D.boss[0]],D.boss[0])); TW_BOSS.forEach(n=>ok(BOSS_LINES[n],n));
  setLvl(5); startRun(0); S.run.room=3; spawnRoom(); ok(S.run.log.some(l=>l.c==='boss'&&/Kneel/.test(l.m))); const b=S.run.enemies[0]; b.hp=0; checkDeaths(); ok(S.run.log.some(l=>l.c==='boss'&&/vats/.test(l.m)));
});
test('Story: the Chronicle lists what you have read',()=>{ S.story.g0=2; ui.tab='hist'; const h=renderAll('chronicle'); ok(/Chronicle &middot; 2\/12/.test(h)); ok(/The Rat King/.test(h)); });

// =====================================================================================================
// MUSIC, DISPLAY, SAVE FILES
test('Music: a switch in Settings, remembered; picks a scene; silent without Web Audio',()=>{
  const was=MUSIC.on; eq(musicScene(),'town'); ui.tab='tower'; eq(musicScene(),'tower'); ui.tab='gates'; arena([foe()]); eq(musicScene(),'gate'); flee(); setLvl(20); startTower(1); eq(musicScene(),'tower'); flee();
  ACTIONS.music(); eq(MUSIC.on,!was); eq(localStorage.getItem('lotd-music'),MUSIC.on?'on':'off'); music(); ACTIONS.music(); eq(MUSIC.on,was); ok(/data-a="music"/.test((ui.tab='settings',renderAll('settings'))));
});
test('Display: text size, reduced motion and high contrast apply and are remembered',()=>{
  const keep=Object.assign({},VIEW);
  try{ ACTIONS.view('size|2'); eq(VIEW.size,2); ok(document.body.classList.contains('ts2')); ACTIONS.view('size|9'); eq(VIEW.size,2,'clamped'); ACTIONS.view('size|0'); ok(!document.body.classList.contains('ts2'));
    const c=VIEW.calm; ACTIONS.view('calm'); eq(VIEW.calm,!c); eq(document.body.classList.contains('calm'),VIEW.calm); ACTIONS.view('hc'); ok(document.body.classList.contains('hc')||!VIEW.hc);
    eq(JSON.parse(localStorage.getItem('lotd-view')).size,0); ui.tab='settings'; ok(/data-a="view" data-k="size\|1"/.test(renderAll('display'))); }
  finally{ Object.assign(VIEW,keep); saveView(); applyView(); }
});
test('Save files: a save file round-trips, plain JSON saves load too, junk is refused',()=>{
  S.gold=777; const code=exportCode(); S.gold=0; ok(importText('\n'+code+'\n')); eq(S.gold,777);
  S.gold=5; ok(importText(JSON.stringify(Object.assign(JSON.parse(JSON.stringify(S)),{gold:42})))); eq(S.gold,42);
  const cur=S; ok(!importText('hello')); ok(!importText('')); ok(!importText('{"v":9}')); ok(S===cur);
  ui.file={name:'save.txt',text:code}; S.gold=1; ACTIONS.loadfile(); eq(S.gold,1,'asks first'); ACTIONS.loadfile(); eq(S.gold,777); eq(ui.file,null);
  ui.file={name:'bad.txt',text:'nope'}; ACTIONS.loadfile(); ACTIONS.loadfile(); eq(ui.msg.c,'bad'); ACTIONS.dlsave(); ok(ui.msg); ui.tab='settings'; ok(/data-a="dlsave"/.test(renderAll('save files')));
});

test('Playthrough: a bot plays 30 days, checking every rule after every action',()=>{
  seed(2024); fresh(); const order=['will','constitution','strength','intelligence','constitution']; let steps=0, clears=0, lastDay=0, towers=0;
  while(S.day<=30){
    if(++steps>60000) throw new Error('bot stuck on day '+S.day+' in '+S.mode);
    if(S.mode==='town'&&S.day!==lastDay){ lastDay=S.day; save(); const before=canon(S); S=null; loadGame(); const d=firstDiff(JSON.parse(before),JSON.parse(canon(S))); if(d) throw new Error('save/load changed the game on day '+lastDay+' at '+d); }
    const P=S.player;   // read after the reload above, which replaces S
    if(S.mode==='town'){
      while(P.pts>0) alloc(order[P.pts%order.length]);
      for(let k=0;k<3;k++) for(const s of SKILLS) learnSkill(s.id);
      claimQuest(); sellAllTrophies(); while(S.gold>150&&buyPotion('hp')); if(S.gold>400) buySalt();
      for(const it of S.inv.slice()){ const d=ITEM[it.id], cur=S.equip[d.slot]; if(!cur||(!ITEM[cur.id].uq&&ITEM[cur.id].set<d.set)||d.uq) equip(it.u); }
      while(S.inv.length>bagMax()-3){ const it=S.inv.find(x=>!ITEM[x.id].uq); if(!it) break; sellItem(it.u); }
      if(S.army.length&&S.gold>800) empower(S.army[0].uid);
      if(P.lvl>=TW.unlock&&S.day%4===0){ startTower(Math.max(...towerStarts())); towers++; }
      else { let g=0; for(let i=0;i<6;i++) if(P.lvl>=RK[i].unlock&&P.lvl>=SAFE[i]) g=i; startRun(g); }
      if(S.mode==='town') throw new Error('bot could not start a run on day '+S.day);
    } else if(S.mode==='battle'){
      let a='strike'; const use=['reap','blast','chill','spear','curse','frenzy','mend'].find(id=>canUse(id));
      if(P.hp<pMax()*.35&&S.belt.hp) a='pot:hp'; else if(use) a='sk:'+use; else if(P.hp<pMax()*.5&&P.mana>=8) a='siphon'; else if(P.mana>=6&&P.shield===0&&liveFoes().some(e=>e.charging)) a='ward';
      const turn=S.run.turn, mode=S.mode; act(a); if(S.mode===mode&&S.run&&S.run.turn===turn&&S.mode==='battle') throw new Error(a+' did nothing');
    } else if(S.mode==='raise'){
      for(const c of S.run.corpses) if(!c.tried&&S.army.length<slots()&&P.mana>=raiseCost(c)) tryRaise(c.id,c.boss&&S.salts>0);
      if(S.run.cleared){ clears++; returnTown(); } else if(P.hp>pMax()*.45) descend(); else returnTown();
    } else returnTown();
    invariants('day '+S.day+', step '+steps);
    if(steps%5===0){ ui.tab=TABS[steps%TABS.length]; renderAll('day '+S.day+' '+S.mode); }
  }
  ok(S.player.lvl>=5,'reached level '+S.player.lvl); ok(clears>=3,'cleared '+clears+' gates'); ok(totalKills()>100);
});

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
window.LOTD_TESTS={run,count:TESTS.length,invariants,cleanHTML,mulberry32};   // invariants and cleanHTML are also used by tests/fuzz.js
})();
