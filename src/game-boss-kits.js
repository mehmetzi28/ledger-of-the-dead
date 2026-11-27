// ===== BOSS KITS =====
// Every gate boss, the rival and the Inquisitor Captain fight with a move set (BOSS_KIT): two or three moves on a rotation the
// card shows (e.kit, e.kitIx; e.abil is always the next move), a second phase of its own (a twist: TWISTS), a personal
// resistance entry (e.res, read by foeRes) and, for some, a hazard: a rule for the whole room while the boss stands (HAZARDS).
// Bosses never carry R1 kits; their adds do. Run-only fields: e.kit, e.kitIx, e.mvN (moves made), e.twist, e.imm (immune to one
// type), e.edictT (the minion an Edict names), e.seed (a seedling's birth turn), e.rallied; on minions m.lock and m.root (the turn
// they act again). The old single moves stay for secret masters and Tower wardens (R2 PR B), and with BOSS_KITS_ON false.
let BOSS_KITS_ON=true;   // the bots' "off":["bosskits"] switch, for measurement
Object.assign(BOSS_ABIL,{
  gnaw:      {name:'Gnaw',               every:3,warn:false,desc:'Bites the sturdiest unit of your front row (you, if none) for 140% of its attack, and the wound bleeds.'},
  lock:      {name:'Keymaster\'s Lock',  every:4,warn:true, desc:'Locks your strongest minion away for 2 turns: it cannot act and cannot be hit.'},
  bash:      {name:'Shield Bash',        every:3,warn:false,desc:'Strikes a front-row minion (you, if none) for 120% of its attack and Sunders it.'},
  burnground:{name:'Burning Ground',     every:3,warn:false,desc:'Sets your front row alight: each unit there burns for 25% of its attack for 3 turns.'},
  lance:     {name:'Ember Lance',        every:4,warn:true, desc:'A fire lance at your back row: 160% of its attack on one back-row unit (you, if no minion stands there). Ward soaks it.'},
  tithe:     {name:'Tithe of Teeth',     every:4,warn:false,desc:'Takes 20% of your max mana and mends itself for 8% of its max HP.'},
  bite:      {name:'Bite of Faith',      every:3,warn:false,desc:'Strikes your strongest minion for 110% of its attack and hexes it for 2 turns.'},
  ironthorns:{name:'Iron Thorns',        every:4,warn:false,desc:'Roots your strongest minion for 2 turns: it cannot act and rots each turn.'},
  graft:     {name:'Graft',              every:4,warn:false,desc:'Drinks one of its seedlings to mend 10% of its max HP. With no seedling standing it skips to its next move.'},
  summons:   {name:'Court Summons',      every:4,warn:false,desc:'Calls two Throne Guards to its side.'},
  edict:     {name:'Edict of Ash',       every:5,warn:true, desc:'Names one of your minions. If it still stands when the Edict lands, it is executed. Guard or Taunt onto another vanguard saves it; freezing breaks it. Twice a fight at most.'},
  mirror:    {name:'What the Book Gave Me',every:3,warn:false,desc:'Turns the last skill you used back on you.'},
  rampart:   {name:'Bone Rampart',       every:4,warn:false,desc:'Shields every follower for 20% of its max HP (a shield holds at most 40%).'},
  called:    {name:'Called Shot',        every:4,warn:true, desc:'A focused crit at your back row: 180% of its attack on one back-row unit (you, if no minion stands there). Ward soaks it.'},
  blackmass: {name:'Black Mass',         every:4,warn:false,desc:'Mends every follower for 15% of its max HP.'},
  harvest:   {name:'Harvest',            every:3,warn:false,desc:'Executes a minion under 25% HP; with none that low, strikes the weakest for 120% of its attack.'},
  purge:     {name:'Purge',              every:4,warn:false,desc:'Your strongest evolved minion (or strongest) is Hexed and Sundered for 3 turns, and your side loses its Bone Shields.'},
  rally:     {name:'Rally',              every:5,warn:false,desc:'Every foe standing gains 20% attack for the rest of the wave (once each).'}
});
const TWISTS={
  crown:{name:'Crown of Rats',  desc:'Each Call the Swarm calls three, and the rats it calls are Pack hunters.'},
  watch:{name:'The Last Watch', desc:'While any Bone Wall shield stands, it reflects 20% of the damage it takes onto whoever struck it.'},
  burn: {name:'Let It Burn',    desc:'Immune to fire, takes 25% more frost, and every second move is a Cinder Wave.'},
  choir:{name:'The Choir Answers',desc:'While your skills are silenced, its adds are Hasted: each strikes again at the end of the turn.'},
  bloom:{name:'Bloom',          desc:'A seedling that lives two turns matures into a Thorn Troll.'},
  book: {name:'What the Book Gave Me',desc:'Every third move turns the last skill you used back on you.'}
};
const HAZARDS={
  smoke:{name:'Smoke',          desc:'Bone Ward raises 20% less while it stands.'},
  nave: {name:'Echoing nave',   desc:'Your first skill each fight costs double mana.'},
  roots:{name:'Roots',          desc:'While it stands, each of your back-row minions takes 5% of its max HP as rot at the end of every turn.'}
};
const BOSS_KIT={
  'The Rat King':      {moves:['swarm','gnaw'],                twist:'crown', res:{rot:.25,fire:-.25}},
  'The Crypt Warden':  {moves:['bonewall','lock','bash'],      twist:'watch', res:{fire:.25,frost:-.25}},
  'The Ember Knight':  {moves:['cinder','burnground','lance'], twist:'burn',  res:{fire:.5,frost:-.25},  hazard:'smoke'},
  'The Bishop of Teeth':{moves:['hymn','tithe','bite'],        twist:'choir', res:{shad:.25,phys:-.25},  hazard:'nave'},
  'The Orchard Mother':{moves:['seedfall','ironthorns','graft'],twist:'bloom',res:{phys:.25,rot:-.25},   hazard:'roots'},
  'The Pale Sovereign':{moves:['decree','summons','edict'],    twist:'book',  res:{fire:.25,shad:.25,frost:-.25}},
  'Inquisitor Captain':{moves:['decree','purge','rally']}
};
const RIVAL_MOVE={vanguard:'rampart',striker:'called',mender:'blackmass',reaper:'harvest'};
const BK_EDICTS=2, BK_REFLECT=.2, BK_SMOKE=.8, BK_ROOTS=.05, BK_RALLY=1.2, BK_MIRROR=.3, BK_EDICT_HIT=2.2;
const bossKitOf=e=>e&&!e.secret&&!e.tw?BOSS_KIT[e.base]||null:null;
function giveKit(e,moves){   // after giveAbility: a move set replaces the single move
  if(!BOSS_KITS_ON) return e; const K=BOSS_KIT[e.base]; moves=moves||(K&&K.moves); if(!moves||moves.length<2) return e;
  e.kit=moves.slice(); e.kitIx=0; e.mvN=0; e.abil=e.kit[0]; e.abilT=BOSS_ABIL[e.abil].every-(e.fast||0);
  if(K&&K.res){ e.res=Object.assign({},e.res||{}); for(const t in K.res) e.res[t]=(e.res[t]||0)+K.res[t]; }
  return e;
}
const seedlings=e=>liveFoes().filter(o=>o!==e&&o.seed!=null);
function nextMove(e){   // after a move fires (or is broken): the rotation moves on
  if(!e.kit) return; e.mvN=(e.mvN||0)+1;
  if(e.twist==='book'&&e.mvN%3===2){ e.abil='mirror'; return; }   /* every third move: the book */
  for(let i=0;i<e.kit.length;i++){ e.kitIx=(e.kitIx+1)%e.kit.length; e.abil=e.kit[e.kitIx]; if(!kitNeeds[e.abil]||kitNeeds[e.abil](e)) break; }   /* Graft and Feed wait for their fodder */
}
const bossNext=e=>{ if(!e.kit) return []; const out=[e.abil]; let ix=e.kitIx; for(let i=1;i<e.kit.length;i++){ ix=(ix+1)%e.kit.length; out.push(e.kit[ix]); } return out; };   // the rotation from the next move on (the card)
function bossTwist(e){   // the second phase of a boss with a kit
  const K=BOSS_KIT[e.base]; if(!e.kit||!K||!K.twist) return null; e.twist=K.twist; e.p2d=S.army.filter(m=>m.hp<=0).length;   /* p2d: minions down when phase two began (the titles) */
  guardTwist(e);
  if(e.twist==='burn'){ e.imm='fire'; e.res=Object.assign({},e.res||{}); e.res.frost=(e.res.frost||0)-.25; e.kit=['cinder','burnground','cinder','lance']; e.kitIx=e.kit.indexOf(e.abil); if(e.kitIx<0){ e.kitIx=0; e.abil='cinder'; } }
  return TWISTS[e.twist];
}
const hazardOn=h=>!!S.run&&!!S.run.enemies&&S.run.enemies.some(e=>e.hp>0&&e.kit&&(BOSS_KIT[e.base]||{}).hazard===h);
const smokeK=()=>hazardOn('smoke')?BK_SMOKE:1;
const naveK=()=>hazardOn('nave')&&!S.run.naveU?2:1;
const lockedNow=a=>a.id!=='p'&&((a.lock||0)>S.run.turn||(a.root||0)>S.run.turn);   // cannot act this turn (the minion phase skips it)
const hittable=a=>a.hp>0&&!(a.id!=='p'&&(a.lock||0)>S.run.turn);   // a locked minion cannot be hit
const strongestMinion=()=>S.army.filter(hittable).sort((a,b)=>b.atk-a.atk)[0]||null;
function backTarget(){ const b=S.army.filter(m=>hittable(m)&&rowOf(m)==='b'); return b.length?pick(b):S.player; }
function frontTarget(){ const f=S.army.filter(m=>hittable(m)&&rowOf(m)==='f').sort((a,b)=>b.maxHp-a.maxHp); return f[0]||S.player; }
function bossHit(e,tg,mul,ty,mv){   // one blow from a boss move: ward, Guard and the Soul Tether as for any boss move
  const d=hit(e.atk*mul*enrage(e)*rbWard()); BLOW={n:e.name,k:'sig',mv}; const got=hurtAlly(tg,d,ty); BLOW=null; fxe('hurt',tg,{crit:1}); if(tg.hp<=0&&tg.id!=='p') log(tg.nick+' is down.','bad'); return got; }
// the new moves (fireAbility hands every move it does not know to this)
function fireKitMove(e,mv){
  const r=S.run, P=S.player, A=BOSS_ABIL[mv], foes=liveFoes();
  if(GUARD_MV.includes(mv)&&guardMove(e,mv)) return;   /* the Rift's guardians (game-rift.js) */
  if(mv==='gnaw'){ const t=frontTarget(), d=bossHit(e,t,1.4,foeHitType(e),mv); addDot(t,'bleed',e.atk*.3,2); log(e.name+' gnaws '+(t.id==='p'?'you':nameOf(t))+' for '+d+'. The wound bleeds.','bad'); }
  else if(mv==='lock'){ const m=strongestMinion(); if(m){ m.lock=r.turn+3; log(e.name+' turns the Keymaster\'s Lock: '+m.nick+' is locked away for 2 turns.','bad'); fxe('ward',m); } else log(e.name+' turns its keys, but no minion is there to lock.','ok'); }
  else if(mv==='bash'){ const t=frontTarget(), d=bossHit(e,t,1.2,'phys',mv); addSt(t,'sundered',2); log(e.name+' bashes '+(t.id==='p'?'you':nameOf(t))+' with its shield for '+d+'. Sundered.','bad'); }
  else if(mv==='burnground'){ const f=allies().filter(a=>hittable(a)&&rowOf(a)==='f'); f.forEach(a=>addDot(a,'burn',e.atk*.25,3)); log(e.name+' sets the ground alight: '+(f.length?f.length+' of yours burn for 3 turns':'no one stands in front')+'.','bad'); }
  else if(mv==='lance'||mv==='called'){ const t=backTarget(), d=bossHit(e,t,mv==='lance'?1.6:1.8,mv==='lance'?'fire':foeHitType(e),mv); log(e.name+(mv==='lance'?' hurls an Ember Lance at ':' takes a Called Shot at ')+(t.id==='p'?'you':nameOf(t))+' for '+d+'.','bad'); }
  else if(mv==='tithe'){ const m=Math.min(P.mana,Math.round(pMana()*.2)); P.mana-=m; const h=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*.08*blightK(e))); e.hp+=h; log(e.name+' takes the Tithe of Teeth: '+m+' of your mana, and mends '+h+'.','bad'); }
  else if(mv==='bite'){ const t=strongestMinion()||P, d=bossHit(e,t,1.1,'shad',mv); addSt(t,'hexed',2); log(e.name+' bites '+(t.id==='p'?'you':nameOf(t))+' for '+d+'. Hexed.','bad'); }
  else if(mv==='ironthorns'){ const m=strongestMinion(); if(m){ m.root=r.turn+3; addDot(m,'poison',e.atk*.15,2); log(e.name+' drives Iron Thorns through '+m.nick+': rooted for 2 turns, and rotting.','bad'); } else log(e.name+' grows thorns, but no minion stands to root.','ok'); }
  else if(mv==='graft'){ const s=seedlings(e).sort((a,b)=>a.hp-b.hp)[0]; if(s){ S.run.enemies=S.run.enemies.filter(o=>o!==s); const h=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*.1*blightK(e))); e.hp+=h; log(e.name+' grafts '+s.name+' back into herself and mends '+h+'.','bad'); } }
  else if(mv==='summons'){ const got=[]; for(let i=0;i<2;i++){ const a=summonAdd(e,'Throne Guard'); if(a) got.push(a); } log(got.length?e.name+' issues a Court Summons: '+got.map(x=>x.name).join(' and ')+' join the fight.':e.name+' summons the court, but no one answers.','bad'); }
  else if(mv==='edict') edictLands(e);
  else if(mv==='mirror') mirrorLands(e);
  else if(mv==='rampart'){ const f=foes.filter(o=>o!==e); f.forEach(o=>{ o.shield=Math.min(Math.round(o.maxHp*.4),(o.shield||0)+Math.round(o.maxHp*.2)); fxe('ward',o); }); log(e.name+' raises a Bone Rampart over '+(f.length?'its followers':'no one')+'.','bad'); }
  else if(mv==='blackmass'){ const f=foes.filter(o=>o!==e); f.forEach(o=>{ o.hp=Math.min(o.maxHp,o.hp+Math.round(o.maxHp*.15*blightK(o))); }); log(e.name+' says a Black Mass. Its followers mend.','bad'); }
  else if(mv==='harvest'){ const low=S.army.filter(m=>hittable(m)&&m.hp<m.maxHp*.25).sort((a,b)=>a.hp-b.hp)[0];
    if(low){ low.hp=0; fxe('death',low); log(e.name+' harvests '+low.nick+'. It is down.','bad'); }
    else { const w=S.army.filter(hittable).sort((a,b)=>a.hp-b.hp)[0]||P, d=bossHit(e,w,1.2,'shad',mv); log(e.name+' reaps at '+(w.id==='p'?'you':nameOf(w))+' for '+d+'.','bad'); } }
  else if(mv==='purge'){ const L=S.army.filter(hittable), m=L.filter(x=>x.stage>0).sort((a,b)=>b.atk-a.atk)[0]||L.sort((a,b)=>b.atk-a.atk)[0];
    S.army.forEach(x=>{ delete x.mw; }); if(m){ addSt(m,'hexed',3); addSt(m,'sundered',3); } log(e.name+' calls a Purge'+(m?': '+m.nick+' is Hexed and Sundered':'')+'. Your Bone Shields crumble.','bad'); }
  else if(mv==='rally'){ let n=0; foes.forEach(o=>{ if(!o.rallied){ o.rallied=1; o.atk=Math.round(o.atk*BK_RALLY); n++; } }); log(e.name+' rallies the militia: '+n+' foes hit harder.','bad'); }
  else return fireKitMove2(e,mv);
  return true;
}
function edictTarget(e){ const m=strongestMinion(); e.edictT=m?fxKey(m):null; return m; }   // named when the Edict is gathered
function edictLands(e){
  e.edicts=(e.edicts||0)+1; const r=S.run, m=S.army.find(x=>fxKey(x)===e.edictT&&x.hp>0); delete e.edictT;
  if(!m){ const d=Math.round(pMax()*.35*enrage(e)); BLOW={n:e.name,k:'sig',mv:'edict'}; hurtAlly(S.player,d); BLOW=null; log(e.name+'\'s Edict of Ash finds no one named and strikes you for '+d+'.','bad'); return; }
  const g=r.guard===r.turn&&guardFront(), v=r.taunt>0&&S.army.filter(x=>x!==m&&x.role==='vanguard'&&hittable(x));
  const sub=g&&g!==m?g:v&&v.length?pick(v):null;
  if(sub){ if(g&&sub===g) delete r.guard; const d=hit(e.atk*BK_EDICT_HIT*enrage(e)); hurtAlly(sub,d); fxe('hurt',sub,{crit:1}); tally('edictSaved'); log(sub.nick+' steps under the Edict of Ash for '+m.nick+' and takes '+d+'.','ok'); if(sub.hp<=0) log(sub.nick+' is down.','bad'); return; }
  m.hp=0; fxe('death',m); log('The Edict of Ash is carried out: '+m.nick+' is executed.','bad');
}
function mirrorLands(e){
  const P=S.player, id=S.run.lastSk, foes=liveFoes();
  if(!id){ const d=Math.round(pMax()*.45*enrage(e)); BLOW={n:e.name,k:'sig',mv:'decree'}; hurtAlly(P,d); BLOW=null; log(e.name+' has nothing of yours to copy and speaks a Royal Decree for '+d+'.','bad'); return; }
  const nm=SKILL[id].name;
  if(id==='mend'){ foes.forEach(o=>{ o.hp=Math.min(o.maxHp,o.hp+Math.round(o.maxHp*.15*blightK(o))); }); log(e.name+' turns your '+nm+' to its own: every foe mends.','bad'); }
  else if(id==='curse'){ addSt(P,'sundered',2); log(e.name+' turns your '+nm+' on you: you are Sundered.','bad'); }
  else if(id==='frenzy'){ foes.forEach(o=>addSt(o,'hasted',2)); log(e.name+' turns your '+nm+' to its court: every foe is Hasted.','bad'); }
  else { const d=Math.round(pMax()*BK_MIRROR*enrage(e)); BLOW={n:e.name,k:'sig',mv:'mirror'}; hurtAlly(P,d,'shad'); BLOW=null; fxe('hurt',P,{crit:1}); log(e.name+' turns your '+nm+' back on you for '+d+'.','bad'); }
}
// ----- hooks
function bossHurt(e,d,ty){   // hurtFoe, after the damage: the Crypt Warden's Last Watch, then the masters' and wardens' rules
  bossHurt2(e,d,ty); guardHurt(e,d,ty);
  if(e.twist==='watch'&&d>0&&HITTER&&HITTER.hp>0&&liveFoes().some(o=>o.shield>0)){ const t=Math.max(1,Math.round(d*BK_REFLECT)), h=HITTER; HITTER=null; hurtAlly(h,t,'phys'); HITTER=h; }
}
function bossRoomTurn(){   // the start of the foes' phase: twists that act every turn
  const r=S.run, B=liveFoes().filter(e=>e.twist);
  for(const b of liveFoes()) if(b.boss&&b.kit) bossRoomTurn2(b);
  for(const b of B){
    if(b.twist==='choir'&&r.silence>0) liveFoes().forEach(o=>{ if(o!==b) addSt(o,'hasted',1); });
    if(b.twist==='bloom'){ const th=DUNGEONS[4].mobs.find(m=>m[0]==='Thorn Troll'); if(th) for(const s of seedlings(b)) if(r.turn-s.seed>=2){
      const k=s.hp/s.maxHp; s.maxHp=Math.round(s.maxHp*th[2]/(s.hf||1)); s.hp=Math.max(1,Math.round(s.maxHp*k)); s.atk=Math.max(1,Math.round(s.atk*th[3]/(s.af||1)));
      s.name=(s.elite?s.name.split(' ')[0]+' ':'')+th[0]; s.base=th[0]; s.role=th[1]; s.hf=th[2]; s.af=th[3]; delete s.seed; delete s.it; delete s.it2; log(s.name+' matures out of the soil.','bad'); } }
  }
}
function bossEndTurn(){   // the end of the turn: hazards that tick
  guardEndTurn();
  if(hazardOn('roots')) S.army.forEach(m=>{ if(m.hp>0&&rowOf(m)==='b'){ hurtAlly(m,Math.max(1,Math.round(m.maxHp*BK_ROOTS)),'rot'); if(m.hp<=0) log(m.nick+' is dragged under by the roots.','bad'); } });
}
// ----- the rival's kit: shaped by the bodies it stole
function rivalKitMove(){ const st=(S.rival&&S.rival.stash)||[]; if(!st.length) return null; const n={}; st.forEach(b=>{ n[b.role]=(n[b.role]||0)+1; });
  return ['vanguard','striker','mender','reaper'].reduce((a,k)=>(n[k]||0)>(n[a]||0)?k:a,'vanguard'); }
const rivalKitName=()=>{ const k=rivalKitMove(); return k?BOSS_ABIL[RIVAL_MOVE[k]].name:''; };
// ----- what the Ledger shows
function bossKitTxt(name){   // the whole kit in words (the Codex, a Ledgered boss door)
  const K=BOSS_KIT[name]; if(!K) return ''; if(K.phases) return hungerKitTxt(); const P=[K.moves.map(m=>BOSS_ABIL[m].name).join(' · ')];
  if(K.twist) P.push('Second phase: '+TWISTS[K.twist].name,TWISTS[K.twist].desc); if(K.half) P.push('At half HP: '+HALVES[K.half].name,HALVES[K.half].desc); if(K.hazard) P.push('Hazard: '+HAZARDS[K.hazard].name,HAZARDS[K.hazard].desc); return P.join('. '); }
function bossRotChip(e){   // the rotation strip on a boss card (Known and up), and its hazard
  if(!e.kit||e.hp<=0) return ''; const kl=knowLv(e); let h='';
  { const L=bossNext(e).map(m=>BOSS_ABIL[m].name); h+=' &middot; <span class="kit" title="'+BOSS_ABIL[e.abil].desc+(kl>=2?' Its rotation: '+L.join(' → ')+'.':'')+'">Next: '+L[0]+(kl>=2&&L[1]?' → '+L[1]:'')+'</span>'; }   /* the rotation from Known */
  const K=BOSS_KIT[e.base]; if(K&&K.hazard) h+=' &middot; <span class="kit" title="'+HAZARDS[K.hazard].desc+'">Hazard: '+HAZARDS[K.hazard].name+'</span>';
  if(e.twist) h+=' &middot; <span class="phase-t" title="'+TWISTS[e.twist].desc+'">'+TWISTS[e.twist].name+'</span>';
  return h+bossChip2(e);
}
// ===== R2 PR B: SECRET MASTERS AND TOWER WARDENS =====
// Secret masters enter in phase two (and keep Sundering Blow between their moves); at half HP a second rule wakes (e.half, HALVES).
// Tower wardens fight with a signature move of their own beside the gate move they borrow; Abaddon rotates every signature and
// steals your Souls; abyssal wardens past floor 100 roll two signatures. Run-only: e.tide, e.molten, e.hw (heartwood), e.halo,
// e.chainT, e.blockT, e.barg, e.frostT, e.sigU; r.conf (Confession), r.cloud (Swarm Cloud), r.dirge; m.unw (Unwriting), m.prow.
Object.assign(BOSS_ABIL,{
  brood:     {name:'Brood',              every:3,warn:false,desc:'Calls two Marrow Mites. A mite that dies bursts into poison over your side.'},
  plague:    {name:'Plague Breath',      every:4,warn:true, desc:'Rot over your whole side: 50% of its attack to each unit, and each is poisoned.'},
  feed:      {name:'Feed',               every:4,warn:false,desc:'Eats one of its mites to mend 8% of its max HP. With no mite standing it skips to its next move.'},
  drown:     {name:'Drown',              every:3,warn:false,desc:'A frost blow at your strongest minion (you, if none) for 150% of its attack.'},
  litany:    {name:'Litany',             every:4,warn:false,desc:'Mends 2% of its max HP, and 2% more for each step of the tide.'},
  breath:    {name:'Breath Line',        every:4,warn:true, desc:'Fire down your front row: 120% of its attack to each unit there.'},
  molten:    {name:'Molten Scales',      every:4,warn:false,desc:'For 2 turns your melee hits on it burn back: 25% of each onto the attacker.'},
  tail:      {name:'Tail Sweep',         every:3,warn:false,desc:'Sweeps your back row: 80% of its attack to each unit there (you too).'},
  verse:     {name:'Verse of Binding',   every:4,warn:true, desc:'Silences your skills for 2 turns.'},
  crescendo: {name:'Crescendo',          every:3,warn:false,desc:'A shadow blow at you: 8% of your max HP, and 4% more for each verse it has sung. Ward soaks it.'},
  echoes:    {name:'Echoes',             every:5,warn:false,desc:'Two Hollow Choristers join its song.'},
  spread:    {name:'Spreading Roots',    every:4,warn:false,desc:'Roots your two strongest minions for 2 turns: they cannot act.'},
  heartwood: {name:'Heartwood',          every:4,warn:false,desc:'Takes 50% less damage for 2 turns.'},
  unwrite:   {name:'Unwriting',          every:4,warn:false,desc:'Your strongest minion forgets its traits for the rest of the fight.'},
  nothing:   {name:'Decree of Nothing',  every:5,warn:true, desc:'One blow worth 40% of your max HP. Ward soaks it.'},
  heads:     {name:'Three Heads',        every:3,warn:false,desc:'Three bites at random units of yours, each for 50% of its attack.'},
  moth:      {name:'Moth Light',         every:4,warn:false,desc:'Pulls your sturdiest back-row minion into the front row for the rest of the fight.'},
  confess:   {name:'Confession',         every:4,warn:true, desc:'You take 25% more damage until you raise Bone Ward.'},
  cloud:     {name:'Swarm Cloud',        every:4,warn:false,desc:'For 2 turns your minions miss one hit in five.'},
  dirge:     {name:'Dirge',              every:4,warn:false,desc:'For 2 turns the wounds on your side bleed twice as fast.'},
  chain:     {name:'Chain',              every:4,warn:false,desc:'Binds your strongest minion: 30% of the damage it takes is shared to that minion.'},
  block:     {name:'Mark for the Block', every:4,warn:true, desc:'Marks your most hurt minion. If it is under 40% HP when the axe falls, it is executed; else it takes 150% of its attack.'},
  bargain:   {name:'Infernal Bargain',   every:5,warn:false,desc:'From now on it mends 10% of its max HP every turn it was not hit by frost.'},
  halo:      {name:'Halo',               every:4,warn:true, desc:'For 2 turns it turns 30% of your skill damage back on you.'},
  otherhalf: {name:'The Other Half',     every:5,warn:false,desc:'Steals every Soul you have harvested and mends 5% of its max HP for each.'}
});
const HALVES={
  swarm:{name:'The Swarm Remembers',desc:'Every mite that dies makes it 5% stronger.'},
  under:{name:'Undertow',           desc:'The tide rises two steps a turn.'},
  wyrm: {name:'Wyrmfire',           desc:'The ground burns: your front row is set alight every turn.'},
  note: {name:'Last Note',          desc:'Its moves come a turn sooner.'},
  deep: {name:'Deep Roots',         desc:'Its regrowth doubles.'},
  name: {name:'The Name',           desc:'Every copy of a skill copies your last two.'}
};
Object.assign(BOSS_KIT,{
  'The Plague Matriarch':  {moves:['brood','plague','feed'],      half:'swarm', res:{rot:.5}, noPoison:1},
  'The Drowned Abbot':     {moves:['drown','litany'],             half:'under', res:{frost:.25,fire:-.25}, tide:1},
  'The Cinder Wyrm':       {moves:['breath','molten','tail'],     half:'wyrm',  res:{frost:-.25}, imm:'fire'},
  'The Choir Eternal':     {moves:['verse','crescendo','echoes'], half:'note',  res:{shad:.25,phys:-.25}},
  'The Rootking':          {moves:['spread','heartwood'],         half:'deep',  res:{phys:.25,rot:-.25}, regrow:1},
  'The Nameless Sovereign':{moves:['mirror','unwrite','nothing'], half:'name',  res:{fire:.25,shad:.25,frost:.25}}
});
const WARDEN_SIG=['heads','moth','confess','cloud','dirge','chain','block','bargain','halo'];
const BK_TIDE=5, BK_FLOOD=.2, BK_REGROW=.025, BK_BARGAIN=.1, BK_HALO=.3, BK_CHAIN=.3, BK_MOLTEN=.25, BK_CLOUD=.2, BK_CONFESS=1.25;
function wardenKit(f){   // a warden's moves by its floor
  const i=(f/10-1)%TW_BOSS.length, g=GATE_ABIL[i%GATE_ABIL.length];
  if(f>100){ const h=Math.floor(f/10); return [WARDEN_SIG[h%9],g,WARDEN_SIG[(h+4)%9]]; }   /* abyssal: two signatures */
  return i<9?[WARDEN_SIG[i],g]:WARDEN_SIG.concat(['otherhalf']);   /* Abaddon: every signature, and the Other Half */
}
function giveMasterKit(e){   // makeSecret, after its single move: the master's own kit
  if(!BOSS_KITS_ON) return e; const K=BOSS_KIT[e.base]; if(!K) return e; giveKit(e);
  if(K.imm) e.imm=K.imm; if(K.tide) e.tide=0; if(K.noPoison) e.noPoison=1; return e;
}
const mites=e=>liveFoes().filter(o=>o!==e&&o.mite);
const kitNeeds={graft:e=>seedlings(e).length>0,feed:e=>mites(e).length>0,edict:e=>(e.edicts||0)<BK_EDICTS};   // moves skipped while their fodder is missing; the Edict twice a fight at most   // moves skipped while their fodder is missing
const sigOf=e=>e.tw&&e.kit?e.kit.filter(m=>WARDEN_SIG.includes(m)||m==='otherhalf'):[];
const halfOn=(e,h)=>e.half===h;
function fireKitMove2(e,mv){   // the masters' and wardens' moves (fireKitMove hands on what it does not know)
  const r=S.run, P=S.player, foes=liveFoes(); if(e.tw&&WARDEN_SIG.concat(['otherhalf']).includes(mv)) e.sigU=1;
  if(mv==='brood'){ const got=[]; for(let i=0;i<2;i++){ const a=summonAdd(e,'Marrow Mite','striker'); if(a){ a.mite=1; got.push(a); } } log(got.length?e.name+' broods: '+got.map(x=>x.name).join(' and ')+' crawl out.':e.name+' broods, but nothing more hatches.','bad'); }
  else if(mv==='plague'){ let tot=0; allies().filter(hittable).forEach(a=>{ const d=hit(e.atk*.5); tot+=hurtAlly(a,d,'rot'); addDot(a,'poison',e.atk*.15,2); if(a.hp<=0&&a.id!=='p') log(a.nick+' is down.','bad'); }); log(e.name+' breathes plague over your side for '+tot+'.','bad'); }
  else if(mv==='feed'){ const s=mites(e)[0]; if(s){ S.run.enemies=S.run.enemies.filter(o=>o!==s); const h=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*.08*blightK(e))); e.hp+=h; log(e.name+' eats '+s.name+' and mends '+h+'.','bad'); } }
  else if(mv==='drown'){ const t=strongestMinion()||P, d=bossHit(e,t,1.5,'frost',mv); log(e.name+' drowns '+(t.id==='p'?'you':nameOf(t))+' for '+d+'.','bad'); }
  else if(mv==='litany'){ const h=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*(.02+.02*(e.tide||0))*blightK(e))); e.hp+=h; log(e.name+' chants a Litany and mends '+h+'.','bad'); }
  else if(mv==='breath'){ let tot=0; allies().filter(a=>hittable(a)&&rowOf(a)==='f').forEach(a=>{ tot+=bossHit(e,a,1.2,'fire',mv); }); log(e.name+' breathes fire down your front row for '+tot+'.','bad'); }
  else if(mv==='molten'){ e.molten=r.turn+3; log(e.name+'\'s scales run molten.','bad'); }
  else if(mv==='tail'){ let tot=0; allies().filter(a=>hittable(a)&&rowOf(a)==='b').forEach(a=>{ tot+=bossHit(e,a,.8,'phys',mv); }); log(e.name+' sweeps your back row with its tail for '+tot+'.','bad'); }
  else if(mv==='verse'){ r.silence=silenceT(3); e.verses=(e.verses||0)+1; log(e.name+' sings a Verse of Binding. Your skills are silenced for 2 turns.','bad'); }
  else if(mv==='crescendo'){ const d=Math.round(pMax()*(.08+.04*(e.verses||0))); BLOW={n:e.name,k:'sig',mv}; hurtAlly(P,d,'shad'); BLOW=null; fxe('hurt',P,{crit:1}); log(e.name+' swells into a Crescendo for '+d+'.','bad'); }
  else if(mv==='echoes'){ const got=[]; for(let i=0;i<2;i++){ const a=summonAdd(e,'Hollow Chorister','striker'); if(a) got.push(a); } log(got.length?e.name+' echoes: '+got.map(x=>x.name).join(' and ')+' join the song.':e.name+' echoes, but no voice answers.','bad'); }
  else if(mv==='spread'){ const L=S.army.filter(hittable).sort((a,b)=>b.atk-a.atk).slice(0,2); L.forEach(m=>{ m.root=r.turn+3; }); log(L.length?e.name+' spreads its roots: '+L.map(m=>m.nick).join(' and ')+' are rooted for 2 turns.':e.name+' spreads its roots, but no minion stands.','bad'); }
  else if(mv==='heartwood'){ e.hw=r.turn+3; log(e.name+' hardens into heartwood.','bad'); }
  else if(mv==='unwrite'){ const m=strongestMinion(); if(m){ m.unw=1; log(e.name+' unwrites '+m.nick+': it forgets its traits for this fight.','bad'); } else log(e.name+' reaches for a name to unwrite, but finds none.','ok'); }
  else if(mv==='nothing'){ const d=Math.round(pMax()*.4*enrage(e)); BLOW={n:e.name,k:'sig',mv}; hurtAlly(P,d,'shad'); BLOW=null; fxe('hurt',P,{crit:1}); log(e.name+' speaks the Decree of Nothing for '+d+'.','bad'); }
  else if(mv==='heads'){ let tot=0; for(let i=0;i<3;i++){ const L=allies().filter(hittable); if(!L.length) break; tot+=bossHit(e,pick(L),.5,foeHitType(e),mv); } log(e.name+' bites with all three heads for '+tot+'.','bad'); }
  else if(mv==='moth'){ const m=S.army.filter(x=>hittable(x)&&rowOf(x)==='b').sort((a,b)=>b.maxHp-a.maxHp)[0]; if(m){ if(m.prow==null) m.prow=m.row||''; m.row='f'; log(e.name+'\'s Moth Light draws '+m.nick+' into your front row.','bad'); } else log(e.name+'\'s Moth Light finds no one behind.','ok'); }
  else if(mv==='confess'){ r.conf=1; log(e.name+' demands a Confession: you take 25% more damage until you raise Bone Ward.','bad'); }
  else if(mv==='cloud'){ r.cloud=r.turn+3; log(e.name+' looses a Swarm Cloud: your minions will miss one hit in five for 2 turns.','bad'); }
  else if(mv==='dirge'){ r.dirge=r.turn+3; log(e.name+' sings a Dirge: your side\'s wounds bleed twice as fast for 2 turns.','bad'); }
  else if(mv==='chain'){ const m=strongestMinion(); if(m){ e.chainT=fxKey(m); log(e.name+' chains '+m.nick+' to itself.','bad'); } }
  else if(mv==='block') blockLands(e);
  else if(mv==='bargain'){ e.barg=1; log(e.name+' strikes an Infernal Bargain: it mends every turn frost does not touch it.','bad'); }
  else if(mv==='halo'){ e.halo=r.turn+3; log(e.name+' raises a Halo: for 2 turns your skills burn you too.','bad'); }
  else if(mv==='otherhalf'){ const n=r.souls||0; r.souls=0; const h=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*.05*n)); e.hp+=h; log(n?e.name+' takes the Other Half: '+n+' Souls, and mends '+h+'.':e.name+' reaches for your Souls, but you hold none.','bad'); }
  else return fireKitMove3(e,mv);   /* the Hunger (game-abbey.js) */
  return true;
}
function blockTarget(e){ const m=S.army.filter(hittable).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; e.blockT=m?fxKey(m):null; return m; }
function blockLands(e){ const m=S.army.find(x=>fxKey(x)===e.blockT&&x.hp>0); delete e.blockT; if(!m){ log(e.name+'\'s axe falls on an empty block.','ok'); return; }
  if(m.hp<m.maxHp*.4){ m.hp=0; fxe('death',m); log(e.name+' brings the axe down: '+m.nick+' is executed.','bad'); return; }
  const d=bossHit(e,m,1.5,'phys','block'); log(e.name+'\'s axe bites '+m.nick+' for '+d+'.','bad'); }
// ----- the hooks for masters and wardens (called from the PR A hooks)
function bossTaken(e,d){ if(e.hw>S.run.turn) d=Math.round(d*.5); return hungerTaken(e,d); }   /* the Hunger's echoes guard it (game-abbey.js) */   // hurtFoe, before shields: Heartwood
function bossHurt2(e,d,ty){   // hurtFoe, after the damage
  const r=S.run;
  if(ty==='frost') e.frostT=r.turn; hungerHurt(e,d,ty);
  if(e.molten>r.turn&&d>0&&HITTER&&HITTER.id!=='p'&&MELEE[HITTER.role]&&HITTER.hp>0){ const h=HITTER; HITTER=null; hurtAlly(h,Math.max(1,Math.round(d*BK_MOLTEN)),'fire'); HITTER=h; }
  if(e.halo>r.turn&&d>0&&SKILLHIT){ const s=SKILLHIT; SKILLHIT=null; hurtAlly(S.player,Math.max(1,Math.round(d*BK_HALO)),'fire'); SKILLHIT=s; }
  if(e.chainT&&d>0){ const m=S.army.find(x=>fxKey(x)===e.chainT&&x.hp>0); if(m){ hurtAlly(m,Math.max(1,Math.round(d*BK_CHAIN)),'phys'); if(m.hp<=0){ delete e.chainT; log(m.nick+' falls under the chain.','bad'); } } else delete e.chainT; }
}
function bossRoomTurn2(b){   // every turn, for one master or warden
  const r=S.run, K=BOSS_KIT[b.base]||{}; if(b.hunger) hungerTurn(b);
  if(b.secret&&b.kit&&!b.half&&K.half&&b.hp<=b.maxHp*.5){ b.half=K.half; if(b.half==='note') b.fast=(b.fast||0)+1; log(b.name+' wakes its second rule: '+HALVES[b.half].name+'. '+HALVES[b.half].desc,'bad'); sfx('phase'); moment(HALVES[b.half].name,'bad'); }
  if(b.tide!=null){ if(b.stun>0) b.tide=0; else { b.tide+=halfOn(b,'under')?2:1; if(b.tide>=BK_TIDE){ b.tide=0; let tot=0; allies().filter(hittable).forEach(a=>{ const d=Math.round((a.id==='p'?pMax():a.maxHp)*BK_FLOOD); BLOW=a.id==='p'?{n:b.name,k:'sig',mv:'drown'}:null; tot+=hurtAlly(a,d,'frost'); BLOW=null; if(a.hp<=0&&a.id!=='p') log(a.nick+' is down.','bad'); }); log('The tide floods the room: '+tot+' damage across your side.','bad'); } } }
  if(halfOn(b,'wyrm')) allies().filter(a=>hittable(a)&&rowOf(a)==='f').forEach(a=>addDot(a,'burn',b.atk*.2,2));
  if(K.regrow&&!(b.dots&&(b.dots.poison||b.dots.blight))){ const h=Math.min(b.maxHp-b.hp,Math.round(b.maxHp*BK_REGROW*(halfOn(b,'deep')?2:1))); if(h>0){ b.hp+=h; log(b.name+' regrows '+h+'.','bad'); } }
  if(b.barg&&!(b.frostT>=r.turn-1)){ const h=Math.min(b.maxHp-b.hp,Math.round(b.maxHp*BK_BARGAIN)); if(h>0){ b.hp+=h; log(b.name+' takes its due and mends '+h+'.','bad'); } }
}
function bossFoeDies(e){   // checkDeaths, for every foe that falls: mites burst; the Matriarch remembers; the boss titles
  const r=S.run;
  if(e.mite){ allies().filter(hittable).forEach(a=>addDot(a,'poison',e.atk*.3,2)); log(e.name+' bursts into poison over your side.','bad');
    liveFoes().forEach(m=>{ if(halfOn(m,'swarm')){ m.atk=Math.round(m.atk*1.05); } }); }
  if(e.boss&&e.twist&&!e.secret&&!e.tw&&e.p2d!=null&&S.army.filter(m=>m.hp<=0).length<=e.p2d&&!r.trial) tally('ub_'+e.rankI);   /* phase two beaten without a minion falling */
  if(e.tw&&e.sigU&&e.tw<=100) tally('tf_'+((e.tw/10-1)%TW_BOSS.length));
}
function bossChip2(e){   // state chips for masters and wardens
  const r=S.run; let h='';
  if(e.tide!=null) h+=' &middot; <span class="kit" title="At '+BK_TIDE+' the room floods: '+Math.round(BK_FLOOD*100)+'% of max HP to each of yours. A freeze resets it.">Tide '+e.tide+'/'+BK_TIDE+'</span>';
  if(e.half) h+=' &middot; <span class="phase-t" title="'+HALVES[e.half].desc+'">'+HALVES[e.half].name+'</span>';
  for(const [k,n] of [['molten','Molten'],['hw','Heartwood'],['halo','Halo']]) if(e[k]>r.turn) h+=' &middot; <span class="kit" title="'+BOSS_ABIL[k==='hw'?'heartwood':k].desc+'">'+n+'</span>';
  if(e.barg) h+=' &middot; <span class="kit" title="'+BOSS_ABIL.bargain.desc+'">Bargain</span>';
  if(e.chainT){ const m=S.army.find(x=>fxKey(x)===e.chainT&&x.hp>0); if(m) h+=' &middot; <span class="kit" title="'+BOSS_ABIL.chain.desc+'">Chained to '+m.nick+'</span>'; }
  return h+hungerChip(e);
}
