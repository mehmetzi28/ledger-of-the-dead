// Nemeses, R13 PR A (src/game-nemesis.js): birth, growth, the sigil door, the arch-nemesis and the Avenged body.
(function(){
const {test,ok,eq,near,fresh,foe,arena,mkMinion,renderAll,cdx}=window.LOTD_T;
const born=(o)=>{ fresh(30); S.nem=[]; const r=arena([foe({hp:1e6,base:'Tunnel Rat'})]); const e=r.enemies[0]; const m=mkMinion(Object.assign({lvl:20,stage:1},o||{})); m.traits=['venom']; m.hp=0; nemDown(e,m); nemMake(e,r,e.nv); return {r,e,m,n:S.nem[0]}; };
test('Nemeses: a foe that downs a Greater minion and still stands may live on, with a name, its victim and a trait',()=>{
  fresh(30); S.nem=[]; const r=arena([foe({hp:1e6})]); const e=r.enemies[0]; const m=mkMinion({lvl:20,stage:0}); m.hp=0; nemDown(e,m); ok(!e.nv,'a plain minion makes no grudge');
  const g=mkMinion({lvl:20,stage:2}); g.hp=0; nemDown(e,g); eq(e.nv.length,1); eq(e.nv[0].n,g.nick); eq(e.nv[0].s,2);
  S.run.trial=1; const t=foe({hp:9}); nemDown(t,g); ok(!t.nv,'not in a Trial'); delete S.run.trial;
  // births roll on dayHash: over many foes some are born, never more than NEM_MAX, and no Math.random is drawn
  const fs=[]; for(let i=0;i<40;i++){ const x=foe({hp:1e6}); x.nv=[{n:'V'+i,s:1,t:'venom'}]; fs.push(x); } r.enemies=fs; const R0=Math.random; let drawn=0; Math.random=()=>{ drawn++; return R0(); };
  try{ nemBirth(r); } finally { Math.random=R0; } ok(S.nem.length>0&&S.nem.length<=NEM_MAX,'born, capped at '+NEM_MAX+': '+S.nem.length); eq(drawn,0,'no Math.random');
  ok(fs.every(x=>!x.nv),'every candidate rolled once');
  const b=born({stage:3}); const n=b.n; ok(NEM_NAMES[0].includes(n.name),'a name from its gate'); eq(n.base,'Tunnel Rat'); eq(n.k,1); eq(n.v[0].n,b.m.nick); eq(n.tr,'venom'); eq(n.born,S.day); eq(nemUp(n),1);
  ok(nemTitle(n).includes('who gnawed down '+b.m.nick)); ok(S.notices.some(x=>x.m&&x.m.includes(n.name)||String(x).includes(n.name)),'a notice names it');
});
test('Nemeses: the cap pushes out the weakest; weekly growth; the arch-nemesis at three victims',()=>{
  const {n}=born(); n.wk=5; for(let i=0;i<3;i++){ const r=S.run, e=foe({hp:9}); e.nv=[{n:'X'+i,s:1,t:''}]; nemMake(e,r,e.nv); }
  eq(S.nem.length,NEM_MAX); ok(S.nem.includes(n),'the strongest stays');
  const w0=n.wk; S.day=8; nemDawn(); eq(n.wk,w0+1,'grows on the first dawn of a week'); S.day=9; nemDawn(); eq(n.wk,w0+1,'once a week');
  const {e,n:m}=born(); e.nem=m.id; const v1=mkMinion({lvl:20}), v2=mkMinion({lvl:20}); v1.hp=v2.hp=0; nemDown(e,v1); ok(!m.arch); nemDown(e,v2); eq(m.k,3); ok(m.arch&&e.arch,'an arch-nemesis'); eq(m.v.length,3);
});
test('Nemeses: the sigil door, the foe behind it, and the arch-nemesis\'s second wind',()=>{
  const {n}=born(); S.mode='town'; S.run=null; S.watches=WATCHES; startRun(0); const r=S.run; r.room=0; let seen=false; for(let i=0;i<5;i++){ const d=rollDoors(r); if(d.includes('nem')) seen=true; } ok(seen,'the sigil door shows in its gate');
  r.doors=rollDoors(r); preRooms(r); const ne=r.pre.nem.find(x=>x.nem===n.id); ok(ne,'the nemesis waits behind it'); eq(ne.name,n.name); ok(ne.elite); ok(ne.traits.includes('venom'),'it carries the stolen trait');
  S.mode='raise'; ok(descend('nem'),'through the sigil door'); ok(r.nemU,'once a run'); ok(!rollDoors(r).includes('nem'));
  S.run.wk=1; ok(!nemDoor(S.run,['fight']).includes('nem'),'not in the weekly dive'); delete S.run.wk;
  n.k=3; n.arch=1; const f=nemFoe(n,0,10); eq(f.lvl,10+nemUp(n)); ok(f.kit2&&f.kit2!==KIT_OF['Tunnel Rat'],'a second kit at two victims'); ok(f.arch);
  arena([f]); hurtFoe(f,Math.round(f.maxHp*.6)); ok(f.archU,'the second wind'); ok(f.hp>f.maxHp*.4,'healed'); ok(!f.traits.length,'it ate the stolen trait'); const h=f.hp; hurtFoe(f,1); ok(f.hp<h,'only once');
});
test('Nemeses: killing one avenges its victims: trophies, the boss table, an Avenged body with the stolen trait, the headstones',()=>{
  const {n,m}=born(); memorialize(m,{g:0}); const r=arena([nemFoe(n,0,8)]); const e=r.enemies[0]; r.troph={}; r.loot=[];
  e.hp=0; checkDeaths(); eq(S.nem.length,0,'gone'); eq(T_('nemSlain'),1,'tally '+JSON.stringify(S.ti)); ok((r.troph['Tunnel Rat']||0)>=NEM_TRO,'trophies'); ok(r.loot.length>=1,'the boss table');
  const c=r.corpses.find(x=>x.base==='Tunnel Rat'); ok(c&&c.avg==='venom','an Avenged body'); eq(nemRaise(c),NEM_RAISE); eq(nemTrait(c),'venom');
  eq(S.memorial[0].av,S.day,'the headstone says when');
  S.army=[]; S.mode='raise'; const R0=Math.random; Math.random=()=>0; try{ S.player.mana=1e6; tryRaise(c.id); } finally { Math.random=R0; }
  const risen=S.army.find(x=>x.kind==='Tunnel Rat'&&x.traits[0]==='venom'); ok(risen,'the stolen trait comes home'); eq(T_('avengedRaised'),1);
  S.ti.nemSlain=1; checkTitles(); ok(S.ti.got.nm_1);
});
test('Nemeses: save round trip, repair, the Gates strip, the door, the Memorial, the Codex and Turkish',()=>{
  const {n}=born(); n.arch=1; returnTown(); save(); const a=JSON.stringify(S); S=null; loadGame(); eq(JSON.stringify(S),a,'a round trip keeps it');
  const g=JSON.parse(a); g.nem.push({name:'Bad',g:99,base:'x',v:[]}); g.nem[0].tr='nope'; nemFix(g); eq(g.nem.length,1); eq(g.nem[0].tr,''); const h={}; nemFix(h); ok(!('nem' in h),'no field the save lacks');
  S.mode='town'; ui.tab='gates'; const t=renderAll('gates'); ok(t.includes('Nemeses')&&t.includes(S.nem[0].name),'the Gates strip');
  S.watches=WATCHES; startRun(0); const r=S.run; r.doors=['fight','nem']; preRooms(r); S.mode='raise'; r.corpses=[]; const d=doorsHTML(); ok(d.includes('A sigil-marked door')&&d.includes(S.nem[0].name),'the door names it');
  S.mode='town'; S.run=null; S.memorial=[{nick:'Ash',kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:3,st:1,tr:[],role:'striker',day:2,av:9}]; ok(memorialHTML().includes('Avenged on day 9'));
  ok(cdx('nemeses').includes('Arch-nemesis')&&cdx('nemeses').includes(S.nem[0].name),'the Codex page');
  VIEW.lang='tr'; [nemTitle(S.nem[0]),'Avenged on day 9','A sigil-marked door',DOORS.nem.desc,'Old Grudge'].forEach(s=>ok(trText(s)!==s,s)); VIEW.lang='en';
});
})();
