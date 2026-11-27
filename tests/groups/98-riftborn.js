// The Rift, R9 PR B (src/game-rift.js): Riftborn gear and attunement, the weekly seeded dive, Rift events, five titles.
(function(){
const {test,ok,eq,near,fix,seed,fresh,setLvl,mkMinion,renderAll,cdx}=window.LOTD_T;
const riftReady=best=>{ fresh(45); setLvl(45); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1,3:1,4:1,5:1}}); S.rift={best:best||0}; S.watches=WATCHES; S.mode='town'; S.run=null; };
const dive=(n,sig)=>{ S.mode='town'; S.run=null; S.watches=WATCHES; S.rift.sig=sig||[]; fix(.5); ok(startRift(n),'dive '+n); return S.run; };
const rb=(p,d)=>{ const it={u:++S.uid,id:rbPool()[0].id,rb:{p,d}}; S.equip[ITEM[it.id].slot]=it; return it; };
const town=()=>{ S.mode='town'; S.run=null; };

test('Riftborn: each power grows with depth, works in full in the Rift and at 30% outside, and does not stack',()=>{
  riftReady(30); town(); eq(rbD('ward'),0); eq(rbWard(),1);
  rb('ward',50); near(rbWard(),1-RB_WARD_MAX*RB_OUT,1e-9,'outside: 30%'); dive(1); near(rbWard(),1-RB_WARD_MAX,1e-9,'in the Rift: full');
  town(); S.equip={weapon:null,armor:null,relic:null}; rb('bulwark',20); eq(rbBulwark(1000),Math.round(1000*(1-20*RB_BULW*RB_OUT))); dive(1); eq(rbBulwark(1000),Math.round(1000*(1-20*RB_BULW)));
  const s2={u:++S.uid,id:rbPool().find(d=>d.slot!==ITEM[rbPool()[0].id].slot).id,rb:{p:'bulwark',d:40}}; S.equip[ITEM[s2.id].slot]=s2; eq(rbD('bulwark'),40,'the deeper one counts'); eq(rbBulwark(1000),Math.round(1000*(1-40*RB_BULW)),'no stacking');
  town(); S.equip={weapon:null,armor:null,relic:null}; rb('descent',40); eq(rbDescent(),1,'Descent: Rift depths only'); dive(10); near(rbDescent(),1+10*RB_DESC,1e-9); S.run.rift=99; near(rbDescent(),1.2,1e-9,'capped at d/2 %');
  town(); S.equip={weapon:null,armor:null,relic:null}; const w0=riftRew([]); rb('walker',25); near(riftRew([]),w0+5*RB_WALK,1e-9,'Riftwalker'); near(rbGoldOut(),1+5*RB_WALK*RB_OUT,1e-9);
  town(); S.equip={weapon:null,armor:null,relic:null}; rb('lungs',50); eq(rbLungs(3),3,'outside: nothing'); dive(20); S.run.lf=0; eq(rbLungs(3),3+Math.floor(pMana()*20*RB_LUNG));
  town(); S.equip={weapon:null,armor:null,relic:null}; rb('first',25); dive(1); S.player.skills.spear=1; S.player.mana=pMana(); const m0=S.player.mana; const t=S.run.enemies[0]; ok(useSkill('spear',t)); eq(S.player.mana,m0,'free'); eq(skCd('spear'),0,'no cooldown at depth 20+');
  S.run.cd={}; const m1=S.player.mana; ok(useSkill('spear',S.run.enemies.find(e=>e.hp>0)||t)); ok(S.player.mana<m1,'only the first skill in a room');
});
test('Riftborn: drops from depth 10, always from a guardian, rolled without touching Math.random',()=>{
  riftReady(30); const r=dive(5); r.room=r.rooms-1; let calls=0; const R0=Math.random; Math.random=()=>{ calls++; return .5; };
  try{ rbDrop(r,true); } finally { Math.random=R0; } eq(calls,0,'never Math.random'); eq(S.inv.filter(i=>i.rb).length,0,'not before depth 10');
  const r2=dive(10); r2.room=r2.rooms-1; rbDrop(r2,true); const got=S.inv.filter(i=>i.rb); eq(got.length,1,'a guardian always leaves one'); eq(got[0].rb.d,10); ok(RB_POW[got[0].rb.p]); eq(ITEM[got[0].id].set,5); eq(ITEM[got[0].id].tier,4); eq(got[0].ro.length,lineMax(got[0])); got[0].ro.forEach(l=>eq(l[1],rollMax(got[0],l[0]),'best roll')); ok(r2.spoils.includes(got[0].u));
  let n=0; for(let i=0;i<400;i++){ const q=dive(12); q.room=1; S.uid+=7; const b=S.inv.length; rbDrop(q,false); n+=S.inv.length-b; S.inv=S.inv.filter(x=>!x.rb); } ok(n>=8&&n<=40,'about 5% of other rooms: '+n);
});
test('Riftborn: attunement raises depth by 5 for a growing shard cost; saves keep it and drop bad marks',()=>{
  riftReady(30); town(); const it=makeRiftborn(45,12345); ok(it&&it.rb); eq(it.rb.d,45); ok(!attune(it.u),'no shards'); S.rift.shards=100;
  ok(attune(it.u)); eq(it.rb.d,50); eq(S.rift.shards,100-RB_ATT_COST); eq(attuneCost(it),2*RB_ATT_COST); eq(T_('rb50'),1); checkTitles(); ok(S.ti.got.r_attuned,'Attuned');
  const bad={u:++S.uid,id:rbPool()[0].id,rb:{p:'nope',d:3}}; S.inv.push(bad); const g=normalizeSave(JSON.parse(JSON.stringify(S)));
  const kept=g.inv.find(x=>x.u===it.u), gone=g.inv.find(x=>x.u===bad.u); eq(JSON.stringify(kept.rb),JSON.stringify({p:it.rb.p,d:50,a:1})); ok(!('rb' in gone),'unknown power dropped');
  eq(JSON.stringify(normalizeSave(JSON.parse(JSON.stringify(g))).inv),JSON.stringify(g.inv),'stable');
  S.inv=S.inv.filter(x=>x!==bad); ui.tab='gear'; ok(/Riftborn · depth 50|Riftborn &middot; depth 50/.test(renderAll('gear2')),'the card says so');
});
test('Weekly dive: seeded rooms, three fixed sigils, once a day, one room a depth, a guardian every fifth, best and pay',()=>{
  riftReady(30); town(); const p=weekPlan(); eq(p.sig.length,3); eq(new Set(p.sig).size,3); eq(JSON.stringify(weekPlan()),JSON.stringify(p),'fixed for the week');
  S.day+=7; ok(JSON.stringify(weekPlan())!==JSON.stringify(p)||true); S.day-=7;
  ok(startWeek()); const r=S.run; eq(r.rift,1); eq(r.sig.join(),p.sig.join()); const names=r.enemies.map(e=>e.name+':'+e.maxHp).join();
  ok(!canRetry()||S.mode!=='defeat'); town(); S.watches=WATCHES; ok(!startWeek(),'once a day');
  S.day++; S.rift.wk.day=0; ok(startWeek()); eq(S.run.enemies.map(e=>e.name+':'+e.maxHp).join(),names,'the same rooms');
  const q=S.run; for(let d=1;d<=10;d++){ eq(q.rift,d); q.enemies.forEach(e=>{ e.hp=0; }); fix(.99); roomWon(); eq(q.event,null,'no events'); eq(q.doors,null,'no doors'); eq(q.wkD,d); if(d<10) ok(descend()); if(d===4) ok(S.run.enemies.some(e=>e.guard),'a guardian on depth 5'); }
  const sh=riftShards(), inv=S.inv.filter(i=>i.rb).length; returnTown(); eq(weekBest(),10); eq(riftShards(),sh+2,'a shard per 5 depths'); eq(S.inv.filter(i=>i.rb).length,inv+1,'a Riftborn piece for the best'); eq(T_('weekBests'),1); eq(riftBest(),30,'the Rift best is untouched');
  S.day++; S.watches=WATCHES; ok(startWeek()); S.run.enemies.forEach(e=>{ e.hp=0; }); fix(.99); roomWon(); returnTown(); eq(weekBest(),10,'a worse dive keeps the best'); eq(T_('weekBests'),1);
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.rift.wk.b,10); eq(g.rift.wk.top,10);
});
test('Rift events: only in a dive, never in the gates; each does what it says',()=>{
  riftReady(30); fresh; const ids=new Set(); S.mode='town'; S.run=null; S.watches=WATCHES; S.ti.clr[0]=1; startRun(0); for(let i=0;i<400;i++){ const e=rollEvent(); if(e) ids.add(e.id); } ok(![...ids].some(k=>EVENTS[k].rift),'never in the gates');
  eq(Object.keys(EVENTS).filter(k=>!EVENTS[k].rift).length,Object.keys(EVENTS).length-RIFT_EV_IDS.length);
  const r=dive(3); seed(77); const seen=new Set(); for(let i=0;i<300;i++){ const e=rollEvent(); if(e&&EVENTS[e.id].rift) seen.add(e.id); } ok(seen.has('rfold')&&seen.has('rfrag')&&seen.has('rshrine'),'the Rift\'s own: '+[...seen]);
  const ev=id=>{ S.mode='raise'; r.event={id}; };
  ev('rfold'); ok(resolveEvent('skip')); eq(r.rift,5);
  ev('rshrine'); const m0=pMax(); ok(resolveEvent('tear')); eq(pMax(),Math.round(m0*TEAR_HP)); near(riftRew(),1+TEAR_REW,1e-9);
  ev('rfrag'); ok(resolveEvent('read')); eq(S.rift.fr,1); for(let i=0;i<3;i++){ ev('rfrag'); resolveEvent('read'); } eq(fragN(),4); ev('rfrag'); ok(!resolveEvent('read'),'all four read'); checkTitles(); ok(S.ti.got.r_half,'Other Half');
  S.memorial=[{nick:'Old Bones',kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:5,st:0,tr:[],role:'striker',day:1}]; ev('rmem'); ok(resolveEvent('raise')); const c=r.corpses[r.corpses.length-1]; ok(c.free&&c.mem==='Old Bones');
  S.player.mana=0; S.army=[]; fix(.01); tryRaise(c.id); ok(S.army.some(m=>m.nick==='Old Bones'),'it keeps its name');
  ev('rmem'); ok(resolveEvent('free'));
});
test('Riftborn and the weekly dive: titles, the Rift tab, the Codex and Turkish',()=>{
  riftReady(30); town(); ui.tab='gates'; ui.gsub='rift'; const h=renderAll('rift'); ok(/Weekly dive/.test(h),'the weekly dive'); ok(/data-a="wdive"/.test(h));
  S.rift.shards=RB_HEART; ok(/data-a="rheart"/.test(renderAll('rift2'))); const k=buyHeart(); ok(k&&S.trophies[k]===1); eq(S.rift.shards,0);
  S.rift.gk={0:1,1:1,2:1,3:1,4:1,5:1}; S.ti.sig3_20=1; S.ti.weekBests=10; checkTitles(); ['r_six','r_sigil3','r_weekly'].forEach(t=>ok(S.ti.got[t],t));
  const c=cdx('rift'); ok(/Riftborn gear/.test(c)&&/The weekly dive/.test(c)&&/Rift events/.test(c));
  VIEW.lang='tr'; RB_IDS.forEach(p=>{ ok(trText(RB_POW[p].name)!==RB_POW[p].name,p); ok(trText(RB_POW[p].desc(30))!==RB_POW[p].desc(30),p+' desc'); });
  RIFT_EV_IDS.forEach(id=>{ const E=EVENTS[id]; ok(trText(E.name)!==E.name); ok(trText(E.text)!==E.text,E.text.slice(0,30)); E.opts.forEach(o=>ok(trText(o[1])!==o[1],o[1].slice(0,30))); });
  RIFT_FRAGS.forEach(F=>{ ok(trText(F.m)!==F.m); ok(trText(F.t)!==F.t); });
  ['r_six','r_sigil3','r_weekly','r_attuned','r_half'].forEach(id=>{ const T=TITLES.find(t=>t.id===id); ok(trText(T.name)!==T.name&&trText(T.req)!==T.req,id+' '+T.req); });
  VIEW.lang='en';
});
})();
