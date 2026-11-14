// Combat tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Combat: Strike hits through armor, gives mana and ends the turn',()=>{
  const t=foe({hp:10000}); arena([t]); fix(.5); const P=S.player; P.mana=0;
  const d=H(pAtk()*dmgMul()); act('strike'); eq(t.hp,10000-d); eq(d,7); eq(P.mana,4,'+3 strike, +1 per turn'); eq(S.run.turn,2); eq(P.hp,pMax()-1,'the foe hits back for 1');
});
test('Combat: Soul Siphon needs 8 mana, drains and heals',()=>{
  const t=foe({hp:10000}); arena([t]); fix(.5); const P=S.player;
  P.mana=7; act('siphon'); eq(S.run.turn,1,'no turn spent'); eq(P.mana,7);
  P.mana=20; P.hp=10; const d=H(pSiph()*pierceMul(SIPHON_PIERCE)); act('siphon'); eq(t.hp,10000-d); eq(S.run.souls,1,'a Soul'); eq(P.hp,10+Math.round(d*.35)-1); eq(P.mana,20-8+1);
});
test('Combat: Bone Ward shields you (capped at 60% max HP) and soaks hits first',()=>{
  arena([foe({atk:1})]); fix(.5); const P=S.player; P.mana=20; act('ward'); eq(P.shield,Math.min(Math.round(pMax()*.6),pWard())-1); eq(P.hp,pMax());
  P.mana=60; for(let i=0;i<5;i++) act('ward'); ok(P.shield<=Math.round(pMax()*.6));
  P.mana=5; const s=P.shield; act('ward'); eq(S.run.turn,7,'not enough mana: no turn'); ok(P.shield===s);
});
test('Combat: foe shields soak damage before HP, curses add damage',()=>{
  const e=foe({hp:100}); arena([e]); e.shield=8; hurtFoe(e,10); eq(e.shield,0); eq(e.hp,98);
  e.curse={mul:1.5,t:3}; hurtFoe(e,10); eq(e.hp,83); hurtFoe(e,1000); eq(e.hp,0,'HP never goes below zero');
});
test('Combat: a kill leaves a body, counts for the quest and bestiary, and wins the room',()=>{
  const t=foe({hp:1,lvl:1}); arena([t]); fix(.5); act('strike');
  eq(S.mode,'raise'); eq(S.run.corpses.length,1); eq(S.quest.kills,1); eq(S.kills['Tunnel Rat'],1); eq(S.player.xp,killXp(t)); ok(S.gold>0,'gold banked');
  eq(S.run.corpses[0].base,'Tunnel Rat'); ok(!S.run.corpses[0].tried);
});
test('Combat: falling ends the run, costs XP and the room\'s gold and trophies',()=>{
  arena([foe({atk:9999})]); fix(.5); const P=S.player; P.xp=50; P.hp=1; S.run.gold=25; S.run.troph={'Tunnel Rat':2}; S.gold=7;
  act('strike'); eq(S.mode,'defeat'); eq(P.xp,50-Math.round(need(1)*DIFF.deathXp)); eq(S.run.gold,0); eq(Object.keys(S.run.troph).length,0); eq(S.gold,7); eq(S.ti.deaths,1);
  returnTown(); eq(S.mode,'town'); eq(P.hp,pMax());
});
test('Combat: going deeper heals a little and resets cooldowns; leaving heals fully',()=>{
  arena([foe({hp:1})]); fix(.5); act('strike'); const P=S.player; P.hp=10; S.run.cd={spear:2}; S.run.silence=2;
  descend(); eq(S.mode,'battle'); eq(S.run.room,1); eq(P.hp,10+Math.round(pMax()*DIFF.heal)); eq(Object.keys(S.run.cd).length,0); eq(S.run.silence,0); eq(S.run.enemies.length,3);
  flee(); eq(S.mode,'town'); eq(P.hp,pMax()); ok(S.notices.some(n=>/fled/.test(n.m)));
});
test('Combat: a strong necromancer clears the whole Rat Warren',()=>{
  const P=S.player; P.stats.strength=400; P.stats.constitution=300; P.hp=pMax(); startRun(0); let n=0;
  while(n++<300){ if(S.mode==='battle') act('strike'); else if(S.mode==='raise'){ if(S.run.cleared) break; descend(); } else break; }
  ok(S.run.cleared,'cleared'); eq(S.run.room,3); eq(S.ti.clr[0],1); eq(S.quest.clears,1); ok(S.kills['The Rat King']>=1);
  returnTown(); checkTitles(); ok(S.ti.got.g0,'Ratcatcher title');
});
test('Combat: foe menders heal hurt allies, weakened by armor',()=>{
  const md=foe({role:'mender',atk:10,hp:10000}), hurt=foe({hp:10,maxHp:100}); arena([md,hurt]); fix(.5); act('strike');
  eq(hurt.hp,10+Math.round(10*.9*(1-DIFF.armor[0])));
});
test('Combat: minion menders heal you, reapers cleave a second foe',()=>{
  const a=foe({hp:10000}), b=foe({hp:10000}); arena([a,b]); fix(.5);
  const md=mkMinion({role:'mender'}); md.atk=20; const rp=mkMinion({role:'reaper'}); rp.atk=100; S.player.hp=10;
  act('strike'); ok(S.player.hp>=10+18-2,'healed by the mender'); const d=H(100*dmgMul()); eq(b.hp,10000-Math.round(d*.5));
});
test('Combat: vanguards draw most enemy blows',()=>{
  arena([foe({hp:1e6,atk:1})]); seed(5); const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e6; S.player.stats.constitution=1e4; S.player.hp=pMax();
  let onV=0; for(let i=0;i<300;i++){ const h=v.hp; act('strike'); if(v.hp<h) onV++; } ok(onV>170&&onV<260,'vanguard took '+onV+' of 300 blows');
});
test('Combat: the target can be chosen and moves on when it dies',()=>{
  const a=foe({hp:1}), b=foe({hp:1000}); arena([a,b]); setTarget(b.id); eq(S.run.target,b.id); setTarget('nope'); eq(S.run.target,b.id);
  setTarget(a.id); fix(.5); act('strike'); eq(currentTarget().id,b.id);
});
test('Combat: nothing happens on unknown actions or outside battle',()=>{ act('strike'); eq(S.mode,'town'); arena([foe()]); act('dance'); eq(S.run.turn,1); });

})();
