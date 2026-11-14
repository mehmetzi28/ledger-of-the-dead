// Screens tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Screens: the Ledger tab holds the Codex, Bestiary, History and How to play, and remembers the last page',()=>{
  ui.tab='gates'; let h=renderAll('tabs'); ok(!/data-k="bes"/.test(h)&&!/data-k="hist"/.test(h),'old tabs folded in');
  ACTIONS.tab('ledger'); eq(ui.tab,'codex','opens on the Codex'); h=renderAll('ledger'); ok(/data-k="ledger" aria-selected="true"/.test(h)); LEDGER.forEach(x=>ok(new RegExp('data-a="tab" data-k="'+x[0]+'"').test(h),x[0]));
  ACTIONS.tab('hist'); renderAll('hist'); ACTIONS.tab('gates'); ACTIONS.tab('ledger'); eq(ui.tab,'hist','back to the last page');
});
test('Screens: the Market is split into Buy, Forge, Altar and bag, and Sell',()=>{
  S.gold=1e4; S.trophies={'Tunnel Rat':8}; mkMinion({}); give('0-wa'); ui.tab='market';
  const page=k=>{ ACTIONS.mk(k); return renderAll('market '+k); };
  let h=page('buy'); ok(/data-a="buypot"/.test(h)&&/data-a="buysalt"/.test(h)&&!/data-a="forge"/.test(h)&&!/data-a="sellitem"/.test(h));
  h=page('forge'); ok(/data-a="forge"/.test(h)&&/data-a="brew"/.test(h)&&!/data-a="buypot"/.test(h));
  h=page('altar'); ok(/data-a="empower"/.test(h)&&/data-a="buybag"/.test(h));
  h=page('sell'); ok(/data-a="selltro"/.test(h)&&/data-a="sellitem"/.test(h)); ui.mk='bogus'; ok(/data-a="buypot"/.test(renderAll('fallback')));
});
test('Screens: side panel windows fold to one line with a summary, remembered per browser',()=>{
  const keep=JSON.stringify(VIEW.fold);
  try{ VIEW.fold={}; let h=renderAll('open'); ok(!/class="win folded"/.test(h)); ACTIONS.fold('quest'); h=renderAll('folded'); ok(/class="win folded" aria-labelledby="h-quest"/.test(h)&&/fold-sum">0\/3/.test(h));
    eq(JSON.parse(localStorage.getItem('lotd-view')).fold.quest,true); ACTIONS.fold('quest'); ok(!VIEW.fold.quest); ACTIONS.fold('nope'); eq(VIEW.fold.nope,undefined); }
  finally{ VIEW.fold=JSON.parse(keep); saveView(); }
});
test('Screens: a battle carries a pinned HP and mana bar for phones',()=>{ arena([foe()]); const h=renderAll('mini'); ok(/class="mini-hp"/.test(h)&&new RegExp('HP '+S.player.hp+'/'+pMax()).test(h)); });

})();
