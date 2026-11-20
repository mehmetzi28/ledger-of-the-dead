// The fall: the defeat recap (the blow that felled you and the answers you had for it) and Instant Retry
// (src/game-runs.js blowNote, snapRoom, retryRoom; src/ui-screens.js felledHTML, defeatHTML; src/ui-input.js).
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,renderAll,bossFight,cdx,NODE,wear,invariants}=window.LOTD_T;
const doomed=()=>{ const P=S.player; P.hp=1; P.shield=0; };

test('Defeat recap: a foe blow names the attacker, and lists Taunt (vanguard standing) and Bone Ward (no ward)',()=>{
  fresh(); const a=foe({name:'Grim Biter',hp:1e6,atk:50,role:'striker'}); arena([a]); mkMinion({role:'vanguard'}); fix(.99); doomed(); a.it={k:'atk',t:'p'};
  act('strike'); eq(S.mode,'defeat'); const b=S.run.felled; ok(b,'the blow is kept');
  eq(b.n,'Grim Biter'); eq(b.k,'hit'); eq(String(b.c),'taunt,ward','only answers that apply: '+JSON.stringify(b));
  const h=renderAll('defeat recap'); ok(h.includes('Felled by Grim Biter\'s blow.')&&h.includes('Taunt was not used. Bone Ward was down.'),'shown on the defeat screen');
});
test('Defeat recap: Taunt in force or already given, a ward up, or no vanguard: none of them are listed',()=>{
  const run=prep=>{ fresh(); const a=foe({name:'Grim Biter',hp:1e6,atk:500,role:'striker'}); arena([a]); fix(.99); doomed(); a.it={k:'atk',t:'p'}; prep(a); act('strike'); return S.run.felled; };
  ok(!(run(()=>{}).c||[]).includes('taunt'),'no vanguard: no Taunt');
  const v=run(()=>{ mkMinion({role:'vanguard'}).hp=0; }); ok(!(v.c||[]).includes('taunt'),'a downed vanguard cannot take a Taunt');
  const g=run(()=>{ mkMinion({role:'vanguard'}); S.run.cmd={vanguard:true}; }); ok(!(g.c||[]).includes('taunt'),'Taunt already given this room');
  const w=run(()=>{ S.player.shield=1; }); ok(!(w.c||[]).includes('ward'),'a ward was up');
  fresh(); const a=foe({hp:1e6,atk:5,role:'striker'}); arena([a]); S.player.skills.chill=1; fix(.99); doomed(); a.it={k:'atk',t:'p'}; act('strike'); ok(S.run.felled.c.includes('chill'),'Grave Chill learned and ready');
  fresh(); const c=foe({hp:1e6,atk:5,role:'striker'}); arena([c]); S.player.skills.chill=1; S.run.cd={chill:3}; fix(.99); doomed(); c.it={k:'atk',t:'p'}; act('strike'); ok(!S.run.felled.c.includes('chill'),'on cooldown: not listed');
});
test('Defeat recap: a telegraphed boss move says so, and lists Focus with strikers standing; Taunt only for Sundering Blow',()=>{
  fresh(); const b=bossFight(5); S.run.enemies.forEach(e=>{ if(e!==b) e.hp=1e6, e.maxHp=1e6, e.stun=5; }); b.hp=b.maxHp=1e7; b.charging=true; b.move='decree'; mkMinion({role:'striker'}); mkMinion({role:'vanguard'}); fix(.99); doomed();
  act('strike'); eq(S.mode,'defeat'); const f=S.run.felled; eq(f.k,'sig'); eq(f.mv,'decree'); eq(f.w,1); eq(String(f.c),'ward,focus','Decree cannot be Taunted: '+JSON.stringify(f));
  ok(renderAll('decree').includes('Felled by '+b.name+'\'s Royal Decree, telegraphed 1 turn ahead.'));
  fresh(); const s=bossFight(5); S.run.enemies.forEach(e=>{ if(e!==s) e.hp=1e6, e.maxHp=1e6, e.stun=5; }); s.hp=s.maxHp=1e7; s.charging=true; s.move='sunder'; mkMinion({role:'vanguard'}); fix(.99); doomed();
  act('strike'); ok(S.run.felled.c.includes('taunt'),'a Sundering Blow could have gone to the vanguard');
});
test('Defeat recap: a wound that ticks you down names the wound and claims no answers',()=>{
  fresh(); const a=foe({hp:1e6,atk:5,stun:3}); arena([a]); fix(.99); doomed(); S.player.dots={bleed:{d:9,t:2}};
  act('strike'); eq(S.mode,'defeat'); eq(S.run.felled.k,'dot'); eq(S.run.felled.dot,'bleed'); ok(!S.run.felled.c);
  const h=renderAll('dot'); ok(h.includes('Felled by bleeding.')&&!h.includes('was not used'));
  returnTown(); const e=S.hist[S.hist.length-1]; eq(e.res,'fell'); eq(e.fb.k,'dot','the History keeps it');
  S.hist.push(Object.assign({},e,{fb:5})); const g=normalizeSave(JSON.parse(JSON.stringify(S))); ok(!('fb' in g.hist[g.hist.length-1]),'a broken fb is dropped'); ok(g.hist[g.hist.length-2].fb,'a good one stays');
});
test('Retry: the room starts over as it began, no watch spent, the XP loss stands, nothing rerolled',()=>{
  fresh(10); const a=foe({name:'Gate Brute',hp:1e6,atk:30,role:'striker'}), b=foe({name:'Gate Hag',hp:900,atk:30,role:'mender'}); arena([a,b]);
  const m=mkMinion({role:'vanguard'}); m.hp=Math.round(m.maxHp*.7); const P=S.player; P.hp=80; P.mana=20; S.run.cd={spear:2}; S.player.xp=need(S.player.lvl)/2; snapRoom();
  const w=S.watches, xp0=S.player.xp, mhp=m.hp;
  a.hp=5000; b.hp=10; m.hp=0; S.run.enemies.push(foe({name:'Called Add'})); S.run.turn=7; S.run.corpses.push({id:'cx'}); P.mana=0; P.hp=1; P.shield=0; a.it={k:'atk',t:'p'}; fix(.99);
  act('strike'); eq(S.mode,'defeat'); ok(S.player.xp<xp0,'the XP loss is charged');
  const xp1=S.player.xp; ok(canRetry()); const h=renderAll('retry'); ok(h.includes('data-a="retry"')&&h.includes('Retry the room'));
  ok(retryRoom()); eq(S.mode,'battle'); eq(S.watches,w,'no watch'); eq(S.player.xp,xp1,'the XP loss stands');
  const r=S.run; eq(r.enemies.map(e=>e.name).join(),'Gate Brute,Gate Hag','the same foes, no called adds'); eq(r.enemies[0].id,a.id); eq(r.enemies[0].hp,1e6); eq(r.enemies[1].hp,900);
  eq(r.turn,1); eq(r.corpses.length,0); eq(r.cd.spear,2); eq(P.hp,80); eq(P.mana,20); eq(m.hp,mhp,'the minion stands again at its room-start HP'); eq(r.retries,1); ok(!r.felled);
  ok(!canRetry(),'only from the defeat screen'); act('strike'); eq(S.run.turn,2,'a real fight again');
});
test('Retry: gear taken off on the defeat screen caps the restored HP, mana and minion HP at the new maximums',()=>{
  fresh(10); const a=foe({hp:1e6,atk:1e4,role:'striker'}); arena([a]); const m=mkMinion({role:'vanguard'}), P=S.player;
  const best=(sl,f)=>Object.values(ITEM).filter(d=>d.slot===sl).reduce((b,d)=>{ S.equip[sl]={u:++S.uid,id:d.id}; syncArmy(); const v=f(); S.equip[sl]=null; syncArmy(); return v>b.v?{v,id:d.id}:b; },{v:-1e9}).id;
  const pick={weapon:best('weapon',()=>pMana()),armor:best('armor',()=>pMax()),relic:best('relic',()=>m.maxHp)};
  for(const sl of GEAR_SLOTS) wear(pick[sl]); syncArmy(); P.hp=pMax(); P.mana=pMana(); m.hp=m.maxHp; snapRoom();
  const h0=pMax(), m0=pMana(), mm0=m.maxHp; P.hp=0; defeat(); eq(S.mode,'defeat');
  for(const sl of GEAR_SLOTS) unequip(sl); ok(pMax()<h0&&pMana()<m0&&m.maxHp<mm0,'taking the gear off lowers all three');
  ok(retryRoom()); eq(P.hp,pMax(),'HP capped'); eq(P.mana,pMana(),'mana capped'); eq(m.hp,m.maxHp,'minion HP capped'); invariants('retry after unequip');
});
test('Retry: Tower floors and the Rift can retry; sieges, Trials, rival rooms and a reload cannot',()=>{
  fresh(); setLvl(TW.unlock); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); S.watches=WATCHES; startTower(1); const a=S.run.enemies[0]; a.it={k:'atk',t:'p'}; a.atk=1e5; S.run.enemies.forEach(e=>{ e.hp=e.maxHp=1e7; }); a.role='striker'; fix(.99); doomed(); act('strike');
  eq(S.mode,'defeat'); ok(canRetry(),'a Tower floor'); const n=S.run.enemies.length; ok(retryRoom()); eq(S.run.tw,1); eq(S.run.enemies.length,n);
  const fall=()=>{ S.mode='defeat'; };
  fresh(); arena([foe()]); S.run.trial=1; snapRoom(); fall(); ok(!canRetry(),'a Trial'); ok(renderAll('trial').includes('A Trial room cannot be retried'));
  fresh(); arena([foe({rival:true})]); snapRoom(); fall(); ok(!canRetry(),'a rival room');
  fresh(); arena([foe()]); S.run.siege=1; snapRoom(); fall(); ok(!canRetry(),'a siege');
  fresh(); arena([foe()]); snapRoom(); S.run=JSON.parse(JSON.stringify(S.run)); fall(); ok(!canRetry(),'after a reload'); ok(!renderAll('reload').includes('data-a="retry"'));
});
test('Retry: R on the defeat screen, the shortcut sheet, the Codex and Turkish',()=>{
  if(NODE){ fresh(); const a=foe({hp:1e6,atk:1e4,role:'striker'}); arena([a]); snapRoom(); fix(.99); doomed(); a.it={k:'atk',t:'p'}; act('strike'); eq(S.mode,'defeat');
    window.__listeners.keydown[0]({key:'r',preventDefault(){},target:{}}); eq(S.mode,'battle','R retries'); }
  ok(keysHTML().includes('Retry the room'),'keys sheet'); fresh(); ok(cdx('basics').includes('Retry on the defeat screen'),'codex');
  ok(trText('Felled by Rat King\'s Royal Decree, telegraphed 1 turn ahead.')==="Seni deviren: Rat King, Royal Decree (1 tur önceden belliydi).",'tr move'); ok(trText('Felled by Rat King\'s critical hit.').includes('Rat King'),'tr crit');
  ok(trText('Taunt was not used. Bone Ward was down.').includes('Kışkırt'),'tr counters'); eq(trText('Felled by bleeding.'),'Seni kanama devirdi.');
  for(const s of ['Retry the room','After a fall','You stand at the threshold again. The room waits as it was','A Trial room cannot be retried: its score counts every attempt']) ok(TR_DICT.has(s),s);
});
})();
