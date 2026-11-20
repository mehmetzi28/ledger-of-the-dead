// Commander raids, the Rift, the small passives, rarity bulk tools, door keys, minion stats and the cursed/Nightmare tuning.
(function(){
const {test,ok,eq,near,fix,seq,setLvl,foe,arena,mkMinion,corpse,raiseScene,give,renderAll,cdx,invariants,bossFight}=window.LOTD_T;
const cmdr=o=>mkMinion(Object.assign({elite:true,traits:['commander'],lvl:12,rankI:2},o));

test('Commanders: only elites and bosses lead; raises, evolutions, fusion and saves keep it that way',()=>{
  const c=raiseScene([corpse({elite:true}),corpse({})],5); fix(0); S.player.mana=100;
  tryRaise(c.corpses[0].id); ok(hasTrait(S.army[0],'commander'),'an elite rose leading (roll 0 < '+CMD_ELITE+')');
  tryRaise(c.corpses[1].id); ok(!hasTrait(S.army[1],'commander'),'an ordinary body never leads');
  ok(!TRAIT_IDS.includes('commander'),'never an ordinary trait roll');
  const lead=mkMinion({elite:true,traits:['commander','thick'],lvl:10,role:'striker'}), plain=mkMinion({traits:['vicious'],lvl:12,role:'striker'});
  S.gold=1e6; S.mode='town'; S.run=null; const k=fuse(lead.uid,plain.uid); ok(k===plain,'the higher level one is kept'); ok(!hasTrait(k,'commander'),'fusion never hands Commander to a plain minion');
  const g=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{army:[{role:'striker',lvl:3,rankI:0,name:'Imp',traits:['commander','vicious']},{role:'striker',lvl:3,rankI:0,name:'Imp',elite:true,traits:['commander']}]}))));
  eq(g.army[0].traits.join(),'vicious'); eq(g.army[1].traits.join(),'commander');
});

test('Raids: a Commander orders a raid for tonight; the squad fights on all day, marches at nightfall and keeps its places while away',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1,1:1}; const c=cmdr(), a=mkMinion({lvl:12}), b=mkMinion({lvl:12}), d=mkMinion({lvl:12});
  ok(!sendRaid(c.uid,3,[a.uid]),'never an uncleared gate'); ok(!sendRaid(c.uid,1,[]),'never alone'); ok(!sendRaid(a.uid,1,[b.uid]),'only a Commander leads');
  ok(!sendRaid(c.uid,1,[a.uid,b.uid,d.uid]),'squad size: '+(squadMax(c)-1)+' followers for a base-form elite');
  ok(sendRaid(c.uid,1,[a.uid,b.uid])); eq(S.army.length,4,'nobody leaves before nightfall'); eq(raidN(),0); eq(S.raidOrders.length,1);
  ok(!sendRaid(c.uid,0,[d.uid]),'one squad per Commander'); const c2=cmdr(); ok(!sendRaid(c2.uid,0,[a.uid]),'a promised follower cannot march twice'); S.army=S.army.filter(m=>m!==c2);
  ui.tab='gates'; ok(/data-k="war"/.test(renderAll('sub-tabs')),'War table sub-tab'); ok(!/h-raid/.test(renderAll('gates only')),'not on the gates list'); ACTIONS.gsub('war'); const h=renderAll('war table');
  ok(/War table/.test(h)&&/tonight/.test(h)&&/marches at nightfall/.test(h)&&/data-a="recall"/.test(h)&&/Cancel/.test(h)); ok(new RegExp(Math.round(raidOdds(orderSquad(S.raidOrders[0]),1)*100)+'% odds now').test(h)&&!/ 0% odds/.test(h),'odds shown as a percent');
  vitals(()=>{ S.player.stats.will+=20; }); ok(recallRaid(0)); eq(S.raidOrders.length,0); eq(S.army.length,4,'cancelled at no cost'); invariants('cancelled after Will changed');
  ok(sendRaid(c.uid,1,[a.uid,b.uid])); const used=armyUsed(); marchRaids(); eq(S.army.length,1); eq(armyUsed(),used,'raiders keep their army places while away'); eq(raidN(),3); eq(S.raidOrders.length,0); ok(S.raids[0].odds>0,'odds taken as they march');
  S.raids=[]; S.army.push(c,a,b);
  ok(sendRaid(c.uid,1,[a.uid,b.uid])); release(a.uid); marchRaids(); eq(S.raids[0].units.length,2,'a released follower is simply not in the squad'); S.army.push(...S.raids[0].units); S.raids=[];
  ok(sendRaid(c.uid,1,[b.uid])); S.army=S.army.filter(m=>m!==c); S.notices=[]; marchRaids(); eq(S.raids.length,0,'no Commander: the order lapses'); ok(/lapses/.test(S.notices[0].m)); ok(S.army.includes(b),'the follower stays home');
  const big=mkMinion({boss:true,traits:['commander'],stage:2,lvl:12}); eq(squadMax(big),1+RAID_SQUAD+2+1);
});

test('Raids: the squad fights the rest of the day; the day ending (last watch or Rest until dawn) sends it, and it is home at dawn',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1}; const c=cmdr({lvl:10,rankI:0}), a=mkMinion({lvl:10}); S.watches=1; ok(sendRaid(c.uid,0,[a.uid]));
  startRun(0); ok(S.army.includes(c)&&S.army.includes(a),'still fighting with you'); fix(0); flee(); eq(S.day>1||S.raidLog.length>0,true); eq(S.raidLog.length,1,'marched when the last watch ended the day'); eq(S.raidOrders.length,0); ok(S.army.includes(c),'home at dawn');
  ok(sendRaid(c.uid,0,[a.uid])); S.mode='town'; restDay(); eq(S.raidLog.length,2,'Rest until dawn marches it too');
});

test('Raids: odds grow with the squad and its Commander; a win pays gold, gear and XP, a loss can cost followers',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1}; const c=cmdr(), f=[1,2,3].map(()=>mkMinion({lvl:12,rankI:2}));
  const o1=raidOdds([c],2), o3=raidOdds([c].concat(f),2); ok(o3>o1,'more hands '+o1+' '+o3); ok(o1>=RAID_MIN&&o3<=RAID_MAX,'bounds');
  const e=mkMinion({elite:true,traits:['commander'],lvl:12,rankI:2,stage:2}); ok(raidOdds([e].concat(f),2)>raidOdds([c].concat(f),2),'an evolved Commander leads better');
  S.army=S.army.filter(m=>m!==e);
  ok(sendRaid(c.uid,2,f.slice(0,2).map(m=>m.uid)),'send'); const g0=S.gold, inv0=S.inv.length, xp0=f[0].xp+f[0].lvl*1e6; fix(0); endDay();
  ok(S.gold>g0,'gold '+S.gold+' '+g0); ok(S.inv.length>inv0,'gear'); ok(f[0].xp+f[0].lvl*1e6>xp0,'XP'); eq(S.raids.length,0); eq(S.army.length,4,'everyone home'); eq(S.raidLog[0].won,true); eq(T_('raidWins'),1);
  ok(S.inv.every(it=>!ITEM[it.id].uq),'never a unique');
  const gb=mkMinion({lvl:12,rankI:2,traits:['gravebound']}); ok(sendRaid(c.uid,2,[f[0].uid,gb.uid]));
  fix(.99); endDay(); eq(S.raidLog[0].won,false); eq(S.army.length,5,'rolls above the loss chance: everyone home');
  ok(sendRaid(c.uid,2,[f[0].uid,gb.uid])); seq([.99],0); endDay(); eq(S.raidLog[0].won,false); eq(S.raidLog[0].lost,1);
  ok(S.army.includes(c),'the Commander always comes home'); ok(S.army.includes(gb),'Grave-bound never fall'); ok(!S.army.includes(f[0]),'the other follower fell');
  invariants('after raids');
});

test('Raids: measured pay, 3x a gate\'s gold and half a level of XP, stated in the Codex',()=>{
  eq([RAID_GOLD,RAID_XP,RAID_ITEM3,RAID_LOSS,RAID_K].join(),'3,0.5,0.5,0.3,0.6','rewards pulled back 2026-11-19 for the full heat:0 guard rail; odds and losses untouched');
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={2:1}; const c=cmdr(), f=mkMinion({lvl:12,rankI:2}); S.army=S.army.filter(m=>m!==c&&m!==f);
  const need=mneed(f.lvl), xp0=f.xp, g0=S.gold, inv0=S.inv.length; fix(0); resolveRaid({di:2,day:S.day,units:[c,f]});
  eq(S.gold-g0,Math.round((15+20*4)*3*RAID_GOLD*ngpReward())); eq(S.inv.length-inv0,3,'a roll under RAID_ITEM3 brings the third piece');
  ok(f.lvl>12||f.xp-xp0===Math.round(need*RAID_XP),'half a level');
  ok(/3x a gate's gold, two or three pieces of gear from its table \(never a unique\) and half of a level of XP/.test(cdx('raids')),'Codex');
  eq(trText('3x a gate\'s gold, two or three pieces of gear from its table (never a unique) and half of a level of XP for each member.'),'Bir kapının altınının x3\'i, tablosundan iki ya da üç parça teçhizat (asla eşsiz değil) ve her üyeye yarım seviyelik TP.');
});
test('Raids: orders and marched squads survive a save and a reload; the War table shows the last raids',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1}; const c=cmdr({lvl:10,rankI:0}), a=mkMinion({lvl:10}); ok(sendRaid(c.uid,0,[a.uid]));
  const o=normalizeSave(JSON.parse(JSON.stringify(S))); eq(o.raidOrders.length,1); eq(o.raidOrders[0].cu,c.uid); eq(o.army.length,2,'an order keeps its squad in the army');
  eq(normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{raidOrders:[{di:99,cu:1,uids:[]},'x',{di:0}]})))).raidOrders.length,0,'bad orders dropped');
  delete S.raidOrders; eq(normalizeSave(JSON.parse(JSON.stringify(S))).raidOrders.length,0,'old saves: no orders'); S.raidOrders=o.raidOrders; marchRaids();
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.raids.length,1); eq(g.raids[0].units.length,2); eq(g.raids[0].units[0].nick,c.nick); eq(g.army.length,0); eq(g.raids[0].odds,S.raids[0].odds,'the odds they marched with');
  const ids=g.raids[0].units.map(m=>m.uid); ok(ids.every(u=>u<=g.uid),'ids stay below the counter');
  const bad=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{raids:[{di:99,units:[]},'x',{di:0,units:[{nope:1}]}]})))); eq(bad.raids.length,0);
  fix(0); endDay(); ui.tab='gates'; ui.gsub='war'; ok(/Last raids/.test(renderAll('raid log')));
});

test('The Rift: opens at level 40 after the Throne falls; depths open one at a time and grow harder',()=>{
  setLvl(39); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1}; ok(!riftOpen()); ui.tab='gates'; ui.gsub='rift'; ok(/opens at level 40/.test(renderAll('rift locked')));
  setLvl(45); ok(riftOpen()); ok(!startRift(2),'only one deeper than your best'); S.watches=3; fix(.5); ok(startRift(1)); eq(S.run.rift,1); eq(S.run.rooms,RIFT_ROOMS); eq(musicScene(),'rift'); ok(sceneOf('rift').bpm>0);
  ok(S.run.enemies.every(e=>e.rankI===5&&e.lvl>=riftLvl(1)),'foes at your level, deepest-gate strength'); const h1=S.run.enemies[0].maxHp;
  ok(/The Rift &middot; Depth 1/.test(renderAll('rift battle')));
  S.mode='town'; S.run=null; S.rift={best:9}; S.watches=3; fix(.5); ok(startRift(10)); near(S.run.enemies[0].maxHp/h1,riftMul(10)*mobStats(5,riftLvl(10),1,1).hp/mobStats(5,riftLvl(1),1,1).hp,0.2,'depth hardens foes');
});

test('The Rift: clearing your deepest depth opens the next, records it and leaves an extra legendary',()=>{
  setLvl(45); S.ti=S.ti||{}; S.ti.clr={5:1}; S.watches=3; fix(.5); startRift(1); const r=S.run; r.room=r.rooms-1; r.enemies=[foe({hp:0,dead:true})]; r.loot=[];
  fix(.99); roomWon(); ok(r.cleared); eq(riftBest(),1); ok(r.spoils.some(u=>{ const it=S.inv.find(x=>x.u===u); return it&&ITEM[it.id].tier===4; }),'a legendary');
  eq(T_('rifts'),1); returnTown(); eq(S.hist[S.hist.length-1].rift,1); ui.tab='hist'; ok(/The Rift, depth 1/.test(renderAll('history')));
  ui.tab='gates'; ui.gsub='rift'; ok(/deepest 1/.test(renderAll('rift card'))); ok(!S.ti.clr[0],'a rift clear is not a gate clear');
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.rift.best,1);
});

test('Passives: six small passives feed gold, XP, damage taken, healing, mana and raise cost',()=>{
  setLvl(40); const P=S.player; const g0=xb('goldp'), x0=xb('xpp'), d0=xb('drp'), h0=xb('healp'), m0=pMana();
  P.skills.robber=3; P.skills.scholar=2; P.skills.calcify=1; P.skills.sanguine=1; P.skills.deathless=2;
  eq(xb('goldp')-g0,15); eq(xb('xpp')-x0,8); eq(xb('drp')-d0,2); eq(xb('healp')-h0,8); ok(pMana()>m0);
  const c=corpse({rankI:3}), c0=raiseCost(c); P.skills.thrift=3; ok(raiseCost(c)<c0);
  ['robber','scholar','calcify','sanguine','thrift','deathless'].forEach(id=>{ ok(SKILL[id].type==='passive'&&SKILL_MODS[id],id); });
  ui.tab='skills'; ok(/Grave Robber/.test(renderAll('skills')));
});

test('Bag tools: sell or salvage every Rare, Epic or Legendary at once, each with its own button; locked pieces stay',()=>{
  setLvl(30); S.build.workshop=1; const r1=give('2-wa'), r2=give('2-aa'), e1=give('3-wa'), l1=give('4-wa'), lk=give('4-aa'); lk.lk=true;
  ui.tab='market'; ui.mk='sell'; const h=renderAll('market sell'); ok(/Sell Rare \(2\)/.test(h)&&/Sell Epic \(1\)/.test(h)&&/Sell Legendary \(1\)/.test(h),'three buttons');
  const g0=S.gold; ACTIONS.selltier('2'); eq(S.inv.length,5,'first press asks'); ACTIONS.selltier('2'); ok(!S.inv.includes(r1)&&!S.inv.includes(r2)); ok(S.gold>g0);
  if(workOpen()){ const d0=S.dust; ACTIONS.salvtier('4'); ACTIONS.salvtier('4'); ok(!S.inv.includes(l1)); ok(S.inv.includes(lk),'locked stays'); ok(S.dust>d0); }
  ok(S.inv.includes(e1)); eq(sellTier(1),null,'only Rare and up'); invariants('bulk');
});

test('Doors: number keys pick a door between rooms',()=>{
  const r=wonRoomDoors(); const k=r.doors[1]; const ev={key:'2',target:{tagName:'BODY'},preventDefault(){},ctrlKey:false,metaKey:false,altKey:false};
  window.__listeners.keydown.forEach(f=>f(ev)); eq(S.run.roomKind,k); ok(S.run.room===1);
});
function wonRoomDoors(){ arena([foe({hp:0,dead:true})]); S.run.room=0; fix(.99); roomWon(); S.run.doors=['fight','elite']; return S.run; }

test('Codex: minion stats for every body you have met; minion details show base stats and evolution buffs',()=>{
  S.kills={'Tunnel Rat':1,'The Rat King':1}; const h=cdx('minions'); ok(/Tunnel Rat/.test(h)&&/The Rat King/.test(h)&&/\?\?\?/.test(h));
  const st=mobStats(0,RK[0].lv,.85,1.1,false,false); ok(h.includes('HP '+st.hp+' &middot; ATK '+st.atk),'the numbers match the game');
  ok(/Ancient/.test(cdx('traits'))&&/Commander/.test(cdx('traits'))); ok(/War table/.test(cdx('raids'))); ok(/level 40/.test(cdx('rift')));
});

test('Battle: minions get compact cards',()=>{
  setLvl(10); mkMinion({}); mkMinion({}); arena([foe()]); const h=renderAll('battle'); eq((h.match(/unit ally mini/g)||[]).length,2); ok(/class="row minis side"/.test(h));
});

test('Language: Turkish lays over the English text, numbers and names kept; unknown text stays English',()=>{
  eq(trText('Lv 12 · ATK 40'),'Sv 12 · SAL 40'); eq(trText('Rest until dawn'),'Şafağa kadar dinlen'); eq(trText('+5 Strength'),'+5 Güç');
  eq(trText(' Room 2 of 4. '),' Oda 2 / 4. '); eq(trText('Rare · Relic'),'Nadir · Emanet'); eq(trText('Tunnel Rat'),'Tunnel Rat','names stay');
  eq(trText('A sentence nobody wrote down'),'A sentence nobody wrote down');
  for(const s of ['weapon','armor','relic']) ok(!/equipped/.test(trText('No '+s+' equipped.')),s+' slot empty');
  ok(!/Reach floor/.test(trText('Reach floor 11 to learn what waits here.'))); ok(!/Beyond/.test(trText('Beyond floor 100 lies the Abyss, a climb with no top.')));
  for(const D of DUNGEONS) ok(trText(D.blurb)!==D.blurb,D.name+' blurb'); eq(trText('Hidden'),'Gizli'); eq(trText('Chosen'),'Seçildi');
  for(const t of TIERS) ok(/^Gizli bir /.test(trText('A hidden '+t.toLowerCase()+' title. Keep playing to discover it.')),'hidden '+t);
  eq(trText('When worn: −3% Damage taken'),'Giyilince: −%3 Alınan hasar','minus sign'); eq(trText('3: −5% Damage taken'),'3: −%5 Alınan hasar');
  eq(trText('costs −8% Damage dealt, −15% Gold from kills'),'bedeli: −%8 Verilen hasar, −%15 öldürmeden altın');
  eq(trText('1 point to spend:'),'Harcanacak 1 puan:'); eq(trText('3 points to spend:'),'Harcanacak 3 puan:'); eq(trText('1 unspent point'),'1 harcanmamış puan'); eq(trText('4 unspent points'),'4 harcanmamış puan');
  ok(trText('Equip it from your bag. Gear returns to the bag if it is released or shattered.')!=='Equip it from your bag. Gear returns to the bag if it is released or shattered.','gear-bearer hint');
  eq(trText('Your devotion is complete.'),'Bağlılığın tamamlandı.'); eq(trText(' (3/3 worn) · '),' (3/3 giyili) · '); eq(trText('Ember Rite set (2/3 worn): '),'Ember Rite takımı (2/3 giyili): ');
  eq(trText('devotion 3/3'),'bağlılık 3/3'); eq(trText('Renounce · '),'Vazgeç · '); eq(trText('Confirm: renounce for 120 gold'),'Onayla: 120 altına vazgeç');
  for(const [k,v] of TR_DICT) eq((k.match(/#/g)||[]).length,(v.match(/#/g)||[]).length,'numbers in '+k);
  ui.tab='settings'; const h=renderAll('settings'); ok(/data-k="lang\|tr"/.test(h)&&/Türkçe/.test(h)); ACTIONS.view('lang|tr'); eq(VIEW.lang,'tr'); ACTIONS.view('lang|xx'); eq(VIEW.lang,'tr'); ACTIONS.view('lang|en'); eq(VIEW.lang,'en');
});

test('Gates tab: the War table and the Rift are sub-tabs, shown once they exist',()=>{
  ui.tab='gates'; ok(!/data-a="gsub"/.test(renderAll('fresh')),'no sub-tabs on a new game');
  S.ti=S.ti||{}; S.ti.clr={5:1}; setLvl(30); let h=renderAll('rift teaser'); ok(/data-k="rift"/.test(h)&&/The Rift &middot; Lv 40/.test(h)); ok(!/data-k="war"/.test(h));
  ACTIONS.gsub('rift'); h=renderAll('rift tab'); ok(/opens at level 40/.test(h)&&!/h-gates/.test(h),'only the Rift');
  ACTIONS.gsub('nonsense'); eq(ui.gsub,'open'); ok(/h-gates/.test(renderAll('back to gates')));
});

test('Backdrops: a painted scene for the town, every gate, the Rift and the Tower; none with backgrounds off',()=>{
  eq(Object.keys(BACKDROPS).sort().join(),['g0','g1','g2','g3','g4','g5','rift','tower','town'].sort().join());
  for(const k in BACKDROPS){ const h=BACKDROPS[k](); ok(h.length>500&&!/NaN|undefined/.test(h),k+' draws cleanly'); eq(BACKDROPS[k](),h,k+' is the same every time'); }
  ui.tab='gates'; eq(sceneKey(),'town'); ui.tab='tower'; eq(sceneKey(),'tower'); ok(/sc-ray/.test(scAtmos('tower'))&&!/NaN|undefined/.test(scAtmos('b:The Rat King')),'shared atmosphere'); ui.tab='gates';
  setLvl(20); S.watches=3; startRun(3); eq(sceneKey(),'g3'); S.mode='town'; S.run=null;
  VIEW.nobg=true; eq(sceneKey(),''); VIEW.nobg=false;
  setLvl(45); S.ti=S.ti||{}; S.ti.clr={5:1}; S.watches=3; startRift(1); eq(sceneKey(),'rift');
});

test('Backdrops: layered depth stays modest and well formed; reduced motion draws them still',()=>{
  const calm=VIEW.calm;
  try{
    VIEW.calm=false;
    for(const k in BACKDROPS){ const h=BACKDROPS[k]();
      ok(h.length<90000,k+' markup stays small ('+h.length+')');
      eq((h.match(/<g[ >]/g)||[]).length,(h.match(/<\/g>/g)||[]).length,k+' groups are closed');
      ok(!/<script|on\w+=/i.test(h),k+' is only shapes');
      const ids=(h.match(/ id="[^"]+"/g)||[]).concat([' id="scB"',' id="scB2"',' id="scV"',' id="atR"',' id="atG"']); eq(new Set(ids).size,ids.length,k+' ids are unique in the page');
      const anim=(h.match(/class="sc-/g)||[]).length; ok(anim>0&&anim<=60,k+' moves in a few groups ('+anim+')');
      ok(/sc-par/.test(h),k+' has a drifting depth layer'); if(k!=='rift') ok(/sc-sway/.test(h),k+' has something hanging that stirs');
      ok(/sc-amb/.test(h),k+' has motes or embers'); }
    VIEW.calm=true;
    for(const k in BACKDROPS){ const h=BACKDROPS[k](); ok(!/class="sc-|sc-amb/.test(h)&&h.length>500,k+' is still and drawn with motion reduced'); eq(BACKDROPS[k](),h); }
    ok(!/class="sc-/.test(scCalm(scAtmos('town'))),'the shared atmosphere stands still too');
  } finally{ VIEW.calm=calm; }
});

test('Boss arenas: every gate boss, Tower warden and secret master has its own, shown while it lives',()=>{
  const all=DUNGEONS.map(D=>D.boss[0]).concat(TW_BOSS,SECRET.map(B=>B.name)); eq(all.length,22);
  all.forEach(n=>{ ok(ARENAS[n],n+' has an arena'); const h=ARENAS[n](scRand(5)); ok(h.length>800&&!/NaN|undefined/.test(h),n+' draws cleanly'); });
  const b=bossFight(2); eq(sceneKey(),'b:'+b.base,'the boss arena'); b.hp=0; eq(sceneKey(),'g2','the gate returns when it falls');
  VIEW.nobg=true; b.hp=10; eq(sceneKey(),'',' off in Settings'); VIEW.nobg=false;
});

test('Effects: Auto, Full or Light; Light swaps in the cheap icon shading and still backgrounds',()=>{
  ui.tab='settings'; const h=renderAll('settings'); ok(/data-k="fx\|light"/.test(h)&&/Effects/.test(h));
  ACTIONS.view('fx|light'); eq(VIEW.fx,'light'); ok(fxLight()); ok(document.body.classList.contains('lite'));
  ACTIONS.view('fx|full'); ok(!fxLight()); ok(!document.body.classList.contains('lite')); ACTIONS.view('fx|bogus'); eq(VIEW.fx,'full'); ACTIONS.view('fx|auto');
});

test('Small touches: raid odds on gate cards, Rift records, Space raises the best, boss lines in Turkish',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1,1:1}; const c=cmdr({lvl:12,rankI:1}); mkMinion({lvl:12}); mkMinion({lvl:12});
  ui.tab='gates'; ui.gsub='open'; const sq=bestSquad(); eq(sq[0],c); ok(new RegExp('Raid odds '+Math.round(raidOdds(sq,1)*100)+'%').test(renderAll('gate cards')));
  S.ti.clr[5]=1; setLvl(45); S.rift={best:3}; ok(/The Rift &middot; next 4/.test(renderAll('rift tab')));
  const r=raiseScene([corpse({}),corpse({})],20); S.player.mana=200; const ev={key:' ',target:{tagName:'BODY'},preventDefault(){},ctrlKey:false,metaKey:false,altKey:false};
  window.__listeners.keydown.forEach(f=>f(ev)); ok(r.corpses.every(x=>x.tried),'Space tried every body');
  eq(trText('The Rat King: "My court! To me, all of you, to me!"'),'The Rat King: "Sarayım! Bana, hepiniz, bana!"');
  ok([...new Set(Object.values(BOSS_LINES).flat().concat(Object.values(PHASE_LINES)))].every(l=>trText(l)!==l),'every boss line has Turkish');
});

test('Tuning: cursed foes x1.15 on Normal, x1.5 with a difficulty; Nightmare foes x3.6; rewards untouched',()=>{
  eq(HEAT[3].foe,3.6); eq(HEAT[3].gold,3); eq(HEAT[3].xp,2.3);
  setLvl(10); S.ti=S.ti||{}; S.ti.clr={0:1}; S.mod={day:S.day,gi:0,id:'drought'}; S.watches=3; startRun(0); near(foeHeat(),CURSE_FOE,1e-9); eq(heatK('gold'),1);
  S.mode='town'; S.run=null; S.heatMax={0:2}; setHeat(0,3); S.watches=3; startRun(0); near(foeHeat(),3.6*DAMNED_FOE,1e-9); near(heatK('xp'),2.3*DAMNED,1e-9);
  eq(UQ_MOB,.01); eq(raiseCost(corpse({}))>0,true); eq(DUST_TIER.join(),'1,1,2,4,7');
});
test('Keys: town tabs carry number keys, ? opens the shortcut sheet, and the new-day line sums up raids',()=>{
  S.mode='town'; ui.tab='gates'; let h=renderAll('tabs'); ok(/data-k="gates" aria-keyshortcuts="1"/.test(h)&&/data-a="keys"/.test(h),'tab keys and ? button'); ok(/Gear &middot; [0-9]+<kbd aria-hidden="true">2<\/kbd>/.test(h),'the tab hint stays out of the name, and the closed Tower tab is skipped');
  ACTIONS.keys(); h=renderAll('keys'); ok(/keys-ov/.test(h)&&/Switch tabs/.test(h)&&/Raise the best/.test(h),'sheet lists the keys'); ACTIONS.keys(); ok(!/keys-ov/.test(renderAll('closed')));
  eq(raidDayLine([]),''); eq(raidDayLine([{won:true,lost:0},{won:false,lost:2}]),' Raids: 1 won, 1 thrown back, 2 fallen.');
  ok(Array.isArray(resolveRaids()),'resolveRaids returns results');
});
test('Bulk: every two-press action keeps its pending confirm on the second click',()=>{
  ['selltier','salvtier','junk','sjunk','fuse','discard'].forEach(a=>ok(CONFIRM_ACTS.includes(a),a));
  const src=Object.entries(ACTIONS).filter(([k,f])=>/ui\.confirm\s*=\s*'/.test(String(f))).map(([k])=>k); src.forEach(k=>ok(CONFIRM_ACTS.includes(k),k+' sets a confirm but a click would clear it'));
});
test('Farming: a gate far below you pays less on Normal, ramping from 8 to 20 levels past its safe level down to half',()=>{
  eq(farmK(5,SAFE[5]+DIFF.farmFrom),1); eq(farmK(5,SAFE[5]),1); near(farmK(5,SAFE[5]+14),.75,1e-9); eq(farmK(5,SAFE[5]+20),.5); eq(farmK(2,SAFE[2]+40),DIFF.farmMin);
  ok(farmK(3,SAFE[3]+12)<farmK(3,SAFE[3]+11),'smooth, one level at a time');
  S.ti=S.ti||{}; S.ti.clr={}; setLvl(SAFE[1]+20); S.watches=3; startRun(1); eq(runFarm(),1,'first clear pays in full');
  eq(gateCleared(S.run),RK[1].clear,'first clear bonus in full'); near(runFarm(),.5,1e-9); eq(heatK('xp'),.5); eq(heatK('gold'),.5); eq(heatK('drop'),1,'drops never shrink');
  eq(gateCleared(S.run),Math.round(RK[1].clear*.5),'a later clear bonus is halved');
  S.run.heat=1; eq(runFarm(),1,'Hard'); eq(heatK('xp'),HEAT[1].xp); S.run.heat=0; S.run.mod=Object.keys(MODS)[0]; eq(runFarm(),1,'cursed'); S.run.mod=null;
  S.run.rift=1; eq(runFarm(),1,'the Rift'); S.run.rift=0; S.mode='town'; S.run=null; eq(runFarm(),1,'no run');
  ui.tab='gates'; ui.gsub='open'; S.heat={}; let h=renderAll('farm line'); ok(/Rewards here 50% on Normal at your level; Hard and up pay in full\./.test(h),'card line');
  setHeat(1,1); h=renderAll('hard'); ok(!/Rewards here/.test(h),'no line on Hard'); setHeat(1,0);
  setLvl(SAFE[1]+3); ok(!/Rewards here/.test(renderAll('fair')),'no line near the safe level');
});
test('Gates tab: a one-line army strip with health, the fallen and hurt, tonight\'s raid and raiders at the gate',()=>{
  ui.tab='gates'; ui.gsub='open'; S.mode='town'; S.run=null; S.army=[]; S.waiting=[]; S.raidOrders=[];
  ok(!/gate-army/.test(renderAll('no army')),'nothing with no army');
  setLvl(20); const a=mkMinion({lvl:5}), b=mkMinion({lvl:5}), c=mkMinion({lvl:5}); b.hp=Math.ceil(b.maxHp/2); c.hp=0;
  const hp=S.army.reduce((x,m)=>x+Math.max(0,m.hp),0), mx=S.army.reduce((x,m)=>x+m.maxHp,0);
  let h=renderAll('strip'); const g=(h.match(/<div class="gate-army"[\s\S]*?<\/div>/)||[''])[0];
  ok(g&&h.indexOf('gate-army')<h.indexOf('class="gates"'),'above the gate list');
  ok(g.includes('>'+armyUsed()+'/'+slots()+'<'),'army count and slots'); ok(g.includes(Math.round(hp/mx*100)+'%')&&g.includes(hp+'/'+mx),'health now and max');
  ok(/>1 down</.test(g)&&/>1 wounded</.test(g),'one down, one wounded'); ok(/data-a="tab" data-k="army"/.test(g),'links to the Army tab'); ok(!/waiting|Raid tonight/.test(g));
  a.hp=a.maxHp; b.hp=b.maxHp; c.hp=c.maxHp; ok(/All whole/.test(renderAll('whole')));
  S.ti=S.ti||{}; S.ti.clr=Object.assign({},S.ti.clr,{0:1}); const k=cmdr(); ok(sendRaid(k.uid,0,[a.uid]),'raid ordered'); ok(/Raid tonight: /.test(renderAll('raid'))&&renderAll('raid').includes(DUNGEONS[0].name));
  S.waiting=[Object.assign({},a,{uid:++S.uid}),Object.assign({},b,{uid:++S.uid})]; ok(/2 raiders waiting at the gate/.test(renderAll('waiting')));
  ui.gsub='war'; ok(!/gate-army/.test(renderAll('war table')),'only on the gates list'); ui.gsub='open';
  eq(trText('2 raiders waiting at the gate'),'Kapıda bekleyen 2 akıncı'); eq(trText('1 down'),'1 düştü'); eq(trText('Army tab'),'Ordu sekmesi');
  ok(/^Bu gece akın: /.test(trText('Raid tonight: Mn1 to the '+DUNGEONS[0].name)),'Turkish');
  S.waiting=[]; S.raidOrders=[];
});
})();
