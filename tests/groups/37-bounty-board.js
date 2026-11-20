// Bounty Board tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Bounties: three a day, all different, new every dawn, counted from when the board goes up',()=>{
  S.kills={'Tunnel Rat':50}; const L=bounties(); eq(L.length,BOUNTY_N); eq(new Set(L.map(b=>b.id)).size,BOUNTY_N); L.forEach(b=>{ ok(BOUNTIES[b.id]); eq(bountyGot(b),0); ok(!b.claimed); });
  ok(bounties()===L,'same board all day'); endDay(); ok(bounties()!==L,'a new board at dawn'); eq(S.bounty.day,S.day);
});
test('Bounties: gold and bone dust grow with level and the deepest open gate; day-1 pay unchanged',()=>{
  eq(BOUNTY_GATE,.3); setLvl(1); eq(topGate(),0); eq(bountyReward('gold').g,90,'day 1 as before'); eq(bountyReward('dust').dust,4); eq(bountyReward('salt').salt,1);
  setLvl(RK[5].unlock); eq(topGate(),5); const lv=S.player.lvl; eq(bountyReward('gold').g,Math.round((60+lv*30)*2.5)); eq(bountyReward('dust').dust,Math.round((4+Math.floor(lv/4))*2.5));
  ok(/grow with your level and your deepest open gate/.test(cdx('bounties')),'Codex');
});
test('Bounties: deeds count toward contracts, and a finished one pays once, in town',()=>{
  const L=board([{id:'kills',rw:{g:100}},{id:'elites',rw:{g:5,salt:1}},{id:'rooms',rw:{g:0,dust:7}}]);
  eq(claimBounty(0),null,'not done'); S.kills['Tunnel Rat']=(S.kills['Tunnel Rat']||0)+L[0].n; ok(bountyDone(L[0]));
  arena([foe()]); eq(claimBounty(0),null,'not in battle'); flee(); let g=S.gold; ok(claimBounty(0)); eq(S.gold,g+100); eq(claimBounty(0),null,'only once');
  tally('elites',L[1].n); S.salts=SALT_MAX; g=S.gold; ok(/pouch is full/.test(claimBounty(1))); eq(S.gold,g+5+saltPrice());
  wonRoom(0); eq(T_('rooms')-L[2].base,1,'a won room counts'); returnTown(); tally('rooms',L[2].n-1); ok(claimBounty(2)); eq(S.dust,7);
});
test('Bounties: arches, floors and bosses are counted where they happen',()=>{
  const a=T_('archs'), f=T_('floors'); const r=wonRoom(0); r.doors=['fight','elite']; descend('elite'); eq(T_('archs'),a+1);
  returnTown(); setLvl(20); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); startTower(1); S.run.enemies=[foe({hp:0,dead:true})]; roomWon(); eq(T_('floors'),f+1);
});
test('Bounties: gear needs bag room; conditional contracts only appear when they make sense',()=>{
  const L=board([{id:'kills',rw:{gear:1}}]); L[0].base=totalKills()-L[0].n;
  while(S.inv.length<bagMax()) give('0-ta'); eq(claimBounty(0),null,'bag full'); S.inv=[]; ok(claimBounty(0)); eq(S.inv.length,1); ok(S.inv[0].ro&&S.inv[0].ro.length>=1); eq(ITEM[S.inv[0].id].set,topGate());
  for(let i=0;i<60;i++){ seed(i+1); makeBounties(); S.bounty.list.forEach(b=>ok(!['cursed','flawless','orders','floors','poison'].includes(b.id),b.id+' offered too early')); }
});
test('Bounties: the board shows in the side panel and survives a save',()=>{
  setLvl(6); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1}}); const L=board([{id:'kills',rw:{g:50}},{id:'raise',rw:{dust:3}},{id:'bosses',rw:{gear:1}}]); L[0].base-=L[0].n;
  let h=renderAll('board'); ok(/Bounty board/.test(h)&&new RegExp('Defeat '+BOUNTIES.kills.n+' foes<').test(h)); ok(/data-a="claimb" data-k="0"/.test(h)); ok(!/data-k="1"[^>]*>Claim/.test(h));
  save(); const a=JSON.stringify(S); S=null; loadGame(); eq(JSON.stringify(S),a);
  ACTIONS.claimb('0'); ok(S.notices.some(n=>/Bounty claimed: 50 gold/.test(n.m))); ok(/Claimed\./.test(renderAll('claimed')));
  eq(normalizeSave({v:2,player:{lvl:1},bounty:{day:1,list:[{id:'fake',n:1,base:0,rw:{},claimed:false}]}}).bounty,null);
});

})();
