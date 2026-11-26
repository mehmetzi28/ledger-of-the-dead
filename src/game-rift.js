// ===== THE RIFT, R9 PR A: sigils, guardians and Rift Shards =====
// Before a dive, pick up to three sigils: each makes the dive harder in one way and adds to its reward multiplier (gold, XP and
// drops). Every fifth depth ends in a guardian instead of a gate master: six of them in rotation, each with a move set, a second
// phase and sometimes a hazard (the same rules as the gate bosses' kits, game-boss-kits.js). Guardians and sigiled dives pay
// Rift Shards. Run fields: r.sig (the dive's sigils), r.sigT (Typed Dark's type), r.mirS (Mirror fired this room), r.fold
// (the Folded Knight swapped your rows), r.widen (the Tear's stacking widen), r.cnt (the Counting Dead's marks, by minion uid).
const SIGILS={
  iron:  {name:'Iron Sky',   rew:.2, desc:'Foes wear heavier armor: 25% tougher to hurt.'},
  hungry:{name:'Hungry Dark',rew:.3, desc:'All healing in the dive is 40% weaker.'},
  hands: {name:'Many Hands', rew:.25,desc:'One more foe in every room.'},
  mirror:{name:'Mirror',     rew:.25,desc:'The first skill you use in each room is turned back on you.'},
  short: {name:'Short Breath',rew:.2,desc:'You regain 30% less mana each turn.'},
  wounds:{name:'Old Wounds', rew:.15,desc:'Your minions start the dive at 80% HP.'},
  named: {name:'Named',      rew:.3, desc:'The dive\'s master or guardian starts in its second phase.'},
  loud:  {name:'Loud Grave', rew:.2, desc:'The dead of this dive leave no bodies to raise.'},
  typed: {name:'Typed Dark', rew:.25,desc:'Foes resist 30% of the damage type most of your army deals.'},
  thin:  {name:'Thin Veil',  rew:.1, desc:'Foes crit 10% more often, and so does your Strike.'}
};
const SIGIL_IDS=Object.keys(SIGILS), SIGIL_MAX=3, SIGIL_AT=5, SIGIL_STEP=5, SIG_ARMOR=1.25, SIG_HEAL=.6, SIG_REGEN=.7, SIG_WOUND=.8, SIG_RES=.3, SIG_CRIT=.1,
  SHARD_UNLOCK=10, GUARD_EVERY=5, GUARD_HP=1.3, SHARD_SIGIL=1;
const riftSigs=()=>(S&&S.run&&S.run.rift&&S.run.sig)||[];
const hasSig=k=>riftSigs().includes(k);
const sigOpenN=()=>Math.min(SIGIL_IDS.length,(riftBest()>=SIGIL_AT?3+Math.floor((riftBest()-SIGIL_AT)/SIGIL_STEP):0)+((S.rift&&S.rift.xs)||0));   // three at depth 5, one more per 5 depths, more with shards
const sigOpen=k=>SIGIL_IDS.indexOf(k)>=0&&SIGIL_IDS.indexOf(k)<sigOpenN();
const sigPicked=()=>((S.rift&&S.rift.sig)||[]).filter(k=>SIGILS[k]&&sigOpen(k)).slice(0,SIGIL_MAX);   // the set the next dive takes
const riftRew=sig=>1+(sig||riftSigs()).reduce((a,k)=>a+(SIGILS[k]?SIGILS[k].rew:0),0);   // gold, XP and drops in the dive
const riftShards=()=>(S.rift&&S.rift.shards)||0;
function toggleSigil(k){ if(S.mode!=='town'||!sigOpen(k)) return false; S.rift=S.rift||{best:0}; const L=sigPicked(), i=L.indexOf(k); if(i>=0) L.splice(i,1); else { if(L.length>=SIGIL_MAX) return false; L.push(k); } S.rift.sig=L; return true; }
const unlockCost=()=>SHARD_UNLOCK*(((S.rift&&S.rift.xs)||0)+1);
function unlockSigil(){ if(S.mode!=='town'||sigOpenN()>=SIGIL_IDS.length||riftShards()<unlockCost()) return false; const c=unlockCost(); S.rift.shards-=c; S.rift.xs=(S.rift.xs||0)+1; tally('sigUnlocks'); return SIGIL_IDS[sigOpenN()-1]; }
function gainShards(n,why){ if(!(n>0)) return 0; S.rift=S.rift||{best:0}; S.rift.shards=riftShards()+n; tally('shards',n); if(S.run&&S.run.events) S.run.events.push({m:'+'+n+' Rift Shard'+(n>1?'s':'')+' ('+why+').',c:'ok'}); return n; }
// ----- the sigils' rules (each hook is read where its system lives)
function sigDive(r){   // startRift: the dive takes the picked sigils
  r.sig=sigPicked(); if(!r.sig.length) return; tally('sigDives'); r.sig.forEach(k=>tally('sig_'+k));
  if(r.sig.includes('wounds')) S.army.forEach(m=>{ if(m.hp>0) m.hp=Math.max(1,Math.round(m.maxHp*SIG_WOUND)); });
  if(r.sig.includes('typed')){ const n={}; S.army.forEach(m=>{ const t=minionType(m); n[t]=(n[t]||0)+1; }); r.sigT=Object.keys(n).sort((a,b)=>n[b]-n[a])[0]||'phys'; }
  log('Sigils on this dive: '+r.sig.map(k=>SIGILS[k].name).join(', ')+'. Rewards x'+riftRew(r.sig).toFixed(2)+'.','story');
}
const sigArmor=a=>hasSig('iron')?1-(1-a)/SIG_ARMOR:a;   // foeArmor
const sigHeal=()=>hasSig('hungry')?SIG_HEAL:1;   // healAlly
const sigHands=()=>hasSig('hands')?1:0;   // buildRoom
const sigCrit=()=>hasSig('thin')?SIG_CRIT:0;   // foeCrit, critChance
const sigBody=()=>!hasSig('loud');   // checkDeaths: Loud Grave leaves no bodies
function sigRes(o){ const r=S.run; if(!hasSig('typed')||!r.sigT) return o; o=Object.assign({},o); o[r.sigT]=(o[r.sigT]||0)+SIG_RES; return o; }   // placeRes
function sigRegen(g){ if(!hasSig('short')) return g; const r=S.run; r.sf=(r.sf||0)+g*(1-SIG_REGEN); const x=Math.floor(r.sf); r.sf-=x; return Math.max(0,g-x); }   // the end-of-turn mana
function sigMirror(r){ if(!hasSig('mirror')||r.mirS) return; const f=liveFoes().sort((a,b)=>b.maxHp-a.maxHp)[0]; if(!f) return; r.mirS=1; mirrorLands(f); }   // useSkill
function sigNamed(list){ if(!hasSig('named')) return; for(const e of list) if(e.boss&&e.abil&&!e.phase2){ e.phase2=true; e.fast=(e.fast||0)+1; e.alt=true; bossTwist(e); } }   // buildRoom
// ----- guardians
const GUARDIANS=[
  {name:'The Folded Knight',role:'vanguard',moves:['fold','gateedge'],twist:'secondfold',res:{phys:.25,shad:-.25},
    hi:'You came down the right way. I will fold you back up.',lo:'Unfolded, at last.',ph:'Every page has two sides. Show me your other one.'},
  {name:'Mother of Gates',role:'mender',moves:['opendoor','closedoor'],twist:'doors',res:{rot:.25,fire:-.25},
    hi:'Every gate you closed, I bore. Meet my children.',lo:'The doors are yours now. Keep them shut.',ph:'All my doors at once, then.'},
  {name:'The Echo',role:'striker',moves:['repeat','delay'],twist:'twice',res:{shad:.25,phys:-.25},
    hi:'You came down the right way. You came down the right way.',lo:'Silence. Silence.',ph:'Again. Again.'},
  {name:'Brass Saint',role:'vanguard',moves:['hymnbrass','brassbell'],twist:'brass',res:{fire:.25,frost:-.25},hazard:'ringing',
    hi:'Kneel. The bell counts for the faithful.',lo:'The bell stops. Who will ring it now?',ph:'Strike me with that again. I dare you.'},
  {name:'The Tear Itself',role:'striker',moves:['widen','swallow'],twist:'widening',res:{frost:.25,fire:-.25},hazard:'shrink',
    hi:'',lo:'',ph:''},
  {name:'The Counting Dead',role:'reaper',moves:['count','tally'],twist:'counttwo',res:{rot:.25,shad:-.25},
    hi:'One, two, three. You have so many to count.',lo:'The count is done. You were not in it.',ph:'Two at a time now. We are running late.'}
];
const GUARD_BY={}; GUARDIANS.forEach(g=>{ GUARD_BY[g.name]=g; BOSS_KIT[g.name]={moves:g.moves,twist:g.twist,res:g.res,hazard:g.hazard}; if(g.hi){ BOSS_LINES[g.name]=[g.hi,g.lo]; PHASE_LINES[g.name]=g.ph; } });
Object.assign(BOSS_ABIL,{
  fold:     {name:'Fold',           every:3,warn:false,desc:'Folds the field: your front and back rows trade places until it folds again.'},
  gateedge: {name:'Edge of Gates',  every:4,warn:true, desc:'A blade drawn along every gate: 110% of its attack to each unit in your back row.'},
  opendoor: {name:'Open Door',      every:3,warn:false,desc:'Opens a door: two foes of the folded gate step through.'},
  closedoor:{name:'Close Door',     every:4,warn:false,desc:'Shuts your strongest minion behind a door for 2 turns: it cannot act and cannot be hit.'},
  repeat:   {name:'Repeat',         every:3,warn:false,desc:'Repeats the last skill you used, turned back on you.'},
  delay:    {name:'Delay',          every:4,warn:false,desc:'Holds time back: your skills wait a turn.'},
  hymnbrass:{name:'Litany of Brass',every:4,warn:false,desc:'Mends itself for 6% of its max HP for every foe standing.'},
  brassbell:{name:'Brass Bell',     every:4,warn:true, desc:'Rings the bell: every minion in your front row is stunned for a turn.'},
  widen:    {name:'Widen',          every:2,warn:false,desc:'The tear widens: both sides take 5% more damage for the rest of the fight (it stacks).'},
  swallow:  {name:'Swallow',        every:4,warn:false,desc:'Swallows a body on the field (it can no longer be raised) and mends 8% of its max HP; with no body, strikes for 120%.'},
  count:    {name:'Count',          every:3,warn:false,desc:'Counts one of your minions. At the third count, it falls.'},
  tally:    {name:'Tally',          every:4,warn:false,desc:'Mends 4% of its max HP for every count on your minions.'}
});
const GUARD_MV=['fold','gateedge','opendoor','closedoor','repeat','delay','hymnbrass','brassbell','widen','swallow','count','tally'];
Object.assign(TWISTS,{
  secondfold:{name:'Second Fold',desc:'Edge of Gates cuts your front row too.'},
  doors:     {name:'All Doors',  desc:'Two doors open for every one it shuts.'},
  twice:     {name:'Twice',      desc:'Every Repeat comes twice.'},
  brass:     {name:'Brass Skin', desc:'Immune to the damage type that hit it last.'},
  widening:  {name:'Widening',   desc:'It widens two moves in three.'},
  counttwo:  {name:'Two at a Time',desc:'Each Count marks two minions.'}
});
Object.assign(HAZARDS,{
  ringing:{name:'Ringing',desc:'Every third turn the bell silences your skills for a turn.'},
  shrink: {name:'The Rift shrinks',desc:'You lose 2% of your max HP at the end of every turn.'}
});
const GUARD_SHRINK=.02, GUARD_EDGE=1.1, GUARD_LITANY=.06, GUARD_LITANY_MAX=.3, GUARD_WIDEN=.05, GUARD_WIDEN_MAX=.5, GUARD_SWALLOW=.08, GUARD_TALLY=.04, GUARD_COUNT=3;
const guardIx=n=>(Math.floor(n/GUARD_EVERY)-1)%GUARDIANS.length;
const guardAt=n=>n>0&&n%GUARD_EVERY===0?GUARDIANS[guardIx(n)]:null;   // the guardian that ends depth n
function makeGuardian(di,lvl,n){   // buildRoom: the fifth room of every fifth depth
  const G=guardAt(n), e=makeEnemy(di,lvl,true); e.name=e.base=G.name; e.role=G.role; e.guard=1; e.maxHp=e.hp=Math.round(e.maxHp*GUARD_HP);
  giveAbility(e,G.moves[0]); giveKit(e); return e;
}
const widenK=()=>1+((S&&S.run&&S.run.widen)||0);   // hurtFoe, hurtAlly
function guardTwist(e){   // bossTwist
  if(e.twist==='doors'){ e.kit=['opendoor','opendoor','closedoor']; e.kitIx=Math.max(0,e.kit.indexOf(e.abil)); e.abil=e.kit[e.kitIx]; }
  if(e.twist==='widening'){ e.kit=['widen','widen','swallow']; e.kitIx=Math.max(0,e.kit.indexOf(e.abil)); e.abil=e.kit[e.kitIx]; }
}
function guardMove(e,mv){   // fireKitMove: the guardians' moves
  const r=S.run, liveM=S.army.filter(m=>m.hp>0&&hittable(m));
  if(mv==='fold'){ r.fold=!r.fold; log(e.name+' folds the field. Your front and back rows trade places'+(r.fold?'':' again')+'.','bad'); }
  else if(mv==='gateedge'){ const tg=allies().filter(a=>hittable(a)&&(e.twist==='secondfold'||rowOf(a)==='b')); let tot=0; tg.forEach(a=>{ tot+=bossHit(e,a,GUARD_EDGE,'phys',mv); }); log(e.name+' draws the Edge of Gates across '+(e.twist==='secondfold'?'your whole line':'your back row')+' for '+tot+' in all.','bad'); }
  else if(mv==='opendoor'){ const got=[summonAdd(e),summonAdd(e)].filter(Boolean); log(got.length?e.name+' opens a door: '+got.map(x=>x.name).join(' and ')+' step through.':e.name+' opens a door, but nothing more can come through.','bad'); }
  else if(mv==='closedoor'){ const m=strongestMinion(); if(m){ m.lock=r.turn+3; log(e.name+' shuts '+m.nick+' behind a door for 2 turns.','bad'); fxe('ward',m); } else log(e.name+' shuts a door on no one.','ok'); }
  else if(mv==='repeat'){ mirrorLands(e); if(e.twist==='twice'&&S.player.hp>0) mirrorLands(e); }
  else if(mv==='delay'){ r.silence=Math.max(r.silence||0,silenceT(2)); log(e.name+' holds time back. Your skills wait a turn.','bad'); }
  else if(mv==='hymnbrass'){ const k=Math.min(GUARD_LITANY_MAX,GUARD_LITANY*liveFoes().length), h=Math.round(e.maxHp*k); e.hp=Math.min(e.maxHp,e.hp+h); log(e.name+' sings the Litany of Brass and mends '+h+'.','bad'); }
  else if(mv==='brassbell'){ const f=liveM.filter(m=>rowOf(m)==='f'); f.forEach(m=>{ m.root=Math.max(m.root||0,r.turn+2); }); log(e.name+' rings the Brass Bell. '+(f.length?f.length+' of your front row reel and lose a turn.':'No minion stands in front to hear it.'),'bad'); }
  else if(mv==='widen'){ r.widen=Math.min(GUARD_WIDEN_MAX,(r.widen||0)+GUARD_WIDEN); log('The tear widens. Both sides now take '+Math.round(r.widen*100)+'% more damage.','bad'); }
  else if(mv==='swallow'){ const c=(r.corpses||[]).filter(x=>!x.tried); if(c.length){ const b=c[c.length-1]; r.corpses=r.corpses.filter(x=>x!==b); const h=Math.round(e.maxHp*GUARD_SWALLOW); e.hp=Math.min(e.maxHp,e.hp+h); log(e.name+' swallows the body of '+b.name+' and mends '+h+'.','bad'); }
    else { const t=frontTarget(), d=bossHit(e,t,1.2,'shad',mv); log(e.name+' finds no body to swallow and tears at '+(t.id==='p'?'you':nameOf(t))+' for '+d+'.','bad'); } }
  else if(mv==='count'){ r.cnt=r.cnt||{}; const pool=liveM.slice(); const n=e.twist==='counttwo'?2:1;
    for(let i=0;i<n&&pool.length;i++){ const m=pool.splice(Math.floor(Math.random()*pool.length),1)[0], c=r.cnt[m.uid]=(r.cnt[m.uid]||0)+1;
      if(c>=GUARD_COUNT){ m.hp=0; delete r.cnt[m.uid]; log(e.name+' counts '+m.nick+' a third time. It falls.','bad'); } else log(e.name+' counts '+m.nick+': '+c+' of '+GUARD_COUNT+'.','bad'); } }
  else if(mv==='tally'){ const n=Object.values(r.cnt||{}).reduce((a,b)=>a+b,0), h=Math.round(e.maxHp*GUARD_TALLY*Math.max(1,n)); e.hp=Math.min(e.maxHp,e.hp+h); log(e.name+' tallies its counts and mends '+h+'.','bad'); }
  else return false;
  return true;
}
function guardHurt(e,d,ty){ if(e.twist==='brass'&&d>0&&e.hp>0&&e.imm!==ty){ e.imm=ty; log(e.name+'\'s brass hardens against '+DTYPE[ty].name.toLowerCase()+'.','bad'); } }   // bossHurt
function guardEndTurn(){   // bossEndTurn: the hazards
  const r=S.run;
  if(hazardOn('ringing')&&r.turn%3===0){ r.silence=Math.max(r.silence||0,silenceT(2)); log('The bell rings on its own. Your skills are silenced for a turn.','bad'); }
  if(hazardOn('shrink')&&S.player.hp>0){ const d=Math.max(1,Math.round(pMax()*GUARD_SHRINK)); hurtAlly(S.player,d,'shad'); log('The Rift shrinks around you: '+d+' HP.','bad'); }
}
const guardFold=u=>!!(S&&S.run&&S.run.fold)&&u&&u.id==null&&!u.wall;   // rowOf: a minion's row is swapped while the field is folded
// ----- rewards
function riftShardsPay(r){   // riftCleared
  const n=r.rift, G=guardAt(n); let s=0;
  if(G){ s+=1+Math.floor(n/10); tally('guardians'); tally('gd_'+guardIx(n)); S.rift.gk=S.rift.gk||{}; const band=Math.floor(n/30); if(!(S.rift.gk[guardIx(n)]>=band+1)){ S.rift.gk[guardIx(n)]=band+1; moment(G.name+' falls','gold'); } }
  if(r.sig&&r.sig.length) s+=SHARD_SIGIL*r.sig.length;
  return gainShards(s,G?G.name+(r.sig&&r.sig.length?' and your sigils':''):'your sigils');
}
function riftFix(g){   // normalizeSave
  if(!g.rift||typeof g.rift!=='object') return; const R=g.rift, n=(v,d)=>typeof v==='number'&&isFinite(v)?v:d;
  R.best=Math.max(0,Math.floor(n(R.best,0))); for(const k of Object.keys(R)) if(!['best','shards','xs','sig','gk'].includes(k)) delete R[k];
  if('shards' in R) R.shards=Math.max(0,Math.floor(n(R.shards,0))); if('xs' in R) R.xs=Math.max(0,Math.min(SIGIL_IDS.length,Math.floor(n(R.xs,0))));
  if('sig' in R) R.sig=Array.isArray(R.sig)?R.sig.filter((k,i,a)=>SIGILS[k]&&a.indexOf(k)===i).slice(0,SIGIL_MAX):[];
  if(R.gk&&typeof R.gk==='object'){ const o={}; for(const k in R.gk) if(GUARDIANS[k]&&isFinite(R.gk[k])) o[k]=Math.max(0,Math.floor(R.gk[k])); R.gk=o; } else delete R.gk;
}
