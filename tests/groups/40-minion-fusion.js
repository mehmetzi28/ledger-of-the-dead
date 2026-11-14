// Minion Fusion tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Fusion: two minions of one role become one stronger minion',()=>{
  setLvl(20); const a=mkMinion({role:'striker',lvl:10,traits:['thick']}), b=mkMinion({role:'striker',lvl:12,traits:['vicious','thick'],stage:1}); S.gold=1e4;
  const c=fuseCost(a,b); eq(c,(10+12)*60); const k=fuse(a.uid,b.uid); ok(k===b,'the stronger survives'); eq(S.army.length,1); eq(k.lvl,12+FUSE_LV); eq(k.traits.join(),'vicious,thick'); eq(S.gold,1e4-c); eq(k.hp,k.maxHp); eq(T_('fused'),1); invariants('fused');
});
test('Fusion: same role, in town, paid for; levels and traits are capped and gear comes back',()=>{
  setLvl(10); S.gold=1e5; const a=mkMinion({role:'striker',lvl:12,traits:['thick','vicious','leech']}), v=mkMinion({role:'vanguard',lvl:5});
  eq(fuse(a.uid,v.uid),null,'different roles'); eq(fuse(a.uid,a.uid),null,'itself');
  const b=mkMinion({role:'striker',lvl:11,armed:true,eq:{weapon:{u:++S.uid,id:'1-wa'},armor:null,relic:null},traits:['stalwart','gravebound','venom']});
  S.gold=0; eq(fuse(a.uid,b.uid),null,'no gold'); S.gold=1e5; arena([foe()]); eq(fuse(a.uid,b.uid),null,'not in battle'); flee();
  const k=fuse(a.uid,b.uid); ok(k===a); eq(k.lvl,12,'never past your level + 2'); eq(k.traits.length,FUSE_TRAITS); ok(S.inv.some(it=>it.id==='1-wa'),'gear back in the bag');
});
test('Fusion: a minion takes part in at most two fusions',()=>{
  setLvl(40); S.gold=1e6; const a=mkMinion({role:'striker',lvl:20}); for(let i=0;i<FUSE_MAX;i++){ const b=mkMinion({role:'striker',lvl:10}); ok(fuse(a.uid,b.uid)===a,'fusion '+(i+1)); }
  const c=mkMinion({role:'striker',lvl:10}); ok(!canFuse(a,c)); eq(fuse(a.uid,c.uid),null); eq(a.fused,FUSE_MAX);
  const d=mkMinion({role:'striker',lvl:10}), e=mkMinion({role:'striker',lvl:9}); e.fused=1; ok(fuse(d.uid,e.uid)); eq(d.fused,2,'fusions carry over'); ok(!canFuse(d,c));
});
test('Fusion: the Flesh Pit on the Town tab asks before it consumes a minion',()=>{
  setLvl(20); S.gold=1e4; const a=mkMinion({role:'mender',lvl:8}), b=mkMinion({role:'mender',lvl:9}); mkMinion({role:'reaper'}); ui.tab='town';
  let h=renderAll('pit'); ok(new RegExp('data-a="fusepick" data-k="'+a.uid+'"').test(h)); ACTIONS.fusepick(String(a.uid)); h=renderAll('picked'); ok(new RegExp('data-a="fuse" data-k="'+b.uid+'"').test(h));
  ACTIONS.fuse(String(b.uid)); eq(S.army.length,3,'asks first'); ok(/Confirm/.test(renderAll('confirm'))); ACTIONS.fuse(String(b.uid)); eq(S.army.length,2); ok(ui.msg&&ui.msg.c==='ok'); eq(ui.fuse,null);
});

})();
