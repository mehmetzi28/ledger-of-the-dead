// First-hour fixes: recommended gate levels that follow the tuning, the sure first raise, no quest penalty before a first clear,
// the Gates tab as the first screen, and foe armor explained.
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,corpse,raiseScene,renderAll,cdx}=window.LOTD_T;
const card=(h,name)=>{ const i=h.indexOf('<h3>'+name+'</h3>'); return h.slice(i,h.indexOf('</button>',i)); };
function tuned(fn){ const keep=JSON.stringify({armor:DIFF.armor,foeAtk:DIFF.foeAtk,gate:DIFF.gate}), lv=RK.map(r=>r.lv);
  try{ fn(); } finally{ const k=JSON.parse(keep); DIFF.armor=k.armor; DIFF.foeAtk=k.foeAtk; DIFF.gate=k.gate; RK.forEach((r,i)=>{ r.lv=lv[i]; }); } }

test('Recommended level: measured per gate, at or above its unlock, and not drifted far from the measurement',()=>{
  eq(REC_BASE.join(),'1,7,11,16,20,25','measured with the market bot (byLvl); re-measure before changing');
  tuned(()=>{ REC_AT.forEach((a,i)=>{ DIFF.armor[i]=a[0]; DIFF.foeAtk[i]=a[1]; DIFF.gate[i]=a[2]; RK[i].lv=a[3]; });
    for(let i=0;i<6;i++) eq(gateRec(i),REC_BASE[i],RANKS[i]+' at the measured tuning'); });
  for(let i=0;i<6;i++){ ok(gateRec(i)>=RK[i].unlock,RANKS[i]+' recommendation below its unlock level');
    ok(Math.abs(recShift(i))<=REC_DRIFT,RANKS[i]+' tuning moved the advice '+recShift(i).toFixed(1)+' levels: re-measure with node tests/run-balance.js \'{"byLvl":true}\' and update REC_BASE and REC_AT'); }
});
test('Recommended level: follows a gate\'s armor, foe attack, gate multiplier and foe level',()=>tuned(()=>{
  DIFF.armor[1]=.74; DIFF.foeAtk[1]=1.1; eq(gateRec(1),8,'the old Crypt tuning was harder');
  DIFF.armor[1]=.5; DIFF.foeAtk[1]=1.3; ok(gateRec(1)<7,'less armor, easier');
  DIFF.foeAtk[2]=1.2; ok(gateRec(2)>11,'harder hits');
  DIFF.gate[3]*=1.2; ok(gateRec(3)>16,'stronger foes');
  RK[4].lv+=2; eq(gateRec(4),22,'two foe levels, two hero levels');
  eq(gateRec(0),1,'other gates untouched'); eq(gateRec(5),25);
}));
test('Recommended level: the gate card states it apart from the label it drives, locked or not, in Turkish too',()=>{
  ui.tab='gates'; ui.gsub='open';
  let c=card(renderAll('locked'),'Sunken Crypt'); ok(/Opens at level 4/.test(c)); ok(/Recommended Lv 7\+/.test(c)); ok(!/Lv 6&ndash;9/.test(c),'old band gone');
  const lab=l=>{ setLvl(l); return (card(renderAll('lv '+l),'Sunken Crypt').match(/danger-(\w+)/)||[])[1]; };
  eq(lab(4),'deadly'); eq(lab(6),'hard'); eq(lab(7),'fair'); eq(lab(10),'fair'); eq(lab(11),'easy');
  tuned(()=>{ DIFF.armor[1]=.5; eq(lab(6),'fair','the label follows the tuning'); ok(/Recommended Lv [1-6]\+/.test(card(renderAll('tuned'),'Sunken Crypt'))); });
  ok(/recommended from level 7\./.test(cdx('gates')),'Codex');
  eq(trText('Recommended Lv 7+'),'Önerilen Sv 7+'); eq(trText('Opens at level 4, recommended from level 7. Armor 66%. Clear bonus 90 XP.'),'4 seviyede açılır, önerilen seviye 7. Zırh %66. Temizleme ödülü 90 TP.');
});
test('Armor: the gate card and the battle screen say what it does, in words a screen reader gets too',()=>{
  const said=/title="Foes shrug off 66% of every hit you and your minions land\. Piercing skills such as Bone Spear ignore part of it\.">armor 66%<span class="sr-only">/;
  setLvl(7); ui.tab='gates'; ui.gsub='open'; ok(said.test(card(renderAll('card'),'Sunken Crypt')),'gate card');
  arena([foe()],1); ok(said.test(renderAll('battle')),'battle');
  ok(/^Düşmanlar senin ve minyonlarının her vuruşunun %30/.test(trText('Foes shrug off 30% of every hit you and your minions land. Piercing skills such as Bone Spear ignore part of it.')));
});

test('First raise: a new save\'s first raise always answers, shown as 100%, then odds go back to normal',()=>{
  newGame(); S.notices=[]; ok(firstRaise()); const a=corpse(), b=corpse(); raiseScene([a,b]); S.run.lastXp=0; S.player.mana=99; fix(.99);
  eq(raiseChance(a),100); eq(saltChance(a),100); const h=renderAll('raise'); ok(/title="Your first raise always answers">Raise &middot; 100%/.test(h),'the button tells the truth');
  const mana=S.player.mana, cost=raiseCost(a); tryRaise(a.id); eq(S.army.length,1); eq(a.result,'raised'); eq(S.player.mana,mana-cost,'costs its mana as usual');
  ok(!firstRaise()); eq(S.firstRaise,0); ok(raiseChance(b)<100); tryRaise(b.id); eq(b.result,'failed','the second one rolls'); eq(S.army.length,1);
  eq(trText('Your first raise always answers'),'İlk diriltmen her zaman karşılık bulur');
});
test('First raise: a failed raise never happens before it, an elite or boss counts, and the tips say so',()=>{
  newGame(); const e=corpse({elite:true,lvl:3}); raiseScene([e]); S.player.mana=99; fix(.99); eq(raiseChance(e),100); tryRaise(e.id); eq(e.result,'raised');
  ok(/except the very first: that one always answers/.test(TIPS.find(t=>t.id==='raise').m)); ok(/your first raise always answers/.test(FIRST_STEPS[1][2]));
});
test('First raise: old saves with an army, history or progress count as having raised; a new save keeps it across reloads',()=>{
  eq(normalizeSave({v:2,player:{lvl:3}}).firstRaise,0,'progress');
  eq(normalizeSave({v:2,player:{lvl:1},day:2}).firstRaise,0,'a later day');
  eq(normalizeSave({v:2,player:{lvl:1},army:[{role:'striker',rankI:0,lvl:1}]}).firstRaise,0,'an army');
  eq(normalizeSave({v:2,player:{lvl:1},runs:1}).firstRaise,0,'history');
  eq(normalizeSave({v:2,player:{lvl:1},ti:{raised:2}}).firstRaise,0,'raised before');
  eq(normalizeSave({v:2,player:{lvl:1}}).firstRaise,1,'an untouched day-1 save');
  newGame(); S.day=4; S.runs=6; eq(normalizeSave(JSON.parse(JSON.stringify(S))).firstRaise,1,'a new save that has not raised yet keeps the promise');
  S.firstRaise=0; eq(normalizeSave(JSON.parse(JSON.stringify(S))).firstRaise,0);
});
test('First raise: New Game+ keeps its lifetime raise count, so it does not get the sure raise again',()=>{
  fresh(); S.ti={clr:{5:1},raised:12}; ok(startNGP()); eq(S.army.length,0); eq(S.firstRaise,1); ok(!firstRaise()); const c=corpse(); raiseScene([c]); ok(raiseChance(c)<100);
});

test('First screen: a new game opens on the Gates tab with a link to How to play that goes once the steps are done or tips are off',()=>{
  newGame(); OPEN_HELP.on=false; ui.confirm='new'; ACTIONS.newgame(); eq(ui.tab,'gates');
  const link=/<p class="q-note guide-link"><button class="linkbtn" data-a="tab" data-k="help">How to play &middot; first steps (\d)\/9<\/button><\/p>/;
  let m=renderAll('new game').match(link); ok(m,'link shown'); eq(m[1],'0');
  ACTIONS.tab('help'); eq(ui.tab,'help'); ok(/Begin: to the gates/.test(renderAll('guide')));
  ui.tab='gates'; S.tips.off=1; ok(!link.test(renderAll('tips off')),'hidden with tips off'); delete S.tips.off;
  const keep=FIRST_STEPS.map(x=>x[1]); try{ FIRST_STEPS.forEach(x=>{ x[1]=()=>true; }); ok(!link.test(renderAll('all done')),'hidden once every step is done'); } finally{ FIRST_STEPS.forEach((x,i)=>{ x[1]=keep[i]; }); }
  eq(trText('How to play · first steps 0/9'),'Nasıl oynanır · ilk adımlar 0/9');
});
})();
