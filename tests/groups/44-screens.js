// Screens tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Screens: the Ledger tab holds the Codex, Bestiary, History and How to play, and remembers the last page',()=>{
  ui.tab='gates'; let h=renderAll('tabs'); ok(!/data-k="bes"/.test(h)&&!/data-k="hist"/.test(h),'old tabs folded in');
  ACTIONS.tab('ledger'); eq(ui.tab,'codex','opens on the Codex'); h=renderAll('ledger'); ok(/data-k="ledger" aria-keyshortcuts="[0-9]" aria-selected="true"/.test(h)); LEDGER.forEach(x=>ok(new RegExp('data-a="tab" data-k="'+x[0]+'"').test(h),x[0]));
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

test('Screens: the army list has a Compact view, one row per minion with the same actions, remembered in VIEW',()=>{
  S.mode='town'; S.army=[]; const a=mkMinion({lvl:5}), b=mkMinion({lvl:6}), c=mkMinion({lvl:7}); b.hp=Math.floor(b.maxHp*.2);
  let h=armyHTML(); eq(VIEW.army,'cards'); ok(/class="minion"/.test(h)&&!/class="mrow"/.test(h),'cards by default'); ok(/data-k="army\|compact" aria-pressed="false"/.test(h));
  ACTIONS.view('army|compact'); eq(VIEW.army,'compact'); eq(JSON.parse(localStorage.getItem('lotd-view')).army,'compact','saved');
  h=armyHTML(); eq((h.match(/class="mrow"/g)||[]).length,3,'one row each'); ok(!/class="minion"/.test(h)); eq((h.match(/data-a="release"/g)||[]).length,3); eq((h.match(/data-a="mdet"/g)||[]).length,3); eq((h.match(/data-a="renameo"/g)||[]).length,3);
  ok(/class="mr-hp low"/.test(h),'low HP marked'); ok(h.includes('Lv '+c.lvl+' &middot; ATK '+c.atk)); ok(!/data-a="(fuse|releaseall|bulk)/.test(h),'no bulk action');
  ui.confirm=a.uid; ok(/Confirm release/.test(armyHTML()),'release keeps its two presses'); ui.confirm=null;
  ui.mdet=b.uid; h=armyHTML(); eq((h.match(/class="minion"/g)||[]).length,1,'Details expands that row'); eq((h.match(/class="mrow"/g)||[]).length,2); ui.mdet=null;
  ui.rename=c.uid; ok(/id="rn"/.test(armyHTML()),'Rename expands that row'); ui.rename=null;
  ACTIONS.view('army|nonsense'); eq(VIEW.army,'compact'); ACTIONS.view('army|cards'); eq(VIEW.army,'cards'); S.army=[];
});

test('Screens: on phones the pinned action bar carries a thin HP tick per minion, none without an army',()=>{
  S.army=[]; arena([foe()]); let h=renderAll('no army'); ok(/class="actbar"/.test(h),'battle bar'); ok(!/class="pstrip"/.test(h),'absent with no army');
  const a=mkMinion({lvl:5}), b=mkMinion({lvl:5}), c=mkMinion({lvl:5}); b.hp=Math.floor(b.maxHp*.2); c.hp=0; h=renderAll('party strip');
  ok(/class="actbar"><div class="pstrip"/.test(h),'inside the pinned bar, above the buttons'); eq((h.match(/class="pt[ "]/g)||[]).length,3);
  ok(h.includes('title="'+a.nick+': '+a.hp+'/'+a.maxHp+'"'),'title'); ok(/class="pt low"/.test(h),'low'); c.hp=0; h=partyStrip(); ok(/class="pt down"/.test(h),'fallen dimmed'); ok(h.includes('aria-label="'+c.nick+': down"'),'down label');
  S.army=[];
});

})();
