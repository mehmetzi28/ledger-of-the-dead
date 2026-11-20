// The Rival (src/game-rival-trials.js): a named necromancer who steals bodies and waits in a cleared gate's boss room.
(function(){
const {test,ok,eq,near,fix,seed,fresh,setLvl,foe,arena,corpse,mkMinion,renderAll,cdx,invariants,canon}=window.LOTD_T;
const noRand=fn=>{ const r=Math.random; Math.random=()=>{ throw new Error('the rival must not use Math.random here'); }; try{ return fn(); } finally { Math.random=r; } };
const meet=lv=>{ setLvl(lv||25); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1}; S.kills['Tunnel Rat']=5; S.kills['Grave Beetle']=5; noRand(()=>rivalTick()); return S.rival; };
const theftRoom=(bodies,room,o)=>{ const g=meet(); g.steal=S.day; arena([foe({hp:0,dead:true})],0); Object.assign(S.run,o||{}); S.run.room=room==null?1:room; S.run.corpses=bodies; fix(.99); roomWon(); return S.run; };
const warnDay=()=>{ const g=meet(30); S.day=g.next-1; S.notices=[]; noRand(()=>rivalTick()); return g; };
const bossRoom=di=>{ S.mode='town'; S.run=null; S.watches=WATCHES; startRun(di); S.run.room=S.run.rooms-1; spawnRoom(); return S.run; };

test('Rival: appears after the fourth distinct gate clear, with a name from the list, a passage, a notice and a tip; no Math.random',()=>{
  setLvl(25); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1}; rivalTick(); ok(!rivalOpen()&&!S.rival.name,'three clears are not enough');
  eq([RIVAL_AT,RIVAL_GAP.join('-'),RIVAL_THEFT.join('-'),RIVAL_PUSH,RIVAL_GOLD].join(),'4,12-16,2-6,7,2');
  const g=meet(); ok(RIVAL_NAMES.includes(g.name),'a name from the list: '+g.name); eq(g.met,S.day); ok(S.story.rival0,'the introduction passage');
  ok(S.notices.some(n=>new RegExp('A rival necromancer, '+g.name+', has opened a ledger').test(n.m)),'a notice names them');
  ok(TIPS.find(t=>t.id==='rival').when(),'the one-time tip'); ok(g.next>=S.day+RIVAL_GAP[0]&&g.next<=S.day+RIVAL_GAP[1],'first challenge scheduled'); ok(g.steal>S.day,'first theft scheduled');
  invariants('met');
});

test('Rival: the fourth clear in a run introduces them on the raise screen',()=>{
  setLvl(25); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1}; arena([foe({hp:0,dead:true})],3); S.run.room=S.run.rooms-1; fix(.99); roomWon();
  ok(S.run.cleared&&S.rival.name,'met at the clear'); ok(S.run.events.some(e=>/A rival necromancer, .+, has opened a ledger/.test(e.m)),'told in the room\'s events');
});

test('Rival: the name is picked once and kept through saves; damaged rival data is repaired',()=>{
  const g=meet(), name=g.name; S.mode='town'; save(); S=null; loadGame(); eq(S.rival.name,name); S.day+=30; rivalTick(); eq(S.rival.name,name,'never renamed');
  const bad=normalizeSave(Object.assign(JSON.parse(JSON.stringify(S)),{rival:{name:'Nobody',wins:-3,page:7,gi:99,next:'x'}}));
  eq(bad.rival.name,''); eq(bad.rival.wins,0); eq(bad.rival.page,-1); eq(bad.rival.gi,-1); eq(bad.rival.next,0);
  const old=JSON.parse(JSON.stringify(S)); delete old.rival; delete old.trials; const g2=normalizeSave(old); eq(canon(g2.rival),canon(rivalDef()),'an old save gets a blank rival');
});

test('Rival: thefts come every 2 to 6 days (about 4) from a day hash',()=>{
  meet(); const gaps=[]; noRand(()=>{ for(let d=1;d<400;d++){ S.day=d; S.ti.rivalThefts=d%7; gaps.push(theftGap()); } });
  ok(gaps.every(x=>x>=RIVAL_THEFT[0]&&x<=RIVAL_THEFT[1]),'in range'); near(gaps.reduce((a,b)=>a+b,0)/gaps.length,4,.4,'average'); ok(new Set(gaps).size===5,'every gap occurs');
});

test('Rival: a theft takes the most valuable non-boss body before you act, greyed with "Taken by", and never spends anything',()=>{
  const elite=corpse({name:'Elite Rat',elite:true,lvl:8}), rat=corpse({lvl:3}), P=S.player;
  let r=theftRoom([rat,elite]); const g=S.rival; ok(elite.tried&&elite.result==='taken'&&elite.taken===g.name,'the elite is taken'); ok(!rat.tried,'the other stays');
  eq(g.thefts,1); eq(T_('rivalThefts'),1); ok(g.steal>S.day,'next theft scheduled'); ok(r.events.some(e=>new RegExp(g.name+' was here before you: the body of Elite Rat is taken').test(e.m)));
  const mana=P.mana, salts=S.salts; tryRaise(elite.id,true); eq(P.mana,mana); eq(S.salts,salts); ok(elite.result==='taken','cannot be raised');
  const h=renderAll('raise'); ok(/class="corpse done taken"/.test(h)&&new RegExp('Taken by '+g.name).test(h),'greyed on the raise screen');
  eq(raiseBest(),1,'raise the best skips it'); invariants('theft');
});

test('Rival: never from the first room, from fewer than 2 bodies, a boss body, the Tower, the Rift, a siege or a Trial, and not before the next theft day',()=>{
  const none=(bodies,room,o,why)=>{ fresh(); theftRoom(bodies,room,o); ok(bodies.every(c=>c.result!=='taken'),why); eq(S.rival.thefts,0,why); };
  none([corpse(),corpse({elite:true})],0,null,'first room');
  none([corpse({elite:true})],1,null,'one body');
  none([corpse({boss:true,name:'The Rat King'}),corpse({tried:true,result:'failed'})],2,null,'one open body and a boss');
  none([corpse(),corpse({elite:true})],1,{rift:3},'the Rift'); none([corpse(),corpse({elite:true})],1,{trial:2},'a Trial');
  fresh(); const b=[corpse({boss:true,name:'The Rat King',lvl:20}),corpse({lvl:2})]; theftRoom(b,3); ok(!b[0].tried&&b[1].result==='taken','the boss body is never taken');
  fresh(); const c=[corpse(),corpse({elite:true})]; const g=meet(); g.steal=S.day+2; arena([foe({hp:0,dead:true})],0); S.run.room=1; S.run.corpses=c; fix(.99); roomWon(); ok(!c.some(x=>x.taken),'not before its day');
  fresh(); const d=[corpse(),corpse({elite:true})]; const keep=rivalOpen; rivalOpen=()=>false; try{ setLvl(25); S.ti={clr:{0:1,1:1,2:1}}; arena([foe({hp:0,dead:true})],0); S.run.room=1; S.run.corpses=d; roomWon(); ok(!d.some(x=>x.taken)&&!S.rival.name,'switched off (the bot\'s "off":["rival"])'); } finally { rivalOpen=keep; }
});

test('Rival: challenges come every 12 to 16 days, warned the dawn before on the Gates tab and in a notice, in a cleared gate',()=>{
  const g=warnDay(); ok(g.gi>=0&&S.ti.clr[g.gi],'a cleared gate'); eq(g.warned,S.day); eq(T_('rivalWarned'),1);
  ok(S.notices.some(n=>new RegExp(g.name+' will wait for you in the boss room of the '+DUNGEONS[g.gi].name+' tomorrow').test(n.m)));
  ui.tab='gates'; let h=renderAll('warned'); ok(/class="rival-line"/.test(h)&&new RegExp(g.name+' comes tomorrow to the '+DUNGEONS[g.gi].name).test(h));
  rivalTick(); eq(T_('rivalWarned'),1,'one warning');
  S.watches=0; endDay(); eq(S.day,g.next); ok(rivalToday()); h=renderAll('today'); ok(new RegExp(g.name+' waits today in the '+DUNGEONS[g.gi].name).test(h));
  const days=new Set(); noRand(()=>{ for(let d=1;d<200;d++){ S.day=d; days.add(rivalGap(d)); } }); ok([...days].every(x=>x>=12&&x<=16)&&days.size===5,'gaps 12 to 16');
  S.day=g.next+1; g.done=0; rivalTick(); ok(g.next>S.day,'a missed challenge is rescheduled'); eq(g.gi,-1); invariants('challenge');
});

test('Rival: the boss room of the chosen gate holds the rival and followers, first visit only; other gates keep their master',()=>{
  const g=warnDay(); S.day=g.next; const other=[0,1,2].find(i=>i!==g.gi);
  let r=bossRoom(other); ok(!r.enemies[0].rival,'another gate: its own boss');
  r=bossRoom(g.gi); const e=r.enemies[0]; ok(e.rival&&e.boss&&e.role==='reaper'&&e.base===RIVAL_KIND&&e.name===g.name,'the rival leads');
  eq(e.abil,RIVAL_ABIL); ok(BOSS_ABIL[e.abil].warn,'a telegraphed move'); ok(r.rival); eq(g.done,S.day); eq(T_('rivalMet'),1);
  const f=r.enemies.slice(1); eq(f.length,RIVAL_FOLLOW[0]); ok(f.every(x=>x.follower&&x.lvl===e.lvl&&DUNGEONS[g.gi].mobs.some(m=>m[0]===x.base)),'followers of this gate at the rival\'s level');
  const met=DUNGEONS[g.gi].mobs.filter(m=>S.kills[m[0]]>0).map(m=>m[0]); if(met.length) ok(f.every(x=>met.includes(x.base)),'kinds you have met');
  ok(f.filter(x=>x.role==='mender').length<=1,'one mender at most');
  ok(r.log.some(l=>l.c==='boss'&&/So you are the one the Ledger chose/.test(l.m)),'the rival speaks');
  ok(new RegExp('Room 4/4').test(renderAll('battle')),'the battle screen'); invariants('rival room');
  r=bossRoom(g.gi); ok(!r.enemies[0].rival,'the second visit meets the master');
});

test('Rival: telegraphs Royal Decree and enters a second phase at half HP',()=>{
  const g=warnDay(); S.day=g.next; const r=bossRoom(g.gi), e=r.enemies[0];
  e.abilT=1; ok(bossTurn(e)&&e.charging,'charges'); ok(chargeInfo(e),'the Charging banner applies');
  e.hp=Math.floor(e.maxHp*.4); checkPhase(); ok(e.phase2,'second phase'); ok(r.log.some(l=>/Enough courtesy/.test(l.m)),'its phase line');
});

test('Rival: never weaker than you, as strong as the hardest gate open, and a little stronger after every win',()=>{
  meet(40); const top=topGate(), e=makeRival(0,5), st=mobStats(top,e.lvl,1,1,true,false);
  ok(e.lvl>=S.player.lvl+RIVAL_LV,'at least your level +1'); ok(e.maxHp>=Math.round(st.hp*RIVAL_HP),'the hardest gate\'s strength'); eq(e.rankI,top);
  S.rival.step=2; const e2=makeRival(0,5); near(e2.maxHp/e.maxHp,1+2*RIVAL_STEP,.01,'HP per win'); near(e2.atk/e.atk,1+2*RIVAL_STEP,.05,'attack per win');
  eq(rivalFollowers(),3); S.rival.step=9; eq(rivalFollowers(),RIVAL_FOLLOW[1],'at most 4 followers');
});

test('Rival: a win pays a legendary, gold like a secret master x2 not x4, returns a page and pushes the next challenge back',()=>{
  const g=warnDay(); S.day=g.next; S.pages=3; g.page=1; const r=bossRoom(g.gi), e=r.enemies[0];
  fix(.5); const a=Object.assign({},e), b=Object.assign({},e,{rival:false}), ra={}, rb={}; killLoot(a,ra); killLoot(b,rb); near(ra.gold/rb.gold,RIVAL_GOLD,.05,'gold x2');
  e.hp=0; checkDeaths(); eq(g.wins,1); eq(g.enc,1); eq(g.step,1); eq(T_('rivalWins'),1); eq(g.page,-1,'the page is back');
  ok(r.spoils.some(u=>{ const it=S.inv.find(x=>x.u===u); return it&&ITEM[it.id].tier===4&&!ITEM[it.id].uq; }),'a legendary, in the bag at once'); ok(!r.corpses.some(c=>c.base===RIVAL_KIND),'no body');
  ok(g.next>=S.day+RIVAL_GAP[0]+RIVAL_PUSH,'pushed back 7 days'); eq(S.kills[RIVAL_KIND],1,'the bestiary counts the rival'); ok(bossKind(RIVAL_KIND),'mastery as a boss kind');
  ok(r.log.some(l=>/Keep it, then/.test(l.m)),'their voice line'); ok(STORY_BY.rival1.when(),'first-win passage');
  r.enemies.forEach(x=>x.hp=0); checkDeaths(); roomWon(); ok(r.cleared,'the gate counts as cleared'); invariants('won');
  returnTown(); ui.tab='bes'; ok(/The Rival/.test(renderAll('bestiary')),'a bestiary row');
});

test('Rival: a loss costs only the normal fall, borrows a page (shown on the Lore page) that comes back at the next win, or a little gold',()=>{
  let g=warnDay(); S.day=g.next; S.pages=4; S.player.xp=Math.round(need(S.player.lvl)*.6); const xp=S.player.xp;
  let r=bossRoom(g.gi); defeat(); eq(S.player.xp,Math.max(0,xp-Math.round(need(S.player.lvl)*DIFF.deathXp)),'the normal fall only');
  eq(g.losses,1); eq(g.enc,1); ok(g.page>=0&&g.page<4,'a page is borrowed'); eq(S.pages,4,'nothing deleted'); ok(STORY_BY.rivalL.when());
  ok(S.notices.some(n=>new RegExp(g.name+' takes a torn page from your Ledger').test(n.m)));
  returnTown(); ui.tab='lore'; ok(new RegExp('Borrowed by '+g.name).test(renderAll('lore'))); ui.tab='rec'; ok(/Borrowed page/.test(renderAll('rec')));
  S.gold=10000; g.next=S.day; g.gi=1; g.done=0; S.ti.clr[1]=1; r=bossRoom(1); flee(); eq(g.losses,2,'fleeing counts'); eq(S.gold,10000-Math.min(1000,clearGold(1)),'a page is already borrowed: gold instead, capped');
  fresh(); g=warnDay(); S.day=g.next; S.pages=0; S.gold=200; bossRoom(g.gi); defeat(); eq(S.gold,180,'no pages: 10% of the gold'); eq(g.page,-1); invariants('lost');
});

test('Rival: New Game+ keeps the name and the record, resets strength and dates; no new intro until three clears again',()=>{
  const g=meet(); g.wins=3; g.losses=2; g.enc=5; g.step=3; g.thefts=4; const name=g.name;
  S.ti.clr[5]=1; S.mode='town'; ok(startNGP()); const n=S.rival; eq(n.name,name); eq([n.wins,n.losses,n.enc,n.thefts].join(),'3,2,5,4'); eq(n.step,0); eq(n.next,0); eq(n.steal,0); eq(n.gi,-1);
  ok(!rivalOpen(),'needs three clears again (met before)'); S.notices=[]; S.ti.clr={0:1,1:1,2:1}; rivalTick(); ok(!S.notices.some(x=>/opened a ledger/.test(x.m)),'no second introduction'); ok(n.next>S.day,'scheduled again');
});

test('Rival: Records card, Codex page, How to play line, Turkish; seeded systems and other runs are untouched',()=>{
  const g=meet(); g.enc=2; g.wins=1; g.losses=1; ui.tab='rec'; const h=renderAll('rec'); ok(/class="rival-card"/.test(h)&&h.includes(g.name)&&/Your wins/.test(h)&&/Encounters/.test(h)&&/unknown until you are warned/.test(h));
  const c=cdx('rival'); ok(/Codex &middot; The Rival/.test(c)&&/Every 12 to 16 days/.test(c)&&/every 2 to 6 days/.test(c)&&/Royal Decree/.test(c)); ok(HELP_LATER().find(x=>x[0]==='The Rival')[2]);
  for(const s of ['A rival necromancer, '+g.name+', has opened a ledger of their own. They will take bodies from your gates, and some days they will wait for you in one.','Taken by '+g.name,g.name+' waits today in the Rat Warren.','3. Borrowed by '+g.name,g.name+' takes 40 gold from your purse.','Your wins','Next challenge',RIVAL_LINES.win,RIVAL_LINES.hi])
    ok(trText(s)!==s,'Turkish for: '+s);
  ok(trText('A rival necromancer, '+g.name+', has opened a ledger of their own. They will take bodies from your gates, and some days they will wait for you in one.').includes(g.name),'the name stays English');
  fresh(); setLvl(25); S.ti={clr:{0:1,1:1,2:1,3:1}}; S.kills['Tunnel Rat']=5; S.kills['Grave Beetle']=5; seed(77); startRun(1); const a=JSON.stringify(S.run.enemies.map(e=>[e.base,e.hp]));   // the rival never touches the room generation of other days
  fresh(); meet(25); seed(77); startRun(1); eq(JSON.stringify(S.run.enemies.map(e=>[e.base,e.hp])),a,'a met rival changes nothing on an ordinary day');
});
})();
