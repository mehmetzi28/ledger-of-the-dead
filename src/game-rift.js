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
const riftRew=sig=>1+(sig||riftSigs()).reduce((a,k)=>a+(SIGILS[k]?SIGILS[k].rew:0),0)+rbWalk()+(!sig&&S&&S.run&&S.run.tear?TEAR_REW:0);   // gold, XP and drops in the dive (Riftwalker and a tear-shrine add to it: PR B)
const riftShards=()=>(S.rift&&S.rift.shards)||0;
function toggleSigil(k){ if(S.mode!=='town'||!sigOpen(k)) return false; S.rift=S.rift||{best:0}; const L=sigPicked(), i=L.indexOf(k); if(i>=0) L.splice(i,1); else { if(L.length>=SIGIL_MAX) return false; L.push(k); } S.rift.sig=L; return true; }
const unlockCost=()=>SHARD_UNLOCK*(((S.rift&&S.rift.xs)||0)+1);
function unlockSigil(){ if(S.mode!=='town'||sigOpenN()>=SIGIL_IDS.length||riftShards()<unlockCost()) return false; const c=unlockCost(); S.rift.shards-=c; S.rift.xs=(S.rift.xs||0)+1; tally('sigUnlocks'); return SIGIL_IDS[sigOpenN()-1]; }
function gainShards(n,why){ if(!(n>0)) return 0; S.rift=S.rift||{best:0}; S.rift.shards=riftShards()+n; tally('shards',n); if(S.run&&S.run.events) S.run.events.push({m:'+'+n+' Rift Shard'+(n>1?'s':'')+' ('+why+').',c:'ok'}); return n; }
// ----- the sigils' rules (each hook is read where its system lives)
function sigDive(r){ sigApply(r,sigPicked()); }   // startRift: the dive takes the picked sigils (sigApply, PR B)
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
  if(r.sig&&r.sig.length) s+=SHARD_SIGIL*r.sig.length; if(r.sig&&r.sig.length>=SIGIL_MAX&&n>=20) tally('sig3_20');
  return gainShards(s,G?G.name+(r.sig&&r.sig.length?' and your sigils':''):'your sigils');
}
function riftFix(g){   // normalizeSave
  if(!g.rift||typeof g.rift!=='object') return; const R=g.rift, n=(v,d)=>typeof v==='number'&&isFinite(v)?v:d;
  R.best=Math.max(0,Math.floor(n(R.best,0))); for(const k of Object.keys(R)) if(!['best','shards','xs','sig','gk','wk','fr','hb'].includes(k)) delete R[k];
  if('shards' in R) R.shards=Math.max(0,Math.floor(n(R.shards,0))); if('xs' in R) R.xs=Math.max(0,Math.min(SIGIL_IDS.length,Math.floor(n(R.xs,0))));
  if('sig' in R) R.sig=Array.isArray(R.sig)?R.sig.filter((k,i,a)=>SIGILS[k]&&a.indexOf(k)===i).slice(0,SIGIL_MAX):[];
  if('fr' in R) R.fr=Math.max(0,Math.min(RIFT_FRAGS.length,Math.floor(n(R.fr,0)))); if('hb' in R) R.hb=Math.max(0,Math.floor(n(R.hb,0)));
  if('wk' in R){ const W=R.wk; if(W&&typeof W==='object'&&n(W.w,0)>=1) R.wk={w:Math.floor(W.w),b:Math.max(0,Math.floor(n(W.b,0))),day:Math.max(0,Math.floor(n(W.day,0))),top:Math.max(0,Math.floor(n(W.top,0)))}; else delete R.wk; }
  if(R.gk&&typeof R.gk==='object'){ const o={}; for(const k in R.gk) if(GUARDIANS[k]&&isFinite(R.gk[k])) o[k]=Math.max(0,Math.floor(R.gk[k])); R.gk=o; } else delete R.gk;
}

// ===== THE RIFT, R9 PR B: Riftborn gear, attunement, the weekly dive and Rift events =====
// Riftborn pieces (it.rb={p,d,a?}) drop only in the Rift from depth RB_AT: RB_DROP a room (times the dive's reward multiplier) and
// always from a guardian. Each is a legendary piece of the Throne's set with one rift power that grows with its depth d (the depth it
// dropped at, raised by attunement), and every bonus line a legendary may roll at its best value. In the Rift a power works in full; elsewhere at RB_OUT (Descent only counts Rift depths). Only
// the gear you wear counts, and two pieces of one power do not stack (the deeper one counts). The drop is rolled from a hash, never
// from Math.random, so the rest of a dive rolls as it would have. Attunement spends shards to raise a piece's depth by RB_ATT_STEP.
const RB_AT=10, RB_DROP=.05, RB_OUT=.3, RB_DMAX=100, RB_ATT_STEP=5, RB_ATT_COST=5, RB_DESC=.005, RB_FIRST_CD=20, RB_BULW=.005, RB_BULW_MAX=.25,
  RB_LUNG=.001, RB_WALK=.01, RB_WARD=.006, RB_WARD_MAX=.3, RB_HEART=40;
const RB_POW={
  descent:{name:'Descent',            desc:d=>'In the Rift: +0.5% damage per depth of the dive, up to '+Math.round(d/2)+'%.'},
  first:  {name:'First Light',        desc:d=>'Your first skill in each room costs no mana'+(d>=RB_FIRST_CD?' and starts no cooldown':'')+'. Outside the Rift: one room in three.'},
  bulwark:{name:'Bulwark of the Deep',desc:d=>'Your minions take '+rbPct(Math.min(RB_BULW_MAX,d*RB_BULW))+'% less damage.'},
  lungs:  {name:'Deep Lungs',         desc:d=>'In the Rift: 0.1% of your max mana more each turn per depth of the dive, up to '+rbPct(d*RB_LUNG)+'%.'},
  walker: {name:'Riftwalker',         desc:d=>'Rift rewards +'+Math.floor(d/5)+'% (gold, XP and drops).'},
  ward:   {name:'Deep Ward',          desc:d=>'Boss and guardian moves hit your side '+rbPct(Math.min(RB_WARD_MAX,d*RB_WARD))+'% softer.'}
};
const RB_IDS=Object.keys(RB_POW);
const rbPct=x=>Math.round(x*1000)/10;
const inRift=()=>!!(S&&S.run&&S.run.rift);
const rbK=()=>inRift()?1:RB_OUT;
function rbD(p){ if(!S||!S.equip) return 0; let d=0; for(const sl of GEAR_SLOTS){ const it=S.equip[sl]; if(it&&it.rb&&it.rb.p===p&&it.rb.d>d) d=it.rb.d; } return d; }   // the deepest worn piece of a power
const rbDesc=it=>RB_POW[it.rb.p].desc(it.rb.d)+(RB_OUT<1&&it.rb.p!=='descent'&&it.rb.p!=='first'&&it.rb.p!=='lungs'?' Outside the Rift: '+Math.round(RB_OUT*100)+'%.':'');
// the powers (each hook is read where its system lives)
function rbDescent(){ const d=rbD('descent'); return d&&inRift()?1+Math.min(S.run.rift*RB_DESC,d/200):1; }   // hurtFoe
function rbFirst(r){ const d=rbD('first'); if(!d||!r||r.flU) return 0; if(!inRift()&&(r.won||0)%3!==0) return 0; r.flU=1; tally('firstLight'); return d>=RB_FIRST_CD&&inRift()?2:1; }   // useSkill: 1 free mana, 2 also no cooldown
function rbBulwark(d){ const x=rbD('bulwark'); return x?Math.max(1,Math.round(d*(1-Math.min(RB_BULW_MAX,x*RB_BULW)*rbK()))):d; }   // allyDr, minions only
function rbLungs(g){ const x=rbD('lungs'); if(!x||!inRift()) return g; const r=S.run; r.lf=(r.lf||0)+pMana()*Math.min(r.rift*RB_LUNG,x*RB_LUNG); const n=Math.floor(r.lf); r.lf-=n; return g+n; }   // the end-of-turn mana
const rbWalk=()=>{ const d=rbD('walker'); return d?Math.floor(d/5)*RB_WALK:0; };   // riftRew; outside the Rift a share of it on kill gold
const rbGoldOut=()=>1+rbWalk()*RB_OUT;
const rbWard=()=>{ const d=rbD('ward'); return d?1-Math.min(RB_WARD_MAX,d*RB_WARD)*rbK():1; };   // bossHit
// the drop
const rbPool=()=>Object.values(ITEM).filter(d=>d.set===5&&!d.uq&&!d.tower&&d.tier===4);
function makeRiftborn(d,h,why){   // a Riftborn piece of depth d, chosen and rolled from the hash h
  const pool=rbPool(), R0=Math.random; let it=null; Math.random=trialRng(h,7);
  try{ it=addItem(pool[Math.floor(Math.random()*pool.length)].id); if(it){ it.rb={p:RB_IDS[Math.floor(Math.random()*RB_IDS.length)],d:Math.min(RB_DMAX,Math.max(1,Math.floor(d)))}; let ro=it.ro||[]; while(ro.length<lineMax(it)) ro=ro.concat([rollLine(it,ro.map(x=>x[0]))]); it.ro=ro.map(([k])=>[k,rollMax(it,k)]); } }   /* every bonus line a legendary can hold, at its best roll */ finally { Math.random=R0; }
  if(it){ tally('riftborn'); if(S.run&&S.run.log) log('A Riftborn piece: '+ITEM[it.id].name+' ('+RB_POW[it.rb.p].name+', depth '+it.rb.d+')'+(why?', '+why:'')+'.','story'); }
  return it;
}
function rbDrop(r,last){   // roomWon, after the room's loot: a guardian always leaves one, any other room from depth RB_AT at RB_DROP (not in the weekly dive)
  const n=r.rift; if(!(n>=RB_AT)||r.wk) return; const g=!!guardAt(n)&&last, h=dayHash(S.uid,S.runs,r.room,n,211);
  if(!g&&(h%10000)/10000>=RB_DROP*riftRew()) return;
  const it=makeRiftborn(n,h,g?'left by '+guardAt(n).name:'');
  if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; r.events.push({m:'Riftborn: '+ITEM[it.id].name+', '+RB_POW[it.rb.p].name+' at depth '+it.rb.d+'.',c:'ok'}); }
  else r.lostLoot.push('a Riftborn piece');
}
// attunement
const attuneCost=it=>RB_ATT_COST*(((it&&it.rb&&it.rb.a)||0)+1);
function attune(u){ const it=findItem(u); if(S.mode!=='town'||!it||!it.rb||it.rb.d>=RB_DMAX) return false; const c=attuneCost(it); if(riftShards()<c) return false;
  S.rift.shards-=c; it.rb.d=Math.min(RB_DMAX,it.rb.d+RB_ATT_STEP); it.rb.a=(it.rb.a||0)+1; tally('attuned'); if(it.rb.d>=50) tally('rb50'); sfx('level'); return true; }
function rbFix(it){ if(!it||!('rb' in it)) return; const b=it.rb, ok=b&&typeof b==='object'&&RB_POW[b.p]&&typeof b.d==='number'&&isFinite(b.d)&&b.d>=1&&ITEM[it.id]&&!ITEM[it.id].uq;   // normalizeSave (through hfFix)
  if(!ok){ delete it.rb; return; } const o={p:b.p,d:Math.min(RB_DMAX,Math.floor(b.d))}; if(typeof b.a==='number'&&b.a>=1) o.a=Math.min(99,Math.floor(b.a)); it.rb=o; }
// a secret master's heart for shards
const heartOpts=()=>SECRET.map(x=>'b:'+x.name).filter(k=>TROPHY[k]);
function buyHeart(){ if(S.mode!=='town'||riftShards()<RB_HEART) return null; const L=heartOpts(); if(!L.length) return null; const k=L[((S.rift.hb||0))%L.length];
  S.rift.shards-=RB_HEART; S.rift.hb=(S.rift.hb||0)+1; S.trophies[k]=(S.trophies[k]||0)+1; tally('shardHearts'); return k; }
// ----- the weekly seeded dive
// Beside the Trial: one try a day, the same rooms for everyone all week (the rooms are rolled from the week's seed), three fixed
// sigils. Every room is one depth, from depth 1 down, with a guardian on every fifth; the dive ends when you fall or leave. The best
// depth this week is kept (S.rift.wk = {w, b, day, top}). It pays no XP, gold, trophies or gear: a new weekly best pays a shard for
// every WEEK_SHARD depths it adds, and from depth RB_AT leaves a Riftborn piece of that depth. (A first build paid XP and a shard
// per 5 depths every try: the full bot reached level 95 by day 100 instead of 61, and ~600 shards.)
const WEEK_SHARD=5;
const weekNo=()=>Math.floor((S.day-1)/7)+1;
function weekPlan(){ const w=weekNo(), seed=dayHash(w,307), L=SIGIL_IDS.slice(), sig=[];
  for(let i=0;i<SIGIL_MAX;i++) sig.push(L.splice(dayHash(w,311,i)%L.length,1)[0]); return {w,seed,sig}; }
const wkSt=()=>{ S.rift=S.rift||{best:0}; const W=S.rift.wk; if(!W||W.w!==weekNo()) S.rift.wk={w:weekNo(),b:0,day:0,top:(W&&W.top)||0}; return S.rift.wk; };
const weekBest=()=>{ const W=S.rift&&S.rift.wk; return W&&W.w===weekNo()?W.b:0; };
const weekReady=()=>!!S&&S.mode==='town'&&riftOpen()&&!((S.rift&&S.rift.wk&&S.rift.wk.w===weekNo()&&S.rift.wk.day===S.day));
const weekDi=(seed,room)=>dayHash(seed,room,313)%GATE_N;
const roomBoss=(r,room)=>r&&r.sv?false:r&&r.wk?!!guardAt(r.rift):room===r.rooms-1;   /* a site's fight has no boss (game-roads.js) */   // buildRoom, spawnRoom: in the weekly dive a room is a boss room on a guardian's depth
function startWeek(){
  if(!weekReady()) return false; const p=weekPlan(), W=wkSt();
  W.day=S.day; S.runs++;   /* no watch: it pays no XP, gold or gear (with a watch the full bot lost ~4 levels and ~6 Tower floors by day 100) */ S.notices=[]; tally('weekDives');
  S.run={di:weekDi(p.seed,0),rift:1,wk:p.w,tseed:p.seed,room:0,rooms:2,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:null,heat:0,wkD:0};
  S.mode='battle'; titheSouls(); tally('riftRuns'); sigApply(S.run,p.sig);
  log('The weekly dive of week '+p.w+' begins. Every room is one depth down.','story');
  spawnRoom(); return true;
}
function weekStep(r){ r.rift++; r.rooms=r.room+2; r.di=weekDi(r.tseed,r.room); }   // descend: one depth further
function weekRoom(r){   // roomWon: a depth held
  r.wkD=r.rift; const G=guardAt(r.rift);
  if(G){ tally('guardians'); tally('gd_'+guardIx(r.rift)); }
}
function weekEnd(r){   // returnTown: the dive's depth is recorded
  if(!r||!r.wk||r.wkDone) return; r.wkDone=1; const W=wkSt(), d=r.wkD||0; if(W.w!==r.wk) return;
  if(d>W.b){ const s=Math.floor(d/WEEK_SHARD)-Math.floor(W.b/WEEK_SHARD); if(s) gainShards(s,'the weekly dive, depth '+d); W.b=d; tally('weekBests'); if(d>(W.top||0)) W.top=d; moment('Weekly dive: depth '+d,'gold');
    if(d>=RB_AT){ const it=makeRiftborn(d,dayHash(r.tseed,d,317),'for a new weekly best'); if(!it) notify('Your bag is full: the weekly dive\'s Riftborn piece was lost.','bad'); } }
}
// ----- the sigils on a dive (startRift takes the picked set; the weekly dive its fixed three)
function sigApply(r,sig){
  r.sig=sig.slice(); if(!r.sig.length) return; tally('sigDives'); r.sig.forEach(k=>tally('sig_'+k));
  if(r.sig.includes('wounds')) S.army.forEach(m=>{ if(m.hp>0) m.hp=Math.max(1,Math.round(m.maxHp*SIG_WOUND)); });
  if(r.sig.includes('typed')){ const n={}; S.army.forEach(m=>{ const t=minionType(m); n[t]=(n[t]||0)+1; }); r.sigT=Object.keys(n).sort((a,b)=>n[b]-n[a])[0]||'phys'; }
  log('Sigils on this dive: '+r.sig.map(k=>SIGILS[k].name).join(', ')+'. Rewards x'+riftRew(r.sig).toFixed(2)+'.','story');
}
// ----- Rift events: half the events between a dive's rooms come from the Rift itself (never in the gates: rollEvent keeps them out)
const RIFT_EV=.5, TEAR_HP=.9, TEAR_REW=.2, FOLD_SKIP=2, MEM_DEV=20;
const RIFT_FRAGS=[
  {t:'The other half, I',m:'The Ledger was never one book. It was cut in two at the binding, and the half you hold writes the dead down. The other half was meant to write them out.'},
  {t:'The other half, II',m:'The first keeper took the writing half up into the valley and left the other in the dark beneath it, where the gates fold together. The Rift is the gap it left.'},
  {t:'The other half, III',m:'Something has been reading the lower half all this time. Every name you raised, it has read backwards. The guardians are what it made of them.'},
  {t:'The other half, IV',m:'At the very bottom the two halves still touch. A keeper who reached it could close the book for good, or write in both at once. No keeper has reached it yet.'}
];
const fragN=()=>Math.min(RIFT_FRAGS.length,(S.rift&&S.rift.fr)||0);
Object.assign(EVENTS,{
  rfold:  {name:'A fold',rift:true,text:'The Rift creases here, and through the crease you can see two depths further down.', opts:[['skip','Step through (this dive counts '+FOLD_SKIP+' depths deeper, and its foes stand there)'],['pass','Stay on this depth']]},
  rmem:   {name:'One of yours',rift:true,text:'Among the Rift\'s dead stands one you know: a minion of yours from the Memorial, folded down here when it fell.', opts:[['raise','Raise it again (a free body that keeps its name)'],['free','Let it go (+'+MEM_DEV+' Choir devotion if you are sworn to the Choir; your army mends 20%)']]},
  rfrag:  {name:'A fragment of the other half',rift:true,text:'A torn page lies in the dust, written in your own hand but backwards.', opts:[['read','Read it'],['pass','Leave it']]},
  rshrine:{name:'A tear-shrine',rift:true,text:'A seam in the air, stitched shut with old bone. Open it a little, and the Rift pays you to bleed.', opts:[['tear','Open it (10% less max HP for this dive, rewards +20%)'],['pass','Leave it shut']]}
});
const RIFT_EV_IDS=['rfold','rmem','rfrag','rshrine'];
const memPick=()=>(S.memorial||[]).filter(x=>x&&mobOf(x.kind)).slice(-1)[0]||null;   // the eldest name the Rift can fold back
function mobOf(kind){ for(let i=0;i<GATE_N;i++){ const m=DUNGEONS[i].mobs.find(x=>x[0]===kind); if(m) return {di:i,m}; } return null; }
function riftEvent(){   // rollEvent, in a dive (not the weekly one)
  const r=S.run, ok=RIFT_EV_IDS.filter(k=>k!=='rmem'||memPick()).filter(k=>k!=='rfrag'||fragN()<RIFT_FRAGS.length).filter(k=>k!=='rshrine'||!r.tear).filter(k=>k!=='rfold'||!r.rfold);
  return ok.length?{id:pick(ok)}:null;
}
function riftEvResolve(ev,ch){   // resolveEvent
  const r=S.run, P=S.player;
  if(ev.id==='rfold'&&ch==='skip'){ r.rift+=FOLD_SKIP; r.rfold=1; tally('riftFolds'); return {m:'You step through the fold. This dive is now depth '+r.rift+'.',c:'ok'}; }
  if(ev.id==='rmem'&&ch==='raise'){ const x=memPick(), o=x&&mobOf(x.kind); if(!o) return null; const lv=Math.max(x.lvl||1,riftLvl(r.rift)-2);
    r.corpses.push({id:'cm'+(++S.uid),armed:isArmed(x.kind),name:x.kind,base:x.kind,role:o.m[1],rankI:o.di,lvl:lv,hf:o.m[2],af:o.m[3],boss:false,elite:false,tried:false,result:null,minion:null,free:true,mem:x.nick});
    tally('riftMem'); return {m:x.nick+' waits with the other bodies. Raising it costs no mana, and it remembers its name.',c:'ok'}; }
  if(ev.id==='rmem'&&ch==='free'){ const x=memPick(); S.army.forEach(m=>{ if(m.hp>0) m.hp=Math.min(m.maxHp,m.hp+Math.round(m.maxHp*.2)); }); if(faithOf()==='choir') deed('choir',MEM_DEV/DEED_K.choir/templeDev());
    return {m:'You let '+(x?x.nick:'it')+' go. Your army mends'+(faithOf()==='choir'?' and the Choir sings it home':'')+'.',c:'ok'}; }
  if(ev.id==='rfrag'&&ch==='read'){ const n=fragN(); if(n>=RIFT_FRAGS.length) return null; S.rift.fr=n+1; tally('riftFrags'); const F=RIFT_FRAGS[n]; log(F.t+': '+F.m,'story'); return {m:F.t+'. '+F.m,c:'ok'}; }
  if(ev.id==='rshrine'&&ch==='tear'){ r.tear=1; P.hp=Math.min(P.hp,pMax()); tally('tears'); return {m:'The seam opens. You feel thinner, and the Rift pays more.',c:'ok'}; }
  return null;
}
const tearK=()=>S&&S.run&&S.run.tear?TEAR_HP:1;   // pMax
