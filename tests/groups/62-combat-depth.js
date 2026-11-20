// Combat Depth tests: foe intents, status combos and the reworked rank-3 choices. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Intents: every foe plans its next action, the card shows it, and the foe does exactly that',()=>{
  const a=foe({hp:1e6,atk:30}), b=foe({hp:1e6,atk:30}); arena([a,b]); const m=mkMinion({role:'striker'}); m.hp=m.maxHp=1e5;
  planFoes(); ok(a.it&&a.it.k==='atk'&&b.it,'both planned');
  a.it={k:'atk',t:fxKey(m)}; b.it={k:'atk',t:'p'}; S.mode='battle'; const h=renderAll('intents'); ok(/class="intent i-atk"[^>]*>.*Attacks Mn\d+/.test(h)&&/Attacks you/.test(h),'shown on the cards');
  const mh=m.hp, ph=S.player.hp; fix(.5); act('strike'); ok(m.hp<mh,'the minion it named took the blow'); ok(S.player.hp<ph,'you took the other');
  ok(a.it&&b.it,'planned again for the next turn');
});
test('Intents: re-rolled when the target falls or Taunt pulls the foe away; a frozen foe loses its action',()=>{
  const a=foe({hp:1e6,atk:30}); arena([a]); const m=mkMinion({role:'striker'}), v=mkMinion({role:'vanguard'}); v.hp=v.maxHp=1e5;
  a.it={k:'atk',t:fxKey(m)}; m.hp=0; ok(!intentOk(a),'a fallen target'); planFoes(); ok(a.it.t!==fxKey(m),'rolled again');
  m.hp=m.maxHp; a.it={k:'atk',t:'p'}; S.run.cmd={}; command('vanguard'); ok(!intentOk(a),'Taunt pulls it away'); const vh=v.hp, ph=S.player.hp; fix(.5); act('strike'); ok(v.hp<vh&&S.player.hp===ph,'it hits the vanguard instead');
  a.it={k:'atk',t:'p'}; a.stun=1; S.mode='battle'; ok(/Frozen/.test(intentInfo(a).txt)); const p2=S.player.hp; act('strike'); eq(S.player.hp,p2,'frozen: no blow'); ok(a.it,'a fresh plan after the freeze');
});
test('Intents: the same target weights as before (vanguards 5, everyone else 2)',()=>{
  const a=foe({hp:1e6,role:'striker'}); arena([a]); const v=mkMinion({role:'vanguard'}); mkMinion({role:'striker'}); seed(77);   /* a ranged foe: the row rule leaves the weights alone */ let n=0; const N=4000;
  for(let i=0;i<N;i++){ delete a.it; rollIntent(a); if(a.it.t===fxKey(v)) n++; } near(n/N,5/9,.03);
});
test('Intents: menders plan a heal, bosses show their next move',()=>{
  const md=foe({role:'mender',hp:1e6,atk:20}), hurt=foe({hp:100,maxHp:1000}); arena([md,hurt]); planFoes(); eq(md.it.k,'heal'); eq(md.it.t,hurt.id); ok(/Heals Test Foe/.test(intentInfo(md).txt));
  fix(.5); S.player.hp=pMax(); act('strike'); ok(hurt.hp>100-H(pAtk())||S.run.log.some(l=>/mends/.test(l.m)),'it mended');
  const b=bossFight(1); b.abilT=1; S.mode='battle'; const i=intentInfo(b); eq(i.k,'abil'); ok(i.txt.includes(BOSS_ABIL[b.abil].name)); b.abilT=3; planFoes(); eq(intentInfo(b).k,'atk');
});
test('Combos: Frostbreak, Spreading Rot, Fizzle, Breach and Swift Blow',()=>{
  const P=S.player, t=foe({hp:1e6}); arena([t]); fix(.5); t.stun=1; addSt(t,'chilled',2); const base=H(pAtk()*pierceMul(strPen())); act('strike');
  ok(1e6-t.hp>=Math.round(Math.round(base*CHILL_MUL)*FROSTBREAK)-2,'50% more'); ok(S.run.log.some(l=>/^Frostbreak/.test(l.m)),'logged');
  // Spreading Rot
  const x=foe({hp:1e6}), y=foe({hp:1e6}); arena([x,y],2); setLvl(40); master('blast'); P.mana=99; S.run.corpses=[corpse({bl:20})]; act('sk:blast'); ok(x.dots&&x.dots.blight&&y.dots&&y.dots.blight,'the blight spreads'); ok(S.run.log.some(l=>/Spreading Rot/.test(l.m)));
  const z=foe({hp:1e6}); arena([z]); S.run.corpses=[corpse()]; S.run.cd={}; P.mana=99; act('sk:blast'); ok(!(z.dots&&z.dots.blight),'no blight, no spread');
  // Fizzle
  const s=foe({role:'striker',hp:1e6,atk:40}); arena([s]); addSt(s,'hexed',3); s.it={k:'atk',t:'p'}; fix(.1); act('strike'); ok(!(P.dots&&P.dots.bleed),'a hexed foe opens no wound'); ok(S.run.log.some(l=>/^Fizzle/.test(l.m)));
  // Breach
  const k=foe({hp:1e6}); arena([k],3); S.army=[]; const rp=mkMinion({role:'reaper'}); rp.atk=100; addSt(k,'sundered',3); S.run.cmd={}; command('reaper'); fix(.5); const h0=k.hp; act('strike');
  ok(S.run.log.some(l=>/^Breach/.test(l.m)),'Breach logged'); ok(h0-k.hp>H(pAtk()*pierceMul(strPen())*SUNDER_MUL)+H(100*dmgMul())*SUNDER_MUL,'armor ignored');
  // Swift Blow
  const w=foe({hp:1e6}); arena([w]); S.army=[]; const vm=mkMinion({role:'striker',traits:['venom']}); addSt(vm,'hasted',2); delete w.dots; fix(.5); hasteStrikes(); ok(w.dots&&w.dots.poison,'the follow-up poisons'); ok(S.run.log.some(l=>/^Swift Blow: .* is poisoned/.test(l.m)));
  ok(S.run.fx[w.id]&&S.run.fx[w.id].c==='Swift Blow','a floating word on the card');
});
test('Rank 3: Necrotic Edge, Reap and Deathless Will choices each work in normal play',()=>{
  const P=S.player, t=foe({hp:1e6}); arena([t]); setLvl(40); fix(.5); P.mana=999;
  master('reap'); const d0=(()=>{ S.run.cd={}; const h=t.hp; act('sk:reap'); return h-t.hp; })(); P.skMod.reap='a'; S.run.cd={}; let h=t.hp; act('sk:reap'); near(h-t.hp,d0*MOON_HIGH,2,'Harvest Moon above the line');
  P.skMod.reap='b'; P.hp=100; S.run.cd={}; act('sk:reap'); ok(P.hp>100,'Soul Reap heals on every reap');
  master('edge'); P.skMod.edge='a'; fix(.01); act('strike'); ok(hasSt(t,'sundered'),'Rending: a crit sunders');
  P.skMod.edge='b'; fix(.5); delete t.dots; act('strike'); ok(t.dots&&t.dots.bleed,'Bloodletting: the target bleeds');
  master('deathless'); P.skMod.deathless='a'; P.mana=0; act('strike'); const g1=P.mana; P.skMod.deathless='b'; P.mana=0; act('strike'); eq(g1-P.mana,DEEP_REGEN,'Deep Well: a mana more each turn');
  P.hp=pMax(); P.shield=0; delete P.skMod.deathless; hurtAlly(P,200); const full=pMax()-P.hp; P.hp=pMax(); P.skMod.deathless='b'; hurtAlly(P,200); ok(pMax()-P.hp<full,'Iron Will at full HP');
  eq(normalizeSave({v:2,player:{lvl:40,skills:{reap:3,edge:3,deathless:3},skMod:{reap:'a',edge:'b',deathless:'b'}}}).player.skMod.reap,'a','saved choices stay valid');
});
test('Combat depth: Codex pages and Turkish',()=>{
  setLvl(20); ok(/Combos/.test(cdx('status'))&&/Frostbreak/.test(cdx('status'))); ok(/Every foe card shows/.test(cdx('orders')));
  ['Attacks you','Attacks Mn4','Heals Test Foe','Heals itself','Will use Royal Decree','Gathers for Sundering Blow','Frozen solid: it loses its next action.','Mends a wounded foe on its turn.','Its next blow. Taunt turns it onto a vanguard; freezing it costs it the turn.',
   'Frostbreak: Test Foe shatters out of the ice.','Breach: Mn3 cuts through the cracked armor.','Fizzle: the hex spoils Test Foe\'s killing blow.','Spreading Rot: the blight spreads to 2 foes.','Swift Blow: Test Foe is poisoned, sundered.','Combos']
    .forEach(x=>{ const y=trText(x); ok(y!==x,'tr '+x); });
  Object.values(COMBOS).forEach(C=>{ ok(trText(C.name)!==C.name,C.name); ok(trText(C.desc)!==C.desc,C.desc); });
  ok(!/iyileştirecek/.test(trText('Heals you for 30% of your max HP.')),'other Heals lines keep their own Turkish');
});
})();
