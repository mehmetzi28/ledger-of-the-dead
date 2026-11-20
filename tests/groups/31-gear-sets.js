// Gear Sets tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Sets: two and three pieces of one gate set give their bonuses',()=>{
  const h=pMax(); wear('0-wa'); eq(setCount(0),1); eq(pMax(),h); wear('0-aa'); eq(setCount(0),2); eq(G('hp'),ITEM['0-aa'].stats.hp+15,'2-piece +15 HP');
  wear('0-ta'); eq(setCount(0),3); eq(xb('goldp'),10,'3-piece +10% gold'); S.equip.relic={u:++S.uid,id:'1-ta'}; eq(setCount(0),2); eq(xb('goldp'),0);
});
test('Sets: a gate unique counts toward its set, Tower gear never does',()=>{
  wear('5-wa'); wear('u5'); eq(setCount(5),2); eq(G('mpow'),ITEM.u5.stats.mpow+8); wear('w10'); eq(setCount(5),2); S.equip.armor={u:++S.uid,id:'w2'}; eq(setCount(5),1);
});
test('Sets: percent bonuses really apply',()=>{
  arena([foe()],2); const m=dmgMul(); wear('2-wa'); wear('2-aa'); wear('2-tc'); near(dmgMul(),m*1.05,1e-9);
  fresh(); wear('4-wa'); wear('4-aa'); wear('4-tc'); arena([foe()],4); const P=S.player; P.stats.constitution=500; P.hp=pMax(); const hp=P.hp; hurtAlly(P,100); eq(hp-P.hp,95-CON_DR_CAP,'set 5% plus the capped Constitution part');
});
test('Sets: items show their set and which bonuses are active',()=>{ wear('3-wa'); wear('3-aa'); const it=give('3-ta'); const h=itemCard(it,''); ok(/Choir of Bones set \(2\/3 worn\)/.test(h)); ok(/class="on">2:/.test(h)); ok(!/class="on">3:/.test(h)); { const t=itemCard({u:1,id:'w1'},''); ok(!/set \(/.test(t)&&!/Scavenger|Drowned Vigil/.test(t),'tower uniques join no gate set'); ok(/Unique set: <b>Wardens/.test(t),'but they show their unique set'); } ui.tab='gear'; ok(/Choir of Bones set \(2\/3\)/.test(renderAll('equipment'))); });

})();
