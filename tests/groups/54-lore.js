// Lore: four acts of passages unlocked by milestones, and twenty torn pages found in order.
(function(){
const {test,ok,eq,fix,setLvl,foe,arena,renderAll,BAD_TEXT,eventScene}=window.LOTD_T;
test('Lore: every passage and page is written, unique and clean; acts run in order through the game',()=>{
  eq(new Set(STORY.map(s=>s.id)).size,STORY.length); eq(new Set(STORY.map(s=>s.t)).size,STORY.length,'titles unique');
  STORY.concat(LORE_PAGES).forEach(s=>{ ok(s.t&&s.m.length>120&&!BAD_TEXT.test(s.m),s.t); });
  for(let a=1;a<=5;a++) ok(STORY.filter(s=>s.act===a).length>=6,'act '+a+' has substance');
  eq(LORE_PAGES.length,20); for(let i=1;i<LORE_PAGES.length;i++) ok(PAGE_LV(i)>PAGE_LV(i-1)); ok(PAGE_LV(LORE_PAGES.length-1)<=60,'the last page is reachable in a first playthrough');
  SECRET.forEach(B=>{ STORY.concat(LORE_PAGES).forEach(s=>ok(!s.m.includes(B.name),s.t+' keeps '+B.name+' secret')); });
});
test('Lore: milestone passages unlock as you reach them, once, and go to the room when you are in one',()=>{
  setLvl(1); S.story={intro:1}; S.ti=S.ti||{}; S.ti.raised=0; loreCheck(); ok(!S.story.raise1);
  S.ti.raised=1; S.notices=[]; loreCheck(); ok(S.story.raise1); ok(S.notices.some(n=>n.c==='story'&&/first to answer/.test(n.m)));
  S.notices=[]; loreCheck(); eq(S.notices.length,0,'once');
  arena([foe({hp:0,dead:true})]); fix(.99); roomWon(); setLvl(5); loreCheck(); ok(S.story.lv5); ok(S.run.events.some(e=>e.c==='story'&&/Ink under the nails/.test(e.m)),'inside a run it goes to the room'); flee();
  setLvl(30); S.mode='town'; S.gold=1e6; swear('dis'); loreCheck(); ok(S.story.oath_dis&&!S.story.oath_hon); ok(S.story.tower0&&S.story.ult1);
  S.ti.secret_3=1; loreCheck(); ok(S.story.secret1&&!S.story.secret6);
});
test('Lore: more Tower milestones (10, 40, 60, 90) and the Abyss',()=>{
  setLvl(70); S.tower.best=59; S.story={}; startTower(51); S.run.tw=60; S.run.enemies=[foe({hp:0,dead:true})]; roomWon();
  ok(S.story.t10&&S.story.t25&&S.story.t40&&S.story.t50&&S.story.t60); ok(!S.story.t75); returnTown();
  S.tower.best=150; loreCheck(); ok(S.story.t110&&S.story.t150&&!S.story.t200);
});
test('Lore: torn pages come in order, wait for their level, and drop from bosses, wardens, elites, coffers and secret masters',()=>{
  setLvl(1); S.pages=0; fix(0); ok(!findPage('elite',null),'page 1 waits for level '+PAGE_LV(0)); setLvl(PAGE_LV(0)); S.notices=[]; ok(findPage('elite',null)); eq(S.pages,1);
  ok(S.notices.some(n=>/torn page of the Ledger \(1\/20\)/.test(n.m)&&n.m.includes(LORE_PAGES[0].t)));
  ok(!findPage('boss',null),'page 2 waits for its level'); setLvl(PAGE_LV(1)); fix(.99); ok(!findPage('boss',null),'a miss'); fix(0); ok(findPage('boss',null)); eq(S.pages,2);
  setLvl(80); arena([foe({hp:1,boss:true})]); fix(0); const b=S.run.enemies[0]; b.hp=0; checkDeaths(); eq(S.pages,3,'a boss can hold one'); flee();
  eventScene('coffer'); fix(0); resolveEvent('open'); eq(S.pages,4,'a coffer can hold one'); flee();
  S.pages=LORE_PAGES.length; ok(!findPage('secret',null),'none past the last');
});
test('Lore: the Lore page shows acts as you reach them and the pages you hold; pages survive saves and New Game+',()=>{
  setLvl(1); S.ti=S.ti||{}; S.ti.raised=0; S.ti.deaths=0; S.story={intro:1,g0:2}; S.pages=3; ui.tab='lore'; let h=renderAll('lore');
  ok(h.includes('h-lore')&&h.includes(LORE_PAGES[2].t)&&!h.includes(LORE_PAGES[3].t)); ok(/Act I/.test(h)&&/Act II/.test(h)&&!/Act III/.test(h),'later acts stay hidden until the one before has begun');
  S.pages=LORE_PAGES.length; S.story.pages=1; h=renderAll('all'); ok(/Every page is home/.test(h));
  eq(normalizeSave({v:2,player:{lvl:5},pages:99}).pages,LORE_PAGES.length); eq(normalizeSave({v:2,player:{lvl:5},pages:'x'}).pages,0);
  S.pages=7; S.ti.clr={5:1}; S.mode='town'; if(canNGP()){ startNGP(null); eq(S.pages,7,'kept through New Game+'); }
  ui.tab='codex'; ui.cx='basics'; ok(renderAll('cx').includes(LORE_PAGES.length+' torn pages'));
  ok(LEDGER[0][0]==='lore','Lore is the first Ledger page');
});
test('Lore: the last passage opens only when every page is home',()=>{
  setLvl(60); S.story={}; S.pages=LORE_PAGES.length-1; loreCheck(); ok(!S.story.pages); S.pages=LORE_PAGES.length; loreCheck(); ok(S.story.pages);
});
})();
