// Town Buildings tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Town: buildings cost gold, then bone dust, and stop at level 3',()=>{
  S.gold=0; ok(!build('crypt'),'no gold'); S.gold=1e6; ok(build('crypt')); eq(bl('crypt'),1); eq(S.gold,1e6-BUILD_COST[0][0]);
  ok(!build('crypt'),'level 2 needs dust'); S.dust=200; ok(build('crypt')); ok(build('crypt')); eq(bl('crypt'),BUILD_MAX); eq(S.dust,200-BUILD_COST[1][1]-BUILD_COST[2][1]);
  ok(!build('crypt'),'maxed'); eq(buildCost('crypt'),null); ok(!build('nope'));
  arena([foe()]); ok(!build('forge'),'not in battle'); eq(bl('forge'),0);
});
test('Town: each building changes its numbers',()=>{
  const P=S.player; setLvl(60); P.stats.will=100; eq(slots(),10); S.build.crypt=2; eq(slots(),12,'Crypt lifts the cap');
  const it=give('3-wa'), r0=reforgeCost(it), e0=enchCost(it); S.build.forge=2; eq(reforgeCost(it),Math.round(buyPrice(ITEM['3-wa'])*REFORGE_COST*.7)); ok(enchCost(it)<e0&&reforgeCost(it)<r0);
  setLvl(1); P.stats.will=4; const c=corpse({}), ch=raiseChance(c); S.build.ossuary=1; eq(raiseChance(c),ch+3);
  const m0=pMana(), mn=mkMinion({lvl:1}), ec=empowerCost(mn); S.build.altar=2; near(pMana(),m0*1.1,1); eq(empowerCost(mn),Math.round(mneed(1)*.6*.8)); ok(empowerCost(mn)<=ec);
});
test('Town: building the Altar fills the new mana at once, like gear',()=>{ const P=S.player; S.gold=1e4; P.mana=pMana(); ok(build('altar')); eq(P.mana,pMana()); invariants('altar'); });
test('Town: the Town tab shows the buildings; saves keep only valid buildings and dust',()=>{
  setLvl(6); ui.tab='town'; const h=renderAll('town'); ok(/data-a="build" data-k="crypt"/.test(h)&&/Flesh Pit/.test(h));
  S.gold=1e4; ACTIONS.build('ossuary'); eq(bl('ossuary'),1); ok(ui.msg&&/Ossuary raised to level 1/.test(ui.msg.m));
  const g=normalizeSave({v:2,player:{lvl:1},build:{crypt:2,forge:9,fake:1,altar:'x',ossuary:0},dust:-5});
  eq(JSON.stringify(g.build),'{"crypt":2,"forge":3}'); eq(g.dust,0);
  const o=normalizeSave({v:2,player:{lvl:1}}); eq(JSON.stringify(o.build),'{}'); eq(o.dust,0); eq(o.bounty,null);
});

})();
