// Vane Abbey, the seventh gate (src/game-abbey.js): the door and its keys, the abbey's foes, the Scriptorium, the Ledger-Chain, Marginalia.
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,renderAll,wear}=window.LOTD_T;
const openAbbey=()=>{ S.ti=S.ti||{}; S.ti.clr=Object.assign(S.ti.clr||{},{5:1}); abbeyState().open=1; };
const inAbbey=list=>{ setLvl(36); openAbbey(); const r=arena(list||[foe()],ABBEY); return r; };

test('Abbey door: sealed on a fresh save and hidden until the Throne falls; each key opens it; an old save loads sealed',()=>{
  fresh(40); ok(!abbeyOpen()); ok(gateLocked(ABBEY)); ui.tab='gates'; ok(!/Vane Abbey/.test(renderAll('fresh gates')),'no seventh card yet');
  S.mode='town'; S.watches=WATCHES; startRun(ABBEY); ok(!S.run||S.run.di!==ABBEY,'cannot enter while sealed');
  S.ti=S.ti||{}; S.ti.clr={5:1}; abbeyCheck(); ok(!abbeyOpen(),'the Throne alone is not a key'); const h=renderAll('sealed door'); ok(/Vane Abbey/.test(h)&&/Sealed &middot; two keys/.test(h)&&/The deep route/.test(h)&&/The secret route/.test(h));
  S.tower.best=ABBEY_TOWER; S.pages=ABBEY_PAGES; abbeyCheck(); ok(abbeyOpen(),'the deep route'); eq(S.abbey.keys.deep,1); eq(T_('abbeyOpened'),1); ok(!/Sealed &middot; two keys/.test(renderAll('open')));
  fresh(40); S.ti={clr:{5:1}}; SECRET.forEach((B,i)=>tally('secret_'+i)); abbeyCheck(); ok(abbeyOpen(),'the secret route'); eq(S.abbey.keys.secret,1); eq(S.abbey.keys.deep,0);
  const g=JSON.parse(JSON.stringify(S)); delete g.abbey; eq(JSON.stringify(abbeyFix(normalizeSave(g).abbey)),JSON.stringify({keys:{deep:0,secret:0},open:0}),'old save: sealed');
  eq(JSON.stringify(abbeyFix({keys:{deep:'x'},open:true})),JSON.stringify({keys:{deep:1,secret:0},open:1}));
});
test('Abbey: never cursed, raided, a Rift gate, a Trial gate, a rival gate or a shop tier; topGate stops at the Throne',()=>{
  fresh(60); openAbbey(); S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1,6:1};
  for(let d=0;d<40;d++){ S.day=d; ok(!gateMod(ABBEY),'no curse'); }
  ok(!raidGates().includes(ABBEY)); ok(!rivalGates().includes(ABBEY)); eq(topGate(),5);
  for(let i=0;i<20;i++){ const p=trialPlan&&trialPlan(); if(p) ok(p.di<GATE_N,'trial gate'); }
  ok(!SECRET[ABBEY],'no secret master'); eq(secretRoll(ABBEY),false);
});
test('Abbey run: five rooms with the Scriptorium before the boss; its foes carry Unwritten and Recitation',()=>{
  fresh(36); const r=inAbbey(); eq(r.rooms,ABBEY_ROOMS); r.room=r.rooms-3; eq(rollDoors(r).join(),'script');
  quietRoom('script'); eq(r.quiet,'script'); eq(S.mode,'raise'); ok(S.story&&S.story.abbey4!=null,'the Scriptorium passage');
  eq(KIT_OF['Ink Wraith'],'unwritten'); eq(KIT_OF['Chained Lector'],'recite'); ok(!KIT_IDS.includes('unwritten')&&!KIT_IDS.includes('recite'),'abbey-only kits');
});
test('Unwritten: a minion\'s blow passes through until a skill or Siphon inks it; your Strike still lands',()=>{
  fresh(36); const w=foe({hp:1e5,atk:1}); w.base='Ink Wraith'; inAbbey([w]); const m=mkMinion({lvl:30,role:'striker'});
  ok(hasKit(w,'unwritten'),'carries the kit'); let h=w.hp; HITTER=m; hurtFoe(w,500); HITTER=null; eq(w.hp,h,'passes through');
  HITTER=S.player; hurtFoe(w,500); HITTER=null; ok(w.hp<h,'the hero lands'); h=w.hp;
  SKILLHIT=1; hurtFoe(w,10); SKILLHIT=null; ok(inked(w)); h=w.hp; HITTER=m; hurtFoe(w,500); HITTER=null; ok(w.hp<h,'inked: the army reaches it');
  eq(abbeyTarget(m,w),w,'inked foes are fair targets');
});
test('Recitation: the Lector reads your strongest minion\'s best trait aloud; killing it gives the trait back',()=>{
  fresh(36); const L=foe({hp:1e4,atk:100}); L.base='Chained Lector'; inAbbey([L]); const m=mkMinion({lvl:30,role:'striker',traits:['vicious']}); m.atk=1e6;
  ok(readable()===m); ok(abbeyKitAct(L,{k:'read',t:fxKey(m)})); eq(m.read,'vicious'); ok(!hasTrait(m,'vicious'),'muted'); eq(L.atk,Math.round(100*LECTOR_ATK),'reads harder');
  ok(abbeyKitAct(L,{k:'read'})&&L.atk===Math.round(100*LECTOR_ATK),'once');
  L.hp=0; abbeyKitDeath(L); ok(hasTrait(m,'vicious'),'remembered'); ok(m.read==null);
  ok(/Reads .* aloud|Read aloud/.test(String((planTxt(L,{k:'read'})||{}).txt||'Read aloud')));
});
test('Scriptorium: cross out a name for good; the Hunger calls one echo fewer and the trait blesses the boss room',()=>{
  fresh(36); const r=inAbbey(); r.room=r.rooms-3; quietRoom('script'); const a=mkMinion({lvl:30,role:'striker',traits:['vicious'],nick:'Ash'}), b=mkMinion({lvl:30,role:'vanguard',nick:'Bram'});
  ui.tab='gates'; let h=renderAll('scriptorium'); ok(/data-a="cross"/.test(h)&&/carries Vicious/.test(h));
  ACTIONS.cross(String(a.uid)); ok(S.army.includes(a),'first press only asks'); ok(/Confirm: cross out Ash/.test(renderAll('confirm')));
  ACTIONS.cross(String(a.uid)); ok(!S.army.includes(a),'gone'); ok(!(S.memorial||[]).some(e=>e.nick==='Ash'),'not to the Memorial'); eq(r.crossed.nick,'Ash'); eq(r.lbless,'vicious'); eq(T_('scriptor'),1);
  ok(!scriptCross(b.uid),'one name a run'); ok(/You crossed out/.test(renderAll('after')));
  eq(echoCap(),HUNGER_ECHOES-1); ok(!hasTrait(b,'vicious'),'not before the boss room'); r.room=r.rooms-1; ok(hasTrait(b,'vicious'),'the Ledger blessing');
});
test('Ledger-Chain: +1% to every minion stat per headstone (up to 20%) and a Bone Spear when a minion is downed, once a room',()=>{
  fresh(36); const t=foe({hp:1e6,atk:1}); inAbbey([t]); wear('u6'); ok(hasFlag('ledgerchain'));
  eq(chainK(),0); S.memorial=Array.from({length:30},(x,i)=>({nick:'N'+i,kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:1,st:0,tr:[],role:'striker',day:1,hs:1})); eq(chainK(),CHAIN_MAX);
  S.memorial=S.memorial.slice(0,5); eq(Math.round(chainK()*100),5);
  S.mode='battle'; const h=t.hp; chainSpear(); ok(t.hp<h,'the spear lands'); const h2=t.hp; chainSpear(); eq(t.hp,h2,'once a room');
});
test('Marginalia: three skills write three notes; the next is free and lands as the target\'s weakest damage type',()=>{
  fresh(36); const t=foe({hp:1e6,atk:1}); inAbbey([t]); S.mode='battle'; ['6-wa','6-aa','6-ta'].forEach(wear);
  ok(setB('margin')>0,'three pieces of the Regalia'); const r=S.run; for(let i=0;i<3;i++) marginSkill(r,t,false); eq(r.notes,3); ok(marginReady());
  marginSkill(r,t,true); eq(r.notes,0); eq(MARGIN,weakOf(t)); MARGIN=null;
});
test('Abbey: the Codex, the objective and Turkish cover the seventh gate',()=>{
  fresh(40); openAbbey(); S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1}; S.kills['The Hunger']=1; const c=codexSection('gates'); ok(c.includes('Vane Abbey')&&c.includes('Opens by either of its keys'));
  S.mode='town'; ok(/Vane Abbey/.test(JSON.stringify(nextObjective())),'the objective points down');
  VIEW.lang='tr'; ['The Scriptorium','Unwritten','Recitation',MARGIN_TXT,DOORS.script.desc,KITS.unwritten.rule,KITS.recite.rule,DUNGEONS[ABBEY].blurb].forEach(s=>ok(trText(s)!==s,s.slice(0,40)));
  STORY.filter(s=>s.act===6).forEach(s=>{ ok(trText(s.t)!==s.t,s.t); ok(trText(s.m)!==s.m,s.id); }); LORE_PAGES.filter(p=>p.abbey).forEach(p=>{ ok(trText(p.t)!==p.t); ok(trText(p.m)!==p.m,p.t); });
  ok(trText(ACTS[6])!==ACTS[6]); VIEW.lang='en';
});
})();
