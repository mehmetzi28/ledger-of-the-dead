// The Reserve (src/game-phases-town.js): a bench beside the army, raiders who keep their places overnight, and minions waiting at the gate.
(function(){
const {test,ok,eq,fix,setLvl,foe,arena,mkMinion,corpse,raiseScene,give,renderAll,cdx,invariants}=window.LOTD_T;
const bench=o=>{ const m=mkMinion(o); S.army=S.army.filter(x=>x!==m); S.reserve.push(m); return m; };   // straight onto the bench, like a loaded save
const cmdr=o=>mkMinion(Object.assign({elite:true,traits:['commander'],lvl:12,rankI:2},o));
const fill=()=>{ while(S.army.length<slots()) mkMinion({lvl:2}); };

test('Reserve: 6 places, +2 per Crypt level, and nothing before the Town tab opens',()=>{
  eq([RESERVE_BASE,RESERVE_CRYPT].join(),'6,2'); eq(reserveMax(),6); S.build={crypt:1}; eq(reserveMax(),8); S.build={crypt:BUILD_MAX}; eq(reserveMax(),12); S.build={};
  ok(!townOpen()&&!reserveOpen(),'level 1, nothing cleared'); const a=mkMinion({}); S.mode='town'; ok(!toReserve(a.uid),'locked'); eq(S.reserve.length,0);
  ui.tab='army'; let h=renderAll('locked'); ok(!/Reserve \d/.test(h)&&!/data-a="tores"/.test(h),'no Reserve on screen yet');
  setLvl(4); ok(!reserveOpen(),'level alone opens nothing'); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1}}); ok(reserveOpen()); h=renderAll('open'); ok(/Reserve 0\/6/.test(h),'Reserve 0/6 under the army'); ok(h.includes('data-a="tores" data-k="'+a.uid+'"'),'To reserve on the army minion');
});

test('Reserve: moves and swaps are free and instant in town, refused in a run, and both limits hold',()=>{
  setLvl(4); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1}}); S.mode='town'; const a=mkMinion({lvl:3}), b=mkMinion({lvl:4}); const g=S.gold;
  ok(toReserve(a.uid)); eq(S.army.length,1); eq(S.reserve[0],a); eq(S.gold,g,'free');
  ok(toArmy(a.uid)); eq(S.reserve.length,0); ok(S.army.includes(a)); ok(toReserve(b.uid));
  ok(swapReserve(a.uid,b.uid),'one press'); ok(S.army.includes(b)&&S.reserve.includes(a)); ok(!swapReserve(a.uid,b.uid),'a is no longer in the army');
  fill(); ok(!toArmy(a.uid),'army full: the reserve one stays'); eq(S.reserve.length,1);
  while(S.reserve.length<reserveMax()) bench({}); const x=S.army[0]; ok(!toReserve(x.uid),'Reserve full'); ok(S.army.includes(x));
  ok(swapReserve(x.uid,a.uid),'a swap needs no free place on either side'); invariants('reserve full');
  arena([foe()],0); ok(!toReserve(S.army[0].uid)&&!toArmy(S.reserve[0].uid)&&!swapReserve(S.army[0].uid,S.reserve[0].uid),'never during a run');
});

test('Reserve: benched minions take no part in a fight, take no damage, earn no XP and keep their gear',()=>{
  setLvl(6); S.mode='town'; const a=mkMinion({lvl:3}), r=bench({lvl:3,name:'Warren Bandit',kind:'Warren Bandit',armed:true,eq:{weapon:null,armor:null,relic:null}});
  const it=give('1-wa'); giveGear(r.uid,it.u); eq(r.eq.weapon,it,'gear goes onto a benched minion'); ok(!S.inv.includes(it)); ok(ownsItem('1-wa'),'counts as in use');
  const atk=r.atk; arena([foe({hp:0,dead:true})],0); ok(!allies().includes(r),'not on the field'); ok(allies().includes(a));
  a.hp=0; const xp=r.xp, lvl=r.lvl; fix(0); roomWon(); eq(r.xp,xp); eq(r.lvl,lvl); eq(r.hp,r.maxHp,'no damage, no shatter'); ok(S.reserve.includes(r),'never shattered'); eq(r.atk,atk);
  S.mode='town'; S.run=null; takeGear(r.uid,'weapon'); ok(S.inv.includes(it),'gear comes off again');
});

test('Reserve: a full army may raise straight to the Reserve, with the real odds and mana cost',()=>{
  setLvl(4); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1}}); fill(); const c=raiseScene([corpse({}),corpse({})],4); c.lastXp=0; S.player.mana=100; const cost=raiseCost(c.corpses[0]);
  let h=renderAll('raise full'); ok(/data-a="raiseres"/.test(h),'the option'); ok(h.includes('Raise to the Reserve &middot; '+raiseChance(c.corpses[0])+'% &middot; '+cost+' mana'),'odds and cost'); ok(/The Reserve has 6 free places/.test(h));
  tryRaise(c.corpses[0].id); eq(c.corpses[0].tried,false,'a plain raise is still refused');
  fix(0); const n=S.army.length, m0=S.player.mana; tryRaise(c.corpses[0].id,false,true); eq(S.army.length,n); eq(S.reserve.length,1); eq(S.player.mana,m0-cost); eq(S.reserve[0].hp,S.reserve[0].maxHp);
  ok(/Raised to the Reserve as/.test(renderAll('raised')));
  while(S.reserve.length<reserveMax()) bench({}); h=renderAll('both full'); ok(!/data-a="raiseres"/.test(h),'both full: as before'); ok(/Release your weakest/.test(h));
  S.mode='raise'; S.army.pop(); const before=S.reserve.length; fix(0); tryRaise(c.corpses[1].id,false,true); eq(S.reserve.length,before,'room in the army: it goes to the army'); ok(c.corpses[1].result==='raised');
});

test('Reserve: Raise the best, release your weakest, shatter and the army Order never touch it',()=>{
  setLvl(4); S.mode='town'; const r=bench({lvl:1}); fill(); const c=raiseScene([corpse({}),corpse({})],4); S.player.mana=100;
  raiseBest(); eq(S.reserve.length,1,'Raise the best stops at a full army'); ok(weakest()!==r&&S.army.includes(weakest()),'the weakest is from the army');
  S.mode='town'; S.run=null; const before=S.reserve.slice(); sortArmy('level'); eq(S.reserve.join(),before.join()); release(weakest().uid); ok(S.reserve.includes(r));
  bench({lvl:5}); ok(sortReserve('level')); eq(S.reserve[0].lvl,5,'the Reserve has its own Order');
  release(r.uid); ok(!S.reserve.includes(r),'release works on a benched minion when you pick it');
});

test('Reserve: fusion, the Bone Altar and renaming work on benched minions',()=>{
  setLvl(10); S.mode='town'; S.gold=1e6; const a=mkMinion({lvl:5,role:'striker'}), r=bench({lvl:6,role:'striker'});
  ok(renameMinion(r.uid,'Benchwarmer')); eq(r.nick,'Benchwarmer'); const l=r.lvl; ok(empower(r.uid)); eq(r.lvl,l+1);
  ui.tab='town'; ok(renderAll('pit').includes('data-a="fusepick" data-k="'+r.uid+'"'),'the Flesh Pit lists the Reserve');
  const k=fuse(a.uid,r.uid); eq(k,r,'the higher level one is kept'); ok(S.reserve.includes(r)&&!S.army.includes(a),'the keeper stays where it was'); invariants('fused on the bench');
});

test('Reserve: raiders keep their places overnight; with no place left (an old save) they come home to the Reserve or the gate',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1,1:1}; S.mode='town'; const c=cmdr(), a=mkMinion({lvl:12}), b=mkMinion({lvl:12}), r=bench({lvl:12});
  ok(sendRaid(c.uid,1,[a.uid,b.uid,r.uid].slice(0,squadMax(c)-1))); marchRaids(); const away=raidN(); eq(armyUsed(),3,'army places kept'); while(armyRoom()) mkMinion({lvl:2}); eq(S.army.length,slots()-3,'the home army cannot take them');
  if(away>3){ eq(S.reserve.length,0); while(reserveRoom()) bench({}); eq(S.reserve.length,reserveMax()-1,'the Reserve place is kept too'); }
  fix(0); endDay(); ok(S.army.includes(c)&&S.army.includes(a)&&S.army.includes(b),'back in the army'); if(away>3) ok(S.reserve.includes(r),'back on the bench');
  eq((S.waiting||[]).length,0,'nobody waits at the gate'); S.reserve=[]; S.army=S.army.slice(0,slots());
  const sq=[mkMinion({lvl:3}),mkMinion({lvl:3}),mkMinion({lvl:3})]; S.army=S.army.filter(m=>!sq.includes(m)); fill(); S.raids=[{di:1,day:S.day,units:sq}];   /* no res: an old save's raiders held no places */
  fix(0); endDay(); eq(S.reserve.length,3,'army full: home to the Reserve'); ok(S.notices.some(n=>/3 went to the Reserve: your army is full/.test(n.m)));
  S.reserve=[]; S.raids=[{di:1,day:S.day,units:sq}];
  while(S.reserve.length<reserveMax()) bench({}); fix(0); endDay(); eq((S.waiting||[]).length,3,'both full: they wait at the gate'); ok(S.notices.some(n=>/3 wait at the gate/.test(n.m)));
  ui.tab='army'; let h=renderAll('gate'); ok(/Waiting/.test(h)&&/data-a="gatearmy"/.test(h)&&/data-a="gateres"/.test(h),'release or move choices');
  ok(!fromGate(sq[0].uid,'army'),'no room yet'); release(S.army[0].uid); ok(fromGate(sq[0].uid,'army')); ok(S.army.includes(sq[0]));
  ui.confirm=null; ACTIONS.release(String(sq[1].uid)); ok(S.waiting.includes(sq[1]),'two presses'); ACTIONS.release(String(sq[1].uid)); ok(!S.waiting.includes(sq[1]),'let go');
  S.reserve.pop(); fix(.5); endDay(); eq(S.waiting.length,0,'dawn places whoever still waits'); ok(S.reserve.includes(sq[2])); invariants('gate');
});

test('Reserve: a squad can be formed from the Reserve, and the War table says it will not leave you short',()=>{
  setLvl(20); S.ti=S.ti||{}; S.ti.clr={0:1,1:1}; S.mode='town'; const c=bench({elite:true,traits:['commander'],lvl:12,rankI:2}), f=bench({lvl:12}), a=mkMinion({lvl:12});
  ok(raidPool().includes(c)); ui.tab='gates'; ui.gsub='war'; const h=renderAll('war');
  ok(/fights the rest of today's runs with you and marches when the day ends/.test(h),'the card says so'); ok(/&middot; Reserve/.test(h),'Reserve minions are marked');
  ok(sendRaid(c.uid,1,[f.uid])); eq(S.reserve.length,2,'an order leaves the bench as it is'); marchRaids(); eq(S.reserve.length,0); eq(S.army.length,1); fix(0); endDay(); eq(S.army.length+S.reserve.length,3,'home at dawn');
});

test('Reserve: saves keep it; old saves load with an empty one; an over-limit Reserve is kept but takes no one new',()=>{
  setLvl(6); S.mode='town'; const r=bench({lvl:4,traits:['thick']}); S.waiting=[mkMinion({lvl:2})]; S.army.pop();
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.reserve.length,1); eq(g.reserve[0].nick,r.nick); eq(g.reserve[0].traits.join(),'thick'); eq(g.waiting.length,1); ok(g.reserve[0].uid<=g.uid);
  applyLoaded(g); eq(S.reserve[0].hp,S.reserve[0].maxHp); invariants('loaded');
  const old=JSON.parse(JSON.stringify(S)); delete old.reserve; delete old.waiting; const o=normalizeSave(old); eq(JSON.stringify(o.reserve),'[]'); eq(JSON.stringify(o.waiting),'[]');
  const bad=JSON.parse(JSON.stringify(S)); bad.reserve=['x',null,{nope:1},S.reserve[0]]; eq(normalizeSave(bad).reserve.length,1,'only valid minions');
  const big=JSON.parse(JSON.stringify(S)); big.reserve=[]; for(let i=0;i<9;i++) big.reserve.push(Object.assign(JSON.parse(JSON.stringify(S.reserve[0])),{uid:5000+i}));
  const n=normalizeSave(big); eq(n.reserve.length,9,'never trimmed'); applyLoaded(n); ok(!reserveRoom()); const z=mkMinion({}); ok(!toReserve(z.uid),'no one new while over the limit');
  S.ti=S.ti||{}; S.ti.clr={5:1}; S.mode='town'; ok(startNGP()); eq(S.reserve.length,0,'New Game+ starts over, like the army');
});

test('Reserve: the screens, the Codex, How to play, the tip and Turkish',()=>{
  setLvl(4); S.mode='town'; const a=mkMinion({lvl:3}), r=bench({lvl:2}); ui.tab='army';
  let h=renderAll('cards'); ok(/class="reserve"/.test(h)&&/Reserve 1\/6/.test(h)); ok(h.includes('data-a="toarmy" data-k="'+r.uid+'"')&&h.includes('data-a="swapo" data-k="'+r.uid+'"')&&/aria-label="To army: /.test(h));
  ACTIONS.swapo(String(r.uid)); h=renderAll('swap'); ok(/class="swap-pick"/.test(h)&&h.includes('data-a="swap" data-k="'+a.uid+'|'+r.uid+'"'));
  ACTIONS.swap(a.uid+'|'+r.uid); ok(S.army.includes(r)&&S.reserve.includes(a)&&ui.swap==null);
  bench({lvl:5}); VIEW.army='compact'; h=renderAll('compact'); ok((h.match(/class="mrow"/g)||[]).length>=2,'rows in the Reserve too'); ok(/data-a="rsort"/.test(h),'its own Order links'); VIEW.army='cards';
  ok(/Reserve/.test(cdx('raising'))&&new RegExp(RESERVE_BASE+' places, \\+'+RESERVE_CRYPT+' per Crypt level').test(cdx('raising')),'Codex Raising'); ok(!/still fill their slots/.test(cdx('raids'))&&/keep their places in the army or the Reserve/.test(cdx('raids')),'Codex Raids');
  ui.tab='help'; ok(/the Reserve \(a bench of 6 places/.test(renderAll('help')),'How to play');
  ok(TIPS.some(t=>t.id==='reserve')); S.tips={}; TIPS.forEach(t=>{ if(t.id!=='reserve') S.tips[t.id]=1; }); ui.tab='gates'; eq(currentTip()&&currentTip().id,'reserve');
  eq(trText('Reserve 2/6'),'Yedek 2/6'); eq(trText('To army'),'Orduya'); eq(trText('To reserve'),'Yedeğe'); eq(trText('Swap…'),'Değiştir…');
  eq(trText('Raise to the Reserve · 40% · 9 mana'),'Yedeğe dirilt · %40 · 9 mana'); eq(trText('Raised to the Reserve as Grim (Vicious)'),'Yedeğe diriltildi: Grim (Vicious)');
  eq(trText('The Reserve'),'Yedek'); ok(trText(TIPS.find(t=>t.id==='reserve').m)!==TIPS.find(t=>t.id==='reserve').m,'tip text');
  eq(trText('3 went to the Reserve: your army is full.'),'3 tanesi Yedeğe gitti: ordun dolu.'); eq(trText('Waiting'),'Bekliyor');
  for(const s of ['The Reserve is full','Your army is full','Order the Reserve','Swap with an army minion','Now: +1 army slot, +2 Reserve places','Your army is full: the minion goes to the Reserve',
    'A raid is an order for tonight: the squad fights the rest of today\'s runs with you and marches when the day ends. Odds are taken then, from whoever is left. Cancel any time before nightfall. Reserve minions can march too. Away overnight, each keeps its place in the army or the Reserve','Back from a raid, with no room in your army or the Reserve. Make room, or let one go',
    'A bench for minions you keep but do not take along. They do not fight, take damage or earn XP, and keep their gear. Moving one in or out is free, in town']) ok(trText(s)!==s,'Turkish: '+s);
});
})();
