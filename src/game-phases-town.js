// ===== BOSS PHASES =====
// At half HP a boss (gate or Tower) enters its second phase: its moves come a turn sooner, every move is announced a turn
// ahead, and it adds Sundering Blow. Taunt turns that blow onto a vanguard; a Focus crit or Grave Chill breaks any charging move.
const PHASE_AT=.5;
const PHASE_LINES={
  'The Rat King':'My court! To me, all of you, to me!',
  'The Crypt Warden':'Two hundred years. I will not be the one who fails.',
  'The Ember Knight':'Then let it all burn, and you with it!',
  'The Bishop of Teeth':'The choir will have your voice, scribe, one way or another.',
  'The Orchard Mother':'You would cut down my children? Then be pruned.',
  'The Pale Sovereign':'Enough. Let me show you what the book truly gave me.'
};
function checkPhase(){
  if(!S.run) return;
  for(const e of liveFoes()) if(e.boss&&e.abil&&!e.phase2&&(e.tw||e.rankI>=1)&&e.hp<=e.maxHp*PHASE_AT){   // the Rat King, a new player's first boss, keeps one phase
    e.phase2=true; e.fast=(e.fast||0)+1; e.alt=true; e.abilT=Math.min(e.abilT,2);   // Sundering Blow comes first
    const l=PHASE_LINES[e.base]; log(e.name+(l?': "'+l+'"':' rises in fury.'),'boss');
    log(e.name+' enters its second phase. It moves faster, warns before every move, and adds Sundering Blow.','bad'); sfx('warn'); tally('phases'); moment(e.name+' enters its second phase','bad');
  }
}
function breakCharge(e,why){ const mv=e.move||e.abil; e.charging=false; e.move=null; e.abilT=BOSS_ABIL[mv].every; log(why+' '+BOSS_ABIL[mv].name+' is lost.','ok'); tally('cancels'); moment(BOSS_ABIL[mv].name+' broken','ok'); }

// ===== ELITE AFFIXES =====
// Every elite carries one named affix (two in the deeper gates and from Tower floor 50). Raise one and the minion keeps one
// of them as a trait.
const AFFIX={
  shielded: {name:'Shielded', desc:'Starts the fight behind a bone shield worth 30% of its HP.', trait:'stalwart'},
  splitting:{name:'Splitting',desc:'Splits into two lesser copies when it dies.',               trait:'gravebound'},
  vampiric: {name:'Vampiric', desc:'Heals for 40% of the damage it deals.',                     trait:'leech'},
  enraged:  {name:'Enraged',  desc:'Hits 60% harder below half HP.',                            trait:'wrathful'},
  warded:   {name:'Warded',   desc:'Immune to bleeding, burns and poison.',                     trait:'warded'}
};
const AFFIX_IDS=Object.keys(AFFIX), SPLIT_MAX=6;
const hasAff=(e,a)=>!!(e&&e.aff&&e.aff.includes(a));
const affixN=()=>S.run&&(S.run.tw?S.run.tw>=50:S.run.di>=3)?2:1;
function giveAffixes(e,n){
  e.aff=[]; for(let i=0;i<n;i++){ const left=AFFIX_IDS.filter(a=>!e.aff.includes(a)); if(left.length) e.aff.push(pick(left)); }
  if(e.aff.includes('shielded')) e.shield=Math.round(e.maxHp*.3);
}
function affixAll(list){ for(const e of list) if(e.elite&&!e.aff) giveAffixes(e,affixN()); }   // after scaling, so the shield matches the final HP
function splitFoe(e){
  const out=[];
  for(let i=0;i<2;i++){ if(liveFoes().length>=SPLIT_MAX) break;
    const c={id:'e'+(++S.uid),name:'Lesser '+e.base,base:e.base,role:e.role,rankI:e.rankI,tw:e.tw,lvl:e.lvl,hf:e.hf,af:e.af,boss:false,elite:false,split:true,maxHp:Math.max(1,Math.round(e.maxHp*.35)),hp:0,atk:Math.max(1,Math.round(e.atk*.5)),dead:false};
    c.hp=c.maxHp; S.run.enemies.push(c); out.push(c); }
  if(out.length) log(e.name+' splits into '+out.length+' lesser cop'+(out.length>1?'ies':'y')+'.','bad');
}

// ===== TOWN BUILDINGS =====
// Built with gold, and bone dust from salvage for the higher levels. Each level lasts for the rest of the game (not through New Game+).
const BUILD={
  crypt:  {name:'Crypt',   desc:'+1 army slot per level. Also lifts the cap of 10 slots by one per level.'},
  forge:  {name:'Forge',   desc:'Reforging costs 15% less gold, and enchanting 15% less bone dust, per level.'},
  ossuary:{name:'Ossuary', desc:'+3% raise chance per level.'},
  altar:  {name:'Altar',   desc:'+5% max mana per level, and the Bone Altar costs 10% less per level.'}
};
const BUILD_MAX=3, BUILD_COST=[[1500,0],[5000,30],[14000,90]];   // [gold, bone dust] for levels 1, 2 and 3
const bl=k=>(S&&S.build&&S.build[k])||0;
const buildCost=k=>BUILD_COST[bl(k)]||null;
function build(k){
  if(!S||S.mode!=='town'||!BUILD[k]) return false; const c=buildCost(k); if(!c||S.gold<c[0]||(S.dust||0)<c[1]) return false;
  S.gold-=c[0]; S.dust=(S.dust||0)-c[1]; vitals(()=>{ S.build=S.build||{}; S.build[k]=bl(k)+1; }); tally('built'); sfx('level'); return true;
}

// ===== WHAT IS OPEN YET =====
// New players meet the town economy gradually: the Town tab and bounty board open after the first gate clear (or level 4),
// salvage and enchanting at level 6 (or once you hold bone dust). The functions work regardless; this only hides the buttons.
const anyClear=()=>!!(S&&S.ti&&S.ti.clr&&Object.keys(S.ti.clr).length);
const everCleared=()=>anyClear()||L_('clears')>0;   // a gate cleared on this save at any point, New Game+ included (it empties ti.clr)
const townOpen=()=>!!S&&(S.player.lvl>=4||anyClear()||Object.keys(S.build||{}).length>0);
const workOpen=()=>!!S&&(S.player.lvl>=6||(S.dust||0)>0);

// ===== BOUNTY BOARD =====
// Three contracts a day. Progress counts from the moment the board goes up; finished contracts are claimed in town.
// Unclaimed contracts simply lapse at dawn (no penalty).
const BOUNTY_N=3;
const BOUNTIES={
  kills:   {t:n=>'Defeat '+n+' foes in one day',       n:50,w:1, key:null},
  elites:  {t:n=>'Defeat '+n+' elites',                n:4, w:2, key:'elites'},
  raise:   {t:n=>'Raise '+n+' of the dead in one day', n:6, w:1, key:'raised'},
  rooms:   {t:n=>'Win '+n+' rooms or floors',          n:12, w:2, key:'rooms'},
  bosses:  {t:n=>'Defeat '+n+' bosses or wardens',     n:3, w:2, key:'bosses'},
  cursed:  {t:()=>'Clear today\'s cursed gate',        n:1, w:2, key:'cursed',  ok:()=>dayMod().gi>=0},
  flawless:{t:()=>'Clear a gate without losing HP',    n:1, w:1, key:'flawless',ok:()=>!!(S.ti&&S.ti.clr&&Object.keys(S.ti.clr).length)},
  arch:    {t:n=>'Go through '+n+' bloodied arches',   n:3, w:2, key:'archs'},
  orders:  {t:n=>'Give your army '+n+' orders',        n:8, w:1, key:'commands',ok:()=>S.army.length>0},
  floors:  {t:n=>'Climb '+n+' floors of the Hell Tower',n:6,w:2, key:'floors',  ok:()=>S.player.lvl>=TW.unlock},
  poison:  {t:n=>'Poison foes '+n+' times',            n:30,w:1, key:'poisoned',ok:()=>S.army.some(m=>hasTrait(m,'venom'))}
};
const BOUNTY_RW=['gold','gold','gold','salt','dust','dust','gear'];
const bountyVal=id=>id==='kills'?totalKills():T_(BOUNTIES[id].key);
function bountyReward(kind){
  const lv=S.player.lvl, g=n=>Math.round(n*ngpReward());
  if(kind==='salt') return {g:g(20+lv*10),salt:1};
  if(kind==='dust') return {g:g(20+lv*10),dust:4+Math.floor(lv/4)};
  if(kind==='gear') return {gear:1};
  return {g:g(60+lv*30)};
}
function makeBounties(){
  let pool=Object.keys(BOUNTIES).filter(k=>!BOUNTIES[k].ok||BOUNTIES[k].ok()); const list=[];
  while(list.length<BOUNTY_N&&pool.length){
    let x=Math.random()*pool.reduce((s,k)=>s+BOUNTIES[k].w,0), id=pool[0];
    for(const k of pool){ x-=BOUNTIES[k].w; if(x<=0){ id=k; break; } }
    pool=pool.filter(k=>k!==id); list.push({id,n:BOUNTIES[id].n,base:bountyVal(id),rw:bountyReward(pick(BOUNTY_RW)),claimed:false});
  }
  S.bounty={day:S.day,list};
}
function bounties(){ if(!S.bounty||S.bounty.day!==S.day) makeBounties(); return S.bounty.list; }
const bountyGot=b=>Math.max(0,bountyVal(b.id)-b.base);
const bountyDone=b=>bountyGot(b)>=b.n;
const topGate=()=>{ let g=0; for(let i=0;i<RK.length;i++) if(S.player.lvl>=RK[i].unlock) g=i; return g; };
function claimBounty(i){
  const b=bounties()[i]; if(!b||b.claimed||!bountyDone(b)||S.mode!=='town') return null;
  if(b.rw.gear&&S.inv.length>=bagMax()) return null;
  b.claimed=true; const out=[];
  if(b.rw.g){ S.gold+=b.rw.g; out.push(b.rw.g+' gold'); }
  if(b.rw.salt){ if(S.salts<SALT_MAX){ S.salts++; out.push('Grave Salts'); } else { const g=saltPrice(); S.gold+=g; out.push(g+' gold in place of salts (your pouch is full)'); } }
  if(b.rw.dust){ S.dust=(S.dust||0)+b.rw.dust; out.push(b.rw.dust+' bone dust'); }
  if(b.rw.gear){ const pool=Object.values(ITEM).filter(d=>!d.uq&&!d.tower&&d.set===topGate()), d=pick(pool), it=addItem(d.id,rollItem(d.id,true)); if(it) out.push(withArticle(d.name)); }
  tally('bounties'); sfx('coin'); return out.join(', ');
}

// ===== SOULS AND ULTIMATE SKILLS =====
// Soul Siphon harvests a Soul, and so does every elite or boss that falls. Souls last for the whole run (up to five).
// From level 20 you choose one ultimate on the Skills tab; with five Souls you can unleash it in battle (key R).
const TOLL_MUL=4, TOLL_EXEC=.2;   // Death's Toll: x your Siphon to every foe, and the execute line
const SOUL_MAX=5, ULT_LV=20, SIPHON_PIERCE=.25, SIPHON_LOW=.3, SIPHON_HEAL=.35, SIPHON_HEAL_LD=.8;
const ULTS={
  toll:  {name:"Death's Toll",         desc:'Every foe takes '+TOLL_MUL*100+'% of your Siphon, ignoring armor. Foes other than bosses left below '+TOLL_EXEC*100+'% HP die outright.'},
  rise:  {name:'Unholy Resurrection',  desc:'Every downed minion rises at full HP and the rest heal fully; you heal 40% of your max HP, and your army deals 50% more damage for 3 turns.'},
  prison:{name:'Soul Prison',          desc:'Every foe is frozen for 2 turns (bosses 1), breaking any charging move, and takes 30% more damage for 3 turns.'}
};
function gainSoul(){ const r=S.run; if(!r) return false; r.souls=r.souls||0; if(r.souls>=SOUL_MAX) return false; r.souls++; return true; }
const canUlt=()=>S.mode==='battle'&&!!S.run&&S.player.lvl>=ULT_LV&&!!ULTS[S.player.ult]&&(S.run.souls||0)>=SOUL_MAX;
function chooseUlt(id){ if(S.mode!=='town'||!ULTS[id]||S.player.lvl<ULT_LV) return false; S.player.ult=id; return true; }
function useUlt(t){
  if(!canUlt()) return false; const r=S.run, P=S.player, id=P.ult; r.souls=0; tally('ults');
  if(id==='toll'){ let tot=0, slain=0; for(const o of liveFoes()){ const d=hit(pSiph()*TOLL_MUL*pierceMul(1)); hurtFoe(o,d); tot+=d; if(o.hp>0&&!o.boss&&o.hp<o.maxHp*TOLL_EXEC){ mark(o,o.hp,0); o.hp=0; slain++; } }
    log("Death's Toll: every foe takes the Ledger's due, "+tot+' damage in all'+(slain?', and '+slain+' fall where they stand':'')+'.','ok'); }
  else if(id==='rise'){ let n=0; for(const m of S.army){ if(m.hp<=0){ m.hp=m.maxHp; n++; } else healAlly(m,m.maxHp); } healAlly(P,Math.round(pMax()*.4)); r.frenzy=Math.max(r.frenzy||0,3); r.frenzyMul=Math.max(r.frenzyMul||1,1.5);
    log('Unholy Resurrection: '+(n?n+' of your fallen rise again, ':'')+'your army is whole and burns with fury.','ok'); }
  else { for(const o of liveFoes()){ o.stun=Math.max(o.stun||0,o.boss?1:2); o.curse={mul:1.3,t:3}; mark(o,0,0); } log('Soul Prison: every foe is locked in the Ledger\'s pages, frozen and laid bare.','ok'); }
  moment(ULTS[id].name,'gold'); sfx('boss'); fxe('ult',t,{id}); return true;
}

// ===== MINION FUSION =====
// Two minions of the same role become one: the stronger survives, gains a level (never past your level + 2), keeps the
// higher evolution stage and takes the other's traits (up to three). A minion can take at most two fusions in all. The other's gear goes back to your bag.
const FUSE_LV=1, FUSE_TRAITS=3, FUSE_MAX=2;
const fuseCost=(a,b)=>Math.round((a.lvl+b.lvl)*60);
const canFuse=(a,b)=>!!a&&!!b&&a!==b&&a.role===b.role&&(a.fused||0)+(b.fused||0)<FUSE_MAX;   // a minion takes at most two fusions in all
function fuse(ua,ub){
  if(S.mode!=='town') return null;
  const a=S.army.find(m=>m.uid===ua), b=S.army.find(m=>m.uid===ub); if(!canFuse(a,b)) return null;
  const c=fuseCost(a,b); if(S.gold<c) return null;
  const bFirst=b.lvl>a.lvl||(b.lvl===a.lvl&&(b.stage||0)>(a.stage||0)), k=bFirst?b:a, x=bFirst?a:b;
  S.gold-=c; returnGear(x);
  const tr=(k.traits||[]).slice(); for(const t of x.traits||[]) if(!tr.includes(t)&&tr.length<FUSE_TRAITS&&(t!=='commander'||canLead(k))) tr.push(t);   // only an elite or boss keeps Commander
  k.traits=tr; k.stage=Math.max(k.stage||0,x.stage||0); k.lvl=Math.min(S.player.lvl+2,Math.max(k.lvl,x.lvl)+FUSE_LV); k.xp=0; k.fused=(k.fused||0)+(x.fused||0)+1;
  S.army=S.army.filter(m=>m!==x); checkEvolve(k); syncMinion(k); k.hp=k.maxHp; tally('fused'); sfx('raise'); return k;
}

// ===== ITEM LOCKS AND ARMY CARE =====
// A locked item is never sold, salvaged or discarded (one by one or in bulk). Minions can be renamed and the army re-ordered.
function lockItem(u){ const it=findItem(u); if(!it) return false; if(it.lk) delete it.lk; else it.lk=true; return true; }
const NICK_MAX=16;
const cleanNick=t=>String(t==null?'':t).replace(/[^\p{L}\p{N} '\-]/gu,'').replace(/\s+/g,' ').trim().slice(0,NICK_MAX);   // letters, digits, spaces, ' and - only: names go straight into the page
function renameMinion(uid,name){ const m=S.army.find(x=>x.uid===uid), n=cleanNick(name); if(!m||!n||S.mode==='battle') return false; m.nick=n; return true; }
const ARMY_SORTS={power:'Strongest',role:'By role',level:'By level'};
const mPower=m=>m.atk*2+m.maxHp/4;
function sortArmy(k){ if(!ARMY_SORTS[k]||S.mode==='battle') return false; const ord={vanguard:0,striker:1,mender:2,reaper:3};
  S.army.sort(k==='role'?(a,b)=>ord[a.role]-ord[b.role]||b.lvl-a.lvl:k==='level'?(a,b)=>b.lvl-a.lvl||mPower(b)-mPower(a):(a,b)=>mPower(b)-mPower(a)); return true; }

// ===== SALVAGE AND ENCHANTING =====
// Salvage breaks gear into bone dust (better tiers and more bonus lines give more). Dust adds a bonus line to a piece with room
// for one, or re-rolls one line you pick. Uniques can be neither salvaged nor enchanted.
const DUST_TIER=[1,1,2,4,7];
const dustValue=it=>{ const d=ITEM[it.id]; return !d||d.uq?0:DUST_TIER[d.tier]+Math.floor(((it.ro&&it.ro.length)||0)/2); };   // +1 per two bonus lines
function salvage(u){
  if(S.mode!=='town') return 0; const i=S.inv.findIndex(x=>x.u===u); if(i<0) return 0;
  const it=S.inv[i]; if(ITEM[it.id].uq||it.lk) return 0;
  S.inv.splice(i,1); const n=dustValue(it); S.dust=(S.dust||0)+n; tally('salvaged'); return n;
}
function salvageTier(t){ if(S.mode!=='town'||!BULK_TIERS.includes(t)||!workOpen()) return null; const list=tierLot(t); let n=0; for(const it of list) n+=salvage(it.u); if(list.length) sfx('fail'); return {n:list.length,d:n}; }
function salvageJunk(){ if(S.mode!=='town') return null; const list=S.inv.filter(isJunk); let n=0; for(const it of list) n+=salvage(it.u); if(list.length) sfx('fail'); return {n:list.length,d:n}; }
const lineMax=it=>(ROLL_LINES[ITEM[it.id].tier]||[0])[0];
const enchCost=it=>Math.max(1,Math.round((3+ITEM[it.id].tier*4)*(1-.15*bl('forge'))));
function rollLine(it,skip){ const d=ITEM[it.id], k=pick(Object.keys(ROLL_KEYS).filter(x=>!skip.includes(x))); return [k,Math.max(1,Math.round(ROLL_KEYS[k]*TM[d.set]*rnd(.5,1)))]; }
function enchant(u,line){   // line < 0 adds a line; otherwise re-rolls that line
  const it=findItem(u); if(!it||S.mode!=='town'||ITEM[it.id].uq) return false;
  const c=enchCost(it), ro=it.ro||[]; if((S.dust||0)<c) return false;
  if(line<0){ if(ro.length>=lineMax(it)) return false; } else if(!ro[line]) return false;
  S.dust-=c;
  vitals(()=>{ const r=ro.slice(); if(line<0) r.push(rollLine(it,r.map(x=>x[0]))); else r[line]=rollLine(it,r.filter((x,i)=>i!==line).map(x=>x[0])); it.ro=r; });
  tally('enchanted'); sfx('level'); return true;
}
