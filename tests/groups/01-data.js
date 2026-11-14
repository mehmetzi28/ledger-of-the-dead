// Data tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Data: every gate has 7 enemies with known roles and a reaper boss',()=>{
  eq(DUNGEONS.length,6);
  DUNGEONS.forEach((D,i)=>{ eq(D.mobs.length,7,D.name); D.mobs.forEach(m=>{ ok(ROLES[m[1]],m[0]+' role'); ok(m[2]>0&&m[3]>0,m[0]+' factors'); });
    eq(D.mobs.filter(m=>m[1]==='mender').length,2,D.name+' menders'); eq(D.boss[1],'reaper',D.name+' boss role'); ok(ARMED.has(D.mobs[6][0]),D.name+' gear-bearer'); });
});
test('Data: enemy names are unique across gates and the Tower',()=>{ const a=allNames(); eq(new Set(a).size,a.length); });
test('Data: 60 items, each with a slot, tier and real stats',()=>{
  eq(Object.keys(ITEM).length,60);
  for(const d of Object.values(ITEM)){ ok(SLOTS[d.slot],d.id+' slot'); ok(d.tier>=0&&d.tier<TIERS.length,d.id+' tier'); ok(d.name&&!BAD_TEXT.test(d.name),d.id+' name');
    for(const k in d.stats){ ok(STATL[k],d.id+' unknown stat '+k); finite(d.stats[k],d.id+'.'+k); ok(d.stats[k]>=0,d.id+'.'+k+' negative'); }
    ok(Object.values(d.stats).some(v=>v>0),d.id+' has no stats'); if(d.flag) ok(FLAGS[d.flag],d.id+' flag text'); }
});
test('Data: item stats grow with each gate set',()=>{ for(const k of KINDS) for(let s=1;s<6;s++){ const a=ITEM[(s-1)+'-'+k].stats, b=ITEM[s+'-'+k].stats; const sum=o=>Object.values(o).reduce((x,y)=>x+y,0); ok(sum(b)>sum(a),k+' set '+s); } });
test('Data: every gate enemy has a signature item from its own gate',()=>{
  DUNGEONS.forEach((D,i)=>D.mobs.forEach(m=>{ const id=SIG[m[0]]; ok(id&&ITEM[id],m[0]+' has no signature'); eq(ITEM[id].set,i,m[0]+' signature set'); }));
});
test('Data: every enemy has a trophy, and boss hearts are worth more',()=>{
  DUNGEONS.forEach(D=>{ D.mobs.forEach(m=>ok(TROPHY[m[0]],m[0])); ok(TROPHY['b:'+D.boss[0]],D.boss[0]); ok(TROPHY['b:'+D.boss[0]].value>TROPHY[D.mobs[0][0]].value); });
  TW_MOBS.forEach(m=>ok(TROPHY['t:'+m[0]],m[0])); TW_BOSS.forEach(n=>ok(TROPHY['b:'+n],n));
  for(const k in TROPHY){ ok(TROPHY[k].value>0,k); ok(!BAD_TEXT.test(TROPHY[k].name),k); }
});
test('Data: every enemy, item and the player has an icon',()=>{
  const miss=allNames().filter(n=>!IC[n]).concat(Object.values(ITEM).map(d=>d.glyph||('i_'+d.kind)).filter(k=>!IC[k]));
  ['Necromancer','?','_'].forEach(k=>{ if(!IC[k]) miss.push(k); });
  eq(miss.length,0,'missing icons: '+miss.join(', '));
});
test('Data: titles, skills, tips and boss moves have unique ids and readable text',()=>{
  const ids=a=>a.map(x=>x.id); const uniq=(a,n)=>eq(new Set(a).size,a.length,n+' ids');
  uniq(ids(TITLES),'title'); uniq(ids(SKILLS),'skill'); uniq(ids(TIPS),'tip');
  eq(SKILLS.length,18); SKILLS.forEach(s=>{ for(let r=1;r<=SK_MAX;r++) ok(!BAD_TEXT.test(s.desc(r)),s.id+' rank '+r); if(s.type==='active') ok(s.cost>0&&s.cd>0,s.id+' cost/cd'); });
  GATE_ABIL.forEach(a=>ok(BOSS_ABIL[a],a)); TITLES.forEach(t=>ok(t.name&&t.req&&!BAD_TEXT.test(t.req),t.id));
});
test('Data: tier weights add up to 100',()=>{ TIER_W.forEach((r,i)=>eq(r.reduce((a,b)=>a+b,0),100,'row '+i)); });
test('Data: difficulty tables have one entry per gate',()=>{ eq(DIFF.gate.length,6); eq(DIFF.armor.length,6); eq(DIFF.foeAtk.length,6); eq(SAFE.length,6); DIFF.armor.forEach(a=>ok(a>=0&&a<1)); for(let i=1;i<6;i++) ok(SAFE[i]>SAFE[i-1]&&RK[i].unlock>RK[i-1].unlock); });

})();
