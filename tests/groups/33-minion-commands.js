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

test('Commands: Focus and Execute end with the room even when your own blow won it',()=>{
  fresh(10); arena([foe({hp:1})]); mkMinion({role:'striker'}); mkMinion({role:'reaper'});
  ok(command('striker')); ok(command('reaper')); act('strike'); eq(S.mode,'raise'); descend('fight');
  ok(!S.run.focus,'no free Focus in the next room'); ok(!S.run.execute,'no free Execute');
});
// Guard (game-faith-story.js): the vanguard order that costs your turn and takes one killing blow
const guardRoom=(atk)=>{ fresh(10); const a=foe({name:'Grim Biter',hp:1e6,atk:atk||50,role:'striker'}); arena([a]); const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e6; const P=S.player; P.hp=1; P.shield=0; fix(.99); a.it={k:'atk',t:'p'}; return {a,v,P}; };
test('Orders: Guard costs your turn, and a front-row vanguard takes the blow that would kill you at SB_TAKE',()=>{
  let {a,v,P}=guardRoom(); const t=S.run.turn; ok(canGuard()); act('guard'); eq(S.run.turn,t+1,'Guard was your turn'); eq(S.mode,'battle','saved'); eq(P.hp,1);
  ok(S.run.log.some(l=>/^Guard: .+ steps in front of you and takes the killing blow\.$/.test(l.m)),'logged'); const took=v.maxHp-v.hp; ok(took>0); ok(!canGuard(),'once per room'); const t1=S.run.turn; act('guard'); eq(S.run.turn,t1,'refused the second time');
  ({a,v,P}=guardRoom()); a.it={k:'atk',t:fxKey(v)}; act('strike'); near(took/(v.maxHp-v.hp),SB_TAKE,.05,'at SB_TAKE of the same blow');
});
test('Orders: Guard holds only until your next turn and lets survivable hits through',()=>{
  let {a,v,P}=guardRoom(); P.hp=pMax(); a.atk=2; act('guard'); ok(P.hp<pMax(),'a hit you survive lands on you'); eq(v.hp,v.maxHp,'the vanguard is untouched');
  P.hp=1; a.atk=50; a.it={k:'atk',t:'p'}; act('strike'); eq(S.mode,'defeat','gone at your next turn: it was spent on nothing'); ok(!S.run.felled.c||!S.run.felled.c.includes('guard'),'given this room: not listed');
  ({a,v,P}=guardRoom()); act('strike'); eq(S.mode,'defeat','no Guard, no save'); ok(S.run.felled.c.includes('guard')); ok(renderAll('recap').includes('Guard was not used.'));
});
test('Orders: Guard covers a telegraphed boss move, unlike Taunt',()=>{
  fresh(); const b=bossFight(5); S.run.enemies.forEach(e=>{ if(e!==b) e.hp=1e6, e.maxHp=1e6, e.stun=5; }); b.charging=true; b.move='decree'; const v=mkMinion({role:'vanguard'}); v.maxHp=v.hp=1e7; fix(.99); S.player.hp=1; S.player.shield=0;
  act('guard'); eq(S.mode,'battle','the Decree landed on the vanguard'); eq(S.player.hp,1); ok(v.hp<v.maxHp);
});
test('Orders: Guard needs a living vanguard in the front row, comes back each room and after a Retry; button, key, Codex, Turkish',()=>{
  let {v}=guardRoom(); v.row='b'; ok(!canGuard(),'back row'); const t=S.run.turn; act('guard'); eq(S.run.turn,t,'refused: no turn spent'); v.row='f'; v.hp=0; ok(!canGuard(),'downed');
  ({v}=guardRoom()); mkMinion({role:'reaper'}); v.role='striker'; ok(!canGuard(),'only a vanguard');
  ({v}=guardRoom()); S.player.hp=pMax(); snapRoom(); act('guard'); ok(!canGuard()); S.player.hp=0; defeat(); ok(retryRoom()); ok(canGuard(),'back after a Retry');
  wonRoom(0); descend('fight'); ok(canGuard(),'back in the next room');
  let h=renderAll('guard'); ok(/data-a="act" data-k="guard"[^>]*>Guard<kbd>G<\/kbd>/.test(h),'the button'); ok(keysHTML().includes('Guard (uses your turn)'));
  if(NODE){ const t2=S.run.turn; window.__listeners.keydown[0]({key:'g',preventDefault(){},target:{}}); eq(S.run.turn,t2+1,'G guards'); }
  fresh(); ok(cdx('orders').includes('Unlike Taunt'),'Codex');
  ok(trText(GUARD.desc)!==GUARD.desc&&trText('Guard was not used.')==='Siper kullanılmadı.','Turkish'); ok(trText('Guard: Bonehound steps in front of you and takes the killing blow.').startsWith('Siper:'));
  ok(trText('Guard: Bonehound plants itself before you. The next blow that would kill you is its to take.').startsWith('Siper:'));
});
})();
