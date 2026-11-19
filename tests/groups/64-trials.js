// Trials (src/game-rival-trials.js): one fixed four-room challenge a week once the Throne of Ash has fallen, scored by turns.
(function(){
const {test,ok,eq,near,fix,seed,fresh,setLvl,foe,mkMinion,renderAll,cdx,invariants,canon}=window.LOTD_T;
const open=(lv,day)=>{ setLvl(lv||50); S.ti={clr:{0:1,1:1,2:1,3:1,4:1,5:1},clrN5:1}; S.day=day||1; S.mode='town'; S.run=null; S.watches=WATCHES; return trialPlan(); };
const killRoom=()=>{ S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); };
const sig=()=>S.run.enemies.map(e=>[e.base,e.lvl,e.maxHp,e.atk,e.elite?1:0,(e.aff||[]).join('+')].join(':')).join('|');
const allRooms=()=>{ const out=[]; for(let i=0;i<TRIAL_ROOMS;i++){ out.push(sig()); killRoom(); if(i<TRIAL_ROOMS-1) ok(descend(),'on to room '+(i+2)); } return out; };
const nextDay=()=>{ S.run=null; S.mode='town'; S.day++; S.watches=WATCHES; };

test('Trials: open once the Throne of Ash has fallen (kept through New Game+), with a Gates sub-tab and a tip',()=>{
  setLvl(50); S.ti={clr:{0:1,1:1,2:1,3:1,4:1}}; ok(!trialOpen()&&!trialPlan(),'not before the Throne'); ui.tab='gates'; ok(!/data-k="trial"/.test(renderAll('gates')));
  const p=open(); ok(trialOpen()&&p,'open'); ok(/data-a="gsub" data-k="trial"/.test(renderAll('gates')),'a sub-tab'); ok(TIPS.find(t=>t.id==='trial').when(),'the tip');
  S.ti.clr={}; tri().cur=null; ok(trialOpen(),'a past Throne clear keeps it open'); ok(!trialPlan(),'but a gate must be cleared in this book');
});

test('Trials: each week (days 1-7, 8-14, ...) picks one cleared gate, a tier and one or two curses from a hash of the week, fixed once picked',()=>{
  eq([1,7,8,14,15].map(d=>{ S.day=d; return trialWeek(); }).join(),'1,1,2,2,3');
  const r=Math.random; Math.random=()=>{ throw new Error('the week must not use Math.random'); }; let plans=[];
  try{ for(let w=1;w<=40;w++){ open(50,(w-1)*7+1); plans.push(trialPlan()); } } finally { Math.random=r; }
  ok(plans.every(p=>S.ti.clr[p.di]&&p.tier>=0&&p.tier<TRIAL_TIERS&&p.mods.length>=1&&p.mods.length<=2&&p.mods.every(k=>MODS[k])&&new Set(p.mods).size===p.mods.length),'valid plans');
  ok(new Set(plans.map(p=>p.di)).size>=4&&new Set(plans.map(p=>p.tier)).size===3&&plans.some(p=>p.mods.length===2)&&plans.some(p=>p.mods.length===1),'variety over 40 weeks');
  fresh(); const a=open(50,8); fresh(); eq(canon(open(50,10)),canon(a),'the same week gives the same Trial');
  const lv=a.lv; setLvl(60); eq(trialPlan().lv,lv,'fixed for the week once picked'); S.day=15; ok(trialPlan().w===3,'a new week picks again');
});

test('Trials: every attempt in a week faces the same rooms and foes, whatever the dice did before; other systems keep their own dice',()=>{
  open(50,2); seed(1); ok(startTrial()); const a=allRooms(); ok(S.run.cleared);
  nextDay(); seed(999); fix(.3); ok(startTrial()); const b=allRooms(); eq(b.join('/'),a.join('/'),'same rooms');
  const seed1=S.run.tseed; nextDay(); S.day=9; seed(5); ok(startTrial()); ok(S.run.tseed!==seed1,'a new week, new rooms');
  fresh(); open(50,3); const f=()=>.42; Math.random=f; startTrial(); ok(Math.random===f,'the game\'s dice are given back after a Trial room');
});

test('Trials: one watch, at most once a day; four straight rooms with no doors, events, raising, gear or gold; both curses work',()=>{
  const p=open(50,4); const w=S.watches; ok(startTrial()); eq(S.watches,w-1); eq(tri().day,S.day); eq(S.run.rooms,4); eq(S.run.heat,p.tier); eq(S.run.mod,p.mods[0]); eq(S.run.mod2,p.mods[1]||null);
  p.mods.forEach(k=>ok(hasRunMod(k),'curse '+k)); ok(!omen(),'no omen reaches a Trial');
  ui.tab='gates'; ok(/Trial &middot; Room 1\/4 &middot; Turn 1/.test(renderAll('battle')),'battle header');
  const gold=S.gold; killRoom(); const r=S.run; ok(!r.doors&&!r.event,'no doors, no events'); eq(r.corpses.length,0,'no bodies'); eq(r.spoils.length,0,'no gear'); eq(S.gold,gold,'no gold'); invariants('trial raise');
  let h=renderAll('trial raise'); ok(/Trial &middot; /.test(h)&&/No bodies rise in a Trial/.test(h)&&/Leave the Trial/.test(h)&&!/data-a="door"/.test(h));
  S.mode='town'; S.run=null; ok(!startTrial(),'once a day'); S.day++; S.watches=0; ok(!startTrial(),'needs a watch');
  fresh(); open(50,4); S.player.lvl=1; ok(!trialReady(),'the gate must be open to you');
});

test('Trials: score is turns plus 5 per minion downed; a fall scores nothing; first completion each week pays once',()=>{
  const p=open(50,1); const m=mkMinion({lvl:40}); ok(startTrial());
  for(let i=0;i<3;i++){ killRoom(); descend(); }
  S.run.tt=37; m.hp=0; const gold=S.gold, dust=S.dust||0; killRoom(); const r=S.run;
  ok(r.cleared); eq(r.downs,1); eq(r.trialRes.s,37+TRIAL_DOWN); eq(trialScore(r),42);
  eq(S.gold-gold,clearGold(p.di),'gold like one clear'); eq((S.dust||0)-dust,clearDust(p.di),'bone dust like one clear');
  const h=renderAll('result'); ok(/Turns taken/.test(h)&&/Minions downed/.test(h)&&/<b>42<\/b>/.test(h)&&/First completion this week/.test(h),'the breakdown');
  const T=tri(); eq(T.log.length,1); eq(T.log[0].s,42); eq(T.best.s,42); eq(T.log[0].paid,1); returnTown(); invariants('done');
  S.day++; S.watches=WATCHES; ok(startTrial()); for(let i=0;i<3;i++){ killRoom(); descend(); } S.run.tt=20; const g2=S.gold; killRoom();
  eq(S.gold,g2,'nothing for a repeat'); eq(T.log[0].s,20,'a better score replaces the week\'s best'); eq(T.best.s,20); ok(S.run.trialRes.better||S.run.trialRes.record); returnTown();
  S.day++; S.watches=WATCHES; ok(startTrial()); S.player.hp=0; defeat(); eq(T.log[0].s,20,'a fall scores nothing'); eq(T.log.length,1); returnTown();
  S.day++; S.watches=WATCHES; ok(startTrial()); for(let i=0;i<3;i++){ killRoom(); descend(); } S.run.tt=60; killRoom(); eq(T.log[0].s,20,'a worse score does not replace it'); returnTown();
  ok(S.hist.some(x=>x.trial===1),'the history marks Trial runs'); ui.tab='hist'; ok(/Trial, week 1/.test(renderAll('hist')));
  ok(!(S.rec.fast&&S.rec.fast[p.di]),'a Trial is not a fastest clear');
});

test('Trials: records on the Records page, kept through New Game+; saves repair bad Trial data',()=>{
  const p=open(50,6); const T=tri(); T.log=[{w:1,di:p.di,t:p.tier,s:31,day:6,paid:1}]; T.best={s:31,day:6,w:1,di:p.di,t:p.tier};
  ui.tab='rec'; const h=renderAll('rec'); ok(/<p class="group-h">Trials<\/p>/.test(h)&&/Best ever/.test(h)&&/Week 1/.test(h)&&/<b>31<\/b>/.test(h));
  S.mode='town'; save(); S=null; loadGame(); eq(S.trials.best.s,31); eq(S.trials.log.length,1);
  const bad=normalizeSave(Object.assign(JSON.parse(JSON.stringify(S)),{trials:{cur:{w:1,di:9},day:'x',log:[{w:1,di:0,t:9,s:3,day:1},5,{w:2,di:1,t:1,s:7,day:9,paid:'yes'}],best:{s:-1}}}));
  eq(bad.trials.cur,null); eq(bad.trials.day,0); eq(bad.trials.log.length,1); eq(bad.trials.log[0].paid,1); eq(bad.trials.best,null);
  const old=JSON.parse(JSON.stringify(S)); delete old.trials; eq(canon(normalizeSave(old).trials),canon(trialDef()));
  S.ti.clr[5]=1; S.mode='town'; ok(startNGP()); eq(S.trials.best.s,31,'kept through New Game+'); eq(S.trials.log.length,1); eq(S.trials.cur,null); eq(S.trials.day,0); invariants('ngp');
});

test('Trials: the Gates card, Codex page, How to play line and Turkish',()=>{
  const p=open(50,3); ui.tab='gates'; ui.gsub='trial'; let h=renderAll('trial card');
  ok(/class="win trial-w"/.test(h)&&/Trial &middot; Week 1/.test(h)&&h.includes(DUNGEONS[p.di].name)&&h.includes(HEAT[p.tier].name)&&p.mods.every(k=>h.includes(MODS[k].name)),'gate, tier and curses');
  ok(/Your best this week/.test(h)&&/Your best ever/.test(h)&&/data-a="trial"/.test(h)&&!/data-a="trial" disabled/.test(h),'records and Enter');
  ACTIONS.trial(); eq(S.mode,'battle'); ok(S.run.trial); S.mode='town'; S.run=null; ui.gsub='trial'; h=renderAll('tried'); ok(/data-a="trial" disabled/.test(h)&&/You have tried the Trial today/.test(h));
  ACTIONS.gsub('trial'); eq(ui.gsub,'trial'); const c=cdx('trials'); ok(/Codex &middot; Trials/.test(c)&&/plus 5 for each minion downed/.test(c)); ok(HELP_LATER().find(x=>x[0]==='Trials')[2]);
  for(const s of ['Trial','Your best this week','Enter the Trial','Trial complete: 33 turns, 2 minions downed','The Trial of week 3 begins in the Rat Warren.','Trial, week 2','Room 2/4 cleared','No bodies rise in a Trial. On to the next room.'])
    ok(trText(s)!==s,'Turkish for: '+s);
});
})();
