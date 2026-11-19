// Loadouts (src/game-phases-town.js): three named setups of worn gear, army and Reserve, and the ultimate; town only, never loses anything.
(function(){
const {test,ok,eq,setLvl,foe,arena,mkMinion,give,renderAll,invariants}=window.LOTD_T;
const bench=o=>{ const m=mkMinion(o); S.army=S.army.filter(x=>x!==m); S.reserve.push(m); return m; };
const allItems=()=>S.inv.concat(Object.values(S.equip).filter(Boolean),...S.army.concat(S.reserve,S.waiting).map(m=>m.eq?Object.values(m.eq).filter(Boolean):[])).map(it=>it.u).sort().join();
const allMinions=()=>S.army.concat(S.reserve,S.waiting).map(m=>m.uid).sort().join();
const setup=()=>{ setLvl(25); S.mode='town'; const w1=give('1-wa'), w2=give('2-wa'), r1=give('0-ta'); equip(w1.u); equip(r1.u); const a=mkMinion({nick:'Ana'}), b=mkMinion({nick:'Bo'}), c=bench({nick:'Cy'}); chooseUlt('toll'); return {w1,w2,r1,a,b,c}; };

test('Loadouts: three empty slots; Save here stores gear, army, Reserve and the ultimate; Use brings it all back',()=>{
  eq(LOADOUT_N,3); eq(S.loadouts.length,3); ok(S.loadouts.every(L=>L.s===null)); eq(loadoutName(1),'Loadout 2');
  const {w1,w2,r1,a,b,c}=setup(); ok(saveLoadout(0)); const s=S.loadouts[0].s;
  eq(s.gear.weapon.join(),w1.u+',1-wa'); eq(s.gear.armor,null); eq(s.army.map(x=>x[0]).join(),[a.uid,b.uid].join()); eq(s.res.map(x=>x[0]).join(),String(c.uid)); eq(s.ult,'toll'); ok(!('skills' in s),'no skills');
  equip(w2.u); unequip('relic'); ok(swapReserve(a.uid,c.uid)); chooseUlt('rise'); const items=allItems(), mins=allMinions();
  const r=useLoadout(0); eq(r.miss.length,0); eq(S.equip.weapon,w1); eq(S.equip.relic,r1); ok(S.inv.includes(w2),'the old piece goes to the bag');
  ok(S.army.includes(a)&&S.army.includes(b)&&!S.army.includes(c)&&S.reserve.includes(c)); eq(S.player.ult,'toll');
  eq(allItems(),items,'no item gained or lost'); eq(allMinions(),mins,'no minion gained or lost'); ok(S.notices[0].m==='Loadout restored: Loadout 1.'); invariants('loadout used');
});

test('Loadouts: a sold item, a fallen minion and gear held by a minion are reported in one notice; nothing else is touched',()=>{
  const {w1,r1,a,b}=setup(); ok(saveLoadout(1)); unequip('weapon'); unequip('relic'); ok(sellItem(w1.u)>0,'sold');
  const g=mkMinion({nick:'Gb',name:'Warren Bandit',kind:'Warren Bandit',armed:true,eq:{weapon:null,armor:null,relic:null}}); giveGear(g.uid,r1.u); eq(g.eq.relic,r1);
  release(a.uid); const items=allItems(), mins=allMinions(), n=S.notices.length;
  const r=useLoadout(1); eq(r.miss.join('; '),'Skeleton Guard Blade (gone); Tunnel Rat Charm (held by a minion); Ana (gone)'.replace('Skeleton Guard Blade',ITEM['1-wa'].name).replace('Tunnel Rat Charm',ITEM['0-ta'].name));
  eq(S.notices.length,n+1,'one notice'); ok(/^Loadout restored: Loadout 2\. Could not restore: .+ \(gone\), .+ \(held by a minion\), Ana \(gone\)\.$/.test(S.notices[0].m),S.notices[0].m); eq(S.notices[0].c,'bad');
  eq(g.eq.relic,r1,'never taken off a minion'); ok(S.army.includes(b)); ok(!S.army.includes(g)&&S.reserve.includes(g),'others step back to the Reserve');
  eq(allItems(),items); eq(allMinions(),mins); invariants('partial');
});

test('Loadouts: the army and Reserve limits hold; a swap needs no free place; no room is reported',()=>{
  setLvl(25); S.mode='town'; while(S.army.length<slots()) mkMinion({}); const kept=S.army.slice(); ok(saveLoadout(0));
  const x=kept[0]; ok(toReserve(x.uid)); while(S.reserve.length<reserveMax()) bench({}); const y=mkMinion({nick:'Newcomer'}); eq(S.army.length,slots());
  let r=useLoadout(0); eq(r.miss.length,0,'swapped in'); ok(S.army.includes(x)&&S.reserve.includes(y)); eq(S.reserve.length,reserveMax()); eq(S.army.length,slots());
  const z=bench({nick:'Extra'}); S.loadouts[2].s={gear:{weapon:null,armor:null,relic:null},army:kept.map(m=>[m.uid,m.nick]).concat([[z.uid,'Extra']]),res:[],ult:null};
  const mins=allMinions(); r=useLoadout(2); eq(r.miss.join(),'Extra (no room)'); ok(S.reserve.includes(z)); eq(allMinions(),mins); invariants('limits');
});

test('Loadouts: refused during a run; Use of an empty slot does nothing; renaming follows the minion rename rules',()=>{
  const {w2}=setup(); ok(!useLoadout(0),'empty slot'); ok(saveLoadout(0)); ok(renameLoadout(0,'  Tower <climb>  ')); eq(loadoutName(0),'Tower climb'); ok(!renameLoadout(0,'<>'));
  equip(w2.u); arena([foe()],0); ok(!saveLoadout(1)); ok(!useLoadout(0)); ok(!renameLoadout(0,'x')); eq(S.equip.weapon,w2,'nothing changed in the run');
});

test('Loadouts: old saves get three empty slots; bad shapes are repaired; stale ids stay until used',()=>{
  const {a}=setup(); ok(saveLoadout(0)); release(a.uid);
  const old=JSON.parse(JSON.stringify(S)); delete old.loadouts; const g=normalizeSave(old); eq(g.loadouts.length,3); ok(g.loadouts.every(L=>L.s===null&&L.n===''));
  const bad=JSON.parse(JSON.stringify(S)); bad.loadouts=[bad.loadouts[0],'junk',{n:'<i>x</i>',s:{gear:{weapon:['a',1]},army:[[1,'A'],'b'],ult:'nope'}},{n:'fourth'}]; const h=normalizeSave(bad);
  eq(h.loadouts.length,3); ok(h.loadouts[0].s.army.some(x=>x[0]===a.uid),'a fallen minion stays listed until the slot is used'); eq(h.loadouts[1].s,null); eq(h.loadouts[2].n,'ixi','cleaned like a nickname');
  eq(h.loadouts[2].s.gear.weapon,null); eq(h.loadouts[2].s.army.length,1); eq(h.loadouts[2].s.res.length,0); eq(h.loadouts[2].s.ult,null);
});

test('Loadouts: the Gear tab strip; Use is one press, Save over a stored slot two; rename; Turkish',()=>{
  setLvl(2); S.mode='town'; ui.tab='gear'; ok(!/h-lo/.test(renderAll('locked')),'not before the Town tab opens');
  setup(); ui.tab='gear'; let h=renderAll('strip'); ok(/h-lo/.test(h)&&(h.match(/class="lo-slot empty"/g)||[]).length===3); ok(/data-a="louse" data-k="0" disabled/.test(h));
  ACTIONS.losave('0'); ok(S.loadouts[0].s,'an empty slot saves at once'); h=renderAll('saved'); ok(/2 worn &middot; 2 in the army/.test(h));
  const w=S.equip.weapon; unequip('weapon'); ACTIONS.losave('0'); eq(ui.confirm,'lo0'); eq(S.loadouts[0].s.gear.weapon[0],w.u,'not yet overwritten'); ok(/Confirm/.test(renderAll('confirm')));
  ACTIONS.losave('0'); eq(ui.confirm,null); eq(S.loadouts[0].s.gear.weapon,null,'overwritten on the second press');
  ACTIONS.loreno('1'); h=renderAll('rename'); ok(/id="lrn"/.test(h)); ui.lrn='Rift'; ACTIONS.loren('1'); eq(loadoutName(1),'Rift'); eq(ui.lren,null);
  eq(trText('Loadouts'),'Donanımlar'); eq(trText('Loadout 3'),'Donanım 3'); eq(trText('2 worn · 5 in the army'),'2 giyili · 5 orduda'); eq(trText('Save here'),'Buraya kaydet');
  eq(trText('Loadout restored: Rift. Could not restore: Bone Blade (gone), Ana (no room).'),'Donanım geri yüklendi: Rift. Geri yüklenemedi: Bone Blade (yok), Ana (yer yok).');
  eq(trText('Loadout restored: Rift.'),'Donanım geri yüklendi: Rift.');
});
})();
