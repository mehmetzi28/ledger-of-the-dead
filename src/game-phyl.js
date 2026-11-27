// ===== R21 PR A: corruption and the phylactery =====
// The Ledger changes the one who writes in it. S.player.corr (0-100) rises with dark power used (a boss raised, Corpse
// Explosion, Reap, an Execute order, a defiled altar or a broken shrine, an Eternal, a village raided, a day at Terror)
// and falls with restraint (a day without raising, the dead buried, the Memorial honoured, Morrow's or the Choir's rank 5).
// At level 30 and corruption 25 the Ledger offers to bind your soul into a vessel: S.player.phyl={v, cr} (cr: cracked
// today). Bound, Death's Door holds a killing blow at 1 HP once a day, and corruption never falls under the floor. The
// Temple can shatter it. High corruption has its own edge: at 50 sieges bring one more foe each wave and the villages
// cool a step a day; at 75 the Ledger may hunger at dawn (S.player.hunP: the day it asked; S.player.hun={d,k}); at 100
// the Grand Inquisitor names you (S.player.named): siege captains come harder and the Hunger reads you from the book.
// The forms (R21 PR B) open on top of this.
let PHYL_ON=true;   // the bots' off-switch ("off":["phyl"])
const CORR_BOSS=3, CORR_DARK=.2, CORR_DARK_DAY=.5, CORR_ALTAR=5, CORR_ETERNAL=5, CORR_RAID=10, CORR_TERROR=1,
  CORR_CLEAN=2, CORR_BURY=1, CORR_MEM=2, CORR_GOD=1,
  PHYL_LV=30, PHYL_AT=25, PHYL_FLOOR=25, PHYL_SHATTER=20000,
  CORR_SEEN=50, CORR_HUNGER=75, CORR_HUNGER_P=.1, CORR_NAMED=100, HUNGER_DMG=.05, HUNGER_HP=.05, NAMED_BOSS=1.15;
const VESSELS={clasp:{name:'The Ledger\'s clasp',desc:'Your soul sleeps in the iron clasp that shuts the book.'},
  ring:{name:'A bone ring',desc:'Your soul is carved into a ring of your own finger bone.'},
  lantern:{name:'A skull lantern',desc:'Your soul burns in a lantern made from a skull, and lights the way down.'}};
const VESSEL_IDS=Object.keys(VESSELS);
const CORR_BANDS=[{min:0,name:'Clean'},{min:PHYL_AT,name:'Stained'},{min:CORR_SEEN,name:'Marked'},{min:CORR_HUNGER,name:'Hungering'},{min:CORR_NAMED,name:'Named'}];
const corr=()=>PHYL_ON&&S&&S.player&&isFinite(S.player.corr)?S.player.corr:0;
const corrI=()=>Math.floor(corr());
function corrBand(){ const c=corr(); let b=CORR_BANDS[0]; for(const x of CORR_BANDS) if(c>=x.min) b=x; return b; }
const phylOn=()=>PHYL_ON&&!!(S&&S.player&&S.player.phyl);
const corrFloor=()=>phylOn()?PHYL_FLOOR:0;
const corrSeen=()=>corr()>=CORR_SEEN;
const phylNamed=()=>PHYL_ON&&!!(S&&S.player&&S.player.named);
function corrAdd(n,why){   // move corruption; crossing a band is announced
  if(!PHYL_ON||!n||!S||!S.player) return 0; const P=S.player, c0=corr(), b0=corrBand();
  P.corr=Math.round(clamp(c0+n,corrFloor(),100)*10)/10; const b=corrBand();
  if(b!==b0){ const up=CORR_BANDS.indexOf(b)>CORR_BANDS.indexOf(b0); notify('Corruption '+corrI()+': '+b.name+(why?' ('+why+')':'')+'.',up?'bad':'ok'); if(up) tally('corrBand_'+CORR_BANDS.indexOf(b)); }
  if(P.corr>=CORR_NAMED&&!P.named){ P.named=1; tally('named'); notify('The Grand Inquisitor has written your name on the Church\'s rolls. Its sieges will come for you by name.','bad'); unlockStory('phyl_named'); }
  if(n>0) S.ti=S.ti||{}, S.ti.corrTop=Math.max(S.ti.corrTop||0,P.corr);
  if(n>0&&P.form) formStage();
  return P.corr-c0;
}
// ----- hooks: what raises it
function corrRaised(c){ if(!PHYL_ON) return; S.player.rday=S.day; if(c&&c.boss) corrAdd(CORR_BOSS,'a boss raised'); }   // tryRaise, on a raise
function corrDark(){   // dark skills and orders: +0.2 a use, at most +1 a day (S.player.cdk: {d: the day, n: what today has added})
  if(!PHYL_ON) return 0; const P=S.player; if(!P.cdk||P.cdk.d!==S.day) P.cdk={d:S.day,n:0}; if(P.cdk.n>=CORR_DARK_DAY-1e-9) return 0;
  const n=Math.min(CORR_DARK,CORR_DARK_DAY-P.cdk.n); P.cdk.n=Math.round((P.cdk.n+n)*10)/10; return corrAdd(n);
}
function corrSkill(id){ if(id==='blast'||id==='reap') corrDark(); }   // useSkill
const corrExec=()=>corrDark();   // the Execute order
const corrAltar=why=>corrAdd(CORR_ALTAR,why);   // the defiled altar, a broken shrine
const corrEternal=()=>corrAdd(CORR_ETERNAL,'an Eternal');
const corrRaid=()=>corrAdd(CORR_RAID,'a village raided');
// ----- and what lowers it
const corrBury=n=>corrAdd(-CORR_BURY*Math.max(1,n|0),'the dead buried');
const corrMem=()=>corrAdd(-CORR_MEM,'the Memorial honoured');
function corrDawn(){   // closeDay0, after S.day moves on: the day that just closed
  if(!PHYL_ON) return; const P=S.player, was=S.day-1;
  if(P.phyl) P.phyl.cr=0;   // the phylactery mends
  if(isFinite(P.rday)?P.rday!==was:was>=1) corrAdd(-CORR_CLEAN,'a day without raising');
  if(dreadOn()&&dreadBand().id==='terror') corrAdd(CORR_TERROR,'the Terror');
  if((faithOf()==='hon'||faithOf()==='choir')&&faithRank()>=DEV_RANKS) corrAdd(-CORR_GOD,FAITH[faithOf()].short);
  if(corrSeen()&&VIL_ON&&S.vil) standAll(-1,'they fear a corrupted keeper');
  if(P.hunP&&P.hunP!==S.day) delete P.hunP;   // an unanswered Hunger lapses
  if(corr()>=CORR_HUNGER&&Math.random()<CORR_HUNGER_P){ P.hunP=S.day; tally('hungers'); notify('The Ledger hungers. It asks for one of your Reserve, and promises strength for today.','bad'); }
}
// ----- the phylactery
const phylCan=()=>PHYL_ON&&!phylOn()&&S.player.lvl>=PHYL_LV&&corr()>=PHYL_AT;
function phylBind(v){
  if(!phylCan()||!VESSELS[v]||S.mode==='battle') return false; const P=S.player;
  P.phyl={v,cr:0}; tally('bound'); S.ti=S.ti||{}; S.ti.bound=1; unlockStory('phyl_bound'); sfx('raise'); moment('Your soul is bound','gold');
  notify('You bind your soul into '+VESSELS[v].name.replace(/^The /,'the ').replace(/^A /,'a ')+'. Death\'s Door holds a killing blow once a day; your corruption will never fall under '+PHYL_FLOOR+'.','ok'); return true;
}
function phylDoor(){   // playerFalls, after gear, Grace and the Second Draft: once a day, a killing blow leaves you at 1 HP
  if(!phylOn()) return false; const P=S.player; if(P.phyl.cr) return false;
  P.phyl.cr=1; P.hp=1; tally('door'); log('The phylactery cracks. Death\'s Door holds: you stand at 1 HP.','story'); moment('Death\'s Door','gold'); sfx('carve'); return true;
}
const phylShatterReady=()=>phylOn()&&S.mode==='town'&&bl('temple')>=1;
function phylShatter(){
  if(!phylShatterReady()||S.gold<PHYL_SHATTER) return false; const P=S.player;
  S.gold-=PHYL_SHATTER; delete P.phyl; delete P.form; delete P.named; delete P.hunP; P.corr=0; tally('shattered'); S.ti=S.ti||{}; S.ti.mortal=1; sfx('carve');
  notify('The Temple\'s priests break the vessel on the altar stone. Your soul comes home to your body, and your corruption is gone.','ok'); unlockStory('phyl_mortal'); return true;
}
// ----- corruption's other edge
function phylWave(list,r){   // townSiegeWave: 50+ one more foe each wave; named: the captain comes harder
  if(!PHYL_ON||!r) return; const P=S.player;
  if(corrSeen()){ const t=list.find(e=>!e.boss&&e.role==='striker')||list.find(e=>!e.boss); if(t){ list.push(Object.assign({},t,{id:'e'+(++S.uid),elite:false,st:undefined,dots:undefined})); tally('corrFoes'); if(r.room===0) log('The living have heard what you are becoming. More of them came.','bad'); } }
  if(P.named) list.filter(e=>e.boss).forEach(e=>{ e.maxHp=e.hp=Math.round(e.maxHp*NAMED_BOSS); e.atk=Math.round(e.atk*NAMED_BOSS); });
}
function hungerOpen(){ const P=S.player; return PHYL_ON&&P.hunP===S.day&&S.mode==='town'; }
const hungerVictim=()=>(S.reserve||[]).filter(m=>!m.lk&&!m.thrall&&!m.cons).sort((a,b)=>mPower(a)-mPower(b))[0]||null;
function hungerAnswer(feed){   // feed: give the Ledger a Reserve minion (+5% damage today); refuse: -5% max HP today
  if(!hungerOpen()) return null; const P=S.player; let m;
  if(feed){ const v=hungerVictim(); if(!v) return null; returnGear(v); S.reserve=S.reserve.filter(x=>x.uid!==v.uid); bondsClean(); P.hun={d:S.day,k:'dmg'}; tally('fedHunger'); m='The Ledger takes '+v.nick+'. The page where the name was is warm. Your dead strike 5% harder today.'; }
  else { P.hun={d:S.day,k:'hp'}; m='You close the book on its hunger. It takes its due from you instead: 5% less max HP today.'; }
  delete P.hunP; if(P.hp>pMax()) P.hp=pMax(); return m;
}
const hungerDmgK=()=>PHYL_ON&&S&&S.player&&S.player.hun&&S.player.hun.d===S.day&&S.player.hun.k==='dmg'?1+HUNGER_DMG:1;   // dmgMul
const hungerHpK=()=>PHYL_ON&&S&&S.player&&S.player.hun&&S.player.hun.d===S.day&&S.player.hun.k==='hp'?1-HUNGER_HP:1;   // pMax
function hungerLeave(){ if(S.player.hunP===S.day) hungerAnswer(false); }   // startRun: a run with the question open refuses it
function phylEcho(e){   // callEchoes: named, the Hunger reads you from the book as its fourth echo, once
  if(!phylNamed()||e.selfE||liveFoes().length>=6) return; e.selfE=1;
  const a=makeEcho(e,{nick:'the Gravewalker',role:'striker',st:3,tr:['vicious'],kind:'Necromancer',day:S.day}); foeScale([a],foeAtkMul(ABBEY)); heatScale([a]); foeRise([a]); S.run.enemies.push(a);
  log(e.name+' turns to the last written page and reads your own name. Your echo stands up across from you.','bad');
}
function phylNgp(old){ if(!old||!old.phyl) return; S.player.phyl={v:old.phyl.v,cr:0}; S.player.corr=PHYL_FLOOR; }   // startNGP: the soul stays bound; corruption returns to the floor
function phylFix(P){   // normalizeSave
  if(P.corr!=null) P.corr=clamp(isFinite(P.corr)?+P.corr:0,0,100);
  if(P.phyl&&typeof P.phyl==='object'&&VESSELS[P.phyl.v]) P.phyl={v:P.phyl.v,cr:P.phyl.cr?1:0}; else delete P.phyl;
  if(P.phyl) P.corr=Math.max(P.corr,PHYL_FLOOR);
  if(P.rday!=null&&!isFinite(P.rday)) delete P.rday;
  P.named=P.named?1:0; if(!P.named) delete P.named;
  if(!(P.hunP>0)) delete P.hunP;
  if(!(P.form&&typeof P.form==='object'&&FORMS[P.form.k]&&P.phyl)) delete P.form; else P.form={k:P.form.k,st:clamp(Math.floor(+P.form.st||1),1,3)};
  if(P.sunD!=null&&!isFinite(P.sunD)) delete P.sunD;
  if(!(P.cdk&&typeof P.cdk==='object'&&isFinite(P.cdk.d)&&isFinite(P.cdk.n))) delete P.cdk;
  if(!(P.hun&&typeof P.hun==='object'&&isFinite(P.hun.d)&&(P.hun.k==='dmg'||P.hun.k==='hp'))) delete P.hun;
}
// ----- title, tip, story
[['ph_mortal','Mortal Again','Shatter the phylactery at the Temple.',()=>T_('shattered')>=1,{hpp:4},4]
].forEach(([id,name,req,ok,b,r])=>{ for(const k in b) b[k]=Math.max(b[k],Math.round(b[k]*RARITY_MUL[r])); TITLE_RARITY[id]=r; const t={id,grp:'Deeds',name,req,ok,b,r}; TITLES.push(t); TITLE[id]=t; });
TIPS.push({id:'phyl',t:'The phylactery',m:'The Ledger has been watching what you do with it. Your corruption is on the Status panel, under the ink stain. At level '+PHYL_LV+' and corruption '+PHYL_AT+', you may bind your soul into a vessel: once a day, a killing blow leaves you standing.',when:()=>S.mode==='town'&&PHYL_ON&&phylCan()});
TIP_META.phyl=['sys','phyl'];
STORY.push(
  {act:4,id:'phyl_bound',t:'The vessel',when:()=>false,m:'You did not feel your soul leave. You felt it arrive, somewhere small and cold, and settle the way a dog settles at the foot of a bed. The Ledger turned one page on its own. Oswin\'s hand shook when he did this, the margins say. Yours does not, and that is the thing you notice.'},
  {act:4,id:'phyl_named',t:'Named',when:()=>false,m:'A priest came to the gate in daylight with a scroll and no guard, which is its own kind of courage. He read your name aloud, all of it, the name your mother gave you and the one the Ledger did, and nailed the scroll to the post. "The Grand Inquisitor knows you now," he said. "That is all I was sent to say." The dead let him walk away. You told them to.'},
  {act:4,id:'phyl_mortal',t:'Mortal again',when:()=>false,m:'The vessel broke with a sound like a book dropped in an empty church. For a while you could not get warm. Then you could, and your hands were your own again, and you found you were afraid of dying, which you had forgotten how to be. The Ledger said nothing at all. It only waited, as it always has.'}
);
['phyl_bound','phyl_named','phyl_mortal'].forEach(id=>{ STORY_BY[id]=STORY.find(x=>x.id===id); });
// ===== R21 PR B: the forms =====
// Bound, at corruption 50, the hero may take one form (S.player.form={k, st}), once per cycle; only a shattering or New Game+
// clears it. Each form needs its build (the highest stat, or the Rot path deepest), replaces part of the kit and has a
// cost. Its second stage opens at corruption 75 and its apotheosis (a once-a-run ultimate, act('apo')) at 100; both stay
// open once reached (st: 1, 2, 3).
const FM_FORM_AT=50, FM_FORM_S2=75, FM_FORM_S3=100,
  FM_LICH_ELEM=1.15, FM_LICH_HEAL=.7, FM_LICH_WARD=.8, FM_LICH_PW=.2,
  FM_BLOOD_HEAL=.15, FM_BLOOD_FIEND=2, FM_BLOOD_SUN=.9, FM_BLOOD_KILL=.04,
  FM_COL_HP=1.4, FM_COL_ROW=.5, FM_COL_SIPH=.75, FM_COL_DR=.85,
  FM_SAINT_DMG=.8, FM_SAINT_ORDERS=2, FM_SAINT_ARMY=1.1,
  FM_HERALD_MEND=.85, FM_HERALD_PLAGUE=.08, FM_HERALD_AIR=.03,
  FM_APO_WINTER=2, FM_APO_FEAST=1.5, FM_APO_FEAST_HEAL=.5, FM_APO_QUAKE=1.5, FM_APO_HYMN=1.5, FM_APO_PANDEMIC=.2;
const pathDepth=p=>PATHS[p]?PATHS[p].skills.reduce((a,id)=>a+sk(id),0):0;
const topStat=k=>{ const v=A(k); return ['strength','constitution','intelligence','will'].every(o=>o===k||A(o)<=v); };
const FORMS={
  lich:{name:'Lich',need:'Intelligence your highest stat',ok:()=>topStat('intelligence'),
    gain:'Soul Siphon becomes Soul Rend and hits a second foe; +1 Soul to hold; your frost and shadow damage +15%',cost:'Healing you receive -30%; Bone Ward -20%',
    s2:['Phylactery Ward','The first blow each room that would destroy a minion leaves it at 1 HP and costs you 20% of your max mana'],
    apo:['Winter of the Book','Every foe takes 200% of your Siphon as frost and is frozen for a turn']},
  blood:{name:'Blood Lord',need:'Strength your highest stat',ok:()=>topStat('strength'),
    gain:'Strike heals you for 15% of its damage; your Bloodfiend minions drink twice as deep',cost:'In sunlight (the first room of each day) you deal 10% less damage',
    s2:['Red Tithe','Each foe that falls heals you for 4% of your max HP'],
    apo:['Red Feast','Every foe takes 150% of your Strike, and you heal for half of it']},
  colossus:{name:'Bone Colossus',need:'Constitution your highest stat',ok:()=>topStat('constitution'),
    gain:'You stand in the front row with 40% more max HP; Strike hits every foe in its target\'s row (50% to the others)',cost:'Foes reach you first (no shelter in the back row); Soul Siphon -25%',
    s2:['Ossuary Mass','You take 15% less damage'],
    apo:['Earthshaker','Every foe takes 150% of your Strike and is stunned for a turn']},
  saint:{name:'Choir Saint',need:'Will your highest stat',ok:()=>topStat('will'),
    gain:'Every evolution mark on your minions counts one step higher; each order may be given twice a room (two extra orders in all)',cost:'Your own damage -20%',
    s2:['Choir of Many','Your minions deal 10% more damage'],
    apo:['Hymn of All','Your whole army is healed and fallen minions stand again; they deal 50% more damage for 3 turns']},
  herald:{name:'Plague Herald',need:'The Rot path your deepest',ok:()=>pathDepth('rot')>0&&Object.keys(PATHS).every(p=>p==='rot'||pathDepth(p)<=pathDepth('rot')),
    gain:'A foe that falls passes its poison and blight to another; Corpse Explosion leaves plague on every foe',cost:'Your menders heal 15% less',
    s2:['Rotting Air','Every room\'s foes start poisoned (3% of their max HP a turn for 3 turns)'],
    apo:['Pandemic','Every foe is poisoned and blighted for 20% of its max HP over three turns']}
};
const FORM_IDS=Object.keys(FORMS);
const formOf=()=>PHYL_ON&&S&&S.player&&S.player.form&&FORMS[S.player.form.k]&&S.player.phyl?S.player.form.k:null;
const formIs=k=>formOf()===k;
const formSt=()=>formOf()?S.player.form.st|0:0;
const formCan=k=>PHYL_ON&&phylOn()&&!S.player.form&&corr()>=FM_FORM_AT&&!!FORMS[k]&&FORMS[k].ok()&&S.mode!=='battle';
function takeForm(k){
  if(!formCan(k)) return false; const P=S.player; P.form={k,st:1}; formStage(); tally('form_'+k); S.ti=S.ti||{}; syncArmy(); sfx('raise'); moment(FORMS[k].name,'gold');
  notify('The Ledger rewrites you. You take the form of the '+FORMS[k].name+'.','story'); unlockStory('form_'+k); return true;
}
function formStage(){   // corrAdd: the second stage at 75, the apotheosis at 100; once open they stay open
  const P=S.player, f=P.form; if(!f||!FORMS[f.k]) return; const c=corr(), st=c>=FM_FORM_S3?3:c>=FM_FORM_S2?2:1;
  if(st>(f.st|0)){ const F=FORMS[f.k]; if(st>=2&&(f.st|0)<2) notify('The '+F.name+'\'s second stage: '+F.s2[0]+'. '+F.s2[1]+'.','ok'); if(st>=3) notify('Apotheosis: '+F.apo[0]+'. '+F.apo[1]+', once a run.','ok'); f.st=st; syncArmy(); }
}
// ----- what the forms change (hooks)
function formDmgK(ty){   // hurtFoe: a blow from you
  if(!formOf()||HITTER!==S.player) return 1; let k=1;
  if(formIs('lich')&&(ty==='frost'||ty==='shad')) k*=FM_LICH_ELEM;
  if(formIs('saint')) k*=FM_SAINT_DMG;
  if(formIs('blood')&&S.run&&S.run.sun) k*=FM_BLOOD_SUN;
  return k;
}
const formHealK=()=>formIs('lich')?FM_LICH_HEAL:1;   // healAlly, on you
const formWardK=()=>formIs('lich')?FM_LICH_WARD:1;   // pWard
const formSouls=()=>formIs('lich')?1:0;   // soulCap
const formSiphK=()=>formIs('colossus')?FM_COL_SIPH:1;   // Soul Siphon
const formHpK=()=>formIs('colossus')?FM_COL_HP:1;   // pMax
const formFront=()=>formIs('colossus');   // rowOf0: the Colossus stands in the front row
const formFiendK=()=>formIs('blood')?FM_BLOOD_FIEND:1;   // a Bloodfiend's leech
const formMendK=()=>formIs('herald')?FM_HERALD_MEND:1;   // healK
const formArmyK=()=>formIs('saint')&&formSt()>=2?FM_SAINT_ARMY:1;   // extraMul (attack)
const formDr=d=>formIs('colossus')&&formSt()>=2?Math.max(1,Math.round(d*FM_COL_DR)):d;   // allyDr, on you
const formMark=n=>n&&formIs('saint')?n+1:n;   // markLv
function formSiphon(t,d){   // after Soul Siphon's blow: Soul Rend
  if(!formIs('lich')) return; const o=liveFoes().find(x=>x!==t&&reachable(x)); if(!o) return; SIPHONING=true; hurtFoe(o,d,'shad'); SIPHONING=false; log('Soul Rend tears into '+o.name+' too, for '+d+'.','ok');
}
function formStrike(t,d){   // after Strike's blow
  const P=S.player;
  if(formIs('blood')){ const h=healAlly(P,Math.round(d*FM_BLOOD_HEAL)); if(h) log('The Blood Lord drinks: +'+h+' HP.','ok'); }
  if(formIs('colossus')){ const row=rowOf(t); let n=0; for(const o of liveFoes()) if(o!==t&&rowOf(o)===row){ hurtFoe(o,Math.round(d*FM_COL_ROW)); n++; } if(n) log('The Colossus\'s blow carries through '+n+' more in that row.','ok'); }
}
const saintOrder=role=>formIs('saint')&&!!S.run&&!!S.run.cmd&&!!S.run.cmd[role]&&(S.run.saintN|0)<FM_SAINT_ORDERS;   // canCommand: the order again
function formDeath(e){   // checkDeaths, on a foe's fall
  const P=S.player;
  if(formIs('herald')&&e.dots){ const o=liveFoes().filter(x=>x!==e); if(o.length){ const to=o[0]; let n=0; for(const k of ['poison','blight']) if(e.dots[k]){ addDot(to,k,e.dots[k].d,Math.max(2,e.dots[k].t)); n++; } if(n){ tally('plagueSpread'); log('The plague leaves '+e.name+' for '+to.name+'.','ok'); } } }
  if(formIs('blood')&&formSt()>=2){ healAlly(P,Math.round(pMax()*FM_BLOOD_KILL)); }
}
function formBlast(){ if(!formIs('herald')) return; const d=Math.max(1,Math.round(pSiph()*FM_HERALD_PLAGUE)); for(const o of liveFoes()) addDot(o,'poison',d,3); log('The burst leaves plague on every foe.','ok'); }   // after Corpse Explosion
function formWard(a){   // hurtAlly: a minion at 0 HP; the Lich's Phylactery Ward holds it once a room
  const r=S.run, P=S.player; if(!formIs('lich')||formSt()<2||!r||r.pwU||a.id==='p'||a.thrall) return false; const c=Math.round(pMana()*FM_LICH_PW); if(P.mana<c) return false;
  P.mana-=c; r.pwU=1; a.hp=1; tally('pward'); log('Phylactery Ward: your mana holds '+a.nick+' at the edge. -'+c+' mana.','ok'); return true;
}
function formRoom(list){   // roomStart: the sun on the Blood Lord, the Herald's rotting air
  const r=S.run, P=S.player; if(!r||!formOf()) return;
  r.sun=0; if(formIs('blood')&&P.sunD!==S.day){ P.sunD=S.day; r.sun=1; log('Sunlight finds you. The Blood Lord is weaker this room.','bad'); }
  if(formIs('herald')&&formSt()>=2) for(const e of list) if(e.hp>0) addDot(e,'poison',Math.max(1,Math.round(e.maxHp*FM_HERALD_AIR)),3);
}
// ----- the apotheosis
const canApo=()=>S.mode==='battle'&&!!S.run&&formSt()>=3&&!S.run.apoU&&liveFoes().length>0;
function useApo(){
  if(!canApo()) return false; const r=S.run, P=S.player, k=formOf(), F=FORMS[k]; r.apoU=1; tally('apo'); moment(F.apo[0],'gold'); let tot=0;
  if(k==='lich'){ for(const o of liveFoes()){ const d=hit(pSiph()*FM_APO_WINTER); hurtFoe(o,d,'frost'); tot+=d; if(o.hp>0) o.stun=Math.max(o.stun||0,1); } }
  else if(k==='blood'){ for(const o of liveFoes()){ const d=hit(pAtk()*FM_APO_FEAST); hurtFoe(o,d); tot+=d; } healAlly(P,Math.round(tot*FM_APO_FEAST_HEAL)); }
  else if(k==='colossus'){ for(const o of liveFoes()){ const d=hit(pAtk()*FM_APO_QUAKE); hurtFoe(o,d); tot+=d; if(o.hp>0) o.stun=Math.max(o.stun||0,1); } }
  else if(k==='saint'){ for(const m of S.army){ if(m.hp<=0) m.hp=m.maxHp; else healAlly(m,m.maxHp); } r.frenzy=Math.max(r.frenzy||0,3); r.frenzyMul=Math.max(r.frenzyMul||1,FM_APO_HYMN); }
  else if(k==='herald'){ for(const o of liveFoes()){ const d=Math.max(1,Math.round(o.maxHp*FM_APO_PANDEMIC/3)); addDot(o,'poison',d,3); addDot(o,'blight',d,3); } }
  log(F.apo[0]+(tot?': '+tot+' damage in all.':'.'),'ok'); fxe('ult',P); return true;
}
// ----- titles, passages
[['fm_lich','The Lich','Take the form of the Lich.',()=>T_('form_lich')>=1,{siph:4},4],
 ['fm_blood','The Blood Lord','Take the form of the Blood Lord.',()=>T_('form_blood')>=1,{atk:4},4],
 ['fm_colossus','The Bone Colossus','Take the form of the Bone Colossus.',()=>T_('form_colossus')>=1,{hpp:4},4],
 ['fm_saint','The Choir Saint','Take the form of the Choir Saint.',()=>T_('form_saint')>=1,{mpow:4},4],
 ['fm_herald','The Plague Herald','Take the form of the Plague Herald.',()=>T_('form_herald')>=1,{dmgp:3},4],
 ['fm_apo','Apotheosis','Use a form\'s apotheosis.',()=>T_('apo')>=1,{dmgp:4},5]
].forEach(([id,name,req,ok,b,r])=>{ for(const k in b) b[k]=Math.max(b[k],Math.round(b[k]*RARITY_MUL[r])); TITLE_RARITY[id]=r; const t={id,grp:'Deeds',name,req,ok,b,r}; TITLES.push(t); TITLE[id]=t; });
STORY.push(
  {act:4,id:'form_lich',t:'The cold hand',when:()=>false,m:'The warmth went out of your fingers first, and then out of the rest of you, and you did not miss it. Ink dries faster on your skin now. When you siphon, the soul comes to you the way water comes to a drain, and something in your chest that used to beat only listens.'},
  {act:4,id:'form_blood',t:'The red thirst',when:()=>false,m:'You found you could hear hearts across a room, and then across a field. The dawn hurts now, a little, the way a bright window hurts after a long night. Your dead keep a step behind you when you have not fed, and close in when you have.'},
  {act:4,id:'form_colossus',t:'Bone upon bone',when:()=>false,m:'The bones of the dead you raised did not all go back into the ground. Some came to you instead, and settled over your own like plates of a wall. You stand at the front now. You are the wall. The dead behind you have learned to like it there.'},
  {act:4,id:'form_saint',t:'The choir sings back',when:()=>false,m:'You began to hear them at night: every name in the book, singing one note each. When you speak to your dead now they answer in harmony. The Ledger calls you its cantor in the margins. Your own hands have grown weak on the blade, and you do not mind.'},
  {act:4,id:'form_herald',t:'The bearer of the sickness',when:()=>false,m:'The flies found you before you understood what you had become. Where you walk the grass yellows and the wells go sweet and wrong. Your menders work slower, coughing. The living run from your shadow now, and the Ledger fills faster than it ever has.'}
);
FORM_IDS.forEach(k=>{ STORY_BY['form_'+k]=STORY.find(x=>x.id==='form_'+k); });
function phylEnding(k){   // endingVariant: Close the book with a clean hand, or as the Ledger's own
  if(!PHYL_ON||k!=='closed') return ''; const c=corr();
  if(c<PHYL_AT) return 'The Clean Hand: you close the book with less of it in you than most who ever held it, and the last line you write is steady.';
  if(c>CORR_HUNGER) return 'The Ledger\'s Own: the name you write on the last page is the one it gave you, not the one you were born with. The book closes around you like a hand.';
  return '';
}
const FORM_TINT={lich:0xa8c4ff,blood:0xff9a8e,colossus:0xeadfc4,saint:0xffe2a0,herald:0xbfe08c};
const formTint=()=>FORM_TINT[formOf()]||0xffffff;   // fx.js: the hero's sprite
