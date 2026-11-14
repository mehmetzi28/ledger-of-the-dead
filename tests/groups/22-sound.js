// Sound tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Sound: effects never throw, even without Web Audio, and stay quiet when off',()=>{
  if(!NODE) return; const was=SFX.on; SFX.on=true; try{ ['strike','skill','hurt','heal','kill','raise','fail','coin','level','warn','boss','death','nope'].forEach(k=>sfx(k)); }finally{ SFX.on=was; }
  let made=0; window.AudioContext=function(){ made++; throw new Error('no audio'); }; SFX.on=false; sfx('coin'); eq(made,0); SFX.on=true; SFX.last={}; sfx('coin'); eq(made,1); SFX.on=was; delete window.AudioContext; SFX.ctx=null;
});

})();
