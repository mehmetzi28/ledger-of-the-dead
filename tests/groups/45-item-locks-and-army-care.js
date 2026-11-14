// Item Locks And Army Care tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Locks: a locked piece is never sold, salvaged, discarded or swept up as junk, and the lock survives a save',()=>{
  const a=give('0-wa'), b=give('1-ta'); ok(lockItem(a.u)); ok(a.lk);
  eq(sellItem(a.u),0); eq(salvage(a.u),0); discard(a.u); ok(S.inv.includes(a),'still there');
  const r=sellJunk(); eq(r.n,1,'only the unlocked junk'); ok(S.inv.includes(a)&&!S.inv.includes(b));
  const n=normalizeSave(JSON.parse(JSON.stringify(S))); ok(n.inv.find(x=>x.u===a.u).lk);
  ok(lockItem(a.u)); eq(a.lk,undefined,'unlocking removes the mark'); ok(sellItem(a.u)>0);
  const c=give('0-wa'); c.lk='yes'; eq(normalizeSave(JSON.parse(JSON.stringify(S))).inv.find(x=>x.u===c.u).lk,undefined,'only a real lock loads');
});
test('Locks: the Gear tab offers Lock, hides Salvage and Discard on locked pieces, and the market marks them',()=>{
  const a=give('2-wa'); ui.tab='gear'; let h=renderAll('gear'); ok(new RegExp('data-a="lock" data-k="'+a.u+'"').test(h));
  ACTIONS.lock(String(a.u)); h=renderAll('locked'); ok(/Locked<\/button>/.test(h)&&!new RegExp('data-a="salvage" data-k="'+a.u+'"').test(h)&&!new RegExp('data-a="discard" data-k="'+a.u+'"').test(h));
  ui.tab='market'; ui.mk='sell'; ok(/u-tag">Locked</.test(renderAll('market')));
});
test('Army: rename a minion (only letters, digits, spaces, apostrophes and dashes), and saves clean names too',()=>{
  const m=mkMinion({}); ok(renameMinion(m.uid,'  Old   Bones ')); eq(m.nick,'Old Bones');
  ok(renameMinion(m.uid,'<img src=x onerror=alert(1)>Rex')); ok(!/[<>="]/.test(m.nick),m.nick);
  ok(!renameMinion(m.uid,'<<>>'),'nothing left'); ok(renameMinion(m.uid,'A'.repeat(40))); eq(m.nick.length,NICK_MAX);
  arena([foe()]); ok(!renameMinion(m.uid,'Nope'),'not in battle'); flee();
  const g=JSON.parse(JSON.stringify(S)); g.army[0].nick='<b>x</b>'; eq(normalizeSave(g).army[0].nick,'bxb');
  ui.tab='gates'; ACTIONS.renameo(String(m.uid)); ok(/id="rn"/.test(renderAll('rename'))); ui.rn="Grim O'Hare-Ash"; ACTIONS.rename(String(m.uid)); eq(m.nick,"Grim O'Hare-Ash"); eq(ui.rename,null);
});
test('Army: re-order by strength, role or level, and open a minion\'s details',()=>{
  setLvl(30); const a=mkMinion({role:'mender',lvl:5}), b=mkMinion({role:'vanguard',lvl:20}), c=mkMinion({role:'striker',lvl:12,traits:['venom']});
  ok(sortArmy('level')); eq(S.army.map(m=>m.lvl).join(),'20,12,5'); ok(sortArmy('role')); eq(S.army.map(m=>m.role).join(),'vanguard,striker,mender');
  ok(sortArmy('power')); ok(mPower(S.army[0])>=mPower(S.army[1])); ok(!sortArmy('x'));
  ui.tab='gates'; let h=renderAll('army'); ok(/data-a="asort" data-k="role"/.test(h)); ACTIONS.mdet(String(c.uid)); h=renderAll('details'); ok(/class="m-det"/.test(h)&&h.includes(TRAITS.venom.desc)&&/Raised at/.test(h));
});

})();
