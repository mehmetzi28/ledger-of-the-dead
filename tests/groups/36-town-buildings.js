// Town Buildings tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Town: buildings cost gold, then bone dust, wait for the Throne past level 3 and stop at level 5',()=>{
  S.gold=0; ok(!build('crypt'),'no gold'); S.gold=1e6; ok(build('crypt')); eq(bl('crypt'),1); eq(S.gold,1e6-BUILD_COST[0][0]);
  ok(!build('crypt'),'level 2 needs dust'); S.dust=200; ok(build('crypt')); ok(build('crypt')); eq(bl('crypt'),3); eq(S.dust,200-BUILD_COST[1][1]-BUILD_COST[2][1]);
  S.dust=1e4; ok(!build('crypt'),'level 4 waits for the Throne'); S.ti=S.ti||{}; S.ti.clr=Object.assign(S.ti.clr||{},{5:1}); ok(build('crypt')&&build('crypt')); eq(bl('crypt'),BUILD_MAX); ok(!build('crypt'),'maxed'); eq(buildCost('crypt'),null); ok(!build('nope'));
  arena([foe()]); ok(!build('forge'),'not in battle'); eq(bl('forge'),0);
});
test('Town: each building changes its numbers',()=>{
  const P=S.player; setLvl(60); P.stats.will=100; eq(slots(),ARMY_CAP); S.build.crypt=2; eq(slots(),ARMY_CAP+2,'Crypt lifts the cap');
  const it=give('3-wa'), r0=reforgeCost(it), e0=enchCost(it); S.build.forge=2; eq(reforgeCost(it),Math.round(buyPrice(ITEM['3-wa'])*REFORGE_COST*.7)); ok(enchCost(it)<e0&&reforgeCost(it)<r0);
  setLvl(1); P.stats.will=4; const c=corpse({}), ch=raiseChance(c); S.build.ossuary=1; eq(raiseChance(c),ch+3);
  const m0=pMana(), mn=mkMinion({lvl:1}), ec=empowerCost(mn); S.build.altar=2; near(pMana(),m0*1.1,1); eq(empowerCost(mn),Math.round(mneed(1)*.6*.76)); ok(empowerCost(mn)<=ec);
});
test('Town: measured building numbers, the cheaper Forge and Ossuary steps, and what each gives now on the Town tab',()=>{
  eq([B_FORGE,B_OSS,B_ALT_MANA,B_ALT_COST].join(),'0.15,3,0.05,0.12','measured 2026-11-15 (Altar discount 10% to 12%)');
  eq(JSON.stringify(buildCost('ossuary')),JSON.stringify(BUILD_COST[0])); S.build.ossuary=1; eq(JSON.stringify(buildCost('ossuary')),JSON.stringify(BUILD_COST[0]),'level 2 at the level-1 price'); S.build.ossuary=2; eq(JSON.stringify(buildCost('ossuary')),JSON.stringify(BUILD_COST[1])); S.build.ossuary=3; eq(JSON.stringify(buildCost('ossuary')),JSON.stringify(BUILD_COST[2])); S.build.ossuary=BUILD_MAX; eq(buildCost('ossuary'),null); S.build.ossuary=3;
  S.build.forge=2; eq(JSON.stringify(buildCost('forge')),JSON.stringify(BUILD_COST[1])); S.build.crypt=1; eq(JSON.stringify(buildCost('crypt')),JSON.stringify(BUILD_COST[1]),'Crypt untouched'); S.build.altar=2; eq(JSON.stringify(buildCost('altar')),JSON.stringify(BUILD_COST[2]));
  setLvl(6); ui.tab='town'; ui.tlist=true; const h=renderAll('town now');   // List: every building's row at once
  for(const s of ['Now: +1 army slot, +'+RESERVE_CRYPT+' Reserve places.','Now: reforging and enchanting 30% cheaper.','Now: +9% raise chance.','Now: +10% max mana, Bone Altar 24% cheaper.']) ok(h.includes(s),s);
  S.build={}; ok(!/Now: /.test(renderAll('none')),'nothing built, no line'); ui.tlist=false;
  eq(trText('Now: +9% raise chance.'),'Şu an: +%9 diriltme şansı.'); eq(trText('Now: +2 army slots'),'Şu an: +2 ordu yeri'); eq(trText('Now: +10% max mana, Bone Altar 24% cheaper'),'Şu an: +%10 azami mana, Kemik Sunağı %24 daha ucuz');
  ok(/Forge and the Ossuary cost one step less/.test(cdx('town')),'Codex');
});
test('Town: building the Altar fills the new mana at once, like gear',()=>{ const P=S.player; S.gold=1e4; P.mana=pMana(); ok(build('altar')); eq(P.mana,pMana()); invariants('altar'); });
test('Town: the Town tab shows the buildings; saves keep only valid buildings and dust',()=>{
  setLvl(6); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1}}); ui.tab='town'; const h=renderAll('town'); ok(/data-a="build" data-k="crypt"/.test(h)&&/Flesh Pit/.test(h));
  S.gold=1e4; ACTIONS.build('ossuary'); eq(bl('ossuary'),1); ok(ui.msg&&/Ossuary raised to level 1/.test(ui.msg.m));
  const g=normalizeSave({v:2,player:{lvl:1},build:{crypt:2,forge:9,fake:1,altar:'x',ossuary:0},dust:-5});
  eq(JSON.stringify(g.build),'{"crypt":2,"forge":'+BUILD_MAX+'}'); eq(g.dust,0);
  const o=normalizeSave({v:2,player:{lvl:1}}); eq(JSON.stringify(o.build),'{}'); eq(o.dust,0); eq(o.bounty,null);
});
test('Town: the village shows one building per BUILD entry; pressing one opens its row, List shows them all',()=>{
  setLvl(6); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1}}); S.build={forge:1}; S.gold=0; ui.tab='town'; ui.bsel=null; ui.tlist=false; let h=renderAll('village');
  eq((h.match(/class="vb[^"]*" data-a="bsel"/g)||[]).length,Object.keys(BUILD).filter(bOpen).length,'a button per open building'); ok(/class="vb built" data-a="bsel" data-k="forge" aria-pressed="false"/.test(h),'built is lit');
  ok(/data-k="crypt" aria-pressed="true"/.test(h)&&/vb-svg ruin/.test(h),'the first is open; unbuilt ones are ruins'); eq((h.match(/data-a="build" data-k=/g)||[]).length,1,'only the open building\'s row');
  ACTIONS.bsel('altar'); h=renderAll('altar'); ok(/data-a="build" data-k="altar"/.test(h)&&!/data-a="build" data-k="crypt"/.test(h),'pressing a building opens its row');
  S.gold=1e4; ok(/data-k="forge" aria-pressed="false">[\s\S]*?Can build/.test(renderAll('can')),'affordable is marked');
  ACTIONS.bsel('list'); h=renderAll('list'); eq((h.match(/data-a="build" data-k=/g)||[]).length,Object.keys(BUILD).filter(bOpen).length,'List: every row'); ok(!/class="vb[^"]*" data-a="bsel" data-k="\w+" aria-pressed="true"/.test(h),'no building picked in List');
  ACTIONS.bsel('list'); ACTIONS.bsel('nope'); eq(ui.bsel,'altar','unknown keys are ignored'); ui.bsel=null;
  VIEW.lang='tr'; ok(trText('Show every building as a list')!=='Show every building as a list'&&trText('Can build')!=='Can build'&&trText('Sealed · Lv 12')==='Mühürlü · Sv 12','Turkish'); VIEW.lang='en';
});

})();
