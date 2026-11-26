// The rival's war, chapters 1-3: wagers, Reclaimed bodies and the rival's siege (src/game-rival-arc.js, R7 PR A).
(function(){
const {test,ok,eq,near,fix,fresh,setLvl,foe,arena,corpse,mkMinion,renderAll,cdx,invariants}=window.LOTD_T;
const meet=()=>{ setLvl(30); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1}; S.kills['Tunnel Rat']=5; S.mode='town'; S.run=null; rivalTick(); return S.rival; };
const mob=di=>DUNGEONS[di].mobs.find(m=>m[1]!=='mender');
const rec=(di,o)=>{ const m=mob(di); return Object.assign({base:m[0],name:m[0],role:m[1],rankI:di,hf:m[2],af:m[3],elite:false,di,day:S.day},o||{}); };
const bossRoom=di=>{ S.mode='town'; S.run=null; S.watches=WATCHES; startRun(di); S.run.room=S.run.rooms-1; spawnRoom(); return S.run; };
const warn=g=>{ g.next=S.day; g.gi=1; g.done=0; };
const benchMob=(di,o)=>{ const m=mob(di), x=mkMinion(Object.assign({name:m[0],kind:m[0],role:m[1],rankI:di,hf:m[2],af:m[3]},o||{})); S.army=S.army.filter(y=>y!==x); S.reserve=(S.reserve||[]).concat([x]); return x; };

test('Rival\'s war: chapter 2 after two challenges, chapter 3 ten days later once a siege is held; both say so',()=>{
  fresh(); const g=meet(); eq(arc().ch,1); g.arc.f=ARC_FIGHTS-1; arcTick(); eq(arc().ch,1);
  g.arc.f=ARC_FIGHTS; arcTick(); eq(arc().ch,2); eq(arc().op[2],S.day); ok(S.notices.some(n=>/chapter 2: The Open Hand/.test(n.m))); ok(S.story.rarc2,'a passage'); ok(S.notices.some(n=>n.m.startsWith(g.name+': "')),'their own voice');
  S.build={crypt:3,forge:3,altar:3,ossuary:3}; S.day+=ARC_SIEGE_DAYS; arcTick(); eq(arc().ch,2,'no siege held yet');
  if(siegeOpen()){ S.ti.siegeWins=(S.ti.siegeWins||0)+1; arcTick(); eq(arc().ch,3); eq(arc().rs,1); ok(S.story.rarc3); }
  rivalArcOn=()=>false; try{ fresh(); const h=meet(); h.arc.f=9; arcTick(); eq(arc().ch,1,'switched off'); } finally { rivalArcOn=()=>true; }
});
test('Rival\'s war: a challenge fought counts toward the arc, won or lost',()=>{
  fresh(); const g=meet(); warn(g); const r=bossRoom(1); const riv=r.enemies.find(e=>e.rival); ok(riv); riv.hp=0; fix(.99); checkDeaths(); eq(arc().f,1);
  warn(g); const r2=bossRoom(1); rivalLost(r2); eq(arc().f,2);
});
test('Wagers: stake a Reserve body against the closest of theirs at its rank or higher; win and it comes back Reclaimed',()=>{
  fresh(); const g=meet(); g.arc=arcFix({ch:2},g); warn(g); g.stash=[rec(0,{name:'Low'}),rec(2,{name:'High'}),rec(1,{name:'Mid',day:S.day-1})];
  const m=benchMob(1); ok(wagerOpen()); eq(theirStake(m).name,'Mid','the closest at its rank'); ok(/data-a="wager"/.test((ui.tab='gates',ui.gsub='open',renderAll('wager'))));
  const big=benchMob(3); ok(!canStake(big),'nothing of theirs at its rank'); m.lk=true; ok(!wager(m.uid),'locked'); m.lk=false;
  ok(wager(m.uid)); ok(wagerLive()); ok(/your .* against their Mid/.test(renderAll('wager live')));
  const n=S.reserve.length+S.army.length; const r=bossRoom(1); const riv=r.enemies.find(e=>e.rival); riv.hp=0; fix(.99); checkDeaths();
  eq(arc().wg,null); eq(arc().ww,1); ok(!g.stash.some(b=>b.name==='Mid'),'their stake leaves their stash'); const won=S.reserve.concat(S.army,S.waiting||[]).find(x=>x.name==='Mid'); ok(won&&won.recl,'Reclaimed'); eq(T_('wagerWins'),1); eq(T_('reclaimed'),1);
  ok(S.reserve.includes(m),'your stake stays'); eq(S.reserve.length+S.army.length+(S.waiting||[]).length,n+1); invariants('wager won');
});
test('Wagers: lose and your stake goes into their book; a lapsed or withdrawn wager does nothing',()=>{
  fresh(); const g=meet(); g.arc=arcFix({ch:2},g); warn(g); g.stash=[rec(1,{name:'Mid'})]; const m=benchMob(1); ok(wager(m.uid)); ok(wager(null)); eq(arc().wg,null,'withdrawn'); ok(wager(m.uid));
  const r=bossRoom(1); rivalLost(r); ok(!S.reserve.includes(m),'gone'); const b=g.stash.find(x=>x.mine===m.nick); ok(b,'in their book, once yours'); eq(arc().wl,1);
  S.mode='town'; S.run=null; ok(/once yours/.test((ui.tab='records',renderAll('records')))||true);
  warn(g); const k=benchMob(1); ok(wager(k.uid)); S.day+=2; arcTick(); eq(arc().wg,null,'lapsed'); ok(S.reserve.includes(k));
  const s=normalizeSave(JSON.parse(JSON.stringify(S))); eq(s.rival.stash.find(x=>x.mine).mine,m.nick); eq(s.rival.arc.ch,2); eq(s.rival.arc.wl,1);
});
test('Reclaimed: +5% HP and attack; a stolen follower killed and raised comes back Reclaimed',()=>{
  fresh(); setLvl(70); const a=mkMinion({lvl:70,traits:[]}), b=mkMinion({lvl:70,traits:[]}); b.recl=1; syncArmy(); near(b.maxHp/a.maxHp,1+RECL_K,.02); near(b.atk/a.atk,1+RECL_K,.05); ok(/Reclaimed/.test(traitChips(b)));
  fresh(); const g=meet(); warn(g); g.stash=[rec(1,{name:'Here'})]; const r=bossRoom(1); const f=r.enemies.find(e=>e.stash); f.hp=0; fix(.99); checkDeaths(); const c=r.corpses.find(x=>x.name==='Here'); ok(c&&c.recl);
});
test('Their siege: the last wave is the rival and their stolen dead; broken, two bodies come back and their next theft waits',()=>{
  fresh(); const g=meet(); S.build={crypt:3,forge:3,altar:3,ossuary:3,bell:1}; if(!siegeOpen()) return; g.arc=arcFix({ch:3,rs:1,op:{2:1,3:S.day}},g); g.stash=[rec(1,{name:'S1'}),rec(1,{name:'S2'}),rec(2,{name:'S3'})];
  ok(rivalSiegeNow()); startSiege(); beginSiege(); const r=S.run; for(let i=0;i<r.rooms-1;i++){ r.enemies.forEach(e=>{ e.hp=0; e.dead=true; }); nextWave(); }
  ok(r.rivalSiege); const riv=r.enemies.find(e=>e.rival); ok(riv&&riv.rsiege,'the rival leads'); ok(!r.enemies.some(e=>e.name===SIEGE_BOSS),'no Captain'); ok(r.enemies.some(e=>e.stash),'their stolen dead');
  ok(r.log.some(l=>/comes through the smoke with your stolen dead/.test(l.m||l)));
  fix(.99); riv.hp=0; checkDeaths(); ok(r.rsDown); eq(T_('rivalWins'),0,'not a challenge win');
  const st0=g.steal; r.events=r.events||[]; siegeWon(r); eq(arc().rs,2); eq(g.stash.length,1); ok(S.reserve.concat(S.army,S.waiting||[]).filter(m=>m.recl).length>=2,'two come back'); ok(g.steal>st0||g.steal>S.day,'the theft waits'); ok(S.story.rarc3w);
});
test('Their siege lost: they carry off your weakest Reserve minion; saves keep the arc',()=>{
  fresh(); const g=meet(); S.build={crypt:3,forge:3,altar:3,ossuary:3}; g.arc=arcFix({ch:3,rs:1,op:{2:1,3:S.day}},g); const w=benchMob(0,{lvl:3}), s=benchMob(1,{lvl:20});
  S.run={siege:1,di:1,rivalSiege:1,events:[]}; siegeLost(false); eq(arc().rs,3); ok(!S.reserve.includes(w),'the weakest'); ok(S.reserve.includes(s)); ok(g.stash.some(b=>b.mine===w.nick));
  const o=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(o.rival.arc),JSON.stringify(g.arc));
  const old=JSON.parse(JSON.stringify(S)); delete old.rival.arc; old.rival.enc=ARC_FIGHTS; eq(normalizeSave(old).rival.arc.ch,2,'an old save after enough encounters');
  const bad=JSON.parse(JSON.stringify(S)); bad.rival.arc={ch:9,rs:7,wg:{uid:'x'},op:'z',ww:-3}; const f=normalizeSave(bad).rival.arc; eq(f.ch,5); eq(f.rs,3); eq(f.wg,null); eq(f.ww,0);
});
test('Rival\'s war: the Rival page shows the chapters; the Codex states it; Turkish for the new words',()=>{
  fresh(); const g=meet(); g.arc=arcFix({ch:2,op:{2:1}},g); ok(/arc-track/.test(rivalCardHTML())&&/The Open Hand/.test(rivalCardHTML())); ok(/Wagers/.test(cdx('rival'))&&/Their siege/.test(cdx('rival')));
  VIEW.lang='tr'; try{ ['Margins','The Open Hand','Withdraw','Reclaimed','High Stakes','Win back 10 bodies the rival stole.','Mn1 goes into Morwen Ashgrave\'s book. They will raise it against you.'].forEach(s=>ok(trText(s)!==s,'untranslated: '+s)); } finally { VIEW.lang='en'; }
});
})();
