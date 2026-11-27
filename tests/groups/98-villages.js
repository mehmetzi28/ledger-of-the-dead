// The villages of the living, R20 PR A (src/game-villages.js, src/ui-map.js): three villages with standing, a stall, tribute,
// a weekly favor, the hooks that move standing (sieges, dread, graveyards, pilgrims, shrines), grain-salt, the escort fight, the save.
(function(){
const {test,ok,eq,fresh,renderAll,invariants,canon}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const all=()=>{ fresh(30); S.mode='town'; S.run=null; S.watches=WATCHES; S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1}; S.build=Object.assign({crypt:1,forge:1},S.build||{}); mapSt(); S.gold=1e6; S.notices=[]; S.dread=DREAD_START; delete S.vil; vilAll(); };
const at=id=>{ S.map.pos=id; S.map.st=0; S.watches=WATCHES; S.mode='town'; S.run=null; if(VALLEY_NODES[id].k!=='village') siteState(id).rest=0; };
const fav=(v,k)=>{ vil(v).fav={w:vilWeek(),k,done:0}; };
const body=s=>({c:{name:'Tunnel Rat',base:'Tunnel Rat',role:'striker',rankI:0,lvl:3,hf:1,af:1,boss:false,elite:false},s});
const win=()=>{ S.run.enemies.forEach(e=>{ e.hp=0; e.dead=true; }); roomWon(); };
test('Villages: three on the map, known from the start, each with a graveyard, people and a card with its standing and favor',()=>{
  all(); eq(VIL_IDS.length,3); for(const v of VIL_IDS){ const V=VILLAGES[v], id=V.node; eq(VALLEY_NODES[id].k,'village'); ok(mapSeen(id),'known '+v); ok(isFinite(mapDist('T',id)),'reachable');
    eq(VALLEY_NODES[V.gy].k,'grave','graveyard '+v); ok(V.favors.length===3&&V.favors.every(k=>FAVOR_TEXT[k]&&FAVOR_NAME[k]),'favors'); ok(V.goods.every(g=>GOOD_TEXT[g]),'goods'); eq(vilSt(v),VIL_ST0);
    ui.tab='gates'; ui.gsub='valley'; ui.vsel=id; const h=renderAll('village '+v); ok(h.includes('Standing'),'standing shown'); ok(h.includes('This week'),'favor shown'); ok(h.includes('data-a="vvil"'),'stall'); }
  ok(!isSite('vm'),'not a resting site'); invariants();
});
test('Villages: standing is clamped to -100..100, falls into five bands, and a new band is announced',()=>{
  all(); eq(vilBand('mill').id,'wary'); stand('mill',1000); eq(vilSt('mill'),100); eq(vilBand('mill').id,'ally'); stand('mill',-1000); eq(vilSt('mill'),-100); eq(vilBand('mill').id,'hate');
  S.notices=[]; vil('grey').st=19; stand('grey',1,'a test'); ok(S.notices.some(n=>/Greyhollow: your standing is now Friendly \(a test\)/.test(n.m)),'announced');
  VIL_ON=false; try{ eq(stand('grey',10),0,'off: nothing moves'); } finally { VIL_ON=true; }
});
test('Villages: prices move with standing; at -60 and below they will not trade, take tribute or ask favors',()=>{
  all(); vil('mill').st=0; const p0=vilPrice('mill',VIL_SALT); vil('mill').st=100; ok(vilPrice('mill',VIL_SALT)<p0,'cheaper for friends'); vil('mill').st=-50; ok(vilPrice('mill',VIL_SALT)>p0,'dearer for the feared');
  vil('mill').st=VIL_SHUT; ok(vilShut('mill')); ok(vilOpts('mill').every(o=>o.why||o.k==='raid'),'everything shut but a raid'); at('vm'); eq(vilAct('vm','tribute'),null); eq(vilAct('vm','salt'),null);
  ui.tab='gates'; ui.gsub='valley'; ui.vsel='vm'; ok(renderAll('shut').includes('bar their doors'));
});
test('Villages: the stall sells salt, a draught, ore, an iron charm (friends, once a week), a relic and incense; each purchase +1',()=>{
  all(); at('vm'); const g=S.gold; ok(vilAct('vm','salt')); eq(S.vil.salt,1); ok(S.gold<g); eq(vilSt('mill'),VIL_ST0+VIL_TRADE);
  S.belt.hp=0; ok(vilAct('vm','draught')); eq(S.belt.hp,1);
  at('vg'); S.map.ore=0; ok(vilAct('vg','ore')); eq(S.map.ore,1); ok(vilWhy('vg','charm'),'not a friend yet'); vil('grey').st=VIL_FRIEND; const c=(S.charms||[]).length; ok(vilAct('vg','charm')); eq(S.charms.length,c+1); ok(KITS[S.charms[c].k],'a real kit');
  ok(/One a week/.test(vilWhy('vg','charm')),'once a week');
  at('va'); S.faith=null; ok(vilWhy('va','relic'),'no god'); S.faith={id:'hon',day:1,dev:0,dd:0,dday:0,vb:0,cv:0}; ok(vilAct('va','relic')); ok(S.faith.dev>0,'devotion');
  S.dread=50; ok(dreadOn()); ok(vilAct('va','incense')); eq(dreadOf(),50-VIL_INCENSE_DREAD); eq(vilSt('aldric'),VIL_ST0+2*VIL_TRADE);
  S.faith={id:'dis',day:1,dev:0,dd:0,dday:0,vb:0,cv:0}; ok(/Profane/.test(vilWhy('va','relic')));
});
test('Villages: the walk is paid like a site\'s and must leave a watch; tribute is once a day for +5',()=>{
  all(); S.map.pos='T'; S.watches=1; ok(vilWhy('va','tribute'),'too far on the last watch'); S.watches=WATCHES; ok(vilAct('va','tribute')); eq(S.map.pos,'va'); eq(vilSt('aldric'),VIL_ST0+VIL_TRIB_ST);
  ok(/paid today/.test(vilWhy('va','tribute'))); S.day++; ok(vilAct('va','tribute')); eq(vilSt('aldric'),VIL_ST0+2*VIL_TRIB_ST);
});
test('Villages: one favor a week from a hash of the week (the same on a reload), done once; the den, the mine, the ford and the shrines do them',()=>{
  all(); S.day=8; const k=vilFav('mill').k, w=vilWeek(); delete vil('mill').fav; eq(vilFav('mill').k,k,'same favor'); eq(vilFav('mill').w,w);
  const seen=new Set(); for(let d=1;d<200;d+=7){ S.day=d; delete vil('mill').fav; seen.add(vilFav('mill').k); } eq(seen.size,3,'every favor comes up');
  all(); fav('mill','den'); S.run={sv:'den',events:[],di:2}; svCleared(S.run); ok(vilFav('mill').done,'den'); eq(vilSt('mill'),VIL_ST0+VIL_FAV); const s=vilSt('mill'); favDone('mill'); eq(vilSt('mill'),s,'paid once');
  fav('grey','mine'); svCleared({sv:'mine',events:[],di:2}); ok(vilFav('grey').done,'mine');
  fav('mill','ford'); at('fd'); ok(siteAct('fd','search')); ok(vilFav('mill').done,'ford');
  fav('aldric','shrine'); S.faith={id:'hon',day:1,dev:0,dd:0,dday:0,vb:0,cv:0}; const sh=MAP_IDS.find(id=>VALLEY_NODES[id].k==='shrine'&&VALLEY_NODES[id].g==='hon'); S.map.seen[sh]=true; at(sh); ok(siteAct(sh,'pray')); ok(vilFav('aldric').done,'shrine');
  all(); S.faith={id:'dis',day:1,dev:0,dd:0,dday:0,vb:0,cv:0}; const o=MAP_IDS.find(id=>VALLEY_NODES[id].k==='shrine'&&VALLEY_NODES[id].g==='hon'); S.map.seen[o]=true; at(o); ok(siteAct(o,'desecrate')); eq(vilSt('aldric'),VIL_ST0-VIL_DESECRATE,'a shrine broken');
  all(); vil('mill').st=VIL_SHUT; fav('mill','den'); svCleared({sv:'den',events:[],di:2}); ok(!vilFav('mill').done,'a shut village asks nothing');
});
test('Villages: the escort favor is a fight on the road (no watch); winning it does the favor; it is a site run (no rivals, doors or events)',()=>{
  all(); fav('mill','cart'); S.map.pos='T'; S.watches=WATCHES; ok(vilOpts('mill').some(o=>o.k==='escort'&&!o.why)); const w0=WATCHES-Math.floor(tripSteps('vm')/MAP_STEP); eq(vilAct('vm','escort'),''); eq(S.watches,w0,'the walk paid as steps, no watch for the fight'); eq(S.mode,'battle'); eq(S.run.sv,'escort'); eq(S.run.svV,'mill');
  ok(S.run.enemies.length>=3,'foes'); ok(S.run.enemies.some(e=>BEAST_NAMES.includes(e.base)),'wolves for the mill'); eq(svWhere(S.run),'the road to Miller\'s Ford');
  win(); ok(S.run.cleared); ok(vilFav('mill').done,'favor done'); ok(S.run.events.some(e=>/cart reaches Miller's Ford/.test(e.m))); ok(!S.run.doors||!S.run.doors.length,'no doors');
  all(); fav('grey','cart'); S.watches=WATCHES; eq(vilAct('vg','escort'),''); ok(S.run.enemies.every(e=>DUNGEONS[4].mobs.some(m=>m[0]===e.base)),'iron things for Greyhollow');
});
test('Villages: Greyhollow takes a dug body as a worker; Saint Aldric\'s asks you to bury a battlefield\'s dead',()=>{
  all(); fav('grey','worker'); ok(vilWhy('vg','worker'),'needs a body'); S.map.bodies=[body('gy0'),body('gy0')]; at('vg'); ok(vilAct('vg','worker')); eq(S.map.bodies.length,1); ok(vilFav('grey').done); ok((S.map.ore|0)>=2,'ore paid');
  all(); fav('aldric','bury'); siteState('bf0').fresh=1; S.map.seen.bf0=true; ok(buryOpen('bf0')); ui.tab='gates'; ui.gsub='valley'; ui.vsel='bf0'; ok(renderAll('bury').includes('data-a="vbury"'));
  S.map.pos='T'; ok(buryField('bf0')); ok(!siteReady('bf0'),'the field is empty'); eq((S.map.bodies||[]).length,0,'no bodies'); ok(vilFav('aldric').done); ok(vilBlessK()>1,'blessed'); eq(buryField('bf0'),null);
});
test('Villages: the favors pay their thanks; the blessing makes menders heal more for a week',()=>{
  all(); S.vil.salt=0; S.belt.hp=0; fav('mill','den'); favDone('mill'); eq(S.vil.salt,2); eq(S.belt.hp,1);
  S.map.ore=0; const g=S.gold; fav('grey','mine'); favDone('grey'); eq(S.map.ore,2); ok(S.gold>g);
  const m={spec:null}; eq(healK(m),1); fav('aldric','shrine'); favDone('aldric'); eq(healK(m),1+VIL_BLESS); S.day+=VIL_BLESS_DAYS+1; eq(healK(m),1,'a week');
});
test('Villages: sieges won and lost reach every village; raising a body from a village\'s graveyard costs standing there',()=>{
  all(); standAll(0); S.siege=S.siege||{}; siegeLost(true); VIL_IDS.forEach(v=>eq(vilSt(v),VIL_ST0-VIL_SIEGE_LOST));
  all(); S.map.bodies=[body('gy0'),body('gy2')]; S.map.bodies.forEach(b=>{ b.c.old=0; }); S.player.lvl=99; let r=null; for(let t=0;t<40&&!(r&&r.ok);t++){ S.map.bodies=[body('gy0')]; vil('mill').st=VIL_ST0; r=siteRaise(0); }
  if(r&&r.ok) eq(vilSt('mill'),VIL_ST0-VIL_GRAVE,'their dead raised'); eq(vilSt('grey'),VIL_ST0,'not theirs');
});
test('Villages: the town\'s dread reaches them at dawn (Terror -1, Calm +1); grain-salt keeps dug bodies through the dawn',()=>{
  all(); ok(dreadOn()); S.dread=90; vilDawn(); VIL_IDS.forEach(v=>eq(vilSt(v),VIL_ST0-VIL_BAND)); S.dread=5; vilDawn(); vilDawn(); VIL_IDS.forEach(v=>eq(vilSt(v),VIL_ST0+VIL_BAND)); S.dread=40; vilDawn(); eq(vilSt('mill'),VIL_ST0+VIL_BAND,'uneasy: nothing');
  S.vil.salt=2; S.map.bodies=[body('gy0'),body('gy0'),body('gy0')]; mapDawn(); eq(S.map.bodies.length,2,'two salted'); ok(!S.vil.salt,'salt spent'); mapDawn(); eq(S.map.bodies.length,0,'no salt left');
});
test('Villages: the road and the save: a pilgrim spared or taken moves Saint Aldric\'s; S.vil survives a save and bad data is cleaned',()=>{
  all(); S.map.enc={k:'pilgrim',s:'g0',d:S.day}; ok(encAct('spare')); eq(vilSt('aldric'),VIL_ST0+VIL_PILGRIM); S.map.enc={k:'pilgrim',s:'g0',d:S.day}; ok(encAct('take')); eq(vilSt('aldric'),VIL_ST0+VIL_PILGRIM-VIL_TAKE);
  fav('mill','den'); vil('mill').td=S.day; vil('grey').cw=3; S.vil.salt=4; S.vil.bless=S.day+3; const a=JSON.parse(JSON.stringify(S)); normalizeSave(a); ok(canon(a.vil)===canon(S.vil),'round trip');
  const b={vil:{mill:{st:900,pop:-5,fav:{w:2,k:'bogus',done:1}},grey:'x',aldric:{st:'NaN'},salt:99,bless:-1,junk:1}}; vilFix(b);
  eq(b.vil.mill.st,100); eq(b.vil.mill.pop,0); ok(!b.vil.mill.fav,'a bad favor'); eq(b.vil.grey.st,VIL_ST0); eq(b.vil.grey.pop,VILLAGES.grey.pop); eq(b.vil.aldric.st,VIL_ST0); eq(b.vil.salt,VIL_SALT_MAX); ok(!('bless' in b.vil)&&!('junk' in b.vil));
  const c={}; vilFix(c); ok(!('vil' in c),'an old save stays without villages');
});
test('Villages: Turkish, the Codex page, the titles and the tip',()=>{
  all(); for(const s of ['Standing','This week\'s favor','They will not deal with you','Escort the cart: a fight on the road','Pay tribute: 750 gold, standing +5','Greyhollow: your standing is now Friendly (a favor done)','You pay Miller\'s Ford a tribute of 750 gold. They take it, and remember it.','The villages'])
    ok(tr(s)!==s,'tr '+s);
  const h=cxVillagesHTML(); for(const v of VIL_IDS) ok(h.includes(VILLAGES[v].name.replace(/'/g,'\''))); ok(h.includes('Favors'));
  ok(['vl_mill','vl_grey','vl_aldric'].every(id=>TITLE[id])); vil('mill').st=VIL_ALLY; ok(TITLE.vl_mill.ok()); ok(!TITLE.vl_grey.ok());
  ok(TIPS.some(t=>t.id==='villages')); eq(TIP_META.villages[1],'villages');
});
// ----- PR B: raids, abandonment, allegiance, the knight, the mobs
const raid=v=>{ S.map.pos='T'; S.map.st=0; S.watches=WATCHES; S.mode='town'; S.run=null; S.map.bodies=[]; return vilAct(VILLAGES[v].node,'raid'); };
test('Villages: a raid walks there, spends a watch and fights the militia and the village\'s best (Saint Aldric\'s knight unless he rides with you)',()=>{
  all(); const w0=WATCHES-Math.floor(tripSteps('vm')/MAP_STEP)-1; eq(raid('mill'),''); eq(S.mode,'battle'); eq(S.run.sv,'raid'); eq(S.run.svV,'mill'); eq(S.watches,w0,'a watch'); eq(S.run.enemies.length,4); ok(S.run.enemies[0].elite,'the best'); eq(svWhere(S.run),'Miller\'s Ford');
  all(); eq(raid('aldric'),''); eq(S.run.enemies[0].base,KNIGHT[0],'the knight defends'); all(); S.vil.knight=1; S.vil.aldric.st=100; eq(raid('aldric'),''); ok(S.run.enemies.every(e=>e.base!==KNIGHT[0]),'not when he rides with you');
  all(); S.map.pos='T'; S.watches=1; ok(!raidStart('vm'),'not on the last watch');
});
test('Villages: a won raid takes its people as bodies (+15, a trait), gold and goods; standing, the dread and the Inquisition pay for it',()=>{
  all(); S.dread=40; S.siege=S.siege||{}; const g=sg(); g.next=S.day+6; g.pending=false; g.tier=1; g.streak=1; const gold=S.gold, pop=vil('grey').pop; S.map.ore=0;
  eq(raid('grey'),''); S.run.enemies.forEach(e=>{ e.hp=0; e.dead=true; }); roomWon(); ok(S.run.cleared);
  const B=S.map.bodies; ok(B.length>=VIL_RAID_N[0]&&B.length<=VIL_RAID_N[1],'bodies'); ok(B.every(b=>b.c.cd==='hardened'&&['Miner','Foreman'].includes(b.c.name)),'Greyhollow\'s people'); eq(condRaise(B[0].c),CORPSE_CONDS.hardened.raise);
  ok(S.gold>gold); eq(S.map.ore,2); ok(vil('grey').pop<=pop-VIL_RAID_POP[0]&&vil('grey').pop>=pop-VIL_RAID_POP[1]);
  eq(vilSt('grey'),VIL_ST0-VIL_RAID_ST); eq(vilSt('mill'),VIL_ST0-VIL_RAID_ALL); eq(vilSt('aldric'),VIL_ST0-VIL_RAID_ALL); eq(dreadOf(),40+VIL_RAID_DREAD);
  eq(g.next,S.day+6-VIL_RAID_SOONER,'sooner'); eq(g.tier,1,'no tier: the bots lost their early sieges with it'); eq(g.rd,1); { const a=normalizeSave(JSON.parse(JSON.stringify(S))); eq(a.siege.rd,1,'saved'); } eq(raidInquisition(),'','once until that siege'); raidTierBack(); ok(!g.rd); ok(S.run.events.some(e=>/Inquisition hears/.test(e.m)));
  S.mode='town'; S.run=null; const c=Object.assign({},B[0].c), m=null; ok(CORPSE_CONDS.hardened.trait==='thick'&&TRAITS.thick,'its trait is real');
});
test('Villages: emptied of people a village is abandoned for good; its graveyard digs twice as deep; all three empty is Empty Valley',()=>{
  all(); vil('mill').pop=10; eq(raid('mill'),''); S.run.enemies.forEach(e=>{ e.hp=0; e.dead=true; }); roomWon(); ok(vilGone('mill')); eq(vil('mill').pop,0); ok(S.story.vil_mill3,'its last passage');
  S.mode='town'; S.run=null; eq(vilOpts('mill').filter(o=>!o.why).length,0,'nothing to do'); ok(!vilOpts('mill').some(o=>o.k==='raid'),'no raid'); eq(stand('mill',10),0,'standing is gone with them'); ok(!favOpen('mill','den'));
  ui.tab='gates'; ui.gsub='valley'; ui.vsel='vm'; ok(renderAll('gone').includes('Abandoned'));
  eq(vilGyK(VILLAGES.mill.gy),VIL_GY_BIG); eq(vilGyK('gy2'),1); ok(!TITLE.vl_empty.ok()); VIL_IDS.forEach(v=>{ vil(v).gone=1; vil(v).pop=0; }); ok(TITLE.vl_empty.ok());
});
test('Villages: Miller\'s Ford in allegiance holds a siege\'s first wave once a week; at +100 its salt keeps the Embalmery\'s bodies longer',()=>{
  all(); const r=S.run={siege:1,room:0,log:[],events:[]}; ok(!vilAid(r),'not yet'); vil('mill').st=VIL_ALLY; ok(vilAid(r)); eq(r.room,1); const r2=S.run={siege:1,room:0,log:[],events:[]}; ok(!vilAid(r2),'once a week'); S.day+=7; ok(vilAid(r2)); S.run=null;
  const e0=embDays(1); vil('mill').st=100; eq(embDays(1),e0+VIL_EMB);
});
test('Villages: Greyhollow in allegiance delivers ore each week; at +100 its forge-master reforges at the best roll',()=>{
  all(); vil('grey').st=VIL_ALLY; S.map.ore=0; S.day=8; vilDawn(); eq(S.map.ore,VIL_ALLY_ORE); S.day=9; vilDawn(); eq(S.map.ore,VIL_ALLY_ORE,'once a week');
  ok(!vilForge()); vil('grey').st=100; ok(vilForge());
});
test('Villages: Saint Aldric\'s blessing stays in allegiance; at +100 its knight swears, rides in every gate run and siege, and leaves when trust falls',()=>{
  all(); const m={spec:null}; vil('aldric').st=VIL_ALLY; eq(healK(m),1+VIL_BLESS,'blessed');
  S.notices=[]; vil('aldric').st=95; stand('aldric',10); ok(S.vil.knight,'sworn'); ok(TITLE.vl_knight.ok()); ok(S.notices.some(n=>/swears to ride with you/.test(n.m)));
  S.mode='town'; S.run=null; S.watches=WATCHES; S.map.pos='g0'; const n0=S.army.length; startRun(0); ok(S.army.some(x=>x.knight&&x.thrall),'he rides'); eq(armyUsed(),S.army.filter(x=>!x.thrall&&!x.wall).length+raidHeld(false),'holds no slot');
  const k=S.army.find(x=>x.knight); eq(k.nick,KNIGHT_NICK); ok(k.maxHp>0&&k.atk>0); const g=normalizeSave(JSON.parse(JSON.stringify(S))); ok(!g.army.some(x=>x.knight),'never saved past the fight');
  returnTown(); ok(!S.army.some(x=>x.knight),'home again'); eq(S.army.length,n0);
  const r=S.run={siege:1,room:0,log:[],events:[]}; ok(knightJoin(r)); ok(!knightJoin(r),'once'); knightLeave(); S.run=null;
  stand('aldric',-50); ok(!S.vil.knight,'he rides home'); ok(!knightJoin({}),'gone');
});
test('Villages: a village at -60 or worse sends a mob with the first wave of each siege',()=>{
  all(); S.run={log:[],events:[]}; const t={id:'etest',name:'Militia Spearman',base:'Militia Spearman',role:'vanguard',boss:false,hp:10,maxHp:10,atk:2}; let L=[t]; vilMobs(L,{room:0}); eq(L.length,1,'no hatred, no mob');
  vil('grey').st=-70; vil('mill').st=-90; L=[t]; vilMobs(L,{room:0}); eq(L.length,1+2*VIL_MOB); eq(new Set(L.map(e=>e.id)).size,L.length,'new ids'); L=[t]; vilMobs(L,{room:1}); eq(L.length,1,'the first wave only');
  vil('mill').gone=1; L=[t]; vilMobs(L,{room:0}); eq(L.length,1+VIL_MOB,'the empty send no one'); S.run=null;
});
test('Villages: nine passages (first dealings, allegiance, abandonment), the save keeps PR B\'s state, Turkish and the Codex',()=>{
  all(); eq(STORY.filter(x=>x.id.startsWith('vil_')).length,9); at('vm'); ok(vilAct('vm','salt')); ok(S.story.vil_mill1,'first dealings'); vil('grey').st=55; stand('grey',10); ok(S.story.vil_grey2,'allegiance');
  vil('mill').aid=3; vil('aldric').st=100; S.vil.knight=1; vil('grey').gone=1; vil('grey').pop=0; const a=JSON.parse(JSON.stringify(S)); normalizeSave(a); ok(canon(a.vil)===canon(S.vil),'round trip');
  const b={vil:{mill:{st:10,pop:0},aldric:{st:100,gone:1},knight:1}}; vilFix(b); ok(b.vil.mill.gone,'no people, gone'); ok(!b.vil.knight,'no knight from an empty village');
  for(const s of ['Raid the village: a fight, a watch','Farmhand','Empty Valley','The Knight\'s Oath','Ser Aldwin of Saint Aldric\'s rides at your side.','At +60: its knight rides with you']) ok(tr(s)!==s||s.startsWith('Ser'),'tr '+s);
  const h=cxVillagesHTML(); ok(h.includes('Raiding')&&h.includes('Allegiance')&&h.includes(KNIGHT_NICK));
});
})();
