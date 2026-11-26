// ===== THE RIVAL =====
// After your third distinct gate clear a rival necromancer opens a ledger of their own. Now and then (about one day in four)
// they take the most valuable body from a room before you can raise it, and about every two weeks they wait in the boss
// room of a gate you have cleared, warned a day ahead. Every schedule is a hash of the day: Math.random is never touched.
// S.rival = {name, met, enc, wins, losses, thefts, page, step, next, gi, warned, done, steal, stash} (wins and losses are yours).
// stash: the bodies they stole, {base,name,role,rankI,hf,af,elite,aff,cd,di,day}, at most RIVAL_STASH; they rise as their followers.
// New Game+ keeps the name and the record (and a borrowed page); the strength (step) and every date start again.
const RIVAL_NAMES=['Morwen Ashgrave','Corvin Hale','Isolde Vey','Silas Marrow','Edric Thorne','Agna Wexley'];
const RIVAL_KIND='Rival Necromancer';
const RIVAL_AT=4;                       // distinct gate clears before the rival appears (3 before: a rival met then stays)
const RIVAL_GAP=[12,16], RIVAL_PUSH=7;  // days between challenges (about 14); a win pushes the next one back 7 more
const RIVAL_THEFT=[2,6];                // days between thefts (about 4)
const RIVAL_LV=1, RIVAL_HP=22, RIVAL_ATK=9, RIVAL_STEP=.1, RIVAL_GOLD=2, RIVAL_ABIL='decree';   // like a secret master: never weaker than you, as strong as the hardest gate open; +10% HP and attack per win (RIVAL_HP/ATK tuned on the full bot: about 68% of challenges won; 6/2.6 -> 6.5/2.8 on 2026-11-19 after the stat rework, -> 12/5.2 the same day after the stat rebalance: Strength and Intelligence now raise minion attack, and the bot won ~82%; -> 12.8/5.4 after rows, intents and bonds: 71%/70% -> 71%/62%; -> 14.8/6.2 on 2026-11-20 after the difficulty rules and evolution marks: 73%/75% -> 64%/71% (13.8/5.4 alone: 68%/78%); -> 15.4/6.4 the same day after the rival fields its stolen bodies: 73%/68% -> 68%/68%)
const RIVAL_FOLLOW=[2,4];               // raised followers: 2, one more for every two wins, at most 4
const RIVAL_STASH=6;                    // stolen bodies the rival keeps (the oldest is dropped)
const RIVAL_FINE=.1;                    // a loss with no page to take: 10% of the gold you carry, at most one clear's worth
const RIVAL_LINES={hi:'So you are the one the Ledger chose. I wrote my name in a book too. Mine remembers me.',bye:'Keep it, then. For now. I will find a page you cannot hold.',
  phase:'Enough courtesy. Let me show you what my book has kept.',win:'A page for my book. Come and take it back, if you can.'};
const RIVAL_TAUNT={   // what they say into the Ledger: after a theft, the dawn before a challenge, when you beat them, when they beat you
  theft:['Your dead were never yours. They only waited for a firmer hand.','I took the one you would have chosen. You choose so predictably.','Count your bodies, scribe. Then count mine.','A good body. It will know your face when it rises for me.'],
  warn:['Tomorrow, then. Bring the dead you still have.','I have set a place for you. Do not keep me waiting.','Come and see what your stolen dead have learned.'],
  beaten:['You bleed ink like the rest of us. I will remember where.','A win. Write it small. The book has many pages left.','I am not finished. Neither is my ledger.'],
  won:[RIVAL_LINES.win,'Get up. I want you whole when I come for the rest.','Your dead looked at me before they looked at you. Remember that.']};
const rivalTaunt=(k,salt)=>{ const L=RIVAL_TAUNT[k]; return rv().name+': "'+L[dayHash(S.day,salt,rv().enc,k.length,41)%L.length]+'"'; };   // a day hash, not Math.random: the bots' dice stay where they were
function rivalWant(){   // the role your army leans on: the most minions, then the most levels between them; null with no army
  const n={}; for(const m of S.army||[]) if(ROLES[m.role]) n[m.role]=(n[m.role]||0)+1000+(m.lvl||0);
  let best=null; for(const k in n) if(!best||n[k]>n[best]) best=k; return best;
}
const rivalDef=()=>({name:'',met:0,enc:0,wins:0,losses:0,thefts:0,page:-1,step:0,next:0,gi:-1,warned:0,done:0,steal:0,stash:[]});
const rv=()=>{ if(!S.rival) S.rival=rivalDef(); return S.rival; };
const distinctClears=()=>Object.keys((S.ti&&S.ti.clr)||{}).filter(k=>S.ti.clr[k]).length;
let rivalOpen=()=>!!S&&!!S.player&&(distinctClears()>=RIVAL_AT||(!!(S.rival&&S.rival.met)&&distinctClears()>=3));   // let: the balance bot switches the rival off with "off":["rival"]
function dayHash(){ let a=0x9e3779b9; for(const x of arguments){ a=Math.imul(a^(x|0),2654435761)>>>0; a^=a>>>15; } a=Math.imul(a,2246822519)>>>0; return (a^(a>>>13))>>>0; }
const rivalGap=salt=>RIVAL_GAP[0]+dayHash(S.day,salt,T_('rivalWins'),S.ngp||0,11)%(RIVAL_GAP[1]-RIVAL_GAP[0]+1);
const theftGap=()=>(RIVAL_THEFT[0]+dayHash(S.day,T_('rivalThefts'),S.ngp||0,23)%(RIVAL_THEFT[1]-RIVAL_THEFT[0]+1))*(hasInsc('rival')?2:1);   /* Of the Rival */
const rivalGates=()=>DUNGEONS.map((D,i)=>i).filter(i=>i<GATE_N&&S.ti&&S.ti.clr&&S.ti.clr[i]&&S.player.lvl>=RK[i].unlock);
function rivalMeet(r){   // the third distinct clear: a name (once per save), a passage in the Ledger voice, a notice
  if(!rivalOpen()) return false; const g=rv(); if(g.name&&g.met) return false;
  if(!g.name) g.name=RIVAL_NAMES[dayHash(S.day,S.ngp||0,T_('clrN0'),5)%RIVAL_NAMES.length];
  g.met=S.day; const m='A rival necromancer, '+g.name+', has opened a ledger of their own. They will take bodies from your gates, and some days they will wait for you in one.';
  if(r&&r.events) r.events.push({m,c:'bad'}); else notify(m,'bad');
  unlockStory('rival0',r&&r.events?r:null); rivalTick(); return true;
}
function rivalTick(){   // dawn, load and every clear: the theft and challenge schedule, and the warning the dawn before
  if(!S||!S.player||!rivalOpen()) return; const g=rv(); if(!g.name||!g.met){ rivalMeet(); return; }
  if(!g.next||g.next<S.day||(g.done&&g.done>=g.next)){ g.next=S.day+rivalGap(1); g.gi=-1; g.warned=0; }   // first schedule, or a challenge missed or fought
  if(!g.steal) g.steal=Math.max(S.day+theftGap(),g.next-1);   // the first theft waits for the first challenge's warning: they show their face before they steal
  if(S.day>=g.next-1&&g.gi<0){ const gs=rivalGates(); if(gs.length) g.gi=gs[dayHash(g.next,S.ngp||0,g.enc,7)%gs.length]; }
  if(S.day===g.next-1&&g.gi>=0&&g.warned!==S.day){ g.warned=S.day; tally('rivalWarned'); notify(rivalTaunt('warn',g.next),'bad'); notify(g.name+' will wait for you in the boss room of the '+DUNGEONS[g.gi].name+' tomorrow. Your first visit there will meet them instead of its master.'+(rivalKitName()?' They bring '+rivalKitName()+', shaped by the bodies they stole.':''),'bad'); }
}
const rivalToday=()=>!!S&&rivalOpen()&&!!rv().name&&rv().next===S.day&&rv().gi>=0&&rv().done!==S.day&&!!(S.ti&&S.ti.clr&&S.ti.clr[rv().gi]);
const rivalWarned=()=>rivalToday()||(!!S&&rivalOpen()&&!!rv().name&&rv().gi>=0&&S.day===rv().next-1);
const rivalHere=di=>{ const r=S.run; return !!r&&!r.tw&&!r.rift&&!r.siege&&!r.trial&&rivalToday()&&rv().gi===di; };
const rivalFollowers=()=>Math.min(RIVAL_FOLLOW[1],RIVAL_FOLLOW[0]+Math.floor(rv().step/2));
function makeRival(di,lvl){
  const g=rv(), sg=Math.max(di,topGate()), L=Math.max(lvl+2,S.player.lvl+RIVAL_LV), st=mobStats(sg,L,1,1,true,false);
  const grow=(1+SB_GROW*Math.max(0,S.player.lvl-SAFE[sg]))*(1+RIVAL_STEP*g.step);   // a necromancer past the gates, and every win, make them grow
  const e={id:'e'+(++S.uid),name:g.name,base:RIVAL_KIND,role:'reaper',rankI:sg,lvl:L,hf:1,af:1,boss:true,elite:false,rival:true,dead:false,maxHp:1,hp:1,atk:1};
  e.maxHp=e.hp=Math.round(st.hp*RIVAL_HP*grow); e.atk=Math.max(1,Math.round(st.atk*RIVAL_ATK*(1+RIVAL_STEP*g.step)));
  giveAbility(e,RIVAL_ABIL); const rk=rivalKitMove(); if(rk) giveKit(e,[RIVAL_ABIL,RIVAL_MOVE[rk]]); return e;   /* the bodies they stole shape their kit (game-boss-kits.js) */
}
function rivalRoom(list,di,lvl){   // the boss room on a challenge day: the rival and raised followers of kinds you have met in this gate
  const g=rv(), riv=makeRival(di,lvl), D=DUNGEONS[di], sg=Math.max(di,topGate()); list.push(riv);
  const met=D.mobs.filter(m=>(S.kills[m[0]]||0)>0), pool=met.length?met:D.mobs;
  const bodies=g.stash.slice().reverse().sort((a,b)=>(b.di===di)-(a.di===di));   // this gate's first, newest first
  for(const b of bodies){ if(list.length>rivalFollowers()) break; if(b.role==='mender'&&list.some(x=>x.role==='mender')) continue;
    const s=mobStats(sg,riv.lvl,b.hf,b.af,false,b.elite), e={id:'e'+(++S.uid),name:b.name,base:b.base,role:b.role,rankI:b.rankI,lvl:riv.lvl,hf:b.hf,af:b.af,boss:false,elite:b.elite,follower:true,stash:1,sk:b.day+':'+b.di+':'+b.name,maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false};
    if(b.aff) e.aff=b.aff.slice(); if(b.cd) e.scd=b.cd; list.push(e); }   // scd: only a label; the death trait never acts on the foe side
  for(let i=list.length-1;i<rivalFollowers();i++){
    let t=pool[dayHash(S.day,i,g.enc,3)%pool.length];
    if(t[1]==='mender'&&list.some(x=>x.role==='mender')){ const o=pool.filter(m=>m[1]!=='mender'), o2=o.length?o:D.mobs.filter(m=>m[1]!=='mender'); t=o2[i%o2.length]; }
    const s=mobStats(sg,riv.lvl,t[2],t[3],false,false);
    list.push({id:'e'+(++S.uid),name:t[0],base:t[0],role:t[1],rankI:di,lvl:riv.lvl,hf:t[2],af:t[3],boss:false,elite:false,follower:true,maxHp:s.hp,hp:s.hp,atk:s.atk,dead:false});
  }
  g.done=S.day; S.run.rival=true; tally('rivalMet');
}
function rivalLegend(){ const rows=tableFor(topGate(),'reaper',true,false).filter(x=>ITEM[x.id].tier===4&&!ITEM[x.id].uq); return rows.length?pickNorm(rows):pick(Object.values(ITEM).filter(d=>!d.uq&&!d.tower&&d.tier===4)).id; }
function rivalBeaten(e,r){   // the rival falls: a legendary, the gold (in killLoot), the page back, and the next challenge pushed back
  const g=rv(); g.wins++; g.enc++; g.step++; tally('rivalWins'); r.rivalWon=true;
  { const id=rivalLegend(), it=addItem(id,rollItem(id,true)); if(it){ r.spoils.push(it.u); r.items=(r.items||0)+1; } else r.lostLoot.push(ITEM[id].name); }   // in the bag at once: kept even if their followers win the room
  if(g.page>=0){ const P0=LORE_PAGES[g.page]; r.rivalPage=g.page; g.page=-1; log(g.name+' drops the page they took: "'+(P0?P0.t:'')+'". It is yours again.','ok'); }
  g.next=S.day+rivalGap(2)+RIVAL_PUSH; g.gi=-1; g.warned=0;
  moment(g.name+' retreats','gold'); log(g.name+' retreats into the dark, and the Ledger writes the win in red.','story'); log(rivalTaunt('beaten',g.wins),'boss');
}
function rivalLost(r){   // you fell or fled with the rival standing: a page is borrowed (never deleted), or a little gold
  const g=rv(), di=r.di; g.losses++; g.enc++; tally('rivalLosses');
  g.next=S.day+rivalGap(3); g.gi=-1; g.warned=0;
  let m;
  if((S.pages||0)>0&&g.page<0){ g.page=dayHash(S.day,g.losses,S.pages,9)%S.pages; m=g.name+' takes a torn page from your Ledger: "'+LORE_PAGES[g.page].t+'". Beat them to get it back.'; }
  else { const f=Math.min(Math.round(S.gold*RIVAL_FINE),clearGold(di)); S.gold=Math.max(0,S.gold-f); m=g.name+' takes '+f+' gold from your purse.'; }
  log(rivalTaunt('won',g.losses),'boss'); notify(m,'bad'); r.rivalLost=true;
}
const rivalStanding=r=>!!(r&&r.rival&&r.enemies.some(e=>e.rival&&e.hp>0));
function rivalTheft(r){   // on a gate run, before you act on a room's bodies: the most valuable one of the role your army leans on (else any), never a boss, never from fewer than two
  if(!rivalOpen()||!r||r.tw||r.rift||r.siege||r.trial||r.room===0) return null; const g=rv(); if(!g.name||!g.met||!g.steal||S.day<g.steal) return null;
  const open=r.corpses.filter(c=>!c.tried); if(open.length<2) return null;
  const w=rivalWant(), c=open.filter(x=>!x.boss).sort((a,b)=>(b.role===w)-(a.role===w)||bodyValue(b)-bodyValue(a))[0]; if(!c) return null;
  c.tried=true; c.result='taken'; c.taken=g.name; g.thefts++; tally('rivalThefts'); g.steal=S.day+theftGap();
  const b={base:c.base,name:c.name,role:c.role,rankI:c.rankI,hf:c.hf,af:c.af,elite:!!c.elite,di:r.di,day:S.day}; if(c.aff&&c.aff.length) b.aff=c.aff.slice(); if(c.cd) b.cd=c.cd;
  g.stash.push(b); g.stash=g.stash.slice(-RIVAL_STASH);
  r.events.push({m:g.name+' was here before you: the body of '+c.name+' is taken. It will raise them against you.',c:'bad'},{m:rivalTaunt('theft',g.thefts),c:'bad'}); return c;
}
function rivalReclaim(e,c){   // checkDeaths: a stolen body falls back into your hands with the condition it was stolen with
  if(c.cd) delete c.cd; if(e.scd) c.cd=e.scd;
  const g=rv(), i=g.stash.findIndex(b=>b.day+':'+b.di+':'+b.name===e.sk); if(i>=0) g.stash.splice(i,1);
}
function rivalFix(g){   // normalizeSave
  const d=rivalDef(), o=g.rival&&typeof g.rival==='object'&&!Array.isArray(g.rival)?g.rival:{}, n=(v,def)=>typeof v==='number'&&isFinite(v)?Math.floor(v):def;
  const out=rivalDef(); out.name=typeof o.name==='string'&&RIVAL_NAMES.includes(o.name)?o.name:'';   /* the default's key order: a loaded save matches the saved one */
  for(const k of ['met','enc','wins','losses','thefts','step','next','warned','done','steal']) out[k]=Math.max(0,n(o[k],d[k]));
  out.page=n(o.page,-1); if(!(out.page>=0&&out.page<(g.pages||0))) out.page=-1;
  out.gi=n(o.gi,-1); if(!RK[out.gi]) out.gi=-1;
  if(!out.name) out.met=0;
  const mob=b=>{ for(const D of DUNGEONS){ const m=D.mobs.find(x=>x[0]===b); if(m) return m; } return null; };
  out.stash=(Array.isArray(o.stash)?o.stash:[]).filter(b=>b&&typeof b==='object'&&mob(b.base)).map(b=>{ const m=mob(b.base), x={base:m[0],name:typeof b.name==='string'&&b.name?b.name.slice(0,60):m[0],role:m[1],rankI:RK[n(b.rankI,-1)]?n(b.rankI,0):0,hf:m[2],af:m[3],elite:!!b.elite,di:0,day:Math.max(0,n(b.day,0))};
    x.di=RK[n(b.di,-1)]?n(b.di,0):x.rankI; const a=Array.isArray(b.aff)?b.aff.filter(k=>AFFIX[k]):[]; if(a.length) x.aff=a; if(CORPSE_CONDS[b.cd]) x.cd=b.cd; return x; }).slice(-RIVAL_STASH);
  g.rival=out;
}
const rivalNgp=o=>Object.assign(rivalDef(),o?{name:o.name,met:o.met,enc:o.enc,wins:o.wins,losses:o.losses,thefts:o.thefts,page:o.page}:{});   // New Game+: the name and record stay
// Gold and bone dust worth about one clear of a gate (the siege's yardstick: about 20 kills of coin at the gate's level).
const clearGold=di=>Math.round(20*(1+(RK[di].lv+1)*.5)*(1+di*.5)*ngpReward());
const clearDust=di=>Math.round((6+Math.floor(S.player.lvl/4))*(1+BOUNTY_GATE*di));

// ===== TRIALS =====
// Once the Throne of Ash has fallen, each in-game week (days 1-7, 8-14, ...) holds one Trial, chosen by a hash of the week:
// a cleared gate on a fixed difficulty with one or two curses, and the same rooms and foes for every attempt that week (the
// run's own room generation is seeded from the week). One watch, once a day; four rooms, no doors, events or raising.
// Score: turns plus a penalty per minion downed, lower is better. S.trials = {cur, day, log:[{w,di,t,s,day,paid}], best}.
const TRIAL_ROOMS=4, TRIAL_DOWN=5, TRIAL_TIERS=3, TRIAL_LOG=8, TRIAL_PAR=8;   // tiers: Normal, Hard or Brutal. TRIAL_PAR: a score at or under it, once a week, pays hearts of the gate's boss (1 + the tier) toward Awakening
const trialHearts=t=>1+(t|0), trialHeartKey=di=>'b:'+DUNGEONS[di].boss[0];
const trialDef=()=>({cur:null,day:0,log:[],best:null});
const tri=()=>{ if(!S.trials) S.trials=trialDef(); return S.trials; };
const trialOpen=()=>!!S&&!!S.player&&(T_('clrN5')>0||!!(S.ti&&S.ti.clr&&S.ti.clr[5]));
const trialWeek=()=>Math.floor((S.day-1)/7)+1;
function trialPlan(){   // this week's Trial, fixed the first time the week asks for it
  if(!trialOpen()) return null; const T=tri(), w=trialWeek();
  if(T.cur&&T.cur.w===w&&T.cur.di>=0) return T.cur;   // a week with no gate to try yet asks again (nothing was attempted)
  const gs=DUNGEONS.map((D,i)=>i).filter(i=>i<GATE_N&&S.ti&&S.ti.clr&&S.ti.clr[i]&&S.player.lvl>=RK[i].unlock);
  if(!gs.length){ T.cur={w,di:-1}; return null; }
  const h=dayHash(w,101), ks=Object.keys(MODS), di=gs[h%gs.length], m1=ks[dayHash(w,103)%ks.length], two=dayHash(w,107)%2===1;
  const rest=ks.filter(k=>k!==m1), mods=two?[m1,rest[dayHash(w,109)%rest.length]]:[m1];
  let tier=dayHash(w,113)%TRIAL_TIERS; while(tier>0&&S.player.lvl<tierRec(TRIAL_GATE,tier)) tier--;   /* never above the hardest tier the Throne recommends for your level */
  T.cur={w,di,tier,mods,lv:trialLv(di,tier),seed:dayHash(w,127)}; return T.cur;
}
const trialBestWeek=()=>{ const w=trialWeek(); return (tri().log||[]).find(x=>x.w===w)||null; };
const trialReady=()=>{ const p=trialPlan(); return !!p&&S.mode==='town'&&S.watches>0&&tri().day!==S.day&&S.player.lvl>=RK[p.di].unlock; };
function trialRng(seed,room){ let a=dayHash(seed,room,131)|0; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function startTrial(){
  if(!trialReady()) return false; const p=trialPlan(), di=p.di;
  S.watches--; S.runs++; S.notices=[]; tri().day=S.day; tally('trials');
  S.run={di,trial:p.w,tseed:p.seed,tlv:p.lv,room:0,rooms:TRIAL_ROOMS,enemies:[],corpses:[],events:[],log:[],turn:1,target:null,pending:0,fx:{},kills:0,raised:0,cleared:false,gained:0,ups:0,loot:[],spoils:[],lostLoot:[],mod:p.mods[0],mod2:p.mods[1]||null,heat:p.tier,downs:0};
  S.mode='battle'; titheSouls();
  log('The Trial of week '+p.w+' begins in the '+DUNGEONS[di].name+'.');
  spawnRoom(); return true;
}
const TRIAL_GATE=5;   // a Trial's foes fight as hard as the Throne of Ash's, whatever gate they come from: its HP, attack and armor (2026-11-26: at their own gate's strength the bots wiped every Normal Trial room in one action, score 0)
const trialLv=(di,t)=>Math.max(RK[di].lv,S.player.lvl-(tierRec(TRIAL_GATE,t)-RK[TRIAL_GATE].lv));   // and stand as far below your level as the Throne's foes stand below its Recommended level on that tier: a fair fight on every tier (it was your level -5 on every tier; the curses add no foe multiplier in a Trial, see foeHeat)
function trialPow(list,di){ if(di>=TRIAL_GATE) return; const a=mobStats(TRIAL_GATE,1,1,1,false,false), b=mobStats(di,1,1,1,false,false), hk=a.hp/b.hp, ak=a.atk/b.atk*DIFF.foeAtk[TRIAL_GATE]/DIFF.foeAtk[di];
  for(const e of list){ e.maxHp=e.hp=Math.round(e.maxHp*hk); e.atk=Math.max(1,Math.round(e.atk*ak)); } }
const trialScore=r=>(r.tt||0)+TRIAL_DOWN*(r.downs||0);
function trialCleared(r){   // the fourth room falls: the score, the week's and the all-time best, and the first completion's reward
  const T=tri(), p=T.cur, s=trialScore(r); r.cleared=true; tally('trialsDone');
  r.trialRes={turns:r.tt||0,downs:r.downs||0,s};
  let e=T.log.find(x=>x.w===r.trial); const first=!e;
  if(!e){ e={w:r.trial,di:r.di,t:r.heat||0,s,day:S.day,paid:0,hp:0}; T.log.unshift(e); T.log=T.log.slice(0,TRIAL_LOG); }
  else if(s<e.s){ e.s=s; e.day=S.day; r.trialRes.better=true; }
  if(!T.best||s<T.best.s){ if(T.best) r.trialRes.record=true; T.best={s,day:S.day,w:r.trial,di:r.di,t:r.heat||0}; }
  if(!e.paid){ e.paid=1; const g=clearGold(r.di), d=clearDust(r.di); S.gold+=g; S.dust=(S.dust||0)+d; r.goldTot=(r.goldTot||0)+g; r.trialRes.g=g; r.trialRes.d=d; }
  if(s<=TRIAL_PAR&&!e.hp){ e.hp=1; const k=trialHeartKey(r.di), n=trialHearts(r.heat); S.trophies[k]=(S.trophies[k]||0)+n; r.trialRes.h=n; r.trialRes.hk=k; tally('trialHearts',n); }   // par beaten: the gate's boss's hearts, once a week
  r.events.push({m:'Trial complete: '+(r.tt||0)+' turns, '+(r.downs||0)+' minion'+((r.downs||0)===1?'':'s')+' downed. Score '+s+(r.trialRes.g?'. First completion this week: +'+r.trialRes.g+' gold, +'+r.trialRes.d+' bone dust':'')+'.',c:'ok'});
  if(r.trialRes.h) r.events.push({m:'Par '+TRIAL_PAR+' beaten: +'+r.trialRes.h+' Heart'+(r.trialRes.h===1?'':'s')+' of '+DUNGEONS[r.di].boss[0]+'.',c:'ok'});
  moment(first?'Trial complete: score '+s:r.trialRes.better?'Trial: new best this week, '+s:'Trial: score '+s,'gold');
  return 0;
}
function trialsFix(g){   // normalizeSave
  const o=g.trials&&typeof g.trials==='object'&&!Array.isArray(g.trials)?g.trials:{}, n=v=>typeof v==='number'&&isFinite(v)&&v>=0, ok=o2=>o2&&typeof o2==='object';
  const c=o.cur; let cur=null;
  if(ok(c)&&n(c.w)){ if(c.di===-1) cur={w:Math.floor(c.w),di:-1}; else if(RK[c.di]&&n(c.tier)&&c.tier<TRIAL_TIERS&&Array.isArray(c.mods)&&c.mods.length>=1&&c.mods.length<=2&&c.mods.every(k=>MODS[k])&&n(c.lv)&&n(c.seed)) cur={w:Math.floor(c.w),di:c.di,tier:Math.floor(c.tier),mods:c.mods.slice(),lv:Math.floor(c.lv),seed:Math.floor(c.seed)}; }
  const okE=x=>ok(x)&&n(x.w)&&RK[x.di]&&n(x.s)&&n(x.day)&&n(x.t)&&x.t<TRIAL_TIERS;
  const log=Array.isArray(o.log)?o.log.filter(okE).slice(0,TRIAL_LOG).map(x=>({w:Math.floor(x.w),di:x.di,t:Math.floor(x.t),s:Math.floor(x.s),day:Math.floor(x.day),paid:x.paid?1:0,hp:x.hp?1:0})):[];
  g.trials={cur,day:n(o.day)?Math.floor(o.day):0,log,best:okE(o.best)?{s:Math.floor(o.best.s),day:Math.floor(o.best.day),w:Math.floor(o.best.w),di:o.best.di,t:Math.floor(o.best.t)}:null};
}
BOSS_LINES[RIVAL_KIND]=[RIVAL_LINES.hi,RIVAL_LINES.bye]; PHASE_LINES[RIVAL_KIND]=RIVAL_LINES.phase;
TIPS.push({id:'rival',t:'A rival',m:'Another necromancer hunts your gates. Now and then they take the best body from a room before you can raise it. About every two weeks they wait in the boss room of a gate you have cleared: you are warned the day before, on the Gates tab. Beat them for a legendary; their record is in the Ledger\'s Records.',when:()=>S.mode==='town'&&rivalOpen()&&!!rv().name&&!!rv().met},
  {id:'trial',t:'Trials',m:'The Throne of Ash has fallen, so each week now holds a Trial (Gates tab): the same four rooms for every attempt that week, once a day. Fewer turns and fewer minions downed score better.',when:()=>S.mode==='town'&&trialOpen()&&!!trialPlan()});
