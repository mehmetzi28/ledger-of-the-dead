// ===== THE PANTHEON (R8 PR A) =====
// From level 8 and 3 clears the Pantheon (the Town tab) takes an oath to one of four Old Gods or to none (the Profane path).
// S.faith = {id, day, dev, dd, dday, vb, cv}: the god, the day sworn, devotion points, points earned on day dday (dd), the
// last day the vow broke (vb) and conversions this oath (cv). Devotion grows by DEEDS the god likes; every DEV_STEP points is a
// rank, five ranks, and each rank opens a boon. Breaking the vow costs a rank and that day's points (once a day).
// Ids: 'hon' is Morrow and 'dis' the Profane path, so saves from the old two-oath faith keep their oath.
const VESH_ROT=3;   // Vesh's vow: it breaks when this many bodies rot (die Blighted) in one run
const FAITH={
  hon:  {name:'Morrow, the Last Light',short:'Morrow',domain:'Mercy and endings',type:'fire',sig:'sun',
         vow:'Never raise more than '+10+' bodies in one run.',
         about:'The god of the last light at the end of a life. Morrow keeps your body whole and asks for restraint.',
         deeds:'A foe slain by fire (1), a minion healed from under 25% HP (2), a gate cleared with no minion lost (10).'},
  vesh: {name:'Vesh, the Cold Mother',short:'Vesh',domain:'Sleep and preservation',type:'frost',sig:'snow',
         vow:'Let no bodies rot: '+VESH_ROT+' foes dying Blighted in one run breaks it (your minions\' blight counts).',
         about:'She who keeps the dead as they were. Vesh wants your bodies whole and your foes asleep.',
         deeds:'A foe frozen (1), a boss frozen (5), a Preserved body raised (5).'},
  ulm:  {name:'Ulm of the Furrow',short:'Ulm',domain:'Harvest and rot',type:'rot',sig:'wheat',
         vow:'Never sell a trophy: use them.',
         about:'The god of what grows from the dead. Ulm wants every part used and nothing wasted.',
         deeds:'A trophy used in a brew, a heart-forge or a commission (1 each), a foe killed by rot (1), a body exploded (2).'},
  choir:{name:'The Hollow Choir',short:'the Choir',domain:'Voices of the dead',type:'shad',sig:'mouth',
         vow:'Never lose a named minion (an Elder, or one with a mark).',
         about:'Every voice the Ledger ever silenced, singing together. The Choir wants you to drink souls and remember the fallen.',
         deeds:'Soul Siphon cast (1), a headstone tier carved (10), a fallen minion honoured in the Memorial (5).'},
  dis:  {name:'The Profane',short:'the Profane',domain:'Defiance',type:'phys',sig:'horns',
         vow:'None. Devotion is spent fast: it fades '+5+' points a day.',
         about:'No god at all: spit on the Old Gods and take what the grave owes you.',
         deeds:'An elite or boss killed (2). Devotion fades 5 a day.'}
};
const GODS=['hon','vesh','ulm','choir','dis'];
const FAITH_LV=8, DEV_STEP=100, DEV_RANKS=5, DEV_SHRINE=20, PROFANE_DECAY=5, MORROW_RAISE=10, CONVERT_KEEP=.5;
const DEED_K={hon:.4,vesh:1,ulm:.4,choir:3,dis:1};   // per-god deed multipliers, tuned on the full bot so each god ranks up at about the same pace
// The boons, one per rank. stats: added through xb (faithB), scaled by the Temple; the rest are hooks named below.
const BOONS={
  hon:  [{t:'+15% healing received',s:{healp:15}},{t:'+8% max HP',s:{hpp:8}},{t:'Fire kills scorch the foes beside them for 20% of the blow'},
         {t:'The first minion to fall each room stands again at 10% HP'},{t:'Grace: once a gate run a killing blow leaves you at 25% HP; once a run a fallen minion rises at 30%'}],
  vesh: [{t:'Grave Chill costs 3 less mana'},{t:'Frozen foes take 10% more damage'},{t:'Preserved bodies are 10% easier to raise'},
         {t:'Grave Chill freezes a foe that is not a boss one turn longer'},{t:'Hibernation: a frozen boss cannot enter its second phase'}],
  ulm:  [{t:'+15% trophy drops'},{t:'Blight ticks 15% harder'},{t:'A kill leaves rot behind: another foe is Blighted'},
         {t:'Corpse Explosion is ready a turn sooner'},{t:'Harvest Home: a gate\'s last room pays its trophies twice'}],
  choir:[{t:'Soul Siphon +1% per living minion (up to 10%)'},{t:'Silences on you last a turn less'},{t:'A Memorial honour lasts two days'},
         {t:'+2% army damage per name with a headstone (up to 10%)'},{t:'Requiem Chorus: +1% army damage per name in the Memorial (up to 15%)'}],
  dis:  [{t:'+8% damage',s:{dmgp:8}},{t:'+15% gold',s:{goldp:15}},{t:'+1 Soul held past the ultimate\'s five'},
         {t:'+12% damage, -10% max HP',s:{dmgp:12,hpp:-10}},{t:'Tithe of Souls: every run begins with 3 Souls'}]
};
const GRACE_HP=.25, TITHE_SOULS=3, MORROW_STAND=.1, MORROW_RISE=.3, MORROW_SCORCH=.2, VESH_CHILL=3, VESH_FROZEN=1.1, VESH_PRES=10, ULM_TRO=1.15, ULM_ROT=1.15, ULM_POOL=.15,
  CHOIR_SIPH=.01, CHOIR_SIPH_MAX=.1, CHOIR_STONE=.02, CHOIR_STONE_MAX=.1, CHOIR_REQ=.01, CHOIR_REQ_MAX=.15;
const faithOf=()=>(S&&S.faith&&FAITH[S.faith.id])?S.faith.id:null;
const faithDev=()=>faithOf()?Math.max(0,S.faith.dev||0):0;
const faithRank=g=>{ const id=faithOf(); if(!id||(g&&g!==id)) return 0; return Math.min(DEV_RANKS,Math.floor(faithDev()/DEV_STEP)); };
const devotion=()=>faithRank();   // the old name, used by the endings' inscriptions
const blessed=id=>faithOf()===id&&faithRank()>=DEV_RANKS;
function titheSouls(){ if(blessed('dis')&&S.run){ S.run.souls=Math.max(S.run.souls||0,Math.min(soulCap(),TITHE_SOULS)); } }
const soulCap=()=>SOUL_MAX+(faithRank('dis')>=3?1:0);
const faithBuff=id=>{ const o={}; if(faithOf()!==id) return o; const k=templeBuff(); BOONS[id].slice(0,faithRank()).forEach(b=>{ if(b.s) for(const s in b.s) o[s]=(o[s]||0)+b.s[s]; }); for(const s in o) o[s]=Math.round(o[s]*(o[s]>0?k:1)); return o; };
const faithB=k=>{ const id=faithOf(); return id?(faithBuff(id)[k]||0):0; };
const renounceCost=()=>100*S.player.lvl;
function swear(id){ if(S.mode!=='town'||!FAITH[id]||faithOf()||!faithOpen()) return false; vitals(()=>{ S.faith={id,day:S.day,dev:hasInsc('faithful')?DEV_STEP:0,dd:0,dday:S.day,vb:0,cv:0}; }); tally('sworn'); tally('sw_'+id); return true; }   /* Of the Faithful: a new oath starts at rank 1 */
function renounce(){ if(S.mode!=='town'||!faithOf()) return false; const c=renounceCost(); if(S.gold<c) return false; S.gold-=c; tally('renounced'); vitals(()=>{ delete S.faith; }); S.player.hp=Math.min(S.player.hp,pMax()); return true; }
// ----- devotion: deeds, ranks, the vow
function deed(g,pts){   // a deed your god likes: points (x the god's pace and the Temple), a rank-up notice, a passage at ranks 1 and 5
  const id=faithOf(); if(!id||id!==g||!(pts>0)) return 0; const f=S.faith, r0=faithRank(), p=pts*DEED_K[id]*templeDev();
  if(f.dday!==S.day){ f.dday=S.day; f.dd=0; } f.dev=(f.dev||0)+p; f.dd+=p; tally('devPts',p);
  const r1=faithRank(); if(r1>r0){ vitals(()=>{}); tally('rankUps'); const b=BOONS[id][r1-1]; notify(FAITH[id].short.replace(/^the /,'The ')+' grants you rank '+r1+': '+b.t+'.','ok'); if(r1===1||r1===DEV_RANKS) unlockStory(godStory(id,r1),S.run&&S.mode==='battle'?S.run:null); if(r1===DEV_RANKS) tally('r5_'+id); }
  return p;
}
function vowBreak(g,why){   // the vow breaks: a rank and today's points, once a day
  const id=faithOf(); if(!id||id!==g||id==='dis') return false; const f=S.faith; if(f.vb===S.day) return false;
  const r0=faithRank(); f.vb=S.day; f.dev=Math.max(0,(f.dev||0)-(f.dday===S.day?f.dd||0:0)-DEV_STEP); f.dd=0; f.dday=S.day; tally('vowsBroken');
  if(faithRank()<r0) vitals(()=>{}); const m='You broke your vow to '+FAITH[id].short+(why?' ('+why+')':'')+'. You lose a rank of devotion and today\'s.';
  if(S.run&&S.run.events&&S.mode==='battle') log(m,'bad'); else notify(m,'bad'); return true;
}
const vowWarn=k=>k==='raise'?faithOf()==='hon'&&!!S.run&&(S.run.raised||0)>=MORROW_RAISE&&S.faith.vb!==S.day:k==='sell'?faithOf()==='ulm'&&S.faith.vb!==S.day:false;   // the UI asks once before an action that breaks the vow
function faithDawn(){   // closeDay: the Profane path's devotion fades
  const f=S.faith; if(!f||faithOf()!=='dis') return; const r0=faithRank(); f.dev=Math.max(0,(f.dev||0)-profDecay()); if(faithRank()<r0) vitals(()=>{});
}
// ----- the deed and vow hooks (called from the systems they watch)
function faithKill(e,r){   // checkDeaths, after a foe falls
  const id=faithOf(); if(!id) return;
  if(id==='hon'&&e.lt==='fire'){ deed('hon',1); if(faithRank()>=3&&e.kb>0) morrowScorch(e,r); }
  if(id==='ulm'&&e.cd==='rot') deed('ulm',1);
  if(id==='vesh'&&e.cd==='rot'&&r&&(r.vrot=(r.vrot||0)+1)>=VESH_ROT) vowBreak('vesh',VESH_ROT+' bodies rotted in one run');
  if(id==='dis'&&(e.elite||e.boss)) deed('dis',2);
  if(id==='ulm'&&faithRank()>=3){ const o=liveFoes().filter(x=>x!==e&&!(x.dots&&x.dots.blight)); if(o.length) addDot(pick(o),'blight',Math.max(1,pSiph()*ULM_POOL),2); }
}
function morrowScorch(e,r){ if(r.scorching) return; r.scorching=1; try{ const i=r.enemies.indexOf(e), d=Math.max(1,Math.round(e.kb*MORROW_SCORCH));
  for(const o of [r.enemies[i-1],r.enemies[i+1]]) if(o&&o.hp>0){ hurtFoe(o,d,'fire'); log('Morrow\'s light scorches '+o.name+' for '+d+'.','ok'); } } finally { r.scorching=0; } }
function faithSave(a){   // hurtAlly / tickDots: a minion at 0 HP (Morrow ranks 4 and 5)
  if(!a||a.id==='p'||a.thrall||faithOf()!=='hon'||!S.run) return false; const r=S.run, k=faithRank();
  if(k>=4&&r.mst!==r.room+':'+(r.tw||0)){ r.mst=r.room+':'+(r.tw||0); a.hp=Math.max(1,Math.round(a.maxHp*MORROW_STAND)); tally('morrowStand'); log('Morrow will not let '+a.nick+' fall yet. It stands at '+a.hp+' HP.','ok'); return true; }
  if(k>=5&&!r.mrise){ r.mrise=1; a.hp=Math.max(1,Math.round(a.maxHp*MORROW_RISE)); tally('morrowStand'); log(a.nick+' rises in the Last Light at '+a.hp+' HP.','ok'); return true; }
  return false;
}
const faithHealed=(a,before,h)=>{ if(h>0&&a&&a.id!=='p'&&before<a.maxHp*.25) deed('hon',2); };   // healAlly
const faithFrozen=t=>{ deed('vesh',t.boss?5:1); return faithRank('vesh')>=4&&!t.boss?1:0; };   // Grave Chill froze t: the deed, and Vesh's extra turn
const faithRaised=c=>{ if(c.cd==='preserved') deed('vesh',5); };
const faithRaiseK=c=>c&&c.cd==='preserved'&&faithRank('vesh')>=3?VESH_PRES:0;   // raiseChance
const faithHit=e=>e&&e.stun>0&&faithRank('vesh')>=2?VESH_FROZEN:1;   // hurtFoe
const hibernates=e=>e.stun>0&&faithRank('vesh')>=5;   // checkPhase
const faithChill=s=>s===SKILL.chill&&faithRank('vesh')>=1?VESH_CHILL:0;   // skCost
const faithTro=()=>faithRank('ulm')>=1?ULM_TRO:1;   // killLoot
const faithRot=()=>faithRank('ulm')>=2?ULM_ROT:1;   // tickDots (blight)
const faithBlastCd=()=>faithRank('ulm')>=4?1:0;   // useSkill (blast)
const faithUsed=n=>{ if(n>0) deed('ulm',n); };   // trophies spent on a brew, a heart-forge or a commission
function faithHarvest(r){ if(faithRank('ulm')<5||!r.troph) return; for(const k in r.troph) r.troph[k]*=2; tally('harvestHome'); r.events.push({m:'Harvest Home: Ulm doubles this gate\'s trophies.',c:'ok'}); }   // gateCleared
const faithSiph=()=>faithRank('choir')>=1?1+Math.min(CHOIR_SIPH_MAX,CHOIR_SIPH*S.army.filter(m=>m.hp>0).length):1;   // Soul Siphon
const silenceT=t=>Math.max(1,t-(faithRank('choir')>=2?1:0));   // a silence laid on you
const honourDays=()=>faithRank('choir')>=3?2:1;   // remembered()
const choirK=()=>{ if(faithOf()!=='choir') return 1; const k=faithRank(), mem=S.memorial||[]; let v=0; if(k>=4) v+=Math.min(CHOIR_STONE_MAX,CHOIR_STONE*mem.filter(e=>(e.hs|0)>0).length); if(k>=5) v+=Math.min(CHOIR_REQ_MAX,CHOIR_REQ*mem.length); return 1+v; };   // extraMul: army attack
const named=m=>!!m&&!m.thrall&&((m.stage||0)>=2||(Array.isArray(m.marks)&&m.marks.length>0));
const faithLost=m=>{ if(named(m)) vowBreak('choir',m.nick+' was lost'); };   // memorialize
const faithSold=()=>vowBreak('ulm','a trophy sold');   // sellTrophy
// ----- shrines (the events between rooms) and conversion
function convert(id){   // another god's shrine: change god, keep half the points
  const f=S.faith; if(!f||!FAITH[id]||id===f.id) return false; const cv=(f.cv||0)+1;
  vitals(()=>{ S.faith={id,day:S.day,dev:Math.floor((f.dev||0)*CONVERT_KEEP),dd:0,dday:S.day,vb:0,cv}; }); tally('converted'); return true;
}
// ----- save
function faithFix(g){   // normalizeSave: an old two-oath faith becomes Morrow or the Profane at the rank its days earned (10 days: 2, 25: 4)
  if(g.faith===undefined) return; const o=g.faith; if(!o||typeof o!=='object'||!FAITH[o.id]||typeof o.day!=='number'){ delete g.faith; return; }
  const n=(v,d)=>typeof v==='number'&&isFinite(v)?v:d, day=Math.floor(n(g.day,1));
  let dev=n(o.dev,null); if(dev==null){ const d=day-o.day; dev=d>=25?4*DEV_STEP:d>=10?2*DEV_STEP:0; }
  g.faith={id:o.id,day:Math.floor(o.day),dev:clamp(dev,0,DEV_STEP*DEV_RANKS*4),dd:Math.max(0,n(o.dd,0)),dday:Math.floor(n(o.dday,day)),vb:Math.max(0,Math.floor(n(o.vb,0))),cv:Math.max(0,Math.floor(n(o.cv,0)))};
}
// ----- story: a passage per god at ranks 1 and 5 (Morrow's and the Profane's rank-5 passages are the old blessings)
STORY.push(
  {act:2,id:'g_vesh1',when:()=>faithRank('vesh')>=1,t:'The Cold Mother',m:'You knelt in the frost and something vast and patient looked at you without blinking. Vesh does not want your love. She wants your dead kept as they were, and your enemies quiet. You find the cold does not bite you any more.'},
  {act:3,id:'g_vesh5',when:()=>faithRank('vesh')>=5,t:'Hibernation',m:'The Cold Mother has closed your eyes and opened them again. Bosses freeze in your hands now and stay as they were, halfway through a breath. The Ledger writes them down slowly, the way you would write in ice.'},
  {act:2,id:'g_ulm1',when:()=>faithRank('ulm')>=1,t:'The Furrow',m:'Ulm answered with the smell of turned earth. Nothing is wasted in his field: the hide, the heart, the rot. You understand that every trophy you sold was a seed thrown away, and you are a little ashamed.'},
  {act:3,id:'g_ulm5',when:()=>faithRank('ulm')>=5,t:'Harvest Home',m:'The field is full. Every gate you clear now gives twice what it holds, and the rot in your hands is Ulm\'s own. The farmers in the valley have started leaving their old tools at your gate. You have not asked them why.'},
  {act:2,id:'g_choir1',when:()=>faithRank('choir')>=1,t:'Many voices',m:'When you swore, every name in the Memorial spoke at once, softly, as if from the next room. The Hollow Choir is made of the silenced. It asks you to drink souls and to remember, and it promises that you will never again be the only voice in the dark.'},
  {act:3,id:'g_choir5',when:()=>faithRank('choir')>=5,t:'Requiem',m:'The Choir sings through your army now. Every name you carved and every name you lost adds a voice, and the dead fight to the tune. The Ledger has started to hum while you write. You hope it is a hymn.'});
['g_vesh1','g_vesh5','g_ulm1','g_ulm5','g_choir1','g_choir5'].forEach(id=>{ STORY_BY[id]=STORY.find(s=>s.id===id); });
const godStory=(id,k)=>({hon1:'oath_hon',dis1:'oath_dis',hon5:'bless_hon',dis5:'bless_dis'})[id+k]||'g_'+id+k;
// ===== R8 PR B: the gods move the weather (forecast, call, ward), the Temple's chapels, dread and the siege =====
const GOD_OMENS={hon:['paletide','ashfall'],vesh:['soulstorm','longnight'],ulm:['boneharvest','rotbloom'],choir:['eclipse','choirnight'],dis:['bloodmoon','ironrain']};
const CALL_COST=DEV_STEP, LONG_HP=1.1, BLOOM_ROT=.02, CHOIR_NIGHT=1.15, HOSPICE_SHATTER=10, BELL_CHOIR=.8, PROFANE_DREAD=10, MORROW_DREAD=1, CHOIR_PAY=1.1, ULM_COMM=1.2;
const godOmens=id=>GOD_OMENS[id]||[];
const forecast=()=>faithOf()&&S.omenNext&&S.omenNext.day===S.day+1?S.omenNext:null;   // tomorrow's omen, seen by a sworn necromancer
function omenDusk(){   // closeDay, after the day turns: Long Night's watch, then tomorrow is foreseen (sworn only, so no other game spends a roll on it)
  const f=S.omenNext; if(f&&f.day===S.day&&f.id==='longnight'){ S.watches++; tally('longNights'); }
  if(!faithOf()) return; dayOmen(); if(anyClear()) S.omenNext={day:S.day+1,id:Math.random()<OMEN_CHANCE?pick(OMEN_NAT):null};
}
const freeCall=()=>bl('temple')>=5&&!(S.omenCall&&S.day-S.omenCall<7);   // the Temple's free weekly call (shared with its old reroll)
const profCall=()=>faithOf()==='dis'&&!(S.faith.pc&&S.day-S.faith.pc<7);   // the Profane: a free random call a week, no ward
const callUsed=()=>!!S.faith&&S.faith.cd===S.day;
function canCall(o){ const id=faithOf(), f=forecast(); if(!id||!f||S.mode!=='town'||callUsed()) return false;
  if(id==='dis') return profCall(); return godOmens(id).includes(o)&&f.id!==o&&(freeCall()||faithDev()>=CALL_COST); }
const canWard=()=>{ const id=faithOf(), f=forecast(); return !!id&&id!=='dis'&&!!f&&!!f.id&&S.mode==='town'&&!callUsed()&&faithDev()>=CALL_COST; };
function spendDev(n){ const f=S.faith, r0=faithRank(); f.dev=Math.max(0,(f.dev||0)-n); tally('devSpent',n); if(faithRank()!==r0) vitals(()=>{}); }
function callGodOmen(o){   // tomorrow becomes one of your god's two omens: a rank of devotion, or the Temple's free call
  if(!canCall(o)) return false; const id=faithOf(), f=S.omenNext;
  if(id==='dis'){ o=pick(Object.keys(OMENS).filter(k=>k!==f.id)); S.faith.pc=S.day; } else if(freeCall()) S.omenCall=S.day; else spendDev(CALL_COST);
  f.id=o; f.by=id; S.faith.cd=S.day; tally('godCalls'); tally('call_'+o); sfx('skill'); return o;
}
function wardOmen(){ if(!canWard()) return false; const f=S.omenNext, o=f.id; spendDev(CALL_COST); f.id=null; f.ward=o; S.faith.cd=S.day; tally('wards'); sfx('skill'); return o; }
const omenNextFix=g=>{ if(g.omenNext===undefined) return; const o=g.omenNext; if(!o||typeof o!=='object'||typeof o.day!=='number'||!isFinite(o.day)||!(o.id===null||OMENS[o.id])) delete g.omenNext; };
// the new omens (OMENS in game-gate-rules.js; they come only when a god calls them)
function godOmenRise(e){ const o=omen(); if(o==='longnight'){ e.maxHp=Math.max(1,Math.round(e.maxHp*LONG_HP)); e.hp=Math.min(e.maxHp,Math.round(e.hp*LONG_HP)); }
  if(o==='rotbloom'&&e.hp>0) addDot(e,'blight',Math.max(1,Math.round(e.maxHp*BLOOM_ROT)),3); }
function godOmenRoom(list){ if(omen()!=='choirnight'||!S.run) return; S.run.silence=Math.max(S.run.silence||0,silenceT(2)); for(const e of list) if(e.abilT!=null) e.abilT++; }
const nightK=()=>S&&S.omen&&S.omen.day===S.day&&S.omen.id==='choirnight'&&!(S.run&&(S.run.siege||S.run.trial))?CHOIR_NIGHT:1;   // extraMul (minion attack); reads today's omen without rolling it, so syncArmy never spends a roll
// the Temple at level 3: your god's chapel
const chapel=id=>bl('temple')>=3&&faithOf()===id;
const CHAPELS={hon:{name:'Hospice',d:'a downed minion shatters '+HOSPICE_SHATTER+'% less often'},vesh:{name:'Ice House',d:'bodies in the Embalmery never spoil'},
  ulm:{name:'Granary',d:'a brew needs one part fewer'},choir:{name:'Bell Choir',d:'headstones cost '+Math.round((1-BELL_CHOIR)*100)+'% less'},dis:{name:'Black Chapel',d:'your devotion fades half as fast'}};
const hospice=()=>chapel('hon')?HOSPICE_SHATTER:0;   // shatterOdds
const iceHouse=()=>chapel('vesh');   // embDays
function granary(B){ if(!B||!B.parts||!chapel('ulm')) return B&&B.parts; const p=Object.assign({},B.parts), k=Object.keys(p).sort((a,b)=>p[b]-p[a])[0]; if(k&&p[k]>1) p[k]--; return p; }   // brewCan/brewIt
const bellChoir=()=>chapel('choir')?BELL_CHOIR:1;   // headCost
const profDecay=()=>PROFANE_DECAY*(chapel('dis')?.5:1);   // faithDawn
// the town's dread and the siege
const dreadRest=()=>DREAD_REST+(faithOf()==='dis'?PROFANE_DREAD:0);   // dreadDawn drifts toward it
function godDreadDawn(){ if(faithOf()==='hon'&&dreadOn()&&dreadOf()>0) dread(-MORROW_DREAD); }   // Morrow: the town breathes easier
const godPayK=()=>faithOf()==='choir'?CHOIR_PAY:1;   // siegePayK
const godCommK=()=>faithOf()==='ulm'?ULM_COMM:1;   // commPay
function godSiegeWave(list,r){ if(faithOf()==='vesh'&&r.room===2){ for(const e of list) e.stun=Math.max(e.stun||0,1); log('Vesh breathes on the third wave. It stands frozen for a turn.','ok'); } }
const CAPTAIN_SAYS={hon:'Your Last Light is a candle in a grave, necromancer',vesh:'The Cold Mother cannot keep you from the fire',ulm:'Ulm\'s rot will feed the pyre well',
  choir:'Your Choir sings for the damned. Let them sing you down',dis:'No god at all? Then nothing will hear you burn'};
const captainLine=()=>{ const id=faithOf(); return id?' The Captain: '+CAPTAIN_SAYS[id]+'.':''; };
const forecastLine=()=>{ const f=forecast(); return f?' '+FAITH[faithOf()].short.replace(/^the /,'The ')+' shows you tomorrow: '+(f.id?OMENS[f.id].name:'no omen')+'.':''; };   // closeDay's notice
const GOD_TOWN={hon:'the dread falls '+MORROW_DREAD+' more each dawn',vesh:'a siege\'s third wave stands frozen for a turn',ulm:'commissions pay '+Math.round((ULM_COMM-1)*100)+'% more gold',
  choir:'sieges pay '+Math.round((CHOIR_PAY-1)*100)+'% more gold',dis:'the dread settles '+PROFANE_DREAD+' points higher, so sieges come sooner'};
