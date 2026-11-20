// Siege guard and wall (src/game-phases-town.js SIEGE NIGHTS): guard one building, send up to 2 Reserve minions to the wall.
(function(){
const {test,ok,eq,fix,setLvl,mkMinion,renderAll,cdx,invariants}=window.LOTD_T;
const town=b=>{ setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1}; S.build=Object.assign({crypt:1,forge:3,altar:2},b||{}); S.mode='town'; S.run=null; S.watches=WATCHES; siegeTick(); return S.siege; };
const night=()=>{ S.siege.next=S.day; S.watches=0; endDay(); eq(S.mode,'siege'); };
const bench=o=>{ const m=mkMinion(Object.assign({lvl:12,role:'striker',row:'b'},o)); S.army=S.army.filter(x=>x!==m); (S.reserve=S.reserve||[]).push(m); return m; };
const lose=()=>{ fix(.99); S.player.hp=0; ok(playerFalls()); };
const killWave=()=>{ S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); };

test('Siege guard: defaults to the highest-level building, is chosen with chips, and is cleared after the night',()=>{
  town(); mkMinion({lvl:12}); night(); eq(S.siege.guard,'forge','highest level by default');
  let h=renderAll('intro'); ok(/Guard a building/.test(h)&&/data-a="sguard" data-k="altar"/.test(h)&&/data-a="sguard" data-k="forge" aria-pressed="true"/.test(h),'chips, the default pressed');
  ok(!siegeGuard('ossuary'),'not built'); ACTIONS.sguard('altar'); eq(S.siege.guard,'altar');
  beginSiege(); fix(.99); killWave(); killWave(); killWave(); eq(S.mode,'raise'); ok(S.run.events.some(e=>/The Altar stood under your guard all night/.test(e.m)),'the result names it');
  returnTown(); eq(S.mode,'town'); ok(!('guard' in S.siege)&&!('wall' in S.siege),'cleared at dawn'); invariants('guard won');
});

test('Siege guard: a lost or fled siege never burns the guarded building; with nothing else standing it costs the fine',()=>{
  mkMinion({lvl:12}); for(let i=0;i<30;i++){ town(); night(); siegeGuard('forge'); beginSiege(); if(i%2) lose(); else ACTIONS.flee(); eq(S.mode,'defeat');
    ok(S.siege.dmg&&S.siege.dmg!=='forge','burned '+S.siege.dmg); ok(/The Forge you guarded was spared/.test(S.run.siegeLoss)); returnTown(); S.siege.dmg=null; }
  town({crypt:0,altar:0}); delete S.build.crypt; delete S.build.altar; S.gold=1000; night(); eq(S.siege.guard,'forge'); beginSiege(); lose();
  eq(S.siege.dmg,null,'nothing burned'); ok(S.gold<1000,'the fine'); ok(/With the Forge under guard they took what they could carry instead: \d+ gold/.test(S.run.siegeLoss));
  ok(/With the Forge under guard/.test(renderAll('defeat'))); returnTown(); invariants('fine');
  town(); S.siege.dmg='altar'; night(); ok(!/Guard a building/.test(renderAll('damaged')),'no picker while a building lies in ruins');
});

test('Siege wall: up to 2 Reserve minions fight in the front row, hold no army place, and go back to the Reserve after a win, a loss or flight',()=>{
  for(const end of ['win','lose','flee']){
    town(); while(armyUsed()<slots()) mkMinion({lvl:12}); const a=bench({lvl:14}), b=bench({lvl:13}), c=bench({lvl:12}); night();
    let h=renderAll('intro'); ok(/On the wall &middot; 0\/2/.test(h)&&h.includes('data-a="swall" data-k="'+a.uid+'"'));
    ACTIONS.swall(String(a.uid)); ACTIONS.swall(String(b.uid)); ok(!siegeWallPick(c.uid),'two at most'); ok(renderAll('full').includes('data-a="swall" data-k="'+c.uid+'" aria-pressed="false" disabled'));
    const nRes=S.reserve.length; beginSiege(); ok(S.army.includes(a)&&S.army.includes(b)&&!S.reserve.includes(a),'on the wall'); ok(a.wall&&rowOf(a)==='f'&&rowOf(b)==='f','front row'); eq(a.row,'b','own row kept');
    eq(armyUsed(),slots(),'no army place taken'); ok(!reserveRoom()||S.reserve.length+2<reserveMax(),'their Reserve places stay theirs'); eq(S.reserve.length,nRes-2);
    ok(/ATK [0-9]+ &middot; Wall/.test(renderAll('battle')),'marked on cards'); invariants('wall battle '+end);
    if(end==='win'){ fix(.99); killWave(); killWave(); killWave(); eq(S.mode,'raise'); } else if(end==='lose') lose(); else ACTIONS.flee();
    returnTown(); eq(S.mode,'town'); ok(S.reserve.includes(a)&&S.reserve.includes(b)&&!S.army.includes(a),'back in the Reserve after '+end); ok(!a.wall&&!b.wall); eq(a.hp,a.maxHp); eq(armyUsed(),slots()); invariants('wall home '+end);
  }
});

test('Siege wall: raiders and minions waiting at the gate cannot be chosen; an empty Reserve hides the picker',()=>{
  town(); mkMinion({lvl:12}); night(); ok(!/On the wall/.test(renderAll('no reserve')),'hidden'); ok(!siegeWallPick(S.army[0].uid),'army minions cannot go');
  returnTown(); town(); mkMinion({lvl:12}); const w=bench(); S.reserve=S.reserve.filter(m=>m!==w); S.waiting=[w]; const r=bench(); S.reserve=S.reserve.filter(m=>m!==r); S.raids=[{di:1,units:[r],res:[r.uid]}];
  night(); ok(!siegeWallPick(w.uid)&&!siegeWallPick(r.uid),'not from the gate or a raid'); ok(!/data-a="swall"/.test(renderAll('none free')));
  S.siege.wall=[w.uid]; beginSiege(); ok(!S.army.includes(w),'a stale pick is ignored');
});

test('Siege wall: saving mid-siege puts the wall back in the Reserve, keeps tonight\'s choices, and the siege starts again',()=>{
  town(); mkMinion({lvl:12}); const a=bench(); night(); siegeGuard('altar'); siegeWallPick(a.uid); beginSiege(); a.hp=1;
  const snap=JSON.parse(JSON.stringify(snapshot())); ok(snap.reserve.some(m=>m.uid===a.uid&&!m.wall&&m.hp===m.maxHp),'saved in the Reserve, healed'); ok(!snap.army.some(m=>m.uid===a.uid),'not saved in the army');
  ok(S.army.includes(a),'the live game is untouched'); applyLoaded(normalizeSave(snap)); eq(S.mode,'siege'); eq(S.siege.guard,'altar'); eq(S.siege.wall.join(),String(a.uid));
  beginSiege(); ok(S.army.some(m=>m.uid===a.uid&&m.wall),'back on the wall'); invariants('reloaded wall');
  ok(!('guard' in normalizeSave(Object.assign(JSON.parse(JSON.stringify(snap)),{siege:{next:0,pending:false,guard:'altar',wall:[1]}})).siege),'only kept while pending');
});

test('Siege guard and wall: Codex and Turkish',()=>{
  town(); const h=cdx('sieges'); ok(/Guard and wall/.test(h)&&/up to 2 Reserve minions/.test(h));
  for(const s of ['Guard a building','If the walls fall, the living cannot burn the building you guard; they fire another, or take gold if none is left','On the wall · 1/2','On the wall','Wall',
    'Up to 2 minions from the Reserve fight this siege in your front row, then go back to the Reserve','The Forge you guarded was spared','The Altar stood under your guard all night',
    'With the Forge under guard they took what they could carry instead: 40 gold','On the wall: back to the Reserve after the siege','Guard and wall']) ok(trText(s)!==s,'Turkish: '+s);
  eq(trText('On the wall · 1/2'),'Surlarda · 1/2');
});
})();
