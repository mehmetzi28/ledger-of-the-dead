// Feel tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Feel: big moments get a banner once (level up, boss phase, broken move, evolution, a raised elite)',()=>{
  MOMENTS.length=0; addXp(need(1)); ok(MOMENTS.some(x=>/Level 2/.test(x.t)&&x.c==='gold')); let h=renderAll('banner'); ok(/class="moments"/.test(h)&&/Level 2/.test(h)); eq(MOMENTS.length,0,'cleared after showing'); ok(!/class="moments"/.test(renderAll('gone')));
  const b=bossFight(1); b.hp=b.maxHp/2; checkPhase(); ok(MOMENTS.some(x=>/second phase/.test(x.t)&&x.c==='bad')); b.charging=true; b.move='sunder'; breakCharge(b,'Test.'); ok(MOMENTS.some(x=>/Sundering Blow broken/.test(x.t)));
  flee(); const m=mkMinion({lvl:5}); m.lvl=10; checkEvolve(m); ok(MOMENTS.some(x=>/evolves/.test(x.t))); ok(MOMENTS.length<=3,'at most three at once');
  MOMENTS.length=0; const c=corpse({elite:true}); raiseScene([c],20); fix(0); tryRaise(c.id); ok(MOMENTS.some(x=>/an elite serves you/.test(x.t)));
});
test('Feel: ] and [ change target (Tab is left to the browser), Z X C V give orders',()=>{
  if(!NODE) return; const key=(k,o)=>window.__listeners.keydown[0](Object.assign({key:k,preventDefault(){},target:{}},o||{}));
  const a=foe(), b=foe(), c=foe(); arena([a,b,c]); eq(S.run.target,a.id); key(']'); eq(S.run.target,b.id); key(']'); eq(S.run.target,c.id); key(']'); eq(S.run.target,a.id); key('['); eq(S.run.target,c.id);
  let prevented=false; window.__listeners.keydown[0]({key:'Tab',preventDefault(){ prevented=true; },target:{}}); ok(!prevented,'Tab is not taken over'); eq(S.run.target,c.id);
  mkMinion({role:'vanguard'}); mkMinion({role:'striker'}); key('z'); eq(S.run.taunt,2); ok(S.run.cmd.vanguard); key('X'); ok(S.run.focus); eq(S.run.turn,1,'orders do not use the turn');
  ok(/Taunt &middot; given<kbd>Z<\/kbd>/.test(renderAll('keys')));
  S.mode='town'; S.run=null; ui.rename=null; const m=mkMinion({}); ui.rename=m.uid; ui.rn='Keyed'; key('Enter',{target:{id:'rn'}}); eq(m.nick,'Keyed','Enter saves a new name');
});
test('Feel: the Ember Stalker and Tallow Chandler were redrawn',()=>{ ok(IC['Ember Stalker'].includes('M21 33C17 28 10 27 6 29')); ok(IC['Tallow Chandler'].includes('M37 15V31')); });

})();
