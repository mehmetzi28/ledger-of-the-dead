// Player Stats tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Stats: a new game starts at level 1 with 3 points, full HP and mana',()=>{
  const P=S.player; eq(P.lvl,1); eq(P.pts,3); eq(P.sp,0); eq(P.stats.strength,4); eq(P.stats.constitution,4); eq(P.stats.intelligence,4); eq(P.stats.will,4);
  eq(pMax(),52); eq(P.hp,pMax()); eq(P.mana,pMana()); eq(pAtk(),10); eq(S.watches,WATCHES); eq(S.gold,0); eq(S.day,1);
});
test('Stats: spending points raises the right numbers and current HP/mana',()=>{
  const P=S.player, h=pMax(), m=pMana(), a=pAtk();
  alloc('constitution'); eq(pMax(),h+6); eq(P.hp,h+6);
  alloc('intelligence'); eq(pMana(),m+5); eq(P.mana,m+5);
  alloc('strength'); eq(pAtk(),Math.round(a+1.5)); eq(P.pts,0);
  alloc('will'); eq(P.stats.will,4,'no points left');
});
test('Stats: points cannot be spent in battle',()=>{ S.player.pts=3; arena([foe()]); alloc('strength'); eq(S.player.stats.strength,4); eq(S.player.pts,3); });
test('Stats: a point never lifts HP or mana above a scaled max (bug found by the fuzzer)',()=>{
  const P=S.player; P.pts=20; P.debuff=true; P.skills.bonearmor=3; P.hp=pMax(); for(let i=0;i<6;i++){ const h=pMax(), hp=P.hp; alloc('constitution'); ok(P.hp<=pMax(),'HP above max'); eq(P.hp,hp+(pMax()-h)); }
  checkTitles(); S.ti.got.t50=1; wearTitle('t50'); P.mana=pMana(); for(let i=0;i<6;i++){ alloc('intelligence'); ok(P.mana<=pMana(),'mana above max'); eq(P.mana,pMana()); }
  const m=mkMinion({lvl:5}), mh=m.maxHp; alloc('will'); alloc('will'); ok(m.maxHp>mh,'Will reaches the army'); alloc('bogus'); eq(P.stats.bogus,undefined);
});
test('Stats: gear adds to stats, the dawn debuff cuts HP, Bone Armor adds 6% per rank',()=>{
  const base=pMax(); wear('0-aa'); eq(pMax(),base+ITEM['0-aa'].stats.hp); S.equip.armor=null;
  S.player.debuff=true; eq(pMax(),Math.round(base*(1-QUEST_DEBUFF))); S.player.debuff=false;
  S.player.skills.bonearmor=3; eq(pMax(),Math.round(base*1.18));
});
test('Stats: army slots grow with Will (one per 2.5) and level (one per 4), capped at 12',()=>{
  eq(slots(),2); S.player.stats.will=9; eq(slots(),4); S.player.lvl=10; eq(slots(),6); S.player.stats.will=99; eq(slots(),ARMY_CAP); eq(ARMY_CAP,12);
});
test('Stats: rank letter follows level',()=>{ [[1,0],[4,1],[8,2],[12,3],[17,4],[23,5],[60,5]].forEach(([l,r])=>{ S.player.lvl=l; eq(pRankI(),r,'level '+l); }); });

})();
