// Story tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Story: five acts of passages; the first opens with a new game',()=>{ ok(STORY.length>=40); STORY.forEach(s=>ok(s.act>=1&&s.act<=5,s.id+' act')); STORY.forEach(s=>ok(s.t&&s.m.length>80&&!BAD_TEXT.test(s.m),s.id)); ok(S.story.intro); newGame(); ok(S.notices.some(n=>n.c==='story'&&/drowned chapel/.test(n.m))); });
test('Story: the first clear of each gate tells its part, once',()=>{
  const P=S.player; P.stats.strength=400; P.hp=pMax(); startRun(0); S.run.room=3; S.run.enemies=[foe({hp:1})]; S.run.target=S.run.enemies[0].id; fix(.5); act('strike');
  ok(S.story.g0); ok(S.run.events.some(e=>e.c==='story'&&/Rat King/.test(e.m))); returnTown(); const n=Object.keys(S.story).length;
  S.watches=3; startRun(0); S.run.room=3; S.run.enemies=[foe({hp:1})]; S.run.target=S.run.enemies[0].id; act('strike'); eq(Object.keys(S.story).length,n); ok(!S.run.events.some(e=>e.c==='story'));
});
test('Story: Tower milestones and New Game+ have passages, and they survive saves and New Game+',()=>{
  setLvl(60); S.tower.best=49; startTower(41); S.run.tw=50; S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); ok(S.story.t25&&S.story.t50); ok(!S.story.t75); returnTown();
  save(); S=null; loadGame(); ok(S.story.t50); S.ti={clr:{5:1}}; ok(startNGP()); ok(S.story.t50&&S.story.ngp); eq(normalizeSave({v:2,player:{lvl:1},story:{intro:3,fake:1,g0:'x'}}).story.fake,undefined);
});
test('Story: bosses speak when the fight starts and when they fall',()=>{
  Object.keys(BOSS_LINES).forEach(n=>ok(allNames().includes(n)||secretOf(n)>=0,n)); DUNGEONS.forEach(D=>ok(BOSS_LINES[D.boss[0]],D.boss[0])); TW_BOSS.forEach(n=>ok(BOSS_LINES[n],n));
  setLvl(5); startRun(0); S.run.room=3; spawnRoom(); ok(S.run.log.some(l=>l.c==='boss'&&/Kneel/.test(l.m))); const b=S.run.enemies[0]; b.hp=0; checkDeaths(); ok(S.run.log.some(l=>l.c==='boss'&&/vats/.test(l.m)));
});
test('Story: the Lore page lists what you have read, by act',()=>{ S.story.g0=2; ui.tab='lore'; const h=renderAll('lore'); ok(/Act I &middot; The name &middot; 2\/\d+/.test(h)); ok(/The Rat King/.test(h)); ui.tab='hist'; ok(/Lore page/.test(renderAll('hist'))); });

})();
