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
test('Icons: every redrawn enemy still has a picture and no two gate or Tower icons are identical',()=>{
  const names=allNames(); names.forEach(n=>ok(IC[n]&&IC[n].length>200,n));
  const seen={}; names.forEach(n=>{ ok(!seen[IC[n]],n+' looks exactly like '+seen[IC[n]]); seen[IC[n]]=n; });
});

})();
