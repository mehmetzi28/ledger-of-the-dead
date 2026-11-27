// ----- player-derived stats
const pMax = ()=>Math.round((24+A('constitution')*CON_HP+S.player.lvl*4+G('hp')+cmdHp())*(1+.06*sk('bonearmor'))*(1+xb('hpp')/100)*tearK());
const pMana = ()=>Math.round((20+A('intelligence')*6+A('will')*3+G('mana'))*(1+xb('manap')/100)*(1+B_ALT_MANA*bl('altar'))*manaK());   /* Black Altar */
const pAtk = ()=>Math.round(3+A('strength')*2.2+S.player.lvl+G('atk')+cmdAtk());
const pSiph = ()=>Math.round(6+A('intelligence')*2.8+S.player.lvl+G('siph')+cmdSiph());
const pWard = ()=>Math.round((10+A('intelligence')*3+S.player.lvl*1.5+G('ward'))*(hasMod('bonearmor','b')?MARROW:1));
// What each stat point gives beyond those formulas. Strength: crit chance and armor piercing on Strike, and minion attack. Constitution: less damage taken
// and more healing received. Intelligence: skill damage (Bone Spear, Corpse Explosion, Grave Chill, Reap) and minion attack. Each Strength and Constitution part is capped.
// 2026-11-19 stat rebalance (market bot, all points in Will plus one other stat): Will+Constitution cleared 93%, Will alone 72%, Will+Intelligence 65%,
// Will+Strength 58%. Constitution HP 9->5, DR .4->.25 per point (cap 12->8), healing capped at 20%; Intelligence skill damage 1->2%; Strength and
// Intelligence now also raise minion attack (1.3% / 1.2% per point). Now about 87 / 78 / 83 / 81%.
const CON_HP=5, STR_CRIT=.5, STR_CRIT_CAP=15, STR_PEN=2, STR_PEN_CAP=25, STR_MINION=1.3, CON_DR=.25, CON_DR_CAP=8, CON_HEAL=1.5, CON_HEAL_CAP=20, INT_SKILL=2, INT_MINION=1.2, DR_CAP=75;   // % per point; STR_PEN = Strength points per 1% piercing; DR_CAP caps all damage reduction together
const strCrit = ()=>Math.min(STR_CRIT_CAP,Math.max(0,A('strength'))*STR_CRIT);   // % crit chance
const strPen = ()=>Math.min(STR_PEN_CAP,Math.floor(Math.max(0,A('strength'))/STR_PEN))/100;   // share of foe armor Strike ignores
const conDr = ()=>Math.min(CON_DR_CAP,Math.max(0,A('constitution'))*CON_DR);   // % less damage taken
const conHeal = ()=>Math.min(CON_HEAL_CAP,Math.max(0,A('constitution'))*CON_HEAL);   // % more healing received
const intSkill = ()=>Math.max(0,A('intelligence'))*INT_SKILL;   // % more skill damage
const CON_MINION=1, conMinion=()=>Math.max(0,A('constitution'))*CON_MINION;   // % more minion max HP from Constitution: the vigor your Soul Tether shares (2026-11-26: with the tether Constitution was the one stat that gave the army nothing, and Will+Strength/Intelligence builds pulled 10 Tower floors ahead of Will+Constitution)
// Command: the hero draws on the army they lead. The army's power is the average attack and max HP of its CMD_TOP strongest minions, counting
// places it cannot fill (so one minion gives a third). Strike gains CMD_STR% of that attack per Strength point, Soul Siphon (and every skill
// built on it) CMD_INT% per Intelligence point, max HP CMD_CON% of that HP per Constitution point. cmdSync measures it at the start of every
// room and floor, on the way home and after each town action, so it holds still through a fight. (2026-11-26: by day 70 minions hit for
// 10-20k with 70-150k HP while the hero hit for 165 with ~1k HP, so the hero's own stats had stopped counting.)
const CMD_STR=1.5, CMD_INT=.5, CMD_CON=.04, CMD_TOP=3;
function cmdPow(army){ const a=(army||S.army||[]).filter(m=>!m.thrall&&!m.wall).slice().sort((x,y)=>(y.atk||0)-(x.atk||0)).slice(0,CMD_TOP), sum=k=>a.reduce((t,m)=>t+(isFinite(m[k])?m[k]:0),0);
  return {a:Math.round(sum('atk')/CMD_TOP),h:Math.round(sum('maxHp')/CMD_TOP)}; }
const cmd=()=>{ const c=S&&S.player&&S.player.cmd; return c&&c.a>=0&&c.h>=0&&isFinite(c.a)&&isFinite(c.h)?c:{a:0,h:0}; };   // a damaged save reads as no Command until the next measure
const cmdAtk=()=>Math.round(cmd().a*Math.max(0,A('strength'))*CMD_STR/100), cmdSiph=()=>Math.round(cmd().a*Math.max(0,A('intelligence'))*CMD_INT/100), cmdHp=()=>Math.round(cmd().h*Math.max(0,A('constitution'))*CMD_CON/100);
function cmdSync(){ const P=S&&S.player; if(!P) return; P.cmd=cmdPow(); P.hp=Math.min(P.hp,pMax()); }   // a stronger army raises your maximum, never heals you; a weaker one caps your HP at the new maximum
const statMinion = ()=>Math.max(0,A('strength'))*STR_MINION+Math.max(0,A('intelligence'))*INT_MINION;   // % more minion attack from Strength and Intelligence
const skMul = ()=>(1+intSkill()/100)*(S.run?hexK(S.player):1);   // Hexed: your skills hit 20% softer too
const pDr = ()=>Math.min(DR_CAP,xb('drp')+conDr());   // all your damage reduction: titles, sets, faith, Calcified Hide and Constitution
const critChance = ()=>.1+(G('crit')+strCrit()+(hasMod('edge','a')?RENDING:0))/100+sigCrit()+mistCrit();   /* Thin Veil (game-rift.js); Red Mist (game-valley.js) */   // Strike's crit chance
const ARMY_CAP=12;
const RESERVE_BASE=6, RESERVE_CRYPT=2;   // the Reserve: a bench of places beside the army, +2 per Crypt level
const slots = ()=>Math.min(ARMY_CAP+bl('crypt')+cryptSlot(),1+Math.floor(A('will')*2/5)+Math.floor(S.player.lvl/4)+G('slot')+bl('crypt')+cryptSlot());   /* Throne Crypt (game-town2.js) */   // one per 2.5 Will and one per 4 levels
const pRankI = ()=>{const l=S.player.lvl;return l<4?0:l<8?1:l<12?2:l<17?3:l<23?4:5};

function mobStats(rankI,lvl,hf,af,boss,elite){
  const R=RK[rankI];
  let hp=14*R.hp*hf*DIFF.hp*DIFF.gate[rankI]*(1+LV_HP*(lvl-1));
  let atk=3.2*R.atk*af*DIFF.atk*DIFF.gate[rankI]*(1+LV_ATK*(lvl-1));
  if(boss){hp*=3.2;atk*=1.4}
  if(elite){hp*=1.5;atk*=1.3}
  return {hp:Math.round(hp), atk:Math.max(1,Math.round(atk))};
}
// What an item is worth to a minion: weapons and offence become attack, armour and vitality become health.
function gearBonus(m){
  const o={atk:0,hp:0,mpow:0}; if(!m.eq) return o;
  for(const sl of GEAR_SLOTS){ const it=m.eq[sl]; if(!it||!ITEM[it.id]) continue; const t=itStats(it);
    o.atk+=(t.atk||0)+2*(t.strength||0)+.5*(t.crit||0)+.4*(t.siph||0)+.5*(t.intelligence||0);
    o.hp+=(t.hp||0)+8*(t.constitution||0)+2.5*(t.ward||0)+.25*(t.mana||0)+4*(t.will||0);
    o.mpow+=(t.mpow||0); }
  o.atk=Math.round(o.atk); o.hp=Math.round(o.hp); return o;
}
function syncMinion(m){
  const s=minionBase(m);
  const gg=gearBonus(m);
  const b=(1+.02*A('will'))*(1+(G('mpow')+gg.mpow+6*sk('gravepact'))/100);
  const nh=Math.round((s.hp*b*stageMul(m,'hp')+gg.hp)*(hasTrait(m,'thick')?1.25:1)*(hasTrait(m,'unmarred')?1+UNMARRED_K:1)*(hasTrait(m,'stitched')?STITCH_MAX:1)*siegeHpMul(m)*(remembered()?1+MEM_HP:1)*(1+conMinion()/100)*extraMul(m,'hp')), na=Math.round((s.atk*b*stageMul(m,'atk')+gg.atk)*(hasTrait(m,'vicious')?1.2:1)*(hasTrait(m,'unmarred')?1+UNMARRED_K:1)*(1+statMinion()/100)*extraMul(m,'atk'));
  if(m.maxHp!=null && nh>m.maxHp) m.hp+=nh-m.maxHp;
  m.maxHp=nh; m.atk=na; m.hp=Math.min(m.hp,m.maxHp);
}
const syncArmy = ()=>{ S.army.forEach(syncMinion); (S.reserve||[]).forEach(syncMinion); (S.waiting||[]).forEach(syncMinion); };   // benched and waiting minions keep up with Will and gear too

const MOMENTS=[];   // banners for big moments; render() shows them once, then clears them
function moment(t,c,k){ MOMENTS.push(k?{t,c:c||'ok',k}:{t,c:c||'ok'}); if(MOMENTS.length>3) MOMENTS.shift(); }   // k: 'lvl' or 'title', drawn as the big framed banner
function notify(m,c){ S.notices.unshift({m,c:c||'info'}); S.notices.length=Math.min(S.notices.length,6); }

// ----- game lifecycle
function freshState(){
  return {v:2,day:1,watches:WATCHES,uid:0,mode:'town',run:null,notices:[],runs:0,kills:{},tower:{best:0,got:{}},inv:[],equip:{weapon:null,armor:null,relic:null},
     player:{id:'p',name:'You',lvl:1,xp:0,pts:3,hp:0,mana:0,shield:0,stats:{strength:4,constitution:4,intelligence:4,will:4},sp:0,skills:{},skMod:{},cmd:{a:0,h:0}},
     army:[],quest:{kills:0,rooms:0,clears:0,claimed:false},gold:0,trophies:{},belt:{hp:0,mp:0},stash:{},prep:{},comm:null,bm:null,spec:{},embalm:[],dread:DREAD_START,orders:null,unpaid:{},shop:null,bagLv:0,salts:0,tips:{},ngp:0,firstRaise:1,
     mod:null,hist:[],story:{},life:Object.fromEntries(LIFE_KEYS.map(k=>[k,0])),build:{},dust:0,bounty:null,heat:{},heatMax:{},raids:[],raidOrders:[],raidLog:[],abbey:abbeyFix(null),inscriptions:[],endHist:[],ending:null,lastPage:0,cycle:null,rift:{best:0},siege:{next:0,pending:false,dmg:null,warned:0},reserve:[],waiting:[],
     memorial:[],honor:null,loadouts:[{n:'',s:null},{n:'',s:null},{n:'',s:null}],rival:rivalDef(),trials:trialDef(),pacts:[],ally:null};
}
const OPEN_HELP={on:false};   // a brand-new game opens on the Gates tab, with a link to How to play at the top
function newGame(){
  S=freshState(); OPEN_HELP.on=true;
  S.player.hp=pMax(); S.player.mana=pMana();
  notify('The Ledger is open. Spend your 3 points, then enter the Rat Warren. Raise what you kill.'); unlockStory('intro');
}
// New Game+: after clearing the Throne of Ash, start over at level 1 keeping titles, bestiary, tips and one unique.
const canNGP=()=>!!(S.ti&&S.ti.clr&&S.ti.clr[5]);
const ownedUniques=()=>[...new Set(S.inv.concat(Object.values(S.equip)).filter(it=>it&&ITEM[it.id]&&ITEM[it.id].uq).map(it=>it.id))];
function startNGP(carry,pacts,rule,carries){
  if(S.mode!=='town'||!canNGP()) return false; if(faithOf()==='dis') tally('godless');   /* Godless: a cycle finished Profane (game-pantheon.js) */
  const own=ownedUniques(), carryAw=carry?Math.max(0,...S.inv.concat(Object.values(S.equip)).filter(it=>it&&it.id===carry).map(it=>it.aw|0)):0, keep={ti:S.ti,kills:S.kills,tips:S.tips,life:S.life,story:S.story||{},rec:S.rec||{},pages:S.pages||0,rift:S.rift||{best:0},memorial:S.memorial||[],rival:rivalNgp(S.rival),trials:Object.assign(trialDef(),S.trials||{},{cur:null,day:0}),ngp:(S.ngp||0)+1,pacts:cleanPacts(pacts),ally:S.ally||null}; if(S.iron){ keep.iron=true; keep.ironDeaths=S.ironDeaths|0; } if(S.custom) keep.custom=S.custom; if(S.code) keep.code=S.code;   /* the mode carries into New Game+ (game-modes.js) */ ngpEnding(keep); ascStart(keep,rule,carries);   /* the ascension rule (game-asc.js) */   // lifetime totals carry over too; the ending picks the next cycle (game-abbey.js)
  newGame(); Object.assign(S,keep); S.ti.clr={}; ngpEndingStart(); ascBegin();   // titles stay earned; New Game+ again needs another Throne of Ash clear
  S.watches=WATCHES-pactWatch(); S.notices=[]; if(carry&&own.includes(carry)){ const it=addItem(carry,null); if(it&&carryAw) it.aw=carryAw; }   /* an awakened unique keeps its ranks */ unlockStory('ngp');
  notify('New Game+ '+S.ngp+' begins. Foes have '+Math.round(NGP_FOE*S.ngp*100)+'% more HP and attack, and pay '+Math.round(NGP_REWARD*S.ngp*100)+'% more XP and gold.'+(carry&&own.includes(carry)?' '+ITEM[carry].name+' is in your bag.':''),'ok');
  return true;
}
// What goes to disk. Outside town it is the state you would have after walking out of the gate now, so closing the tab
// mid-run counts as leaving: the watch stays spent, cleared rooms' XP and loot are kept, and a defeat's penalty sticks.
function snapshot(){
  if(S.mode==='town') return S;
  const c=JSON.parse(JSON.stringify(S));
  if(S.run&&!S.run.siege) recordRun(c,S.run,runResult(S.run));   // a siege in progress is not a run: it stays pending and starts again
  const w=c.army.filter(m=>m.wall); c.army=c.army.filter(m=>!m.thrall&&!m.wall); wallHome(c,w); c.mode='town'; c.run=null; c.player.hp=pMax(); c.player.mana=pMana(); c.player.shield=0; delete c.player.dots; delete c.player.st; c.army.forEach(m=>{ m.hp=m.maxHp; delete m.dots; delete m.st; });
  return c;
}
// TAB guards against two open tabs overwriting each other: when another tab saves, this one stops saving until you reload.
const TAB={blocked:false,last:null,out:null,bakDay:null};
function save(){ if(TAB.blocked) return; try{ const t=S.savedAt; S.savedAt=0; const j=JSON.stringify(snapshot()); if(j===TAB.last&&localStorage.getItem(SAVE_KEY)===TAB.out){ S.savedAt=t; return; }   // nothing changed and the save is still there: no write
  S.savedAt=Date.now(); const out=JSON.stringify(snapshot()); localStorage.setItem(SAVE_KEY,out); TAB.last=j; TAB.out=out; dayBackup(out); }catch(e){} plogTick(); }
// Earlier autosaves: the first save of each new day also goes into a ring of three (newest first), restorable from Settings.
const BAK_N=3, bakKey=i=>SAVE_KEY+'-bak'+i;
function bakRead(i){ try{ const r=localStorage.getItem(bakKey(i)); if(!r) return null; const g=JSON.parse(r); return g&&validSave(g.data)?g:null; }catch(e){ return null; } }
function dayBackup(out){
  if(S.mode!=='town') return; if(TAB.bakDay==null){ const b=bakRead(1); TAB.bakDay=b?b.day:-1; } if(TAB.bakDay===S.day) return;
  try{ for(let i=BAK_N;i>1;i--){ const r=localStorage.getItem(bakKey(i-1)); if(r) localStorage.setItem(bakKey(i),r); }
    localStorage.setItem(bakKey(1),JSON.stringify({t:Date.now(),day:S.day,data:JSON.parse(out)})); TAB.bakDay=S.day; }catch(e){}
}
function bakLoad(i){ const g=bakRead(i); return g?adoptSave(g.data):false; }
// ----- save slots and save codes
const SLOTS_N=3, CODE_TAG='LOTD1:';
const slotKey=i=>SAVE_KEY+'-slot'+i;
const fin=v=>typeof v==='number'&&isFinite(v), num=(v,def)=>fin(v)?v:def;   // save repair helpers
// Repair a save into the current shape, or return null if it cannot be a save. Works on a copy; never touches S.
// Migrates v1 saves (Might/Vigor/Intellect) and fills in anything missing, so older or damaged saves still load.
function normalizeSave(src){
  if(!src||typeof src!=='object'||!src.player||typeof src.player!=='object') return null;
  let g; try{ g=JSON.parse(JSON.stringify(src)); }catch(e){ return null; }
  if(g.v===1){ const st=g.player.stats||{}, ren={might:'strength',vigor:'constitution',intellect:'intelligence'};
    for(const o in ren) if(o in st){ st[ren[o]]=st[o]; delete st[o]; } g.player.stats=st; g.v=2; }
  if(g.v!==2||typeof g.player.lvl!=='number'||!(g.player.lvl>=1)) return null;
  const d=freshState(), obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const hadSp=typeof g.player.sp==='number', hadCmd=obj(g.player.cmd);   // hadCmd: saves from before Command measure their army   // saves from before skills get one point per level already reached
  const P=g.player=Object.assign({},d.player,g.player);
  P.stats=Object.assign({},d.player.stats,obj(P.stats)?P.stats:{}); for(const k in d.player.stats) P.stats[k]=num(P.stats[k],d.player.stats[k]);
  P.lvl=Math.floor(P.lvl); P.xp=num(P.xp,0); P.pts=num(P.pts,0); P.hp=num(P.hp,0); P.mana=num(P.mana,0); P.shield=0;
  P.skills=obj(P.skills)?P.skills:{}; for(const k in P.skills) if(!SKILL[k]||typeof P.skills[k]!=='number') delete P.skills[k];
  P.sp=hadSp?num(P.sp,0):Math.max(0,P.lvl-1);
  if('ult' in P&&!ULTS[P.ult]) delete P.ult;
  const sm=obj(P.skMod)?P.skMod:{}; P.skMod={}; for(const k in sm) if(SKILL_MODS[k]&&(sm[k]==='a'||sm[k]==='b')&&P.skills[k]>=SK_MAX) P.skMod[k]=sm[k];
  g.day=Math.max(1,num(g.day,1)); g.watches=clamp(num(g.watches,WATCHES),0,WATCHES); g.runs=num(g.runs,0);
  for(const k of ['notices','inv','army']) if(!Array.isArray(g[k])) g[k]=[];
  g.notices=g.notices.filter(n=>obj(n)&&typeof n.m==='string').slice(0,6).map(n=>({m:n.m.replace(/[<>]/g,''),c:/^\w+$/.test(n.c)?n.c:'info'}));   // a pasted save code is untrusted: notices go into the page as HTML
  for(const k of ['kills','tower','equip','quest']) if(!obj(g[k])) g[k]=d[k];
  for(const k in g.kills){ const v=g.kills[k]; if(fin(v)&&v>=0) g.kills[k]=Math.floor(v); else delete g.kills[k]; }   // kill counts are shown in the Bestiary
  g.quest=Object.assign({},d.quest,g.quest); if('raises' in g.quest){ delete g.quest.raises; }   // the old "raise the dead" goal became "clear rooms"
  g.tower={best:num(g.tower.best,0),got:obj(g.tower.got)?g.tower.got:{}};
  const okItem=it=>!!(it&&ITEM[it.id]&&typeof it.u==='number');
  g.inv=g.inv.filter(okItem);
  for(const k in g.equip) if(!GEAR_SLOTS.includes(k)) delete g.equip[k]; for(const sl of GEAR_SLOTS) if(!okItem(g.equip[sl])) g.equip[sl]=null;
  g.inv.concat(Object.values(g.equip)).forEach(hfFix);   /* heartforged marks (game-forge.js) */
  const RA=Array.isArray(g.raids)?g.raids.filter(x=>obj(x)&&RK[x.di]&&Array.isArray(x.units)):[];   // squads out raiding: repaired with the army, then split back out
  RA.forEach((x,i)=>x.units.forEach(m=>{ if(obj(m)){ m._raid=i; g.army.push(m); } }));
  for(const k of ['reserve','waiting']) (Array.isArray(g[k])?g[k]:[]).forEach(m=>{ if(obj(m)){ m._raid=k; g.army.push(m); } });   // the Reserve and minions waiting at the gate: repaired the same way, never trimmed
  g.army=g.army.filter(m=>m&&typeof m==='object'&&!m.thrall&&ROLES[m.role]&&typeof m.lvl==='number'&&(m.tw||RK[m.rankI]));
  for(const m of g.army){ m.hf=num(m.hf,1); m.af=num(m.af,1); m.xp=num(m.xp,0); m.hp=num(m.hp,1); m.nick=cleanNick(m.nick)||'Nameless'; m.name=cleanText(m.name); m.kind=cleanText(m.kind); if('fused' in m) m.fused=clamp(Math.floor(num(+m.fused,0)),0,FUSE_MAX); m.kind=m.kind||m.name; if(m.row!=='f'&&m.row!=='b') delete m.row; if(!RK[m.rankI]) m.rankI=twRank(Math.floor(num(m.tw,1)));   // tower minions store their tower rank
    m.traits=Array.isArray(m.traits)?m.traits.filter(t=>TRAITS[t]&&(t!=='commander'||canLead(m))):[]; m.stage=clamp(Math.floor(num(m.stage,0)),0,STAGE_MAX); m.lvl0=num(m.lvl0,m.lvl); if(m.cd&&!CORPSE_CONDS[m.cd]) delete m.cd; normMarks(m);   // minions from before traits keep no trait; cd: how its body died
    if(m.armed){ m.eq=obj(m.eq)?m.eq:{}; Object.values(m.eq).forEach(hfFix); for(const k in m.eq) if(!GEAR_SLOTS.includes(k)) delete m.eq[k]; for(const sl of GEAR_SLOTS) if(!okItem(m.eq[sl])) m.eq[sl]=null; } else if(m.eq!=null) m.eq=null; }
  let top=num(g.uid,0);   // next id must stay above every id in use, or two items/minions would share one
  g.inv.concat(Object.values(g.equip),...g.army.map(m=>m.eq?Object.values(m.eq):[])).forEach(it=>{ if(it) top=Math.max(top,it.u); });
  g.army.forEach(m=>{ top=Math.max(top,num(m.uid,0)); }); g.army.forEach(m=>{ if(typeof m.uid!=='number') m.uid=++top; });
  g.raids=RA.map((x,i)=>Object.assign({di:x.di,day:Math.floor(num(x.day,g.day)),units:g.army.filter(m=>m._raid===i)},Array.isArray(x.res)?{res:x.res.filter(u=>typeof u==='number')}:{},typeof x.odds==='number'&&isFinite(x.odds)?{odds:clamp(x.odds,RAID_MIN,RAID_MAX)}:{},BREWS[x.bn]?{bn:x.bn}:{},expFix(x))).filter(x=>x.units.length);   /* expeditions (game-exp.js) */
  for(const k of ['reserve','waiting']) g[k]=g.army.filter(m=>m._raid===k);
  g.army=g.army.filter(m=>m._raid==null); g.raids.forEach(x=>x.units.forEach(m=>{ delete m._raid; })); g.reserve.concat(g.waiting).forEach(m=>{ delete m._raid; });
  g.raidOrders=Array.isArray(g.raidOrders)?g.raidOrders.filter(o=>obj(o)&&RK[o.di]&&fin(o.cu)&&Array.isArray(o.uids)).map(o=>Object.assign({di:o.di,day:Math.floor(num(o.day,g.day)),cu:o.cu,uids:o.uids.filter(fin).slice(0,12)},BREWS[o.bn]&&BREWS[o.bn].kind==='banner'?{bn:o.bn}:{},expOrderFix(o))):[];   // tonight's raid orders: uids only (the squad stays in the army until nightfall)
  g.raidLog=Array.isArray(g.raidLog)?g.raidLog.filter(x=>obj(x)&&RK[x.di]&&typeof x.nick==='string').slice(0,RAID_LOG).map(x=>({day:Math.floor(num(x.day,1)),di:x.di,won:!!x.won,nick:cleanNick(x.nick)||'Nameless',lost:Math.max(0,Math.floor(num(x.lost,0))),...(EXP_TARGETS.includes(x.k)?{k:x.k,nights:x.nights===2?2:1}:{})})):[];
  g.abbey=abbeyFix(g.abbey);   /* Vane Abbey's door (game-abbey.js) */
  townFix(g); dreadFix(g);   /* dread, orders, unpaid upkeep (game-dread.js) */   /* building levels, specializations, kept bodies (game-town2.js) */
  endingFix(g);   /* the last page, the endings and the inscriptions (game-abbey.js) */
  g.rift=obj(g.rift)?Object.assign({},g.rift):{best:0}; riftFix(g);   /* sigils, shards, guardians (game-rift.js) */
  g.uid=top; g.mode='town'; g.run=null;
  g.gold=Math.max(0,Math.floor(num(g.gold,0)));
  const tr={}; if(obj(g.trophies)) for(const k in g.trophies){ const n=Math.floor(num(g.trophies[k],0)); if(TROPHY[k]&&n>0) tr[k]=n; } g.trophies=tr;
  const b=obj(g.belt)?g.belt:{}; g.belt={}; const bf=obj(g.build)?Math.floor(num(g.build.forge,0)):0, bm=Math.min(BELT_CAP,BELT_MAX+(bf>=2?1:0)+(bf>=3?1:0)); DRINK_IDS.forEach(k=>{ const n=clamp(Math.floor(num(b[k],0)),0,bm); if(n||POTIONS[k]||b[k]!=null) g.belt[k]=n; });   /* draughts only once brewed */ brewFix(g);   /* the stash, run prep, commissions, the black market (game-brew.js) */
  if('ti' in g&&!obj(g.ti)) g.ti={};   // deed counters, earned titles {id:day}, cleared gates, the worn title, fusion compounds found
  if(obj(g.ti)){ const T=g.ti; for(const k in T) if(!['got','clr','sel','compounds'].includes(k)&&!(fin(T[k])||T[k]===true)) delete T[k];
    for(const k of ['got','clr']) if(k in T&&!obj(T[k])) T[k]={}; if(T.got) for(const k in T.got) if(!(fin(T.got[k])&&T.got[k]>0)) delete T.got[k];
    if('sel' in T&&T.sel!==null&&typeof T.sel!=='string') delete T.sel;
    if('compounds' in T) T.compounds=Array.isArray(T.compounds)?T.compounds.filter((c,i,a)=>COMPOUND[c]&&a.indexOf(c)===i):[]; }
  g.tips=obj(g.tips)?g.tips:{}; g.ngp=Math.max(0,Math.floor(num(g.ngp,0)));
  g.pacts=g.ngp?cleanPacts(g.pacts):[]; ascFix(g); runesFix(g); armyFix(g); if(!PATHS[P.capPath]) delete P.capPath;   // New Game+ pacts and the chosen capstone path (src/game-progression.js)
  g.firstRaise=('firstRaise' in g)?(g.firstRaise?1:0):(g.army.length||g.raids.length||g.reserve.length||(obj(g.ti)&&g.ti.raised)||g.runs||(Array.isArray(g.hist)&&g.hist.length)||(obj(g.life)&&g.life.runs)||g.day>1||P.lvl>1||g.ngp?0:1);   // saves from before the sure first raise: any army, history or progress counts as having raised already
  g.bagLv=clamp(Math.floor(num(g.bagLv,0)),0,BAG_COST.length); g.salts=clamp(Math.floor(num(g.salts,0)),0,SALT_MAX);
  g.shop=(obj(g.shop)&&typeof g.shop.day==='number'&&Array.isArray(g.shop.stock)&&g.shop.stock.every(s=>s&&ITEM[s.id]))?g.shop:null;
  const fixRo=it=>{ if(!obj(it)) return; if(Array.isArray(it.ro)) it.ro=it.ro.filter(r=>Array.isArray(r)&&ROLL_KEYS[r[0]]&&typeof r[1]==='number'&&isFinite(r[1])&&r[1]>0).slice(0,3).map(r=>[r[0],Math.round(r[1])]);
    if(!Array.isArray(it.ro)||!it.ro.length||ITEM[it.id].uq) delete it.ro; if(it.lk!==true) delete it.lk;
    if('tp' in it){ const t=Math.floor(num(+it.tp,0)); if(t>0&&!ITEM[it.id].uq) it.tp=Math.min(t,99); else delete it.tp; }   // tp: times tempered
    if('aw' in it){ const a=Math.floor(num(+it.aw,0)); if(a>0&&ITEM[it.id].uq) it.aw=Math.min(a,AWAKEN_MAX); else delete it.aw; } };   // aw: awakening ranks, uniques only
  g.inv.concat(Object.values(g.equip),...g.army.concat(g.reserve,g.waiting,...g.raids.map(x=>x.units)).map(m=>m.eq?Object.values(m.eq):[]),g.shop?g.shop.stock:[]).forEach(fixRo);
  delete P.dots; delete P.st; delete P.debuff; g.army.forEach(m=>{ delete m.dots; delete m.st; });   // status effects only live inside a fight
  g.mod=(obj(g.mod)&&typeof g.mod.day==='number'&&typeof g.mod.gi==='number'&&(g.mod.gi<0||(MODS[g.mod.id]&&RK[g.mod.gi])))?{day:g.mod.day,gi:g.mod.gi,id:g.mod.gi<0?null:g.mod.id}:null;
  const so=obj(g.story)?g.story:{}; g.story={}; for(const k in so) if(STORY_BY[k]&&typeof so[k]==='number') g.story[k]=so[k];
  g.hist=Array.isArray(g.hist)?g.hist.filter(h=>obj(h)&&fin(h.d)&&['cleared','fell','fled','left'].includes(h.res)&&(h.g<0||RK[h.g])).slice(-HIST_N):[];   // g: the gate, -1 for the Tower
  g.hist.forEach(h=>{ for(const k of ['d','rooms','kills','xp','gold','items','raised','f0','f1','rift','trial']) if(k in h) h[k]=Math.max(0,Math.floor(num(h[k],0))); });   // shown in the History table
  g.hist.forEach(h=>{ if('sec' in h&&secretOf(h.sec)<0) delete h.sec; if('heat' in h&&!HEAT[h.heat]) delete h.heat; });
  g.hist.forEach(h=>{ for(const k of ['bo','mvp']) if(k in h&&!(Array.isArray(h[k])&&typeof h[k][0]==='string')) delete h[k]; for(const k of ['om','m2']) if(k in h&&typeof h[k]!=='string') delete h[k]; for(const k of ['tt','lv','dd','mh','dt']) if(k in h&&!(typeof h[k]==='number'&&h[k]>=0)) delete h[k]; if('fb' in h&&!(obj(h.fb)&&typeof h.fb.k==='string')) delete h.fb; });   // the details of newer runs; older runs simply lack them
  const L=obj(g.life)?g.life:{}; g.life={}; for(const k of LIFE_KEYS) g.life[k]=Math.max(0,num(L[k],0));
  if(!obj(g.build)) g.build={}; for(const k of Object.keys(g.build)){ const v=g.build[k]; if(!BUILD[k]||typeof v!=='number'||!(v>=1)) delete g.build[k]; else g.build[k]=Math.min(BUILD_MAX,Math.floor(v)); }
  g.dust=Math.max(0,Math.floor(num(g.dust,0)));
  faithFix(g); omenNextFix(g);   /* the pantheon; an old two-oath faith converts (game-pantheon.js) */
  if(g.rec!==undefined){ if(!obj(g.rec)) delete g.rec; else { const R0=g.rec, okv=o=>obj(o)&&typeof o.v==='number'&&o.v>0&&typeof o.day==='number';
    for(const k of REC_NUM) if(k in R0&&!okv(R0[k])) delete R0[k];
    if('riftF' in R0){ if(!obj(R0.riftF)) delete R0.riftF; else for(const m of Object.keys(R0.riftF)){ const o=R0.riftF[m]; if(!(+m>=1)||!obj(o)||!(o.t>0)||typeof o.day!=='number'||!(o.d>=+m)) delete R0.riftF[m]; } }
    if('fast' in R0){ if(!obj(R0.fast)) delete R0.fast; else for(const di of Object.keys(R0.fast)){ const o=R0.fast[di]; if(!RK[di]||!obj(o)||!(o.t>0)||typeof o.day!=='number') delete R0.fast[di]; } }
    if('sec' in R0){ if(!obj(R0.sec)) delete R0.sec; else for(const i of Object.keys(R0.sec)) if(!SECRET[i]||typeof R0.sec[i]!=='number') delete R0.sec[i]; }
    for(const k of Object.keys(R0)) if(!REC_NUM.includes(k)&&!['fast','sec','riftF'].includes(k)) delete R0[k]; } }
  if(g.pages!==undefined) g.pages=Math.max(0,Math.min(LORE_PAGES.length,Math.floor(num(g.pages,0))));
  if(g.omen!==undefined&&!(obj(g.omen)&&typeof g.omen.day==='number'&&(g.omen.id===null||OMENS[g.omen.id]))) delete g.omen;
  if(g.sbPity!==undefined){ if(!obj(g.sbPity)) delete g.sbPity; else for(const di of Object.keys(g.sbPity)){ const v=g.sbPity[di]; if(!RK[di]||typeof v!=='number'||!(v>=0)) delete g.sbPity[di]; else g.sbPity[di]=Math.min(1000,Math.floor(v)); } }
  for(const k of ['heat','heatMax']){ if(!obj(g[k])) g[k]={}; for(const di of Object.keys(g[k])){ const v=g[k][di]; if(!RK[di]||typeof v!=='number'||!(v>=0)) delete g[k][di]; else g[k][di]=Math.min(HEAT.length-1,Math.floor(v)); } }
  { const q=obj(g.siege)?g.siege:{}; g.siege={next:Math.max(0,Math.floor(num(q.next,0))),pending:!!q.pending,dmg:BUILD[q.dmg]&&g.build[q.dmg]>=1?q.dmg:null,warned:Math.max(0,Math.floor(num(q.warned,0)))};
    if(g.siege.pending){ if(BUILD[q.guard]&&g.build[q.guard]>=1) g.siege.guard=q.guard; if(Array.isArray(q.wall)) g.siege.wall=q.wall.filter(u=>Number.isInteger(u)).slice(0,SIEGE_WALL); }
    stierFix(g.siege,q); g.siege=keepOrder(q,g.siege); }   /* tier, streak, tonight's wall (game-siege2.js) */   // tonight's guard and wall survive a reload   // sieges: old saves get a first one scheduled on load (siegeTick)
  { const c=g.player.cmd; if(!hadCmd||!(obj(c)&&c.a>=0&&c.h>=0&&isFinite(c.a)&&isFinite(c.h))) g.player.cmd=cmdPow(Array.isArray(g.army)?g.army:[]); else g.player.cmd={a:Math.round(c.a),h:Math.round(c.h)}; }   // Command: an old or damaged save measures its army again
  const okB=b=>obj(b)&&BOUNTIES[b.id]&&typeof b.n==='number'&&typeof b.base==='number'&&obj(b.rw)&&typeof b.claimed==='boolean';
  g.bounty=(obj(g.bounty)&&typeof g.bounty.day==='number'&&Array.isArray(g.bounty.list)&&g.bounty.list.every(okB))?g.bounty:null;
  memorialFix(g); nemFix(g); modesFix(g); codeFix(g); loadoutsFix(g); rivalFix(g); g.ally=allyFix(g.ally); trialsFix(g); bondsFix(g); chainsFix(g);
  return g;
}
function validSave(g){ return !!normalizeSave(g); }
// Make a repaired save the live game. Throws if something is still wrong; callers restore the previous game.
function applyLoaded(g){
  S=g; syncArmy();
  const P=S.player; P.hp=P.hp>0?Math.min(P.hp,pMax()):pMax(); P.mana=clamp(P.mana,0,pMana());
  S.army.forEach(m=>{ m.hp=clamp(m.hp,1,m.maxHp); }); benched().forEach(m=>{ m.hp=m.maxHp; });   // benched minions rest at full health
  if(!isFinite(pMax())||S.army.concat(benched()).some(m=>!isFinite(m.maxHp)||!isFinite(m.atk))) throw new Error('bad numbers');
  if(S.watches<=0) endDay();   // closed the tab after spending the last watch: the day ends as it would on leaving (a pending siege starts again)
  else siegeTick();   /* the rival's schedule waits for dawn or a clear: loading never changes the game */
}
function slotRead(i){ try{ const r=localStorage.getItem(slotKey(i)); if(!r) return null; const g=JSON.parse(r); return validSave(g.data)?g:null; }catch(e){ return null; } }
function slotWrite(i){ if(S.mode!=='town'||ironOn()) return false;   /* Ironman: no slots (game-modes.js) */ try{ S.savedAt=Date.now(); localStorage.setItem(slotKey(i),JSON.stringify({t:Date.now(),data:S})); return true; }catch(e){ return false; } }
function slotDelete(i){ try{ localStorage.removeItem(slotKey(i)); }catch(e){} }
function adoptSave(g){   // load a slot or code; on any problem the current game is left exactly as it was
  const n=normalizeSave(g); if(!n) return false;
  const prev=S;
  try{ applyLoaded(n); }catch(e){ S=prev; return false; }
  save(); return true;
}
function slotLoad(i){ const g=slotRead(i); return g?adoptSave(g.data):false; }
function exportCode(){ try{ return CODE_TAG+btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }catch(e){ return ''; } }
function importCode(txt){
  try{ txt=(txt||'').replace(/\s+/g,''); if(txt.indexOf(CODE_TAG)!==0) return false;
    const g=JSON.parse(decodeURIComponent(escape(atob(txt.slice(CODE_TAG.length))))); return adoptSave(g);
  }catch(e){ return false; }
}
function storageOk(){ try{ localStorage.setItem('lotd-test','1'); localStorage.removeItem('lotd-test'); return true; }catch(e){ return false; } }
function loadGame(){
  let raw=null;
  try{ raw=localStorage.getItem(SAVE_KEY); }catch(e){}
  if(raw){
    try{ const g=normalizeSave(JSON.parse(raw)); if(g){ applyLoaded(g); return; } }catch(e){}
    try{ localStorage.setItem(SAVE_KEY+'-broken',raw); }catch(e){}   // never throw an unreadable save away
  }
  newGame();
  if(raw) notify('Your saved game could not be read, so a new one was started. The old data was kept in this browser under "'+SAVE_KEY+'-broken".','bad');
}

// ===== TITLES =====
// Earned once, kept forever, worn under your name. Purely cosmetic.
const GATE_TITLES=['Ratcatcher','Tidekeeper','Ashwalker','Choirbreaker','Orchard Reaper','Heir of the Ash Throne'];
const TW_TITLES=['Houndbreaker','Ember-Quencher','Heretic Unburnt','Swarmbane','Silencer of Hymns','The Unchained','Axe-Unbowed','Archdevil-Slayer','Halo-Breaker','King of Hell'];
const TITLES=[];
DUNGEONS.slice(0,GATE_N).forEach((D,i)=>TITLES.push({id:'g'+i,grp:'Gates',name:GATE_TITLES[i],req:'Clear the '+D.name+' ('+RANKS[i]+'-rank gate).',ok:()=>!!S.ti.clr[i]}));
TW_TITLES.forEach((n,i)=>{ const f=(i+1)*10; TITLES.push({id:'t'+f,grp:'Hell Tower',name:n,req:'Defeat '+TW_BOSS[i]+' on floor '+f+'.',ok:()=>S.tower.best>=f}); });
[
 ['d_raise1','First Whisper','Raise your first minion.',()=>S.ti.raised>=1],
 ['d_raise50','Gravecaller','Raise 50 minions.',()=>S.ti.raised>=50],
 ['d_raise200','Voice of the Legion','Raise 200 minions.',()=>S.ti.raised>=200],
 ['d_army','Warlord of the Dead','Fill every slot in your army.',()=>S.army.length>0&&armyUsed()>=slots()],
 ['d_kill100','Reaper\'s Apprentice','Defeat 100 enemies.',()=>totalKills()>=100],
 ['d_kill1000','Harvester','Defeat 1,000 enemies.',()=>totalKills()>=1000],
 ['d_kill5000','Plague of Graves','Defeat 5,000 enemies.',()=>totalKills()>=5000],
 ['d_lv10','Initiate of the Ledger','Reach level 10.',()=>S.player.lvl>=10],
 ['d_lv25','Gravewalker Adept','Reach level 25.',()=>S.player.lvl>=25],
 ['d_lv50','Lord of Graves','Reach level 50.',()=>S.player.lvl>=50],
 ['d_uq','Touched by Legend','Hold a unique item.',()=>S.ti.hasUq],
 ['d_tuq','Relic-Lord of Hell','Claim all 12 Hell Tower uniques.',()=>TW_UNIQ.every((u,i)=>S.tower.got['w'+(i+1)])],
 ['d_study','Student of the Dead','Study an enemy (25 kills) and learn its drops.',()=>Object.keys(S.kills).some(k=>S.kills[k]>=KNOW_AT)],
 ['d_all','Keeper of the Ledger','Study every enemy in the gates and the Tower (the wardens excepted).',()=>allNames().filter(n=>!TW_BOSS.includes(n)).every(n=>(S.kills[n]||0)>=KNOW_AT)],
 ['d_death','Rises Again','Be dragged out of a dungeon after falling.',()=>S.ti.deaths>=1],
 ['d_death10','Stubborn Corpse','Fall 10 times.',()=>S.ti.deaths>=10],
 ['d_quest7','Dutiful Scribe','Claim the daily quest reward 7 times.',()=>S.ti.claims>=7],
 ['d_armed1','Quartermaster','Raise a gear-bearing enemy.',()=>S.ti.armed>=1],
 ['d_armed3','Arms Master','Fully equip a gear-bearer with weapon, armor and relic.',()=>S.ti.fullGear],
 ['d_tower1','Tower-Touched','Enter the Hell Tower and clear a floor.',()=>S.tower.best>=1],
 ['d_tower50','Halfway Damned','Reach floor 50 of the Hell Tower.',()=>S.tower.best>=50],
 ['d_cancel','Frost-Tongue','Cancel a boss\'s telegraphed move by freezing it.',()=>S.ti.cancels>=1],
 ['d_cancel10','Breaker of Oaths','Cancel 10 boss moves.',()=>S.ti.cancels>=10],
 ['d_master','Masterwright','Forge a masterwork at the trophy forge.',()=>S.ti.master>=1],
 ['d_trophy500','Bone Merchant','Sell 500 trophies.',()=>S.ti.soldTro>=500],
 ['d_gold','Hoarder of Graves','Hold 5,000 gold at once.',()=>S.gold>=5000],
 ['d_bag','Bottomless Satchel','Upgrade your bag to its largest size.',()=>(S.bagLv||0)>=BAG_COST.length],
 ['d_altar','Altar-Blessed','Empower minions at the Bone Altar 25 times.',()=>S.ti.emp>=25],
 ['d_evolve','Shaper of Flesh','Evolve a minion.',()=>S.ti.evolved>=1],
 ['d_elder','Keeper of Elders','Evolve a minion into its Elder form.',()=>S.ti.elder>=1],
 ['d_tower110','Beyond the Throne','Reach floor 110 of the Hell Tower.',()=>S.tower.best>=110],
 ['d_tower150','Abyss-Walker','Reach floor 150 of the Hell Tower.',()=>S.tower.best>=150],
 ['d_ngp','Twice-Risen','Begin a New Game+.',()=>(S.ngp||0)>=1],
 ['d_ngp3','The Undying Ledger','Begin New Game+ 3.',()=>(S.ngp||0)>=3],
].forEach(a=>TITLES.push({id:a[0],grp:'Deeds',name:a[1],req:a[2],ok:a[3]}));
// 50 more titles: mastery of each gate, curses and events, skills, combat, trade, the army and endurance.
const T_=k=>(S.ti&&S.ti[k])||0, L_=k=>(S.life&&S.life[k])||0;
const roll3=()=>S.inv.concat(Object.values(S.equip)).some(it=>it&&ITEM[it.id]&&!ITEM[it.id].uq&&ITEM[it.id].tier===4&&it.ro&&it.ro.length>=3);
[
 ['m0','Gates','Warren-Born','Clear the Rat Warren 10 times.',()=>T_('clrN0')>=10,{constitution:1}],
 ['m1','Gates','Crypt-Keeper','Clear the Sunken Crypt 10 times.',()=>T_('clrN1')>=10,{intelligence:2}],
 ['m2','Gates','Ember-Tongued','Clear the Ashen Barrow 12 times.',()=>T_('clrN2')>=12,{strength:2}],
 ['m3','Gates','Cantor of Bones','Clear the Hollow Cathedral 12 times.',()=>T_('clrN3')>=12,{will:2}],
 ['m4','Gates','Orchard-Walker','Clear the Iron Orchard 15 times.',()=>T_('clrN4')>=15,{hpp:4}],
 ['m5','Gates','Throne-Breaker','Clear the Throne of Ash 25 times.',()=>T_('clrN5')>=25,{dmgp:4}],
 ['hd1','Gates','Hard-Won','Clear any gate on Hard.',()=>T_('heat1')>0,{xpp:2}],
 ['hd2','Gates','Unbowed','Clear any gate on Brutal.',()=>T_('heat2')>0,{drp:2}],
 ['nm0','Gates','Nightmare of the Warren','Clear the Rat Warren on Nightmare.',()=>T_('nm0')>0,{goldp:3}],
 ['nm1','Gates','Nightmare of the Crypt','Clear the Sunken Crypt on Nightmare.',()=>T_('nm1')>0,{manap:3}],
 ['nm2','Gates','Nightmare of the Barrow','Clear the Ashen Barrow on Nightmare.',()=>T_('nm2')>0,{hpp:2}],
 ['nm3','Gates','Nightmare of the Cathedral','Clear the Hollow Cathedral on Nightmare.',()=>T_('nm3')>0,{mpow:3}],
 ['nm4','Gates','Nightmare of the Orchard','Clear the Iron Orchard on Nightmare.',()=>T_('nm4')>0,{dmgp:2}],
 ['nm5','Gates','Nightmare Sovereign','Clear the Throne of Ash on Nightmare.',()=>T_('nm5')>0,{dmgp:2,hpp:2}],
 ['dm3','Gates','The Damned','Clear a cursed gate on Nightmare.',()=>T_('damned3')>0,{xpp:3,goldp:3}],
 ['sb0','Gates','Plague-Ender','Slay the Plague Matriarch, the Rat Warren\'s secret master.',()=>T_('secret_0')>0,{xpp:3}],
 ['sb1','Gates','Tide-Breaker','Slay the Drowned Abbot, the Sunken Crypt\'s secret master.',()=>T_('secret_1')>0,{manap:3}],
 ['sb2','Gates','Wyrmsbane','Slay the Cinder Wyrm, the Ashen Barrow\'s secret master.',()=>T_('secret_2')>0,{dmgp:2}],
 ['sb3','Gates','Last Note','Slay the Choir Eternal, the Hollow Cathedral\'s secret master.',()=>T_('secret_3')>0,{mpow:3}],
 ['sb4','Gates','Root-Burner','Slay the Rootking, the Iron Orchard\'s secret master.',()=>T_('secret_4')>0,{hpp:2}],
 ['sb5','Gates','The Named','Slay the Nameless Sovereign, the Throne of Ash\'s secret master.',()=>T_('secret_5')>0,{dmgp:3,drp:2}],
 ['tw75','Hell Tower','Ash-Climber','Reach floor 75 of the Hell Tower.',()=>S.tower.best>=75,{hpp:4}],
 ['tw200','Hell Tower','Lord of the Abyss','Reach floor 200 of the Hell Tower.',()=>S.tower.best>=200,{dmgp:8}],
 ['twruns','Hell Tower','Tower Regular','Climb the Hell Tower 50 times.',()=>T_('twRuns')>=50,{ward:5}],
 ['c_volatile','Curses and events','Ember-Proof','Clear a gate cursed with Volatile dead.',()=>T_('cur_volatile')>=1,{drp:2}],
 ['c_drought','Curses and events','Dry-Souled','Clear a gate cursed with Drought.',()=>T_('cur_drought')>=1,{regen:1}],
 ['c_fury','Curses and events','Fury-Tamer','Clear a gate cursed with Fury.',()=>T_('cur_fury')>=1,{drp:2}],
 ['c_five','Curses and events','Five Curses Broken','Clear a gate under each of Hunger, Mirror, Silent, Long and Thin.',()=>NEW_CURSES.every(k=>T_('cur_'+k)>=1),{xpp:4}],
 ['c_paid','Curses and events','Paid in Full','Settle the Rat King\'s debts.',()=>T_('paidFull')>=1,{goldp:5}],
 ['c_bulwark','Curses and events','Wallbreaker','Clear a gate cursed with Bulwark.',()=>T_('cur_bulwark')>=1,{dmgp:3}],
 ['c_horde','Curses and events','Horde-Reaper','Clear a gate cursed with Horde.',()=>T_('cur_horde')>=1,{mpow:4}],
 ['c_25','Curses and events','Curse-Eater','Clear 25 cursed gates.',()=>T_('cursed')>=25,{goldp:8}],
 ['e_shrine','Curses and events','Blood-Sworn','Feed 10 blood shrines.',()=>T_('shrine')>=10,{dmgp:3}],
 ['e_pedlar','Curses and events','Haggler','Buy from 10 wandering pedlars.',()=>T_('pedlar')>=10,{goldp:4}],
 ['e_coffer','Curses and events','Lockbreaker','Force open 15 sealed coffers.',()=>T_('coffer')>=15,{goldp:5}],
 ['e_trap','Curses and events','Needle-Scarred','Spring 5 coffer traps.',()=>T_('trap')>=5,{hp:20}],
 ['e_strag','Curses and events','Shepherd of Stragglers','Raise 10 wounded stragglers.',()=>T_('straggler')>=10,{raise:3}],
 ['s_poison','Deeds','Plaguebringer','Poison foes 200 times with Venomous minions.',()=>T_('poisoned')>=200,{mpow:3}],
 ['s_cure','Deeds','Bloodless','Cure bleeding, burns or poison 25 times.',()=>T_('cures')>=25,{hpp:3}],
 ['s_venom','Deeds','Venom-Keeper','Command a Venomous minion.',()=>S.army.some(m=>hasTrait(m,'venom')),{mpow:2}],
 ['p_25','Deeds','Tippler','Drink 25 potions.',()=>T_('drank')>=25,{hp:15}],
 ['p_100','Deeds','Alchemist\'s Friend','Drink 100 potions.',()=>T_('drank')>=100,{manap:5}],
 ['k_spear','Deeds','Spearwright','Hurl 100 Bone Spears.',()=>T_('sk_spear')>=100,{atk:3}],
 ['k_blast','Deeds','Corpse-Burster','Set off 50 Corpse Explosions.',()=>T_('sk_blast')>=50,{siph:4}],
 ['k_chill','Deeds','Frostbinder','Freeze 50 foes with Grave Chill.',()=>T_('frozen')>=50,{siph:3}],
 ['k_reap','Deeds','Reaper of Souls','Reap 100 times.',()=>T_('sk_reap')>=100,{dmgp:3}],
 ['k_master3','Deeds','Adept of Bones','Master three skills.',()=>Object.values(S.player.skills).filter(r=>r>=SK_MAX).length>=3,{intelligence:2}],
 ['k_all','Deeds','Fully Versed','Learn every skill.',()=>SKILLS.every(s=>sk(s.id)>0),{manap:4}],
 ['f_crit','Deeds','Keen Eye','Land 100 critical hits (you or your army).',()=>T_('crits')>=100,{crit:2}],
 ['f_crit1000','Deeds','Butcher\'s Eye','Land 1,000 critical hits.',()=>T_('crits')>=1000,{crit:4}],
 ['f_flawless','Deeds','Untouched','Clear a gate without losing any HP.',()=>T_('flawless')>=1,{ward:4}],
 ['f_last','Deeds','Last Breath','Win a room with 10% of your HP or less.',()=>T_('lastBreath')>=1,{drp:3}],
 ['f_boss25','Deeds','Giant-Slayer','Defeat 25 bosses or wardens.',()=>T_('bosses')>=25,{dmgp:3}],
 ['f_elite100','Deeds','Elite Hunter','Defeat 100 elites.',()=>T_('elites')>=100,{crit:2,goldp:2}],
 ['g_gold','Deeds','Merchant Prince','Find 50,000 gold in your runs.',()=>L_('gold')>=50000,{goldp:6}],
 ['g_items','Deeds','Collector','Find 200 pieces of gear.',()=>L_('items')>=200,{goldp:3}],
 ['g_reforge','Deeds','Reforger','Reforge gear 25 times.',()=>T_('reforged')>=25,{mana:15}],
 ['g_sold','Deeds','Junk Dealer','Sell 100 pieces of gear.',()=>T_('soldItems')>=100,{goldp:4}],
 ['g_roll3','Deeds','Fortune\'s Favourite','Own a Legendary with three bonus lines.',roll3,{xpp:3}],
 ['a_boss','Deeds','Kingmaker','Raise a boss.',()=>T_('raisedBoss')>=1,{mpow:3}],
 ['a_raise500','Deeds','Boneyard Lord','Raise 500 minions.',()=>T_('raised')>=500,{mpow:6}],
 ['a_traits','Deeds','Menagerie','Command minions with every common trait at once.',()=>TRAIT_IDS.every(t=>S.army.some(m=>hasTrait(m,t))),{mpow:4}],
 ['a_elders','Deeds','Elder Council','Command three Elder minions at once.',()=>S.army.filter(m=>m.stage>=2).length>=3,{mpow:5}],
 ['a_raid1','Deeds','Absent Warlord','Win a raid led by a Commander.',()=>T_('raidWins')>=1,{goldp:4}],
 ['a_raid25','Deeds','General of the Dead','Win 25 raids.',()=>T_('raidWins')>=25,{mpow:5,goldp:4}],
 ['x_long','Deeds','Long Road','Bring a squad home whole from an expedition of two nights.',()=>T_('expLong')>=1,{goldp:4}],
 ['x_hunt','Deeds','Hunt Master','Come home from 10 hunts with spoils.',()=>T_('exp_hunt')>=10,{dmgp:4}],
 ['x_clean','Deeds','Not a Scratch','Come home from 20 expeditions with spoils and no one lost.',()=>T_('expClean')>=20,{mpow:5}],
 ['x_rally','Deeds','Rallying Cry','Rally your dead 100 times.',()=>T_('rallies')>=100,{mpow:4,dmgp:3}],
 ['r_stakes','Deeds','High Stakes','Win 5 wagers against the rival.',()=>T_('wagerWins')>=5,{goldp:4,mpow:3}],
 ['r_reclaim','Deeds','Reclaimer','Win back 10 bodies the rival stole.',()=>T_('reclaimed')>=10,{mpow:5}],
 ['r_end','Deeds','Last Word','End the rival after the Reckoning.',()=>T_('rivalEnded')>=1,{dmgp:4,mpow:3}],
 ['r_spare','Deeds','Mercy in Red Ink','Spare the rival after the Reckoning.',()=>T_('rivalSpared')>=1,{hpp:4,mpow:3}],
 ['r_clean','Deeds','Not in Their Book','Finish the rival\'s story with fewer than 5 bodies ever stolen.',()=>T_('arcClean')>=1,{raise:4}],
 ['f_hon','Deeds','Bearer of the Last Light','Reach rank 5 with Morrow.',()=>T_('r5_hon')>=1,{hpp:3,mpow:2}],
 ['f_vesh','Deeds','Child of the Cold Mother','Reach rank 5 with Vesh.',()=>T_('r5_vesh')>=1,{siph:4}],
 ['f_ulm','Deeds','Keeper of the Furrow','Reach rank 5 with Ulm.',()=>T_('r5_ulm')>=1,{goldp:4,raise:2}],
 ['f_choir','Deeds','Voice of the Choir','Reach rank 5 with the Hollow Choir.',()=>T_('r5_choir')>=1,{mpow:5}],
 ['f_dis','Deeds','Wholly Profane','Reach rank 5 on the Profane path.',()=>T_('r5_dis')>=1,{dmgp:4}],
 ['f_godless','Deeds','Godless','Finish a cycle on the Profane path (begin New Game+ while Profane).',()=>T_('godless')>=1,{dmgp:3,goldp:3}],
 ['f_turncoat','Deeds','Turncoat','Convert to another god at their shrine 3 times.',()=>T_('converted')>=3,{xpp:3}],
 ['f_weather','Deeds','Weather-Maker','Have your god call 20 omens.',()=>T_('godCalls')>=20,{goldp:3,xpp:2}],
 ['r_5','Deeds','Rift-Walker','Clear depth 5 of the Rift.',()=>riftBest()>=5,{dmgp:4}],
 ['r_15','Deeds','Riftborn','Clear depth 15 of the Rift.',()=>riftBest()>=15,{dmgp:5,hpp:4}],
 ['r_30','Deeds','Lord of the Torn Sky','Clear depth 30 of the Rift.',()=>riftBest()>=30,{dmgp:6,mpow:6}],
 ['as_3','Deeds','Ascendant III','Reach ascension level 3 (New Game+ 3).',()=>(S.ngp||0)>=3,{xpp:3,goldp:3}],
 ['as_6','Deeds','Ascendant VI','Reach ascension level 6.',()=>(S.ngp||0)>=6,{xpp:4,goldp:4}],
 ['as_10','Deeds','Ascendant X','Reach ascension level 10.',()=>(S.ngp||0)>=10,{xpp:5,goldp:5}],
 ['as_all','Deeds','Every Rule','Choose every ascension rule once.',()=>ASC_IDS.every(k=>S.ti&&S.ti['asc_'+k]),{dmgp:4,hpp:4}],
 ['as_rw','Deeds','Rewritten','Clear six gates the Ledger wrote over (one a cycle).',()=>T_('rewritten')>=6,{dmgp:3,goldp:3}],
 ['b_haul','Deeds','Long Haul','Win a fight that lasts '+LONG_HAUL+' turns or more.',()=>T_('longHaul')>=1,{hpp:3}],
 ['b_five','Deeds','Five by Five','Rank every skill of one path to 3.',()=>fiveByFive(),{dmgp:3,xpp:2}],
 ['b_runes','Deeds','Runesmith','Find all 16 skill runes.',()=>Array.isArray(S.runes)&&S.runes.length>=16,{dmgp:3,manap:3}],
 ['b_sgn','Deeds','Signature','Cast your signature 100 times.',()=>T_('sgnCast')>=100,{dmgp:3}],
 ['ar_charmed','Deeds','Charmed','Make a charm of each of the sixteen kits.',()=>KIT_IDS.every(k=>T_('chK_'+k)>=1),{mpow:6}],
 ['ar_hundred','Deeds','Hundred Kills','Have a minion take 100 lives.',()=>T_('nameLines')>=1,{mpow:4}],
 ['ar_tennames','Deeds','Ten Names','Write ten names into the Ledger.',()=>Array.isArray(S.nameLines)&&S.nameLines.length>=10,{mpow:8}],
 ['ar_witch','Deeds','Witch-Keeper','Raise a hexer to Eternal.',()=>S.army.concat(S.reserve||[]).some(m=>m.role==='hexer'&&(m.stage||0)>=STAGE_MAX),{mpow:5}],
 ['ar_roles','Deeds','Every Role','Field all five roles at Elder or above at once.',()=>Object.keys(ROLES).every(r=>S.army.some(m=>m.role===r&&(m.stage||0)>=2)),{mpow:6}],
 ['ar_order','Deeds','By My Order','Use 500 Elder actives.',()=>T_('actives')>=500,{mpow:5}],
 ['nm_1','Deeds','Avenger I','Kill a nemesis.',()=>T_('nemSlain')>=1,{mpow:2}],
 ['nm_5','Deeds','Avenger II','Kill 5 nemeses.',()=>T_('nemSlain')>=5,{mpow:4}],
 ['nm_15','Deeds','Avenger III','Kill 15 nemeses.',()=>T_('nemSlain')>=15,{mpow:6}],
 ['nm_old','Deeds','Old Grudge','Kill a nemesis that has lived four weeks.',()=>T_('nemOld')>=1,{mpow:4}],
 ['r_six','Deeds','Six Guardians','Fell all six guardians of the Rift.',()=>GUARDIANS.every((g,i)=>!!(S.rift&&S.rift.gk&&S.rift.gk[i])),{dmgp:3,hpp:3}],
 ['r_sigil3','Deeds','Fully Sigiled','Clear depth 20 of the Rift or deeper with three sigils.',()=>T_('sig3_20')>=1,{mpow:4}],
 ['r_weekly','Deeds','Weekly Diver','Set 10 weekly dive bests.',()=>T_('weekBests')>=10,{xpp:3}],
 ['r_attuned','Deeds','Attuned','Attune a Riftborn piece to depth 50.',()=>T_('rb50')>=1,{hpp:4}],
 ['r_half','Deeds','Other Half','Read all four fragments of the other half in the Rift.',()=>fragN()>=RIFT_FRAGS.length,{mpow:3,xpp:2}],
 ['a_ancient','Deeds','Bones of Ages','Evolve a minion into an Ancient.',()=>T_('ancient')>=1,{mpow:4}],
 ['a_eternal','Deeds','The Undying Court','Evolve a minion into an Eternal.',()=>T_('eternal')>=1,{mpow:6,hpp:3}],
 ['e_day100','Deeds','Centurion of Days','Reach day 100.',()=>S.day>=100,{xpp:4}],
 ['e_runs100','Deeds','Veteran','Go on 100 runs.',()=>L_('runs')>=100,{hp:25}],
 ['e_rooms1000','Deeds','Thousand Rooms','Win 1,000 rooms.',()=>L_('rooms')>=1000,{hpp:4}],
 ['e_lv75','Deeds','Deathless Sage','Reach level 75.',()=>S.player.lvl>=75,{hpp:5,manap:5}],
].forEach(a=>TITLES.push({id:a[0],grp:a[1],name:a[2],req:a[3],ok:a[4],b:a[5]}));
// 24 more: gates, the Tower and the Rift, the army and fusion, omens, bestiary mastery and collection milestones.
// Records (S.rec) and deed counters (S.ti) both survive New Game+, so these do too. Omens are read by id at check time,
// so the omen titles follow whatever omens exist.
const recFast=n=>Object.values((S.rec&&S.rec.fast)||{}).some(o=>o&&o.t<=n);
const masteredN=ids=>allNames().filter(n=>{ const t=masteryOf(n); return !!t&&ids.includes(t.id); }).length;
[
 ['x_clr100','Gates','Gatewarden','Clear 100 gates.',()=>L_('clears')>=100,{goldp:4}],
 ['x_allgates','Gates','Walker of Every Gate','Clear every gate 10 times.',()=>Math.min(...DUNGEONS.slice(0,GATE_N).map((D,i)=>T_('clrN'+i)))>=10,{xpp:3}],
 ['x_swift','Gates','Swift Reaper','Clear a gate in 16 turns or fewer.',()=>recFast(16),{crit:2}],
 ['x_flaw10','Gates','Untouchable','Clear 10 gates or Rift dives without losing any HP.',()=>T_('flawless')>=10,{drp:3}],
 ['x_streak10','Gates','Unbroken Chain','Win 10 runs in a row.',()=>recV('streak')>=10,{dmgp:3}],
 ['x_tw10','Hell Tower','Stairs of Cinders','Climb 10 Tower floors in one run within 75 turns.',()=>{ const o=S.rec&&S.rec.tw10; return !!o&&o.v<=75; },{hpp:3}],
 ['x_floors500','Hell Tower','Stair-Worn','Clear 500 Tower floors.',()=>T_('floors')>=500,{ward:4}],
 ['x_abyss','Hell Tower','Abyssal Sovereign','Reach floor 150 of the Hell Tower and depth 30 of the Rift.',()=>S.tower.best>=150&&riftBest()>=30,{dmgp:3,drp:2}],
 ['x_rift25','Deeds','Sky-Torn','Dive into the Rift 25 times.',()=>T_('riftRuns')>=25,{manap:4}],
 ['x_rift50','Deeds','Warden of the Tear','Clear 50 Rift dives.',()=>T_('rifts')>=50,{hpp:3}],
 ['x_riftfast','Deeds','Rift-Runner','Clear a Rift dive of depth 10 or deeper in 25 turns or fewer.',()=>riftFastBest(10)<=25,{dmgp:3}],
 ['x_fuse10','Deeds','Flesh-Weaver','Fuse minions 10 times.',()=>T_('fused')>=10,{mpow:3}],
 ['x_ftr','Deeds','Architect of Bones','Fuse a minion that carries 3 traits.',()=>{ return recV('ftr')>=FUSE_TRAITS; },{mpow:4}],
 ['x_mlv50','Deeds','Bonelord Ascendant','Raise a minion to level 50.',()=>recV('mlv')>=50,{mpow:4}],
 ['x_omen1','Curses and events','Omen-Born','Survive a run under an omen.',()=>T_('omenRuns')>=1,{xpp:2}],
 ['x_omen25','Curses and events','Omen-Reader','Win 25 runs under an omen.',()=>T_('omenWins')>=25,{drp:2}],
 ['x_omenall','Curses and events','Herald of Every Sign','Survive a run under every kind of omen.',()=>{ return OMEN_NAT.every(id=>T_('om_'+id)>=1); },{goldp:4}],
 ['x_eclipse','Curses and events','Lord of the Eclipse','Win 5 runs under the Eclipse.',()=>{ return OMENS.eclipse?T_('omw_eclipse')>=5:T_('omenWins')>=15; },{dmgp:2,mpow:2}],
 ['x_mastered25','Deeds','Ledger-Scholar','Bring 25 kinds of foe to Mastered or better in the bestiary.',()=>masteredN(['mastered','ledgered'])>=25,{xpp:3}],
 ['x_ledger10','Deeds','Master of the Bestiary','Bring 10 kinds of foe to Ledgered in the bestiary.',()=>masteredN(['ledgered'])>=10,{dmgp:3}],
 ['x_relics','Deeds','Collector of Relics','Hold 6 different unique items at once.',()=>ownedUniques().length>=6,{goldp:4}],
 ['x_hoard','Deeds','Gilded Ossuary','Hold 25,000 gold at once.',()=>recV('held')>=25000,{goldp:4}],
 ['x_titles50','Deeds','Keeper of Names','Earn 50 titles.',()=>titlesGot()>=50,{goldp:3}],
 ['x_titles100','Deeds','Grand Ledger-Keeper','Earn 100 titles.',()=>titlesGot()>=100,{xpp:5}],
 ['k_reader','Deeds','Kit-Reader','Meet all 16 foe kits.',()=>KIT_IDS.every(k=>T_('ks_'+k)>0),{drp:2}],
 ['k_weak','Deeds','Weakness Hunter','Kill 500 foes with damage they are weak to.',()=>T_('weakK')>=500,{dmgp:3}],
 ['k_defuse','Deeds','Defuser','Kill 25 Bombers while frozen, with frost, Reap or Execute, so they cannot burst.',()=>T_('defused')>=25,{hpp:3}],
 ['k_gcbane','Deeds','Gravedigger\'s Bane','Kill 50 Gravecallers before they call anyone back.',()=>T_('gcBane')>=50,{xpp:3}],
 ['b_ub0','Deeds','Rat-Proof','Beat the Rat King through his Crown of Rats (Hard or harder) without a minion falling in his second phase.',()=>T_('ub_0')>0,{hpp:2}],
 ['b_ub1','Deeds','The Watch Outlasted','Beat the Crypt Warden through The Last Watch without a minion falling in his second phase.',()=>T_('ub_1')>0,{drp:2}],
 ['b_ub2','Deeds','Unburnt','Beat the Ember Knight through Let It Burn without a minion falling in his second phase.',()=>T_('ub_2')>0,{dmgp:2}],
 ['b_ub3','Deeds','The Choir Unanswered','Beat the Bishop of Teeth through The Choir Answers without a minion falling in his second phase.',()=>T_('ub_3')>0,{manap:3}],
 ['b_ub4','Deeds','Root and Branch','Beat the Orchard Mother through Bloom without a minion falling in her second phase.',()=>T_('ub_4')>0,{mpow:3}],
 ['b_ub5','Deeds','The Edict Unwritten','Beat the Pale Sovereign through What the Book Gave Me without a minion falling in his second phase.',()=>T_('ub_5')>0,{dmgp:3}],
 ['b_ten','Deeds','Ten Faces','Beat each of the ten Tower wardens after it has shown you its signature move.',()=>[0,1,2,3,4,5,6,7,8,9].every(i=>T_('tf_'+i)>0),{drp:3}],
 ['a_river','Gates','Riverturner','Open Vane Abbey, the seventh gate.',()=>!!(S.abbey&&S.abbey.open),{hpp:3}],
 ['a_script','Gates','Scriptor','Cross out a name in the Scriptorium of Vane Abbey.',()=>T_('scriptor')>0,{mpow:4}],
 ['a_echo','Deeds','Echo-Breaker','Beat the Hunger\'s second phase without a minion of yours falling in it.',()=>T_('echoBreak')>0,{drp:3}],
 ['a_unwritten','Gates','Unwritten','Beat the Hunger on Nightmare.',()=>T_('nm6')>0,{dmgp:4,drp:3}],
 ['a_seven','Gates','Seven Seals','Clear all seven gates, Vane Abbey too.',()=>DUNGEONS.every((D,i)=>!!(S.ti&&S.ti.clr&&S.ti.clr[i])),{dmgp:4,hpp:4}],
 ['a_keeper','Deeds','The Last Keeper','Close the book: write your own name on the last page.',()=>endedAs('closed'),{hpp:4,drp:2}],
 ['a_hand','Deeds','The Hand That Writes','Keep writing: turn the last page and go on.',()=>endedAs('kept'),{dmgp:4,mpow:4}],
 ['a_both','Deeds','Both Endings','End one cycle each way.',()=>endedAs('closed')&&endedAs('kept'),{xpp:5,goldp:5}],
 ['i_keeper','Deeds','Iron Keeper','Clear the Throne of Ash in an Ironman game.',()=>ironOn()&&!!(S.ti.clr&&S.ti.clr[5]),{hpp:4,drp:2}],
 ['i_book','Deeds','Iron Book','End a cycle in an Ironman game.',()=>ironOn()&&(endedAs('closed')||endedAs('kept')),{dmgp:4,xpp:3}],
 ['i_climb','Deeds','Iron Climb','Reach Hell Tower floor 100 in an Ironman game.',()=>ironOn()&&S.tower.best>=100,{mpow:4,hpp:3}],
 ['s_unburnt','Deeds','The Unburnt','Break the Inquisition\'s Purge.',()=>T_('purgeWon')>0,{drp:3,hpp:3}],
 ['s_road','Deeds','Holding the Road','Hold 10 sieges on the North road.',()=>T_('roadNorth')>=10,{dmgp:3}],
 ['s_tiers','Deeds','Ten Tiers','Bring the sieges to tier 5 twice.',()=>T_('stier5')>=2,{goldp:4}],
 ['s_pyre','Deeds','Pyre-Proof','Hold a siege of tier 4 or higher without a minion of yours down at the end.',()=>T_('pyreProof')>0,{mpow:3}],
 ['s_works','Deeds','Every Work Built','Build all five siege works.',()=>WORK_IDS.every(k=>worksOwn(k)),{goldp:3}],
].forEach(a=>TITLES.push({id:a[0],grp:a[1],name:a[2],req:a[3],ok:a[4],b:a[5]}));
{ const t=TITLES.find(x=>x.id==='x_eclipse'), u=TITLES.find(x=>x.id==='x_ftr'); Object.defineProperty(t,'req',{enumerable:true,get:()=>OMENS.eclipse?'Win 5 runs under the Eclipse.':'Win 15 runs under an omen.'}); Object.defineProperty(u,'req',{enumerable:true,get:()=>'Fuse a minion that carries '+FUSE_TRAITS+' traits.'}); }   // read when shown: OMENS and FUSE_TRAITS are defined further on
// ----- title bonuses. Small, and only the title you wear counts. Stat keys add like gear; the rest are percentages.
const TITLE_BUFF={
 g0:{hp:10},g1:{mana:10},g2:{hpp:3},g3:{dmgp:3},g4:{mpow:5},g5:{dmgp:5,hpp:3},
 t10:{crit:2},t20:{drp:2},t30:{regen:1},t40:{mpow:4},t50:{manap:5},t60:{raise:4},t70:{dmgp:4},t80:{hpp:5},t90:{drp:4},t100:{dmgp:6,drp:3},
 d_raise1:{raise:2},d_raise50:{raise:3},d_raise200:{mpow:5},d_army:{mpow:3},d_kill100:{atk:2},d_kill1000:{dmgp:2},d_kill5000:{dmgp:4},
 d_lv10:{intelligence:1},d_lv25:{intelligence:2,will:1},d_lv50:{hpp:4,manap:4},d_uq:{goldp:5},d_tuq:{dmgp:5,hpp:5},d_study:{xpp:3},d_all:{xpp:8},
 d_death:{hp:15},d_death10:{drp:3},d_quest7:{xpp:4},d_armed1:{goldp:4},d_armed3:{mpow:4},d_tower1:{ward:3},d_tower50:{drp:3},
 d_cancel:{siph:3},d_cancel10:{siph:6},d_master:{goldp:6},d_trophy500:{goldp:8},d_gold:{goldp:5},d_bag:{mana:20},d_altar:{mpow:4},
 d_evolve:{mpow:3},d_elder:{mpow:6},d_tower110:{dmgp:5},d_tower150:{drp:5},d_ngp:{xpp:5},d_ngp3:{xpp:10}
};
TITLES.forEach(t=>{ if(!t.b) t.b=TITLE_BUFF[t.id]||{}; });
const TBUFF_L={studyp:['Bestiary progress from kills','%'],healp:['Healing received','%'],hpp:['Max HP','%'],manap:['Max mana','%'],dmgp:['Damage dealt','%'],drp:['Damage taken','%',-1],goldp:['Gold from kills','%'],xpp:['XP from kills','%']};
const buffTxt=b=>Object.keys(b||{}).map(k=>{ if(k==='margin') return MARGIN_TXT; const L=TBUFF_L[k]||STATL[k], neg=(b[k]<0)!==((L[2]||1)<0); return (neg?'&minus;':'+')+Math.abs(b[k])+L[1]+' '+L[0]; }).join(', ');   // a negative value (a debuff) reads with a minus
const titleB=k=>{ const id=S&&S.ti&&S.ti.sel, t=id&&S.ti.got&&S.ti.got[id]&&TITLE[id]; return (t&&t.b[k])||0; };
// The collection bonus: +1% gold from kills per TCOL_STEP titles earned, at most TCOL_MAX. Deliberately not combat power.
// Read from the earned-titles record (S.ti.got), so it needs no save field and survives New Game+ with the titles.
const TCOL_STEP=10, TCOL_MAX=10;
const titlesGot=()=>S&&S.ti&&S.ti.got?TITLES.reduce((n,t)=>n+(S.ti.got[t.id]?1:0),0):0;
const titleColB=n=>Math.min(TCOL_MAX,Math.floor((n==null?titlesGot():n)/TCOL_STEP));
const titleColTxt=n=>{ const b=titleColB(n); return 'Collection: '+n+'/'+TITLES.length+' titles &middot; +'+b+'% gold from kills &middot; '+(b<TCOL_MAX?'next at '+(b+1)*TCOL_STEP:'full bonus'); };
function wearTitle(id){   // wear or take off a title; HP and mana follow the change like gear
  const T=S.ti; if(S.mode==='battle'||!T||!T.got||!T.got[id]) return false;
  const P=S.player; vitals(()=>{ T.sel=T.sel===id?null:id; }); P.hp=Math.min(P.hp,pMax()); P.mana=Math.min(P.mana,pMana()); return true;
}
function tally(k,n){ S.ti=S.ti||{}; S.ti[k]=(S.ti[k]||0)+(n==null?1:n); }   // deed counters for titles
// Title rarity uses the item tier names and colours (Common to Unique). Rarer titles give bigger bonuses, and Epic and
// rarer ones stay hidden ("???") until earned. Rarity follows how hard a title is: bot runs measured the reachable ones,
// and deeds the bots skip (events, forging) were judged by hand.
const TITLE_RARITY={hd1:1,hd2:2,nm0:3,nm1:3,nm2:3,nm3:4,nm4:4,nm5:5,dm3:5,sb0:5,sb1:5,sb2:5,sb3:5,sb4:5,sb5:5,g0:0,g1:0,d_raise1:0,d_kill100:0,d_death:0,d_armed1:0,d_lv10:0,d_study:0,s_venom:0,f_crit:0,d_tower1:0,d_quest7:0,d_army:0,g2:1,t10:1,t20:1,d_raise50:1,d_cancel:1,d_evolve:1,d_uq:1,d_gold:1,m0:1,m1:1,c_drought:1,c_fury:1,c_bulwark:1,c_horde:1,c_volatile:1,p_25:1,k_spear:1,k_blast:1,k_chill:1,g_items:1,g_sold:1,f_flawless:1,f_last:1,a_boss:1,e_strag:1,e_pedlar:1,e_trap:1,d_death10:1,g3:2,g4:2,t30:2,t40:2,t50:2,d_kill1000:2,d_lv25:2,d_raise200:2,d_tower50:2,d_cancel10:2,d_trophy500:2,d_altar:2,d_elder:2,m2:2,m3:2,d_armed3:2,d_master:2,d_bag:2,c_25:2,e_shrine:2,e_coffer:2,s_poison:2,s_cure:2,k_reap:2,k_master3:2,k_all:2,f_boss25:2,f_elite100:2,g_gold:2,g_roll3:2,a_traits:2,a_elders:2,e_day100:2,e_runs100:2,g_reforge:2,g5:3,t60:3,t70:3,m4:3,m5:3,tw75:3,d_lv50:3,p_100:3,f_crit1000:3,e_rooms1000:3,twruns:3,d_ngp:3,d_tower110:3,t80:4,t90:4,t100:4,d_kill5000:4,d_all:4,d_tower150:4,a_raise500:4,e_lv75:4,tw200:5,d_ngp3:5,d_tuq:5,a_ancient:3,a_eternal:4,a_raid1:1,a_raid25:3,r_5:3,r_15:4,r_30:5};
Object.assign(TITLE_RARITY,{i_keeper:5,i_book:5,i_climb:5,s_unburnt:5,s_road:3,s_tiers:4,s_pyre:3,s_works:3,c_five:4,c_paid:3,nm_1:2,nm_5:3,nm_15:4,nm_old:4,x_long:2,x_hunt:3,x_clean:3,x_rally:3,r_stakes:3,r_reclaim:3,r_end:4,r_spare:4,r_clean:5,f_hon:4,f_vesh:4,f_ulm:4,f_choir:4,f_dis:4,f_godless:4,f_turncoat:3,f_weather:4,as_3:3,as_6:4,as_10:5,as_all:5,as_rw:4,b_haul:2,b_five:3,b_runes:4,b_sgn:3,ar_charmed:4,ar_hundred:2,ar_tennames:5,ar_witch:4,ar_roles:4,ar_order:3,r_six:4,r_sigil3:4,r_weekly:3,r_attuned:3,r_half:3,a_keeper:4,a_hand:4,a_both:5,a_river:3,a_script:2,a_echo:4,a_unwritten:5,a_seven:4,b_ub0:2,b_ub1:2,b_ub2:2,b_ub3:3,b_ub4:3,b_ub5:3,b_ten:4,k_reader:2,k_weak:2,k_defuse:2,k_gcbane:2,x_clr100:2,x_allgates:2,x_swift:2,x_flaw10:3,x_streak10:2,x_tw10:2,x_floors500:2,x_abyss:5,x_rift25:2,x_rift50:3,x_riftfast:3,x_fuse10:1,x_ftr:3,x_mlv50:2,x_omen1:1,x_omen25:2,x_omenall:3,x_eclipse:3,x_mastered25:2,x_ledger10:3,x_relics:3,x_hoard:2,x_titles50:2,x_titles100:4});
const RARITY_MUL=[1,1,1.25,1.5,2,3], HIDDEN_FROM=3;
TITLES.forEach(t=>{ t.r=TITLE_RARITY[t.id]!=null?TITLE_RARITY[t.id]:1; const m=RARITY_MUL[t.r]; for(const k in t.b) t.b[k]=Math.max(t.b[k],Math.round(t.b[k]*m)); });
const titleHidden=t=>t.r>=HIDDEN_FROM&&!(S&&S.ti&&S.ti.got&&S.ti.got[t.id]);
// Progress for count titles ("Clear the Throne of Ash 25 times" shows 12/25). Read from the title's own check, so a new
// count title gets its progress for free: any check of the form ()=>something>=N with N above 1.
TITLES.forEach(t=>{ const m=/^\(\)\s*=>\s*(.+?)\s*>=\s*(\d+)$/.exec(String(t.ok).trim()); if(/^t\d+$/.test(t.id)){ t.prog={get:()=>S.tower.best,n:+t.id.slice(1)}; return; } if(!m||+m[2]<=1) return;
  try{ t.prog={get:new Function('return ('+m[1]+')||0'),n:+m[2]}; }catch(e){} });
const titleProg=t=>{ if(!t.prog) return null; let v=0; try{ v=Math.max(0,Math.floor(+t.prog.get())||0); }catch(e){ return null; } return {v:Math.min(v,t.prog.n),n:t.prog.n}; };
const TITLE=Object.fromEntries(TITLES.map(t=>[t.id,t]));
const totalKills=()=>Object.values(S.kills).reduce((a,b)=>a+b,0);
const allNames=()=>{ const a=[]; DUNGEONS.forEach(D=>{ D.mobs.forEach(m=>a.push(m[0])); a.push(D.boss[0]); }); TW_MOBS.forEach(m=>a.push(m[0])); TW_BOSS.forEach(n=>a.push(n)); return a; };
function checkTitles(){
  if(!S) return;
  const T=S.ti=S.ti||{}; T.got=T.got||{}; T.clr=T.clr||{}; T.raised=T.raised||0; T.deaths=T.deaths||0; T.claims=T.claims||0;
  abbeyCheck();   /* the drowned door's keys (game-abbey.js) */
  if(S.army.some(m=>m.armed&&m.eq&&GEAR_SLOTS.every(sl=>m.eq[sl]))) T.fullGear=true;
  if(!T.hasUq&&(S.inv.concat(Object.values(S.equip)).some(it=>it&&ITEM[it.id]&&ITEM[it.id].uq))) T.hasUq=true;
  recArmy();   // records for the highest minion level and the most gold held
  const sel0=T.sel, valid=T.sel&&T.got[T.sel]&&TITLE[T.sel];
  let next=valid?T.sel:null; const won=[];
  for(const t of TITLES){
    if(T.got[t.id]||custEasy()) continue;   /* a Custom save earns no titles (game-modes.js) */
    let ok=false; try{ ok=t.ok(); }catch(e){}
    if(ok){ T.got[t.id]=S.day; if(!next) next=t.id; won.push(t); }   // only auto-worn if you wear none
  }
  if(won.length===1){ const t=won[0]; notify('Title earned: '+t.name+'. '+t.req+(buffTxt(t.b)?' Worn, it gives '+buffTxt(t.b)+'.':''),'ok'); }
  else if(won.length>1) notify(won.length+' titles earned: '+won.map(t=>t.name).join(', ')+'. See the Titles tab for what each one gives.','ok');   // one line, not a pile
  if(won.length&&typeof moment==='function') moment(won.length>1?won.length+' titles earned':'Title earned: '+won[0].name,'gold','title');
  // a title put on or taken off here changes stats like wearing it by hand: HP, mana and the army follow
  if(next!==sel0){ const P=S.player; T.sel=sel0; vitals(()=>{ T.sel=next; }); P.hp=Math.min(P.hp,pMax()); P.mana=Math.min(P.mana,pMana()); }
}
const titleName=()=>{ const t=S.ti&&S.ti.sel&&TITLE[S.ti.sel]; return t?t.name:''; };

function addXp(n){
  const P=S.player; P.xp+=n; let ups=0;
  while(P.xp>=need(P.lvl)){ P.xp-=need(P.lvl); P.lvl++; P.pts+=3; P.sp=(P.sp||0)+1; ups++; }
  if(ups){ sfx('level'); moment('Level '+P.lvl,'gold','lvl'); P.hp=pMax(); P.mana=pMana(); syncArmy(); const nu=SKILLS.filter(s=>s.lv>P.lvl-ups&&s.lv<=P.lvl).map(s=>s.name); notify('Level '+P.lvl+'. +'+(3*ups)+' stat points and +'+ups+' skill point'+(ups>1?'s':'')+' to spend.'+(nu.length?' New skill: '+nu.join(', ')+'.':''),'ok'); }
  return ups;
}
function minionXp(m,n){
  m.xp+=n; let up=0;
  while(m.lvl<S.player.lvl+2 && m.xp>=mneed(m.lvl)){ m.xp-=mneed(m.lvl); m.lvl++; up++; }
  if(m.lvl>=S.player.lvl+2) m.xp=Math.min(m.xp,mneed(m.lvl)-1);
  if(up){ checkEvolve(m); syncMinion(m); }
  return up;
}
function alloc(k){
  const P=S.player; if(P.pts<=0||S.mode==='battle') return;
  if(!(k in P.stats)) return;
  vitals(()=>{ P.stats[k]++; P.pts--; });   // HP and mana rise by exactly what their max rose by (titles, sets and Bone Armor scale it)
}
const questDone = ()=>S.quest.kills>=QUEST.kills&&S.quest.rooms>=QUEST.rooms&&S.quest.clears>=QUEST.clears;
function claimQuest(){
  if(S.quest.claimed||!questDone()) return;
  if(ordersOn()){ if(!(S.orders&&S.orders.day===S.day&&S.orders.done)) dayWork(); S.quest.claimed=true; return; }   /* daily orders replace the quest once a building stands; a day's work without one still pays its XP (game-dread.js) */
  const xp=Math.round(need(S.player.lvl)*QUEST_XP);
  S.quest.claimed=true; S.player.pts+=QUEST_PTS; addXp(xp); S.ti=S.ti||{}; S.ti.claims=(S.ti.claims||0)+1;
  notify('Daily quest complete: +'+QUEST_PTS+' stat point'+(QUEST_PTS>1?'s':'')+' and +'+xp+' XP.','ok');
}
function endDay(){   // nightfall: tonight's raids march, then a siege if one is due, then the day closes at dawn
  if(S.mode==='siege') return;
  marchRaids(); if(siegeOpen()&&(sg().pending||siegeTonight())){ startSiege(); return; }
  closeDay();
}
function closeDay(){ chSeeded(closeDay0,CH_SYS.dawn,S.day+1); chHistNote(); plogFlush(); }   /* a challenge code's dawn; its line in this browser's list; the play log (game-playlog.js) */
function closeDay0(){
  const P=S.player;
  if(!S.quest.claimed&&questDone()) claimQuest();   // an unfinished quest simply lapses
  const hon=remembered(); S.day++; nemDawn(); S.watches=WATCHES-pactWatch(); if(hon) syncArmy();   /* the Remembered buff ends at dawn; nemDawn: nemeses grow each week (game-nemesis.js) */
  S.quest={kills:0,rooms:0,clears:0,claimed:false};
  const rr=resolveRaids(); placeWaiting(); bondsDawn(); yardDawn(); embDawn(); upkeepDawn(); dreadDawn(); faithDawn(); godDreadDawn(); omenDusk();   /* upkeep and the town's dread (game-dread.js) */   /* the Charnel Yard, the Embalmery (game-town2.js) */
  P.hp=pMax(); P.mana=pMana(); P.shield=0;
  S.army.forEach(m=>m.hp=m.maxHp);
  notify('Day '+S.day+' begins. You have '+S.watches+' watches.'+raidDayLine(rr)+forecastLine());
  siegeTick(); rivalTick();
}
function restDay(){ if(S.mode!=='town') return; S.watches=0; endDay(); }

