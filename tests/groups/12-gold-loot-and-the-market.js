// Gold, Loot And The Market tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Market: kills drop gold, and trophies (bosses 1, elites 2, others 60%)',()=>{
  arena([foe()]); const r=S.run; fix(.5); killLoot(foe({boss:true,base:'The Rat King'}),r); eq(r.troph['b:The Rat King'],1);
  killLoot(foe({elite:true}),r); eq(r.troph['Tunnel Rat'],2); killLoot(foe(),r); eq(r.troph['Tunnel Rat'],3); fix(.7); killLoot(foe(),r); eq(r.troph['Tunnel Rat'],3); ok(r.gold>=4);
  const g=r.gold; bankLoot(r); eq(S.gold,g); eq(S.trophies['Tunnel Rat'],3); eq(r.gold,0);
});
test('Market: the shop sells 4 pieces from your top gate and the one below, restocking daily and on a new gate',()=>{
  const st=shopStock(); eq(st.length,4); eq(new Set(st.map(s=>s.id)).size,4); st.forEach(s=>eq(ITEM[s.id].set,0));
  eq(shopStock(),st,'same stock all day'); setLvl(4); const st2=shopStock(); ok(st2!==st,'restocked on the new gate'); st2.forEach(s=>ok(ITEM[s.id].set<=1));
  S.day++; ok(shopStock()!==st2,'restocked on a new day'); setLvl(60); shopStock().forEach(s=>ok(ITEM[s.id].set>=4&&!ITEM[s.id].uq));
});
test('Market: buying gear costs the set price and fills the bag',()=>{
  const st=shopStock(); S.gold=1000; const p=buyPrice(ITEM[st[0].id]); ok(buyStock(0)); eq(S.gold,1000-p); ok(st[0].sold); eq(S.inv[0].id,st[0].id);
  ok(!buyStock(0),'sold out'); S.gold=0; ok(!buyStock(1),'too poor'); S.gold=1e5; while(S.inv.length<bagMax()) give('0-ta'); ok(!buyStock(1),'bag full'); ok(!buyStock(9),'no such slot');
});
test('Market: potions cost more with level, fill a belt of 3, and are drunk in battle',()=>{
  S.gold=1000; ok(buyPotion('hp')); eq(S.gold,1000-20); ok(buyPotion('hp')); ok(buyPotion('hp')); ok(!buyPotion('hp'),'belt full'); eq(S.belt.hp,3); ok(buyPotion('mp')); ok(!buyPotion('elixir'));
  setLvl(10); eq(POTIONS.hp.price(),65);
  arena([foe({hp:1e6})]); ok(!buyPotion('mp'),'not in battle'); fix(.5); const P=S.player;
  act('pot:hp'); eq(S.run.turn,1,'full HP: refuses'); P.hp=10; act('pot:hp'); eq(P.hp,10+Math.round(Math.round(pMax()*.35)*(1+conHeal()/100))-1,'Constitution adds to healing received'); eq(S.belt.hp,2); eq(S.run.turn,2);
  P.mana=0; act('pot:mp'); eq(P.mana,Math.round(pMana()*.4)+1); eq(S.belt.mp,0); act('pot:mp'); eq(S.run.turn,3,'empty belt: refuses');
});
test('Market: gear sells for a quarter, uniques never, only in town',()=>{
  const a=give('1-wa'), u=give('u0'); eq(sellItem(a.u),20); eq(S.gold,20); eq(sellItem(u.u),0); ok(S.inv.includes(u)); eq(sellItem(999),0);
  const b=give('0-wa'); arena([foe()]); eq(sellItem(b.u),0);
});
test('Market: trophies sell one at a time or all at once',()=>{
  S.trophies={'Tunnel Rat':3,'b:The Rat King':1}; eq(sellTrophy('Tunnel Rat'),3); eq(S.trophies['Tunnel Rat'],2); eq(sellTrophy('Tunnel Rat',true),6); eq(S.trophies['Tunnel Rat'],undefined);
  eq(sellAllTrophies(),TROPHY['b:The Rat King'].value); eq(Object.keys(S.trophies).length,0); eq(S.ti.soldTro,4); eq(sellTrophy('nope'),0);
});
test('Market: the Bone Altar levels a minion for gold, up to your level + 2',()=>{
  setLvl(5); const m=mkMinion({lvl:1}); S.gold=1000; const c=empowerCost(m); ok(empower(m.uid)); eq(m.lvl,2); eq(S.gold,1000-c); eq(m.hp,m.maxHp); eq(S.ti.emp,1);
  m.lvl=7; ok(!empower(m.uid),'capped'); m.lvl=2; S.gold=0; ok(!empower(m.uid),'too poor');
});
test('Market: bag upgrades add 5 slots, four times',()=>{
  S.gold=1e5; for(let i=0;i<4;i++){ ok(buyBag()); eq(bagMax(),35+5*i); } ok(!buyBag(),'maxed'); eq(S.gold,1e5-BAG_COST.reduce((a,b)=>a+b,0));
});
test('Market: Grave Salts stack to 3',()=>{ S.gold=1000; for(let i=0;i<3;i++) ok(buySalt()); ok(!buySalt()); eq(S.salts,3); eq(S.gold,1000-3*saltPrice()); });

test('Market: Buy max fills the salt pouch as far as the gold goes, in one click, and is disabled when nothing can be bought',()=>{
  const c=saltPrice(); S.salts=0; S.gold=c*2+1; ok(/data-a="buysaltmax"[^>]*>Buy max/.test(marketHTML()),'shown');
  eq(saltMaxN(),2); ACTIONS.buysaltmax(); eq(S.salts,2); eq(S.gold,1); eq(ui.msg.m,'Bought 2 Grave Salts for '+(2*c)+' gold.');
  ok(/data-a="buysaltmax" disabled/.test(marketHTML()),'no gold: disabled'); ACTIONS.buysaltmax(); eq(S.salts,2); eq(ui.msg,null);
  S.gold=1e6; ACTIONS.buysaltmax(); eq(S.salts,SALT_MAX,'never past the pouch'); eq(S.gold,1e6-(SALT_MAX-2)*c); ok(!/data-a="buysaltmax"/.test(marketHTML()),'pouch full: only the full label');
  S.salts=0; arena([foe()]); eq(buySaltMax().n,0,'not in battle'); eq(S.salts,0);
  eq(trText('Buy max'),'En fazlasını al'); eq(trText('Bought 2 Grave Salts for 40 gold.'),'2 Mezar Tuzu 40 altına alındı.');
});
})();
