// Heartforging and the late economy (src/game-forge.js, R4 PR A): hearts forge chosen-line set pieces, minor powers, the Tower forge, the gold soft cap.
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,renderAll,wear}=window.LOTD_T;
const rich=()=>{ fresh(40); S.mode='town'; S.gold=1e6; S.dust=1e4; S.inv=[]; return S; };
const heart=(boss,n)=>{ S.trophies[hfKey(boss)]=(S.trophies[hfKey(boss)]||0)+(n||1); };
const lines=(boss,slot,n)=>hfLinesFor(boss,slot).slice(0,n);

test('Heartforge: every gate boss, warden, secret master and the Hunger has six real lines; masters and the Hunger carry a power',()=>{
  const all=DUNGEONS.map(D=>D.boss[0]).concat(TW_BOSS,SECRET.map(B=>B.name));
  all.forEach(b=>{ ok(HF_LINES[b],'lines for '+b); eq(new Set(HF_LINES[b]).size,6,b); HF_LINES[b].forEach(k=>ok(ROLL_KEYS[k]!=null,b+': '+k)); ok(TROPHY[hfKey(b)],'a heart trophy for '+b); ok(hfInfo(b),b); });
  SECRET.forEach(B=>{ const I=hfInfo(B.name); eq(I.n,3); ok(HF_POW[I.pw],B.name+' power'); eq(HF_POW[I.pw].boss,B.name); });
  const H=hfInfo('The Hunger'); eq(H.pw,'hungry'); eq(H.set,ABBEY); eq(H.n,3);
  DUNGEONS.slice(0,GATE_N).forEach((D,i)=>{ const I=hfInfo(D.boss[0]); eq(I.set,i); eq(I.n,2); ok(!I.pw); });
  const w1=hfInfo(TW_BOSS[0]), w9=hfInfo(TW_BOSS[8]); ok(w9.m>w1.m,'deeper wardens forge stronger lines'); eq(w1.set,5);
  ok(hfInfo('Tunnel Rat')===null,'no heart, no forge');
});
test('Heartforge: forging spends a heart, gold and dust and gives a set piece with exactly the chosen lines at the top of their range',()=>{
  rich(); const b=DUNGEONS[2].boss[0]; heart(b,2); const L=lines(b,'weapon',2), c=hfCost(b), g=S.gold, d=S.dust;
  const it=heartforge(b,'weapon',L); ok(it,'forged'); eq(it.hf,b); eq(ITEM[it.id].set,2); eq(ITEM[it.id].slot,'weapon'); ok(!ITEM[it.id].uq);
  eq(it.ro.map(r=>r[0]).join(),L.join(),'the lines you picked'); it.ro.forEach(([k,v])=>eq(v,hfLineVal(hfInfo(b),k),'top of the range'));
  eq(g-S.gold,c.g); eq(d-S.dust,c.d); eq(S.trophies[hfKey(b)],1); eq(T_('heartforged'),1);
  ok(!heartforge(b,'weapon',[L[0]]),'needs two lines'); ok(!heartforge(b,'weapon',[L[0],L[0]]),'two different lines'); ok(!heartforge(b,'weapon',[L[0],'nope']),'from the list');
  heartforge(b,'weapon',L); ok(!S.trophies[hfKey(b)],'the last heart is gone'); ok(!heartforge(b,'weapon',L),'no heart left');
  heart(b); S.mode='battle'; ok(!heartforge(b,'weapon',L),'only in town'); S.mode='town'; S.gold=0; ok(!heartforge(b,'weapon',L),'needs the gold');
});
test('Heartforge: lines respect the slot; secret masters and the Hunger add their power as a third line',()=>{
  rich(); Object.keys(HF_LINES).forEach(b=>GEAR_SLOTS.forEach(sl=>hfLinesFor(b,sl).forEach(k=>ok(!ROLL_SLOT[k]||ROLL_SLOT[k].includes(sl),b+' '+sl+' '+k))));
  const m=SECRET[1].name; heart(m); const it=heartforge(m,'armor',lines(m,'armor',2)); ok(it); eq(it.ro.length,2); eq(it.pw,powOf(m)); eq(ITEM[it.id].set,5);
  heart('The Hunger'); const h=heartforge('The Hunger','relic',lines('The Hunger','relic',2)); ok(h); eq(h.pw,'hungry'); eq(ITEM[h.id].set,ABBEY,'the Scribe\'s Regalia');
});
test('Heartforge: it warns before it spends a heart a held unique still needs; the press-again forges anyway',()=>{
  rich(); const u=Object.values(ITEM).find(d=>d.uq&&!d.tower&&d.set===1); S.inv.push({u:++S.uid,id:u.id}); const k=uniqHeart(u.id), b=k.slice(2); heart(b);
  ok(hfGuard(b),'the unique still needs it'); const L=lines(b,'weapon',2); ok(!heartforge(b,'weapon',L),'not without force');
  ui.tab='market'; ui.mk='forge'; ui.hfB=b; ui.hfS='weapon'; ui.hfL=L.slice(); ACTIONS.hforge(); eq(ui.confirm,'hf','first press asks'); ok(/Press again: a unique you hold still needs this heart/.test(renderAll('confirm')));
  ACTIONS.hforge(); ok(S.inv.some(it=>it.hf===b),'forged on the second press'); ok(!S.trophies[k]);
  rich(); heart(b,heartsKept(k)+1); ok(!hfGuard(b),'a spare heart forges freely');
});
test('Heartforge: a reforge re-rolls the values but never the lines; a second heart swaps one line',()=>{
  rich(); const b=DUNGEONS[4].boss[0]; heart(b,3); const L=lines(b,'armor',2), it=heartforge(b,'armor',L), I=hfInfo(b);
  for(let i=0;i<10;i++){ hfReroll(it); eq(it.ro.map(r=>r[0]).join(),L.join(),'lines kept'); it.ro.forEach(([k,v])=>ok(v>=Math.round(ROLL_KEYS[k]*I.m*HF_RE[0])-1&&v<=hfLineVal(I,k),'80-100%')); }
  const left=hfLinesFor(b,'armor').filter(k=>!L.includes(k)); ok(left.length>0);
  ok(!hfSwap(it.u,0,L[1]),'not a line it already has'); ok(hfSwap(it.u,0,left[0])); eq(it.ro[0][0],left[0]); eq(it.ro[0][1],hfLineVal(I,left[0])); eq(S.trophies[hfKey(b)],1); eq(T_('hfSwaps'),1);
  ok(!hfSwap(it.u,0,'nope'),'only from its list'); delete S.trophies[hfKey(b)]; ok(!hfSwap(it.u,1,left[1]||left[0]),'needs a heart');
  heart(b); ui.tab='bag'; ui.hfsw=it.u; ok(/data-a="hfswap"/.test(hfSwapHTML(it)),'the swap choices show'); ok(/Heartforged from/.test(itemCard?itemCard(it,''):'Heartforged from'));
});
test('Tower forge: six Tower trophies and gold forge Throne-set gear, sometimes with an extra line',()=>{
  rich(); S.trophies={}; const tk=Object.keys(TROPHY).filter(k=>k.startsWith('t:')); ok(tk.length>0,'Tower trophies exist'); S.trophies[tk[0]]=5;
  ok(!forgeTower('weapon'),'five is not enough'); S.trophies[tk[0]]=TW_FORGE_N*40; const g=S.gold; let extra=0;
  for(let i=0;i<40;i++){ const r=forgeTower(GEAR_SLOTS[i%GEAR_SLOTS.length]); ok(r&&r.it,'forged'); eq(ITEM[r.it.id].set,5); if(r.extra) extra++; S.inv=[]; }
  eq(g-S.gold,40*TW_FORGE_GOLD); ok(!S.trophies[tk[0]],'all spent'); ok(extra>0&&extra<30,'an extra line now and then ('+extra+')');
});
test('Minor powers: Tide, Regrowth, Brood, Scales, Verse, Mirror and the Hungry Page do what they say',()=>{
  fresh(40); const t=foe({hp:1e6,atk:100}); arena([t],0); S.mode='battle'; const P=S.player; const put=pw=>{ S.equip.relic={u:++S.uid,id:Object.values(ITEM).find(d=>d.slot==='relic'&&!d.uq&&d.set===5).id,hf:'x',pw}; };
  put('tide'); P.mana=0; S.run.turn=3; hfTurn(); eq(P.mana,Math.round(pMana()*.06));
  put('regrow'); const m=mkMinion({lvl:30}); m.hp=1; hfTurn(); ok(m.hp>1,'mends');
  put('brood'); eq(hfPoison(t,'poison',100),125,'on a foe'); eq(hfPoison(m,'poison',100),100,'not on your own'); eq(hfPoison(S.player,'poison',100),100); eq(hfPoison(t,'bleed',100),100,'poison only');
  put('scales'); HITTER=t; const h=t.hp; hfScales(P,500); ok(t.hp<h,'the blow comes back as fire'); HITTER=null;
  put('mirror'); S.run.mirU=0; ok(hfFree(),'first skill free'); hfSkill(); ok(!hfFree());
  put('verse'); S.run.verseN=0; ok(!hfFree()); hfSkill(); hfSkill(); ok(hfFree(),'the third is free'); hfSkill(); ok(!hfFree());
  put('hungry'); P.hp=1; hfKill(t); eq(P.hp,1+Math.round(pMax()*.03));
  put(null); P.mana=0; hfTurn(); eq(P.mana,0,'no power, nothing');
});
test('Late gold: past level 35 the level part of gold grows at a third; old saves keep heartforged items and lose bad fields',()=>{
  eq(softLv(10),10); eq(softLv(GOLD_SOFT_LV),GOLD_SOFT_LV); eq(softLv(GOLD_SOFT_LV+30),GOLD_SOFT_LV+30*GOLD_SOFT_K); ok(softLv(80)<80);
  rich(); const b=DUNGEONS[0].boss[0]; heart(b); const it=heartforge(b,'weapon',lines(b,'weapon',2)); S.inv.push({u:++S.uid,id:it.id,hf:'Nobody',pw:'tide'},{u:++S.uid,id:it.id,pw:'brood'});
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); const a=g.inv.find(x=>x.u===it.u); eq(a.hf,b,'kept'); eq(a.ro.length,2);
  const bad=g.inv.slice(-2); ok(bad.every(x=>x.hf==null&&x.pw==null),'unknown boss or a power without a heart is cleared');
});
test('Abbey gear stays in the abbey: the Scribe\'s Regalia drops nowhere else',()=>{
  fresh(60); for(let di=0;di<GATE_N;di++) ['vanguard','striker','mender'].forEach(r=>[true,false].forEach(b=>(tableFor(di,r,b,false)||[]).forEach(row=>{ const id=Array.isArray(row)?row[0]:row.id||row; ok(!ITEM[id]||ITEM[id].set!==ABBEY,'gate '+di+' '+id); })));
  ok((towerTable?towerTable(100):[]).every(row=>{ const id=Array.isArray(row)?row[0]:row.id||row; return !ITEM[id]||ITEM[id].set!==ABBEY; }),'not in the Tower');
});
test('Heartforge: the Forge, the Codex and Turkish',()=>{
  rich(); heart(SECRET[0].name); heart(DUNGEONS[1].boss[0]); S.kills[SECRET[0].name]=1; S.kills[DUNGEONS[1].boss[0]]=1; ui.tab='market'; ui.mk='forge'; ui.hfB=SECRET[0].name;
  const h=renderAll('forge'); ok(/Heartforge/.test(h)&&/data-a="hfb"/.test(h)&&/data-a="hfl"/.test(h)&&/data-a="hforge"/.test(h)); ok(h.includes(HF_POW[powOf(SECRET[0].name)].name),'the power is named');
  ACTIONS.hfl(lines(SECRET[0].name,'weapon',1)[0]); ACTIONS.hfl(lines(SECRET[0].name,'weapon',2)[1]); eq(ui.hfL.length,2); ACTIONS.hforge(); ok(S.inv.some(it=>it.pw===powOf(SECRET[0].name)),'forged from the screen');
  const c=codexSection('forge'); ok(c.includes(SECRET[0].name)&&c.includes('Hell Tower forge')&&c.includes('Late gold'));
  VIEW.lang='tr'; Object.values(HF_POW).forEach(p=>{ ok(trText(p.name)!==p.name,p.name); ok(trText(p.desc)!==p.desc,p.desc); });
  ['Heartforge','Hell Tower forge','Heartforged from The Rat King','Swap a line','Your bag is full','Press again: a unique you hold still needs this heart'].forEach(s=>ok(trText(s)!==s,s)); VIEW.lang='en';
});
})();
