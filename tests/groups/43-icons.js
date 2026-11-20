// Icons tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Icons: creatures show a role badge (bosses too), you do not; set gear shows its gate letter, uniques do not',()=>{
  for(const r of Object.keys(ROLES)){ const h=ico('Tunnel Rat',0,{role:r}); ok(h.includes('rb rb-'+r),r+' badge'); }
  ok(!ico('Necromancer',0,{role:'striker'}).includes('class="rb'),'no badge on you'); ok(!ico('Tunnel Rat',0,{}).includes('class="rb'),'no role, no badge');
  const g=iico(ITEM['3-wa']); ok(/class="ico t\d s3"/.test(g)&&/class="rb gl r3">B</.test(g));
  const u=Object.values(ITEM).find(d=>d.uq); ok(!iico(u).includes('rb gl')); const tw=Object.values(ITEM).find(d=>d.tower); ok(!tw||!iico(tw).includes('rb gl'));
  arena([foe({role:'mender'})]); mkMinion({role:'reaper'}); const h=renderAll('badges'); ok(h.includes('rb rb-mender')&&h.includes('rb rb-reaper'));
});
test('Icons: every set piece and unique has its own painted shape; the old shared glyphs stay as fallbacks',()=>{
  const generic=KINDS.map(k=>'i_'+k), seen={};
  generic.forEach(k=>ok(IC[k]&&IC[k].length>100,'fallback '+k));
  Object.values(ITEM).forEach(d=>{ const g=iglyph(d); ok(IC[g]&&IC[g].length>150,d.name+' painted'); ok(!generic.includes(g),d.name+' has its own shape');
    ok(!seen[g],d.name+' shares '+g+' with '+seen[g]); seen[g]=d.name; ok(iico(d).includes(IC[g]),d.name+' drawn'); });
  eq(iglyph({id:'u1',kind:'u',glyph:'i_wa'}),'i_wa','an old shared glyph still draws');
  eq(iglyph({id:'zz',kind:'wa'}),'i_wa','unknown pieces fall back to their kind');
  ok(iico(ITEM['0-ab']).includes('mt-fur')&&iico(ITEM['1-wa']).includes('mt-metal'),'gear has its own material');
  ok(iico(ITEM['u0']).includes('class="glint"')&&!iico(ITEM['0-wa']).includes('class="glint"'),'only Legendary and Unique gear glints');
});
test('Icons: every redrawn enemy still has a picture and no two gate or Tower icons are identical',()=>{
  const names=allNames(); names.forEach(n=>ok(IC[n]&&IC[n].length>200,n));
  const seen={}; names.forEach(n=>{ ok(!seen[IC[n]],n+' looks exactly like '+seen[IC[n]]); seen[IC[n]]=n; });
});

})();
