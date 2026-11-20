// The hub pass: the Next objective callout (src/ui-codex.js), no dawn penalty for the daily quest, features that open with gate clears
// (src/game-phases-town.js townOpen/faithOpen/towerOpen, RIVAL_AT) and the banked bounty board.
(function(){
const {test,ok,eq,fresh,setLvl,renderAll,cdx,mkMinion}=window.LOTD_T;
const clears=n=>{ S.ti=S.ti||{}; S.ti.clr={}; for(let i=0;i<n;i++) S.ti.clr[i]=1; };

test('Hub: the Next objective points at the first uncleared gate, or at the best way to grow strong enough for it',()=>{
  S.mode='town'; let n=nextObjective(); eq(n.k,'gates|open'); ok(n.t.startsWith('Clear the '+DUNGEONS[0].name+' (recommended Lv '),n.t);
  const h=renderAll('objective'); ok(/class="next-obj" data-a="goal" data-k="gates\|open"/.test(h)&&/Next objective/.test(h),'the callout');
  ok(h.indexOf('next-obj')<h.indexOf('goal-list')||!/goal-list/.test(h),'on top of the other goals');
  clears(1); const rec=Math.max(RK[1].unlock,tierRec(1,0)); setLvl(rec); n=nextObjective(); ok(n.t.includes(DUNGEONS[1].name)&&n.t.includes('Lv '+rec),n.t);
  setLvl(tierRec(0,1)); ok(tierRec(0,1)<rec); n=nextObjective(); ok(n.t.startsWith('Grow stronger for the '+DUNGEONS[1].name)&&n.t.endsWith('take on the '+DUNGEONS[0].name+' on Hard.'),n.t);
  S.heatMax={0:3}; n=nextObjective(); ok(/raise more of the dead/.test(n.t),'room in the army: raise');
  while(armyUsed()<slots()) mkMinion({}); n=nextObjective(); ok(/clear the gates you know again/.test(n.t),n.t);
  clears(5); setLvl(TW.unlock); S.heatMax={0:3,1:3,2:3,3:3,4:3}; n=nextObjective(); eq(n.k,'tower','under level: the Tower'); ACTIONS.goal(n.k); eq(ui.tab,'tower','the button goes there');
});

test('Hub: after the Throne of Ash the objective is its next difficulty, then the Rift, then the Tower',()=>{
  S.mode='town'; clears(6); setLvl(60); S.heatMax={5:0}; let n=nextObjective(); ok(n.t.startsWith('Break the '+DUNGEONS[5].name+' on Hard'),n.t);
  S.heatMax={5:3}; setLvl(RIFT_LV); n=nextObjective(); eq(n.k,'gates|rift'); ok(n.t.includes('depth '+(riftBest()+1)));
  setLvl(30); n=nextObjective(); eq(n.k,'tower'); ok(n.t.includes('The Rift opens at level '+RIFT_LV),n.t);
  S.mode='battle'; eq(nextObjective(),null,'town only');
});

test('Hub: the objective lines translate',()=>{
  VIEW.lang='tr';
  try{ ['Clear the Rat Warren (recommended Lv 3).','Grow stronger for the Sunken Crypt (recommended Lv 6): take on the Rat Warren on Hard.','Grow stronger for the Sunken Crypt (recommended Lv 6): climb the Hell Tower.',
      'Grow stronger for the Sunken Crypt (recommended Lv 6): raise more of the dead.','Break the Throne of Ash on Brutal (recommended Lv 40).','Reach depth 3 of the Rift.','Climb the Hell Tower: your best floor is 12. The Rift opens at level 40.','Next objective',
      'Unfinished at dawn, it simply lapses.','Defeat 50 foes','Raise 6 of the dead']
    .forEach(s=>{ const t=trText(s); ok(t!==s&&!/Grow stronger|take on|climb the|Reach depth|simply lapses/.test(t),'untranslated: '+s+' -> '+t); });
    ok(trText('Clear the Rat Warren (recommended Lv 3).').startsWith('Rat Warren'),'names stay English');
  } finally { VIEW.lang='en'; }
});

test('Hub: an unfinished daily quest costs nothing at dawn, and the Codex and help say so',()=>{
  S.ti={clr:{0:1,1:1,2:1}}; const P=S.player; P.xp=30; const hp=pMax(); endDay(); eq(P.xp,30); eq(pMax(),hp); ok(!S.notices.some(n=>n.c==='bad'));
  const c=cdx('basics'); ok(/simply lapses at dawn, at no cost/.test(c)&&!/dawn costs/.test(c)); ui.tab='help'; ok(/An unfinished quest costs nothing/.test(renderAll('help')));
});

test('Hub: the town opens after the 2nd clear, the shrine and the Tower after the 3rd, the rival after the 4th, whatever the level',()=>{
  setLvl(60); S.mode='town'; clears(1); ok(!townOpen()&&!faithOpen()&&!towerOpen()&&!rivalOpen()&&!siegeOpen(),'one clear');
  ui.tab='gates'; let h=renderAll('one clear'); ok(!/data-k="town"/.test(h)&&!/data-k="tower"/.test(h)&&!/Bounty board/.test(h),'no tabs, no board');
  clears(2); ok(townOpen()&&!faithOpen()&&!towerOpen()); h=renderAll('two'); ok(/data-k="town"/.test(h)&&/Bounty board/.test(h));
  clears(3); ok(faithOpen()&&towerOpen()&&!rivalOpen()); h=renderAll('three'); ok(/data-k="tower"/.test(h));
  const keys=[...h.matchAll(/aria-keyshortcuts="(\d)"/g)].map(m=>+m[1]); eq(keys.join(),keys.map((x,i)=>i+1).join(),'number keys run 1, 2, 3... over the shown tabs');
  clears(4); ok(rivalOpen()); setLvl(9); clears(3); ok(!towerOpen()&&faithOpen(),'the Tower keeps its level 10 rule, the shrine its level 8');
  setLvl(7); ok(!faithOpen()&&!swear('hon'));
});

test('Hub: a save that already used a feature keeps it',()=>{
  setLvl(30); S.mode='town'; clears(0);
  S.build={crypt:1}; ok(townOpen(),'buildings'); S.build={}; S.reserve=[mkMinion({})]; S.army=[]; ok(townOpen(),'a benched minion'); S.reserve=[];
  S.faith={id:'hon',day:1}; ok(faithOpen()&&townOpen(),'an oath'); delete S.faith;
  S.tower.best=3; ok(towerOpen(),'a Tower floor'); S.tower.best=0;
  clears(3); S.rival.met=1; ok(rivalOpen(),'a rival met under the old three-clear rule'); clears(2); ok(!rivalOpen());
  const g=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{build:{forge:2}})))); ok(!('open' in g)&&!('unlocked' in g),'nothing stored');
});

test('Hub: the story and tips announce the Tower and the shrine when they open',()=>{
  setLvl(TW.unlock); S.mode='town'; clears(2); S.story={intro:1}; loreCheck(); ok(!S.story.tower0); ok(!TIPS.find(t=>t.id==='tower').when());
  clears(3); loreCheck(); ok(S.story.tower0,'the Tower passage'); ok(TIPS.find(t=>t.id==='tower').when()&&TIPS.find(t=>t.id==='faith').when());
  ui.tab='help'; const h=renderAll('help'); ok(h.includes('Once '+OPEN_AT.tower+' gates are cleared, from level '+TW.unlock)&&h.includes('Clear '+OPEN_AT.town+' gates'));
  ok(cdx('tower').includes('Opens once '+OPEN_AT.tower+' gates are cleared')&&cdx('town').includes('open once '+OPEN_AT.town+' gates are cleared'));
});

test('Hub: the bounty board banks up to three, posts one each dawn while there is room, never expires',()=>{
  clears(2); S.mode='town'; const L=bounties(); eq(L.length,BOUNTY_N,'starts full');
  endDay(); const L2=bounties(); eq(L2.length,BOUNTY_N,'full: nothing new'); eq(L2.map(b=>b.id+b.base).join(),L.map(b=>b.id+b.base).join(),'kept as they were');
  L2[0].claimed=true; L2[1].claimed=true; eq(bounties().length,3,'claimed ones stay until dawn');
  endDay(); let L3=bounties(); eq(L3.length,2,'one left plus one new'); ok(L3.every(b=>!b.claimed)); eq(new Set(L3.map(b=>b.id)).size,2,'no two alike');
  L3.forEach(b=>b.claimed=true); endDay(); eq(bounties().length,1,'one a dawn, not a refill');
  S.bounty.list[0].claimed=true; S.day+=3; eq(bounties().length,3,'missed dawns each post one, up to three');
  ui.tab='gates'; ok(/a new one goes up each dawn while there is room/.test(renderAll('board')));
});

test('Hub: an old board from yesterday migrates: unclaimed contracts stay, claimed ones leave, one new is posted',()=>{
  clears(2); const g=normalizeSave({v:2,day:5,player:{lvl:6},bounty:{day:4,list:[{id:'kills',n:50,base:10,rw:{g:60},claimed:false},{id:'raise',n:6,base:0,rw:{dust:3},claimed:true},{id:'rooms',n:12,base:2,rw:{g:60},claimed:false}]}});
  S.bounty=g.bounty; S.day=5; const L=bounties(); eq(L.length,3); eq(L[0].id+L[0].base,'kills10'); eq(L[1].id,'rooms'); ok(!L.some(b=>b.claimed)); eq(S.bounty.day,5);
});
})();
