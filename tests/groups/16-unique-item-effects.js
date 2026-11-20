// Unique Item Effects tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Uniques: Undying revives once at 30%, then you fall',()=>{
  wear('u2'); arena([foe({atk:1e7})]); fix(.5); const P=S.player; P.hp=1; act('strike'); eq(S.mode,'battle'); eq(S.run.revives,1); ok(P.hp>0);
  act('strike'); eq(S.mode,'defeat');
});
test('Uniques: Deathless revives twice at 50%',()=>{ wear('w12'); const r=arena([foe()]); S.player.hp=0; ok(!playerFalls()); eq(S.player.hp,Math.round(pMax()*.5)); ok(!playerFalls()); ok(playerFalls()); eq(S.mode,'defeat'); eq(r.revives,2); });
test('Uniques: Echo can strike twice',()=>{ wear('u1'); const t=foe({hp:1e7}); arena([t]); seq([.5,.9,.1,.5]); act('strike'); eq(1e7-t.hp,2*H(pAtk()*pierceMul(strPen()))); });
test('Uniques: Execute adds 50% below 35% HP',()=>{ wear('w1'); const a=foe({hp:1e7}), b=foe({hp:3e6,maxHp:1e7}); arena([a,b]); fix(.5); act('strike'); const d=1e7-a.hp; setTarget(b.id); act('strike'); eq(3e6-b.hp,Math.round(d*1.5)); });
test('Uniques: Hellfire scorches every other foe, Cleave one other',()=>{
  wear('w11'); const a=foe({hp:1e7}), b=foe({hp:1e7}), c=foe({hp:1e7}); arena([a,b,c]); fix(.5); act('strike'); const d=1e7-a.hp; eq(1e7-b.hp,Math.round(d*.4)); eq(1e7-c.hp,Math.round(d*.4));
  S.equip.weapon=null; wear('w7'); const x=foe({hp:1e7}), y=foe({hp:1e7}); S.run.enemies=[x,y]; S.run.target=x.id; act('strike'); eq(1e7-y.hp,Math.round((1e7-x.hp)*.6));
});
test('Uniques: Ruin adds 25% to all damage',()=>{ arena([foe()],3); const m=dmgMul(); wear('w10'); near(dmgMul(),m*1.25,1e-9); });
test('Uniques: Lifedrain and Chorus empower Soul Siphon',()=>{
  wear('u3'); S.player.stats.constitution=40; const a=foe({hp:1e7}), b=foe({hp:1e7}); arena([a,b]); fix(.5); const P=S.player; P.mana=50; P.hp=1; act('siphon'); const d=1e7-a.hp; eq(P.hp,1+Math.round(Math.round(d*.8)*(1+conHeal()/100))-2);
  S.equip.weapon=null; wear('w5'); P.mana=50; const a2=a.hp, b2=b.hp; act('siphon'); eq(b2-b.hp,Math.round((a2-a.hp)*.5));
});
test('Uniques: Thorns hurt attackers, Halo heals each turn',()=>{
  wear('w2'); const t=foe({hp:1e6,atk:100}); arena([t]); S.player.hp=pMax(); fix(.5); act('strike'); eq(1e6-t.hp,H(pAtk()*pierceMul(strPen()))+Math.round(100*.2*(1-DIFF.armor[0])));
  S.equip.armor=null; wear('w9'); S.player.hp=10; t.atk=1; act('strike'); eq(S.player.hp,10-1+Math.round(pMax()*.04));
});
test('Uniques: Soul Harvest and Censer restore on kills',()=>{
  wear('u4'); arena([foe({hp:1})]); fix(.5); S.player.mana=0; act('strike'); eq(S.player.mana,9);
  fresh(); wear('w3'); arena([foe({hp:1})]); fix(.5); S.player.mana=0; S.player.hp=10; act('strike'); eq(S.player.mana,13); eq(S.player.hp,10+Math.round(pMax()*.05));
});
test('Uniques: Infernal starts every fight with a ward',()=>{ wear('w8'); setLvl(5); startRun(0); eq(S.player.shield,Math.round(pMax()*.25)); });
test('Uniques: Cheap Dead halves raise cost, Bind Souls raises two levels higher',()=>{
  const c=corpse(); const full=raiseCost(c); wear('u5'); eq(raiseCost(c),Math.ceil(full/2)); S.equip.armor=null;
  wear('w6'); raiseScene([c],5); fix(0); S.player.mana=99; tryRaise(c.id); eq(S.army[0].lvl,3);
});
test('Uniques: holding one earns Touched by Legend',()=>{ give('u0'); checkTitles(); ok(S.ti.got.d_uq); });

})();
