// ===== BREWING 2.0, THE BELT, RUN PREP, COMMISSIONS AND THE BLACK MARKET (R4 PR B) =====
// Brewing names trophy **parts** by role (TROPHY[k].role: striker, reaper, mender, vanguard) and a gate minimum, so every
// role's trophies and the low gates' trophies keep a use. Brews go to a stash (S.stash, id -> count, BREW_STASH each).
// Before a gate run you arm one oil, one incense and one bone charm (S.prep); each run takes one of each armed kind from the
// stash. War banners arm for tonight's raids. Draughts go on the belt and are drunk in battle like potions. The belt holds
// BELT_MAX of each drinkable, one more at Forge level 2 and 3 (beltMax). Commissions (S.comm) are three weekly town orders
// for trophies, a heartforged piece or a grown minion. The black market (S.bm) opens every seventh day and trades without gold.
const BELT_CAP=5, BREW_STASH=5, BREW_GOLD=60;
const beltMax=()=>Math.min(BELT_CAP,BELT_MAX+(bl('forge')>=2?1:0)+(bl('forge')>=3?1:0)+apoBelt());   /* the Apothecary (game-town2.js) */
const OIL_WEAK=.1, INC_LOW=5, INC_GRAVE=10, DRAFT_HP=.3, DOOR_SIGHT=1, QUIET_DAYS=3, IRON_DR=.25, IRON_TURNS=2, BLOOD_HEAL=.15;
const BANNER_ODDS=.1, BANNER_GOLD=1.5;
// recipes: parts {role:n}, the lowest gate a part may come from (Tower trophies count as gate 5), or hearts: boss hearts
const BREWS={
  oil_phys: {kind:'oil',   ty:'phys', name:'Oil of the Edge',   parts:{striker:3,reaper:1},g:2, desc:'Your army\'s blows deal physical damage this run, 10% more against foes weak to it.'},
  oil_fire: {kind:'oil',   ty:'fire', name:'Oil of Embers',     parts:{striker:3,reaper:1},g:2, desc:'Your army\'s blows deal fire damage this run, 10% more against foes weak to it.'},
  oil_frost:{kind:'oil',   ty:'frost',name:'Oil of Rime',       parts:{striker:3,reaper:1},g:2, desc:'Your army\'s blows deal frost damage this run, 10% more against foes weak to it.'},
  oil_rot:  {kind:'oil',   ty:'rot',  name:'Oil of Blight',     parts:{striker:3,reaper:1},g:2, desc:'Your army\'s blows deal rot damage this run, 10% more against foes weak to it.'},
  oil_shad: {kind:'oil',   ty:'shad', name:'Oil of Dusk',       parts:{striker:3,reaper:1},g:2, desc:'Your army\'s blows deal shadow damage this run, 10% more against foes weak to it.'},
  inc_low:  {kind:'inc',   name:'Low Incense',      parts:{mender:3},g:1, desc:'+5% raise chance this run.'},
  inc_grave:{kind:'inc',   name:'Grave Incense',    parts:{mender:3},g:3, desc:'+10% raise chance this run.'},
  inc_abbot:{kind:'inc',   name:'Abbot\'s Incense', parts:{mender:3},g:4, desc:'You start the boss room with a Soul.'},
  ch_draft: {kind:'charm', name:'Second Draft',     hearts:2, desc:'If you fall this run, you rise once at 30% HP.'},
  ch_door:  {kind:'charm', name:'Open Door',        hearts:2, desc:'Every choice of doors this run offers an elite room.'},
  ch_order: {kind:'charm', name:'Extra Order',      hearts:2, desc:'Once this run, give an order a second time in the same room.'},
  ch_lantern:{kind:'charm',name:'Lantern',          hearts:2, desc:'You read the doors of this run one step better.'},
  ch_quiet: {kind:'charm', name:'Quiet Grave',      hearts:2, use:true, desc:'Burn it in town: the next siege comes three days later.'},
  bn_courage:{kind:'banner',name:'Banner of Courage',parts:{vanguard:4},g:3, desc:'Tonight\'s raids are 10% likelier to win.'},
  bn_host:  {kind:'banner',name:'Banner of the Host',parts:{vanguard:4},g:3, desc:'A Commander leads one more follower tonight.'},
  bn_spoils:{kind:'banner',name:'Banner of Spoils', parts:{vanguard:4},g:3, desc:'Tonight\'s won raids bring back half again as much gold.'},
  dr_iron:  {kind:'draught',belt:'iron', name:'Iron Draught',parts:{vanguard:4},g:0, desc:'Your whole side takes 25% less damage for 2 turns. Drinking it uses your turn.'},
  dr_blood: {kind:'draught',belt:'blood',name:'Bloodwine',  parts:{reaper:2,mender:2},g:0, desc:'Heals you and every minion for 15% of max HP. Drinking it uses your turn.'}
};
const BREW_IDS=Object.keys(BREWS), BREW_KINDS=['oil','inc','charm','banner','draught'], PREP_KINDS=['oil','inc','charm','banner'];
const BREW_KIND_NAME={oil:'Weapon oils',inc:'Incense',charm:'Bone charms',banner:'War banners',draught:'Draughts'};
const DRAUGHTS={iron:{name:'Iron Draught',key:'E',desc:BREWS.dr_iron.desc},blood:{name:'Bloodwine',key:'T',desc:BREWS.dr_blood.desc}};
const DRINK_IDS=['hp','mp','iron','blood'], drinkDef=k=>POTIONS[k]||DRAUGHTS[k];
const partGate=k=>k.startsWith('t:')?5:trophyGate(k);
const partKeys=(role,g)=>Object.keys(S.trophies||{}).filter(k=>!k.startsWith('b:')&&TROPHY[k]&&TROPHY[k].role===role&&partGate(k)>=g&&S.trophies[k]>0).sort((a,b)=>TROPHY[a].value-TROPHY[b].value);
const partCount=(role,g)=>partKeys(role,g).reduce((a,k)=>a+S.trophies[k],0);
const spareHearts=()=>Object.keys(S.trophies||{}).filter(k=>k.startsWith('b:')&&TROPHY[k]).map(k=>[k,S.trophies[k]-heartsKept(k)]).filter(([,n])=>n>0).sort((a,b)=>TROPHY[a[0]].value-TROPHY[b[0]].value);
const brewGold=id=>{ const B=BREWS[id]; if(freeBrew()||(B.kind==='banner'&&bannerFree())) return 0; return Math.round((B.hearts?BREW_GOLD*10:BREW_GOLD*((B.g||0)+1))*apoBrewK()); };   /* the Apothecary, the Quartermaster (game-town2.js) */
const stashN=id=>(S.stash&&S.stash[id])||0;
function brewCan(id){
  const B=BREWS[id]; if(!B||S.mode!=='town'||S.gold<brewGold(id)) return false;
  if(B.belt){ if((S.belt[B.belt]||0)>=beltMax()) return false; } else if(stashN(id)>=BREW_STASH) return false;
  if(B.hearts) return spareHearts().reduce((a,[,n])=>a+n,0)>=B.hearts;
  return Object.keys(B.parts).every(r=>partCount(r,B.g)>=B.parts[r]);
}
function brewIt(id){   // spends the parts (cheapest first) or spare hearts (lowest first) and the gold
  if(!brewCan(id)) return false; const B=BREWS[id], free=freeBrew(); S.gold-=brewGold(id); if(free) S.freeBrew=S.day;
  if(B.hearts){ let need=B.hearts; for(const [k,n] of spareHearts()){ const t=Math.min(n,need); S.trophies[k]-=t; need-=t; if(!S.trophies[k]) delete S.trophies[k]; if(!need) break; } }
  else for(const r of Object.keys(B.parts)){ let need=B.parts[r]; for(const k of partKeys(r,B.g)){ const t=Math.min(S.trophies[k],need); S.trophies[k]-=t; need-=t; if(!S.trophies[k]) delete S.trophies[k]; if(!need) break; } }
  const n=brewTwice()?2:1;   /* the Distillery (game-town2.js) */
  if(B.belt) S.belt[B.belt]=Math.min(beltMax(),(S.belt[B.belt]||0)+n); else { S.stash=S.stash||{}; S.stash[id]=Math.min(BREW_STASH,stashN(id)+n); }
  tally('brewed'); tally('brewG',brewGold(id)); sfx('heal'); return true;
}
// ----- run prep: what a gate run takes from the stash
function prepSet(kind,id){   // arm (or, with the same id or null, disarm) one brew of a kind
  if(S.mode!=='town'||!PREP_KINDS.includes(kind)) return false; S.prep=S.prep||{};
  if(id==null||S.prep[kind]===id){ delete S.prep[kind]; return true; }
  const B=BREWS[id]; if(!B||B.kind!==kind||B.use) return false; S.prep[kind]=id; return true;
}
let PREP_SKIP=false;   // a sweep (game-kits.js) leaves the stash alone
function prepTake(r){   // startRun: one of each armed oil, incense and charm goes into the run
  if(PREP_SKIP) return; const p=S.prep||{}; for(const kind of ['oil','inc','charm']){ const id=p[kind]; if(!id||!stashN(id)) continue; S.stash[id]--; if(!S.stash[id]) delete S.stash[id]; r[kind]=id; tally('prepUsed'); }
  if(r.oil) log('Your army\'s blades are oiled: '+BREWS[r.oil].name+'.','ok'); if(r.inc) log(BREWS[r.inc].name+' burns at the gate.','ok'); if(r.charm) log('You carry a bone charm: '+BREWS[r.charm].name+'.','ok');
}
function useCharm(id){   // a charm burned in town (Quiet Grave)
  const B=BREWS[id]; if(!B||!B.use||S.mode!=='town'||!stashN(id)) return false;
  if(id==='ch_quiet'){ if(!siegeOpen()) return false; const g=sg(); if(!g.next) return false; g.next+=QUIET_DAYS; if(g.warned&&g.warned>=S.day) g.warned=0; }
  S.stash[id]--; if(!S.stash[id]) delete S.stash[id]; tally('charmsBurned'); sfx('skill'); return true;
}
// ----- the hooks
const runBrew=(k,id)=>!!(S&&S.run&&S.run[k]===id);
const oilType=()=>S&&S.run&&S.run.oil&&!S.run.tw?BREWS[S.run.oil].ty:null;   // minionType: an oiled army deals the oil's type
const oilK=(e,ty)=>{ const o=oilType(); return o&&ty===o&&HITTER&&HITTER.uid!=null&&foeRes(e,ty)<0?1+OIL_WEAK:1; };   // hurtFoe
const incRaise=()=>(runBrew('inc','inc_low')?INC_LOW:runBrew('inc','inc_grave')?INC_GRAVE:0)*censerK();   /* Censer House (game-town2.js) */   // raiseChance
function brewRoom(r){ if(r.inc==='inc_abbot'&&r.room===r.rooms-1&&!r.abbotU){ r.abbotU=1; if(gainSoul()) log('Abbot\'s Incense: you enter the boss room with a Soul.','ok'); } }   // spawnRoom
function brewFall(){ const r=S.run, P=S.player; if(r&&r.charm==='ch_draft'&&!r.draftU){ r.draftU=1; P.hp=Math.max(1,Math.round(pMax()*DRAFT_HP)); log('Second Draft: the page rewrites itself. You rise at '+P.hp+' HP.','ok'); tally('drafted'); return true; } return false; }   // playerFalls
const brewDoors=(r,out)=>{ if(r.charm==='ch_door'&&out[0]==='fight'&&!out.includes('elite')) out.push('elite'); return out; };   // rollDoors
const brewSight=(di,v)=>S.run&&S.run.charm==='ch_lantern'&&S.run.di===di?Math.min(2,v+DOOR_SIGHT):v;   // doorSight
const xOrder=role=>{ const r=S.run; return !!(r&&r.charm==='ch_order'&&!r.xordU&&r.cmd&&r.cmd[role]); };   // canCommand: a second order of a kind
const brewDr=a=>{ const r=S.run; return r&&r.iron>=r.turn&&(a.id==='p'||a.uid!=null)?1-IRON_DR:1; };   // hurtAlly
function drinkDraught(k){
  const P=S.player, r=S.run; if(!r||!(S.belt[k]>0)) return false;
  if(k==='iron'){ S.belt.iron--; r.iron=r.turn+IRON_TURNS-1; log('You drink an Iron Draught: your side takes 25% less damage for '+IRON_TURNS+' turns.','ok'); }
  else if(k==='blood'){ const all=allies().filter(u=>u.hp>0); if(all.every(u=>u.hp>=(u.id==='p'?pMax():u.maxHp))) return false; S.belt.blood--; let h=0; all.forEach(u=>{ h+=healAlly(u,Math.round((u.id==='p'?pMax():u.maxHp)*BLOOD_HEAL))||0; }); log('You drink Bloodwine: your side mends '+h+' HP.','ok'); }
  else return false;
  tally('drank'); return true;
}
// banners: armed for tonight; each raid ordered takes one
const bannerOn=id=>!!(S.prep&&S.prep.banner===id&&stashN(id)>0);
function bannerTake(o){ const id=S.prep&&S.prep.banner; if(!id||!stashN(id)) return; S.stash[id]--; if(!S.stash[id]) delete S.stash[id]; o.bn=id; tally('bannersRaised'); }
const bannerSquad=()=>bannerOn('bn_host')?1:0;   // squadMax
const bannerOdds=(o,p)=>o&&o.bn==='bn_courage'?Math.min(RAID_MAX,p+BANNER_ODDS):p;   // marchRaids
const bannerGold=x=>x&&x.bn==='bn_spoils'?BANNER_GOLD:1;   // resolveRaid
// ----- commissions: three town orders a week
const COMM_N=3, COMM_TRO_K=3, COMM_HF_GOLD=3000, COMM_MIN_GOLD=2500;
const weekOf=d=>Math.floor((d-1)/7);
function makeComm(){
  const list=[], top=topGate(), roles=['vanguard','striker','mender','reaper'], used=new Set();
  for(let i=0;i<COMM_N;i++){ const r=Math.random();
    if(r<.2&&T_('heartforged')>0&&!used.has('hf')){ used.add('hf'); list.push({k:'hf',slot:pick(GEAR_SLOTS)}); continue; }
    if(r<.4&&S.army.length>=3&&!used.has('min')){ used.add('min'); list.push({k:'min',role:pick(roles.filter(x=>x!=='reaper'||S.army.some(m=>m.role==='reaper'))),st:1+(Math.random()<.3?1:0)}); continue; }
    const g=Math.floor(Math.random()*(top+1)), role=pick(roles.filter(ro=>DUNGEONS[g].mobs.some(m=>m[1]===ro))||roles), n=4+Math.floor(Math.random()*5);
    list.push({k:'tro',role,g,n}); }
  S.comm={week:weekOf(S.day),list};
}
function commissions(){ if(!S.comm||!Array.isArray(S.comm.list)||S.comm.week!==weekOf(S.day)) makeComm(); return S.comm.list; }
const trosOf=(role,g)=>Object.keys(S.trophies||{}).filter(k=>!k.startsWith('b:')&&TROPHY[k]&&TROPHY[k].role===role&&trophyGate(k)===g&&S.trophies[k]>0).sort((a,b)=>TROPHY[a].value-TROPHY[b].value);
function commPay(c){
  if(c.k==='tro') return {g:Math.round(TROPHY_VAL[c.g]*c.n*COMM_TRO_K)+50*(c.g+1),d:5*(c.g+1)};
  if(c.k==='hf') return {g:COMM_HF_GOLD+1000*topGate(),d:30};
  return {g:COMM_MIN_GOLD*c.st+100*S.player.lvl,d:20};
}
const commItem=c=>c.k==='hf'?S.inv.find(it=>it.hf&&!it.lk&&ITEM[it.id].slot===c.slot):null;
const commMinion=c=>c.k==='min'?S.army.filter(m=>m.role===c.role&&(m.stage||0)>=c.st&&!m.lk&&!m.wall&&!m.thrall).sort((a,b)=>a.lvl-b.lvl)[0]:null;
function commCan(i){ const c=commissions()[i]; if(!c||c.done||S.mode!=='town') return false;
  if(c.k==='tro') return trosOf(c.role,c.g).reduce((a,k)=>a+S.trophies[k],0)>=c.n;
  if(c.k==='hf') return !!commItem(c); return !!commMinion(c); }
function commFill(i){
  if(!commCan(i)) return false; const c=S.comm.list[i], p=commPay(c);
  if(c.k==='tro'){ let need=c.n; for(const k of trosOf(c.role,c.g)){ const t=Math.min(S.trophies[k],need); S.trophies[k]-=t; need-=t; if(!S.trophies[k]) delete S.trophies[k]; if(!need) break; } }
  else if(c.k==='hf'){ const it=commItem(c); S.inv=S.inv.filter(x=>x!==it); }
  else { const m=commMinion(c); returnGear(m); S.army=S.army.filter(x=>x!==m); bondsClean(); syncArmy(); }
  S.gold+=p.g; S.dust=(S.dust||0)+p.d; c.done=1; tally('commissions'); tally('commG',p.g); sfx('coin'); return p;
}
function commTxt(c){ if(c.k==='tro') return c.n+' '+c.role+' parts from the '+DUNGEONS[c.g].name;
  if(c.k==='hf') return 'A heartforged '+SLOTS[c.slot].toLowerCase()+' piece'; return 'A '+c.role+' minion at '+STAGES[c.st].trim()+' or beyond'; }
// ----- the black market: every seventh day from day 7, each trade once a week
const BM_DAY=7, BM_SOUL_GOLD=1500, BM_SOUL_DUST=5, BM_DUST=50, BM_DUST_TRO=30, BM_TW=8;
const bmOpen=()=>!!S&&S.day>=BM_DAY&&S.day%BM_DAY===0&&S.mode==='town';
function bmState(){ const w=weekOf(S.day); if(!S.bm||S.bm.week!==w) S.bm={week:w,used:{}}; return S.bm; }
const bmUsed=k=>!!bmState().used[k];
const clearedGates=()=>{ const out=[]; for(let i=0;i<GATE_N;i++) if(S.ti&&S.ti.clr&&S.ti.clr[i]) out.push(i); return out; };
function bmHeartGate(){ const lo=g=>Object.keys(S.trophies).filter(k=>{ const i=DUNGEONS.findIndex(D=>'b:'+D.boss[0]===k); return i>=0&&i<g; }).reduce((a,k)=>a+Math.max(0,S.trophies[k]-heartsKept(k)),0);
  return clearedGates().filter(g=>g>=1&&lo(g)>=3).pop(); }
const bmDustTro=()=>Object.keys(S.trophies).filter(k=>!k.startsWith('b:')&&partGate(k)>=2&&!k.startsWith('t:'));
const bmWarden=()=>{ const f=Math.min(TW_BOSS.length,Math.floor(((S.tower&&S.tower.best)||0)/10)); return f>=1?TW_BOSS[f-1]:null; };
const bmMaster=()=>Object.keys(S.trophies).find(k=>SECRET.some(B=>'b:'+B.name===k)&&S.trophies[k]>heartsKept(k));
const BM_TRADES={
  heart: {name:'A heart of a gate you cleared',take:'3 spare hearts of lower gates', can:()=>bmHeartGate()!=null},
  dust:  {name:BM_DUST+' bone dust',          take:BM_DUST_TRO+' trophies of gate C or deeper', can:()=>bmDustTro().reduce((a,k)=>a+S.trophies[k],0)>=BM_DUST_TRO},
  warden:{name:'A warden\'s heart',           take:BM_TW+' Tower trophies', can:()=>towerTrophies()>=BM_TW&&!!bmWarden()},
  piece: {name:'A set piece of your best gate',take:'1 secret-master heart', can:()=>!!bmMaster()&&S.inv.length<bagMax()},
  soul:  {name:'A Soul for your next run',    take:BM_SOUL_GOLD+' gold and '+BM_SOUL_DUST+' dust', can:()=>S.gold>=BM_SOUL_GOLD&&(S.dust||0)>=BM_SOUL_DUST&&!(S.prep&&S.prep.soul)}
};
function bmTrade(k,slot){
  const T=BM_TRADES[k]; if(!T||!bmOpen()||bmUsed(k)||!T.can()) return null; let got;
  const take=(keys,need)=>{ for(const x of keys){ const t=Math.min(Math.max(0,S.trophies[x]-(x.startsWith('b:')?heartsKept(x):0)),need); S.trophies[x]-=t; need-=t; if(!S.trophies[x]) delete S.trophies[x]; if(!need) break; } };
  if(k==='heart'){ const g=bmHeartGate(); take(Object.keys(S.trophies).filter(x=>{ const i=DUNGEONS.findIndex(D=>'b:'+D.boss[0]===x); return i>=0&&i<g; }).sort((a,b)=>TROPHY[a].value-TROPHY[b].value),3); const key='b:'+DUNGEONS[g].boss[0]; S.trophies[key]=(S.trophies[key]||0)+1; got=TROPHY[key].name; }
  else if(k==='dust'){ take(bmDustTro().sort((a,b)=>TROPHY[a].value-TROPHY[b].value),BM_DUST_TRO); S.dust=(S.dust||0)+BM_DUST; got=BM_DUST+' bone dust'; }
  else if(k==='warden'){ spendTrophies(Object.keys(S.trophies).filter(x=>x.startsWith('t:')),BM_TW,()=>1); const key='b:'+bmWarden(); S.trophies[key]=(S.trophies[key]||0)+1; got=TROPHY[key].name; }
  else if(k==='piece'){ const key=bmMaster(); S.trophies[key]--; if(!S.trophies[key]) delete S.trophies[key]; const g=Math.min(5,Math.max(0,...clearedGates(),topGate())), sl=SLOTS[slot]?slot:pick(GEAR_SLOTS);
    const pool=Object.values(ITEM).filter(d=>!d.uq&&!d.tower&&d.set===g&&d.slot===sl); const it=addItem(pick(pool).id); got=it?ITEM[it.id].name:'nothing'; }
  else { S.gold-=BM_SOUL_GOLD; S.dust-=BM_SOUL_DUST; S.prep=S.prep||{}; S.prep.soul=1; got='a Soul, waiting for your next run'; }
  bmState().used[k]=1; tally('bmTrades'); sfx('coin'); return got;
}
function prepSoul(r){ if(!PREP_SKIP&&S.prep&&S.prep.soul){ delete S.prep.soul; if(gainSoul()) log('The Soul from the black market goes with you.','ok'); } }   // startRun
// ----- save
function brewFix(g){
  const st={}; if(g.stash&&typeof g.stash==='object') for(const k in g.stash){ const n=Math.floor(+g.stash[k]||0); if(BREWS[k]&&!BREWS[k].belt&&n>0) st[k]=Math.min(BREW_STASH,n); } g.stash=st;
  const p={}; if(g.prep&&typeof g.prep==='object'){ for(const kind of PREP_KINDS){ const id=g.prep[kind]; if(BREWS[id]&&BREWS[id].kind===kind&&!BREWS[id].use) p[kind]=id; } if(g.prep.soul) p.soul=1; } g.prep=p;
  if(!(g.comm&&Array.isArray(g.comm.list)&&isFinite(g.comm.week))) g.comm=null;
  else g.comm.list=g.comm.list.filter(c=>c&&((c.k==='tro'&&TROPHY_PART[c.role]&&DUNGEONS[c.g]&&c.n>0)||(c.k==='hf'&&SLOTS[c.slot])||(c.k==='min'&&TROPHY_PART[c.role]&&STAGES[c.st]))).slice(0,COMM_N);
  if(!(g.bm&&isFinite(g.bm.week)&&g.bm.used&&typeof g.bm.used==='object')) g.bm=null;
}
