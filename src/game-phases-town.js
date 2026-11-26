// ===== BOSS PHASES =====
// At half HP a boss (gate or Tower) enters its second phase: its moves come a turn sooner, every move is announced a turn
// ahead, and it adds Sundering Blow. Taunt turns that blow onto a vanguard; a Focus crit or Grave Chill breaks any charging move.
const PHASE_AT=.5, phaseAt=()=>runHeat()>=2?BRUTAL_PHASE:PHASE_AT;   // Brutal and up: sooner (HEAT)
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
  for(const e of liveFoes()) if(e.boss&&e.abil&&!e.phase2&&!e.hunger&&(e.tw||e.rival||e.rankI>=1||runHeat()>=2)&&e.hp<=e.maxHp*phaseAt()&&!hibernates(e)){   /* Vesh's Hibernation (game-pantheon.js) */   // the Rat King, a new player's first boss, keeps one phase
    e.phase2=true; e.fast=(e.fast||0)+1; e.alt=true; e.abilT=Math.min(e.abilT,2); if(e.reck) reckLastPage(e);   /* The Last Page (game-rival-arc.js) */   // Sundering Blow comes first (a boss with a move set has a twist instead)
    const l=PHASE_LINES[e.base]; log(e.name+(l?': "'+l+'"':' rises in fury.'),'boss'); const tw=bossTwist(e);
    log(tw?e.name+' enters its second phase: '+tw.name+'. '+tw.desc+' It moves faster and warns before every move.':e.name+' enters its second phase. It moves faster, warns before every move, and adds Sundering Blow.','bad'); sfx('phase'); tally('phases'); moment(e.name+' enters its second phase','bad');
  }
}
function breakCharge(e,why){ const mv=e.move||e.abil; e.charging=false; e.move=null; delete e.edictT; delete e.blockT; if(e.kit&&mv!=='sunder') nextMove(e); e.abilT=BOSS_ABIL[mv].every; log(why+' '+BOSS_ABIL[mv].name+' is lost.','ok'); tally('cancels'); moment(BOSS_ABIL[mv].name+' broken','ok'); }

// ===== ELITE AFFIXES =====
// Every elite carries one named affix (two in the deeper gates and from Tower floor 50). Raise one and the minion keeps one
// of them as a trait.
const AFFIX={
  shielded: {name:'Shielded', desc:'Starts the fight behind a bone shield worth 30% of its HP.', trait:'stalwart'},
  splitting:{name:'Splitting',desc:'Splits into two lesser copies when it dies.',               trait:'gravebound'},
  vampiric: {name:'Vampiric', desc:'Heals for 40% of the damage it deals.',                     trait:'leech'},
  enraged:  {name:'Enraged',  desc:'Hits 60% harder below half HP.',                            trait:'wrathful'},
  warded:   {name:'Warded',   desc:'Immune to bleeding, burns, poison and blight.',             trait:'warded'},
  plague:   {name:'Plaguebearer',desc:'Its hits blight the target for 2 turns: rot damage each turn, and half the healing received.', trait:'necrotic'},
  sundering:{name:'Sundering', desc:'Its hits sunder the target 1 time in 3: 25% more damage taken for 2 turns.', trait:'crushing'},
  hexing:   {name:'Hexing',    desc:'Its hits hex the target 1 time in 3: 20% less damage dealt for 2 turns.', trait:'hexing'},
  swift:    {name:'Swift',     desc:'Hasted for the first 3 turns of a fight: strikes again for 50% at the end of each turn.', trait:'swift'},
  frosty:   {name:'Frost-touched',desc:'Its hits are frost and chill the target 1 time in 3: 20% more damage taken for 2 turns.', trait:'rimeborn'},
  burning:  {name:'Burning',   desc:'Its hits are fire and burn the target for 2 turns.', trait:'cinderborn'}
};
const AFFIX_IDS=Object.keys(AFFIX), SPLIT_MAX=6;
const hasAff=(e,a)=>!!(e&&e.aff&&e.aff.includes(a));
const affixN=()=>S.run&&(S.run.tw?S.run.tw>=50:S.run.di>=3)?2:1;
function giveAffixes(e,n){
  e.aff=[]; for(let i=0;i<n;i++){ const left=AFFIX_IDS.filter(a=>!e.aff.includes(a)&&!(a==='hexing'&&hasKit(e,'hexer'))&&!(a==='shielded'&&hasKit(e,'shield')));   /* a kit never doubles an affix */ if(left.length) e.aff.push(pick(left)); }
  if(e.aff.includes('shielded')) e.shield=Math.round(e.maxHp*.3);
}
function affixAll(list){ for(const e of list) if(e.stash&&hasAff(e,'shielded')&&!e.shield) e.shield=Math.round(e.maxHp*.3); else if(!e.aff&&(e.elite||(runHeat()>=2&&!e.boss&&!e.rival&&rowOf(e)==='f'))) giveAffixes(e,e.elite?affixN():1); }   // Brutal and up: one affix on every front-row foe, without elite stats   // after scaling, so the shield matches the final HP
function splitFoe(e){
  const out=[];
  for(let i=0;i<2;i++){ if(liveFoes().length>=SPLIT_MAX) break;
    const c={id:'e'+(++S.uid),name:'Lesser '+e.base,base:e.base,role:e.role,rankI:e.rankI,tw:e.tw,lvl:e.lvl,hf:e.hf,af:e.af,boss:false,elite:false,split:true,maxHp:Math.max(1,Math.round(e.maxHp*.35)),hp:0,atk:Math.max(1,Math.round(e.atk*.5)),dead:false};
    c.hp=c.maxHp; S.run.enemies.push(c); out.push(c); }
  if(out.length) log(e.name+' splits into '+out.length+' lesser cop'+(out.length>1?'ies':'y')+'.','bad');
}

// ===== TOWN BUILDINGS =====
// Built with gold, and bone dust from salvage for the higher levels. Each level lasts for the rest of the game (not through New Game+).
// Per level: Forge discount, Ossuary raise chance (points), Altar max mana and Bone Altar discount. step: that building's levels cost one
// step less (level 2 at the level-1 price, level 3 at the level-2 price). Measured 2026-11-15 (full bot, one building off at a time): the
// Crypt cost 3 points of clears, the other three under 1, so the Altar went from 5%/10% to 6%/12% and the Forge and Ossuary, whose
// whole-number effects cannot rise by a modest round step, got cheaper.
const B_FORGE=.15, B_OSS=3, B_ALT_MANA=.05, B_ALT_COST=.12, b100=x=>Math.round(x*100);
const BUILD={
  crypt:  {name:'Crypt',   desc:'+1 army slot per level. Also lifts the cap of '+ARMY_CAP+' slots by one per level, and adds '+RESERVE_CRYPT+' places to the Reserve.', now:n=>'+'+n+' army slot'+(n>1?'s':'')+', +'+RESERVE_CRYPT*n+' Reserve places'},
  forge:  {name:'Forge',   desc:'Reforging costs '+b100(B_FORGE)+'% less gold, and enchanting '+b100(B_FORGE)+'% less bone dust, per level.', now:n=>'reforging and enchanting '+b100(B_FORGE*n)+'% cheaper', step:1},
  ossuary:{name:'Ossuary', desc:'+'+B_OSS+'% raise chance per level.', now:n=>'+'+B_OSS*n+'% raise chance', step:1},
  altar:  {name:'Altar',   desc:'+'+b100(B_ALT_MANA)+'% max mana per level, and the Bone Altar costs '+b100(B_ALT_COST)+'% less per level.', now:n=>'+'+b100(B_ALT_MANA*n)+'% max mana, Bone Altar '+b100(B_ALT_COST*n)+'% cheaper'}
};
const BUILD_MAX=5, BUILD_COST=[[1500,0],[5000,30],[14000,90],[30000,180],[60000,300]], SIEGE_OSS_REF=3;   // [gold, bone dust] for levels 1-5 (4 and 5 after the Throne of Ash: game-town2.js); the Ossuary's siege rise is tuned on 3 levels
const bl=k=>(S&&S.siege&&S.siege.dmg===k)?0:Math.max(0,((S&&S.build&&S.build[k])||0)-(S&&S.unpaid&&S.unpaid[k]?1:0));   /* unpaid upkeep: the top level is off (game-dread.js) */   // a building damaged in a siege works as if unbuilt until repaired
const buildCost=k=>BUILD[k]&&blRaw(k)<BUILD_MAX&&!(S&&S.siege&&S.siege.dmg===k)?BUILD_COST[Math.max(0,blRaw(k)-(BUILD[k].step||0))]:null;
function build(k){
  if(!S||S.mode!=='town'||!BUILD[k]||!bOpen(k)||!buildReady(k)) return false; const c=buildCost(k); if(!c||S.gold<c[0]||(S.dust||0)<c[1]) return false;
  S.gold-=c[0]; S.dust=(S.dust||0)-c[1]; vitals(()=>{ S.build=S.build||{}; S.build[k]=blRaw(k)+1; }); tally('built'); dread(DREAD_BUILD); sfx('level'); siegeTick(); return true;
}

// ===== WHAT IS OPEN YET =====
// New players meet the game gradually, counted from gate clears (S.ti.clr, no stored flags): the Town tab, bounty board and sieges after
// the 2nd clear, the Old Shrine and the Hell Tower after the 3rd, the Rival after the 4th (RIVAL_AT). A save that already used a feature
// keeps it (buildings, the Reserve, an oath, a Tower floor). Salvage and enchanting at level 6 (or once you hold bone dust).
// The functions work regardless; this only hides the buttons.
const OPEN_AT={town:2,faith:3,tower:3};
const anyClear=()=>!!(S&&S.ti&&S.ti.clr&&Object.keys(S.ti.clr).length);
const townOpen=()=>!!S&&(distinctClears()>=OPEN_AT.town||Object.keys(S.build||{}).length>0||(S.reserve||[]).length>0||!!S.faith);
const faithOpen=()=>!!S&&(!!S.faith||(distinctClears()>=OPEN_AT.faith&&S.player.lvl>=FAITH_LV));
const towerOpen=()=>!!S&&((S.tower&&S.tower.best>0)||(distinctClears()>=OPEN_AT.tower&&S.player.lvl>=TW.unlock));

// ===== THE RESERVE =====
// A bench beside the army that opens with the Town tab: RESERVE_BASE places, +RESERVE_CRYPT per Crypt level. Benched minions do not
// fight, take damage, heal or earn XP, and keep their gear, traits, level and name. Moving one is free and instant, in town only
// (the raise screen may raise straight into it when the army is full). Marched raiders keep their places overnight (army or Reserve, see raidHeld);
// coming home they fill the army, then the Reserve, and when both are full (a burned Crypt, say) they wait at the gate (S.waiting). A Reserve loaded
// over its limit is kept as it is; it only takes no one new.
const reserveOpen=()=>townOpen();
const reserveMax=()=>RESERVE_BASE+RESERVE_CRYPT*bl('crypt')+reserveSpec();   /* Ossuary Halls (game-town2.js) */
const benched=()=>(S.reserve||[]).concat(S.waiting||[]);
const armyRoom=()=>armyUsed()<slots();
const reserveRoom=()=>reserveOpen()&&(S.reserve||[]).length+S.army.filter(m=>m.wall).length+raidHeld(true)<reserveMax();   // the wall's minions keep their Reserve places
const findMinion=uid=>S.army.find(m=>m.uid===uid)||(S.reserve||[]).find(m=>m.uid===uid)||null;
const inReserve=m=>!!m&&(S.reserve||[]).includes(m);
function benchRest(m){ delete m.dots; delete m.st; syncMinion(m); m.hp=m.maxHp; }
function toReserve(uid){
  if(S.mode!=='town'||!reserveRoom()) return false; const m=S.army.find(x=>x.uid===uid); if(!m) return false;
  S.army=S.army.filter(x=>x!==m); benchRest(m); (S.reserve=S.reserve||[]).push(m); return true;
}
function toArmy(uid){
  if(S.mode!=='town'||!armyRoom()) return false; const m=(S.reserve||[]).find(x=>x.uid===uid); if(!m) return false;
  S.reserve=S.reserve.filter(x=>x!==m); benchRest(m); S.army.push(m); return true;
}
function swapReserve(ua,ur){   // one press: the army minion takes the reserve one's place and the other way round
  if(S.mode!=='town'||!reserveOpen()) return false; const i=S.army.findIndex(x=>x.uid===ua), j=(S.reserve||[]).findIndex(x=>x.uid===ur); if(i<0||j<0) return false;
  const a=S.army[i], r=S.reserve[j]; benchRest(a); benchRest(r); S.army[i]=r; S.reserve[j]=a; return true;
}
function placeMinion(m,res){   // a minion coming home: the army, then the Reserve, then the gate; never lost (res: it left from the Reserve, so it goes back there first)
  benchRest(m); if(res&&reserveRoom()){ S.reserve.push(m); return 'reserve'; }
  if(armyRoom()){ S.army.push(m); return 'army'; }
  if(reserveRoom()){ S.reserve.push(m); return 'reserve'; }
  (S.waiting=S.waiting||[]).push(m); return 'gate';
}
function placeWaiting(){ const w=S.waiting||[]; S.waiting=[]; let n=0; for(const m of w){ if(armyRoom()||reserveRoom()){ placeMinion(m); n++; } else S.waiting.push(m); } return n; }
function fromGate(uid,to){   // a minion waiting at the gate steps into the army or the Reserve
  if(S.mode!=='town') return false; const m=(S.waiting||[]).find(x=>x.uid===uid); if(!m) return false;
  if(to==='army'?!armyRoom():!reserveRoom()) return false;
  S.waiting=S.waiting.filter(x=>x!==m); benchRest(m); (to==='army'?S.army:S.reserve).push(m); return true;
}
function sortReserve(k){ if(!ARMY_SORTS[k]||S.mode!=='town'||!S.reserve) return false; const keep=S.army; S.army=S.reserve; sortArmy(k); S.reserve=S.army; S.army=keep; return true; }   // the Reserve's own Order links; the army's never touch it

// ===== THE MEMORIAL =====
// A minion lost for good (shattered after a fight, or fallen on a raid) is written into S.memorial, newest first, at most MEM_MAX
// names; a release is a choice and is not recorded. Kept through New Game+. Once a day, in town, one fallen minion of evolution
// stage 1 or more may be honoured for about one Bone Altar level's gold at its level: the living army is Remembered (+MEM_HP max HP)
// until dawn. Not cumulative, never permanent. Kills are not kept: the game does not count them per minion.
const MEM_MAX=200, MEM_HP=.05, MEM_COST=.6;
function memorialize(m,at){
  if(!m||m.thrall) return null;
  const e=Object.assign({nick:m.nick,kind:m.kind||m.name,name:m.name,rk:m.rankI|0,lvl:m.lvl,st:m.stage||0,tr:(m.traits||[]).slice(),role:m.role,day:S.day},m.boss?{boss:1}:{},m.elite?{elite:1}:{},at||{});
  { const bd=bondFall(m,at); if(bd) e.bd=bd; }
  faithLost(m); S.memorial=[e].concat(S.memorial||[]); while(S.memorial.length>MEM_MAX){ const j=S.memorial.map(x=>!x.maus&&!x.hs).lastIndexOf(true); S.memorial.splice(j<0?MEM_MAX:j,1); }   /* a mausoleum's or headstone's name is never dropped */
  notify(m.nick+' '+theName(mName(m)).replace(/^The /,'the ')+' is written into the Memorial.','');
  return e;
}
const memWhere=e=>e.raid!=null&&DUNGEONS[e.raid]?'Fell on a raid to the '+DUNGEONS[e.raid].name:e.f?'Shattered in the Hell Tower, floor '+e.f:e.rd?'Shattered in the Rift, depth '+e.rd:DUNGEONS[e.g]?'Shattered in the '+DUNGEONS[e.g].name:'Shattered';
const honourCost=e=>Math.round(mneed(e.lvl)*MEM_COST);   // about one Bone Altar level at its level (before the Altar building's discount)
const remembered=()=>!!(S&&S.honor&&S.honor.day<=S.day&&S.honor.day>S.day-honourDays());   /* the Choir: two days (game-pantheon.js) */
const canHonour=e=>!!e&&e.st>=1&&S.mode==='town'&&!remembered()&&S.gold>=honourCost(e);
function honour(i){
  const e=(S.memorial||[])[i]; if(!canHonour(e)) return false;
  S.gold-=honourCost(e); S.honor={day:S.day,nick:e.nick}; deed('choir',5); syncArmy(); S.army.concat(S.reserve||[]).forEach(m=>{ m.hp=Math.min(m.hp,m.maxHp); }); sfx('raise'); return true;
}
// HEADSTONES: an uncapped late gold sink. In town, carve a headstone over any name in the Memorial (the released are never written
// there) and raise it tier by tier; the next tier of a stone costs HEAD_GOLD*HEAD_GROW^(its tier). Each tier of every stone adds about
// HEAD_K max HP to the living army, softly capped: the total is HEAD_CAP*(1-e^(-HEAD_K*tiers/HEAD_CAP)), near HEAD_CAP but never past it.
const HEAD_GOLD=3000, HEAD_GROW=1.5, HEAD_K=.005, HEAD_CAP=.06, HEAD_TOP=60;   /* HEAD_TOP: a sanity limit per stone (its next tier costs ~10^14 gold) */
const headTiers=()=>S&&S.memorial?S.memorial.reduce((t,e)=>t+(e.hs|0),0):0;
const headBonus=()=>HEAD_CAP*(1-Math.exp(-HEAD_K*headTiers()/HEAD_CAP));   // extraMul (syncMinion): max HP
const headCost=e=>Math.round(HEAD_GOLD*Math.pow(HEAD_GROW,e.hs|0)*bellChoir());   /* the Choir's Bell Choir */
const canHead=e=>!!e&&S.mode==='town'&&(e.hs|0)<HEAD_TOP&&S.gold>=headCost(e);
function carveHead(i){ const e=(S.memorial||[])[i]; if(!canHead(e)) return false; const c=headCost(e); S.gold-=c; e.hs=(e.hs|0)+1; tally('headG',c); deed('choir',10); syncArmy(); sfx('carve'); return true; }
function memorialFix(g){   // normalizeSave: keep well-formed entries only
  const ok=e=>e&&typeof e==='object'&&typeof e.nick==='string'&&typeof e.name==='string';
  g.memorial=Array.isArray(g.memorial)?g.memorial.filter(ok).slice(0,MEM_MAX).map(e=>{ const o={nick:cleanNick(e.nick)||'Nameless',kind:cleanText(typeof e.kind==='string'?e.kind:e.name),name:cleanText(e.name),rk:clamp(Math.floor(num(e.rk,0)),0,RANKS.length-1),
    lvl:Math.max(1,Math.floor(num(e.lvl,1))),st:clamp(Math.floor(num(e.st,0)),0,STAGE_MAX),tr:Array.isArray(e.tr)?e.tr.filter(t=>TRAITS[t]):[],role:ROLES[e.role]?e.role:'striker',day:Math.max(1,Math.floor(num(e.day,1)))};
    if(e.boss) o.boss=1; if(e.elite) o.elite=1; for(const k of ['g','raid']) if(RK[e[k]]) o[k]=e[k]; for(const k of ['f','rd']) if(num(e[k],0)>0) o[k]=Math.floor(e[k]); if(typeof e.bd==='string'&&cleanNick(e.bd)) o.bd=cleanNick(e.bd); if(e.maus) o.maus=1; if(num(e.hs,0)>=1) o.hs=Math.min(HEAD_TOP,Math.floor(e.hs)); return o; }):[];
  g.honor=g.honor&&typeof g.honor==='object'&&typeof g.honor.day==='number'?{day:g.honor.day,nick:cleanNick(g.honor.nick)||'Nameless'}:null;
}

// ===== LOADOUTS =====
// LOADOUT_N named slots, in town only. One stores the hero's worn gear (item uid and id per slot), who stands in the army and who in the
// Reserve (uid and name), and the chosen ultimate; nothing else (skills keep their own cost). Use restores what it can: stored gear
// still in the bag is worn (the old piece goes to the bag), stored army minions step in and the rest step back to the Reserve within
// both limits; a slot stored empty leaves the hero's piece on. It never deletes, sells or releases anything, and reports in one
// notice what it could not restore. Stale ids are only dropped from view when used, never on load.
const LOADOUT_N=3;
const freshLoadouts=()=>Array.from({length:LOADOUT_N},()=>({n:'',s:null}));
const loadoutName=i=>((S.loadouts||[])[i]&&S.loadouts[i].n)||'Loadout '+(i+1);
function saveLoadout(i){
  if(S.mode!=='town'||!(i>=0&&i<LOADOUT_N)) return false; if(!Array.isArray(S.loadouts)) S.loadouts=freshLoadouts();
  const gear={}; for(const sl of GEAR_SLOTS){ const it=S.equip[sl]; gear[sl]=it?[it.u,it.id]:null; }
  S.loadouts[i].s={gear,army:S.army.filter(m=>!m.thrall).map(m=>[m.uid,m.nick]),res:(S.reserve||[]).map(m=>[m.uid,m.nick]),ult:S.player.ult||null}; return true;
}
function renameLoadout(i,name){ const L=(S.loadouts||[])[i], n=cleanNick(name); if(!L||!n||S.mode!=='town') return false; L.n=n; return true; }
function useLoadout(i){
  const L=(S.loadouts||[])[i]; if(S.mode!=='town'||!L||!L.s) return null; const s=L.s, miss=[];
  const onMinion=u=>S.army.concat(S.reserve||[],S.waiting||[],...(S.raids||[]).map(x=>x.units)).find(m=>m.eq&&GEAR_SLOTS.some(sl=>m.eq[sl]&&m.eq[sl].u===u));
  vitals(()=>{ for(const sl of GEAR_SLOTS){ const g=s.gear&&s.gear[sl]; if(!Array.isArray(g)||(S.equip[sl]&&S.equip[sl].u===g[0])) continue;
    const k=S.inv.findIndex(x=>x.u===g[0]), nm=ITEM[g[1]]?ITEM[g[1]].name:'a piece of gear';
    if(k<0||ITEM[S.inv[k].id].slot!==sl){ miss.push(nm+' ('+(onMinion(g[0])?'held by a minion':'gone')+')'); continue; }
    const it=S.inv[k]; S.inv.splice(k,1); if(S.equip[sl]) S.inv.push(S.equip[sl]); S.equip[sl]=it; } });
  const want=(s.army||[]).map(x=>x[0]), nick=u=>((s.army||[]).concat(s.res||[]).find(x=>x[0]===u)||[0,'Nameless'])[1];
  const away=u=>(S.raids||[]).some(x=>x.units.some(m=>m.uid===u));
  for(const u of want){ if(S.army.some(m=>m.uid===u)) continue; if(away(u)){ miss.push(nick(u)+' (on a raid)'); continue; }
    if(!(S.reserve||[]).some(m=>m.uid===u)&&!(S.waiting||[]).some(m=>m.uid===u)) miss.push(nick(u)+' (gone)'); }
  const out=()=>S.army.filter(m=>!m.thrall&&!want.includes(m.uid)), wantIn=()=>want.map(u=>(S.reserve||[]).find(m=>m.uid===u)).filter(Boolean);
  if(reserveOpen()) for(let o=out(),w=wantIn();o.length&&w.length;o=out(),w=wantIn()) if(!swapReserve(o[o.length-1].uid,w[0].uid)) break;   // a swap needs no free place
  for(const m of out()) if(!toReserve(m.uid)) break;
  for(const u of want){ if(S.army.some(m=>m.uid===u)) continue; const r=(S.reserve||[]).some(m=>m.uid===u), w=(S.waiting||[]).some(m=>m.uid===u); if(!r&&!w) continue;
    if(!(r?toArmy(u):fromGate(u,'army'))) miss.push(nick(u)+' (no room)'); }
  if(s.ult&&ULTS[s.ult]&&S.player.ult!==s.ult) chooseUlt(s.ult);
  notify('Loadout restored: '+loadoutName(i)+'.'+(miss.length?' Could not restore: '+miss.join(', ')+'.':''),miss.length?'bad':'ok');
  return {miss};
}
function loadoutsFix(g){   // normalizeSave: shape only; ids that no longer exist are kept until the slot is used
  const L=Array.isArray(g.loadouts)?g.loadouts:[], pair=x=>Array.isArray(x)&&fin(x[0])&&typeof x[1]==='string';
  g.loadouts=freshLoadouts().map((d,i)=>{ const o=L[i]; if(!o||typeof o!=='object') return d; const s=o.s&&typeof o.s==='object'?o.s:null;
    const gear={}; if(s) for(const sl of GEAR_SLOTS){ const x=s.gear&&s.gear[sl]; gear[sl]=pair(x)?[x[0],x[1]]:null; }
    return {n:cleanNick(o.n),s:s?{gear,army:(Array.isArray(s.army)?s.army:[]).filter(pair).slice(0,40).map(x=>[x[0],cleanNick(x[1])||'Nameless']),res:(Array.isArray(s.res)?s.res:[]).filter(pair).slice(0,60).map(x=>[x[0],cleanNick(x[1])||'Nameless']),ult:ULTS[s.ult]?s.ult:null}:null}; });
}
const workOpen=()=>!!S&&(S.player.lvl>=6||(S.dust||0)>0);

// ===== BOUNTY BOARD =====
// The board banks up to BOUNTY_N contracts: it starts full, and each dawn one new contract is posted while fewer are up (claimed ones
// leave at dawn). Contracts never expire and leaving one costs nothing. Progress counts from the moment a contract goes up; claim in town.
const BOUNTY_N=3, BOUNTY_GATE=.3;   // bounty gold and bone dust x(1 + 0.3 per gate past the Rat Warren that your level opens): day-1 pay unchanged, x2.5 once the Throne of Ash opens
const BOUNTIES={
  kills:   {t:n=>'Defeat '+n+' foes',                   n:50,w:1, key:null},
  elites:  {t:n=>'Defeat '+n+' elites',                n:4, w:2, key:'elites'},
  raise:   {t:n=>'Raise '+n+' of the dead',             n:6, w:1, key:'raised'},
  rooms:   {t:n=>'Win '+n+' rooms or floors',          n:12, w:2, key:'rooms'},
  bosses:  {t:n=>'Defeat '+n+' bosses or wardens',     n:3, w:2, key:'bosses'},
  cursed:  {t:()=>'Clear today\'s cursed gate',        n:1, w:2, key:'cursed',  ok:()=>dayMod().gi>=0},
  flawless:{t:()=>'Clear a gate without losing HP',    n:1, w:1, key:'flawless',ok:()=>!!(S.ti&&S.ti.clr&&Object.keys(S.ti.clr).length)},
  arch:    {t:n=>'Go through '+n+' bloodied arches',   n:3, w:2, key:'archs'},
  orders:  {t:n=>'Give your army '+n+' orders',        n:8, w:1, key:'commands',ok:()=>S.army.length>0},
  floors:  {t:n=>'Climb '+n+' floors of the Hell Tower',n:6,w:2, key:'floors',  ok:()=>towerOpen()},
  poison:  {t:n=>'Poison foes '+n+' times',            n:30,w:1, key:'poisoned',ok:()=>S.army.some(m=>hasTrait(m,'venom'))}
};
const BOUNTY_RW=['gold','gold','gold','salt','dust','dust','gear'];
const bountyVal=id=>id==='kills'?totalKills():T_(BOUNTIES[id].key);
function bountyReward(kind){
  const lv=S.player.lvl, g=n=>Math.round(n*(1+BOUNTY_GATE*topGate())*ngpReward());   // gold grows with the deepest open gate as well as your level
  if(kind==='salt') return {g:g(20+lv*10),salt:1};
  if(kind==='dust') return {g:g(20+lv*10),dust:Math.round((4+Math.floor(lv/4))*(1+BOUNTY_GATE*topGate()))};
  if(kind==='gear') return {gear:1};
  return {g:g(60+lv*30)};
}
function makeBounties(add){   // add: post that many new contracts onto the banked ones (dawn); none: a fresh, full board
  const list=add==null?[]:S.bounty.list.filter(b=>!b.claimed), max=add==null?BOUNTY_N:Math.min(BOUNTY_N,list.length+add);
  let pool=Object.keys(BOUNTIES).filter(k=>(!BOUNTIES[k].ok||BOUNTIES[k].ok())&&!list.some(b=>b.id===k));
  while(list.length<max&&pool.length){
    let x=Math.random()*pool.reduce((s,k)=>s+BOUNTIES[k].w,0), id=pool[0];
    for(const k of pool){ x-=BOUNTIES[k].w; if(x<=0){ id=k; break; } }
    pool=pool.filter(k=>k!==id); list.push({id,n:BOUNTIES[id].n,base:bountyVal(id),rw:bountyReward(pick(BOUNTY_RW)),claimed:false});
  }
  S.bounty={day:S.day,list};
}
function bounties(){ if(!S.bounty||!Array.isArray(S.bounty.list)) makeBounties(); else if(S.bounty.day!==S.day) makeBounties(Math.max(0,S.day-S.bounty.day)); return S.bounty.list; }
const bountyGot=b=>Math.max(0,bountyVal(b.id)-b.base);
const bountyDone=b=>bountyGot(b)>=b.n;
const topGate=()=>{ let g=0; for(let i=0;i<GATE_N;i++) if(S.player.lvl>=RK[i].unlock) g=i; return g; };
function claimBounty(i){
  const b=bounties()[i]; if(!b||b.claimed||!bountyDone(b)||S.mode!=='town') return null;
  if(b.rw.gear&&S.inv.length>=bagMax()) return null;
  b.claimed=true; const out=[]; orderEv('bounty',b.rw.g||0);
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
function gainSoul(){ const r=S.run; if(!r) return false; r.souls=r.souls||0; if(r.souls>=soulCap()) return false; r.souls++; r.soulT=(r.soulT||0)+1;   // soulT: souls harvested this run, for the lifetime count
  if(hasMod('soulwell','a')) S.player.mana=Math.min(pMana(),S.player.mana+OVERFLOW_MANA);   // Overflow
  return true; }
const canUlt=()=>S.mode==='battle'&&!!S.run&&S.player.lvl>=ULT_LV&&!!ULTS[S.player.ult]&&(S.run.souls||0)>=SOUL_MAX;
function chooseUlt(id){ if(S.mode!=='town'||!ULTS[id]||S.player.lvl<ULT_LV) return false; S.player.ult=id; return true; }
function useUlt(t){
  if(!canUlt()) return false; const r=S.run, P=S.player, id=P.ult; r.souls=Math.max(0,r.souls-SOUL_MAX); tally('ults');
  if(id==='toll'){ let tot=0, slain=0; for(const o of liveFoes()){ const d=hit(pSiph()*TOLL_MUL*pierceMul(1)); hurtFoe(o,d,'shad'); tot+=d; if(o.hp>0&&!o.boss&&o.hp<o.maxHp*TOLL_EXEC){ mark(o,o.hp,0); o.hp=0; slain++; } }
    log("Death's Toll: every foe takes the Ledger's due, "+tot+' damage in all'+(slain?', and '+slain+' fall where they stand':'')+'.','ok'); }
  else if(id==='rise'){ let n=0; for(const m of S.army){ if(m.hp<=0){ m.hp=m.maxHp; n++; } else healAlly(m,m.maxHp); } healAlly(P,Math.round(pMax()*.4)); r.frenzy=Math.max(r.frenzy||0,3); r.frenzyMul=Math.max(r.frenzyMul||1,1.5);
    log('Unholy Resurrection: '+(n?n+' of your fallen rise again, ':'')+'your army is whole and burns with fury.','ok'); }
  else { for(const o of liveFoes()){ o.stun=Math.max(o.stun||0,o.boss?1:2); o.curse={mul:1.3,t:3}; mark(o,0,0); } log('Soul Prison: every foe is locked in the Ledger\'s pages, frozen and laid bare.','ok'); }
  moment(ULTS[id].name,'gold'); sfx('boss'); fxe('ult',t,{id}); return true;
}

// ===== MINION FUSION =====
// Two minions of the same role become one: the stronger survives, gains a level (never past your level + 2), keeps the
// higher evolution stage and takes the other's traits (up to three). A minion can take at most two fusions in all. The other's gear goes back to your bag.
const FUSE_LV=1, FUSE_TRAITS=3, FUSE_MAX=2, FUSE_GOLD=60;   // FUSE_GOLD: gold per level of the two minions together
const fuseCost=(a,b)=>Math.round((a.lvl+b.lvl)*FUSE_GOLD);
const canFuse=(a,b)=>!!a&&!!b&&a!==b&&a.role===b.role&&(a.fused||0)+(b.fused||0)<FUSE_MAX;   // a minion takes at most two fusions in all
const fuseOrder=(a,b)=>b.lvl>a.lvl||(b.lvl===a.lvl&&(b.stage||0)>(a.stage||0))?[b,a]:[a,b];   // [survivor, consumed]
function fuseTraits(k,x){   // the survivor's traits, then the other's it lacks; recipe pairs become their compound; then the cap
  const all=(k.traits||[]).slice(); for(const t of x.traits||[]) if(!all.includes(t)&&(t!=='commander'||canLead(k))) all.push(t);   // only an elite or boss keeps Commander
  for(const [c,p,q] of COMPOUNDS){ const i=all.indexOf(p), j=all.indexOf(q); if(i<0||j<0||all.includes(c)) continue; all[Math.min(i,j)]=c; all.splice(Math.max(i,j),1); }
  const tr=all.slice(0,Math.max(FUSE_TRAITS,(k.traits||[]).length));   // the survivor never loses a trait it had
  return {tr,made:tr.filter(t=>COMPOUND[t]&&!(k.traits||[]).includes(t)&&!(x.traits||[]).includes(t))};
}
const compoundFound=c=>!!(S.ti&&Array.isArray(S.ti.compounds)&&S.ti.compounds.includes(c));
function fuse(ua,ub){
  if(S.mode!=='town') return null;
  const a=findMinion(ua), b=findMinion(ub); if(!canFuse(a,b)) return null;   // army or Reserve
  const c=fuseCost(a,b); if(S.gold<c) return null;
  const [k,x]=fuseOrder(a,b), f=fuseTraits(k,x);
  S.gold-=c; returnGear(x);
  k.traits=f.tr; S.ti=S.ti||{}; const got=S.ti.compounds=S.ti.compounds||[]; for(const t of f.made) if(!got.includes(t)) got.push(t); k.stage=Math.max(k.stage||0,x.stage||0); k.lvl=Math.min(S.player.lvl+2,Math.max(k.lvl,x.lvl)+FUSE_LV); k.xp=0; k.fused=(k.fused||0)+(x.fused||0)+1;
  S.army=S.army.filter(m=>m!==x); if(S.reserve) S.reserve=S.reserve.filter(m=>m!==x); bondsClean(); checkEvolve(k); syncMinion(k); k.hp=k.maxHp; tally('fused'); recBest('ftr',k.traits.length); recArmy(); sfx('raise'); return k;
}

// ===== ITEM LOCKS AND ARMY CARE =====
// A locked item is never sold, salvaged or discarded (one by one or in bulk). Minions can be renamed and the army re-ordered.
function lockItem(u){ const it=findItem(u); if(!it) return false; if(it.lk) delete it.lk; else it.lk=true; return true; }
const NICK_MAX=16;
const cleanNick=t=>String(t==null?'':t).replace(/[^\p{L}\p{N} '\-]/gu,'').replace(/\s+/g,' ').trim().slice(0,NICK_MAX);   // letters, digits, spaces, ' and - only: names go straight into the page
const cleanText=t=>String(t==null?'':t).replace(/[<>&"]/g,'');   // names from a save (or a pasted save code) go into the page: no markup
function renameMinion(uid,name){ const m=findMinion(uid), n=cleanNick(name); if(!m||!n||S.mode==='battle') return false; m.nick=n; return true; }
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
const enchCost=it=>Math.max(1,Math.round((3+ITEM[it.id].tier*4)*(1-B_FORGE*bl('forge'))));
function rollLine(it,skip){ const d=ITEM[it.id], k=pick(rollKeys(d.slot).filter(x=>!skip.includes(x))); return [k,Math.max(1,Math.round(ROLL_KEYS[k]*TM[d.set]*rnd(.5,1)))]; }
// Tempering (same workshop): a bonus line moves TEMPER_STEP of the way to its highest roll (at least +1). Gold, growing x TEMPER_GROW for
// every temper this piece has had (it.tp; re-rolls and reforges keep it). Uniques cannot be tempered.
const TEMPER_GOLD=150, TEMPER_STEP=.25, TEMPER_GROW=1.5;   // TEMPER_GOLD 60->150 (2026-11-20): the full bot ran out of lines to temper with ~35k in hand; it is a capped sink (three slots, uniques excluded)
const rollMax=(it,k)=>Math.max(1,Math.round(ROLL_KEYS[k]*TM[ITEM[it.id].set]));   // rollLine's best roll
const temperCost=it=>{ const d=ITEM[it.id]; return Math.round(TEMPER_GOLD*(d.tier+1)*(1+.5*d.set)*Math.pow(TEMPER_GROW,it.tp||0)*temperK()); };   /* Bonewright (game-town2.js) */
function temperTo(it,i){ const l=it&&!ITEM[it.id].uq&&it.ro&&it.ro[i]; if(!l) return null; const mx=rollMax(it,l[0]); return l[1]>=mx?null:Math.min(mx,l[1]+Math.max(1,Math.ceil((mx-l[1])*Math.min(1,TEMPER_STEP*temperStep())))); }
function temper(u,i){
  const it=findItem(u); if(!it||S.mode!=='town'||!workOpen()) return false;
  const v=temperTo(it,i), c=temperCost(it); if(v==null||S.gold<c) return false;
  S.gold-=c; vitals(()=>{ const r=it.ro.slice(); r[i]=[r[i][0],v]; it.ro=r; }); it.tp=(it.tp||0)+1; tally('tempered'); sfx('level'); return true;
}
// ===== AWAKENING =====
// Uniques take no bonus lines, so reforging, enchanting and tempering pass them by, and late gold had nothing left to buy that made you
// stronger (the bots held 20-40k at day 100 with ~17k a day coming in). In town a unique can be awakened up to AWAKEN_MAX times: each rank
// adds AWAKEN_K of its own stats (army slots and mana per turn excepted) and costs gold, bone dust and hearts of the boss or warden that
// drops it, so a cleared gate's boss hearts and the Tower's wardens keep paying long after their first unique. it.aw = ranks.
// Cost per rank n (0-based): gold AWAKEN_GOLD x scale x AWAKEN_GROW^n, dust AWAKEN_DUST x scale x (n+1), n+1 hearts; scale 1 for the Rat Warren's
// unique up to 2 for the Throne's, and 1.2-3 up the Tower. Five ranks of a Throne unique cost ~250k gold.
const AWAKEN_MAX=5, AWAKEN_K=.08, AWAKEN_GOLD=4000, AWAKEN_GROW=2, AWAKEN_DUST=20, AWAKEN_FLAT={slot:1,regen:1};
const AWAKEN_TXT='Each rank adds '+Math.round(AWAKEN_K*100)+'% to the unique\'s own stats (army slots and mana per turn excepted), up to '+AWAKEN_MAX+' ranks. It costs gold, bone dust and hearts of the boss or warden that drops it.';
const AWAKEN_RN=['','I','II','III','IV','V'];
function uniqHeart(id){ const d=ITEM[id]; if(!d||!d.uq) return null; return 'b:'+(d.rival?DUNGEONS[5].boss[0]:d.tower?TW_BOSS[clamp(Math.round(d.floor/10)-1,0,TW_BOSS.length-1)]:DUNGEONS[d.set].boss[0]); }   // the trophy key of its boss's heart
const awakenScale=d=>d.tower?1+d.floor/50:1+d.set*.2;
function awakenCost(it){ const d=ITEM[it&&it.id]; if(!d||!d.uq||(it.aw|0)>=AWAKEN_MAX) return null; const n=it.aw|0, k=awakenScale(d);
  return {g:Math.round(AWAKEN_GOLD*k*Math.pow(AWAKEN_GROW,n)/100)*100, d:Math.round(AWAKEN_DUST*k*(n+1)), h:n+1, key:uniqHeart(it.id)}; }
const awakenTotal=set=>{ let g=0; const it={id:'u'+set}; for(let n=0;n<AWAKEN_MAX;n++){ it.aw=n; g+=awakenCost(it).g; } return g; };   // the Codex's figure: all five ranks of a gate's unique
const canAwaken=it=>{ const c=awakenCost(it); return !!c&&S.mode==='town'&&workOpen()&&S.gold>=c.g&&(S.dust||0)>=c.d&&(S.trophies[c.key]||0)>=c.h; };
function awaken(u){
  const it=findItem(u); if(!it||!canAwaken(it)) return false; const c=awakenCost(it);
  S.gold-=c.g; S.dust-=c.d; S.trophies[c.key]-=c.h; if(!S.trophies[c.key]) delete S.trophies[c.key];
  vitals(()=>{ it.aw=(it.aw|0)+1; }); tally('awakened'); tally('awakenG',c.g); sfx('level'); return true;
}
function heartsKept(k){   // hearts of this kind that the uniques you hold still need to reach their last rank ("Sell all" keeps these)
  let n=0; for(const it of S.inv.concat(Object.values(S.equip))) if(it&&ITEM[it.id]&&ITEM[it.id].uq&&uniqHeart(it.id)===k) for(let r=(it.aw|0);r<AWAKEN_MAX;r++) n+=r+1;
  return n; }
function enchant(u,line){   // line < 0 adds a line; otherwise re-rolls that line
  const it=findItem(u); if(!it||S.mode!=='town'||ITEM[it.id].uq) return false;
  const c=enchCost(it), ro=it.ro||[]; if((S.dust||0)<c) return false;
  if(line<0){ if(ro.length>=lineMax(it)) return false; } else if(!ro[line]) return false;
  S.dust-=c;
  vitals(()=>{ const r=ro.slice(); if(line<0) r.push(rollLine(it,r.map(x=>x[0]))); else r[line]=rollLine(it,r.filter((x,i)=>i!==line).map(x=>x[0])); it.ro=r; });
  tally('enchanted'); sfx('level'); return true;
}

// ===== SIEGE NIGHTS =====
// The town fears the necromancer. Once the Town tab is open and the town has SIEGE_BUILT building levels, the living march on the
// necropolis every SIEGE_GAP days (drawn from the day, not from Math.random, so no other roll moves). The dawn before, a notice and
// a banner on the Town tab warn of it. When the siege day ends (last watch or Rest until dawn), after tonight's raids have marched,
// the player defends: SIEGE_WAVES waves on the normal battle screen, the between-room heal between waves, no doors, events or
// raising until the last wave falls. Downed minions never shatter (home ground); a defeat costs no XP. Curses, omens and difficulty
// do not apply. Each built building lends a perk (siegePerk). Victory: gold worth about SIEGE_GOLD clears of the deepest open gate,
// bone dust and one piece of that gate's gear with a bonus line. Defeat: one built building is damaged (its effects, perk included,
// are off) until repaired for SIEGE_REPAIR of its current level's gold; while one is damaged a defeat costs SIEGE_FINE of your gold
// instead (at most SIEGE_FINE_MAX clears' worth). Nothing is ever deleted. A siege in progress is kept in the save as pending:
// reloading starts it again from wave 1.
// S.siege = {next: day the siege comes at dusk (0: not scheduled), pending: true from nightfall until it is fought, dmg: damaged
// building key or null, warned: last day a warning was given, guard and wall: tonight's choices on the intro screen (see below)}.
// Guard and wall (intro screen, that night only): one built building is guarded, so a defeat burns one of the others (none left: the fine);
// up to SIEGE_WALL Reserve minions hold the wall. They fight this siege in the army's front row (m.wall: no army place, their Reserve
// places stay theirs) and go back to the Reserve when it ends, or when the game is saved mid-siege. Fought and won are tallies (S.ti.sieges, S.ti.siegeWins), kept through New Game+.
// Tuned 2026-11-19 (full bot, 40 bots x 100 days): at x1.0 foes the bot held 97% and gained 1.4 levels by day 100; at HP x1.5, attack x1.5
// and 60% XP from the living it holds 83% (seed 7700) and 87% (9100), +0.5/+0.4 levels over "off":["siege"], gates within 2 points.
// Pay lowered the same day for the full heat:0 guard rail: XP from the living 60% -> 40%, gold 2 -> 1.5 clears (held 85% heat:0, 83% default).
// HP x1.5 -> x1.4 the same day after the gate retune (harder S foes): held 79-81% -> 84% (seed 7700) and 81% (9100).
// HP x1.4 -> x1.7, attack x1.5 -> x1.8 the same day after the stat rebalance (minions hit harder): held 91% -> 85% on both seeds.
// HP x1.7 -> x2.4, attack x1.8 -> x2.5 the same day after rows, foe intents, bonds and mausoleums: held 91% -> 86% (7700) and 84% (9100).
const SIEGE_BUILT=2, SIEGE_GAP=[7,10], SIEGE_WAVES=3, SIEGE_LV=1, SIEGE_HP=2.2, SIEGE_ATK=2.5, SIEGE_XP=.4, SIEGE_BOSS_LV=1, SIEGE_MOVE='decree',
  SIEGE_GOLD=1.5, SIEGE_DUST=1, SIEGE_DROP=.5, SIEGE_REPAIR=.5, SIEGE_FINE=.1, SIEGE_FINE_MAX=1,
  SIEGE_CRYPT=.05, SIEGE_OSS_GAP=2, SIEGE_ALT=.10, SIEGE_FORGE=.05, SIEGE_WALL=2;
const SIEGE_FOES={vanguard:['Militia Spearman',1.3,.85],striker:['Crossbowman',.9,1.25],mender:['Chaplain',.8,.8],reaper:['Witch-hunter',1.1,1.2]};   // [name, hp factor, atk factor]
const SIEGE_BOSS='Inquisitor Captain';
const SIEGE_WAVE=[['vanguard','vanguard','striker'],['vanguard','striker','mender','reaper'],['boss','vanguard','striker','mender']];   // the witch-hunter is always an elite
const SIEGE_NAMES=Object.values(SIEGE_FOES).map(f=>f[0]).concat([SIEGE_BOSS]);
const SIEGE_PERK={
  crypt:  {t:n=>'minions have +'+b100(SIEGE_CRYPT*n)+'% max HP',                         d:'Minions have +'+b100(SIEGE_CRYPT)+'% max HP per level.'},
  ossuary:{t:n=>'a fallen attacker rises for you at waves 2 and 3, at its level -'+SIEGE_OSS_GAP*Math.max(0,SIEGE_OSS_REF+1-n), d:'At the start of waves 2 and 3 one fallen attacker rises to fight for you for the rest of the siege, '+SIEGE_OSS_GAP*SIEGE_OSS_REF+' levels below its own at level 1 and '+SIEGE_OSS_GAP+' fewer per level.'},
  altar:  {t:n=>'waves 2 and 3 start with +'+b100(SIEGE_ALT*n)+'% mana',                d:'Waves 2 and 3 start with +'+b100(SIEGE_ALT)+'% of your max mana per level.'},
  forge:  {t:n=>'attackers have '+b100(SIEGE_FORGE*n)+'% less armor',                    d:'Attackers have '+b100(SIEGE_FORGE)+'% less armor per level.'}
};
const blRaw=k=>(S&&S.build&&S.build[k])||0;   // the level built, damaged or not (bl is what works)
const sg=()=>{ if(!S.siege) S.siege={next:0,pending:false,dmg:null,warned:0}; return S.siege; };
const builtLevels=()=>Object.keys(BUILD).reduce((a,k)=>a+blRaw(k),0);
let siegeOpen=()=>!!S&&townOpen()&&builtLevels()>=SIEGE_BUILT;   // let: the balance bot switches sieges off with "off":["siege"]
const siegeTonight=()=>!!S&&siegeOpen()&&sg().next>0&&S.day>=sg().next;
const siegeWarned=()=>!!S&&siegeOpen()&&sg().next>0&&S.day>=sg().next-1;   // the day before and the day itself
const siegeGate=()=>topGate();
const siegeLvl=()=>Math.max(1,S.player.lvl-SIEGE_LV);
function siegeGap(){ let a=(Math.imul(S.day+1,2654435761)^Math.imul(T_('sieges')+7,40503)^Math.imul((S.ngp||0)+3,97))>>>0; a^=a>>>15; a=Math.imul(a,2246822519)>>>0; a=(a^(a>>>13))>>>0; const G=dreadGap(); return G[0]+a%(G[1]-G[0]+1); }   /* the town's dread sets the gap (game-dread.js) */   // a hash of the day: Math.random is never touched
function siegeTick(){   // dawn, load and building: schedule the next siege, and warn the dawn before it
  if(!S||!siegeOpen()) return; const g=sg();
  if(!g.next||g.next<S.day) g.next=S.day+siegeGap();
  if(S.day>=g.next-1-bellAhead()&&S.day<g.next&&!(g.warned>=g.next-1-bellAhead())){   /* the Bell Tower warns earlier (game-town2.js) */ g.warned=S.day; tally('siegeWarned'); notify('The living march on the necropolis tomorrow at dusk. When the day ends they will be at the walls. The Codex has a page on sieges.','bad'); }
}
function siegeHpMul(m){ return S&&S.run&&S.run.siege&&!m.thrall?1+SIEGE_CRYPT*bl('crypt'):1; }   // the Crypt's perk, for the length of the siege
function siegeArmorK(){ return 1-SIEGE_FORGE*bl('forge'); }
const siegePerks=()=>Object.keys(BUILD).filter(k=>SIEGE_PERK[k]&&bl(k)>0).map(k=>({k,name:BUILD[k].name,t:SIEGE_PERK[k].t(bl(k))}));
const guardable=()=>Object.keys(BUILD).filter(k=>blRaw(k)>0&&sg().dmg!==k);
const guardDefault=()=>guardable().reduce((a,k)=>a&&blRaw(a)>=blRaw(k)?a:k,null);   // the highest-level building standing
const wallPool=()=>(S.reserve||[]).slice();   // raiders and minions waiting at the gate are not in the Reserve
function siegeGuard(k){ if(S.mode!=='siege'||!guardable().includes(k)) return false; sg().guard=k; return true; }
function siegeWallPick(uid){   // toggle a Reserve minion for the wall, at most SIEGE_WALL
  if(S.mode!=='siege') return false; const g=sg(), w=g.wall=(g.wall||[]).filter(u=>wallPool().some(m=>m.uid===u));
  if(w.includes(uid)){ g.wall=w.filter(u=>u!==uid); return true; }
  if(w.length>=SIEGE_WALL||!wallPool().some(m=>m.uid===uid)) return false; w.push(uid); return true;
}
function startSiege(){   // nightfall on a siege day: the intro screen. Dawn waits until it is fought.
  const g=sg(); g.pending=true; if(!guardable().includes(g.guard)) g.guard=guardDefault(); if(!Array.isArray(g.wall)) g.wall=[]; S.mode='siege'; S.run=null; S.notices=[]; sfx('warn');
}
function siegeFoe(role,lvl,di,boss,elite){
  const t=boss?[SIEGE_BOSS,1,1]:SIEGE_FOES[role], s=mobStats(di,lvl,t[1],t[2],boss,elite);
  const e={id:'e'+(++S.uid),name:t[0],base:t[0],role:boss?'reaper':role,rankI:di,lvl,hf:t[1],af:t[2],boss,elite,maxHp:Math.round(s.hp*SIEGE_HP),hp:0,atk:Math.max(1,Math.round(s.atk*SIEGE_ATK)),dead:false,living:true};
  e.hp=e.maxHp; if(boss){ giveAbility(e,SIEGE_MOVE); giveKit(e); } return e;
}
function spawnSiege(){   // one wave of the living
  const r=S.run, lvl=siegeLvl(), di=r.di, list=SIEGE_WAVE[r.room].map(k=>k==='boss'?siegeFoe('reaper',lvl+SIEGE_BOSS_LV,di,true,false):siegeFoe(k,lvl,di,false,k==='reaper'));
  if(r.room===r.rooms-1&&rivalSiegeNow()) rivalSiegeWave(list,r);   /* the rival's war, chapter 3 (game-rival-arc.js) */
  foeScale(list,DIFF.foeAtk[di]); affixAll(list); townSiegeWave(list,r);   /* the Bell Tower, the Library, the Apothecary (game-town2.js) */
  r.enemies=list; r.corpses=[]; r.events=[]; r.turn=1; r.fx={}; r.target=list[0].id; r.loot=[]; r.spoils=[]; r.lostLoot=[]; r.cmd={}; r.taunt=0; r.quiet=null;
  log('Siege, wave '+(r.room+1)+' of '+r.rooms+'. '+(r.room===r.rooms-1?(r.rivalSiege?rv().name+' comes through the smoke with your stolen dead.':'The Inquisitor Captain comes through the smoke.'+captainLine()):r.room?'More of the living climb the walls.':'Torches at the walls. The living have come for you.'));
  if(r.room&&bl('altar')){ const P=S.player, n=Math.round(pMana()*SIEGE_ALT*bl('altar')); P.mana=Math.min(pMana(),P.mana+n); log('The Altar answers: +'+n+' mana.','ok'); }
  if(r.room&&bl('ossuary')&&r.fallen&&r.fallen.length){ const c=r.fallen.splice(Math.floor(Math.random()*r.fallen.length),1)[0], lv=Math.max(1,c.lvl-SIEGE_OSS_GAP*Math.max(0,SIEGE_OSS_REF+1-bl('ossuary')));
    const m={uid:++S.uid,armed:false,eq:null,nick:freeNick(),name:c.name,kind:c.base,role:c.role,rankI:c.rankI,lvl:lv,lvl0:lv,xp:0,boss:false,elite:false,hf:c.hf,af:c.af,hp:1,maxHp:null,atk:0,stage:0,traits:[],thrall:true};
    syncMinion(m); m.hp=m.maxHp; S.army.push(m); log('The Ossuary stirs: '+m.nick+', once '+withArticle(c.base)+', rises to fight for you tonight.','ok'); }
  roomStart(list); if(liveFoes().some(e=>e.boss)) fxe('boss',list[0]);   /* a wave is a fresh fight: Swift, Stitched, room wards, pacts (roomStart plans the foes) */
}
function beginSiege(){
  if(S.mode!=='siege') return false; const di=siegeGate();
  S.run={siege:1,di,room:0,rooms:SIEGE_WAVES,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:null,heat:0,fallen:[]};
  const g=sg(), w=wallPool().filter(m=>(g.wall||[]).includes(m.uid)).slice(0,SIEGE_WALL); S.reserve=(S.reserve||[]).filter(m=>!w.includes(m)); w.forEach(m=>{ m.wall=true; S.army.push(m); });
  S.mode='battle'; syncArmy(); S.army.forEach(m=>{ m.hp=m.maxHp; }); titheSouls(); allyAid(S.run);   /* the spared rival holds the first wave (game-rival-arc.js) */
  spawnSiege(); return true;
}
function nextWave(){   // between waves: the usual between-room heal, then the next wave at once
  const r=S.run, P=S.player;
  r.fallen=(r.fallen||[]).concat(r.corpses.filter(c=>!c.boss)); r.corpses=[];
  P.hp=Math.min(pMax(),P.hp+Math.round(pMax()*DIFF.heal)); P.mana=Math.min(pMana(),P.mana+Math.round(pMana()*DIFF.mana)); P.shield=0;
  S.army.forEach(m=>{ if(m.hp<=0) m.hp=Math.ceil(m.maxHp*.4); m.hp=Math.min(m.maxHp,m.hp+Math.round(m.maxHp*DIFF.mheal)); });
  r.cd={}; r.frenzy=0; r.silence=0; r.event=null; r.doors=null; allies().forEach(clearAll); r.room++; r.roomKind='fight';
  const ev=r.events; spawnSiege(); for(const x of ev) log(x.m,x.c==='bad'?'bad':'ok');
}
const siegeGoldPay=()=>{ const di=siegeGate(), lv=RK[di].lv+1; return Math.round(SIEGE_GOLD*20*(1+lv*.5)*(1+di*.5)*ngpReward()*siegePayK()); };   /* the War Room, the Belfry */   // a clear is about 20 kills' worth of coin at the gate's level
function siegeWon(r){   // the last wave falls: pay, and the raise screen for its bodies
  const di=r.di, g=siegeGoldPay(), d=Math.round(SIEGE_DUST*(6+Math.floor(S.player.lvl/4))*(1+BOUNTY_GATE*di)*siegeDustK()); r.cleared=true; S.quest.clears++;
  S.gold+=g; S.dust=(S.dust||0)+d; tally('sieges'); tally('siegeWins'); sg().pending=false; sg().next=0;   /* settled: a reload from the raise screen does not fight it again */
  const id=pickNorm(tableFor(di,'reaper',true,false).filter(x=>!ITEM[x.id].uq&&(ROLL_LINES[ITEM[x.id].tier]||[0])[0]>0)), it=addItem(id,rollItem(id,true));   /* a tier that can carry a bonus line */
  if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } else r.lostLoot.push(ITEM[id].name);
  r.siegePay={g,d,item:it?ITEM[id].name:null}; townSiegeWon(r); if(r.rivalSiege) rivalSiegeWon(r);   /* the Embalmery keeps a body */
  r.events.push({m:'The living break and run. The town will remember this night. +'+g+' gold, +'+d+' bone dust'+(it?' and '+withArticle(ITEM[id].name)+' from the dead':'')+'.',c:'ok'});
  if(sg().guard&&BUILD[sg().guard]) r.events.push({m:'The '+BUILD[sg().guard].name+' stood under your guard all night.',c:'ok'});
  moment('The necropolis holds','gold'); return Math.round(RK[di].clear*SIEGE_XP);
}
function siegeLost(fled){   // fell or fled: the town pays. Nothing is deleted; a damaged building is repaired in town.
  const g=sg(), r=S.run; let m;
  const gd=g.guard&&blRaw(g.guard)>0&&g.dmg!==g.guard?g.guard:null, ks=Object.keys(BUILD).filter(x=>blRaw(x)>0&&x!==gd), why=fled?'You left the walls to the living. ':'The living broke through. ';
  if(!g.dmg&&ks.length){ const k=pick(ks); vitals(()=>{ g.dmg=k; }); if(k==='crypt') siegeOverflow();
    m=why+'They fired the '+BUILD[k].name+': its effects are lost until you repair it in town for '+repairCost()+' gold.'+(gd?' The '+BUILD[gd].name+' you guarded was spared.':''); }
  else { const f=Math.round(Math.min(S.gold*SIEGE_FINE,siegeGoldPay()*SIEGE_FINE_MAX/SIEGE_GOLD)); S.gold-=f;
    m=why+(g.dmg?'With the '+BUILD[g.dmg].name+' still in ruins they took what they could carry instead: ':'With the '+BUILD[gd].name+' under guard they took what they could carry instead: ')+f+' gold.'; }
  tally('sieges'); tally('siegeLosses'); dread(DREAD_SIEGE_LOST); g.pending=false; g.next=0; if(r){ r.siegeLoss=m; r.lost=true; if(r.rivalSiege) rivalSiegeLost(r); } return m;
}
function siegeOverflow(){ const n=S.army.filter(m=>!m.thrall&&!m.wall).length-slots();   /* only those at home: raiders' places sort themselves out at dawn */ if(n<=0) return; const out=S.army.filter(m=>!m.thrall&&!m.wall).slice(-n); S.army=S.army.filter(m=>!out.includes(m)); const w=homeLine(out.map(placeMinion)); if(w) notify(('The Crypt burned: '+w).trim(),'bad'); }
function siegeEnd(){   // back from the walls (won, fell or fled): thralls crumble, the record is written, then dawn
  const r=S.run, g=sg(), w=S.army.filter(m=>m.wall); S.army=S.army.filter(m=>!m.thrall&&!m.wall); S.mode='town';
  if(r){ const res=r.cleared?'cleared':r.fled?'fled':'fell'; recordRun(S,r,res); recRun(r,res); }
  S.run=null; g.pending=false; g.next=0; delete g.guard; delete g.wall; wallHome(S,w); syncArmy();
  const P=S.player; P.hp=pMax(); P.mana=pMana(); P.shield=0; allies().forEach(clearAll); S.army.forEach(m=>m.hp=m.maxHp);
  closeDay(); if(r&&r.siegeLoss) notify(r.siegeLoss,'bad'); else if(r&&r.siegePay) notify('Last night the necropolis held against the living: +'+r.siegePay.g+' gold, +'+r.siegePay.d+' bone dust.','ok');
}
function wallHome(s,w){ for(const m of w){ delete m.wall; if(s===S) benchRest(m); else { delete m.dots; delete m.st; m.hp=m.maxHp; } (s.reserve=s.reserve||[]).push(m); } }   // the wall's minions back to the Reserve (s: the live game, or a save copy)
const repairCost=()=>{ const k=sg().dmg; if(!k) return 0; const lv=blRaw(k); return Math.round(BUILD_COST[Math.max(0,lv-1-(BUILD[k].step||0))][0]*SIEGE_REPAIR); };
function repairBuilding(){ const g=sg(), c=repairCost(); if(S.mode!=='town'||!g.dmg||S.gold<c) return false; S.gold-=c; vitals(()=>{ g.dmg=null; }); sfx('level'); return true; }
