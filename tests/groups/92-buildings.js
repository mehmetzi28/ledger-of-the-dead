// The necropolis grows (src/game-town2.js, R5 PR A): levels 4-5, specializations, the seven new buildings and their hooks.
(function(){
const {test,ok,eq,near,fresh,setLvl,foe,arena,mkMinion,corpse,renderAll,invariants}=window.LOTD_T;
const town=lvl=>{ fresh(lvl||40); S.mode='town'; S.gold=1e7; S.dust=1e5; S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1}; return S; };
const up=(k,n)=>{ for(let i=0;i<n;i++) ok(build(k),k+' to '+(blRaw(k)+1)); };

test('Buildings: seven new ones open as the town grows, and the Town tab lists only the open ones',()=>{
  fresh(10); S.mode='town'; S.build={crypt:1}; S.ti=S.ti||{}; S.ti.clr={0:1};
  ok(bOpen('yard'),'the Yard with the town'); ok(!bOpen('library')&&!bOpen('embalm')&&!bOpen('bell')&&!bOpen('apoth')&&!bOpen('war'),'the rest wait');
  S.ti.clr={0:1,1:1,2:1}; ok(bOpen('library')&&!bOpen('embalm')); S.ti.clr[3]=1; ok(bOpen('embalm'));
  tally('siegeWarned'); ok(bOpen('bell')); S.build.forge=2; ok(bOpen('apoth')); tally('raidsSent'); ok(bOpen('war'));
  S.gold=0; ok(!build('temple'),'the Temple needs an oath');
  ui.tab='town'; ui.tlist=true; const h=renderAll('town2'); ok(/data-k="yard"/.test(h)&&/data-k="library"/.test(h)&&/Charnel Yard/.test(h)); ok(!/data-k="temple"/.test(h),'no Temple without an oath');
});
test('Buildings: every building stops at level 5, levels 4 and 5 wait for the Throne, and old saves are capped',()=>{
  town(); S.ti.clr={0:1,1:1,2:1,3:1,4:1}; up('yard',3); ok(!build('yard'),'the Throne first'); ok(!buildReady('yard')); S.ti.clr[5]=1; ok(buildReady('yard')); up('yard',2); eq(blRaw('yard'),BUILD_MAX); ok(!build('yard')); eq(buildCost('yard'),null);
  eq(BUILD_COST.length,BUILD_MAX); ok(BUILD_COST[3][0]>BUILD_COST[2][0]&&BUILD_COST[4][0]>BUILD_COST[3][0],'each level dearer');
  const g=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{build:{crypt:9,yard:5},spec:{crypt:{3:'a',5:'b'},yard:{3:'z'},nope:{3:'a'}}}))));
  eq(g.build.crypt,BUILD_MAX); eq(JSON.stringify(g.spec),JSON.stringify({crypt:{3:'a',5:'b'}}),'only valid picks at a reached level');
  const g2=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{build:{crypt:2},spec:{crypt:{3:'a'}}})))); eq(JSON.stringify(g2.spec),'{}','a pick above the level is dropped');
});
test('Specializations: offered at levels 3 and 5, one of two, final, and shown on the Town tab',()=>{
  town(); eq(specPend('crypt').length,0); up('crypt',3); eq(JSON.stringify(specPend('crypt')),'[3]'); ok(!chooseSpec('crypt',5,'a'),'not yet'); ok(!chooseSpec('crypt',3,'c'),'a or b');
  ui.tab='town'; ui.tlist=true; let h=renderAll('spec'); ok(/data-a="spec"/.test(h)&&h.includes('Ossuary Halls')&&h.includes('War Crypt'));
  S.mode='battle'; ok(!chooseSpec('crypt',3,'a'),'only in town'); S.mode='town';
  ok(chooseSpec('crypt',3,'a')); ok(hasSpec('crypt',3,'a')&&!hasSpec('crypt',3,'b')); ok(!chooseSpec('crypt',3,'b'),'final'); eq(specPend('crypt').length,0);
  up('crypt',2); ok(chooseSpec('crypt',5,'b')); eq(specName('crypt',5,'b'),'Throne Crypt'); eq(T_('specs'),2);
  Object.keys(SPEC).forEach(k=>{ ok(BUILD[k],k+' is a building'); [3,5].forEach(lv=>{ eq(SPEC[k][lv].length,2,k+lv); SPEC[k][lv].forEach(([n,d])=>{ VIEW.lang='tr'; ok(trText(d)!==d,'Turkish: '+d); VIEW.lang='en'; }); }); });
  ACTIONS.spec('forge|3|a'); ok(!hasSpec('forge',3,'a'),'the Forge is not at level 3'); invariants('spec');
});
test('Specializations: the Crypt, Forge, Ossuary and Altar picks change their numbers',()=>{
  town(60); const P=S.player; P.stats.will=200; S.build={crypt:5,forge:5,ossuary:5,altar:5};
  const s0=slots(), r0=reserveMax(); S.spec={crypt:{3:'a',5:'b'}}; eq(slots(),s0+1,'Throne Crypt'); eq(reserveMax(),r0+4,'Ossuary Halls');
  const m=mkMinion({lvl:30}); S.spec={}; syncArmy(); const hp0=m.maxHp; S.spec={crypt:{3:'b'}}; syncArmy(); ok(m.maxHp>=Math.floor(hp0*1.05)-1,'War Crypt');
  S.spec={forge:{3:'b'}}; eq(temperK(),.75); S.spec={forge:{5:'b'}}; eq(temperStep(),2); S.spec={forge:{5:'a'}}; eq(hfTownK(),.75); S.spec={forge:{3:'a'}}; eq(smithK(),.1);
  const e=corpse({elite:true}), b=corpse({boss:true}), c=corpse({}); S.spec={}; const ce=raiseChance(e), cb=raiseChance(b), cc=raiseChance(c);
  S.spec={ossuary:{3:'a',5:'b'}}; ok(raiseChance(e)>=Math.min(RAISE_MAX,ce+10),'Charnel Rites'); ok(raiseChance(c)>=Math.min(RAISE_MAX,cc+5),'Deep Ossuary');
  S.spec={ossuary:{5:'a'}}; ok(raiseChance(b)>=Math.min(RAISE_MAX,cb+10),"Grave Lord's Seat");
  S.spec={}; const mp=pMana(), ec=empowerCost(m); S.spec={altar:{3:'b',5:'a'}}; near(pMana(),mp*1.1,1); ok(empowerCost(m)<ec,'Bone Altar'); S.spec={altar:{3:'a'}}; eq(skillK(),.95);
});
test('Specializations: the Soul Well starts a run with a Soul; the Grave Altar takes one from a boss',()=>{
  town(30); S.build.ossuary=3; S.spec={ossuary:{3:'b'}}; S.watches=WATCHES; S.run=null; startRun(0); ok((S.run.souls||0)>=1,'Soul Well');
  fresh(30); arena([foe({boss:true,hp:1})],0); S.build={altar:5}; S.spec={altar:{5:'b'}}; const s0=S.run.souls||0; townKill(S.run.enemies[0]); ok((S.run.souls||0)>s0,'Grave Altar');
});
test('New buildings: Library study, Apothecary prices and belt, War Room raids, Bell Tower warnings, Temple devotion',()=>{
  town(); S.build.library=2; eq(libStudy(),LIB_STUDY*2); S.spec={library:{3:'b'}}; S.build.library=3; eq(libStudy(),LIB_STUDY*3*1.5);
  S.build.apoth=0; S.spec={}; const p0=POTIONS.hp.price(), bg=brewGold('inc_low'), bm=beltMax(); S.build.apoth=3; ok(POTIONS.hp.price()<p0,'cheaper potions'); ok(brewGold('inc_low')<bg,'cheaper brews'); eq(beltMax(),Math.min(BELT_CAP,bm+1),'one more on the belt');
  S.build.war=0; const c={stage:0,boss:false}, q0=squadMax(c), o0=warOdds(); S.build.war=5; eq(squadMax(c),q0+3); near(warOdds(),WAR_ODDS*5,1e-9); S.spec={war:{5:'a'}}; near(warOdds(),WAR_ODDS*5+.05,1e-9);
  S.spec={war:{3:'b'}}; eq(brewGold('bn_courage'),0,'Quartermaster'); S.spec={war:{5:'b'}}; eq(spyK(),2);
  S.build.bell=4; eq(bellAhead(),2); S.build.temple=3; near(templeDev(),1+TEMPLE_DEV*3,1e-9); eq(templeBuff(),1+TEMPLE_BUFF);
  for(const k in TROPHY) if(!k.startsWith('b:')) S.trophies[k]=50; S.spec={apoth:{3:'a'}}; S.build.apoth=3; S.stash={}; ok(brewIt('inc_low')); eq(stashN('inc_low'),2,'Distillery brews two');
  S.spec={apoth:{5:'a'}}; S.build.apoth=5; const g=S.gold; ok(brewIt('inc_low')); eq(S.gold,g,'the first brew of the day is free'); const g2=S.gold; ok(brewIt('inc_low')); ok(S.gold<g2,'the second is not');
  S.spec={apoth:{3:'b'}}; S.build.apoth=3; eq(censerK(),2);
});
test('New buildings: the Plague Kitchen mends minions with a Healing Draught; the Archive strikes Ledgered kinds harder',()=>{
  fresh(30); arena([foe({hp:1e6})],0); S.mode='battle'; S.build={apoth:5}; S.spec={apoth:{5:'b'}}; const m=mkMinion({lvl:20}); m.hp=1; S.player.hp=1; S.belt.hp=1; ok(drink('hp')); ok(m.hp>1,'the minion is mended');
  S.build={library:5}; S.spec={library:{5:'b'}}; const e=S.run.enemies[0]; eq(archiveK(e),masteryOf(e.base)&&masteryOf(e.base).id==='ledgered'?1.05:1);
});
test('Sieges: every new building has a perk; the Bell Tower and Library soften the attackers, the War Room and Belfry pay more',()=>{
  ['yard','library','embalm','bell','apoth','war'].forEach(k=>{ ok(SIEGE_PERK[k],k); const t=SIEGE_PERK[k].t(2), d=SIEGE_PERK[k].d; VIEW.lang='tr'; ok(trText(d)!==d,d); ok(trText(t)!==t,t); VIEW.lang='en'; });
  fresh(30); S.build={bell:3,library:2}; S.spec={}; const L=[{maxHp:1000,hp:1000,atk:100,boss:false},{maxHp:1000,hp:1000,atk:100,boss:true}]; townSiegeWave(L,{room:0});
  eq(L[0].maxHp,Math.round(1000*(1-SIEGE_BELL*3))); eq(L[1].maxHp,Math.round(1000*(1-SIEGE_BELL*3)*(1-SIEGE_LIB*2))); eq(L[0].atk,100);
  S.spec={bell:{3:'a'}}; const L2=[{maxHp:100,hp:100,atk:100}]; townSiegeWave(L2,{room:0}); eq(L2[0].atk,95,'Watchtower');
  S.build={war:5}; S.spec={}; near(siegePayK(),1+SIEGE_WAR*5,1e-9); S.build={war:5,bell:3}; S.spec={bell:{3:'b'}}; near(siegePayK(),(1+SIEGE_WAR*5)*1.2,1e-9); S.build.bell=5; S.spec={bell:{5:'a'}}; eq(siegeDustK(),2);
  fresh(30); arena([foe({hp:1e6})],0); S.build={apoth:2}; S.player.hp=1; townSiegeWave([],{room:1}); ok(S.player.hp>1,'the salves');
});
test('Town: the Codex lists the new buildings, their open conditions and the specializations, in Turkish too',()=>{
  const c=codexSection('town'); ['Charnel Yard','Library','Embalmery','Bell Tower','Apothecary','War Room','Temple','Specializations'].forEach(s=>ok(c.includes(s),s));
  VIEW.lang='tr'; Object.keys(BUILD).forEach(k=>{ ok(trText(BUILD[k].name)!==BUILD[k].name,BUILD[k].name); ok(trText(BUILD[k].desc)!==BUILD[k].desc,k+' desc'); }); VIEW.lang='en';
});
})();
