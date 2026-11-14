// Salvage And Enchanting tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Salvage: gear breaks into bone dust; uniques and battles refuse',()=>{
  const it=give('3-wa'); it.ro=[['hp',5],['atk',3]]; eq(dustValue(it),DUST_TIER[ITEM['3-wa'].tier]+1,'one dust per two lines'); const n=dustValue(it); eq(salvage(it.u),n); eq(S.dust,n); ok(!S.inv.includes(it));
  const uq=give(Object.values(ITEM).find(d=>d.uq).id); eq(salvage(uq.u),0); ok(S.inv.includes(uq));
  give('0-wa'); give('1-wa'); const keep=give('3-wa'); const r=salvageJunk(); eq(r.n,2); eq(r.d,DUST_TIER[0]+DUST_TIER[1]); ok(S.inv.includes(keep));
  arena([foe()]); eq(salvage(keep.u),0);
});
test('Salvage: enchanting adds a line where there is room, or re-roll the line you choose, for dust',()=>{
  const it=give('4-wa'); delete it.ro; const c=enchCost(it); ok(!enchant(it.u,-1),'no dust'); S.dust=1000;
  for(let i=0;i<lineMax(it);i++) ok(enchant(it.u,-1)); eq(it.ro.length,lineMax(it)); ok(!enchant(it.u,-1),'full'); eq(new Set(it.ro.map(r=>r[0])).size,it.ro.length,'no repeated stat');
  eq(S.dust,1000-c*lineMax(it)); const before=it.ro.map(r=>r.join()); ok(enchant(it.u,1)); eq(it.ro[0].join(),before[0]); eq(it.ro[2].join(),before[2]); eq(new Set(it.ro.map(r=>r[0])).size,3);
  ok(!enchant(it.u,7),'no such line'); const uq=give(Object.values(ITEM).find(d=>d.uq).id); ok(!enchant(uq.u,-1));
  it.ro.forEach(r=>{ ok(ROLL_KEYS[r[0]]&&r[1]>=1); }); equip(it.u); ok(enchant(it.u,0),'works on worn gear'); invariants('enchant worn');
  const nm=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(nm.equip.weapon.ro),JSON.stringify(it.ro),'enchanted lines survive a save');
});
test('Salvage: buttons on the Gear tab, dust in the bag header',()=>{
  setLvl(6); const it=give('3-wa'); give('0-ta'); ui.tab='gear'; let h=renderAll('gear'); ok(new RegExp('data-a="salvage" data-k="'+it.u+'"').test(h)&&/data-a="ench"/.test(h)&&/0 dust/.test(h));
  ACTIONS.ench(String(it.u)); h=renderAll('enchant open'); ok(/data-a="enchadd"/.test(h)); ACTIONS.salvage(String(it.u)); ok(S.dust>0); ok(ui.msg&&/Salvaged/.test(ui.msg.m));
  ACTIONS.sjunk(); eq(S.inv.length,1,'asks first'); ACTIONS.sjunk(); eq(S.inv.length,0);
});

})();
