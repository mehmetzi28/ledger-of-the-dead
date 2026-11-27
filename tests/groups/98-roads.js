// The valley's other sites, the roads and scouting, R19 PR B (src/game-roads.js, src/ui-map.js): shrines, the crossroads, the hermit,
// the mine and the den (fights), gallows, stones, the ford, road encounters, scouting and the raven, the map's markers, the save.
(function(){
const {test,ok,eq,fresh,renderAll,invariants,canon}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const clr=o=>{ S.ti=S.ti||{}; S.ti.clr=o; };
const all=()=>{ fresh(30); S.mode='town'; S.run=null; S.watches=WATCHES; clr({0:1,1:1,2:1,3:1,4:1,5:1}); mapSt(); MAP_IDS.forEach(id=>{ S.map.seen[id]=true; }); S.gold=1e6; S.notices=[]; };
const at=id=>{ S.map.pos=id; S.map.st=0; S.watches=WATCHES; S.mode='town'; S.run=null; siteState(id).rest=0; };
const win=()=>{ S.run.enemies.forEach(e=>{ e.hp=0; e.dead=true; }); roomWon(); };
const dayFor=(id,o)=>{ for(let d=S.day;d<S.day+60;d++){ const d0=S.day; S.day=d; if(crossOffer(id)===o) return d; S.day=d0; } return null; };
test('Roads: 30 places; every site kind has a glyph, a name, a rest and a card; the five shrines are the five gods',()=>{
  eq(MAP_IDS.length,30); for(const id of MAP_IDS){ const n=VALLEY_NODES[id]; ok(MAP_GLYPH[n.k]&&KIND_NAME[n.k],'kind '+n.k); ok(isFinite(mapDist('T',id)),'reachable '+id); }
  for(const k of SITE_KINDS) ok(MAP_IDS.some(id=>VALLEY_NODES[id].k===k),'a '+k);
  eq(MAP_IDS.filter(id=>VALLEY_NODES[id].k==='shrine').map(id=>VALLEY_NODES[id].g).sort().join(),GODS.slice().sort().join());
  for(const [a,b,n] of VALLEY_ROADS) ok(n>=1&&n<=3&&a!==b,a+'-'+b); eq(new Set(VALLEY_ROADS.map(([a,b])=>[a,b].sort().join())).size,VALLEY_ROADS.length,'no road twice');
  all(); for(const id of MAP_IDS.filter(isSite)){ ui.tab='gates'; ui.gsub='valley'; ui.vsel=id; const h=renderAll('site '+id); ok(h.includes('<h3>'+nodeName(id).replace(/'/g,'&#39;'))||h.includes('<h3>'+nodeName(id)),'card '+id); }
});
test('Roads: a shrine prays to your god, swears the unsworn, converts the rest; then rests a week',()=>{
  all(); const sh=MAP_IDS.find(id=>VALLEY_NODES[id].k==='shrine'&&VALLEY_NODES[id].g==='hon'); at(sh);
  S.faith={id:'hon',day:1,dev:0,dd:0,dday:0,vb:0,cv:0}; const d0=S.faith.dev; ok(siteAct(sh,'pray'),'prayed'); ok(S.faith.dev>d0,'devotion'); eq(siteRest(sh),SITE_REST.shrine); eq(siteAct(sh,'pray'),null,'resting');
  const o=MAP_IDS.find(id=>VALLEY_NODES[id].k==='shrine'&&VALLEY_NODES[id].g==='vesh'); at(o); ok(siteOpts(o).some(x=>x.k==='convert')); ok(siteAct(o,'convert')); eq(faithOf(),'vesh');
  S.faith=null; const u=MAP_IDS.find(id=>VALLEY_NODES[id].k==='shrine'&&VALLEY_NODES[id].g==='ulm'); at(u); if(faithOpen()){ ok(siteAct(u,'swear')); eq(faithOf(),'ulm'); } else ok(siteWhy(u,'swear'),'not yet');
});
test('Roads: the crossroads has a stranger a day: a pedlar, a bounty-man, the raven, then a map-seller',()=>{
  all(); const id='cr';
  ok(dayFor(id,'pedlar')!=null); at(id); const k=crossPot(id); S.belt[k]=0; ok(siteAct(id,'pedlar'),'bought'); eq(S.belt[k],1);
  ok(dayFor(id,'bounty')!=null); at(id); S.trophies={'Tunnel Rat':5}; const g=S.gold; ok(siteAct(id,'bounty')); eq(S.trophies['Tunnel Rat'],5-BOUNTY_TRO); ok(S.gold>g);
  ok(dayFor(id,'stranger')!=null); at(id); ok(siteAct(id,'raven')); ok(ravenOn()); at(id); eq(crossOffer(id),'mapsell','the stranger has no second raven');
});
test('Roads: the hermit trades trophies for a torn page or a lesson',()=>{
  all(); at('hm'); S.trophies={'Tunnel Rat':9}; S.pages=0; S.kills={'Grave Beetle':7}; const can=nextPage()>=0;
  if(can){ ok(siteAct('hm','page')); eq(S.pages,1); eq(S.trophies['Tunnel Rat'],9-HERMIT_TRO); }
  at('hm'); ok(siteAct('hm','lesson')); eq(S.kills['Grave Beetle'],KNOW_AT,'studied');
  at('hm'); S.trophies={}; ok(siteWhy('hm','lesson'),'no trophies, no lesson');
});
test('Roads: gallows give a hexer\'s body or calm the town; the stones call tomorrow; the ford saves a step or gives a Preserved body',()=>{
  all(); at('gl'); const n=(S.map.bodies||[]).length; ok(siteAct('gl','cut')); eq(S.map.bodies.length,n+1); eq(S.map.bodies[n].c.role,'hexer');
  at('gl'); S.dread=50; ok(siteAct('gl','sing')); ok(!dreadOn()||S.dread<50,'calmer');
  at('st'); const o=stoneOmens('st')[0]; ok(siteAct('st','call:'+o)); eq(S.omenNext.id,o); eq(S.omenNext.day,S.day+1); S.day++; eq(dayOmen().id,o,'tomorrow is the called omen');
  all(); at('fd'); S.map.pos='T'; const far=MAP_IDS.find(id=>mapDist('T',id)>=3), d=tripSteps(far); at('fd'); ok(siteAct('fd','toll')); S.map.pos='T'; eq(tripSteps(far),d-1,'a step less'); ok(siteWhy('fd','toll'),'once a day');
  all(); at('fd'); ok(siteAct('fd','search')); const b=S.map.bodies[S.map.bodies.length-1].c; eq(b.cd,'preserved'); eq(condRaise(b),CORPSE_CONDS.preserved.raise);
});
test('Roads: the mine is two rooms of iron foes that pay ore; ore makes heart-forging cheaper and is spent',()=>{
  all(); at('mn'); const w=S.watches; ok(siteAct('mn','fight')!==null); eq(S.mode,'battle'); eq(S.run.sv,'mine'); eq(S.run.rooms,2); eq(S.watches,w-1);
  ok(S.run.enemies.every(e=>DUNGEONS[4].mobs.some(m=>m[0]===e.base)),'the Iron Orchard\'s kinds'); ok(!S.run.enemies.some(e=>e.boss));
  win(); eq(S.mode,'raise'); ok(!S.run.doors&&!S.run.event,'no doors or events'); descend(); eq(S.mode,'battle'); eq(S.run.room,1); win(); ok(S.run.cleared); ok(S.map.ore>=1&&S.map.ore<=2,'ore '+S.map.ore);
  returnTown(); eq(S.mode,'town'); S.map.ore=3; ok(Math.abs(oreK()-.7)<1e-9); S.map.ore=9; ok(Math.abs(oreK()-(1-ORE_K*ORE_MAX))<1e-9,'at most '+ORE_MAX);
  const b=Object.keys(HF_LINES)[0]; S.trophies={['b:'+b]:2}; S.dust=1e6; S.map.ore=3; const I=hfInfo(b), want=I.n-(I.pw?1:0), lines=hfLinesFor(b,'weapon').slice(0,want);
  S.gold=Math.round(I.gold*.7); ok(hfCan(b,'weapon',lines),'affordable with ore'); const it=heartforge(b,'weapon',lines,true); ok(it,'forged'); eq(S.gold,0); ok(!S.map.ore,'spent');
  invariants('mine');
});
test('Roads: the den\'s beasts; every '+DEN_PELTS+' clears make a charm; a fall there is told as the den',()=>{
  all(); S.charms=[]; for(let i=0;i<DEN_PELTS;i++){ at('wd'); siteAct('wd','fight'); eq(S.run.sv,'den'); ok(S.run.enemies.every(e=>BEAST_NAMES.includes(e.base))); ok(S.run.enemies.every(e=>KIT_OF[e.base])); win(); ok(S.run.cleared); returnTown(); }
  eq(S.charms.length,1,'a charm'); ok(KITS[S.charms[0].k]); ok(BEAST_NAMES.every(n=>IC[n]&&MAT[n]),'icons');
  at('wd'); siteAct('wd','fight'); S.player.hp=1; S.run.enemies.forEach(e=>{ e.atk=99999; }); for(let g=0;g<20&&S.mode==='battle';g++) act('strike'); eq(S.mode,'defeat'); ok(S.notices.some(n=>/dragged out of the Wolf Den/.test(n.m))); ok(!(S.nem||[]).length,'no nemesis from the den');
  ok(/Wolf Den/.test(lostWhere(S.lost[0])));
});
test('Roads: something on the road: held until dawn; fight it for no watch, bribe, buy bodies, spare or take a pilgrim',()=>{
  all(); const R=Math.random; try{ Math.random=()=>0; S.map.pos='T'; mapGo('g3',1); } finally{ Math.random=R; } ok(S.map.enc,'met'); ok(S.notices.some(n=>/until dawn/.test(n.m)));
  ui.tab='gates'; ui.gsub='valley'; let h=renderAll('enc'); ok(/On the road/.test(h)&&/data-a="venc"/.test(h)); ui.gsub='open'; ok(/Valley map<\/button>/.test(renderAll('list')));
  const go=k=>{ S.map.enc={k,s:'g0',d:S.day}; S.mode='town'; S.run=null; };
  go('patrol'); let g=S.gold; ok(encAct('bribe')); ok(S.gold<g); ok(!S.map.enc);
  go('cart'); const n=(S.map.bodies||[]).length; ok(encAct('buy')); eq(S.map.bodies.length,Math.min(MAP_BODIES,n+CART_N));
  go('pilgrim'); S.dread=50; ok(encAct('spare')); ok(!dreadOn()||S.dread===48);
  go('elite'); const w=S.watches; ok(encAct('fight')!==null); eq(S.mode,'battle'); eq(S.watches,w,'no watch'); ok(S.run.enemies.some(e=>e.elite)); win(); ok(S.run.cleared); returnTown();
  go('patrol'); eq(encAct('buy'),null,'not a patrol\'s choice'); restDay(); ok(!S.map.enc,'gone at dawn');
});
test('Roads: scouting looks down a road for a step; the War Room and the raven scout at dawn; the raven shows the nemeses',()=>{
  fresh(10); S.mode='town'; S.watches=WATCHES; clr({}); mapSt(); const L=scoutable(); ok(L.length>0); ok(L.every(id=>!mapSeen(id)));
  const id=L[0]; ok(scout(id)); ok(mapSeen(id)); eq(S.map.st,SCOUT_STEPS); eq(S.map.pos,'T','you stay'); ok(!scout('T'),'a known place');
  ui.tab='gates'; ui.gsub='valley'; ui.vsel=scoutable()[0]; ok(/data-a="vscout"/.test(renderAll('scout card')));
  S.build=S.build||{}; S.build.war=2; const n0=MAP_IDS.filter(mapSeen).length; roadsDawn(); eq(MAP_IDS.filter(mapSeen).length,n0+1,'the War Room');
  S.build.library=3; roadsDawn(); ok(ravenOn(),'the Library\'s raven');
  S.nem=[{id:9,name:'Grubjaw',g:0,lvl:5,k:1,v:[{n:'Bob',d:1}]}]; ok(/Grubjaw walks here/.test(renderAll('nem')));
});
test('Roads: the map shows tonight\'s siege road and your squads in the field',()=>{
  all(); ui.tab='gates'; ui.gsub='valley'; ok(!/v-siege/.test(renderAll('no siege')));
  if(siegeOpen()){ sg().next=S.day+1; ok(/class="v-siege"/.test(renderAll('siege eve'))); }
  S.raids=[{di:1,day:S.day,units:[],t:{k:'gate',di:1},nights:2,night:1}]; ok(/class="v-squad"/.test(renderAll('squad'))); S.raids=[];
});
test('Roads: every road walked is remembered; the four titles; the save keeps it all and cleans a bad one',()=>{
  all(); S.map.pos='T'; mapGo('g3',1); ok(S.map.rw.length>=1); ok(S.map.rw.every(j=>VALLEY_ROADS[j]));
  ['v_cart','v_road','v_ford','v_wolf'].forEach(k=>ok(TITLE[k],k)); ok(TITLE.v_cart.ok(),'every place known');
  S.map.ore=4; S.map.pelt=2; S.map.raven=1; S.map.ford=S.day; S.map.enc={k:'cart',s:'g1',d:S.day};
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(canon(g.map),canon(S.map),'round trip');
  const bad=JSON.parse(JSON.stringify(S)); Object.assign(bad.map,{rw:[1,1,999,'x',-1],ore:99,pelt:9,enc:{k:'dragon',s:'g1'},ford:'q'}); const m=normalizeSave(bad).map;
  eq(JSON.stringify(m.rw),'[1]'); eq(m.ore,ORE_HOLD); eq(m.pelt,DEN_PELTS-1); ok(!m.enc&&!m.ford);
});
test('Roads: the Codex page reads the constants; Turkish for the new lines',()=>{
  const cx=cxValleyHTML(); ok(cx.includes('The other sites')&&cx.includes('On the road')&&cx.includes('Scouting')); ok(cx.includes(RAVEN_GOLD+' gold')&&cx.includes(Math.round(ENC_CH*100)+'%'));
  ok(TIPS.some(t=>t.id==='roads'));
  ['A patrol of the living stopped you near Rat Warren. It waits on the Valley map until dawn.','Bribe them: 240 gold','Go down the mine (two rooms) · 2 steps','Call Blood Moon for tomorrow','Scout it · 1 step',
   'You carry 2 ore out of the mine (3 held). Each makes heart-forging 10% cheaper.','The road is clear again.','Swear your oath to Morrow, the Last Light','Know every place on the Valley map.','You were dragged out of the Wolf Den. That room\'s spoils are lost, and you lose 30% of a level in XP.'
  ].forEach(s=>ok(tr(s)!==s&&!/ near | waits | mine | dragged /.test(tr(s)),'Turkish: '+s+' -> '+tr(s)));
});
})();
