// Status Effects tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Status: a new dose refreshes, it ticks each turn, then wears off',()=>{
  const t=foe({hp:1000}); arena([t]); addDot(t,'poison',10,2); addDot(t,'poison',6,3); eq(t.dots.poison.d,10); eq(t.dots.poison.t,3); addDot(t,'poison',0.2,5); eq(t.dots.poison.t,3,'tiny doses are ignored');
  const pk=Math.round(10*(1-foeRes(t,'rot')));   /* poison is rot: the Rat Warren resists it */
  tickDots(); eq(t.hp,1000-pk); tickDots(); tickDots(); eq(t.hp,1000-3*pk); eq(t.dots,undefined); const dead=foe({hp:0}); addDot(dead,'poison',5,3); eq(dead.dots,undefined,'the dead cannot be poisoned');
});
test('Status: bleeding ignores your ward, can down minions, and can kill you',()=>{
  arena([foe({hp:1e6})]); const P=S.player; P.shield=500; addDot(P,'bleed',7,2); tickDots(); eq(P.hp,pMax()-7); eq(P.shield,500);
  const m=mkMinion({}); m.hp=3; addDot(m,'burn',10,2); tickDots(); eq(m.hp,0); ok(S.run.log.some(l=>/succumbs/.test(l.m)));
  P.shield=0; P.hp=5; addDot(P,'bleed',50,2); fix(.5); act('strike'); eq(S.mode,'defeat','bled out');
});
test('Status: enemy striker crits cause bleeding, Cinder Wave burns',()=>{
  const s=foe({role:'striker',atk:20,hp:1e6}); arena([s]); S.player.stats.constitution=200; S.player.hp=pMax(); seq([.5,.9,.5,.5,.1],.5); act('strike'); ok(S.player.dots&&S.player.dots.bleed,'bleeding after a crit'); eq(S.player.dots.bleed.d,6);
  fresh(); const b=bossFight(2); const m=mkMinion({}); m.hp=m.maxHp=1e5; S.player.stats.constitution=500; S.player.hp=pMax(); fireAbility(b); ok(S.player.dots.burn); ok(m.dots.burn);
});
test('Status: Venomous minions poison what they hit',()=>{ const t=foe({hp:1e6}); arena([t],3); const m=mkMinion({traits:['venom']}); m.atk=200; fix(.5); act('strike'); ok(t.dots&&t.dots.poison); eq(t.dots.poison.d,Math.round(200*.15*pierceMul(.5))); ok(TRAITS.venom); });
test('Status: a Healing Draught cures you, Dark Mending cures your whole side',()=>{
  arena([foe({hp:1e6})]); const P=S.player; S.belt.hp=2; addDot(P,'bleed',5,3); fix(.5); act('pot:hp'); eq(P.dots,undefined,'drinkable even at full HP when bleeding'); eq(S.belt.hp,1);
  const m=mkMinion({}); S.player.skills.mend=1; S.player.mana=100; ok(!canUse('mend')); addDot(m,'burn',5,3); addDot(P,'burn',5,3); ok(canUse('mend'),'usable to cure alone'); act('sk:mend'); eq(m.dots,undefined); eq(P.dots,undefined);
});
test('Status: effects end when you leave a room and never reach a save',()=>{
  arena([foe({hp:0,dead:true})]); fix(.5); const m=mkMinion({}); addDot(S.player,'bleed',3,3); addDot(m,'poison',3,3); const snap=snapshot(); eq(snap.player.dots,undefined); eq(snap.army[0].dots,undefined); ok(S.player.dots,'live game untouched');
  roomWon(); descend(); eq(S.player.dots,undefined); eq(m.dots,undefined);
  addDot(S.player,'bleed',3,3); flee(); eq(S.player.dots,undefined);
  eq(normalizeSave({v:2,player:{lvl:2,dots:{bleed:{d:9,t:9}}},army:[{role:'striker',lvl:1,rankI:0,name:'Imp',dots:{poison:{d:1,t:1}}}]}).player.dots,undefined);
});

test('Status: Blight is a wound that halves healing, for you and for a foe mender',()=>{
  const t=foe({hp:1e6}); arena([t]); const P=S.player; P.stats.constitution=300; P.hp=10; const h0=healAlly(P,100); P.hp=10; addDot(P,'blight',5,2); const h1=healAlly(P,100); eq(h1,Math.round(h0*BLIGHT_HEAL)); ok(DOTS.blight&&DOTS.blight.tip);
  const mnd=foe({role:'mender',atk:100,hp:1000}), hurt=foe({hp:1000}); arena([mnd,hurt]); hurt.hp=100; fix(.5); act('strike'); const g0=hurt.hp-100;
  hurt.hp=100; addDot(hurt,'blight',1,5); act('strike'); ok(Math.abs((hurt.hp-100+1)-g0*BLIGHT_HEAL)<=2,'the mender heals half');
});
test('Status: Sundered takes 25% more, Hexed deals 20% less, Chilled takes 20% more; they tick and end with the room',()=>{
  const t=foe({hp:1e6}); arena([t]); hurtFoe(t,100); eq(1e6-t.hp,100); addSt(t,'sundered',2); hurtFoe(t,100); eq(1e6-t.hp,225); addSt(t,'chilled',2); hurtFoe(t,100); eq(1e6-t.hp,225+150);
  const P=S.player; P.stats.constitution=300; P.shield=0; P.hp=pMax(); hurtAlly(P,100); const a=pMax()-P.hp; P.hp=pMax(); addSt(P,'sundered',2); hurtAlly(P,100); ok(pMax()-P.hp>a,'you take more too'); clearSt(P);
  const f=foe({atk:100,hp:1e6}); arena([f]); P.stats.constitution=300; P.hp=pMax(); fix(.5); act('strike'); const d0=pMax()-P.hp; P.hp=pMax(); addSt(f,'hexed',2); act('strike'); near(pMax()-P.hp,d0*HEX_MUL,2);
  eq(f.st.hexed,1,'ticks at the end of the turn'); act('strike'); eq(f.st,undefined,'and wears off');
  addSt(P,'hexed',2); const m=mkMinion({}); addSt(m,'hasted',2); const snap=snapshot(); eq(snap.player.st,undefined); eq(snap.army[0].st,undefined);
  eq(normalizeSave({v:2,player:{lvl:2,st:{hexed:3}},army:[{role:'striker',lvl:1,rankI:0,name:'Imp',st:{hasted:1}}]}).player.st,undefined);
  flee(); eq(P.st,undefined); eq(m.st,undefined); ok(!addSt(foe({hp:0}),'hexed',2),'not on the dead'); ok(!addSt(t,'bogus',2));
});
test('Status: Hasted units strike again for half at the end of the turn, on both sides',()=>{
  const t=foe({hp:1e6,atk:1}); arena([t]); const m=mkMinion({}); m.atk=200; addSt(m,'hasted',2); fix(.5); act('strike'); ok(S.run.log.some(l=>/is hasted and strikes Test Foe again for \d+/.test(l.m)));
  const e=foe({hp:1e6,atk:50}); arena([e]); S.army=[]; S.player.stats.constitution=300; S.player.hp=pMax(); addSt(e,'hasted',3); act('strike'); ok(S.run.log.some(l=>/is hasted and strikes you again/.test(l.m)));
  e.stun=1; S.run.log=[]; act('strike'); ok(!S.run.log.some(l=>/hasted/.test(l.m)),'a frozen foe does not follow up');
});
test('Status: a Hasted strike carries Unholy Frenzy, like a normal minion hit',()=>{
  const t=foe({hp:1e6,atk:1}); arena([t]); const m=mkMinion({}); m.atk=200; fix(.5); const blow=()=>{ addSt(m,'hasted',2); const h=t.hp; hasteStrikes(); return h-t.hp; };
  const d0=blow(); S.run.frenzy=2; S.run.frenzyMul=1.5; const d1=blow(); ok(d0>0); near(d1/d0,1.5,.02);
});
test('Status: sources: vanguards and Crushing sunder, Necrotic blights, Hexing hexes, Swift hastes, Frenzy 3 hastes, Curse 3 hexes',()=>{
  const t=foe({hp:1e6}); arena([t]); const v=mkMinion({role:'vanguard'}); v.atk=50; fix(.05); act('strike'); ok(hasSt(t,'sundered'),'a vanguard hit 1 in 10');
  S.army=[]; delete t.st; const n=mkMinion({traits:['necrotic','hexing']}); n.atk=100; fix(.2); act('strike'); ok(t.dots&&t.dots.blight); ok(hasSt(t,'hexed'));
  S.army=[]; delete t.st; const c=mkMinion({traits:['crushing']}); c.atk=50; fix(.3); act('strike'); ok(hasSt(t,'sundered'));
  ok(AFFIX_TRAITS.every(k=>TRAITS[k]&&!TRAIT_IDS.includes(k)),'affix traits are never rolled');
  S.army=[]; const sw=mkMinion({traits:['swift']}); flee(); S.watches=3; startRun(0); eq(sw.st.hasted,2,'Swift: hasted as the room starts');
  const P=S.player; const t2=foe({hp:1e6}); arena([t2]); P.mana=999; P.skills.frenzy=3; fix(.5); act('sk:frenzy'); ok(S.army.every(m=>m.hp<=0||hasSt(m,'hasted')));
  P.skills.curse=2; act('sk:curse'); ok(!hasSt(t2,'hexed'),'rank 2: no hex'); delete t2.curse; S.run.cd={}; P.skills.curse=3; act('sk:curse'); ok(hasSt(t2,'hexed'),'rank 3 hexes');
});
test('Status: foes apply them too: Sundering Blow, Plaguebearer, Sundering and Hexing elites, the Whisper Choir, Swift elites',()=>{
  const b=bossFight(1); const P=S.player; P.stats.constitution=500; P.hp=pMax(); fireAbility(b,'sunder'); ok(hasSt(P,'sundered'),'the Sundering Blow cracks your guard');
  const e=foe({atk:10,hp:1e6,elite:true,aff:['plague','sundering','hexing']}); arena([e]); S.army=[]; P.hp=pMax(); fix(.1); act('strike'); ok(P.dots&&P.dots.blight); ok(hasSt(P,'sundered')&&hasSt(P,'hexed'));
  clearAll(P); const w=foe({base:'Whisper Choir',name:'Whisper Choir',role:'mender',atk:10,hp:1e6}); arena([w]); fix(.1); act('strike'); ok(hasSt(P,'hexed'),'the Choir hexes');
  const s=foe({hp:1000,elite:true,aff:['swift']}); foeRise([s]); eq(s.st.hasted,3);
  ok(['plague','sundering','hexing','swift'].every(a=>AFFIX[a]&&TRAITS[AFFIX[a].trait]));
});
test('Status: pills with tooltips on every card in battle, in the Codex, and in Turkish',()=>{
  const t=foe({hp:1e6,shield:20}); arena([t]); const m=mkMinion({}); addDot(t,'blight',4,2); addSt(t,'sundered',2); t.stun=1; t.curse={mul:1.3,t:2}; addSt(m,'hasted',2); addSt(S.player,'hexed',2);
  const h=renderAll('pills'); ['p-blight','p-sundered','p-frozen','p-cursed','p-shield','p-hasted','p-hexed'].forEach(c=>ok(h.includes('pill '+c),c));
  ok(/title="Deals 20% less damage\. 2 turns left\."/.test(h)); ok(/title="Rot eats HP[^"]*4 damage a turn\. 2 turns left\."/.test(h));
  flee(); const c=cdx('status'); ['Blighted','Sundered','Hexed','Hasted','Chilled'].forEach(n=>ok(c.includes(n),'codex '+n)); ok(cdx('traits').includes('Necrotic')); ok(cdx('affixes').includes('Plaguebearer'));
  ['Blighted 2','Sundered 2','Hexed 2','Hasted 2','Chilled 2','Frozen 1','Cursed 2'].forEach(x=>ok(trText(x)!==x,x));
  [CONDS.hexed.desc+' 2 turns left.',DOTS.blight.tip+' 4 damage a turn. 2 turns left.',CONDS.hasted.desc+' 1 turn left.'].forEach(x=>{ const y=trText(x); ok(y!==x&&!/turns? left|damage a turn/.test(y),y); });
  Object.values(CONDS).forEach(C=>{ ok(trText(C.name)!==C.name,'tr '+C.name); ok(trText(C.desc)!==C.desc,'tr '+C.desc); });
});

})();
