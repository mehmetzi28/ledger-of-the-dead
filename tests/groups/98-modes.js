// Modes, R15 PR A (src/game-modes.js): Ironman and custom difficulty.
(function(){
const {test,ok,eq,near,fix,fresh,setLvl,foe,arena,mkMinion,give,renderAll,cdx,invariants}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
test('Ironman: chosen at New game; no Retry and no slots; a fall costs the run\'s spoils and one of the fallen',()=>{
  newGameMode('iron'); ok(S.iron); eq(S.ironDeaths,0); ok(!S.custom); setLvl(10); S.gold=500;
  const a=mkMinion({lvl:10}), b=mkMinion({lvl:10}), c=mkMinion({lvl:10}); const r=arena([foe({hp:1e6})]); const it=give('0-wa'); r.spoils=[it.u]; r.goldTot=120; r.trTot={'Tunnel Rat':2}; S.trophies['Tunnel Rat']=5;
  a.hp=0; b.hp=0; S.player.hp=0; defeat(); eq(S.mode,'defeat'); ok(!canRetry(),'no Retry'); eq(S.ironDeaths,1);
  eq(S.gold,380,'the run\'s gold'); eq(S.trophies['Tunnel Rat'],3,'its trophies'); ok(!S.inv.includes(it),'its gear'); eq(S.army.length,2,'one of the fallen shatters'); ok(S.army.includes(c),'never one that stood');
  ok((S.memorial||[]).some(x=>x.nick===a.nick||x.nick===b.nick),'remembered'); returnTown(); S.mode='town'; ok(!slotWrite(1),'no save slots'); ui.tab='settings'; ok(/cannot be saved to a slot/.test(renderAll('iron settings')));
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); ok(g.iron); eq(g.ironDeaths,1); fresh(5); const n=normalizeSave(JSON.parse(JSON.stringify(S))); ok(!('iron' in n)&&!('custom' in n),'a normal save has neither');
  S.iron=true; S.ti=S.ti||{}; S.ti.clr={5:1}; S.mode='town'; ok(startNGP(null,[]),'New Game+'); ok(S.iron,'Ironman carries into New Game+'); invariants('iron');
});
test('Ironman: a fall in a normal game is unchanged; the weekly dive and sieges never cost Ironman spoils',()=>{
  fresh(10); S.gold=500; const a=mkMinion({lvl:10}); const r=arena([foe({hp:1e6})]); r.goldTot=120; a.hp=0; S.player.hp=0; defeat(); eq(S.gold,500); ok(S.army.includes(a));
  newGameMode('iron'); setLvl(10); S.gold=500; const r2=arena([foe({hp:1e6})]); r2.goldTot=120; r2.wk=1; ironFall(r2); eq(S.gold,500,'not in the weekly dive'); eq(S.ironDeaths|0,0);
});
test('Custom difficulty: foe HP and attack, raise, gold and siege frequency; easing marks the save and stops titles; Hardened keeps them',()=>{
  fresh(10); const r0=arena([foe({hp:100,atk:10})]); const L0=[foe({hp:100})]; L0[0].maxHp=L0[0].hp=100; L0[0].atk=10; foeScale(L0,1); eq(L0[0].maxHp,100);
  newGameMode('story'); eq(JSON.stringify(S.custom),JSON.stringify({foeHp:60,foeAtk:60,raise:130,gold:100,siege:100})); ok(custEasy());
  const L=[foe({})]; L[0].maxHp=L[0].hp=100; L[0].atk=10; foeScale(L,1); eq(L[0].maxHp,60); eq(L[0].atk,6);
  setLvl(10); const cs={lvl:10,rankI:0,name:'Tunnel Rat',base:'Tunnel Rat',role:'striker'}; S.custom.raise=100; const rc0=raiseChance(cs); S.custom.raise=130; ok(raiseChance(cs)>=Math.min(RAISE_MAX,Math.round(rc0*1.3))-1,'raise x1.3');
  S.custom.gold=200; const r=arena([foe({hp:1})]); r.gold=50; const g0=S.gold; bankLoot(r); eq(S.gold-g0,100,'gold x2');
  S.ti=S.ti||{}; S.ti.got={}; S.ti.clr={0:1}; checkTitles(); eq(Object.keys(S.ti.got).length,0,'no titles on a Custom save');
  newGameMode('hardened'); ok(!custEasy(),'Hardened eases nothing'); S.ti=S.ti||{}; S.ti.clr={0:1}; checkTitles(); ok(S.ti.got.g0,'titles as usual');
  newGameMode('custom',{foeHp:100,foeAtk:100,raise:100,gold:100,siege:0}); ok(custEasy()); S.build={crypt:1,forge:1}; setLvl(10); ok(!siegeOpen(),'sieges off');
  newGameMode('custom',{foeHp:100,foeAtk:100,raise:100,gold:100,siege:50}); S.build={crypt:1,forge:1}; setLvl(10); ok(siegeOpen()); const gp=siegeGap(); S.custom.siege=100; const gn=siegeGap(); near(gp,gn*2,1,'half as often');
  newGameMode('custom',{foeHp:100,foeAtk:100,raise:100,gold:100,siege:100}); ok(!S.custom,'all at 100 is a normal game');
  const bad=JSON.parse(JSON.stringify(S)); bad.custom={foeHp:999,foeAtk:'x',raise:12,gold:105,siege:30}; const n=normalizeSave(bad); eq(JSON.stringify(n.custom),JSON.stringify({foeHp:200,foeAtk:100,raise:50,gold:110,siege:50}),'clamped to the steps');
  invariants('custom');
});
test('New game modes on screen: the mode cards, the steps, the save list and the Codex; every line has Turkish',()=>{
  fresh(5); ui.tab='settings'; ui.confirm=null; ACTIONS.newgame(); let h=renderAll('chooser'); ok(/data-a="ngmode" data-k="iron"/.test(h)&&/data-a="ngmode" data-k="custom"/.test(h),'the cards');
  ACTIONS.ngmode('custom'); ACTIONS.ngstep('foeHp|1'); ACTIONS.ngstep('siege|-1'); for(let i=0;i<6;i++) ACTIONS.ngstep('siege|-1'); eq(ngPick().c.foeHp,110); eq(ngPick().c.siege,0,'siege steps down to off');
  ACTIONS.ngstep('siege|1'); eq(ngPick().c.siege,50,'and back up to 50%'); ACTIONS.ngstep('raise|1'); h=renderAll('custom'); ok(/will earn no titles/.test(h));
  ACTIONS.newgame(); eq(S.custom.foeHp,110); eq(S.custom.raise,110); eq(S.day,1);
  S.mode='town'; ok(slotWrite(1)); ok(/Custom/.test(renderAll('slots'))); slotDelete(1);
  ACTIONS.newgame(); ACTIONS.ngmode('iron'); ACTIONS.newgame(); ok(S.iron);
  const cx=cdx('modes'); ok(/Ironman/.test(cx)&&/Siege frequency/.test(cx)&&/Iron Keeper/.test(cx),'the Codex');
  [].concat(Object.values(NG_MODES).map(m=>m.name),Object.values(NG_MODES).map(m=>m.desc),CUSTOM_IDS.map(k=>CUSTOM_KEYS[k][3]),IRON_TITLES.map(id=>TITLE[id].name),IRON_TITLES.map(id=>TITLE[id].req)).filter(s=>s!=='Normal').forEach(s=>ok(tr(s)!==s,'Turkish: '+s));
});
})();
