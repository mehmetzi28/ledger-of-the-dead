// Cursed Gates tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Curses: none until you clear a gate; then one cleared gate is cursed all day',()=>{
  eq(dayMod().gi,-1); eq(gateMod(0),null); S.ti={clr:{0:1}}; eq(dayMod().gi,-1,'already decided for today'); endDay(); const m=dayMod(); eq(m.gi,0); ok(MODS[m.id]); eq(gateMod(0),m.id);
  const again=dayMod(); ok(again===m,'same all day'); setLvl(30); S.ti.clr={0:1,1:1,5:1}; seed(3); const seen=new Set(); for(let d=0;d<60;d++){ S.day++; seen.add(dayMod().gi); } ok([...seen].every(g=>[0,1,5].includes(g))); eq(seen.size,3);
});
test('Curses: never on a gate you are too low for',()=>{ S.ti={clr:{0:1,3:1}}; setLvl(5); for(let d=0;d<40;d++){ S.day++; ok(dayMod().gi!==3); } });
test('Curses: Horde adds a foe to every room, Bulwark adds 30% HP, Fury 25% attack',()=>{
  cursedRun('horde'); eq(S.run.enemies.length,3); S.run.room=3; spawnRoom(); eq(S.run.enemies.length,4);
  fresh(); seed(4); startRun(0); const base=S.run.enemies.map(e=>[e.maxHp,e.atk]);
  fresh(); seed(4); S.ti={clr:{0:1}}; S.mod={day:1,gi:0,id:'bulwark'}; startRun(0); S.run.enemies.forEach((e,i)=>{ near(e.maxHp,base[i][0]*1.3*CURSE_FOE,2); near(e.atk,base[i][1]*CURSE_FOE,1); });
  fresh(); seed(4); S.ti={clr:{0:1}}; S.mod={day:1,gi:0,id:'fury'}; startRun(0); S.run.enemies.forEach((e,i)=>{ near(e.maxHp,base[i][0]*CURSE_FOE,1); ok(e.atk>=Math.round(base[i][1]*1.25*CURSE_FOE)-1); });
});
test('Curses: Drought stops mana coming back at the end of a turn',()=>{ cursedRun('drought'); const t=foe({hp:1e6}); S.run.enemies=[t]; S.run.target=t.id; S.player.mana=0; fix(.5); act('strike'); eq(S.player.mana,3); });
test('Curses: Volatile dead burst on death, soaked by ward, never below 1 HP',()=>{
  cursedRun('volatile'); const a=foe({hp:1,atk:40}), b=foe({hp:1e6}); S.run.enemies=[a,b]; S.run.target=a.id; fix(.5); const P=S.player; P.hp=pMax();
  act('strike'); ok(a.dead); eq(P.hp,pMax()-20-1,'20 from the burst, 1 from the other foe');
  const c=foe({hp:1,atk:40}); S.run.enemies.push(c); setTarget(c.id); P.shield=15; P.hp=50; act('strike'); eq(P.hp,50-5-1); eq(P.shield,0);
  const d=foe({hp:1,atk:400}); S.run.enemies=[d]; S.run.target=d.id; P.hp=3; act('strike'); eq(P.hp,1,'a burst alone never kills'); eq(S.mode,'raise');
});
test('Curses: cursed runs pay double gold and trophies, more XP and more gear',()=>{
  const r=cursedRun('fury'); const e=foe({lvl:4}); const x=killXp(e); S.run.mod=null; eq(x,Math.round(killXp(e)*MOD_XP)); S.run.mod='fury';
  fix(.5); killLoot(foe({elite:true}),r); eq(r.troph['Tunnel Rat'],4,'elite trophies doubled');
  seed(6); let n=0; for(let i=0;i<4000;i++) n+=rollDrops(foe({base:'Tunnel Rat',role:'striker'})).length; near(n/4000,.28*MOD_DROP,.03);
});
test('Curses: the Tower is never cursed',()=>{ setLvl(20); S.ti={clr:{0:1}}; S.mod={day:1,gi:5,id:'horde'}; S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); startTower(1); eq(runMod(),null); eq(S.run.enemies.length,3); });

})();
