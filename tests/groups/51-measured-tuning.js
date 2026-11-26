// Tuning from bot measurements, title filters, faith events, Nightmare titles and secret-master history.
(function(){
const {test,ok,eq,near,fix,seq,H,setLvl,foe,arena,mkMinion,renderAll,eventScene}=window.LOTD_T;
test('Secrets: each boss room without the secret master makes the next likelier; meeting it resets the count',()=>{
  setLvl(10); S.ti=S.ti||{}; S.ti.clr={0:1}; S.sbPity={};
  eq(secretChance(0),SECRET_CHANCE); fix(.9); ok(!secretRoll(0)); ok(!secretRoll(0)); eq(S.sbPity[0],2); near(secretChance(0),SECRET_CHANCE+2*SECRET_PITY,1e-9);
  fix(SECRET_CHANCE+SECRET_PITY); ok(secretRoll(0),'the extra chance counts'); eq(S.sbPity[0],undefined,'reset');
  S.ti.clr={}; fix(0); ok(!secretRoll(1),'never in an uncleared gate'); eq(S.sbPity[1],undefined);
  eq(JSON.stringify(normalizeSave({v:2,player:{lvl:5},sbPity:{0:3,9:2,1:"x",2:-1}}).sbPity),JSON.stringify({0:3})); eq('sbPity' in normalizeSave({v:2,player:{lvl:5},sbPity:5}),false);
});
test('Secrets: a master never falls below your level, and fights with the strength of your hardest open gate',()=>{
  setLvl(48); const e=makeSecret(0,5); ok(e.lvl>=S.player.lvl+SB_LV,'at least your level +'+SB_LV); eq(e.rankI,0,'still the Warren master');
  const plain=makeEnemy(0,e.lvl,true), top=topGate(); ok(top>0); const st=mobStats(top,e.lvl,1,1,true,false);
  near(e.maxHp,st.hp*SB_HP*(1+SB_GROW*Math.max(0,S.player.lvl-SAFE[top])),3,'HP from the hardest open gate, grown with your lead over it'); ok(e.maxHp>plain.maxHp*SB_HP,'tougher than the Warren boss would be');
});
test("Ultimates: Death's Toll hits for "+'its multiplier and finishes foes below the execute line',()=>{
  setLvl(25); S.mode='town'; chooseUlt('toll'); const a=foe({hp:1e6}), w=foe({hp:1000}); arena([a,w]); fix(.5);
  w.hp=Math.round(H(pSiph()*TOLL_MUL*pierceMul(1))/(1-TOLL_EXEC*.9)); S.run.souls=SOUL_MAX; const before=a.hp; useUlt(a);
  eq(before-a.hp,H(pSiph()*TOLL_MUL*pierceMul(1))); eq(w.hp,0,'executed'); ok(ULTS.toll.desc.includes(TOLL_MUL*100+'%'));
});
test('Titles: count titles show progress, and the filters find what is close',()=>{
  S.ti=S.ti||{}; S.ti.got={}; S.ti.sel=null; S.notices=[]; S.ti.clrN5=13; S.tower.best=34;
  eq(JSON.stringify(titleProg(TITLE.m5)),JSON.stringify({v:13,n:25})); eq(JSON.stringify(titleProg(TITLE.t50)),JSON.stringify({v:34,n:50})); eq(titleProg(TITLE.g0),null,'a one-off has no bar'); eq(titleProg(TITLE.d_raise1),null);
  S.ti.clrN5=99; eq(titleProg(TITLE.m5).v,25,'capped');
  ok(TITLES.filter(t=>t.prog).length>=50);
  S.ti.clrN5=13; S.ti.clrN0=6; S.ti.got={}; S.notices=[]; ui.tab='titles'; ui.ttf='close'; let h=renderAll('close'); ok(h.includes('Warren-Born')&&h.includes('6/10'),'6/10 is close'); ok(!h.includes('Throne-Breaker'),'hidden titles stay hidden'); ok(!h.includes('First Whisper'));
  ui.ttf='r0'; h=renderAll('common'); ok(h.includes('First Whisper')); ok(!h.includes('Warren-Born'));
  ACTIONS.ttf('bogus'); eq(ui.ttf,'all'); ACTIONS.ttf('r5'); eq(ui.ttf,'r5'); ui.ttf='all';
});
test('Tips: ultimates at level 20, and harder difficulty once a gate is cleared',()=>{
  const tip=id=>TIPS.find(t=>t.id===id);
  S.mode='town'; setLvl(19); ok(!tip('ult').when()); setLvl(20); ok(tip('ult').when()); chooseUlt('rise'); ok(!tip('ult').when());
  S.ti=S.ti||{}; S.ti.clr={}; ok(!tip('heat').when()); S.ti.clr={0:1}; ok(tip('heat').when()); S.ti.heat1=1; ok(!tip('heat').when(),'gone after a Hard clear');
});
test('Nightmare: clearing on Nightmare earns that gate\'s title and a mark on its card; cursed too earns The Damned',()=>{
  setLvl(40); S.ti=S.ti||{}; S.ti.clr={2:1}; S.heatMax={2:2}; S.mode='town'; ok(setHeat(2,3));
  S.mod={day:S.day,gi:2,id:'fury'}; S.watches=3; fix(.5); startRun(2); eq(S.run.heat,3); S.run.room=3; S.run.enemies=[foe({hp:0,dead:true})]; roomWon();
  eq(T_('nm2'),1); eq(T_('damned3'),1); checkTitles(); ok(S.ti.got.nm2&&S.ti.got.dm3); eq(TITLE.dm3.r,5);
  returnTown(); ui.tab='gates'; ok(/nm-mark/.test(renderAll('nm mark')));
});
test('Faith events: the sworn sometimes meet their own god\'s shrine, or another god\'s; prayer adds devotion',()=>{
  setLvl(20); S.ti=Object.assign(S.ti||{},{clr:{0:1,1:1,2:1}}); S.mode='town'; S.faith=undefined; delete S.faith; fix(0); for(let i=0;i<20;i++) ok(!EVENTS[rollEvent().id].faith,'no faith events unsworn');
  swear('hon'); seq([.1,.9]); eq(rollEvent().id,'oldgods'); fix(.9); ok(!EVENTS[rollEvent().id].faith); seq([.1,.1,0]); const ge=rollEvent(); eq(ge.id,'godshrine'); ok(ge.g&&ge.g!=='hon');
  const P=S.player; eventScene('oldgods'); P.hp=Math.round(pMax()/2); P.mana=0; const d0=faithDev(); ok(resolveEvent('pray')); eq(P.mana,pMana()); ok(P.hp>pMax()/2); eq(faithDev()-d0,DEV_SHRINE);
  S.mode="town"; S.run=null; S.gold=1e6; ok(renounce()); S.gold=0; swear('dis'); seq([.1,.9]); eq(rollEvent().id,'defiled');
  eventScene('defiled'); S.run.souls=0; const g0=S.gold, h0=P.hp; ok(resolveEvent('take')); ok(S.gold>g0); ok(P.hp<h0); eq(S.run.souls,1); eq(faithDev(),DEV_SHRINE);
});
test('History: a slain secret master is written in red in the run history and the list of masters',()=>{
  setLvl(30); S.ti=S.ti||{}; S.ti.clr={0:1}; S.watches=3; startRun(0); S.run.room=3; const e=makeSecret(0,5); S.run.enemies=[e]; e.hp=0; checkDeaths(); returnTown();
  const h=S.hist[S.hist.length-1]; eq(h.sec,SECRET[0].name); ui.tab='hist'; const x=renderAll('history'); ok(x.includes('sec-k')&&x.includes(SECRET[0].name+' slain')&&/Secret masters slain/.test(x));
  const g=normalizeSave({v:2,player:{lvl:5},hist:[{d:1,g:0,res:'cleared',sec:'Bogus'},{d:2,g:1,res:'cleared',sec:SECRET[1].name,heat:9}]}); eq('sec' in g.hist[0],false); eq(g.hist[1].sec,SECRET[1].name); eq('heat' in g.hist[1],false);
});
test('Display: boss backgrounds have their own switch',()=>{
  ui.tab='settings'; ok(/data-k="nobg"/.test(renderAll('settings'))); ACTIONS.view('nobg'); ok(VIEW.nobg); ok(document.body.classList.contains('nobg')); ACTIONS.view('nobg'); ok(!VIEW.nobg);
});
})();
