// Music, Display, Save Files tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Music: a switch in Settings, remembered; picks a scene; silent without Web Audio',()=>{
  const was=MUSIC.on; ok(/^town:(calm|uneasy|afraid|terror)$/.test(musicScene())); ui.tab='tower'; ok(/^tower:\d+$/.test(musicScene())); ui.tab='gates'; arena([foe()]); eq(musicScene(),'g0'); flee(); setLvl(20); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); startTower(1); eq(musicScene(),'tower:0'); flee();
  ACTIONS.music(); eq(MUSIC.on,!was); eq(localStorage.getItem('lotd-music'),MUSIC.on?'on':'off'); music(); ACTIONS.music(); eq(MUSIC.on,was); ok(/data-a="music"/.test((ui.tab='settings',renderAll('settings'))));
});
test('Display: text size, reduced motion and high contrast apply and are remembered',()=>{
  const keep=Object.assign({},VIEW);
  try{ ACTIONS.view('size|2'); eq(VIEW.size,2); ok(document.body.classList.contains('ts2')); ACTIONS.view('size|9'); eq(VIEW.size,3,'clamped at 130%'); ok(document.body.classList.contains('ts3')); ACTIONS.view('size|0'); ok(!document.body.classList.contains('ts2')); ACTIONS.view('size|-1'); eq(VIEW.size,-1,'compact'); ok(document.body.classList.contains('compact')); ACTIONS.view('size|-5'); eq(VIEW.size,-1,'clamped low'); ui.tab='settings'; ok(/data-k="size\|-1"[^>]*aria-pressed="true">90%/.test(renderAll('compact'))); ACTIONS.view('size|0'); ok(!document.body.classList.contains('compact'));
    const c=VIEW.calm; ACTIONS.view('calm'); eq(VIEW.calm,!c); eq(document.body.classList.contains('calm'),VIEW.calm); ACTIONS.view('hc'); ok(document.body.classList.contains('hc')||!VIEW.hc);
    eq(JSON.parse(localStorage.getItem('lotd-view')).size,0); ui.tab='settings'; ok(/data-a="view" data-k="size\|1"/.test(renderAll('display'))); }
  finally{ Object.assign(VIEW,keep); saveView(); applyView(); }
});
test('Save files: a save file round-trips, plain JSON saves load too, junk is refused',()=>{
  S.gold=777; const code=exportCode(); S.gold=0; ok(importText('\n'+code+'\n')); eq(S.gold,777);
  S.gold=5; ok(importText(JSON.stringify(Object.assign(JSON.parse(JSON.stringify(S)),{gold:42})))); eq(S.gold,42);
  const cur=S; ok(!importText('hello')); ok(!importText('')); ok(!importText('{"v":9}')); ok(S===cur);
  ui.file={name:'save.txt',text:code}; S.gold=1; ACTIONS.loadfile(); eq(S.gold,1,'asks first'); ACTIONS.loadfile(); eq(S.gold,777); eq(ui.file,null);
  ui.file={name:'bad.txt',text:'nope'}; ACTIONS.loadfile(); ACTIONS.loadfile(); eq(ui.msg.c,'bad'); ACTIONS.dlsave(); ok(ui.msg); ui.tab='settings'; ok(/data-a="dlsave"/.test(renderAll('save files')));
});

})();
