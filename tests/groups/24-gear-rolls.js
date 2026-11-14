// Gear Rolls tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Rolls: rarer tiers roll more bonus lines, uniques never roll',()=>{
  seed(21); const lines=t=>{ let max=0, sum=0; const id=Object.values(ITEM).find(d=>!d.uq&&d.tier===t).id; for(let i=0;i<2000;i++){ const r=rollItem(id); const n=r?r.length:0; max=Math.max(max,n); sum+=n; } return {max,avg:sum/2000}; };
  const c=lines(0), u=lines(1), r=lines(2), e=lines(3), l=lines(4);
  eq(c.max,1); eq(r.max,2); eq(l.max,3); ok(c.avg<u.avg&&u.avg<r.avg&&r.avg<e.avg&&e.avg<l.avg,'average lines rise with tier');
  eq(rollItem('u0'),null); eq(rollItem('w12'),null); eq(rollItem('nope'),null);
});
test('Rolls: lines use real stats, never repeat a stat, and grow with the gate set',()=>{
  seed(5); let lo=0, hi=0;
  for(let i=0;i<500;i++){ const r=rollItem('4-wa',true); ok(r.length>=1); eq(new Set(r.map(x=>x[0])).size,r.length); r.forEach(x=>{ ok(ROLL_KEYS[x[0]]&&STATL[x[0]],x[0]); ok(x[1]>=1&&Number.isInteger(x[1])); }); }
  for(let i=0;i<500;i++){ (rollItem('0-wa',true)||[]).forEach(x=>lo+=x[1]/ROLL_KEYS[x[0]]); (rollItem('5-wa',true)||[]).forEach(x=>hi+=x[1]/ROLL_KEYS[x[0]]); } ok(hi>lo*5,'set 5 rolls far higher than set 0');
});
test('Rolls: bonus lines count for you and for gear-bearers',()=>{
  const it={u:++S.uid,id:'0-wa',ro:[['strength',5],['hp',40]]}; S.equip.weapon=it; eq(A('strength'),9); eq(G('hp'),40); eq(itStat(it,'atk'),ITEM['0-wa'].stats.atk);
  const plain=gearBonus({eq:{weapon:{id:'0-wa'}}}), rolled=gearBonus({eq:{weapon:it}}); eq(rolled.atk,plain.atk+10); eq(rolled.hp,plain.hp+40);
});
test('Rolls: found and forged gear rolls; each line adds a quarter to the sell price',()=>{
  fix(0); const it=addItem('2-wa'); ok(it.ro&&it.ro.length===2,'rolled 2 lines'); eq(sellValue(it),Math.round(sellPrice(ITEM['2-wa'])*1.5)); eq(sellItem(it.u),Math.round(50*1.5));
  const plain=addItem('2-wa',null); eq(plain.ro,undefined); eq(sellValue(plain),50);
});
test('Rolls: the merchant shows the rolls you will get',()=>{
  seed(8); setLvl(30); const st=shopStock(); const s=st.find(x=>x.ro)||st[0]; s.ro=s.ro||[['will',3]]; S.gold=1e6; ok(buyStock(st.indexOf(s))); eq(canon(S.inv[S.inv.length-1].ro),canon(s.ro));
});
test('Rolls: reforging re-rolls for gold, always leaves a line, only in town and never on uniques',()=>{
  const it=give('3-ab'); S.gold=1000; const c=reforgeCost(it); eq(c,Math.round(480*REFORGE_COST)); ok(reforge(it.u)); eq(S.gold,1000-c); ok(it.ro&&it.ro.length>=1); eq(S.ti.reforged,1);
  S.gold=0; ok(!reforge(it.u),'too poor'); S.gold=1e4; const u=give('u0'); ok(!reforge(u.u)); ok(!reforge(999));
  const w={u:++S.uid,id:'3-aa'}; S.equip.armor=w; S.player.hp=pMax(); seq([.1,.1,.1,.1,0,.5,.1,0],.5); ok(reforge(w.u),'equipped gear can be reforged'); ok(S.player.hp<=pMax());
  arena([foe()]); ok(!reforge(it.u),'not in battle');
});
test('Rolls: damaged rolls in a save are cleaned up',()=>{
  const g=normalizeSave({v:2,player:{lvl:3},inv:[{u:1,id:'0-wa',ro:[['atk',3],['fly',9],['hp',-2],['hp','x'],['crit',2.6],['will',1],['mana',4]]},{u:2,id:'u0',ro:[['atk',5]]},{u:3,id:'0-ta',ro:'junk'}],
    shop:{day:1,g:0,stock:[{id:'0-wa',ro:[['bogus',1]]}]}});
  eq(canon(g.inv[0].ro),canon([['atk',3],['crit',3],['will',1]])); eq(g.inv[1].ro,undefined,'uniques never keep rolls'); eq(g.inv[2].ro,undefined); eq(g.shop.stock[0].ro,undefined);
});
test('Rolls: the bag compares each piece with what you wear',()=>{
  S.equip.weapon={u:++S.uid,id:'0-wa'}; const b=give('1-wa'); b.ro=[['will',2]]; const h=cmpHTML(b); ok(/class="up"/.test(h)&&/Will/.test(h)); ok(!/class="down"/.test(h));
  const c=give('0-wb'); ok(/class="down"/.test(cmpHTML(c)),'losing Strike shows in red'); eq(cmpHTML(S.equip.weapon),''); ok(/empty/.test(cmpHTML(give('0-aa'))));
});

})();
