// The last page (src/game-abbey.js, R3 PR B): the two endings, Ledger inscriptions, the Quiet Valley and the Keeper's Cycle.
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,renderAll}=window.LOTD_T;
const beaten=()=>{ fresh(40); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1,6:1}; abbeyState().open=1; S.mode='town'; checkTitles(); return S; };
const ngp=()=>{ S.mode='town'; ok(startNGP(null,[]),'New Game+ starts'); invariantsOk(); };
const invariantsOk=()=>{ const g=normalizeSave(JSON.parse(JSON.stringify(S))); ok(g&&g.player,'the save is valid'); };

test('Last page: it opens once the Hunger has fallen, waits on the Gates tab, and can be put off',()=>{
  fresh(40); S.mode='town'; ui.tab='gates'; ok(!S.lastPage); ok(!/The last page/.test(renderAll('before')));
  beaten(); eq(S.lastPage,S.day); let h=renderAll('page'); ok(/The last page/.test(h)&&/data-a="ending" data-k="closed"/.test(h)&&/data-a="ending" data-k="kept"/.test(h)); ok(!/h-gates/.test(h),'the Ledger, not the gate list');
  ACTIONS.lplater(); h=renderAll('later'); ok(/h-gates/.test(h)&&/The last page waits/.test(h),'a banner over the gates'); ACTIONS.lpopen(); ok(/h-lp/.test(renderAll('reopened')));
  ACTIONS.ending('closed'); ok(!S.ending,'the first press only asks'); ok(/Press again/.test(renderAll('confirm')));
});
test('Endings: Close the book and Keep writing set S.ending, the epilogue and the titles; one answer a cycle',()=>{
  beaten(); S.memorial=Array.from({length:12},(x,i)=>({nick:'N'+i,kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:1,st:0,tr:[],role:'striker',day:1}));
  ok(chooseEnding('closed')); eq(S.ending.k,'closed'); eq(S.ending.cycle,0); ok(S.story.end_closed!=null); ok(/Memorial holds more names/.test(S.ending.v)); ok(S.ti.got.a_keeper); ok(!S.ti.got.a_both);
  ok(!chooseEnding('kept'),'once'); eq(S.endHist.length,1); ui.lpJust=1; ui.tab='gates'; ok(/The quiet valley/.test(renderAll('epilogue'))); ACTIONS.lpseen(); ok(/h-gates/.test(renderAll('back')));
  ngp(); ok(!S.ending&&!S.lastPage,'a new cycle asks again'); eq(S.endHist.length,1); S.ti.clr={6:1}; checkTitles(); ok(chooseEnding('kept')); ok(S.ti.got.a_hand&&S.ti.got.a_both,'both endings'); eq(S.ending.cycle,1);
});
test('Inscriptions: only earned ones are offered, one per ending, kept through New Game+ and a save, at most five',()=>{
  beaten(); chooseEnding('kept'); eq(inscOffer().join(),'','nothing earned');
  beaten(); S.tower.best=100; for(let i=0;i<6;i++) S.ti['secret_'+i]=1; S.ti.raised=300; chooseEnding('kept'); eq(inscOffer().sort().join(),'many,masters,tower');
  ok(!inscribe('fallen'),'not earned'); ok(inscribe('tower')); eq(S.inscriptions.join(),'tower'); eq(inscOffer().join(),'','one per ending'); ok(!/data-a="inscribe"/.test(renderAll('done')));
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.inscriptions.join(),'tower','survives a save');
  ngp(); eq(S.inscriptions.join(),'tower','survives New Game+'); ok(towerStarts().includes(11),'Of the Tower');
  S.ti.clr={5:1,6:1}; checkTitles(); S.ti.raised+=300; chooseEnding('kept'); ok(inscOffer().includes('many'),'raises counted from this cycle only'); ok(!inscOffer().includes('tower'),'already written'); inscribe('many');
  ngp(); eq(S.inscriptions.join(),'tower,many','a second New Game+ keeps both');
  S.inscriptions=['many','fallen','tower','masters','faithful']; S.ti.clr={6:1}; S.lastPage=0; checkTitles(); chooseEnding('closed'); eq(inscOffer().length,0,'five at most');
  eq(endingFix(Object.assign({},{inscriptions:['many','x','many']}))===undefined,true); const h={inscriptions:['many','x','many']}; endingFix(h); eq(h.inscriptions.join(),'many');
});
test('Inscriptions: each does what it says',()=>{
  fresh(30); const c=corpseLike(); const r0=raiseChance(c); S.inscriptions=['many']; eq(raiseChance(c),Math.min(RAISE_MAX,r0+INSC_RAISE));
  S.inscriptions=['fallen']; S.memorial=Array.from({length:15},(x,i)=>({nick:'N'+i,kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:1,st:0,tr:[],role:'striker',day:1})); eq(Math.round(fallenK()*100),INSC_FALLEN_MAX);
  S.inscriptions=['faithful']; delete S.faith; S.mode='town'; S.ti=S.ti||{}; S.ti.clr=Object.assign(S.ti.clr||{},{0:1,1:1,2:1}); setLvl(Math.max(S.player.lvl,10)); ok(swear('vesh')); eq(faithRank(),1,'rank 1 at once');
  S.inscriptions=['rival']; const g2=theftGap(); S.inscriptions=[]; eq(g2,theftGap()*2);
  const b=makeSecret(2,30); arena([b],2); S.run.mod=null; S.run.troph={}; S.inscriptions=[]; killLoot(b,S.run); const k=trophyKey(b), n0=S.run.troph[k]; S.run.troph={}; S.inscriptions=['masters']; killLoot(b,S.run); eq(S.run.troph[k],n0+1,'Of the Masters');
  S.run.troph={}; const L=makeEnemy(2,30,true); L.ledger=1; S.inscriptions=[]; killLoot(L,S.run); eq(S.run.troph[trophyKey(L)],LEDGER_HEART,'a Ledger-form heart pays twice');
});
test('Quiet Valley: foes 15% gentler and nothing rises until the first gate clear, then The book stirs',()=>{
  beaten(); chooseEnding('closed'); const f0=ngpFoe(); ngp(); eq(S.cycle,'quiet'); ok(quietLocked()); eq(Math.round(ngpFoe()*1000),Math.round((1+NGP_FOE*S.ngp)*QUIET_FOE*1000));
  const r=raiseSceneLike(); const c=r.corpses[0]; tryRaise(c.id); ok(!c.tried,'the Ledger is quiet'); ok(/Ledger is quiet/.test(r.events.map(e=>e.m).join()));
  S.ti.clr={0:1}; S.mode='town'; checkTitles(); ok(!quietLocked(),'the first clear wakes it'); ok(S.story.stir!=null);
});
test('Keeper\'s Cycle: one gate boss in Ledger form (phase two, double heart) and the remembered way into the abbey',()=>{
  beaten(); chooseEnding('kept'); ngp(); eq(S.cycle,'keeper'); ok(S.ledgerBoss>=0&&S.ledgerBoss<GATE_N);
  const di=S.ledgerBoss; setLvl(Math.max(RK[di].unlock,30)); S.mode='town'; S.watches=WATCHES; startRun(di); S.run.room=S.run.rooms-1; spawnRoom(); const b=S.run.enemies.find(e=>e.boss&&!e.secret&&!e.rival);
  if(b){ ok(b.ledger,'Ledger form'); ok(b.phase2,'second phase from the start'); }
  S.mode='town'; S.run=null; ok(abbeyKeyIds().includes('remembered')); S.ti.clr={5:1}; S.pages=ABBEY_PAGES; checkTitles(); ok(abbeyOpen(),'the Throne and one more part'); ok(S.abbey.keys.remembered);
  beaten(); ok(!abbeyKeyIds().includes('remembered'),'only in the Keeper\'s Cycle');
});
test('Endings: Records, New Game+, Codex and Turkish',()=>{
  beaten(); chooseEnding('closed'); ui.tab='rec'; ok(/Endings/.test(renderAll('rec'))&&/Close the book/.test(renderAll('rec2')));
  ok(/The Quiet Valley/.test(ngpHTML())); const c=codexSection('endings'); ok(c.includes('Of the Many')&&c.includes('Keep writing'));
  VIEW.lang='tr'; [ENDINGS.closed.ngp,ENDINGS.kept.ngp,ENDINGS.closed.line,ENDINGS.kept.line,STORY_BY.end_closed.m,STORY_BY.end_kept.m,STORY_BY.stir.m,S.ending.v].concat(INSC_IDS.map(id=>INSCRIPTIONS[id].desc),INSC_IDS.map(id=>INSCRIPTIONS[id].need)).forEach(s=>ok(trText(s)!==s,s.slice(0,40)));
  c.replace(/<[^>]+>/g,'\n').split('\n').map(x=>x.trim()).filter(x=>/[a-z]{3}/.test(x)).forEach(x=>ok(trText(x)!==x,'codex: '+x.slice(0,50))); VIEW.lang='en';
});
function corpseLike(){ return {id:'c1',name:'Tunnel Rat',base:'Tunnel Rat',role:'striker',rankI:0,lvl:20,hf:1,af:1,boss:false,elite:false,tried:false}; }
function raiseSceneLike(){ arena([foe()],0); S.mode='raise'; S.run.corpses=[corpseLike()]; S.run.events=[]; return S.run; }
})();
