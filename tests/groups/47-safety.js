// Safety tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Safety: another tab saving stops this tab from saving until you load the newer save',()=>{
  if(!NODE) return; const ls=window.__listeners['w:storage']; ok(ls&&ls.length,'listens for other tabs');
  save(); const mine=localStorage.getItem(SAVE_KEY); S.gold=123;
  try{ ls[0]({key:SAVE_KEY,newValue:'{"other":1}'}); ok(TAB.blocked); save(); eq(localStorage.getItem(SAVE_KEY),mine,'no overwrite while blocked');
    ok(/data-a="tabsync"/.test(renderAll('blocked'))); ACTIONS.tabsync(); ok(!TAB.blocked); }
  finally{ TAB.blocked=false; }
  ls[0]({key:'lotd-view',newValue:'{}'}); ok(!TAB.blocked,'other keys are ignored');
});
test('Safety: an unchanged game is not written again, but a cleared save is written back',()=>{
  save(); const a=localStorage.getItem(SAVE_KEY); let writes=0; const set=localStorage.setItem; localStorage.setItem=function(k,v){ if(k===SAVE_KEY) writes++; return set.call(this,k,v); };
  try{ save(); save(); eq(writes,0,'nothing changed'); S.gold+=5; save(); eq(writes,1,'a change is saved'); localStorage.removeItem(SAVE_KEY); save(); eq(writes,2,'a missing save is written back'); ok(localStorage.getItem(SAVE_KEY)); }
  finally{ localStorage.setItem=set; }
  ok(a);
});

test('Safety: a pasted save code cannot put markup into the page (notices, memorial names)',()=>{
  const g=JSON.parse(JSON.stringify(S)); g.notices=[{m:'<img src=x onerror=alert(1)>',c:'x" onclick='}];
  g.memorial=[{nick:'Bob',name:'<svg onload=alert(2)>',kind:'Rat',rk:0,lvl:1,st:0,tr:[],role:'striker',day:1}];
  ok(importCode('LOTD1:'+btoa(unescape(encodeURIComponent(JSON.stringify(g))))),'imports'); eq(S.notices[0].c,'info');
  ok(!/<img/.test(notesHTML()),'notices'); ok(!/<svg onload/.test(memorialHTML()),'memorial');
});
test('Unique sets: six trios of one weapon, armor and relic; every unique belongs to exactly one',()=>{
  eq(USET.length,6); const all=Object.values(ITEM).filter(d=>d.uq).map(d=>d.id), used=USET.flatMap(u=>u.ids);
  eq(new Set(used).size,used.length,'no unique in two sets'); eq(used.slice().sort().join(),all.slice().sort().join(),'every unique is in a set');
  USET.forEach(u=>{ eq(u.ids.map(id=>ITEM[id].slot).sort().join(),'armor,relic,weapon',u.name); eq(ITEM[u.ids[0]].uset,USET.indexOf(u)); ok(buffTxt(u.b[2])&&buffTxt(u.b[3]),u.name+' text'); });
});
test('Unique sets: two and three worn pieces add their bonuses, on top of the gate set',()=>{
  setLvl(40); const P=S.player; const m0=pMana(), r0=G('raise'), mp0=G('mpow');
  const wearU=id=>{ const it=addItem(id,null); equip(it.u); };
  wearU('u0'); eq(usetCount(0),1); eq(G('raise')-r0,ITEM.u0.stats.raise||0,'one piece: no set bonus');
  wearU('u1'); eq(usetCount(0),2); eq(G('raise'),r0+(ITEM.u0.stats.raise||0)+(ITEM.u1.stats.raise||0)+USET[0].b[2].raise,'two pieces');
  const d0=xb('dmgp'); wearU('u2'); eq(usetCount(0),3); eq(xb('dmgp')-d0,USET[0].b[3].dmgp,'three pieces'); eq(xb('xpp'),titleB('xpp')+USET[0].b[3].xpp);
  ok(P.hp<=pMax()&&P.mana<=pMana()); invariants('uset');
  unequip('weapon'); eq(usetCount(0),2); eq(xb('dmgp'),d0,'the 3-piece bonus goes with the third piece');
  const it=addItem('w10',null); equip(it.u); const it2=addItem('w11',null); equip(it2.u); eq(usetCount(5),2); eq(usetCount(0),1,'only its armor is still worn'); ok(xb('hpp')>=USET[5].b[2].hpp);
});
test('Unique sets: item cards, the equipment panel and the Codex show them',()=>{
  const a=addItem('w1',null), b=addItem('w2',null); equip(a.u); equip(b.u); const c=give('w3');
  ok(/Unique set: <b>Wardens&#39;|Unique set: <b>Wardens'/.test(itemCard(c,''))&&/\(2\/3 worn\)/.test(itemCard(c,'')));
  ui.tab='gates'; ok(/uset-on">Wardens/.test(renderAll('panel'))); ui.tab='codex'; ACTIONS.cx('sets'); const h=renderAll('codex'); USET.forEach(u=>ok(h.includes(u.name.replace("'","'")),u.name)); ok(/Worn 2\/3/.test(h));
});
test('Army: the rename box keeps what you typed across a redraw, cleaned (bug found in review)',()=>{
  const m=mkMinion({}); ui.tab='army'; ACTIONS.renameo(String(m.uid)); ui.rn='Half-typed'; ok(/id="rn"[^>]*value="Half-typed"/.test(renderAll('redraw')),'shows the typed text');
  ui.rn='<b>"x"</b>'; const h=renderAll('dirty'); ok(/value="bxb"/.test(h)&&!/value="<b>/.test(h),'never raw HTML in the box');
});
test('Saves: a damaged fusion count is clamped, so the two-fusion limit holds (bug found in review)',()=>{
  const a=mkMinion({role:'striker'}), b=mkMinion({role:'striker'}); a.fused='1'; b.fused=-3;
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.army[0].fused,1); eq(g.army[1].fused,0); a.fused=7; eq(normalizeSave(JSON.parse(JSON.stringify(S))).army[0].fused,FUSE_MAX);
  const c=mkMinion({}); eq('fused' in normalizeSave(JSON.parse(JSON.stringify(S))).army[2],false,'never fused: no field added');
});
test('Screens: the Town tab, bounty board, salvage and enchanting appear only once they matter',()=>{
  ui.tab='gates'; let h=renderAll('new game'); ok(!/data-k="town"/.test(h)&&!/Bounty board/.test(h),'hidden at the start');
  const it=give('2-wa'); ui.tab='gear'; h=renderAll('gear'); ok(!/data-a="salvage"/.test(h)&&!/data-a="ench"/.test(h)&&!/ dust</.test(h));
  ui.tab='town'; renderAll('locked town'); eq(ui.tab,'gates','a closed tab falls back to the gates');
  setLvl(6); S.ti=S.ti||{}; S.ti.clr={0:1}; ui.tab='gates'; h=renderAll('one clear'); ok(!/data-k="town"/.test(h)&&!/Bounty board/.test(h),'one clear is not enough, whatever the level'); setLvl(1);
  S.ti.clr={0:1,1:1}; h=renderAll('after two clears'); ok(/data-k="town"/.test(h)&&/Bounty board/.test(h)); ok(TIPS.find(t=>t.id==='townopen').when());
  ui.tab='gear'; ok(!/data-a="salvage"/.test(renderAll('still early'))); S.dust=1; ok(/data-a="salvage"/.test(renderAll('with dust'))); S.dust=0; setLvl(6); ok(/data-a="ench"/.test(renderAll('level 6')));
});
})();
