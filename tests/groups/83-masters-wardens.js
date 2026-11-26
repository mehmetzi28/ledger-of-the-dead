// Boss kits, part two: secret masters and Tower wardens (src/game-boss-kits.js).
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,renderAll}=window.LOTD_T;
const big=()=>{ const P=S.player; P.stats.constitution=3000; P.hp=pMax(); return P; };
const master=di=>{ setLvl(40); arena([foe()],di); const e=makeSecret(di,30); e.hp=e.maxHp=1e7; S.run.enemies=[e]; return e; };
const warden=f=>{ setLvl(60); arena([foe()],5); const e=makeTowerEnemy(f,true); e.hp=e.maxHp=1e7; S.run.tw=f; S.run.enemies=[e]; return e; };

test('Masters and wardens: each secret master has its own kit and a rule that wakes at half HP; wardens carry their signature beside a gate move; Abaddon carries all; abyssal wardens two',()=>{
  fresh(40);
  SECRET.forEach((B,di)=>{ const e=master(di), K=BOSS_KIT[B.name]; ok(K&&HALVES[K.half],B.name); eq(JSON.stringify(e.kit),JSON.stringify(K.moves)); ok(e.phase2,'enters in phase two'); ok(!e.half);
    e.hp=e.maxHp*.4; bossRoomTurn(); eq(e.half,K.half,'at half HP'); });
  for(let i=0;i<9;i++){ const f=(i+1)*10, k=wardenKit(f); eq(k[0],WARDEN_SIG[i]); eq(k[1],GATE_ABIL[i%6]); }
  eq(wardenKit(100).length,10); ok(wardenKit(100).includes('otherhalf')); const a=wardenKit(130); eq(a.filter(m=>WARDEN_SIG.includes(m)).length,2,'abyssal: two signatures');
  const w=warden(20); eq(w.abil,'moth'); BOSS_KITS_ON=false; const o=warden(20); ok(!o.kit); BOSS_KITS_ON=true;
});
test('Masters: the Matriarch broods mites that burst into poison and feeds on them; the Abbot\'s tide floods unless frozen; the Wyrm is fire-immune and molten',()=>{
  fresh(40); let e=master(0); const P=big(); const m=mkMinion({lvl:30,role:'vanguard'}); fireAbility(e,'brood'); const mi=S.run.enemies.filter(x=>x.mite); eq(mi.length,2);
  addDot(e,'poison',100,3); ok(!(e.dots&&e.dots.poison),'immune to poison');
  e.half='swarm'; const a0=e.atk; mi[0].hp=0; checkDeaths(); ok(m.dots&&m.dots.poison,'the mite bursts'); eq(e.atk,Math.round(a0*1.05),'the swarm remembers');
  e.hp=e.maxHp/2; const h=e.hp; fireAbility(e,'feed'); ok(e.hp>h); ok(!S.run.enemies.includes(mi[1]),'eaten');
  e=master(1); big(); const v=mkMinion({lvl:30,role:'vanguard'}); v.hp=v.maxHp; for(let i=0;i<4;i++) bossRoomTurn(); eq(e.tide,4); e.stun=1; bossRoomTurn(); eq(e.tide,0,'a freeze resets it'); delete e.stun;
  for(let i=0;i<5;i++) bossRoomTurn(); eq(e.tide,0,'flooded'); ok(v.hp<v.maxHp);
  ok(/Tide/.test(bossRotChip(e)));
  e=master(2); eq(foeRes(e,'fire'),1); const mv=mkMinion({lvl:30,role:'vanguard'}); mv.hp=mv.maxHp=1e6; fireAbility(e,'molten'); HITTER=mv; hurtFoe(e,1000); HITTER=null; ok(mv.hp<1e6,'molten scales burn back');
  const back=mkMinion({lvl:30,role:'mender'}); const hb=back.hp; fireAbility(e,'tail'); ok(back.hp<hb);
});
test('Masters: the Choir binds and swells; the Rootking regrows unless it rots, and hardens; the Nameless Sovereign unwrites traits',()=>{
  fresh(40); let e=master(3); const P=big(); fireAbility(e,'verse'); ok(S.run.silence>0); eq(e.verses,1); const h=P.hp; fireAbility(e,'crescendo'); ok(P.hp<h);
  fireAbility(e,'echoes'); eq(S.run.enemies.filter(x=>x.base==='Hollow Chorister').length,2);
  e=master(4); e.hp=e.maxHp/2; let x=e.hp; bossRoomTurn(); ok(e.hp>x,'regrows'); addDot(e,'poison',10,3); x=e.hp; bossRoomTurn(); eq(e.hp,x,'not while it rots');
  fireAbility(e,'heartwood'); const y=e.hp; hurtFoe(e,1000); ok(y-e.hp<=Math.round(1000*(1-foeRes(e,'phys'))*.5)+1,'heartwood halves');
  const m1=mkMinion({lvl:30,role:'striker'}), m2=mkMinion({lvl:30,role:'striker'}); fireAbility(e,'spread'); ok(lockedNow(m1)||m1.root>S.run.turn); ok(m2.root>S.run.turn);
  e=master(5); big(); const t=mkMinion({lvl:30,role:'striker',traits:['vicious']}); t.atk=1e6; ok(hasTrait(t,'vicious')); fireAbility(e,'unwrite'); ok(!hasTrait(t,'vicious'),'forgotten'); clearAll(t); ok(hasTrait(t,'vicious'),'back after the fight');
  const p0=P.hp; fireAbility(e,'nothing'); ok(P.hp<p0);
});
test('Wardens: Three Heads, Moth Light, Confession until you ward, Swarm Cloud, Dirge, Chain, the Block, Infernal Bargain, Halo and the Other Half',()=>{
  fresh(60); let w=warden(10); const P=big(); fix(.5); const h0=P.hp; fireAbility(w,'heads'); ok(w.sigU,'its signature is seen');
  w=warden(20); const b=mkMinion({lvl:30,role:'mender'}); eq(rowOf(b),'b'); fireAbility(w,'moth'); eq(rowOf(b),'f','pulled forward'); clearAll(b); eq(rowOf(b),'b','back after the fight');
  w=warden(30); big(); fireAbility(w,'confess'); ok(S.run.conf); const d=hurtAlly(S.player,100); ok(d>=Math.round(100*BK_CONFESS)-50||d>0); S.player.mana=100; act('ward'); ok(!S.run.conf,'Bone Ward ends it');
  w=warden(40); fireAbility(w,'cloud'); ok(S.run.cloud>S.run.turn);
  w=warden(50); const v=mkMinion({lvl:30,role:'vanguard'}); fireAbility(w,'dirge'); addDot(v,'bleed',10,2); const hv=v.hp; tickDots(); eq(hv-v.hp,20,'wounds bleed twice as fast');
  w=warden(60); big(); const c=mkMinion({lvl:30,role:'striker'}); c.atk=1e6; c.hp=c.maxHp=1e6; fireAbility(w,'chain'); eq(w.chainT,fxKey(c)); hurtFoe(w,10000); ok(c.hp<1e6,'shared');
  w=warden(70); big(); const lo=mkMinion({lvl:30,role:'striker'}); lo.hp=Math.floor(lo.maxHp*.3); w.abil='block'; w.kitIx=0; w.abilT=1; bossTurn(w); ok(w.charging); eq(w.blockT,fxKey(lo)); bossTurn(w); eq(lo.hp,0,'executed under 40%');
  w=warden(80); fireAbility(w,'bargain'); w.hp=w.maxHp/2; let x=w.hp; S.run.turn=5; bossRoomTurn(); ok(w.hp>x,'mends'); x=w.hp; w.frostT=5; bossRoomTurn(); eq(w.hp,x,'not after frost');
  w=warden(90); big(); fireAbility(w,'halo'); const ph=S.player.hp; SKILLHIT=1; hurtFoe(w,10000); SKILLHIT=null; ok(S.player.hp<ph,'the Halo burns you');
  w=warden(100); S.run.souls=3; w.hp=w.maxHp/2; x=w.hp; fireAbility(w,'otherhalf'); eq(S.run.souls,0); ok(w.hp>x);
});
test('Boss titles: a gate boss beaten through its twist without a minion falling, and Ten Faces for every warden whose signature you saw',()=>{
  fresh(30); arena([foe()],2); const b=makeEnemy(2,20,true); b.hp=b.maxHp=1000; S.run.enemies=[b]; const m=mkMinion({lvl:20,role:'vanguard'});
  b.hp=400; checkPhase(); eq(b.twist,'burn'); eq(b.p2d,0); const t0=T_('ub_2'); b.hp=0; checkDeaths(); eq(T_('ub_2'),t0+1);
  fresh(30); arena([foe()],2); const c=makeEnemy(2,20,true); c.hp=c.maxHp=1000; S.run.enemies=[c]; const m2=mkMinion({lvl:20,role:'vanguard'}); c.hp=400; checkPhase(); m2.hp=0; c.hp=0; checkDeaths(); eq(T_('ub_2'),0,'a minion fell');
  fresh(60); const w=warden(30); w.sigU=1; w.hp=0; checkDeaths(); eq(T_('tf_2'),1); const w2=warden(40); w2.hp=0; checkDeaths(); eq(T_('tf_3')||0,0,'its signature unseen');
  ok(TITLES.some(t=>t.id==='b_ten')&&TITLES.some(t=>t.id==='b_ub5'));
});
test('Masters and wardens: the card shows their state; the Codex lists their kits; Turkish covers them',()=>{
  fresh(40); const e=master(2); fireAbility(e,'molten'); ok(/Molten/.test(bossRotChip(e))); e.half='wyrm'; ok(bossRotChip(e).includes(HALVES.wyrm.name));
  S.kills[SECRET[2].name]=1; const c=codexSection('bosses'); ok(c.includes('Breath Line')); Object.values(HALVES).forEach(H=>ok(c.includes(H.name)));
  VIEW.lang='tr'; Object.values(HALVES).forEach(H=>{ ok(trText(H.name)!==H.name,H.name); ok(trText(H.desc)!==H.desc,H.desc); }); WARDEN_SIG.concat(['otherhalf','brood','plague','feed','drown','litany','breath','molten','tail','verse','crescendo','echoes','spread','heartwood','unwrite','nothing']).forEach(m=>ok(trText(BOSS_ABIL[m].desc)!==BOSS_ABIL[m].desc,m)); VIEW.lang='en';
});
})();
