// Boss kits: move sets, second-phase twists and hazards for the gate bosses, the rival and the Inquisitor Captain (src/game-boss-kits.js).
(function(){
const {test,ok,eq,near,fix,fresh,setLvl,foe,arena,mkMinion,bossFight,renderAll}=window.LOTD_T;
const big=()=>{ const P=S.player; P.stats.constitution=3000; P.hp=pMax(); return P; };
const toPhase2=b=>{ b.hp=Math.floor(b.maxHp*.4); checkPhase(); return b; };
const knownAt=n=>{ const t=MASTERY[1]; S.kills[n]=t.bossAt||t.at; };

test('Boss kits: every gate boss and the Captain carry two or three moves, a twist and a personal resistance; secret masters, wardens and the kits-off switch keep one move',()=>{
  fresh(30);
  DUNGEONS.forEach((D,di)=>{ const K=BOSS_KIT[D.boss[0]]; ok(K&&K.moves.length>=2&&K.moves.length<=3,D.name); ok(K.moves.every(m=>BOSS_ABIL[m]),'known moves'); ok(TWISTS[K.twist],'a twist'); if(K.hazard) ok(HAZARDS[K.hazard]);
    const b=bossFight(di); eq(JSON.stringify(b.kit),JSON.stringify(K.moves)); eq(b.abil,K.moves[0]); for(const t in K.res) ok(foeRes(b,t)!==placeRes()[t]||0,'its own resistance '+t); });
  const b=bossFight(2); eq(foeRes(b,'fire'),Math.min(FOE_RES_MAX,(placeRes().fire||0)+.5));
  const c=siegeFoe('vanguard',20,5,true,false); eq(JSON.stringify(c.kit),JSON.stringify(['decree','purge','rally']));
  const s=makeSecret(1,12); ok(!s.kit&&s.abil===GATE_ABIL[1]&&!s.res,'a secret master keeps its single move');
  const w=makeTowerEnemy(10,true); ok(!w.kit,'a warden keeps its single move');
  BOSS_KITS_ON=false; const o=bossFight(3); ok(!o.kit&&o.abil==='hymn'); BOSS_KITS_ON=true;
});
test('Boss kits: moves come in rotation, each at its own pace; the card names the next move, and from Known the one after',()=>{
  fresh(30); const b=bossFight(1), P=big(); mkMinion({lvl:20,role:'striker'}); const seen=[];
  for(let i=0;i<30&&seen.length<4;i++){ const mv=b.abil; if(bossTurn(b)&&!b.charging) seen.push(mv); }
  eq(seen.slice(0,3).join(),'bonewall,lock,bash'); eq(seen[3],'bonewall','and around again');
  ui.tab='gates'; let h=renderAll('battle'); ok(h.includes('Next: '+BOSS_ABIL[b.abil].name)); ok(!h.includes(' &rarr; '),'Unknown: the next move only');
  knownAt(b.base); h=renderAll('battle'); ok(h.includes('Next: '+BOSS_ABIL[b.abil].name+' &rarr; ')||h.includes('Next: '+BOSS_ABIL[b.abil].name+' → '),'Known: the rotation');
  eq(JSON.stringify(bossNext(b)),JSON.stringify(b.kit.slice(b.kitIx).concat(b.kit.slice(0,b.kitIx))));
});
test('Boss kits: Gnaw bleeds, Shield Bash sunders, Burning Ground burns the front row, Ember Lance and Called Shot find the back row',()=>{
  fresh(30); let b=bossFight(0); const P=big(); const v=mkMinion({lvl:20,role:'vanguard'}), m=mkMinion({lvl:20,role:'mender'}); fix(.5);
  fireAbility(b,'gnaw'); ok(v.hp<v.maxHp&&v.dots&&v.dots.bleed,'the front row bleeds'); eq(P.hp,pMax());
  fresh(30); b=bossFight(1); big(); const v2=mkMinion({lvl:20,role:'vanguard'}); fireAbility(b,'bash'); ok(hasSt(v2,'sundered'));
  fresh(30); b=bossFight(2); const P2=big(); const f=mkMinion({lvl:20,role:'vanguard'}), bk=mkMinion({lvl:20,role:'mender'}); fireAbility(b,'burnground'); ok(f.dots&&f.dots.burn&&f.dots.burn.t===3); ok(!(bk.dots&&bk.dots.burn),'the back row does not burn');
  const h=bk.hp; fireAbility(b,'lance'); ok(bk.hp<h,'the lance finds the back-row minion'); bk.hp=0; const ph=P2.hp; fireAbility(b,'lance'); ok(P2.hp<ph,'no minion behind: you');
  eq(chargeInfo({charging:true,hp:1,move:'lance'}).hint,'Ward or freeze it');
});
test('Boss kits: Keymaster\'s Lock takes a minion out of the fight for two turns; Iron Thorns roots and rots one; locked minions draw no blows',()=>{
  fresh(30); const b=bossFight(1); big(); const m=mkMinion({lvl:30,role:'striker'}), w=mkMinion({lvl:5,role:'vanguard'}); m.atk=w.atk*10;
  const t0=S.run.turn; fireAbility(b,'lock'); eq(m.lock,t0+3); S.run.turn=t0+1; ok(lockedNow(m)&&!hittable(m),'locked');
  const a=foe({hp:1e6,maxHp:1e6,atk:10,role:'striker'}); S.run.enemies.push(a); for(let i=0;i<20;i++){ delete a.it; rollIntent(a); ok(a.it.t!==fxKey(m),'never aimed at the locked minion'); }
  S.run.turn=t0+3; ok(!lockedNow(m)&&hittable(m),'back after two turns');
  const o=bossFight(4); big(); const r=mkMinion({lvl:30,role:'striker'}); r.atk=1e5; fireAbility(o,'ironthorns'); ok(r.root>S.run.turn&&r.dots&&r.dots.poison); S.run.turn++; ok(lockedNow(r)&&hittable(r),'rooted: it cannot act but can be hit');
  clearAll(r); ok(r.root==null,'gone when the room ends');
});
test('Boss kits: Tithe of Teeth drains mana and mends; Bite of Faith hexes; Graft drinks a seedling (and is skipped without one); Court Summons calls Throne Guards',()=>{
  fresh(30); let b=bossFight(3); const P=big(); P.mana=pMana(); b.hp=b.maxHp/2; const hb=b.hp; fireAbility(b,'tithe'); eq(P.mana,pMana()-Math.round(pMana()*.2)); ok(b.hp>hb);
  const m=mkMinion({lvl:20,role:'striker'}); fireAbility(b,'bite'); ok(hasSt(m,'hexed'));
  b=bossFight(4); fireAbility(b,'seedfall'); const s=S.run.enemies.find(x=>x!==b); ok(s&&s.seed!=null,'a seedling'); b.hp=b.maxHp/2; const h2=b.hp; fireAbility(b,'graft'); ok(!S.run.enemies.includes(s),'drunk'); ok(b.hp>h2);
  b.kitIx=1; b.abil='ironthorns'; nextMove(b); eq(b.abil,'seedfall','no seedling: Graft is skipped');
  b=bossFight(5); fireAbility(b,'summons'); const g=S.run.enemies.filter(x=>x!==b); eq(g.length,2); ok(g.every(x=>x.base==='Throne Guard'&&kitOf(x)==='shield'));
});
test('Boss kits: the Edict of Ash names a minion and executes it unless Guard or Taunt puts another vanguard under it; freezing breaks it',()=>{
  fresh(30); let b=bossFight(5); big(); let m=mkMinion({lvl:30,role:'striker'}); m.atk=1e6; mkMinion({lvl:10,role:'mender'});
  b.kitIx=2; b.abil='edict'; b.abilT=1; ok(bossTurn(b)); ok(b.charging); eq(b.edictT,fxKey(m),'the strongest is named'); ok(/is named/.test(chargeInfo(b).hint)); ok(chargeInfo(b).ans.includes('guard'));
  ok(bossTurn(b)); eq(m.hp,0,'executed'); ok(!b.edictT); eq(b.abil,'decree','the rotation goes on');
  b=bossFight(5); big(); m=mkMinion({lvl:30,role:'striker'}); m.atk=1e6; const v=mkMinion({lvl:30,role:'vanguard'}); v.hp=v.maxHp=1e9; S.run.taunt=2;
  b.edictT=fxKey(m); fireAbility(b,'edict'); ok(m.hp>0,'Taunt: a vanguard takes it'); ok(v.hp<1e9); S.run.taunt=0;
  b.edictT=fxKey(m); S.run.guard=S.run.turn; fireAbility(b,'edict'); ok(m.hp>0,'Guard: the vanguard takes it'); ok(S.run.guard==null);
  b.kitIx=2; b.abil='edict'; b.abilT=1; bossTurn(b); ok(b.charging); b.stun=1; act('strike'); ok(!b.charging&&m.hp>0,'frozen: the Edict is broken');
});
test('Boss kits: each gate boss\'s second phase has its own twist instead of Sundering Blow',()=>{
  fresh(30); setLvl(30);
  let b=bossFight(0); bossTwist(b); eq(b.twist,'crown'); fireAbility(b,'swarm'); const adds=S.run.enemies.filter(x=>x!==b); eq(adds.length,3,'three answer'); ok(adds.every(a=>kitOf(a)==='pack'),'Pack hunters');
  b=bossFight(1); big(); toPhase2(b); eq(b.twist,'watch'); ok(!b.alt,'no Sundering Blow'); b.abilT=1; bossTurn(b); ok(b.move!=='sunder');
  const m=mkMinion({lvl:30,role:'vanguard'}); m.hp=m.maxHp=1e6; const x=foe({hp:100}); x.shield=50; S.run.enemies.push(x); HITTER=m; hurtFoe(b,1000); HITTER=null; ok(m.hp<1e6,'the Last Watch bites back');
  x.shield=0; b.shield=0; m.hp=1e6; HITTER=m; hurtFoe(b,1000); HITTER=null; eq(m.hp,1e6,'with no shield standing it does not');
  b=bossFight(2); toPhase2(b); eq(b.imm,'fire'); eq(foeRes(b,'fire'),1); const h=b.hp; hurtFoe(b,5000,'fire'); eq(h-b.hp,1,'immune to fire'); eq(b.kit.filter(k=>k==='cinder').length,2,'Cinder Wave every second move');
  b=bossFight(3); toPhase2(b); const a=foe({hp:1e6}); S.run.enemies.push(a); bossRoomTurn(); ok(!hasSt(a,'hasted')); S.run.silence=2; bossRoomTurn(); ok(hasSt(a,'hasted'),'silenced: its adds are Hasted');
  b=bossFight(4); toPhase2(b); fireAbility(b,'seedfall'); const s=S.run.enemies.find(o=>o!==b&&o.seed!=null); ok(s); S.run.turn+=2; bossRoomTurn(); eq(s.base,'Thorn Troll','Bloom'); ok(s.seed==null);
  b=bossFight(5); const P=big(); toPhase2(b); eq(b.twist,'book'); const seq=[]; b.mvN=0; for(let i=0;i<6;i++){ nextMove(b); seq.push(b.abil); } eq(seq.filter(v=>v==='mirror').length,2,'every third move');
  S.run.lastSk=null; let hp=P.hp; mirrorLands(b); ok(P.hp<hp,'nothing to copy: a Royal Decree');
  P.hp=pMax(); S.run.lastSk='spear'; hp=P.hp; mirrorLands(b); ok(P.hp<hp); S.run.lastSk='curse'; mirrorLands(b); ok(hasSt(P,'sundered'));
});
test('Boss kits: hazards rule the room while their boss stands: Smoke weakens Bone Ward, the Echoing nave doubles the first skill, Roots bite the back row',()=>{
  fresh(30); let b=bossFight(2); eq(smokeK(),BK_SMOKE); b.hp=0; eq(smokeK(),1,'only while it stands');
  b=bossFight(3); const s=SKILL.spear; eq(skCost(s),s.cost*2); S.run.naveU=1; eq(skCost(s),s.cost,'only the first skill');
  b=bossFight(4); const bk=mkMinion({lvl:20,role:'mender'}), fr=mkMinion({lvl:20,role:'vanguard'}); bossEndTurn(); ok(bk.hp<bk.maxHp,'the back row'); eq(fr.hp,fr.maxHp,'not the front');
  BOSS_KITS_ON=false; b=bossFight(4); const bk2=mkMinion({lvl:20,role:'mender'}); bossEndTurn(); eq(bk2.hp,bk2.maxHp,'kits off: no hazard'); BOSS_KITS_ON=true;
});
test('Boss kits: the rival\'s second move comes from the bodies they stole, and the warning names it; the Captain purges and rallies',()=>{
  fresh(30); S.rival=Object.assign(rivalDef(),{name:'Vex',met:1,stash:[{role:'mender'},{role:'mender'},{role:'vanguard'}]});
  eq(rivalKitMove(),'mender'); eq(rivalKitName(),BOSS_ABIL.blackmass.name); arena([foe()],2); const r=makeRival(2,20); eq(JSON.stringify(r.kit),JSON.stringify([RIVAL_ABIL,'blackmass']));
  S.rival.stash=[]; ok(!makeRival(2,20).kit,'no bodies: the old single move');
  const R=foe({hp:1e6,maxHp:1e6,atk:100}), f1=foe({hp:50,maxHp:100}); arena([R,f1],2); fireKitMove(R,'blackmass'); eq(f1.hp,65); fireKitMove(R,'rampart'); eq(f1.shield,20); eq(R.shield||0,0,'not itself');
  const P=big(); const low=mkMinion({lvl:20,role:'striker'}); low.hp=Math.floor(low.maxHp*.2); fireKitMove(R,'harvest'); eq(low.hp,0,'harvested');
  const c=siegeFoe('vanguard',20,5,true,false), mil=foe({atk:100}); arena([c,mil],5); const ev=mkMinion({lvl:30,role:'vanguard',stage:2}); ev.mw=50; fireKitMove(c,'purge'); ok(hasSt(ev,'hexed')&&hasSt(ev,'sundered')); ok(!ev.mw,'Bone Shields crumble');
  const a0=mil.atk; fireKitMove(c,'rally'); eq(mil.atk,Math.round(a0*BK_RALLY)); fireKitMove(c,'rally'); eq(mil.atk,Math.round(a0*BK_RALLY),'once each');
});
test('Boss kits: the boss door, the Codex and Turkish carry every move, twist and hazard',()=>{
  fresh(30); const c=codexSection('bosses'); Object.values(BOSS_ABIL).forEach(A=>ok(c.includes(A.name),A.name)); Object.values(TWISTS).concat(Object.values(HAZARDS)).forEach(T=>ok(c.includes(T.name),T.name));
  VIEW.lang='tr'; Object.values(BOSS_ABIL).concat(Object.values(TWISTS),Object.values(HAZARDS)).forEach(A=>ok(trText(A.desc)!==A.desc,'Turkish: '+A.desc.slice(0,40)));
  Object.values(TWISTS).concat(Object.values(HAZARDS)).forEach(T=>ok(trText(T.name)!==T.name,T.name)); VIEW.lang='en';
  ok(bossKitTxt('The Ember Knight').includes('Hazard: Smoke'));
});
})();
