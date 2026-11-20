// How to play audit, name clashes, records, faith blessings, the Tower tab lock and the titles rarity dropdown.
(function(){
const {test,ok,eq,fix,setLvl,foe,arena,mkMinion,renderAll,wonRoom}=window.LOTD_T;
test('Help: How to play reads its numbers from the game and lists what opens later',()=>{
  ui.tab='help'; const h=renderAll('help');
  ok(h.includes('last '+BAK_N+' days'),'backup days'); ok(h.includes('level '+ULT_LV)); ok(h.includes('level '+FAITH_LV)); ok(h.includes('level '+TW.unlock));
  ok(h.includes(Object.values(ORDER_KEYS).map(r=>CMDS[r].name).join(', ')),'order names in key order');
  ok(/saves itself after every action/.test(h)); ok(!/rise to your level/.test(h),'cursed gates rise to just below your level');
  eq(HELP_LATER().length,10); setLvl(25); ok(HELP_LATER().find(x=>x[0]==='Ultimates')[2],'marked open');
  ui.tab='settings'; const st=renderAll('settings'); ok(/after every action/.test(st)&&!/every time you are in town/.test(st)); ok(/each place and boss/.test(st),'music text is current');
});
test('Names: no skill upgrade, unique power, order, affix or basic action shares a name with another',()=>{
  const names=[['Strike','action'],['Soul Siphon','action'],['Bone Ward','action']];
  Object.values(SKILL_MODS).forEach(M=>{ names.push([M.a[0],'upgrade'],[M.b[0],'upgrade']); });
  Object.values(FLAGS).forEach(f=>names.push([f.slice(0,f.indexOf(':')),'power']));
  Object.values(CMDS).forEach(c=>names.push([c.name,'order'])); Object.values(AFFIX).forEach(a=>names.push([a.name,'affix']));
  SKILLS.forEach(s=>names.push([s.name,'skill'])); Object.values(ULTS).forEach(u=>names.push([u.name,'ultimate']));
  const seen={}; for(const [n,k] of names){ ok(!seen[n],n+' is both '+seen[n]+' and '+k); seen[n]=k; }
});
test('Records: biggest hit, fastest clear, most kills and gold, deepest floor; kept through New Game+ and repaired on load',()=>{
  setLvl(30); const t=foe({hp:1e6}); arena([t]); hurtFoe(t,1234); eq(S.rec.hit.v,1234); hurtFoe(t,50); eq(S.rec.hit.v,1234,'only a bigger hit counts'); flee();
  S.ti=S.ti||{}; S.watches=3; startRun(0); S.run.tt=17; S.run.kills=9; S.run.goldTot=321; S.run.cleared=true; returnTown();
  eq(S.rec.fast[0].t,17); eq(S.rec.kills.v,9); eq(S.rec.gold.v,321);
  S.watches=3; startRun(0); S.run.tt=25; S.run.cleared=true; returnTown(); eq(S.rec.fast[0].t,17,'slower does not replace');
  arena([foe({hp:0,dead:true})]); S.run.tw=37; S.run.di=5; roomWon(); eq(S.rec.floor.v,37); returnTown();
  ui.tab='rec'; const h=renderAll('records'); ok(h.includes('h-rec')&&h.includes('1,234')&&h.includes('17 turns')&&h.includes('<b>37</b>'));
  const keep=JSON.stringify(S.rec); S.ti.clr={5:1}; S.mode='town'; if(typeof canNGP==='function'&&canNGP()){ startNGP(null); eq(JSON.stringify(S.rec),keep,'kept through New Game+'); }
  const g=normalizeSave({v:2,player:{lvl:5},rec:{hit:{v:5,day:1},kills:{v:-1,day:1},fast:{0:{t:9,day:2},9:{t:1,day:1}},sec:{1:4,8:2},junk:1}});
  eq(g.rec.hit.v,5); eq('kills' in g.rec,false); eq(Object.keys(g.rec.fast).join(),'0'); eq(Object.keys(g.rec.sec).join(),'1'); eq('junk' in g.rec,false);
  eq('rec' in normalizeSave({v:2,player:{lvl:5},rec:7}),false);
});
test('Records: a turn counter runs through the whole gate, and a slain secret master notes its day',()=>{
  setLvl(30); S.watches=3; startRun(0); const r=S.run; skillTick(); skillTick(); eq(r.tt,2);
  const e=makeSecret(0,5); r.enemies=[e]; e.hp=0; checkDeaths(); eq(S.rec.sec[0],S.day); flee();
});
test('Faith: full devotion grants a blessing once per run — Grace saves the Honored One, the Tithe starts the Dishonored with Souls',()=>{
  setLvl(30); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); S.mode='town'; S.gold=1e6; ok(swear('hon')); S.faith.day=S.day-DEVOTION[2]; ok(blessed('hon'));
  arena([foe({hp:1e6})]); const P=S.player; S.run.tw=5; P.hp=0; ok(playerFalls(),'no Grace in the Tower'); S.mode='town'; S.run=null; arena([foe({hp:1e6})]); P.hp=0; ok(!playerFalls(),'saved'); eq(P.hp,Math.round(pMax()*GRACE_HP)); P.hp=0; ok(playerFalls(),'only once a run');
  returnTown(); S.mode='town'; ok(renounce()); ok(swear('dis')); ok(!blessed('dis'),'devotion starts over'); S.watches=3; startRun(0); eq(S.run.souls||0,0); flee();
  S.faith.day=S.day-DEVOTION[2]; S.watches=3; startRun(0); eq(S.run.souls,TITHE_SOULS); flee();
  ui.tab='town'; ok(renderAll('shrine').includes(FAITH.dis.bless.name)); ui.tab='codex'; ui.cx='faith'; ok(renderAll('cx faith').includes(FAITH.hon.bless.name));
});
test('Tower tab: not shown at all until the Tower opens (three gate clears and level 10)',()=>{
  setLvl(TW.unlock); S.mode='town'; ui.tab='gates'; ACTIONS.tab('tower'); eq(ui.tab,'gates'); ui.tab='tower'; const h=renderAll('closed');
  eq(ui.tab,'gates','falls back'); ok(!/data-a="tab" data-k="tower"/.test(h),'no tab');
  S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); ACTIONS.tab('tower'); eq(ui.tab,'tower'); ok(/data-a="tab" data-k="tower"/.test(renderAll('open')));
});
test('Titles: rarity is one dropdown, and the log is not a live region (a separate one announces new lines)',()=>{
  S.mode='town'; ui.tab='titles'; ui.ttf='all'; let h=renderAll('titles'); ok(/<select data-a="ttf"/.test(h)); ok(!/data-k="r\d"/.test(h),'no rarity chips');
  ACTIONS.ttf('r2'); h=renderAll('rare'); ok(/<option value="r2" selected/.test(h)); ui.ttf='all';
  arena([foe()]); ok(!/class="log" aria-live/.test(renderAll('battle'))); ok(typeof srAnnounce==='function');
});
test('Records: Tower and Rift splits, win streak, damage survived, minion level, fused traits and gold held; kept through New Game+',()=>{
  setLvl(30); S.tower.best=20; startTower(1); const r=S.run;
  for(let f=0;f<11;f++){ r.tt=(r.tt||0)+5; S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); if(f<10) descend(); } eq(S.rec.tw10.v,50,'ten floors at five turns each'); returnTown();
  eq(S.rec.streak.v,1,'a Tower climb with floors won counts as a win');
  S.watches=3; startRun(0); S.run.dt=321; S.run.cleared=true; returnTown(); eq(S.rec.taken.v,321); eq(S.rec.streak.v,2);
  S.watches=3; startRun(0); S.run.dt=9999; S.mode='defeat'; returnTown(); eq(S.rec.taken.v,321,'a fall does not count');
  S.army=[]; mkMinion({lvl:23}); S.gold=4321; checkTitles(); eq(S.rec.mlv.v,23); eq(S.rec.held.v,4321); S.gold=10; checkTitles(); eq(S.rec.held.v,4321,'the most held stays');
  riftFast({rift:12,tt:30}); eq(S.rec.riftF[10].t,30); riftFast({rift:13,tt:40}); eq(S.rec.riftF[10].t,30,'slower does not replace'); eq(riftFastBest(10),30); eq(riftFastBest(15),Infinity); riftFast({rift:4,tt:2}); eq(Object.keys(S.rec.riftF).join(),'10','below the first band: no record');
  const a=mkMinion({traits:['thick']}), b=mkMinion({traits:['vicious']}); S.gold=1e6; S.mode='town'; if(fuse(a.uid,b.uid)) eq(S.rec.ftr.v,2);
  ui.tab='rec'; const h=renderAll('records'); ok(h.includes('Longest win streak')&&h.includes('Highest minion level')&&h.includes('Most gold held at once')&&h.includes('50 turns')&&h.includes('The Rift, depth 10'));
  const keep=JSON.stringify(S.rec); S.ti.clr={5:1}; S.mode='town'; ok(startNGP(null)); eq(JSON.stringify(S.rec),keep,'kept through New Game+');
  save(); S=null; loadGame(); eq(S.rec.tw10.v,50); eq(S.rec.riftF[10].t,30); eq(S.rec.streak.v,2);
  const g=normalizeSave({v:2,player:{lvl:5},rec:{tw10:{v:-3,day:1},held:{v:9,day:2},riftF:{10:{t:5,day:1,d:12},x:{t:1,day:1,d:1},15:{t:0,day:1,d:15}}}});
  ok(!('tw10' in g.rec)); eq(g.rec.held.v,9); eq(Object.keys(g.rec.riftF).join(),'10');
});

})();
