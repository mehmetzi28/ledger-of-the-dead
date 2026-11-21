// Late Game, Backups, Previews tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Curses: after the Throne falls, a cursed gate\'s foes rise to five levels below you; before that, and in plain gates, they do not',()=>{
  setLvl(40); S.ti={clr:{0:1}}; S.mod={day:S.day,gi:0,id:'fury'}; S.watches=3; startRun(0); eq(curseRise(0),0,'Throne not cleared yet'); const lv0=S.run.enemies[0].lvl; flee();
  S.ti.clr[5]=1; S.mod={day:S.day,gi:0,id:'fury'}; S.watches=3; startRun(0); eq(curseRise(0),40-CURSE_GAP-RK[0].lv); ok(S.run.enemies.every(e=>e.lvl>=40-CURSE_GAP),'foes rose'); ok(S.run.enemies[0].lvl>lv0); flee();
  S.mod={day:S.day,gi:1,id:'fury'}; S.watches=3; startRun(0); eq(curseRise(0),0,'a plain gate stays as it is'); flee();
  ui.tab='gates'; S.mod={day:S.day,gi:0,id:'horde'}; ok(/&middot; Foes Lv 35</.test(renderAll('gate card')));
});
test('Tower: the climb steepens more slowly past floor 60, and the recommended level tells the truth',()=>{
  eq(twHpF(60),60); eq(twAtkF(60),60); eq(twHpF(100),88); eq(twAtkF(100),80); eq(towerStats(100,60,1,1,false,false).atk,Math.max(1,Math.round(3.2*TW.atk0*Math.pow(1+TW.atkG,79)*DIFF.atk*(1+.12*59))),'floor 100 attacks like old floor 80');
  eq(recLv(20),20); eq(recLv(60),40); eq(recLv(90),76); eq(recLv(100),88); for(let f=2;f<=200;f++) ok(recLv(f)>=recLv(f-1),'never drops at floor '+f);
  eq(towerStats(30,20,1,1,false,false).hp,Math.round(14*TW.hp0*Math.pow(1+TW.hpG,29)*DIFF.hp*(1+.16*19)),'floors up to 60 are unchanged');
});
test('Saves: the first save of each day is kept as an earlier autosave (three at most), and can be restored',()=>{
  TAB.bakDay=null; TAB.last=null; for(let i=1;i<=BAK_N;i++) localStorage.removeItem(bakKey(i));
  S.gold=1; save(); eq(bakRead(1).day,1); S.gold=2; save(); eq(bakRead(1).data.gold,1,'once per day');
  for(let d=0;d<4;d++){ endDay(); S.gold=10+d; save(); } eq(bakRead(1).day,5); eq(bakRead(3).day,3); eq(localStorage.getItem(bakKey(4)),null,'only three');
  arena([foe()]); const n=S.day; endDay(); save(); ok(bakRead(1).day!==S.day||S.mode==='town','no backup from inside a fight'); flee();
  ui.tab='settings'; let h=renderAll('settings'); ok(/Earlier autosaves/.test(h)&&/data-a="bakload" data-k="3"/.test(h)); const b3=bakRead(3).data;
  ACTIONS.bakload('3'); eq(ui.confirm,'bl3','asks first'); ACTIONS.bakload('3'); eq(S.day,b3.day); eq(S.gold,b3.gold); ok(/Restored/.test(ui.msg.m));
});
test('Stats: each + button previews what the next point gives, from the real formulas',()=>{
  const P=S.player; P.pts=3; const h=renderAll('preview'); const a=pAtk(), m=pMax();
  ok(/Next point: Strike \+[23], crit \+0.5%/.test(h)); ok(/minion attack \+1.3%/.test(h),'Strength: minion attack'); ok(/Next point: Max HP \+5, damage taken -0.25%, healing received \+1.5%/.test(h)); ok(/Ward \+3, skill damage \+2%, minion attack \+1.2%/.test(h)); ok(/raise \+1.1%/.test(h),'Will follows RAISE_WILL');
  P.stats.strength=4; ok(!/armor pierce/.test(statGain('strength')),'4 to 5: no new piercing'); P.stats.strength=5; ok(/armor pierce \+1%/.test(statGain('strength')),'5 to 6: +1% piercing'); P.stats.strength=4;
  eq(trText('Next point: Strike +2, crit +0.5%, armor pierce +1%'),'Sonraki puan: Vuruş +2, kritik +%0.5, zırh delme +%1'); eq(trText('Next point: Max HP +5, damage taken -0.25%, healing received +1.5%'),'Sonraki puan: Azami Can +5, alınan hasar -%0.25, alınan iyileşme +%1.5'); eq(trText('minion attack +1.3%'),'hizmetkâr saldırısı +%1.3');
  eq(trText('Next point: Mana +6, Siphon +3, Ward +3, skill damage +1%'),'Sonraki puan: Mana +6, Emme +3, Kalkan +3, yetenek hasarı +%1'); eq(trText('Next point: Mana +3, Slots +1, raise +1.1%, minions +2%'),'Sonraki puan: Mana +3, Ordu yeri +1, diriltme +%1.1, hizmetkârlar +%2');
  eq(pAtk(),a,'previewing changes nothing'); eq(pMax(),m);
  P.pts=0; ok(!/Next point/.test(renderAll('no points')));
});
test('Accessibility: an item\'s gate set is spelled out for screen readers',()=>{ ok(/class="sr"> &middot; gate B set/.test(itemCard(give('3-wa'),''))); ok(!/class="sr"/.test(itemCard(give('u0'),''))); });
test('Titles: gate-farming titles ask for fewer clears, and Keeper of the Ledger leaves the wardens out',()=>{
  eq(TITLE.m0.req,'Clear the Rat Warren 10 times.'); S.ti={clrN0:10}; ok(TITLE.m0.ok()); eq(TITLE.m5.req,'Clear the Throne of Ash 25 times.');
  allNames().forEach(n=>{ if(!TW_BOSS.includes(n)) S.kills[n]=KNOW_AT; }); ok(TITLE.d_all.ok(),'no warden kills needed');
});

})();
