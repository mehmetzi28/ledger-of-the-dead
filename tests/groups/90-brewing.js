// Brewing 2.0, the belt and run prep (src/game-brew.js, R4 PR B): recipes by part and gate, oils, incense, charms, banners, draughts.
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,renderAll}=window.LOTD_T;
const pouch=(g,n)=>{ S.trophies={}; for(const k in TROPHY) if(!k.startsWith('b:')&&partGate(k)>=(g||0)) S.trophies[k]=n||3; };
const town=()=>{ fresh(40); S.mode='town'; S.gold=1e5; S.dust=1e3; return S; };

test('Brewing: every trophy kind has a role; recipes need their parts from a deep enough gate, spend the cheapest and some gold',()=>{
  Object.keys(TROPHY).filter(k=>!k.startsWith('b:')).forEach(k=>ok(TROPHY_PART[TROPHY[k].role],k+' has a role'));
  town(); S.trophies={}; ok(!brewCan('oil_fire'),'no parts');
  const lo=Object.keys(TROPHY).filter(k=>!k.startsWith('b:')&&!k.startsWith('t:')&&trophyGate(k)<2);
  lo.forEach(k=>S.trophies[k]=9); ok(!brewCan('oil_fire'),'gate E and D parts do not make an oil'); ok(brewCan('inc_low')===lo.some(k=>TROPHY[k].role==='mender'&&trophyGate(k)>=1),'Low Incense takes gate D menders');
  pouch(2,3); const n0=Object.values(S.trophies).reduce((a,b)=>a+b,0), g=S.gold; ok(brewIt('oil_fire')); eq(stashN('oil_fire'),1); eq(g-S.gold,brewGold('oil_fire')); eq(n0-Object.values(S.trophies).reduce((a,b)=>a+b,0),4,'3 striker + 1 reaper');
  const tw=Object.keys(TROPHY).filter(k=>k.startsWith('t:')); S.trophies={}; tw.forEach(k=>S.trophies[k]=3); ok(brewCan('bn_courage')||!tw.some(k=>TROPHY[k].role==='vanguard'),'Tower trophies count as the deepest gate');
  S.mode='battle'; pouch(0,9); ok(!brewIt('dr_iron'),'only in town');
});
test('Brewing: the stash holds five of each; charms take spare hearts, never those a unique still needs',()=>{
  town(); pouch(0,50); for(let i=0;i<7;i++) brewIt('inc_low'); eq(stashN('inc_low'),BREW_STASH);
  S.trophies={'b:The Rat King':1}; ok(!brewCan('ch_draft'),'two hearts'); S.trophies['b:The Rat King']=2; ok(brewIt('ch_draft')); ok(!S.trophies['b:The Rat King']);
  const u=Object.values(ITEM).find(d=>d.uq&&!d.tower&&d.set===0); S.inv.push({u:++S.uid,id:u.id}); S.trophies['b:The Rat King']=3; ok(!brewCan('ch_draft'),'the unique needs them'); eq(spareHearts().length,0);
});
test('Belt: draughts go on the belt; it holds one more at Forge levels 2 and 3; old belts load',()=>{
  town(); pouch(0,50); eq(beltMax(),BELT_MAX); for(let i=0;i<9;i++) brewIt('dr_iron'); eq(S.belt.iron,BELT_MAX);
  S.build.forge=2; eq(beltMax(),BELT_MAX+1); S.build.forge=3; eq(beltMax(),Math.min(BELT_CAP,BELT_MAX+2)); ok(brewIt('dr_iron')); S.gold=1e5; ok(buyPotion('hp')&&buyPotion('hp')&&buyPotion('hp')&&buyPotion('hp'),'four potions with the bigger belt');
  const g=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{belt:{hp:2,mp:1}})))); eq(g.belt.hp,2); ok(!g.belt.iron,'no draughts in an old belt');
  const g2=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{belt:{hp:9,mp:0,iron:9},build:{}})))); eq(g2.belt.hp,BELT_MAX); eq(g2.belt.iron,BELT_MAX);
});
test('Draughts: the Iron Draught softens every blow for two turns; Bloodwine mends your whole side',()=>{
  fresh(30); const t=foe({hp:1e6,atk:100}); arena([t],0); S.mode='battle'; const P=S.player, m=mkMinion({lvl:20}); S.belt.iron=1; S.belt.blood=1;
  P.hp=pMax(); let h=P.hp; hurtAlly(P,100); const full=h-P.hp; P.hp=pMax(); ok(drink('iron')); eq(S.belt.iron,0); h=P.hp; hurtAlly(P,100); eq(h-P.hp,Math.round(full*(1-IRON_DR)),'25% less');
  const mh=m.hp; hurtAlly(m,100); ok(mh-m.hp<100,'minions too'); S.run.turn+=IRON_TURNS; P.hp=pMax(); h=P.hp; hurtAlly(P,100); eq(h-P.hp,full,'wears off');
  P.hp=10; m.hp=1; ok(drink('blood')); ok(P.hp>10&&m.hp>1,'both mended'); eq(S.belt.blood,0); ok(!drink('blood'),'none left');
  S.belt.iron=1; S.pacts=['dry']; S.belt.hp=1; ok(!drink('hp'),'Dry Throat: no potions'); P.hp=pMax(); ok(drink('iron'),'draughts still work'); h=P.hp; hurtAlly(P,100); eq(h-P.hp,Math.round(full*(1-IRON_DR*PACT_DRY)),'at half');
});
test('Run prep: an armed oil, incense and charm go with each gate run while the stash lasts',()=>{
  town(); setLvl(20); pouch(3,30); brewIt('oil_fire'); brewIt('inc_grave'); S.trophies['b:The Rat King']=2; brewIt('ch_lantern');
  ok(prepSet('oil','oil_fire')&&prepSet('inc','inc_grave')&&prepSet('charm','ch_lantern')); ok(!prepSet('oil','inc_low'),'kind must match'); ok(!prepSet('charm','ch_quiet'),'Quiet Grave is burned, not carried');
  S.watches=WATCHES; startRun(0); const r=S.run; eq(r.oil,'oil_fire'); eq(r.inc,'inc_grave'); eq(r.charm,'ch_lantern'); eq(stashN('oil_fire'),0); eq(T_('prepUsed'),3);
  S.mode='town'; S.run=null; startRun(0); ok(!S.run.oil,'the stash ran out'); eq(S.prep.oil,'oil_fire','still armed for next time');
  S.mode='town'; S.run=null; ok(prepSet('oil','oil_fire')); ok(!S.prep.oil,'pressing again disarms');
  const g=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{prep:{oil:'inc_low',inc:'inc_grave',charm:'nope'},stash:{oil_fire:99,dr_iron:2,x:1}}))));
  eq(JSON.stringify(g.prep),JSON.stringify({inc:'inc_grave'})); eq(JSON.stringify(g.stash),JSON.stringify({oil_fire:BREW_STASH}));
});
test('Oils, incense and charms do what they say',()=>{
  fresh(30); const t=foe({hp:1e6,atk:1}); arena([t],1); S.mode='battle'; const r=S.run, m=mkMinion({lvl:20,role:'striker'});
  r.oil='oil_frost'; eq(minionType(m),'frost'); const w=foeRes(t,'frost')<0; HITTER=m; eq(oilK(t,'frost'),w?1+OIL_WEAK:1); eq(oilK(t,'fire'),1); HITTER=S.player; eq(oilK(t,'frost'),1,'only the army'); HITTER=null; r.oil=null;
  const c={id:'c1',name:'Tunnel Rat',base:'Tunnel Rat',role:'striker',rankI:0,lvl:20,boss:false,elite:false}; const c0=raiseChance(c);
  r.inc='inc_low'; eq(raiseChance(c),Math.min(RAISE_MAX,c0+INC_LOW)); r.inc='inc_grave'; eq(raiseChance(c),Math.min(RAISE_MAX,c0+INC_GRAVE)); r.inc=null;
  r.charm='ch_draft'; const P=S.player; P.hp=0; ok(!playerFalls(),'Second Draft'); eq(P.hp,Math.round(pMax()*DRAFT_HP)); P.hp=0; r.revives=9; S.mode='battle';
  r.charm='ch_door'; for(let i=0;i<20;i++){ r.room=0; const d=rollDoors(r); ok(d.includes('elite'),'an elite door'); }
  r.charm='ch_lantern'; ok(doorSight(1)>=1,'the Lantern reads the doors');
  r.charm='ch_order'; mkMinion({lvl:20,role:'vanguard'}); r.cmd={}; ok(command('vanguard')); ok(canCommand('vanguard'),'a second order'); ok(command('vanguard')); ok(!canCommand('vanguard'),'only once');
});
test('Abbot\'s Incense brings a Soul to the boss room; a Quiet Grave pushes the siege; banners ride with raids',()=>{
  fresh(30); S.mode='town'; S.watches=WATCHES; S.stash={inc_abbot:1}; S.prep={inc:'inc_abbot'}; startRun(0); const r=S.run; r.room=r.rooms-1; const s0=r.souls||0; spawnRoom(); eq(r.souls,s0+1); spawnRoom(); eq(r.souls,s0+1,'once');
  fresh(40); S.mode='town'; S.stash={ch_quiet:1}; S.siege={next:S.day+2,pending:false,dmg:null,warned:0}; const open=siegeOpen(); ok(useCharm('ch_quiet')===open); if(open) eq(S.siege.next,S.day+2+QUIET_DAYS);
  const o={}; S.stash={bn_courage:1}; S.prep={banner:'bn_courage'}; bannerTake(o); eq(o.bn,'bn_courage'); eq(stashN('bn_courage'),0); eq(bannerOdds(o,.5),.5+BANNER_ODDS); eq(bannerGold({bn:'bn_spoils'}),BANNER_GOLD);
  S.stash={bn_host:1}; S.prep={banner:'bn_host'}; const c={stage:0,boss:false}; eq(squadMax(c),1+RAID_SQUAD+1,'the Host');
});
test('Brewing: the market, the Gates tab, the battle buttons and Turkish',()=>{
  town(); pouch(3,30); brewIt('oil_fire'); brewIt('dr_iron'); ui.tab='market'; ui.mk='brew'; let h=renderAll('brew'); ok(/data-a="brewx"/.test(h)&&h.includes('Oil of Embers')&&h.includes('Bone charms'));
  ACTIONS.brewx('inc_low'); eq(stashN('inc_low'),1); ui.tab='gates'; h=renderAll('gates'); ok(/Run prep/.test(h)&&/data-a="prep"/.test(h)); ACTIONS.prep('oil|oil_fire'); eq(S.prep.oil,'oil_fire');
  fresh(30); arena([foe({hp:1e6})],0); S.mode='battle'; S.belt.iron=1; h=renderAll('battle'); ok(/data-k="pot:iron"/.test(h),'the draught button');
  VIEW.lang='tr'; BREW_IDS.forEach(id=>{ ok(trText(BREWS[id].name)!==BREWS[id].name,id); ok(trText(BREWS[id].desc)!==BREWS[id].desc,id+' desc'); });
  Object.values(BREW_KIND_NAME).forEach(s=>ok(trText(s)!==s,s)); ['Run prep','Brewing','Iron Draught','Bloodwine'].forEach(s=>ok(trText(s)!==s,s)); VIEW.lang='en';
});
})();
