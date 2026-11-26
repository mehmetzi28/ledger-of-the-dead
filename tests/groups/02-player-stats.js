// Player Stats tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Stats: a new game starts at level 1 with 3 points, full HP and mana',()=>{
  const P=S.player; eq(P.lvl,1); eq(P.pts,3); eq(P.sp,0); eq(P.stats.strength,4); eq(P.stats.constitution,4); eq(P.stats.intelligence,4); eq(P.stats.will,4);
  eq(pMax(),48); eq(P.hp,pMax()); eq(P.mana,pMana()); eq(pAtk(),13); eq(S.watches,WATCHES); eq(S.gold,0); eq(S.day,1);
});
test('Stats: spending points raises the right numbers and current HP/mana',()=>{
  const P=S.player, h=pMax(), m=pMana(), a=pAtk();
  alloc('constitution'); eq(pMax(),h+CON_HP); eq(P.hp,h+CON_HP); eq(CON_HP,5);
  alloc('intelligence'); eq(pMana(),m+6); eq(P.mana,m+6);
  alloc('strength'); eq(pAtk(),Math.round(a+2.2)); eq(P.pts,0);
  alloc('will'); eq(P.stats.will,4,'no points left');
});
test('Stats: points cannot be spent in battle',()=>{ S.player.pts=3; arena([foe()]); alloc('strength'); eq(S.player.stats.strength,4); eq(S.player.pts,3); });
test('Stats: a point never lifts HP or mana above a scaled max (bug found by the fuzzer)',()=>{
  const P=S.player; P.pts=20; P.debuff=true; P.skills.bonearmor=3; P.hp=pMax(); for(let i=0;i<6;i++){ const h=pMax(), hp=P.hp; alloc('constitution'); ok(P.hp<=pMax(),'HP above max'); eq(P.hp,hp+(pMax()-h)); }
  checkTitles(); S.ti.got.t50=1; wearTitle('t50'); P.mana=pMana(); for(let i=0;i<6;i++){ alloc('intelligence'); ok(P.mana<=pMana(),'mana above max'); eq(P.mana,pMana()); }
  const m=mkMinion({lvl:5}), mh=m.maxHp; alloc('will'); alloc('will'); ok(m.maxHp>mh,'Will reaches the army'); alloc('bogus'); eq(P.stats.bogus,undefined);
});
test('Stats: gear adds to stats, an old saved dawn debuff no longer cuts HP, Bone Armor adds 6% per rank',()=>{
  const base=pMax(); wear('0-aa'); eq(pMax(),base+ITEM['0-aa'].stats.hp); S.equip.armor=null;
  S.player.debuff=true; eq(pMax(),base); delete S.player.debuff;
  S.player.skills.bonearmor=3; eq(pMax(),Math.round(base*1.18));
});
test('Stats: army slots grow with Will (one per 2.5) and level (one per 4), capped at 12',()=>{
  eq(slots(),2); S.player.stats.will=9; eq(slots(),4); S.player.lvl=10; eq(slots(),6); S.player.stats.will=99; eq(slots(),ARMY_CAP); eq(ARMY_CAP,12);
});
test('Stats: Strength adds crit and armor piercing, Constitution damage reduction and healing, Intelligence skill damage, each capped; Strength and Intelligence raise minion attack, Constitution minion HP',()=>{
  const P=S.player, st=P.stats;
  st.strength=10; near(critChance(),.15,1e-9); eq(strPen(),.05); st.strength=11; eq(strPen(),.05,'one percent per 2 points'); st.strength=200; eq(strCrit(),STR_CRIT_CAP); eq(strPen(),STR_PEN_CAP/100);
  st.constitution=10; near(conDr(),2.5,1e-9); near(conHeal(),15,1e-9); st.constitution=200; eq(conDr(),CON_DR_CAP); eq(conHeal(),CON_HEAL_CAP); eq(pDr(),Math.min(DR_CAP,xb('drp')+CON_DR_CAP));
  st.intelligence=20; near(skMul(),1.4,1e-9); st.intelligence=4; eq(pSiph(),Math.round(6+4*2.8+P.lvl)); eq(pWard(),Math.round(10+12+P.lvl*1.5));
  st.strength=4; st.constitution=0; arena([foe({hp:999})]); const hp0=P.hp; P.hp=10; hurtAlly(P,100); eq(P.hp,0,'no Constitution: full damage'); P.hp=hp0;
  st.constitution=10; P.hp=500; hurtAlly(P,100); eq(P.hp,500-Math.round(100*(1-pDr()/100)),'Constitution cuts damage taken');
  P.hp=1; const h=healAlly(P,20); eq(h,Math.round(20*1.15),'+15% healing received');
  st.strength=10; st.intelligence=10; near(statMinion(),10*STR_MINION+10*INT_MINION,1e-9); const m=mkMinion({lvl:5}), a0=m.atk; st.strength=30; syncMinion(m); ok(m.atk>a0,'Strength reaches the army');
  st.strength=0; st.intelligence=0; syncMinion(m); const a1=m.atk; st.intelligence=50; syncMinion(m); near(m.atk/a1,1+50*INT_MINION/100,.1,'Intelligence: minion attack');
  st.constitution=0; syncMinion(m); const h0=m.maxHp; st.constitution=40; eq(conMinion(),40*CON_MINION); syncMinion(m); near(m.maxHp/h0,1+40*CON_MINION/100,.05,'Constitution: minion max HP'); ok(m.hp<=m.maxHp);
  st.constitution=-5; eq(conMinion(),0,'never below zero');
});
test('Stats: rank letter follows level',()=>{ [[1,0],[4,1],[8,2],[12,3],[17,4],[23,5],[60,5]].forEach(([l,r])=>{ S.player.lvl=l; eq(pRankI(),r,'level '+l); }); });

})();
