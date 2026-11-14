// Ui tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('UI: every town tab renders without blank values',()=>{ for(const t of TABS){ ui.tab=t; renderAll('fresh game, '+t+' tab'); } richState(); for(const t of TABS){ ui.tab=t; renderAll('late game, '+t+' tab'); } });
test('UI: every bestiary entry opens without blank values',()=>{ richState(); ui.tab='bes'; allNames().forEach(n=>{ ui.bes=n; renderAll('bestiary: '+n); }); fresh(); ui.tab='bes'; ui.bes='Tunnel Rat'; renderAll('unstudied bestiary'); });
test('UI: battle, raise and defeat screens render in gates and the Tower',()=>{
  richState(); startRun(5); renderAll('gate battle'); const b=makeEnemy(5,30,true); b.charging=true; b.shield=50; b.stun=1; b.curse={mul:1.5,t:2}; S.run.enemies.push(b); S.run.frenzy=2; S.run.frenzyMul=1.4; S.run.silence=2; S.run.cd={spear:2}; renderAll('busy gate battle');
  S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); eq(S.mode,'raise'); renderAll('raise screen'); fix(0); S.player.mana=999; S.army=[]; S.run.corpses.slice(0,2).forEach(c=>tryRaise(c.id)); renderAll('raise screen after raising');
  S.mode='defeat'; renderAll('defeat screen'); returnTown();
  S.watches=3; startTower(91); renderAll('tower battle'); ok(document.body.classList.contains('hell'),'hell backdrop in the Tower');
  flee(); ui.tab='gates'; renderAll('back in town'); ok(!document.body.classList.contains('hell')); ui.tab='tower'; renderAll('tower tab'); ok(document.body.classList.contains('hell'));
});
test('UI: every button on every screen has a handler',()=>{
  const seen=new Set(); const grab=h=>{ for(const m of h.matchAll(/data-a="([^"]+)"/g)) seen.add(m[1]); };
  richState(); TABS.forEach(t=>{ ui.tab=t; grab(renderAll(t)); }); ui.tab='market'; ui.confirm='new'; grab(renderAll()); ui.exp=exportCode(); ui.tab='settings'; grab(renderAll());
  startRun(5); grab(renderAll()); S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); grab(renderAll()); S.mode='defeat'; grab(renderAll());
  const miss=[...seen].filter(a=>!ACTIONS[a]); eq(miss.join(),'','buttons without a handler'); ok(seen.size>25,'found '+seen.size+' kinds of buttons');
});
test('UI: settings open only in town',()=>{ ACTIONS.settings(); eq(ui.tab,'settings'); ACTIONS.settings(); eq(ui.tab,'gates'); arena([foe()]); ACTIONS.settings(); eq(ui.tab,'gates'); ok(/gearbtn[^>]*disabled/.test(renderAll())); });
test('UI: risky buttons ask twice',()=>{
  S.day=5; ACTIONS.newgame(); eq(S.day,5); ACTIONS.newgame(); eq(S.day,1);
  const a=give('0-wa'); ACTIONS.discard(String(a.u)); eq(S.inv.length,1); ACTIONS.discard(String(a.u)); eq(S.inv.length,0);
  const b=give('1-wa'); ACTIONS.sellitem(String(b.u)); eq(S.gold,0); ACTIONS.sellitem(String(b.u)); eq(S.gold,20);
  const m=mkMinion({}); ACTIONS.release(String(m.uid)); eq(S.army.length,1); ACTIONS.release(String(m.uid)); eq(S.army.length,0);
  S.player.skills={}; setLvl(5); S.player.sp=1; ACTIONS.learn('spear'); eq(sk('spear'),1); ACTIONS.skreset(); eq(sk('spear'),1); ACTIONS.skreset(); eq(sk('spear'),0);
});
test('UI: save slot and save code buttons work end to end',()=>{
  S.gold=77; ACTIONS.slotsave('2'); ok(slotRead(2)); eq(ui.msg.c,'ok'); S.gold=1; ACTIONS.slotsave('2'); eq(slotRead(2).data.gold,77,'overwrite asks first'); ACTIONS.slotsave('2'); eq(slotRead(2).data.gold,1);
  S.gold=50; ACTIONS.slotload('2'); eq(S.gold,50); ACTIONS.slotload('2'); eq(S.gold,1); ACTIONS.slotdel('2'); ACTIONS.slotdel('2'); eq(slotRead(2),null);
  S.gold=999; ACTIONS.mkcode(); ok(ui.exp.startsWith(CODE_TAG)); S.gold=0; ui.imp=ui.exp; ACTIONS.loadcode(); ACTIONS.loadcode(); eq(S.gold,999); eq(ui.msg.c,'ok');
  ui.imp='nonsense'; ACTIONS.loadcode(); ACTIONS.loadcode(); eq(ui.msg.c,'bad'); eq(S.gold,999);
});
test('UI: market buttons report what happened',()=>{
  S.gold=1e5; S.trophies={'Tunnel Rat':10}; const m=mkMinion({}); setLvl(5);
  ACTIONS.buypot('hp'); ok(/Healing/.test(ui.msg.m)); ACTIONS.buyitem('0'); ok(/Bought/.test(ui.msg.m)); ACTIONS.selltro('Tunnel Rat'); ok(/Sold/.test(ui.msg.m)); ACTIONS.selltroall('Tunnel Rat'); ok(/Sold 9/.test(ui.msg.m));
  ACTIONS.buysalt(); ok(/Salts/.test(ui.msg.m)); ACTIONS.buybag(); ok(/35/.test(ui.msg.m)); ACTIONS.empower(String(m.uid)); ok(/level 2/.test(ui.msg.m));
  S.trophies={'Tunnel Rat':10}; ACTIONS.forge('0|armor'); ok(/forge/.test(ui.msg.m)); ACTIONS.brew('mp'); ok(/brew/.test(ui.msg.m)); S.trophies={}; ACTIONS.sellalltro(); eq(ui.msg,null);
  ui.tab='market'; renderAll('market after shopping');
});
test('UI: tips, titles and sound switches',()=>{
  ACTIONS.tip('stats'); ok(S.tips.stats); ACTIONS.tipsoff(); ok(S.tips.off); ACTIONS.tipson(); ok(!S.tips.off); ACTIONS.tipsreset(); eq(Object.keys(S.tips).length,0);
  S.ti={got:{g0:1},sel:null}; ACTIONS.wear('g0'); eq(S.ti.sel,'g0'); ACTIONS.wear('g0'); eq(S.ti.sel,null);
  const was=SFX.on; ACTIONS.sound(); eq(SFX.on,!was); eq(localStorage.getItem('lotd-sound'),SFX.on?'on':'off'); ACTIONS.sound(); eq(SFX.on,was);
});
test('UI: a whole run can be played through the buttons alone',()=>{
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); fix(.5); ACTIONS.enter('0'); eq(S.mode,'battle'); let n=0;
  while(n++<200&&!(S.mode==='raise'&&S.run.cleared)){ if(S.mode==='battle') ACTIONS.act('strike'); else ACTIONS.descend(); render(); }
  ok(S.run.cleared); fix(0); P.mana=999; S.run.corpses.forEach(c=>ACTIONS.raise(c.id)); ok(S.army.length>0); ACTIONS.town(); eq(S.mode,'town'); renderAll('after a full run');
});
test('UI: clicks and number keys reach the game',()=>{
  if(!NODE) return; const click=(a,k,dis)=>window.__listeners.click[0]({target:{closest:()=>({dataset:{a,k},disabled:!!dis})}});
  click('tab','market'); eq(ui.tab,'market'); ok(/Market/i.test(app.innerHTML)); click('tab','gear',true); eq(ui.tab,'market','disabled buttons do nothing');
  ui.confirm='new'; click('tab','gates'); eq(ui.confirm,null,'another click cancels a pending confirm');
  arena([foe({hp:1e6})]); fix(.5); window.__listeners.keydown[0]({key:'1',preventDefault(){}}); eq(S.run.turn,2); S.player.skills.spear=1; S.player.mana=99; window.__listeners.keydown[0]({key:'4',preventDefault(){}}); ok(skCd('spear')>0,'key 4 = first skill');
});

})();
