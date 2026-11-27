// Sieges 2.0, R14 PR A (src/game-siege2.js): five tiers, three walls, the Inquisition's bosses.
(function(){
const {test,ok,eq,near,fix,fresh,setLvl,mkMinion,renderAll,cdx,invariants,canon}=window.LOTD_T;
const town=(lv,b)=>{ fresh(lv||40); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1}; S.build=Object.assign({crypt:1,forge:1},b||{}); S.mode='town'; S.run=null; S.watches=WATCHES; S.dread=30; siegeTick(); return S.siege; };
const night=(tier,road)=>{ const g=sg(); if(tier>1) g.tier=tier; S.siege.next=S.day; S.watches=0; endDay(); if(road) siegeRoadPick(road); };
const killWave=()=>{ S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); };
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
test('Siege tiers: two held in a row raise the tier, a loss lowers it, dread shifts the night; the save keeps it',()=>{
  const g=town(); eq(siegeTier(),1); ok(!('tier' in g)&&!('streak' in g),'nothing written on a new save');
  const R0=Math.random; Math.random=()=>{ throw new Error('tiers never roll'); }; try{ stierMove(true); eq(g.streak,1); stierMove(true); eq(g.tier,2); eq(g.streak,0); } finally { Math.random=R0; }
  ok(S.notices.some(n=>/tier 2, Templars/.test(n.m)),'announced'); stierMove(true); stierMove(true); eq(g.tier,3);
  stierMove(true); eq(g.streak,1); stierMove(false); eq(g.tier,2,'a loss lowers it'); eq(g.streak,0,'and breaks the streak');
  g.tier=5; stierMove(true); stierMove(true); eq(g.tier,5,'tier 5 is the top'); g.tier=1; stierMove(false); eq(g.tier,1,'tier 1 is the bottom');
  g.tier=3; S.dread=5; eq(siegeTier(),2,'Calm: one lower'); S.dread=90; eq(siegeTier(),4,'Terror: one higher'); S.dread=30; eq(siegeTier(),3);
  STIERS_ON=false; try{ eq(siegeTier(),1,'"off":["siegetiers"]'); } finally { STIERS_ON=true; }
  eq([1,2,3,4,5].map(siegeRooms).join(),'3,3,4,4,5','waves by tier'); eq([1,2,3,4,5].map(t=>siegeBossName(t)).join(),SIEGE_BOSS+','+SIEGE_BOSS+',The Witchfinder General,The Saint of Pyres,The Grand Inquisitor');
  g.streak=1; const c=normalizeSave(JSON.parse(JSON.stringify(S))); eq(c.siege.tier,3); eq(c.siege.streak,1);
  const bad=JSON.parse(JSON.stringify(S)); bad.siege={next:1,pending:false,dmg:null,warned:0,tier:9,streak:-2}; const nb=normalizeSave(bad); eq(nb.siege.tier,5); eq(nb.siege.streak,0,'repaired');
  invariants('tiers');
});
test('Siege tiers: each tier brings its own living with kits, its waves and its pay; the rooms follow the tier',()=>{
  const seen=new Set(), pay={};
  for(const t of [1,2,3,4,5]){ town(40,{crypt:2,forge:2}); mkMinion({lvl:40}); night(t); eq(siegeTier(),t); pay[t]=siegeGoldPay(); beginSiege(); const r=S.run; eq(r.tier,t); eq(r.rooms,siegeRooms(t));
    for(let w=0;w<r.rooms;w++){ eq(r.room,w); r.enemies.forEach(e=>seen.add(e.base)); if(w===0&&t>1) ok(r.enemies[0].base==='Templar Shieldwall'&&r.enemies[0].elite,'tier '+t+': a Templar elite leads'); if(w===r.rooms-1) eq(r.enemies.find(e=>e.boss).base,siegeBossName(t)); killWave(); }
    eq(S.mode,'raise',t+' won'); returnTown(); }
  Object.values(SIEGE2_FOES).forEach(f=>{ ok(seen.has(f[0]),f[0]+' comes'); ok(KITS[KIT_OF[f[0]]],f[0]+' has a kit'); });
  [2,3,4,5].forEach(t=>near(pay[t]/pay[1],STIER_PAY[t-1],.02,'tier '+t+' pays x'+STIER_PAY[t-1]));
  invariants('every tier');
});
test('Siege walls: the North road adds a foe, doubles the Bell Tower and pays more; the River gate thins and hardens; the Graveyard raises two',()=>{
  town(40,{bell:3,ossuary:3}); mkMinion({lvl:40}); night(1,'north'); eq(sg().road,'north'); const pn=siegeGoldPay(); beginSiege(); let r=S.run; eq(r.road,'north'); eq(r.enemies.length,4,'one more foe');
  const b=r.enemies[0]; ok(b.dots&&b.dots.bleed&&b.dots.bleed.d>=Math.round(b.maxHp*.04)-1,'Caltrops twice'); killWave(); killWave(); ok(r.enemies.find(e=>e.boss).stun>=2,'the Great bells twice');
  r.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); returnTown();
  town(40,{bell:3,ossuary:3}); mkMinion({lvl:40}); night(1); const pg=siegeGoldPay(); near(pn/pg,1.25,.02,'the North road pays 25% more');
  siegeRoadPick('river'); const pr=siegeGoldPay(); near(pr/pg,1.15,.02,'the River gate 15%'); beginSiege(); r=S.run; eq(r.enemies.length,2); ok(r.enemies.every(e=>e.elite),'all elites'); killWave(); killWave();
  const B=r.enemies.find(e=>e.boss), ab=BOSS_ABIL[B.abil].every-(B.fast||0); ok(B.abilT>=ab+1,'the boss a turn late'); killWave(); returnTown();
  town(40,{ossuary:3}); mkMinion({lvl:40}); night(1,'grave'); ok(!('road' in sg()),'the Graveyard is the usual wall'); beginSiege(); fix(.99); killWave(); eq(S.army.filter(m=>m.thrall).length,2,'the Ossuary raises two');
  ok(!siegeRoadPick('north'),'only on the intro screen'); returnTown(); ok(!('road' in sg()),'tonight only'); invariants('walls');
});
test('Siege tier 4: the crusaders burn the strongest perk you did not guard, for that night only',()=>{
  town(40,{crypt:3,forge:2,altar:1}); const m=mkMinion({lvl:40}), hp0=m.maxHp; night(4); siegeGuard('forge'); eq(siegeBurnPick(),'crypt'); ok(/burnt tonight/.test(renderAll('intro')));
  siegeGuard('crypt'); eq(siegeBurnPick(),'forge','the guard spares it'); siegeGuard('forge'); beginSiege(); eq(S.run.burnt,'crypt'); eq(m.maxHp,hp0,'no Crypt HP tonight'); near(foeArmor(),DIFF.armor[siegeGate()]*(1-.10),1e-9,'the Forge still works');
  returnTown(); town(40,{crypt:3}); night(3); eq(siegeBurnPick(),null,'not below tier 4'); invariants('burnt');
});
test('Siege bosses: the Witchfinder marks and burns and keeps Iron Faith; the Saint preaches, burns a column and rises once; the Grand Inquisitor absolves behind his Templars',()=>{
  town(40); const a=mkMinion({lvl:40,role:'vanguard'}), b=mkMinion({lvl:40,role:'striker'}); night(3); beginSiege(); const r=S.run; while(r.room<r.rooms-1) killWave();
  const W=r.enemies.find(e=>e.boss); eq(W.base,'The Witchfinder General'); ok(W.faith&&!addSt(W,'hexed',2)&&!addSt(W,'sundered',2),'Iron Faith'); fix(.5);
  fireAbility(W,'witchmark'); const mk=S.army.find(m=>m.wmk>r.turn); ok(mk,'a minion is marked'); const t0=mk.hp; hurtAlly(mk,100,'phys'); eq(t0-mk.hp,Math.min(t0,150),'+50% damage on the marked');
  mk.maxHp=mk.hp=1e6; const h1=mk.hp; fireAbility(W,'pyre'); ok(mk.hp<h1&&mk.dots&&mk.dots.burn,'the Pyre Sentence finds the marked'); ok(BOSS_ABIL.pyre.warn,'telegraphed');
  allies().forEach(clearAll); ok(!mk.wmk,'the mark ends with the wave'); returnTown();
  town(40); mkMinion({lvl:40,role:'vanguard'}); mkMinion({lvl:40,role:'striker'}).row='b'; night(4); beginSiege(); const r2=S.run; while(r2.room<r2.rooms-1) killWave();
  const P=r2.enemies.find(e=>e.boss); eq(P.base,'The Saint of Pyres'); const f0=foeBlowK(P); fireAbility(P,'sermon'); near(kitAtk(P)/f0,SERMON_K,1e-9,'the Sermon');
  const hs=S.army.map(m=>m.hp); fireAbility(P,'pillar'); eq(S.army.filter((m,i)=>m.hp<hs[i]).length,2,'a column: one front, one back');
  hurtFoe(P,P.hp+10,'phys'); ok(P.hp>0&&P.martyrU,'the Martyr rises'); near(P.hp,Math.round(P.maxHp*MARTYR_HP),1); hurtFoe(P,P.hp+10,'phys'); ok(P.hp<=0,'only once'); returnTown();
  town(40); mkMinion({lvl:40}); night(5); beginSiege(); const r3=S.run; eq(r3.rooms,5); while(r3.room<r3.rooms-1) killWave();
  const G=r3.enemies.find(e=>e.boss); eq(G.base,'The Grand Inquisitor'); ok(r3.enemies.some(e=>e.base==='Templar Shieldwall'),'his Templars'); r3.enemies.forEach(e=>{ if(e!==G) e.hp=Math.round(e.maxHp/2); });
  G.hp=Math.round(G.maxHp*.4); checkPhase(); eq(G.twist,'absolve'); ok(r3.enemies.filter(e=>e!==G).every(e=>e.hp>e.maxHp/2),'Absolution heals the living');
  const g0=G.hp; hurtFoe(G,1000,'phys'); const d1=g0-G.hp; r3.enemies.forEach(e=>{ if(e.base==='Templar Shieldwall') e.hp=0; }); const g1=G.hp; hurtFoe(G,1000,'phys'); ok(g1-G.hp>d1*1.8,'the shelter falls with the Templars');
  invariants('bosses');
});
const foeBlowK=e=>kitAtk(e);
test('Sieges 2.0 on screen: the intro shows the tier and the walls, the Town tab the tier, the Codex the tiers, and every new line has Turkish',()=>{
  const g=town(40,{bell:1}); g.tier=3; tally('sieges'); ui.tab='town'; ok(/Siege tier 3: Inquisition/.test(renderAll('town')),'the Town tab');
  night(3); let h=renderAll('intro'); ok(/Tier 3: Inquisition/.test(h)&&/4 waves/.test(h),'the tier'); ok(/data-a="sroad" data-k="north"/.test(h)&&/River gate/.test(h)&&/Hold the wall/.test(h),'the walls');
  ACTIONS.sroad('river'); eq(sg().road,'river'); ok(/aria-pressed="true">River gate/.test(renderAll('river')));
  S.mode='town'; S.run=null; const cx=cdx('sieges'); ok(/Siege tiers/.test(cx)&&/Templars/.test(cx)&&/North road/.test(cx)&&/Hound Master/.test(cx),'the Codex'); ok(/The Grand Inquisitor/.test(cdx('bosses')));
  const L=[].concat(STIERS.map(t=>t.name),STIERS.map(t=>t.rule),ROAD_IDS.map(k=>ROADS[k].name),ROAD_IDS.map(k=>ROADS[k].desc),['witchmark','pyre','pillar','sermon'].map(k=>BOSS_ABIL[k].desc),[TWISTS.absolve.name,TWISTS.absolve.desc],
    Object.values(SBOSS_PASSIVE).flat(),SIEGE_BOSSES.slice(1).map(n=>BOSS_LINES[n]).flat(),[PHASE_LINES['The Grand Inquisitor']]);
  L.forEach(s=>ok(tr(s)!==s,'Turkish: '+s));
  ['The Witchfinder General brands Ash with the Mark of the Witch: it takes 50% more damage for 3 turns.','The Saint of Pyres falls, and rises again in a pillar of flame: the Martyr (+120 HP).','The Inquisition takes your measure: the next sieges come at tier 4, Crusade.','The crusaders fire the Crypt: its siege perk is lost for the night.','The Grand Inquisitor comes through the smoke.']
    .forEach(s=>ok(tr(s)!==s,'Turkish: '+s));
  ok(SIEGE_NAMES.every(n=>IC[n]&&MAT[n]),'icons'); ok(SIEGE_BOSSES.every(n=>bossKind(n)),'bosses for mastery');
});
test('Siege works: built once in town, each serves every siege: caltrops, oil, palisade, catapult and the Ward stones',()=>{
  const g=town(40,{crypt:1,forge:1}); S.gold=0; S.dust=0; ok(!buildWork('caltrops'),'gold first'); S.gold=1e5; S.dust=500;
  WORK_IDS.forEach(k=>ok(buildWork(k),k)); ok(!buildWork('oil'),'once'); eq(S.gold,1e5-WORK_IDS.reduce((a,k)=>a+WORKS[k].g,0)); eq(S.dust,500-WORK_IDS.reduce((a,k)=>a+WORKS[k].d,0)); eq(Object.keys(g.works).length,5);
  const c=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(c.siege.works),JSON.stringify(g.works),'saved');
  const v=mkMinion({lvl:40,role:'vanguard'}); night(1); beginSiege(); const r=S.run;
  ok(r.enemies.every(e=>e.dots&&e.dots.bleed),'caltrops'); ok(r.enemies.filter(e=>rowOf(e)==='f').every(e=>e.hp<e.maxHp),'oil on the front row'); ok(v.mw>=Math.round(v.maxHp*PALISADE_K)-1,'the palisade');
  fix(.99); r.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); ok(r.enemies.every(e=>e.hp<=e.maxHp*(1-CATAPULT_K)+1),'the catapult');
  const b=r.enemies[0]; const P=S.player, h=P.hp; ok(wardStone(b,'decree'),'the stones break a Decree'); ok(!wardStone(b,'decree'),'once a wave'); ok(!wardStone(b,'purge'),'not every move'); r.wsU=0; fireAbility(b,'decree'); eq(P.hp,h,'a broken Decree does nothing');
  r.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); eq(r.wsU,0,'the stones are whole again next wave');
  returnTown(); ui.tab='town'; const hh=renderAll('works'); ok(/Siege works/.test(hh)&&/Corpse catapult/.test(hh)&&/built/.test(hh)); invariants('works');
});
test('The Inquisition: a passage at each new tier, then the Purge; breaking it brings the peace and a heart, losing it drops the tier',()=>{
  let g=town(40); for(let i=0;i<8;i++) stierMove(true); eq(g.tier,5); eq(g.arc,4,'four passages'); ok(S.notices.some(n=>/The last crusade/.test(n.m)),'the arc'); eq(g.pd,1,'the Purge is due'); eq(T_('stier5'),1);
  S.dread=5; eq(siegeTier(),5,'the Purge ignores the dread'); mkMinion({lvl:40}); night(5); eq(siegeRoad(),'all','every wall'); ok(!siegeRoadPick('north'),'no wall to choose'); ok(!/data-a="sroad"/.test(renderAll('purge intro')),'no wall chips');
  beginSiege(); let r=S.run; ok(r.purge); eq(r.rooms,5); eq(r.enemies.length,4,'one more foe at every wall'); while(r.room<r.rooms-1) killWave(); eq(r.enemies.find(e=>e.boss).base,'The Grand Inquisitor'); killWave(); eq(S.mode,'raise');
  ok(!g.pd); eq(g.tier,PURGE_RESET); eq(g.purge.won,1); ok(g.peace.until>S.day+PEACE_DAYS-1); eq(S.trophies['b:The Inquisition'],1,'his heart'); ok(hfInfo('The Inquisition'),'the Forge works it'); eq(T_('purgeWon'),1);
  returnTown(); ok(dreadOf()<=PEACE_DREAD+1,'Calm (one dawn of drift)'); ok(siegePeace()); S.day+=5; siegeTick(); eq(g.next,0,'no siege in the peace'); ui.tab='town'; ok(/The Inquisition's peace/.test(renderAll('peace')));
  S.day=g.peace.until; siegeTick(); ok(g.next>S.day,'the sieges return'); const c=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(c.siege.purge),JSON.stringify(g.purge)); eq(c.siege.peace.until,g.peace.until);
  g=town(40); g.tier=4; stierMove(true); stierMove(true); eq(g.pd,1); mkMinion({lvl:40}); night(5); beginSiege(); S.run.enemies.forEach(e=>{ e.hp=1e9; e.maxHp=1e9; }); S.army.forEach(m=>{ m.hp=0; }); siegeLost(false); siegeEnd(); ok(!g.pd,'lost'); eq(g.tier,PURGE_RESET); ok(!g.peace,'no peace');
  invariants('purge');
});
test('Sieges 2.0, part two on screen: the planning card once warned, the titles, the Codex and Turkish',()=>{
  const g=town(40); g.tier=3; S.day=g.next-1; ui.tab='town'; const h=renderAll('plan'); ok(/siege-plan/.test(h)&&/Tier 3: Inquisition/.test(h)&&/Exorcist \(Sapper\)/.test(h)&&/The Witchfinder General/.test(h),'the waves with kits'); ok(siegeRoadPick('north'),'the wall can be picked the day before'); eq(sg().road,'north');
  ['s_unburnt','s_road','s_tiers','s_pyre','s_works'].forEach(id=>ok(TITLE[id],id)); g.arc=4; S.mode='town'; const cx=cdx('sieges'); ok(/Siege works/.test(cx)&&/The last crusade/.test(cx));
  [].concat(WORK_IDS.map(k=>WORKS[k].name),WORK_IDS.map(k=>WORKS[k].desc),SIEGE_ARC.map(a=>a.name),SIEGE_ARC.map(a=>a.m),[ROADS.all.desc],['s_unburnt','s_road','s_tiers','s_pyre','s_works'].map(id=>TITLE[id].name),['s_unburnt','s_road','s_tiers','s_pyre','s_works'].map(id=>TITLE[id].req))
    .forEach(s=>ok(tr(s)!==s,'Turkish: '+s));
});
})();
