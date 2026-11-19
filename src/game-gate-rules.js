// ===== BOSS ABILITIES =====
// Every gate boss has a signature move it uses every few turns instead of attacking. Moves marked warn are telegraphed a turn
// ahead: raise Bone Ward, or freeze the boss with Grave Chill to break its focus and cancel the move. Tower wardens borrow these.
const BOSS_ABIL={
  swarm:   {name:'Call the Swarm', every:3,warn:false,desc:'Calls two more of its kind into the fight.'},
  bonewall:{name:'Bone Wall',      every:4,warn:false,desc:'Shields every foe for 20% of its max HP (a shield holds at most 40%).'},
  cinder:  {name:'Cinder Wave',    every:3,warn:true, desc:'Hits you and every minion for 70% of its attack and burns each of you for 2 turns.'},
  hymn:    {name:'Hymn of Silence',every:4,warn:true, desc:'Silences your skills for 2 turns and mends every foe for 10% of its max HP.'},
  seedfall:{name:'Seedfall',       every:4,warn:false,desc:'Mends every foe for 15% of its max HP and sprouts a new one.'},
  decree:  {name:'Royal Decree',   every:4,warn:true, desc:'One blow worth 45% of your max HP. Ward soaks it.'},
  sunder:  {name:'Sundering Blow', every:3,warn:true, desc:'One blow worth 35% of your max HP. Taunt turns it onto a vanguard; a Focus crit or Grave Chill breaks it.'}
};
const GATE_ABIL=['swarm','bonewall','cinder','hymn','seedfall','decree'];
const SUMMON_CAP=4;   // adds a boss may call per fight, so a fight cannot be farmed forever
function giveAbility(e,id,faster){ e.abil=id; e.abilT=BOSS_ABIL[id].every-(faster||0); e.summoned=0; e.fast=faster||0; }
function bossTurn(e){   // true if the boss spent its turn on its ability (or on gathering for it)
  if(!BOSS_ABIL[e.abil]) return false;
  const gap=mv=>Math.max(2,BOSS_ABIL[mv].every-(e.fast||0)-(omen()==='ashfall'?1:0));
  if(e.charging){ const mv=e.move||e.abil; e.charging=false; e.move=null; e.abilT=gap(mv); fireAbility(e,mv); return true; }
  if(--e.abilT>0) return false;
  const mv=e.phase2&&e.alt?'sunder':e.abil, A=BOSS_ABIL[mv]; if(e.phase2) e.alt=!e.alt;   // the second phase alternates with Sundering Blow
  if(A.warn||e.phase2){ e.charging=true; e.move=mv; log(e.name+' gathers itself for '+A.name+'! '+A.desc,'bad'); sfx('warn'); fxe('charge',e); return true; }
  e.abilT=gap(mv); fireAbility(e,mv); return true;
}
function chargeInfo(e){   // a charging boss: the move it lands next turn, what answers it (from the rules here and in fireAbility), and the answer keys the action bar marks
  if(!e||!e.charging||e.hp<=0) return null; const mv=e.move||e.abil, A=BOSS_ABIL[mv]; if(!A) return null;
  if(mv==='sunder') return {mv,name:A.name,hint:'Taunt it onto a vanguard, or freeze it',ans:['vanguard','chill','striker']};   /* Taunt sends the blow at a vanguard */
  if(mv==='cinder'||mv==='decree') return {mv,name:A.name,hint:'Ward or freeze it',ans:['ward','chill','striker']};   /* a blow: a ward soaks it */
  return {mv,name:A.name,hint:'Freeze it or Focus-crit it',ans:['chill','striker']};   /* no damage to soak: only breaking the focus stops it */
}
function summonAdd(e){
  if(e.summoned>=SUMMON_CAP||liveFoes().length>=5) return null;
  const mk=()=>e.tw?makeTowerEnemy(e.tw,false,-1):makeEnemy(e.rankI,Math.max(1,e.lvl-2),false), hasMender=liveFoes().some(x=>x.role==='mender');
  let a=mk(); for(let i=0;i<30&&hasMender&&a.role==='mender';i++) a=mk(); if(hasMender&&a.role==='mender') return null;   // never a second mender (bug found in play-testing)
  if(e.tw) foeScale([a],TW.foeAtk); else { foeScale([a],foeAtkMul(S.run.di)); bulwark([a]); }
  affixAll([a]); e.summoned++; S.run.enemies.push(a); return a;
}
function fireAbility(e,mv){
  mv=mv||e.abil; const r=S.run, P=S.player, A=BOSS_ABIL[mv], foes=liveFoes();
  if(mv==='swarm'){ const got=[summonAdd(e),summonAdd(e)].filter(Boolean); log(got.length?e.name+' uses '+A.name+': '+got.map(x=>x.name).join(' and ')+' join the fight.':e.name+' calls, but nothing more answers.','bad'); }
  else if(mv==='bonewall'){ foes.forEach(f=>{ f.shield=Math.min(Math.round(f.maxHp*.4),(f.shield||0)+Math.round(f.maxHp*.2)); fxe('ward',f); }); log(e.name+' raises a Bone Wall. Every foe is shielded.','bad'); }
  else if(mv==='cinder'){
    let tot=0;
    allies().filter(a=>a.hp>0).forEach(a=>{
      const d=hit(e.atk*(e.secret?.45:.7)*enrage(e));   /* a secret master's wave is spread thinner: at full strength it wiped every army */
      hurtAlly(a,d);
      fxe('hurt',a,{fire:1});
      addDot(a,'burn',e.atk*.15,2);
      tot+=d;
      if(a.hp<=0&&a.id!=='p') log(a.nick+' is down.','bad');
    });
    log(e.name+' unleashes a Cinder Wave for '+tot+' damage across your side.','bad');
  }
  else if(mv==='hymn'){ r.silence=3; foes.forEach(f=>{ f.hp=Math.min(f.maxHp,f.hp+Math.round(f.maxHp*.1)); }); log(e.name+' sings the Hymn of Silence. Your skills are silenced for 2 turns and every foe mends.','bad'); }
  else if(mv==='seedfall'){ foes.forEach(f=>{ f.hp=Math.min(f.maxHp,f.hp+Math.round(f.maxHp*.15)); }); const a=summonAdd(e); log(e.name+' scatters Seedfall. Every foe mends'+(a?' and '+a.name+' sprouts from the ground':'')+'.','bad'); }
  else if(mv==='decree'){ const d=Math.round(pMax()*.45*enrage(e)); hurtAlly(P,d); fxe('hurt',P,{crit:1}); log(e.name+' speaks a Royal Decree. It strikes you for '+d+'.','bad'); }
  else if(mv==='sunder'){ const v=r.taunt>0?S.army.filter(m=>m.role==='vanguard'&&m.hp>0):[];
    if(v.length){ const t=pick(v), d=hit(e.atk*2.2*enrage(e)); hurtAlly(t,d); fxe('hurt',t,{crit:1}); log(e.name+' brings down a Sundering Blow, but '+t.nick+' takes it for you: '+d+' damage.'+(t.hp<=0?' '+t.nick+' is down.':''),'bad'); }
    else { const d=Math.round(pMax()*.35*enrage(e)); hurtAlly(P,d); fxe('hurt',P,{crit:1}); log(e.name+' brings down a Sundering Blow on you for '+d+'.','bad'); } }
  sfx('boss');
}
function playerFalls(){   // the player hit 0 HP: revive from gear if possible, otherwise the run is lost. True if defeated.
  const r=S.run, P=S.player, lim=hasFlag('deathless')?2:hasFlag('undying')?1:0;
  if((r.revives||0)<lim){ r.revives=(r.revives||0)+1; P.hp=Math.round(pMax()*(hasFlag('deathless')?.5:.3)); log('Your armor refuses to break. You rise at '+P.hp+' HP.','ok'); return false; }
  if(blessed('hon')&&!r.tw&&!r.grace){ r.grace=true; P.hp=Math.max(1,Math.round(pMax()*GRACE_HP)); tally('graced'); log('The Old Gods will not let you fall. You rise at '+P.hp+' HP.','story'); moment('Grace','gold'); return false; }
  defeat(); return true;
}
function sellItem(u){ if(S.mode!=='town') return 0; const i=S.inv.findIndex(x=>x.u===u); if(i<0) return 0; const it=S.inv[i], d=ITEM[it.id]; if(d.uq||it.lk) return 0; S.inv.splice(i,1); const g=sellValue(it); S.gold+=g; tally('soldItems'); sfx('coin'); return g; }
const isJunk=it=>{ const d=ITEM[it.id]; return !!d&&!d.uq&&!it.lk&&d.tier<=1; };   // Common and Uncommon pieces in the bag, never locked ones (and never what you wear)
const BULK_TIERS=[2,3,4];   // Rare, Epic, Legendary: each has its own sell and salvage button
const tierLot=t=>S.inv.filter(it=>{ const d=ITEM[it.id]; return !!d&&!d.uq&&!it.lk&&d.tier===t; });
function sellTier(t){ if(S.mode!=='town'||!BULK_TIERS.includes(t)) return null; const list=tierLot(t); let g=0; for(const it of list) g+=sellItem(it.u); return {n:list.length,g}; }
function sellJunk(){ if(S.mode!=='town') return null; const list=S.inv.filter(isJunk); let g=0; for(const it of list) g+=sellItem(it.u); return {n:list.length,g}; }

// ===== STATUS EFFECTS =====
// Damage over time: bleed (crits from enemy strikers), burn (Cinder Wave), poison (Venomous minions). One of each kind per unit;
// a new dose refreshes it. They tick at the end of each turn, ignore ward and armor, and wear off when you leave a room.
const DOTS={poison:{name:'Poisoned'},bleed:{name:'Bleeding'},burn:{name:'Burning'}};
function addDot(u,k,d,t){ d=Math.round(d); if(d<1||!(u.hp>0)||hasAff(u,'warded')||hasTrait(u,'warded')) return; u.dots=u.dots||{}; const o=u.dots[k]; u.dots[k]=o?{d:Math.max(o.d,d),t:Math.max(o.t,t)}:{d,t}; }
const clearDots=u=>{ if(u) delete u.dots; };
function tickDots(){
  let foeD=0, ourD=0;
  const tick=(u,hurt)=>{ if(!u.dots) return; for(const k of Object.keys(u.dots)){ const o=u.dots[k]; if(u.hp>0) hurt(u,o.d); if(--o.t<=0) delete u.dots[k]; } if(!Object.keys(u.dots).length) delete u.dots; };
  for(const e of S.run.enemies) tick(e,(u,d)=>{ const h=u.hp; hurtFoe(u,d); foeD+=h-u.hp; });
  for(const a of allies()) tick(a,(u,d)=>{ const n=Math.min(d,u.hp); u.hp-=n; if(n>0){ mark(u,n,0); if(u.id==='p') S.run.hurt=true; } ourD+=n; if(u.hp<=0&&u.id!=='p'){ log(u.nick+' succumbs.','bad'); fxe('death',u); } });
  if(foeD) log('Poison eats '+foeD+' HP from your foes.','ok');
  if(ourD) log('Bleeding and burns cost your side '+ourD+' HP.','bad');
}

// ===== EVENTS BETWEEN ROOMS =====
// After some rooms in the gates (not the last, not the Tower) you find something. Walking past is always safe.
const EVENT_CHANCE=.3;
const EVENTS={
  shrine:   {name:'A blood shrine',     text:'Old blood crusts a stone basin. Feed it, and it sharpens every blow for the rest of this gate.', opts:[['bleed','Feed it 20% of your max HP'],['pass','Walk past']]},
  pedlar:   {name:'A wandering pedlar', text:'A hooded dead man rattles a tray of bottles and asks half the market price.', opts:[['buy','Buy'],['pass','Wave him off']]},
  coffer:   {name:'A sealed coffer',    text:'An iron box, chained shut. It might hold gold and gear, or a trap.', opts:[['open','Force it open'],['pass','Leave it']]},
  oldgods:  {name:'A shrine of the Old Gods',faith:'hon',text:'A clean stone in a dirty place, still warm. The Old Gods know an Honored One.', opts:[['pray','Pray (heal 30% HP, refill mana)'],['pass','Walk past']]},
  defiled:  {name:'A defiled altar',   faith:'dis',text:'Someone gutted the old altar and left the offerings. A Dishonored One takes what is owed.', opts:[['take','Take the offerings (lose 10% HP, gain gold and a Soul)'],['pass','Walk past']]},
  straggler:{name:'A wounded straggler',text:'One of the gate\'s dead drags itself away from the fight, broken.', opts:[['raise','Take it as it is (free raise, +25%)'],['finish','Finish it (bonus XP)']]}
};
const STRAGGLER_BONUS=25;
const FAITH_EVENT=.25;   // a sworn necromancer meets a shrine true to the oath in a quarter of events
function rollEvent(){ const fe=Object.keys(EVENTS).find(k=>EVENTS[k].faith&&EVENTS[k].faith===faithOf()), id=fe&&Math.random()<FAITH_EVENT?fe:pick(Object.keys(EVENTS).filter(k=>!EVENTS[k].faith)), ev={id}; if(id==='pedlar'){ ev.pot=pick(Object.keys(POTIONS)); ev.price=Math.ceil(POTIONS[ev.pot].price()/2); } return ev; }
function corpseOf(e){ const c={id:'c'+e.id,armed:isArmed(e.base),name:e.name,base:e.base,role:e.role,rankI:e.rankI,lvl:e.lvl,hf:e.hf,af:e.af,tw:e.tw,boss:e.boss,elite:e.elite,tried:false,result:null,minion:null}; if(e.aff&&e.aff.length) c.aff=e.aff.slice(); return c; }
function resolveEvent(ch){
  const r=S.run; if(S.mode!=='raise'||!r||!r.event||r.event.done) return false;
  const ev=r.event, P=S.player, lvl=RK[r.di].lv+Math.floor(r.room/2); let m='', c='';
  if(ch==='pass') m='You leave it be.';
  else if(ev.id==='shrine'&&ch==='bleed'){ if(P.hp<=1) return false; const d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*.2))); P.hp-=d; r.bless=true; tally('shrine'); m='The shrine drinks '+d+' HP. You and your army hit 15% harder for the rest of this gate.'; c='ok'; }
  else if(ev.id==='pedlar'&&ch==='buy'){ if(S.gold<ev.price||S.belt[ev.pot]>=BELT_MAX) return false; S.gold-=ev.price; S.belt[ev.pot]++; tally('pedlar'); m='You buy a '+POTIONS[ev.pot].name+' for '+ev.price+' gold.'; c='ok'; sfx('coin'); }
  else if(ev.id==='coffer'&&ch==='open'){ tally('coffer');
    if(Math.random()<.6){ const g=Math.round((10+P.lvl*4)*(1+r.di)*ngpReward()); S.gold+=g; r.goldTot=(r.goldTot||0)+g; const it=addItem(pickRow(tableFor(r.di,'vanguard',false,true)));
      if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } findPage('coffer',r); m='Inside: '+g+' gold'+(it?' and '+withArticle(ITEM[it.id].name)+'.':'. There was gear too, but your bag is full.'); c='ok'; sfx('coin'); }
    else { const d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*.25))); P.hp-=d; tally('trap'); m='A needle trap. You lose '+d+' HP and find nothing.'; c='bad'; sfx('hurt'); }
  }
  else if(ev.id==='oldgods'&&ch==='pray'){ const h=healAlly(P,Math.round(pMax()*.3)); P.mana=pMana(); tally('prayed'); m='The Old Gods hear you. You recover '+h+' HP and your mana is full.'; c='ok'; sfx('coin'); }
  else if(ev.id==='defiled'&&ch==='take'){ const d=Math.max(0,Math.min(P.hp-1,Math.round(pMax()*.1))), g=Math.round((10+P.lvl*3)*(1+r.di)*ngpReward()); P.hp-=d; S.gold+=g; r.goldTot=(r.goldTot||0)+g; const got=gainSoul(); tally('defiled');
    m='You take the offerings: '+g+' gold'+(got?' and a Soul ('+r.souls+'/'+SOUL_MAX+')':'')+'. The altar takes '+d+' HP in return.'; c='ok'; sfx('coin'); }
  else if(ev.id==='straggler'&&ch==='raise'){ const e=makeEnemy(r.di,lvl,false), cp=corpseOf(e); cp.free=true; r.corpses.push(cp); m=e.name+' waits with the other bodies. Raising it costs no mana.'; c='ok'; }
  else if(ev.id==='straggler'&&ch==='finish'){ const e=makeEnemy(r.di,lvl,false), xp=Math.round(killXp(e)*1.5); r.gained+=xp; r.ups+=addXp(xp); m='You finish '+theName(e.name)+'. +'+xp+' XP.'; c='ok'; }
  else return false;
  ev.done=m; r.events.push({m,c}); return true;
}

// ===== CURSED GATES =====
// Each day one gate you have already cleared is cursed with a twist. It is harder, and it pays more.
const MODS={
  volatile:{name:'Volatile dead',desc:'Foes burst when they die and hurt you for half their attack (never below 1 HP; ward soaks it).'},
  drought: {name:'Drought',      desc:'No mana comes back at the end of a turn. Strike still gives 3.'},
  fury:    {name:'Fury',         desc:'Foes deal 25% more damage.'},
  bulwark: {name:'Bulwark',      desc:'Foes have 30% more HP.'},
  horde:   {name:'Horde',        desc:'Every room holds one more foe.'}
};
const MOD_XP=1.25, MOD_GOLD=2, MOD_DROP=1.5, MOD_REWARD='Foes +15% HP and attack. Double gold and trophies, +25% XP, +50% gear.';
function dayMod(){
  if(!S.mod||S.mod.day!==S.day){
    const cl=DUNGEONS.map((D,i)=>i).filter(i=>S.ti&&S.ti.clr&&S.ti.clr[i]&&S.player.lvl>=RK[i].unlock);
    S.mod=cl.length?{day:S.day,gi:pick(cl),id:pick(Object.keys(MODS))}:{day:S.day,gi:-1,id:null};
  }
  return S.mod;
}
// ===== OMEN DAYS =====
// Once a gate has been cleared, some dawns bring an omen that touches every gate and the Tower for that day.
const OMENS={
  bloodmoon:{name:'Blood Moon',desc:'Elites are twice as common.'},
  paletide: {name:'Pale Tide', desc:'+10% chance to raise the dead.'},
  ashfall:  {name:'Ashfall',   desc:'Bosses and wardens use their moves a turn sooner, and pay 25% more XP.'}
};
const OMEN_CHANCE=.25, OMEN_RAISE=10, OMEN_BOSS_XP=1.25;
function dayOmen(){ if(!S.omen||S.omen.day!==S.day) S.omen={day:S.day,id:anyClear()&&Math.random()<OMEN_CHANCE?pick(Object.keys(OMENS)):null}; return S.omen; }
const omen=()=>(S&&S.player&&!(S.run&&(S.run.siege||S.run.trial)))?dayOmen().id:null;   // omens do not reach a siege or a Trial
const eliteChance=()=>.1*(omen()==='bloodmoon'?2:1);
const gateMod=di=>{ const m=dayMod(); return m.gi===di?m.id:null; };
const runMod=()=>(S.run&&!S.run.tw&&S.run.mod)||null;
const hasRunMod=id=>{ const r=S.run; return !!r&&!r.tw&&(r.mod===id||r.mod2===id); };   // a Trial can carry a second curse (r.mod2)
// Once the Throne of Ash has fallen, a cursed gate's foes rise to just below your level: cursed days stay a real fight, and
// pay for it (XP and gold already follow foe level).
const CURSE_GAP=5;
const curseRise=di=>(runMod()&&S.ti&&S.ti.clr&&S.ti.clr[5])?Math.max(0,S.player.lvl-CURSE_GAP-RK[di].lv):0;
const foeAtkMul=di=>DIFF.foeAtk[di]*(hasRunMod('fury')?1.25:1);
const bulwark=list=>{ if(hasRunMod('bulwark')) for(const e of list){ e.maxHp=e.hp=Math.round(e.maxHp*1.3); } };
function volatileBurst(e){   // Volatile dead: a dying foe bursts on you
  const P=S.player; let d=Math.round(e.atk*.5); const s=Math.min(P.shield,d); P.shield-=s; d=Math.max(0,Math.min(d-s,P.hp-1)); P.hp-=d; if(d){ mark('p',d,0); S.run.hurt=true; }
  log(e.name+' bursts'+(d?' and burns you for '+d:', but your ward takes it')+'.','bad');
}

// ===== GATE DIFFICULTY =====
// A cleared gate can be entered on a higher difficulty: Hard after a clear, Brutal after a Hard clear, Nightmare after Brutal.
// Foes grow stronger and every reward grows with them. On a cursed day the curse feeds on it: foes x1.5 more, rewards x1.3.
const HEAT=[{name:'Normal',foe:1,xp:1,gold:1,drop:1},{name:'Hard',foe:1.4,xp:1.3,gold:1.5,drop:1.3},{name:'Brutal',foe:2,xp:1.7,gold:2.2,drop:1.7},{name:'Nightmare',foe:3.6,xp:2.3,gold:3,drop:2.2}];
const DAMNED=1.3, DAMNED_FOE=1.5, CURSE_FOE=1.15;   // cursed and harder: rewards x1.3, foes x1.5; cursed on Normal: foes x1.15 (rewards come from the curse itself)
const foeHeat=()=>{ const h=runHeat(), m=runMod(); return (h?HEAT[h].foe:1)*(m?(h?DAMNED_FOE:CURSE_FOE):1); };
const heatMax=di=>Math.min(HEAT.length-1,S.ti&&S.ti.clr&&S.ti.clr[di]?((S.heatMax&&S.heatMax[di]!=null?S.heatMax[di]:0)+1):0);   // highest level you may pick
const heatOf=di=>Math.min((S.heat&&S.heat[di])||0,heatMax(di));
function setHeat(di,lv){ if(S.mode!=='town'||!RK[di]||!(lv>=0&&lv<=heatMax(di))) return false; S.heat=S.heat||{}; if(lv) S.heat[di]=lv; else delete S.heat[di]; return true; }
const runHeat=()=>(S.run&&!S.run.tw&&S.run.heat)||0;
const gateFarm=di=>(heatOf(di)||gateMod(di)||!(S.ti&&S.ti.clr&&S.ti.clr[di]))?1:farmK(di,S.player.lvl);   // what a Normal run of this gate would pay now (the gate card)
const runFarm=()=>{ const r=S.run; if(!r||r.tw||r.rift||r.siege||r.heat||runMod()||!(S.ti&&S.ti.clr&&S.ti.clr[r.di])) return 1; return farmK(r.di,S.player.lvl); };
const heatK=k=>{ const h=runHeat(); if(!h) return (k==='xp'||k==='gold')?runFarm():1; return (k==='foe'?foeHeat():HEAT[h][k]*(runMod()?DAMNED:1)); };   // the cursed and the hard together

// ===== RUN HISTORY =====
const HIST_N=20, LIFE_KEYS=['runs','clears','deaths','fled','rooms','kills','xp','gold','items','raised'];
const runResult=r=>r.cleared?'cleared':S.mode==='defeat'?'fell':r.fled?'fled':'left';
function recordRun(target,r,res){
  const h={d:S.day,g:r.tw?-1:r.di,f0:r.tw0||0,f1:r.tw||0,rooms:r.won||0,kills:r.kills||0,xp:r.gained||0,gold:r.goldTot||0,items:r.items||0,raised:r.raised||0,mod:r.mod||null,res}; if(r.heat) h.heat=r.heat; if(r.secret) h.sec=r.secret; if(r.rift) h.rift=r.rift; if(r.riftRec) h.rr=1; if(r.siege) h.siege=1; if(r.trial) h.trial=r.trial;
  target.hist=(target.hist||[]).concat([h]).slice(-HIST_N);
  const L=target.life=target.life||{}; LIFE_KEYS.forEach(k=>{ L[k]=L[k]||0; });
  L.runs++; if(res==='cleared') L.clears++; if(res==='fell') L.deaths++; if(res==='fled') L.fled++;
  L.rooms+=h.rooms; L.kills+=h.kills; L.xp+=h.xp; L.gold+=h.gold; L.items+=h.items; L.raised+=h.raised;
}
// ===== RECORDS =====
// Personal bests for the Ledger's Records page. They are kept through New Game+.
// S.rec = {hit:{v,day}, fast:{di:{t,day,heat}}, kills:{v,day}, gold:{v,day}, floor:{v,day}, sec:{i:day}}
const REC_NAME={rift:'Deepest Rift',hit:'biggest hit',kills:'most kills in one run',gold:'most gold from one run',floor:'deepest Tower floor'};
function recFlash(k,txt){ const r=S.run; if(r){ r.recF=r.recF||{}; if(r.recF[k]) return; r.recF[k]=1; } moment('New record: '+txt,'gold'); }   // once per run and kind, never for a first record
function recBest(k,v){ if(!S||!(v>0)) return; S.rec=S.rec||{}; const o=S.rec[k]; if(!o||v>o.v){ S.rec[k]={v:Math.round(v),day:S.day}; if(o) recFlash(k,REC_NAME[k]+', '+Math.round(v).toLocaleString()); } }
function recRun(r){   // at the end of every run
  if(!r) return; recBest('kills',r.kills||0); recBest('gold',r.goldTot||0);
  if(!r.tw&&!r.rift&&!r.trial&&r.cleared&&r.tt>0){ S.rec=S.rec||{}; const f=S.rec.fast=S.rec.fast||{}, o=f[r.di]; if(!o||r.tt<o.t){ f[r.di]={t:r.tt,day:S.day,heat:r.heat||0}; if(o) moment('New record: '+DUNGEONS[r.di].name+' in '+r.tt+' turns','gold'); } }
}
// ===== DOORS =====
// After each gate room (not before the boss, not in the Tower) you pick the next room from two or three doors.
// The first door is always an ordinary fight, so "descend" with no choice behaves as before.
const ELITE_ROOM=1.25, ELITE_DROP=2, ELITE_GOLD=1.5, REST_HEAL=.4;
const DOORS={
  fight:   {name:'A dark passage',  desc:'Another room of the gate.'},
  elite:   {name:'A bloodied arch', desc:'Stronger foes (+25% HP and attack). Twice the gear drops and 50% more gold.'},
  rest:    {name:'A quiet ossuary', desc:'No fight. Rest to recover 40% of your HP and mana, and your army 40%.'},
  treasure:{name:'A sealed vault',  desc:'No fight. Gold and a piece of gear.'},
  boss:    {name:'The boss chamber',desc:'The master of this gate.'}
};
function rollDoors(r){
  if(r.room+1>=r.rooms-1) return ['boss'];
  let pool=['elite','elite','elite','rest','rest','treasure']; const out=['fight'], n=Math.random()<.4?2:1;   // weighted: elite 3, rest 2, treasure 1
  while(out.length<1+n&&pool.length){ const k=pick(pool); out.push(k); pool=pool.filter(x=>x!==k); }
  return out;
}
const roomKind=()=>(S.run&&!S.run.tw&&S.run.roomKind)||null;
function quietRoom(kind){   // a rest or treasure room: no fight, then the doors again
  const r=S.run, P=S.player; let m;
  r.corpses=[]; r.spoils=[]; r.lostLoot=[]; r.events=[]; r.lastXp=0; r.lastGold=0; r.lastTroph={}; r.enemies=[];
  if(kind==='rest'){ P.hp=Math.min(pMax(),P.hp+Math.round(pMax()*REST_HEAL)); P.mana=Math.min(pMana(),P.mana+Math.round(pMana()*REST_HEAL)); S.army.forEach(x=>{ x.hp=Math.min(x.maxHp,x.hp+Math.round(x.maxHp*REST_HEAL)); });
    m='You rest among the bones. You and your army recover.'; sfx('heal'); }
  else { const g=Math.round((15+P.lvl*5)*(1+r.di)*ngpReward()*(1+xb('goldp')/100)); S.gold+=g; r.goldTot=(r.goldTot||0)+g; r.lastGold=g; const it=addItem(pickRow(tableFor(r.di,'vanguard',true,false)));
    if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } m='The vault gives up '+g+' gold'+(it?' and '+withArticle(ITEM[it.id].name):'')+'.'; sfx('coin'); }
  r.events.push({m,c:'ok'}); r.quiet=kind; r.doors=rollDoors(r); S.mode='raise';
}

// ===== GEAR SETS =====
// Two or three pieces from the same gate's set (its uniques count too) give a bonus. Tower gear belongs to no set.
const SET_NAMES=['Scavenger\'s Kit','Drowned Vigil','Ember Rite','Choir of Bones','Ironbark','Pale Court'];
const SET_BONUS=[{2:{hp:15},3:{goldp:10}},{2:{mana:20},3:{manap:8}},{2:{strength:3},3:{dmgp:5}},{2:{will:3},3:{mpow:10}},{2:{constitution:4},3:{drp:5}},{2:{mpow:8},3:{dmgp:6,drp:3}}];
const setCount=si=>(S&&S.equip)?GEAR_SLOTS.filter(sl=>{ const it=S.equip[sl], d=it&&ITEM[it.id]; return d&&!d.tower&&d.set===si; }).length:0;
const setB=k=>{ let n=0; for(let i=0;i<SET_BONUS.length;i++){ const c=setCount(i); if(c>=2) n+=SET_BONUS[i][2][k]||0; if(c>=3) n+=SET_BONUS[i][3][k]||0; } return n; };
// ===== UNIQUE SETS =====
// The uniques form six sets of three (a weapon, an armor and a relic each): two from the gate bosses, four from the Tower
// wardens. Their bonuses are bigger than a gate set's and stack with them (a gate unique still counts toward its gate set).
const USET=[
  {name:'Tithes of the Ledger', from:'Rat Warren, Sunken Crypt and Ashen Barrow bosses', ids:['u0','u1','u2'], b:{2:{mpow:10,raise:5},3:{dmgp:8,xpp:10}}},
  {name:'Last Rites',           from:'Hollow Cathedral, Iron Orchard and Throne of Ash bosses', ids:['u3','u4','u5'], b:{2:{manap:10,raise:8},3:{mpow:15,drp:6}}},
  {name:"Wardens' Tribute",     from:'Tower floors 10, 20 and 30', ids:['w1','w2','w3'], b:{2:{crit:8,hpp:6},3:{dmgp:10,regen:2}}},
  {name:"The Fly-Duke's Court", from:'Tower floors 40, 50 and 60', ids:['w4','w5','w6'], b:{2:{mpow:15},3:{slot:1,manap:12}}},
  {name:"Hell's Executioners",  from:'Tower floors 70, 80 and 90', ids:['w7','w8','w9'], b:{2:{strength:10,drp:5},3:{dmgp:12,hpp:10}}},
  {name:'Regalia of Ruin',      from:'Tower floor 100', ids:['w10','w11','w12'], b:{2:{hpp:10,manap:10},3:{dmgp:15,drp:10,xpp:15}}}
];
USET.forEach((u,i)=>u.ids.forEach(id=>{ ITEM[id].uset=i; }));
const usetCount=i=>(S&&S.equip)?USET[i].ids.filter(id=>GEAR_SLOTS.some(sl=>S.equip[sl]&&S.equip[sl].id===id)).length:0;
const usetB=k=>{ let n=0; for(let i=0;i<USET.length;i++){ const c=usetCount(i); if(c>=2) n+=USET[i].b[2][k]||0; if(c>=3) n+=USET[i].b[3][k]||0; } return n; };
