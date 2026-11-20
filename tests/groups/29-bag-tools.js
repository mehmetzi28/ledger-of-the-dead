// Bag Tools tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Bag: sorts best first, by slot, or newest',()=>{
  const a=give('0-ta'), b=give('3-wa'), c=give('1-aa'); ui.sort='tier'; eq(sortedBag().map(x=>x.u).join(),[b.u,c.u,a.u].join()); ui.sort='slot'; eq(sortedBag().map(x=>x.u).join(),[b.u,c.u,a.u].join());
  ui.sort='new'; eq(sortedBag()[0].u,c.u); ACTIONS.sort('bogus'); eq(ui.sort,'tier');
});
test('Bag: selling junk sells only Common and Uncommon pieces from the bag, after asking',()=>{
  give('0-wa'); give('1-aa'); const keep=give('2-wa'), u=give('u0'); S.equip.weapon={u:++S.uid,id:'0-wb'};
  ACTIONS.junk(); eq(S.inv.length,4,'asks first'); ACTIONS.junk(); eq(S.inv.map(x=>x.u).sort().join(),[keep.u,u.u].sort().join()); eq(S.gold,sellPrice(ITEM['0-wa'])+sellPrice(ITEM['1-aa'])); ok(S.equip.weapon,'worn gear is safe'); ok(/junk/.test(ui.msg.m));
  arena([foe()]); eq(sellJunk(),null);
});
test('Bag: the gear tab shows tools, rolls and comparisons',()=>{ const it=give('2-wa'); it.ro=[['will',3]]; give('0-ta'); ui.tab='gear'; const h=renderAll('gear tab'); ok(/data-a="sort"/.test(h)&&/data-a="junk"/.test(h)&&/data-a="reforge"/.test(h)&&/class="roll"/.test(h)&&/class="cmp"/.test(h)); });
test('UI: events, curses and status effects render',()=>{
  richState(); S.ti.clr={0:1}; S.mod={day:S.day,gi:0,id:'volatile'}; ui.tab='gates'; ok(/curse-line">Cursed: /.test(renderAll('cursed gate card')));
  S.watches=3; startRun(0); addDot(S.player,'bleed',5,2); addDot(S.run.enemies[0],'poison',4,3); S.run.bless=true; const h=renderAll('battle with effects'); ok(/Bleeding 2/.test(h)&&/5 damage a turn/.test(h)&&/Poisoned 3/.test(h)&&/class="pills"/.test(h)&&/Cursed:/.test(h)&&/Blood-blessed/.test(h));
  S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); fix(.99); roomWon(); for(const id of Object.keys(EVENTS)){ S.run.event=Object.assign({id},id==='pedlar'?{pot:'mp',price:9}:{}); const x=renderAll('event '+id); ok(x.includes(EVENTS[id].name)); }
  ACTIONS.event('pass'); ok(!/event-box/.test(renderAll('after the event')));
});

})();
