// Play-Test Fixes tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Play-test: Call the Swarm never adds a second enemy mender (bug found in play-testing)',()=>{
  const b=bossFight(0); const m=foe({role:'mender',name:'Marrow Mite',base:'Marrow Mite'}); S.run.enemies.push(m); seed(7);
  for(let i=0;i<40;i++){ b.summoned=0; S.run.enemies=S.run.enemies.filter(e=>e===b||e===m); summonAdd(b); ok(S.run.enemies.filter(e=>e.role==='mender'&&e.hp>0).length<=1,'try '+i); }
});
test('Play-test: notes clear when a run starts, and titles earned together make one note and a banner',()=>{
  notify('old news'); S.watches=3; startRun(0); eq(S.notices.length,0,'old notes gone'); flee();
  S.notices=[]; MOMENTS.length=0; S.ti=S.ti||{}; S.ti.raised=1; S.ti.deaths=1; checkTitles(); const n=S.notices.filter(x=>/title/i.test(x.m)); eq(n.length,1,'one note'); ok(/2 titles earned|titles earned/.test(n[0].m)); ok(MOMENTS.some(x=>/titles earned/.test(x.t)));
});
test('Play-test: on phones the point buttons sit at the top while points wait; wording fixes',()=>{
  S.player.pts=2; let h=renderAll('strip'); ok(/class="spend-strip"/.test(h)&&/data-a="alloc" data-k="will"[^>]*>\+ Will/.test(h)); S.player.pts=0; S.player.sp=1; ok(/1 skill point: open Skills/.test(renderAll('sp'))); S.player.sp=0; ok(!/spend-strip/.test(renderAll('none')));
  const m=mkMinion({role:'mender'}); m.hp=1; arena([foe({hp:1e6,atk:1})]); fix(.5); act('strike'); ok(S.run.log.some(l=>/mends itself/.test(l.m)),'mends itself');
  flee(); raiseScene([corpse({elite:true,aff:['warded','vampiric']})],5); S.run.lastXp=0; h=renderAll('raise'); ok(/keeps Warded/.test(h)&&/Vampiric &rarr; Leeching/.test(h)); ok(/Room 1 cleared/.test(h));
  ui.tab='gates'; S.mode='town'; S.run=null; ok(/aria-label="(Hide|Show) Daily quest"/.test(renderAll('fold labels')));
});
test('Requests: the daily quest sits at the top of the side panel, and a new game opens on How to play',()=>{
  const h=renderAll('rail'); const r=h.slice(h.indexOf('class="rail"')); ok(r.indexOf('h-quest')>-1&&r.indexOf('h-quest')<r.indexOf('h-status'),'quest above status');
  newGame(); ok(OPEN_HELP.on,'a new game asks for the guide'); OPEN_HELP.on=false; ui.confirm='new'; ACTIONS.newgame(); eq(ui.tab,'help'); ok(/Begin: to the gates/.test(renderAll('guide')));
});
test('Requests: bounties ask for more',()=>{ eq(BOUNTIES.kills.n,50); eq(BOUNTIES.elites.n,4); eq(BOUNTIES.rooms.n,12); eq(BOUNTIES.bosses.n,3); eq(BOUNTIES.poison.n,30); });
})();
