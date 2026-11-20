// Items And Drops tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Items: the bag holds 30, uniques always fit',()=>{ eq(bagMax(),30); for(let i=0;i<30;i++) ok(addItem('0-wa')); eq(addItem('0-wa'),null); ok(addItem('u0')); eq(S.inv.length,31); });
test('Items: equipping swaps slots and keeps HP/mana in step',()=>{
  const a=give('0-aa'), b=give('1-aa'); const P=S.player, h=pMax(); equip(a.u); eq(S.equip.armor.u,a.u); eq(P.hp,h+ITEM['0-aa'].stats.hp);
  equip(b.u); eq(S.equip.armor.u,b.u); ok(S.inv.some(x=>x.u===a.u)); unequip('armor'); eq(S.equip.armor,null); eq(P.hp,pMax()); eq(S.inv.length,2);
  discard(a.u); eq(S.inv.length,1);
});
test('Items: unequipping into a full bag is refused, as taking gear off a minion is',()=>{ const a=give('0-aa'); equip(a.u); for(let i=0;i<30;i++) ok(addItem('0-wa')); unequip('armor'); eq(S.equip.armor.u,a.u,'kept on'); eq(S.inv.length,30,'bag not over its limit'); ok(S.notices.some(x=>/bag is full/.test(x.m))); });
test('Items: no equipping in battle',()=>{ const a=give('0-aa'); arena([foe()]); equip(a.u); eq(S.equip.armor,null); });
test('Items: every drop table adds up to 100% and only lists real items',()=>{
  for(let di=0;di<6;di++) for(const role of Object.keys(ROLES)) for(const boss of [false,true]) for(const el of [false,true]){
    const rows=tableFor(di,role,boss,el); near(rows.reduce((a,r)=>a+r.p,0),1,1e-9,'gate '+di+' '+role); rows.forEach(r=>ok(ITEM[r.id],r.id)); ok(rows.some(r=>r.id==='u'+di)); }
  for(const f of [1,10,25,50,99,100,150]) for(const role of Object.keys(ROLES)){ const rows=towerTable(f,role,f%10===0,false); near(rows.reduce((a,r)=>a+r.p,0),1,1e-9,'floor '+f); }
});
test('Items: ordinary foes drop gear 28% of the time, elites 65%, bosses always',()=>{
  seed(3); let n=0, e=0, b=0; const N=4000;
  for(let i=0;i<N;i++){ n+=rollDrops(foe({base:'Tunnel Rat',role:'striker'})).length; e+=rollDrops(foe({elite:true})).length; const d=rollDrops(foe({boss:true,role:'reaper'})); ok(d.length>=1); b+=d.length; }
  near(n/N,.28,.03); near(e/N,.65,.03); near(b/N,1.6,.04);
});
test('Items: bosses drop their gate unique about as often as the table says',()=>{
  seed(9); let u=0; const N=20000; for(let i=0;i<N;i++) for(const id of rollDrops(foe({boss:true,role:'reaper'}))) if(id==='u0') u++; near(u/(N*1.6),UQ[0]/100,.01);
});
test('Items: loot that does not fit the bag is listed as lost',()=>{
  arena([foe({hp:0,dead:true})]); while(S.inv.length<bagMax()) give('0-ta'); S.run.loot=['0-wa','u0']; roomWon(); eq(S.run.lostLoot.join(),ITEM['0-wa'].name); ok(S.inv.some(x=>x.id==='u0'));
});

})();
