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

test('Raids: a Commander takes followers to a cleared gate; they are away (still in their slots) until dawn',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1,1:1}; const c=cmdr(), a=mkMinion({lvl:12}), b=mkMinion({lvl:12}), d=mkMinion({lvl:12});
  ok(!sendRaid(c.uid,3,[a.uid]),'never an uncleared gate'); ok(!sendRaid(c.uid,1,[]),'never alone'); ok(!sendRaid(a.uid,1,[b.uid]),'only a Commander leads');
  ok(!sendRaid(c.uid,1,[a.uid,b.uid,d.uid]),'squad size: '+(squadMax(c)-1)+' followers for a base-form elite');
  const used=armyUsed(); ok(sendRaid(c.uid,1,[a.uid,b.uid])); eq(S.army.length,1); eq(armyUsed(),used,'raiders keep their slots'); eq(raidN(),3);
  ui.tab='gates'; ok(/data-k="war"/.test(renderAll('sub-tabs')),'War table sub-tab'); ok(!/h-raid/.test(renderAll('gates only')),'not on the gates list'); ACTIONS.gsub('war'); const h=renderAll('war table'); ok(/War table/.test(h)&&/back at dawn/.test(h)&&/raiding/.test(h)); ok(new RegExp(Math.round(raidOdds(S.raids[0].units,1)*100)+'% odds').test(h)&&!/ 0% odds/.test(h),'odds shown as a percent');
  vitals(()=>{ S.player.stats.will+=20; }); ok(recallRaid(0)); eq(S.army.length,4); eq(raidN(),0); invariants('recalled after Will changed (bug found by the fuzzer)');
  const big=mkMinion({boss:true,traits:['commander'],stage:2,lvl:12}); eq(squadMax(big),1+RAID_SQUAD+2+1);
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

test('Raids: squads survive a save and a reload; the War table shows the last raids',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1}; const c=cmdr({lvl:10,rankI:0}), a=mkMinion({lvl:10}); ok(sendRaid(c.uid,0,[a.uid]));
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.raids.length,1); eq(g.raids[0].units.length,2); eq(g.raids[0].units[0].nick,c.nick); eq(g.army.length,0);
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
  eq(UQ_MOB,.02); eq(raiseCost(corpse({}))>0,true); eq(DUST_TIER.join(),'1,1,2,4,7');
});
})();
