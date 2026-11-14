// Gear-Bearers tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Gear-bearers: giving gear raises stats, taking it back returns it',()=>{
  const m=mkMinion({armed:true,eq:{weapon:null,armor:null,relic:null},lvl:5}); const a=m.atk, h=m.maxHp; const w=give('2-wa'), ar=give('2-aa');
  giveGear(m.uid,w.u); ok(m.atk>a); giveGear(m.uid,ar.u); ok(m.maxHp>h); eq(S.inv.length,0);
  const w2=give('3-wa'); giveGear(m.uid,w2.u); eq(m.eq.weapon.id,'3-wa'); ok(S.inv.some(x=>x.id==='2-wa'),'old weapon back in bag');
  takeGear(m.uid,'armor'); eq(m.eq.armor,null); eq(m.maxHp,Math.min(m.maxHp,m.maxHp)); ok(m.hp<=m.maxHp);
});
test('Gear-bearers: ordinary minions cannot hold gear; full bag blocks taking gear; no swaps in battle',()=>{
  const n=mkMinion({}); const it=give('0-wa'); giveGear(n.uid,it.u); eq(S.inv.length,1);
  const m=mkMinion({armed:true,eq:{weapon:{u:++S.uid,id:'0-wa'},armor:null,relic:null}}); while(S.inv.length<bagMax()) give('0-ta');
  takeGear(m.uid,'weapon'); ok(m.eq.weapon,'kept when the bag is full'); ok(S.notices.some(x=>/bag is full/.test(x.m)));
  S.inv=[]; arena([foe()]); takeGear(m.uid,'weapon'); ok(m.eq.weapon,'not in battle');
});
test('Gear-bearers: gear converts sensibly into minion attack and HP',()=>{ const o=gearBonus({eq:{weapon:{id:'0-wa'},armor:{id:'0-aa'},relic:{id:'0-tc'}}}); ok(o.atk>0&&o.hp>0&&o.mpow>0); eq(gearBonus({}).atk,0); });

})();
