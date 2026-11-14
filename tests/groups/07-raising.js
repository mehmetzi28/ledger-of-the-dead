// Raising tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Raising: chance rises with Will and level, falls for rank, elites and bosses, clamped 1-85',()=>{
  const c=corpse({lvl:1}); const base=raiseChance(c); eq(base,Math.round(RAISE_BASE+4*RAISE_WILL)); eq(RAISE_MIN,1); eq(RAISE_MAX,85); eq(SALT_CAP,95);
  S.player.stats.will=10; ok(raiseChance(c)>base); S.player.stats.will=4;
  ok(raiseChance(corpse({elite:true}))<base); ok(raiseChance(corpse({boss:true}))<raiseChance(corpse({elite:true})));
  eq(raiseChance(corpse({lvl:99})),1); S.player.lvl=99; eq(raiseChance(c),85); S.player.lvl=1;
  S.player.skills.mastery=2; eq(raiseChance(c),base+8);
});
test('Raising: a success adds a named minion with a trait (bosses two)',()=>{
  const c=corpse(), b=corpse({boss:true,name:'The Rat King',base:'The Rat King',role:'reaper'}); const r=raiseScene([c,b],5); fix(0); const P=S.player; P.mana=100;
  tryRaise(c.id); eq(S.army.length,1); eq(P.mana,100-raiseCost(c)); eq(c.result,'raised'); ok(c.tried); eq(S.army[0].traits.length,1); eq(S.army[0].hp,S.army[0].maxHp); eq(S.ti.raised,1); eq(r.raised,1);
  tryRaise(b.id); eq(S.army[1].traits.filter(t=>t!=='commander').length,2); ok(S.army[1].traits[0]!==S.army[1].traits[1]); ok(S.army[0].nick!==S.army[1].nick,'unique names');
  tryRaise(c.id); eq(S.army.length,2,'a body can only be tried once');
});
test('Raising: a failure still spends the mana',()=>{ const c=corpse(); raiseScene([c]); fix(.999); S.player.mana=50; tryRaise(c.id); eq(S.army.length,0); eq(c.result,'failed'); eq(S.player.mana,50-raiseCost(c)); });
test('Raising: blocked when the army is full or mana is short',()=>{
  const c=corpse(); raiseScene([c]); fix(0); S.player.mana=0; tryRaise(c.id); ok(!c.tried); ok(/mana/.test(S.run.events[0].m));
  S.player.mana=100; while(S.army.length<slots()) mkMinion({}); tryRaise(c.id); ok(!c.tried); ok(/full/.test(S.run.events[0].m)); eq(S.player.mana,100);
});
test('Raising: Grave Salts add 20% (up to 95%) and are used up',()=>{
  const c=corpse(); raiseScene([c]); S.salts=2; S.player.mana=100; eq(saltChance(c),raiseChance(c)+SALT_BONUS); eq(saltChance(corpse({lvl:-99})),95);
  fix((raiseChance(c)+5)/100); tryRaise(c.id,true); eq(S.army.length,1,'salt turned a miss into a raise'); eq(S.salts,1);
});
test('Raising: gear-bearers rise with three empty gear slots',()=>{ const c=corpse({armed:true,name:'Warren Bandit',base:'Warren Bandit'}); raiseScene([c]); fix(0); S.player.mana=99; tryRaise(c.id); const m=S.army[0]; ok(m.armed); eq(Object.keys(m.eq).join(),'weapon,armor,relic'); eq(S.ti.armed,1); });
test('Raising: cost depends on rank and boss',()=>{ eq(raiseCost(corpse()),8); eq(raiseCost(corpse({rankI:2})),14); eq(raiseCost(corpse({boss:true})),12); });
test('Raising: only possible on the raise screen',()=>{ const c=corpse(); arena([foe()]); S.run.corpses=[c]; S.player.mana=99; fix(0); tryRaise(c.id); eq(S.army.length,0); });

test('Raising: "Raise the best" tries bodies most valuable first, salts the boss, and stops when the army is full',()=>{
  const low=corpse({lvl:1}), boss=corpse({boss:true,name:'The Rat King',base:'The Rat King',role:'reaper',lvl:3}), el=corpse({elite:true,lvl:2});
  raiseScene([low,boss,el],20); S.player.mana=999; S.salts=2; S.player.stats.will=4; const cap=slots(); fix(0);
  ui.tab='gates'; S.run.lastXp=0; ok(/data-a="raisebest"/.test(renderAll('raise'))); 
  const n=raiseBest(); ok(n>=1); ok(boss.tried&&boss.result==='raised','the boss first'); eq(S.salts,cap>=2?0:1,'salts on the boss and elite');
  ok(S.army.length<=cap); if(cap<3) ok(!low.tried,'stops when full');
});
test('Raising: a full army offers to release its weakest minion right on the raise screen',()=>{
  setLvl(1); const strong=mkMinion({lvl:5}), weak=mkMinion({lvl:1}); while(S.army.length<slots()) mkMinion({lvl:3});
  raiseScene([corpse({})],1); S.run.lastXp=0; S.player.lvl=1; let h=renderAll('full'); ok(new RegExp('data-a="release" data-k="'+weak.uid+'"[^>]*>Release your weakest, '+weak.nick).test(h));
  ACTIONS.release(String(weak.uid)); ok(/Confirm: release/.test(renderAll('confirm'))); ACTIONS.release(String(weak.uid)); ok(!S.army.includes(weak)); ok(S.army.includes(strong));
});
})();
