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
  edict:     {name:'Edict of Ash',       every:5,warn:true, desc:'Names one of your minions. If it still stands when the Edict lands, it is executed. Guard or Taunt onto another vanguard saves it; freezing breaks it.'},
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
const BK_REFLECT=.2, BK_SMOKE=.8, BK_ROOTS=.05, BK_RALLY=1.2, BK_MIRROR=.3, BK_EDICT_HIT=2.2;
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
  for(let i=0;i<e.kit.length;i++){ e.kitIx=(e.kitIx+1)%e.kit.length; e.abil=e.kit[e.kitIx]; if(e.abil!=='graft'||seedlings(e).length||e.kit.length<2) break; }
}
const bossNext=e=>{ if(!e.kit) return []; const out=[e.abil]; let ix=e.kitIx; for(let i=1;i<e.kit.length;i++){ ix=(ix+1)%e.kit.length; out.push(e.kit[ix]); } return out; };   // the rotation from the next move on (the card)
function bossTwist(e){   // the second phase of a boss with a kit
  const K=BOSS_KIT[e.base]; if(!e.kit||!K||!K.twist) return null; e.twist=K.twist;
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
  const d=hit(e.atk*mul*enrage(e)); BLOW={n:e.name,k:'sig',mv}; const got=hurtAlly(tg,d,ty); BLOW=null; fxe('hurt',tg,{crit:1}); if(tg.hp<=0&&tg.id!=='p') log(tg.nick+' is down.','bad'); return got; }
// the new moves (fireAbility hands every move it does not know to this)
function fireKitMove(e,mv){
  const r=S.run, P=S.player, A=BOSS_ABIL[mv], foes=liveFoes();
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
  else return false;
  return true;
}
function edictTarget(e){ const m=strongestMinion(); e.edictT=m?fxKey(m):null; return m; }   // named when the Edict is gathered
function edictLands(e){
  const r=S.run, m=S.army.find(x=>fxKey(x)===e.edictT&&x.hp>0); delete e.edictT;
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
function bossHurt(e,d){   // hurtFoe, after the damage: the Crypt Warden's Last Watch
  if(e.twist==='watch'&&d>0&&HITTER&&HITTER.hp>0&&liveFoes().some(o=>o.shield>0)){ const t=Math.max(1,Math.round(d*BK_REFLECT)), h=HITTER; HITTER=null; hurtAlly(h,t,'phys'); HITTER=h; }
}
function bossRoomTurn(){   // the start of the foes' phase: twists that act every turn
  const r=S.run, B=liveFoes().filter(e=>e.twist);
  for(const b of B){
    if(b.twist==='choir'&&r.silence>0) liveFoes().forEach(o=>{ if(o!==b) addSt(o,'hasted',1); });
    if(b.twist==='bloom'){ const th=DUNGEONS[4].mobs.find(m=>m[0]==='Thorn Troll'); if(th) for(const s of seedlings(b)) if(r.turn-s.seed>=2){
      const k=s.hp/s.maxHp; s.maxHp=Math.round(s.maxHp*th[2]/(s.hf||1)); s.hp=Math.max(1,Math.round(s.maxHp*k)); s.atk=Math.max(1,Math.round(s.atk*th[3]/(s.af||1)));
      s.name=(s.elite?s.name.split(' ')[0]+' ':'')+th[0]; s.base=th[0]; s.role=th[1]; s.hf=th[2]; s.af=th[3]; delete s.seed; delete s.it; delete s.it2; log(s.name+' matures out of the soil.','bad'); } }
  }
}
function bossEndTurn(){   // the end of the turn: hazards that tick
  if(hazardOn('roots')) S.army.forEach(m=>{ if(m.hp>0&&rowOf(m)==='b'){ hurtAlly(m,Math.max(1,Math.round(m.maxHp*BK_ROOTS)),'rot'); if(m.hp<=0) log(m.nick+' is dragged under by the roots.','bad'); } });
}
// ----- the rival's kit: shaped by the bodies it stole
function rivalKitMove(){ const st=(S.rival&&S.rival.stash)||[]; if(!st.length) return null; const n={}; st.forEach(b=>{ n[b.role]=(n[b.role]||0)+1; });
  return ['vanguard','striker','mender','reaper'].reduce((a,k)=>(n[k]||0)>(n[a]||0)?k:a,'vanguard'); }
const rivalKitName=()=>{ const k=rivalKitMove(); return k?BOSS_ABIL[RIVAL_MOVE[k]].name:''; };
// ----- what the Ledger shows
function bossKitTxt(name){   // the whole kit in words (the Codex, a Ledgered boss door)
  const K=BOSS_KIT[name]; if(!K) return ''; const P=[K.moves.map(m=>BOSS_ABIL[m].name).join(' · ')];
  if(K.twist) P.push('Second phase: '+TWISTS[K.twist].name,TWISTS[K.twist].desc); if(K.hazard) P.push('Hazard: '+HAZARDS[K.hazard].name,HAZARDS[K.hazard].desc); return P.join('. '); }
function bossRotChip(e){   // the rotation strip on a boss card (Known and up), and its hazard
  if(!e.kit||e.hp<=0) return ''; const kl=knowLv(e); let h='';
  { const L=bossNext(e).map(m=>BOSS_ABIL[m].name); h+=' &middot; <span class="kit" title="'+BOSS_ABIL[e.abil].desc+(kl>=2?' Its rotation: '+L.join(' → ')+'.':'')+'">Next: '+L[0]+(kl>=2&&L[1]?' → '+L[1]:'')+'</span>'; }   /* the rotation from Known */
  const K=BOSS_KIT[e.base]; if(K&&K.hazard) h+=' &middot; <span class="kit" title="'+HAZARDS[K.hazard].desc+'">Hazard: '+HAZARDS[K.hazard].name+'</span>';
  if(e.twist) h+=' &middot; <span class="phase-t" title="'+TWISTS[e.twist].desc+'">'+TWISTS[e.twist].name+'</span>';
  return h;
}
