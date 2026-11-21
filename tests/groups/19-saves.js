// Saves tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Saves: save and load bring back the same game',()=>{
  const s=richState(); S.mode='town'; save(); const before=canon(JSON.parse(localStorage.getItem(SAVE_KEY))); S=null; loadGame();
  const d=firstDiff(JSON.parse(before),JSON.parse(canon(S))); eq(d,null,'differs at');
});
test('Saves: closing the tab mid-run counts as walking out (watch spent, run gone)',()=>{
  startRun(0); eq(S.watches,2); S.player.hp=1; const snap=snapshot(); eq(snap.mode,'town'); eq(snap.run,null); eq(snap.player.hp,pMax()); eq(S.mode,'battle','the live game is untouched');
  save(); S=null; loadGame(); eq(S.mode,'town'); eq(S.watches,2); eq(S.player.hp,pMax());
});
test('Saves: loading after the last watch ends the day',()=>{ S.watches=0; save(); S=null; loadGame(); eq(S.day,2); eq(S.watches,WATCHES); });
test('Saves: old v1 saves migrate stat names and get skill points',()=>{
  const g=normalizeSave({v:1,player:{lvl:5,stats:{might:9,vigor:7,intellect:6,will:5}}}); eq(g.v,2); eq(g.player.stats.strength,9); eq(g.player.stats.constitution,7); eq(g.player.stats.intelligence,6); eq(g.player.sp,4); eq(g.player.stats.might,undefined);
  eq(normalizeSave({v:2,player:{lvl:5,sp:1}}).player.sp,1,'existing points kept');
});
test('Saves: junk is rejected',()=>{ [null,undefined,'x',5,[],{},{player:{}},{v:2,player:{lvl:0}},{v:3,player:{lvl:2}},{v:2,player:{lvl:'9'}}].forEach((x,i)=>eq(normalizeSave(x),null,'case '+i)); });
test('Saves: damaged saves are repaired',()=>{
  const g=normalizeSave({v:2,uid:3,gold:NaN,player:{lvl:3.7,xp:'a',stats:{strength:'x'},skills:{spear:1,fly:2}},
    inv:[{u:50,id:'0-wa'},{u:51,id:'nope'},null],equip:{weapon:{u:9,id:'bad'}},army:[{role:'striker',lvl:2,rankI:0,name:'Imp',traits:['vicious','fake'],stage:9},{role:'wizard',lvl:1,rankI:0}],
    trophies:{'Tunnel Rat':2.6,'Fake':3,'Imp':-1},belt:{hp:99,mp:-1},bagLv:99,salts:-4,shop:{day:1,stock:[{id:'nope'}]},quest:'x'});
  eq(g.player.lvl,3); eq(g.player.xp,0); eq(g.player.stats.strength,4); eq(Object.keys(g.player.skills).join(),'spear'); eq(g.gold,0);
  eq(g.inv.length,1); eq(g.equip.weapon,null); eq(g.army.length,1); eq(g.army[0].traits.join(),'vicious'); eq(g.army[0].stage,STAGE_MAX); eq(g.army[0].uid,51); eq(g.uid,51);
  eq(canon(g.trophies),canon({'Tunnel Rat':2})); eq(g.belt.hp,BELT_MAX); eq(g.belt.mp,0); eq(g.bagLv,BAG_COST.length); eq(g.salts,0); eq(g.shop,null); eq(g.quest.kills,0); eq(g.mode,'town');
  ok(adoptSave(g),'the repaired save loads'); invariants('repaired save');
});
test('Saves: an unreadable save is kept aside and a new game starts',()=>{
  localStorage.setItem(SAVE_KEY,'{not json'); S.day=9; loadGame(); eq(S.day,1); eq(localStorage.getItem(SAVE_KEY+'-broken'),'{not json'); ok(S.notices.some(n=>n.c==='bad'));
});
test('Saves: a bad load never replaces the current game',()=>{
  S.day=7; const cur=S; ok(!adoptSave({v:2,player:{lvl:1e308}}),'impossible numbers'); ok(S===cur); ok(!adoptSave('junk')); ok(!importCode('LOTD1:@@@')); ok(!importCode('hello')); ok(!importCode('')); ok(S===cur); eq(S.day,7);
});
test('Saves: three save slots write, read, load and delete',()=>{
  S.gold=321; ok(slotWrite(1)); ok(slotRead(1)); eq(slotRead(1).data.gold,321); eq(slotRead(2),null);
  S.gold=0; ok(slotLoad(1)); eq(S.gold,321); slotDelete(1); eq(slotRead(1),null); ok(!slotLoad(1));
  arena([foe()]); ok(!slotWrite(2),'no slot saves mid-run'); localStorage.setItem(slotKey(3),'{"data":{"bad":1}}'); eq(slotRead(3),null);
});
test('Saves: save codes round-trip, even with non-English text',()=>{
  S.gold=4321; mkMinion({nick:'Çağrı Ğü 墓'}); const code=exportCode(); ok(code.startsWith(CODE_TAG)); S.gold=0; S.army=[];
  ok(importCode(' '+code.slice(0,20)+'\n'+code.slice(20)+' '),'whitespace is ignored'); eq(S.gold,4321); eq(S.army[0].nick,'Çağrı Ğü 墓');
});
test('Saves: a full browser storage does not crash the game',()=>{
  if(!NODE) return; const orig=localStorage.setItem; localStorage.setItem=()=>{ throw new Error('QuotaExceeded'); };
  try{ save(); eq(slotWrite(1),false); eq(storageOk(),false); }finally{ localStorage.setItem=orig; } ok(storageOk());
});
test('Saves: a poisoned save code cannot put markup in the page or break a tab',()=>{
  richState(); S.mode='town'; S.run=null; const X='<i>X</i>', g=JSON.parse(JSON.stringify(S)), m=mkMinion({nick:'Tw'});
  g.hist.push({d:1,g:999,res:'cleared',rooms:1},{d:2,g:0,res:X,rooms:1},{d:3,g:0,res:'left',rooms:X,kills:X,xp:-5,gold:{},items:null,raised:[]});
  g.kills={'Tunnel Rat':X,'Imp':-1}; g.ti=Object.assign({},g.ti,{got:{d_raise1:X},bosses:X}); g.equip.zz=X;
  g.army.push(Object.assign(JSON.parse(JSON.stringify(m)),{uid:9999,tw:30,rankI:X,eq:X}));
  let ok1; try{ ok1=importCode(CODE_TAG+btoa(unescape(encodeURIComponent(JSON.stringify(g))))); }catch(e){ ok(false,'importCode threw: '+e.message); }
  ok(ok1,'the repaired code loads'); eq(S.hist[S.hist.length-1].rooms,0); ok(!S.hist.some(h=>h.g===999||h.res===X)); eq(S.army.find(x=>x.uid===9999).rankI,twRank(30));
  for(const t of ['hist','bes','titles','army','town']){ ui.tab=t; const h=renderAll('poisoned '+t); ok(!h.includes('<i>X'),t); }
});
test('Saves: item and minion ids stay unique after loading',()=>{
  const g=normalizeSave({v:2,uid:1,player:{lvl:2},inv:[{u:5,id:'0-wa'}],army:[{role:'striker',lvl:2,rankI:0,name:'Imp',uid:9}]}); adoptSave(g); eq(S.uid,9); const it=addItem('0-ta'); eq(it.u,10);
});

})();
