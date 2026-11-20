// Minion Commands tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Orders: each kind of minion takes one free order per room',()=>{
  arena([foe({hp:1e6})]); ok(!canCommand('vanguard'),'no vanguard'); const v=mkMinion({role:'vanguard'}); ok(canCommand('vanguard')); const t=S.run.turn;
  ok(command('vanguard')); eq(S.run.turn,t,'free'); ok(!command('vanguard'),'once a room'); eq(S.ti.commands,1);
  S.run.enemies=[foe({hp:0,dead:true})]; fix(.99); roomWon(); descend(); ok(canCommand('vanguard'),'again next room'); v.hp=0; ok(!canCommand('vanguard'),'not with the dead');
});
test('Orders: Taunt makes foes hit only your vanguards for 2 turns',()=>{
  const e=foe({hp:1e6,atk:5,role:'striker'}); arena([e]); const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e6; const P=S.player; seed(3); command('vanguard');   /* a striker: melee could not reach you past the front row anyway */
  for(let i=0;i<2;i++){ const hp=P.hp; act('strike'); eq(P.hp,hp,'turn '+i+': you are untouched'); } eq(S.run.taunt,0); let hit=false; for(let i=0;i<20&&!hit;i++){ const hp=P.hp; act('strike'); if(P.hp<hp) hit=true; } ok(hit,'after Taunt you can be hit again');
});
test('Orders: Focus makes strikers crit, Execute doubles reapers on weak foes, Bone Shield wards you',()=>{
  const t=foe({hp:1e6}); arena([t]); const s=mkMinion({role:'striker'}); s.atk=100; fix(.5); command('striker'); act('strike'); eq(1e6-t.hp,H(pAtk()*dmgMul())+Math.round(H(100*dmgMul())*1.8)); ok(!S.run.focus,'only one turn');
  fresh(); const w=foe({hp:3e5,maxHp:1e6}); arena([w]); const r=mkMinion({role:'reaper'}); r.atk=100; fix(.5); command('reaper'); act('strike'); eq(3e5-w.hp,H(pAtk()*dmgMul())+H(100*dmgMul()*2));
  fresh(); arena([foe()]); const m=mkMinion({role:'mender'}); m.atk=10; command('mender'); eq(S.player.shield,15);
});
test('Orders: order buttons show in battle',()=>{ arena([foe()]); mkMinion({role:'vanguard'}); mkMinion({role:'mender'}); const h=renderAll('orders'); ok(/data-a="cmd" data-k="vanguard"/.test(h)&&/data-a="cmd" data-k="mender"/.test(h)); ACTIONS.cmd('mender'); ok(/Bone Shield &middot; given/.test(renderAll('given'))); });

})();
