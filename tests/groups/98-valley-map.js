// The valley map, R19 PR A (src/game-map.js, src/ui-map.js): travel in steps and watches, fog, graveyards and battlefields,
// dug bodies raised in town, the save, the view, the Codex page and Turkish.
(function(){
const {test,ok,eq,fresh,setLvl,renderAll,invariants}=window.LOTD_T;
const clr=o=>{ S.ti=S.ti||{}; S.ti.clr=o; };
const town=()=>{ S.mode='town'; S.run=null; S.watches=WATCHES; };
test('Valley: the roads and nodes are whole: every node is reachable, every road joins two nodes, every gate has a node',()=>{
  for(const [a,b,n] of VALLEY_ROADS){ ok(VALLEY_NODES[a]&&VALLEY_NODES[b],a+'-'+b); ok(n>=1&&n<=3,'steps '+n); }
  for(const id of MAP_IDS){ ok(isFinite(mapDist('T',id)),'reachable '+id); const n=VALLEY_NODES[id]; ok(n.x>=0&&n.x<=100&&n.y>=0&&n.y+6.4<=76,'on the vellum '+id); ok(MAP_GLYPH[n.k],'glyph '+id); }
  for(let i=0;i<GATE_N;i++) eq(VALLEY_NODES[gateNode(i)].g,i);
  eq(mapDist('T','T'),0); eq(mapDist('T','g0'),1); eq(mapDist('g0','g1'),1); eq(mapDist('T','nope'),Infinity);
});
test('Valley: a run from where you stand is free; elsewhere the walk is paid in steps, every '+MAP_STEP+' a watch; you then stand at the gate',()=>{
  fresh(30); town(); clr({0:1,1:1,2:1,3:1,4:1}); mapSt();
  eq(mapPos(),'T'); startRun(0); eq(S.mode,'battle'); eq(S.map.pos,'g0'); eq(S.map.st,1); eq(S.watches,WATCHES-1,'one step: no watch for the walk');
  town(); S.map.pos='g0'; S.map.st=0; startRun(0); eq(S.map.st,0,'from where you stand: free'); eq(S.watches,WATCHES-1);
  town(); S.map.pos='T'; S.map.st=2; const w=S.watches; startRun(3); eq(S.map.pos,'g3'); eq(S.map.st,1,'2 + 2 steps = a watch and 1 over'); eq(S.watches,w-2,'a watch for the walk and one for the run');
  eq(T_('mapW'),1); eq(S.map.steps,3,'steps kept');
});
test('Valley: a walk that would leave no watch for the run is refused, and the gate card says so',()=>{
  fresh(30); town(); clr({0:1,1:1,2:1,3:1,4:1,5:1}); mapSt(); S.watches=1; S.map.st=2;
  ok(!mapCan('g3'),'too far'); startRun(3); eq(S.mode,'town','refused'); eq(S.map.pos,'T'); eq(S.watches,1);
  ok(mapCan('T'),'standing still is free'); ui.tab='gates'; ui.gsub='valley'; ui.vsel='g3'; const h=renderAll('far');
  ok(/data-a="enter" data-k="3" disabled title="Too far for the watches left today"/.test(h),'the Enter button is shut');
  S.watches=0; ok(!mapCan('g0'),'no watches, no walk');
});
test('Valley: at dawn you are pulled home; the steps and the dug bodies go',()=>{
  fresh(30); town(); mapSt(); S.map.pos='g3'; S.map.st=2; S.map.bodies=[{c:{name:'Tunnel Rat',base:'Tunnel Rat',role:'striker',rankI:0,lvl:3,hf:1,af:1,old:1},s:'gy0'}];
  restDay(); eq(S.map.pos,'T'); eq(S.map.st,0); eq(S.map.bodies.length,0); ok(S.notices.some(n=>/crumbled back into the earth/.test(n.m)),'told');
});
test('Valley: fog: the town and the first gates from the start; an open gate, the Tower and the neighbours of a cleared gate later',()=>{
  fresh(1); ['T','g0','g1'].forEach(id=>ok(mapSeen(id),id)); ok(!mapSeen('g6'),'the last gate hidden'); ok(!mapSeen('gy1'),'Lych Hill hidden'); ok(!mapSeen('tw'),'the Tower hidden');
  S.watches=WATCHES; ok(!mapCan('g6'),'an unseen node cannot be walked to');
  clr({1:1}); ok(mapSeen('gy1'),'next to a cleared gate'); ok(mapSeen('bf0')); ok(mapSeen('g6'),'the gate beyond a cleared one'); clr({}); setLvl(RK[6].unlock); ok(mapSeen('g6')===!gateLocked(6),'an open gate');
  ui.tab='gates'; ui.gsub='valley'; const h=renderAll('fog'); ok(/class="v-fog"/.test(h)||MAP_IDS.every(mapSeen),'smudges for the unknown');
});
test('Valley: a graveyard gives old bodies of the nearest gate, '+MAP_OLD+'% harder to raise, then rests '+MAP_GY_REST+' days',()=>{
  fresh(20); town(); clr({0:1}); mapSt(); S.map.pos='g0'; ok(mapSeen('gy0')&&siteReady('gy0'));
  const b=siteVisit('gy0'); ok(b&&b.length>=MAP_GY_N[0]&&b.length<=MAP_GY_N[1],'bodies: '+(b&&b.length)); eq(S.map.pos,'gy0'); eq(S.map.st,1);
  const g=nearGate('gy0'); ok(b.every(c=>c.old&&DUNGEONS[g].mobs.some(m=>m[0]===c.name)),'the nearest gate\'s kinds');
  eq(siteRest('gy0'),MAP_GY_REST); ok(!siteReady('gy0')); eq(siteVisit('gy0'),null,'resting');
  const c=Object.assign({},b[0]); const plain=Object.assign({},c); delete plain.old; eq(mapRaise(c),-MAP_OLD); eq(mapRaise(plain),0);
  S.day+=MAP_GY_REST; ok(siteReady('gy0'),'rested');
  ui.tab='gates'; ui.gsub='valley'; const h=renderAll('dug'); ok(/Bodies from the valley/.test(h)&&/data-a="vraise" data-k="0"/.test(h),'the dug list');
  const n=S.army.length, k=S.map.bodies.length, mana=S.player.mana; const r=siteRaise(0); ok(r,'tried'); eq(S.map.bodies.length,k-1); eq(S.player.mana,mana,'no mana'); eq(S.mode,'town'); eq(S.run,null);
  if(r.ok) eq(S.army.length+((S.reserve||[]).length?0:0)>=n,true); invariants('dig');
});
test('Valley: a battlefield fills after a siege with the fallen living, '+MAP_FRESH+'% easier to raise, once',()=>{
  fresh(20); town(); clr({1:1}); mapSt(); ok(!siteReady('bf0'),'empty before a siege'); mapSiege(); ok(siteReady('bf0'));
  S.map.pos='g1'; const b=siteVisit('bf0'); ok(b&&b.length>=MAP_BF_N[0]&&b.length<=MAP_BF_N[1]); ok(b.every(c=>c.fresh)); eq(mapRaise(b[0]),MAP_FRESH);
  ok(!siteReady('bf0'),'walked'); eq(T_('mapField'),b.length);
});
test('Valley: the walk to a site must leave a watch (a day never ends on the road); not mid-fight',()=>{
  fresh(20); town(); clr({0:1}); mapSt(); S.watches=1; S.map.st=1; S.map.pos='T';
  eq(siteVisit('gy0'),null,'2 steps with 1 over would take the last watch'); eq(S.watches,1);
  S.watches=2; ok(siteVisit('gy0')); eq(S.watches,1); eq(S.mode,'town');
  fresh(20); town(); clr({0:1}); mapSt(); S.watches=0; eq(siteVisit('gy0'),null,'no watch, no walk');
  S.watches=1; S.mode='battle'; eq(siteVisit('gy0'),null,'only in town');
});
test('Valley: the save keeps the map and cleans a bad one',()=>{
  fresh(20); town(); clr({0:1}); mapSt(); S.map.pos='g0'; S.map.st=2; siteVisit('gy0');
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(g.map),JSON.stringify(S.map),'round trip');
  const bad=JSON.parse(JSON.stringify(S)); bad.map={pos:'zz',st:99,seen:{zz:1,g3:1},sites:{gy0:{rest:'x'},nope:{rest:5},bf0:{fresh:1}},steps:-4,bodies:[{c:{name:'<b>x</b>',base:'Tunnel Rat',lvl:'q',role:'king',rankI:99},s:'gy0'},{c:{name:1},s:'gy0'},{c:{name:'a',base:'b'},s:'zz'},5]};
  const m=normalizeSave(bad).map; eq(m.pos,'T'); ok(m.st>=0&&m.st<MAP_STEP); eq(JSON.stringify(m.seen),'{"g3":true}'); ok(!m.sites.gy0&&!m.sites.nope&&m.sites.bf0.fresh); eq(m.steps,0);
  eq(m.bodies.length,1); ok(!/</.test(m.bodies[0].c.name),'name cleaned'); eq(m.bodies[0].c.lvl,1); eq(m.bodies[0].c.role,'striker'); ok(m.bodies[0].c.rankI<RANKS.length);
  const old=JSON.parse(JSON.stringify(S)); delete old.map; ok(!('map' in normalizeSave(old))||normalizeSave(old).map,'an old save loads');
});
test('Valley: the view draws the map, the card and the list; the Gates list still starts every gate; the Codex page and its "?"',()=>{
  fresh(20); town(); clr({0:1,1:1}); ui.tab='gates'; ui.gsub='valley';
  let h=renderAll('valley'); ok(/<svg class="vmap"/.test(h),'the map'); ok(/data-a="vnode" data-k="g0"/.test(h),'places to press'); ok(/class="chips v-list"/.test(h),'the list');
  ok(/data-a="cxgo" data-k="valley"/.test(h),'the "?" opens the Codex'); ok(/Watches /.test(h)&&/You stand at/.test(h),'the plan');
  ACTIONS.vnode('gy0'); eq(ui.vsel,'gy0'); h=renderAll('site card'); ok(/data-a="vsite" data-k="gy0"/.test(h),'Dig'); ACTIONS.vsite('gy0'); ok(S.map.bodies.length>0);
  ACTIONS.vnode('zz'); eq(ui.vsel,'gy0','a bad node is ignored');
  ui.gsub='open'; h=renderAll('list'); ok(/data-a="enter" data-k="0"/.test(h),'the list view enters gates');
  ok(CODEX.some(c=>c[0]==='valley')); const cx=cxValleyHTML(); ok(cx.includes('Every '+MAP_STEP+' steps')&&cx.includes(MAP_GY_REST+' days'),'from the constants');
  ok(TIPS.some(t=>t.id==='valley')&&tipKind(TIPS.find(t=>t.id==='valley'))==='sys');
});
test('Valley: with the map off every road is free, as before',()=>{
  fresh(30); town(); clr({0:1,1:1,2:1,3:1,4:1}); mapSt(); S.map.st=2; MAP_ON=false;
  try{ eq(mapPos(),'T'); eq(tripSteps('g4'),0); ok(mapCan('g4')); startRun(4); eq(S.watches,WATCHES-1); eq(S.map.st,2,'no steps'); }
  finally{ MAP_ON=true; }
});
test('Valley: Turkish for the view, the sites and the Codex page',()=>{
  const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
  ['Valley map','Steps toward a watch','You stand at','Known places · 4/15','2 steps: spends a watch','1 step','Dig · 1 step','Walk the field','Rest until dawn','Bodies from the valley · until dawn',
   'Old bones of the Rat Warren\'s kinds: 2 to 4 bodies to raise before dawn, 10% harder to raise. Ready to dig.','Dug over: ready in 5 days',
   'The fallen of the last siege lie here: 3 to 6 fresh bodies, 10% easier to raise. Fresh dead wait.','Old bones from Potter\'s Field · 54% to rise',
   'You dig at Potter\'s Field: 3 bodies to raise before dawn.','2 dug bodies crumbled back into the earth at dawn.','Dig 100 bodies out of the valley\'s old graveyards.','Walk 300 steps on the valley\'s roads.',
   'Too far for the watches left today','Risen: Tunnel Rat.','It did not rise.'
  ].forEach(s=>ok(tr(s)!==s,'Turkish: '+s));
});
})();
