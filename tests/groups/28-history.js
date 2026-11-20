// History tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('History: every way out of a run is recorded with its numbers',()=>{
  arena([foe({hp:1})]); fix(.5); act('strike'); returnTown(); let h=S.hist[S.hist.length-1]; eq(h.res,'left'); eq(h.rooms,1); eq(h.kills,1); ok(h.xp>0&&h.gold>0); eq(h.g,0);
  arena([foe()]); flee(); eq(S.hist[S.hist.length-1].res,'fled');
  arena([foe({atk:1e6})]); S.player.hp=1; act('strike'); returnTown(); eq(S.hist[S.hist.length-1].res,'fell');
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); S.watches=3; startRun(0); let n=0; while(n++<300&&!(S.mode==='raise'&&S.run.cleared)){ if(S.mode==='battle') act('strike'); else descend(); } returnTown();
  h=S.hist[S.hist.length-1]; eq(h.res,'cleared'); eq(h.rooms,4);
  const L=S.life; eq(L.runs,4); eq(L.clears,1); eq(L.deaths,1); eq(L.fled,1); eq(L.rooms,5); ok(L.kills>=5); eq(L.gold,S.hist.reduce((a,x)=>a+x.gold,0));
});
test('History: Tower runs record their floors; only the last 20 runs are kept',()=>{
  setLvl(30); S.tower.best=20; startTower(11); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); descend(); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); returnTown();
  const h=S.hist[0]; eq(h.g,-1); eq(h.f0,11); eq(h.f1,12); eq(h.rooms,2);
  for(let i=0;i<30;i++){ S.watches=3; startRun(0); flee(); } eq(S.hist.length,HIST_N); eq(S.life.runs,31);
});
test('History: closing the tab mid-run records it in the save, not twice',()=>{
  startRun(0); const snap=snapshot(); eq(snap.hist.length,1); eq(snap.life.runs,1); eq(S.hist.length,0,'live game untouched');
  save(); S=null; loadGame(); eq(S.hist.length,1); eq(S.life.runs,1);
});
test('History: lifetime totals survive New Game+, damaged history is cleaned',()=>{
  S.life.runs=50; S.ti={clr:{5:1}}; ok(startNGP()); eq(S.life.runs,50); eq(S.hist.length,0);
  const g=normalizeSave({v:2,player:{lvl:2},hist:[{d:1,res:'left'},null,'x',{d:'a'}],life:{runs:'x',kills:5,bogus:9}}); eq(g.hist.length,1); eq(g.life.runs,0); eq(g.life.kills,5); eq(g.life.bogus,undefined);
});
test('History: the History tab renders',()=>{ ui.tab='hist'; ok(/No runs yet/.test(renderAll('empty history'))); richState(); ui.tab='hist'; const h=renderAll('full history'); ok(/Hell Tower, floor/.test(h)&&/Drought/.test(h)); });

test('History: a run keeps its turns, boss, best minion, level, damage, omen and curse; old runs render without them',()=>{
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); mkMinion({nick:'Gnaw',lvl:7,hf:40}); S.omen={day:S.day,id:'paletide'}; S.watches=3; startRun(0); let n=0;
  while(n++<300&&!(S.mode==='raise'&&S.run.cleared)){ if(S.mode==='battle') act('strike'); else descend(); } const tt=S.run.tt; returnTown();
  const h=S.hist[S.hist.length-1]; eq(h.res,'cleared'); eq(h.tt,tt); ok(h.tt>0); ok(h.bo[0].includes(DUNGEONS[0].boss[0]),h.bo[0]); eq(h.bo[1],1,'the boss fell'); eq(h.mvp[0],'Gnaw'); eq(h.lv,P.lvl); ok(h.dd>0&&h.mh>0&&h.mh<=h.dd); eq(h.om,'paletide');
  const L=S.life; eq(L.wn,1); eq(L.wt,1); eq(L.stk,1); eq(L.cn,1); eq(L.ct,tt);
  arena([foe()]); flee(); eq(S.life.stk,0,'a flight breaks the streak'); eq(S.life.wt,2);
  S.hist.push({d:1,g:1,f0:0,f1:0,rooms:2,kills:3,xp:5,gold:6,items:0,raised:0,mod:'drought',res:'left'}); S.life.souls=4;
  ui.tab='hist'; const html=renderAll('history details'); ok(html.includes('Lifetime analytics')&&html.includes('Win rate')&&html.includes('Souls harvested')&&html.includes('h-det'));
  ok(html.includes('Favorite gate')&&html.includes(DUNGEONS[0].name)); eq(trText('Lifetime analytics')!=='Lifetime analytics',true);
  const g=normalizeSave({v:2,player:{lvl:2},hist:[{d:1,res:'left',bo:'x',mvp:[3],om:5,tt:-1,dd:'a'},{d:2,res:'cleared',bo:['Rat King',1],tt:9}]}); eq(g.hist.length,2);
  ok(!('bo' in g.hist[0])&&!('mvp' in g.hist[0])&&!('om' in g.hist[0])&&!('tt' in g.hist[0])&&!('dd' in g.hist[0]),'damaged details dropped'); eq(g.hist[1].tt,9); eq(g.hist[1].bo[0],'Rat King');
  const old=normalizeSave({v:2,player:{lvl:2},life:{runs:5,clears:2}}); eq(old.life.wn,0); eq(old.life.souls,0);
});
test('History: souls harvested and a boss left standing are written down',()=>{
  setLvl(20); const b=foe({boss:true,hp:1e6}); arena([b]); S.run.souls=0; gainSoul(); gainSoul(); flee(); const h=S.hist[S.hist.length-1]; eq(h.bo[1],0,'still standing'); eq(S.life.souls,2);
});

})();
