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
const hungerVictim=()=>(S.reserve||[]).filter(m=>!m.lk&&!m.thrall).sort((a,b)=>mPower(a)-mPower(b))[0]||null;
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
