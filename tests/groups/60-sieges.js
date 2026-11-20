// Siege nights (src/game-phases-town.js): the living march on the necropolis; raids march at nightfall first.
(function(){
const {test,ok,eq,near,fix,seed,fresh,setLvl,mkMinion,renderAll,cdx,invariants,canon}=window.LOTD_T;
const town=(lv,b)=>{ setLvl(lv||20); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1}; S.build=Object.assign({crypt:1,forge:1},b||{}); S.mode='town'; S.run=null; S.watches=WATCHES; siegeTick(); return S.siege; };
const dueTonight=()=>{ S.siege.next=S.day; S.watches=0; endDay(); };
const killWave=()=>{ S.run.enemies.forEach(e=>{ e.hp=0; }); checkDeaths(); roomWon(); };
const cmdr=o=>mkMinion(Object.assign({elite:true,traits:['commander'],lvl:12,rankI:2},o));

test('Sieges: they open with the Town tab and two building levels, then come 7 to 10 days ahead, without touching Math.random',()=>{
  eq([SIEGE_BUILT,SIEGE_GAP.join('-'),SIEGE_WAVES].join(),'2,7-10,3');
  ok(!siegeOpen(),'a new game'); S.build={crypt:1}; setLvl(5); ok(townOpen()&&!siegeOpen(),'one level is not enough'); siegeTick(); eq(S.siege.next,0,'nothing scheduled');
  S.mode='town'; S.gold=1e6; S.dust=1e3; const r=Math.random; Math.random=()=>{ throw new Error('the siege day must not use Math.random'); };
  try{ ok(build('forge')); } finally { Math.random=r; }
  ok(siegeOpen()); const gap=S.siege.next-S.day; ok(gap>=7&&gap<=10,'scheduled '+gap+' days ahead');
  const days=new Set(); for(let d=1;d<60;d++){ S.day=d; S.siege.next=0; siegeTick(); days.add(S.siege.next-d); } ok([...days].every(x=>x>=7&&x<=10)&&days.size>=3,'gaps vary between 7 and 10: '+[...days].sort());
  S.siege.next=0; setLvl(1); S.ti={}; S.build={forge:1,ossuary:1}; ok(siegeOpen(),'buildings keep the town open'); invariants('scheduled');
});

test('Sieges: the dawn before brings a notice, a tip and a banner on the Town tab; the exact day stays hidden before that',()=>{
  const g=town(); ui.tab='town'; let h=renderAll('town early'); ok(!/siege-warn/.test(h)&&!/siege-line/.test(h),'no banner, no day shown early'); ok(/b-siege/.test(h),'each building shows its siege perk');
  S.day=g.next-2; S.notices=[]; S.watches=0; endDay(); eq(S.day,g.next-1); ok(S.notices.some(n=>/The living march on the necropolis tomorrow at dusk/.test(n.m)),'a notice at dawn'); eq(g.warned,S.day); eq(T_('siegeWarned'),1);
  h=renderAll('warned'); ok(/class="siege-warn"/.test(h)&&/tomorrow at dusk/.test(h)&&/data-a="cxgo" data-k="sieges"/.test(h),'banner with a Codex link'); ok(/Siege: in 1 day/.test(h));
  ok(TIPS.find(t=>t.id==='siege').when(),'the one-time tip'); ok(STORY_BY.siege0.when(),'first-warning lore');
  ACTIONS.cxgo('sieges'); eq(ui.tab,'codex'); eq(ui.cx,'sieges');
  S.watches=0; S.notices=[]; const before=T_('siegeWarned'); siegeTick(); eq(T_('siegeWarned'),before,'one warning per day');
});

test('Sieges: the day ending (last watch or Rest until dawn) brings the siege after tonight\'s raids have marched; the War table says so',()=>{
  const g=town(); const c=cmdr(), a=mkMinion({lvl:12}), b=mkMinion({lvl:12}); S.day=g.next; ui.tab='gates'; ui.gsub='war';
  ok(/siege-note/.test(renderAll('war on a siege day'))&&/whoever you send will not be on the walls/.test(renderAll('war')),'a real choice, stated'); ok(sendRaid(c.uid,1,[a.uid]));
  const day=S.day; restDay(); eq(S.mode,'siege'); eq(S.day,day,'dawn waits for the siege'); eq(S.raids.length,1,'the raid marched first'); ok(!S.army.includes(c),'the Commander is not on the walls'); ok(S.army.includes(b));
  ok(S.siege.pending); invariants('siege screen'); const h=renderAll('intro'); ok(/class="win siege-intro"/.test(h)&&/The living are at the walls/.test(h)&&/data-a="siegego"/.test(h)&&/marched on a raid tonight/.test(h));
  ok(/Crypt<\/b>: minions have \+5% max HP/.test(h)&&/Forge<\/b>: attackers have 5% less armor/.test(h),'perks listed');
  endDay(); eq(S.mode,'siege','cannot be skipped'); ok(!startRun(0)&&S.mode==='siege','no runs from the siege screen');
  ACTIONS.siegego(); eq(S.mode,'battle'); ok(S.run.siege); invariants('wave 1');
});

test('Sieges: raiders keep their places overnight, so the siege raise goes to the Reserve and nobody waits at the gate at dawn',()=>{
  const g=town(); const c=cmdr(), a=mkMinion({lvl:12}); while(S.army.length<slots()) mkMinion({lvl:12});
  const r=mkMinion({lvl:12}); S.army=S.army.filter(m=>m!==r); S.reserve.push(r); for(let i=0;i<5;i++){ const m=mkMinion({lvl:6}); S.army=S.army.filter(x=>x!==m); S.reserve.push(m); }
  eq(reserveMax()-S.reserve.length,2,'two free Reserve places before the march'); const all=S.army.length+S.reserve.length;
  ok(sendRaid(c.uid,1,[a.uid,r.uid])); S.day=g.next; restDay(); eq(S.mode,'siege'); eq(raidN(),3);
  eq(armyUsed(),slots(),'the army is still full: the raiders keep their places'); eq(S.reserve.length+raidHeld(true),6,'and the one from the Reserve keeps its bench place');
  beginSiege(); fix(.99); killWave(); killWave(); killWave(); eq(S.mode,'raise'); const cs=S.run.corpses; S.player.mana=9999; fix(0);
  tryRaise(cs[0].id,false,false); ok(!cs[0].tried&&/army is full/.test(S.run.events[0].m),'no army place to fill'); ok(/Raise to the Reserve/.test(renderAll('raise')),'Raise to the Reserve offered');
  tryRaise(cs[0].id,false,true); eq(S.reserve.length,6,'raised to the Reserve'); tryRaise(cs[1].id,false,true); eq(S.reserve.length,7); tryRaise(cs[2].id,false,true); eq(S.reserve.length,7,'the raider bench place stays free'); ok(!cs[2].tried);
  S.notices=[]; returnTown(); eq(S.mode,'town'); eq(raidN(),0); eq((S.waiting||[]).length,0,'nobody waits at the gate');
  ok(S.army.includes(c)&&S.army.includes(a),'back in the army'); ok(S.reserve.includes(r),'back on the bench'); eq(S.army.length,slots()); eq(S.reserve.length,8); eq(S.army.length+S.reserve.length,all+2,'everyone, plus the two raised');
  invariants('dawn after a siege with raiders out');
});

test('Sieges: three waves with the between-room heal, no doors, events or raising until the last; the living stand at your level -1',()=>{
  town(20); const m=mkMinion({lvl:12,role:'vanguard'}); dueTonight(); beginSiege(); const r=S.run, P=S.player;
  eq(r.rooms,3); eq(r.di,siegeGate()); ok(r.enemies.every(e=>e.lvl===19&&e.living),'level 19'); eq(r.enemies.map(e=>e.base).join(),'Militia Spearman,Militia Spearman,Crossbowman');
  ui.tab='gates'; ok(/Siege &middot; Wave 1\/3/.test(renderAll('battle')),'header'); ok(/Abandon the walls/.test(renderAll('flee')));
  P.hp=10; P.mana=0; m.hp=1; fix(.99); killWave(); eq(S.mode,'battle','straight on to wave 2'); eq(r.room,1); ok(!r.doors&&!r.event,'no doors or events');
  eq(P.hp,Math.min(pMax(),10+Math.round(pMax()*DIFF.heal)),'the between-room heal'); ok(P.mana>=Math.round(pMana()*DIFF.mana)); ok(m.hp>1);
  ok(r.enemies.some(e=>e.base==='Witch-hunter'&&e.elite),'an elite witch-hunter'); eq(r.corpses.length,0,'nothing to raise between waves');
  killWave(); eq(r.room,2); const b=r.enemies.find(e=>e.boss); eq(b.base,SIEGE_BOSS); eq(b.lvl,20); eq(b.abil,SIEGE_MOVE); ok(BOSS_ABIL[SIEGE_MOVE].warn,'a telegraphed move');
  killWave(); eq(S.mode,'raise'); ok(r.cleared); ok(r.corpses.length>=4,'the raise screen for the last wave'); invariants('won');
  const h=renderAll('raise'); ok(/Siege &middot; The necropolis holds/.test(h)&&/Back to the necropolis/.test(h));
});

test('Sieges: downed minions never shatter, and a kill counts for the quest, the bestiary and mastery',()=>{
  town(); const m=mkMinion({lvl:12}); dueTonight(); beginSiege(); m.hp=0; const q=S.quest.kills; fix(0); killWave(); ok(S.army.includes(m),'home ground'); ok(m.hp>0);
  ok(S.quest.kills>q,'daily quest'); ok(S.kills['Militia Spearman']>=2,'bestiary'); ok(masteryRungs(SIEGE_BOSS)[0].at===MASTERY[1].bossAt,'the captain counts as a boss kind');
  ui.tab='bes'; ok(/The living/.test(renderAll('bestiary'))&&/Militia Spearman/.test(renderAll('bes')));
});

test('Sieges: building perks: Crypt HP, Ossuary thralls, Altar mana, Forge armor',()=>{
  town(20,{crypt:2,ossuary:3,altar:2,forge:3}); const m=mkMinion({lvl:12}); const hp0=m.maxHp; dueTonight(); beginSiege();
  near(m.maxHp,Math.round(hp0*1.1),2,'Crypt 2: +10% max HP'); invariants('crypt perk');
  near(foeArmor(),DIFF.armor[siegeGate()]*(1-.15),1e-9,'Forge 3: 15% less armor');
  const P=S.player; P.mana=0; fix(.99); killWave(); ok(S.army.some(x=>x.thrall),'Ossuary: a fallen attacker rises'); const t=S.army.find(x=>x.thrall); eq(t.lvl,19-SIEGE_OSS_GAP,'Ossuary 3: 2 levels below');
  ok(armyUsed()===S.army.length-1,'a thrall holds no slot'); ok(P.mana>=Math.round(pMana()*DIFF.mana)+Math.round(pMana()*.2)-1,'Altar 2: +20% mana at wave 2');
  invariants('thrall'); killWave(); killWave(); returnTown(); ok(!S.army.some(x=>x.thrall),'thralls are gone at dawn'); eq(m.maxHp,hp0,'HP back to normal'); invariants('after');
  ui.tab='town'; const h=renderAll('town'); ok(/Siege: a fallen attacker rises for you at waves 2 and 3, at its level -2/.test(h));
});

test('Sieges: victory pays gold, bone dust and gear with a bonus line, and is recorded',()=>{
  town(20); dueTonight(); beginSiege(); const g0=S.gold, d0=S.dust||0, inv0=S.inv.length, pay=siegeGoldPay(); seed(11); killWave(); killWave(); killWave();
  ok(S.gold-g0>=pay,'gold '+(S.gold-g0)+' >= '+pay); ok((S.dust||0)>d0,'dust'); ok(S.inv.length>inv0,'gear'); const it=S.inv.filter(x=>S.run.spoils.includes(x.u)&&ITEM[x.id].name===S.run.siegePay.item).pop(); ok(it&&it.ro&&it.ro.length>=1,'a bonus line'); ok(!ITEM[it.id].uq);
  eq(T_('sieges'),1); eq(T_('siegeWins'),1); ok(!S.siege.pending,'settled'); const day=S.day; returnTown(); eq(S.day,day+1,'dawn'); eq(S.mode,'town');
  ok(S.siege.next>=S.day+6&&S.siege.next<=S.day+10,'the next one is scheduled'); const h=S.hist[S.hist.length-1]; ok(h.siege&&h.res==='cleared');
  ui.tab='rec'; ok(/Sieges fought \/ held/.test(renderAll('rec'))); ui.tab='hist'; ok(/Siege on the necropolis/.test(renderAll('hist'))&&/Held/.test(renderAll('hist')));
  ok(STORY_BY.siege1.when()); ok(S.notices.some(n=>/necropolis held/.test(n.m)));
  eq(SIEGE_GOLD*20*(1+(RK[siegeGate()].lv+1)*.5)*(1+siegeGate()*.5)>0,true);
});

test('Sieges: a defeat damages exactly one building (its effects off), costs no XP, and a two-press repair for half its level\'s gold restores it',()=>{
  town(20,{crypt:2,forge:1}); const xp=S.player.xp=50; dueTonight(); beginSiege(); fix(.99); S.player.hp=0; ok(playerFalls()); eq(S.mode,'defeat'); eq(S.player.xp,xp,'no XP lost');
  const k=S.siege.dmg; ok(k==='crypt'||k==='forge','one built building'); eq(bl(k),0,'its effects are off'); eq(blRaw(k),k==='crypt'?2:1,'never deleted'); eq(buildCost(k),null,'repair before upgrading');
  ok(/class="win siege-lost"/.test(renderAll('lost'))&&/Wait for dawn/.test(renderAll('lost'))); returnTown(); eq(S.mode,'town'); eq(T_('siegeLosses'),1); ok(STORY_BY.siegeL.when());
  invariants('damaged'); ui.tab='town'; let h=renderAll('damaged'); ok(/siege-dmg/.test(h)&&/Damaged/.test(h)&&/data-a="repair"/.test(h));
  const c=repairCost(); eq(c,Math.round(BUILD_COST[Math.max(0,blRaw(k)-1-(BUILD[k].step||0))][0]*SIEGE_REPAIR)); S.gold=c; ACTIONS.repair(); eq(S.siege.dmg,k,'first press asks'); ok(/Confirm: repair for/.test(renderAll('confirm')));
  ACTIONS.repair(); eq(S.siege.dmg,null); eq(S.gold,0); ok(bl(k)>0,'works again'); invariants('repaired');
});

test('Sieges: a defeat while a building is damaged costs 10% of your gold (capped) and damages nothing more; fleeing counts as a defeat',()=>{
  town(20,{crypt:1,forge:1,ossuary:1}); S.siege.dmg='forge'; S.gold=1000; dueTonight(); beginSiege(); flee(); eq(S.mode,'defeat','fleeing is a defeat'); eq(S.siege.dmg,'forge','still one');
  eq(S.gold,1000-Math.min(100,Math.round(siegeGoldPay()*SIEGE_FINE_MAX/SIEGE_GOLD))); returnTown(); eq(S.hist[S.hist.length-1].res,'fled');
  S.gold=1e7; dueTonight(); beginSiege(); S.player.hp=0; playerFalls(); ok(1e7-S.gold<=Math.round(siegeGoldPay()*SIEGE_FINE_MAX/SIEGE_GOLD),'capped'); invariants('fined');
});

test('Sieges: the fine is a whole number of gold even when the cap is the smaller side',()=>{
  town(10,{crypt:1,forge:1,ossuary:1}); S.ngp=1; S.siege.dmg='forge'; const cap=siegeGoldPay()*SIEGE_FINE_MAX/SIEGE_GOLD; ok(cap%1,'a cap that does not divide evenly: '+cap);
  S.gold=1e6; const g0=S.gold; dueTonight(); beginSiege(); flee(); ok(Number.isInteger(S.gold),'gold '+S.gold); eq(g0-S.gold,Math.round(cap)); invariants('fine');
});
test('Sieges: closing the tab mid-siege starts it again from wave 1 on load; old saves get a first siege; New Game+ resets it',()=>{
  town(20,{ossuary:2}); mkMinion({lvl:12}); dueTonight(); beginSiege(); fix(.99); killWave(); ok(S.army.some(m=>m.thrall));
  const snap=JSON.parse(JSON.stringify(snapshot())); ok(snap.siege.pending,'kept pending'); ok(!snap.army.some(m=>m.thrall),'thralls never saved'); eq(snap.watches,0);
  const g=normalizeSave(snap); applyLoaded(g); eq(S.mode,'siege','the siege again'); eq(S.run,null); beginSiege(); eq(S.run.room,0,'from wave 1'); invariants('reloaded');
  const old=JSON.parse(JSON.stringify(Object.assign({},S,{mode:'town',run:null,watches:3}))); delete old.siege; const o=normalizeSave(old); eq(canon(o.siege),canon({next:0,pending:false,dmg:null,warned:0}),'safe defaults');
  applyLoaded(o); ok(S.siege.next>=S.day+7&&S.siege.next<=S.day+10,'old saves that meet the unlock get one 7-10 days out');
  eq(normalizeSave(Object.assign(JSON.parse(JSON.stringify(S)),{siege:{next:-4,pending:'x',dmg:'castle'}})).siege.dmg,null,'repaired');
  S.siege.dmg='crypt'; S.ti.clr[5]=1; S.mode='town'; S.run=null; ok(startNGP()); eq(canon(S.siege),canon({next:0,pending:false,dmg:null,warned:0}),'New Game+ resets it with the town'); ok(!siegeOpen());
});

test('Sieges: "off":["siege"] (the bot switch) keeps the living away; nothing else changes in seeded play without them',()=>{
  town(20); const keep=siegeOpen; try{ siegeOpen=()=>false; S.siege.next=S.day; S.watches=0; const d=S.day; endDay(); eq(S.mode,'town'); eq(S.day,d+1,'straight to dawn'); } finally { siegeOpen=keep; }
  const play=on=>{ fresh(15); S.ti={clr:{0:1,1:1}}; S.build=on?{crypt:1,forge:1}:{}; S.siege.next=on?S.day+5:0; mkMinion({lvl:12}); seed(4242); S.watches=WATCHES; startRun(1); const out=[];
    for(let i=0;i<60&&S.mode==='battle';i++){ act('strike'); out.push(S.player.hp,S.run.enemies.map(e=>e.hp).join()); } out.push(Math.random()); return out.join('|'); };
  const a=play(false), b=play(true); ok(a.length>40,'a real fight'); eq(a,b,'the same fight and the same random stream with a siege scheduled');
});

test('Sieges: the Codex, How to play, the screens and Turkish',()=>{
  town(); const h=cdx('sieges'); ok(/every 7 to 10 days/.test(h)&&/3 waves on the normal battle screen/.test(h)&&/Inquisitor Captain/.test(h)&&/50% of its current level/.test(h)&&/10% of the gold you carry/.test(h),'built from the constants');
  ok(/Buildings on the walls/.test(h)&&/Minions have \+5% max HP per level/.test(h));
  ok(HELP_LATER().some(x=>x[0]==='Sieges'&&x[2]),'How to play');
  for(const s of ['The living march on the necropolis tomorrow at dusk','The living are at the walls','Man the walls','Siege · Wave 1/3 · Turn 2','Abandon the walls','Siege · The walls fell','Wait for dawn','Sieges fought / held','Siege on the necropolis',
    'Burned in the last siege. Its effects, siege perk included, are lost until it is repaired. Repairs cost gold only','The living break and run. Their dead are yours','Siege: in 1 day',
    'They fired the Crypt: its effects are lost until you repair it in town for 2500 gold','The Ossuary stirs: Wren, once a Crossbowman, rises to fight for you tonight',
    'Order the raid for tonight · 60% odds','War table · 1 tonight','marches at nightfall, back at dawn',"Tonight's raid on the Rat Warren lapses: its Commander is gone"]) ok(trText(s)!==s,'Turkish: '+s);
  eq(trText('Siege: in 1 day'),'Kuşatma: 1 gün sonra'); ok(STORY.filter(s=>/^siege/.test(s.id)).every(s=>trText(s.m)!==s.m&&trText(s.t)!==s.t),'lore in Turkish');
  ok(BOSS_LINES[SIEGE_BOSS].every(l=>trText(l)!==l),'the captain speaks Turkish');
  ok(SIEGE_NAMES.every(n=>IC[n]&&MAT[n]),'each of the living has an icon and colours'); ok(SIEGE_NAMES.every(n=>!/#(2a3a8a|5a3a9a)/i.test(MAT[n][1])),'no blue or purple');
});
})();
