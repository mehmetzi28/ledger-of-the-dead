// The Rift, R9 PR A (src/game-rift.js): sigils before a dive, guardians every fifth depth, Rift Shards.
(function(){
const {test,ok,eq,near,fix,seed,fresh,setLvl,foe,mkMinion,corpse,renderAll,cdx,invariants}=window.LOTD_T;
const riftReady=best=>{ fresh(45); setLvl(45); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1,3:1,4:1,5:1}}); S.rift={best:best||0}; S.watches=WATCHES; S.mode='town'; S.run=null; };
const dive=(n,sig)=>{ S.mode='town'; S.run=null; S.watches=WATCHES; S.rift.sig=sig||[]; fix(.5); ok(startRift(n),'dive '+n); return S.run; };
const toBoss=r=>{ r.room=r.rooms-1; spawnRoom(); return r.enemies.find(e=>e.boss); };

test('Sigils: three open at depth 5 and one more every 5; up to three a dive; shards open one early',()=>{
  riftReady(4); eq(sigOpenN(),0); ok(!toggleSigil('iron'),'none yet'); S.rift.best=5; eq(sigOpenN(),3); S.rift.best=15; eq(sigOpenN(),5); S.rift.best=99; eq(sigOpenN(),SIGIL_IDS.length);
  S.rift.best=5; ok(!toggleSigil('mirror'),'the fourth is locked'); ['iron','hungry','hands'].forEach(k=>ok(toggleSigil(k))); eq(sigPicked().length,3); ok(toggleSigil('iron'),'off again'); eq(sigPicked().join(),'hungry,hands');
  near(riftRew(['iron','hungry','hands']),1.75,1e-9); ok(!unlockSigil(),'no shards'); S.rift.shards=SHARD_UNLOCK; eq(unlockSigil(),'mirror'); eq(S.rift.shards,0); ok(sigOpen('mirror')); eq(unlockCost(),2*SHARD_UNLOCK);
  const r=dive(1,['hungry','hands']); eq(r.sig.join(),'hungry,hands'); ok(r.log.some(l=>/Sigils on this dive/.test(l.m))); eq(T_('sig_hands'),1);
});
test('Sigils: each changes its one rule, and only in the Rift',()=>{
  riftReady(99); dive(1,[]); const a0=foeArmor(), c0=critChance(), f0=foeCrit(), n0=buildRoom(1,'fight').length; S.player.hp=1; const h0=healAlly(S.player,100);
  dive(1,['iron','thin','hands']); ok(foeArmor()>a0,'Iron Sky'); near(critChance(),c0+SIG_CRIT,1e-9); near(foeCrit(),f0+SIG_CRIT,1e-9); fix(.5); eq(buildRoom(1,'fight').length,n0+1,'Many Hands');
  dive(1,['hungry']); S.player.hp=1; eq(healAlly(S.player,100),Math.round(h0*SIG_HEAL),'Hungry Dark');
  mkMinion({lvl:40}); mkMinion({lvl:40,role:'vanguard'}); dive(1,['wounds','typed']); S.army.forEach(m=>eq(m.hp,Math.max(1,Math.round(m.maxHp*SIG_WOUND)),'Old Wounds')); ok(S.run.sigT); near(placeRes()[S.run.sigT]-(riftRes(1)[S.run.sigT]||0),SIG_RES,1e-9,'Typed Dark');
  dive(1,['short']); S.player.mana=0; let g=0; for(let i=0;i<10;i++){ const m0=S.player.mana; S.player.mana=0; g+=sigRegen(10); } eq(g,70,'Short Breath: 30% less');
  dive(1,['loud']); const e=S.run.enemies[0]; hurtFoe(e,1e9); fix(.99); checkDeaths(); eq(S.run.corpses.length,0,'Loud Grave');
  dive(1,['named']); const b=toBoss(S.run); ok(b.phase2,'Named');
  dive(1,['mirror']); S.player.skills.spear=1; S.player.mana=1e4; S.run.cd={}; const hp0=S.player.hp; useSkill('spear',S.run.enemies[0]); ok(S.player.hp<hp0||S.run.log.some(l=>/back on you/.test(l.m)),'Mirror'); S.run.cd={}; const hp1=S.player.hp; useSkill('spear',S.run.enemies[0]); eq(S.player.hp,hp1,'once a room');
  S.mode='town'; S.run=null; startRun(0); S.run.sig=['iron']; eq(hasSig('iron'),false,'not in a gate');
  dive(1,['iron','hungry','hands']); const xp0=killXp(S.run.enemies[0]); S.run.sig=[]; near(xp0/killXp(S.run.enemies[0]),1.75,.02,'rewards x1.75');
});
test('Guardians: every fifth depth ends in one, in turn; no body; shards for the guardian and the sigils',()=>{
  ok(Object.keys(BOSS_KIT).filter(n=>!GUARD_BY[n]).every(n=>BOSS_KIT[n].moves.every(m=>!GUARD_MV.includes(m))),'no guardian move shares an id with a master\'s'); eq(new Set(GUARD_MV).size,GUARD_MV.length);
  riftReady(9); eq(guardAt(4),null); eq(guardAt(5).name,'The Folded Knight'); eq(guardAt(10).name,'Mother of Gates'); eq(guardAt(35).name,'The Folded Knight');
  const r=dive(5,['iron','hands']); const g=toBoss(r); eq(g.name,'The Folded Knight'); ok(g.guard&&g.kit&&g.kit.join()==='fold,gateedge'); eq(g.res.phys,.25);
  g.hp=0; fix(.99); checkDeaths(); eq(r.corpses.filter(c=>c.boss).length,0,'no body'); r.enemies=r.enemies.map(e=>Object.assign(e,{hp:0,dead:true})); fix(.99); roomWon(); ok(r.cleared); eq(riftShards(),1+0+2,'1 for the guardian, 2 for the sigils'); eq(T_('guardians'),1);
  const r2=dive(10); const m=toBoss(r2); eq(m.name,'Mother of Gates');
});
test('Guardians: every move, twist and hazard does what it says',()=>{
  riftReady(99); const a=mkMinion({lvl:40,role:'vanguard'}), b=mkMinion({lvl:40,role:'striker'}); syncArmy(); const r=dive(30); const g=toBoss(r); eq(g.name,'The Counting Dead');
  const f0=rowOf(a); fireKitMove(g,'fold'); ok(rowOf(a)!==f0,'Fold'); fireKitMove(g,'fold'); eq(rowOf(a),f0);
  const hb=b.hp; fix(.5); fireKitMove(g,'gateedge'); ok(b.hp<hb,'Edge of Gates: the back row'); const n0=liveFoes().length; fireKitMove(g,'opendoor'); ok(liveFoes().length>n0,'Open Door');
  S.army.forEach(m=>{ m.hp=m.maxHp; }); fireKitMove(g,'closedoor'); ok(S.army.some(m=>m.lock>r.turn),'Close Door'); S.army.forEach(m=>{ m.lock=0; m.hp=m.maxHp; });
  fireKitMove(g,'delay'); ok(r.silence>0,'Delay'); g.hp=1; fireKitMove(g,'hymnbrass'); ok(g.hp>1,'Litany');
  a.root=0; fireKitMove(g,'brassbell'); ok(a.root>r.turn,'Brass Bell roots the front'); const e=r.enemies.find(x=>!x.boss&&x.hp>0)||g; const h1=e.hp; hurtFoe(e,100,'phys'); const d1=h1-e.hp; fireKitMove(g,'widen'); near(r.widen,GUARD_WIDEN,1e-9); const h2=e.hp; hurtFoe(e,100,'phys'); ok(h2-e.hp>=d1,'Widen');
  r.corpses=[corpse(),corpse()]; g.hp=1; fireKitMove(g,'swallow'); eq(r.corpses.length,1,'Swallow'); ok(g.hp>1);
  r.cnt={}; S.army.forEach(m=>{ m.hp=m.maxHp; m.lock=0; m.root=0; }); fix(.01); for(let i=0;i<3;i++) fireKitMove(g,'count'); ok(S.army.some(m=>m.hp<=0),'the third count fells'); g.hp=1; r.cnt={1:2}; fireKitMove(g,'tally'); eq(g.hp,1+Math.round(g.maxHp*GUARD_TALLY*2));
  const k={twist:'doors',abil:'opendoor',kit:['opendoor','closedoor'],kitIx:0}; guardTwist(k); eq(k.kit.join(),'opendoor,opendoor,closedoor');
  g.twist='brass'; g.hp=g.maxHp; hurtFoe(g,10,'fire'); eq(g.imm,'fire','Brass Skin');
  const t=r.enemies.filter(x=>x.hp>0); g.base='Brass Saint'; r.turn=3; r.silence=0; bossEndTurn(); ok(r.silence>0,'Ringing'); g.base='The Tear Itself'; const ph=S.player.hp=pMax(); bossEndTurn(); ok(S.player.hp<ph,'the Rift shrinks');
  invariants('guardians');
});
test('Rift sigils and guardians: the Rift tab, the Codex, saves and Turkish',()=>{
  riftReady(9); S.rift.sig=['iron']; S.rift.shards=4; ui.tab='gates'; ui.gsub='rift'; ui.rd=10; const h=renderAll('rift'); ok(/data-a="rsig" data-k="iron"/.test(h)&&/Mother of Gates/.test(h)&&/rewards x1\.20/.test(h),'picker, guardian, multiplier');
  ACTIONS.rsig('hungry'); eq(sigPicked().join(),'iron,hungry'); const c=cdx('rift'); ok(c.includes('Typed Dark')&&c.includes('The Counting Dead')&&c.includes('Brass Skin'));
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.rift.sig.join(),'iron,hungry'); eq(g.rift.shards,4); eq(normalizeSave({v:2,player:{lvl:5},rift:{best:3,sig:['iron','iron','nope'],shards:-2,junk:1}}).rift.sig.join(),'iron');
  VIEW.lang='tr'; try{ ['Sigils on this dive: Iron Sky, Hungry Dark. Rewards x1.50.','+3 Rift Shards (The Folded Knight and your sigils).','The Folded Knight folds the field. Your front and back rows trade places.','The Counting Dead counts Mn5: 2 of 3.','The tear widens. Both sides now take 10% more damage.',
    'Brass Saint\'s brass hardens against fire.',SIGILS.typed.desc,BOSS_ABIL.swallow.desc,TWISTS.counttwo.desc,HAZARDS.shrink.desc].forEach(s=>ok(trText(s)!==s,s.slice(0,50))); } finally { VIEW.lang='en'; }
});
})();
