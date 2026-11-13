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
function arena(list,di){ di=di||0; if(S.player.lvl<RK[di].unlock) setLvl(RK[di].unlock); S.watches=WATCHES; startRun(di); const r=S.run; r.enemies=list; r.target=list[0].id; r.log=[]; return r; }
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
const TABS=['gates','gear','bes','skills','market','tower','titles','settings','help'];
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
  for(const m of S.army){ finite(m.hp,'minion hp'+w); finite(m.maxHp,'minion maxHp'+w); finite(m.atk,'minion atk'+w); ok(m.hp<=m.maxHp,m.nick+' hp above max'+w); ok(m.lvl<=Math.max(P.lvl+2,m.lvl0),m.nick+' grew past the level cap'+w); }
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
test('Titles: the big deeds unlock',()=>{
  const s=richState(); S.ti.got={}; S.ti.sel=null; S.player.lvl=50; S.ti.raised=200; S.ti.deaths=10; S.ti.claims=7; S.ti.cancels=10; S.ti.master=1; S.ti.soldTro=500; S.ti.emp=25; S.ti.evolved=1; S.ti.elder=1; S.ti.armed=1; S.tower.best=150; S.ngp=3;
  allNames().forEach(n=>S.kills[n]=2000); while(S.army.length<slots()) mkMinion({});
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
window.LOTD_TESTS={run,count:TESTS.length};
})();
