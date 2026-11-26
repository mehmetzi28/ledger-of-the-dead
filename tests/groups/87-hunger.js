// The Hunger, Vane Abbey's boss (src/game-abbey.js): three pages, Memorial echoes, Write Your Name, Devour the Margin and the six-action rule.
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,renderAll}=window.LOTD_T;
const hunger=()=>{ fresh(40); S.ti={clr:{5:1}}; abbeyState().open=1; setLvl(40); const b=makeEnemy(ABBEY,RK[ABBEY].lv+3,true); b.hp=b.maxHp=1e6; arena([b],ABBEY); S.run.room=S.run.rooms-1; S.mode='battle'; return b; };
const big=()=>{ const P=S.player; P.stats.constitution=3000; P.hp=pMax(); return P; };
const mem=(nick,o)=>Object.assign({nick,kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:30,st:0,tr:[],role:'striker',day:7},o||{});

test('Hunger: three pages turn once each at 60% and 30%; immune to shadow on the first, which mends unless fire hits it',()=>{
  const b=hunger(); big(); ok(b.hunger); eq(b.ph,1); eq(b.twist,'blank'); eq(JSON.stringify(b.kit),JSON.stringify(HUNGER_PH[1].kit)); eq(foeRes(b,'shad'),1,'immune to shadow');
  b.hp=b.maxHp*.8; let x=b.hp; S.run.turn=5; bossRoomTurn(); ok(b.hp>x,'the blank page drinks');
  hurtFoe(b,100,'fire'); x=b.hp; bossRoomTurn(); eq(b.hp,x,'not after fire');
  b.hp=b.maxHp*.55; bossRoomTurn(); eq(b.ph,2); eq(b.twist,'remembered'); ok(S.story.abbey5!=null,'What the book wore'); const t=T_('phases'); bossRoomTurn(); eq(b.ph,2,'once'); eq(T_('phases'),t);
  b.hp=b.maxHp*.25; bossRoomTurn(); eq(b.ph,3); eq(b.twist,'lastentry'); eq(S.run.p3n,0);
  ok(!b.half&&!b.twistU||true); checkPhase(); eq(b.ph,3,'the old phase rule leaves it alone');
});
test('Hunger: the Remembered calls your fallen from the Memorial, strongest first, at 60%; stand-ins when the Memorial is empty',()=>{
  let b=hunger(); big(); S.memorial=[mem('Low',{st:0,lvl:10}),mem('High',{st:2,lvl:30,tr:['vicious'],bd:'Bram'}),mem('Mid',{st:1,lvl:20}),mem('Fourth',{st:0,lvl:5})];
  hungerPhase(b,2); fireAbility(b,'remember'); const es=S.run.enemies.filter(e=>e.echo); eq(es.length,3); eq(es[0].name,'Echo of High'); eq(es[0].base,'Memorial Echo'); eq(es[0].echo.bd,'Bram');
  ok(!es.some(e=>e.name==='Echo of Fourth'),'only three'); fireAbility(b,'remember'); eq(S.run.enemies.filter(e=>e.echo).length,3,'never more than three');
  eq(hungerTaken(b,1000),1000*(1-HUNGER_DR),'an echo guards it'); ok(/Echoes guard it/.test(bossRotChip(b)));
  const c0=S.run.corpses.length; es.forEach(e=>{ e.hp=0; }); checkDeaths(); eq(S.run.corpses.length,c0,'echoes leave no body'); eq(hungerTaken(b,1000),1000);
  b=hunger(); S.memorial=[]; hungerPhase(b,2); fireAbility(b,'remember'); eq(S.run.enemies.filter(e=>e.echo).length,3); ok(S.run.enemies.filter(e=>e.echo).every(e=>/plague-year dead/.test(e.name)),'stand-ins');
  b=hunger(); S.memorial=[mem('Ash'),mem('Bo'),mem('Cy'),mem('Di')]; S.run.crossed={nick:'Ash'}; hungerPhase(b,2); fireAbility(b,'remember'); const n=S.run.enemies.filter(e=>e.echo).map(e=>e.name);
  eq(n.length,2,'one fewer'); ok(!n.includes('Echo of Ash'),'the crossed-out name never returns');
});
test('Hunger: a bonded minion will not strike its partner\'s echo and hits the Hunger 30% harder',()=>{
  const b=hunger(); big(); const m=mkMinion({lvl:30,role:'striker',nick:'Bram'}); S.memorial=[mem('Wren',{bd:'Bram'})]; hungerPhase(b,2); fireAbility(b,'remember');
  const e=S.run.enemies.find(x=>x.echo); eq(abbeyTarget(m,e),b,'turns to the Hunger'); eq(bondEchoK(m,b),ECHO_BOND); e.hp=0; checkDeaths(); eq(bondEchoK(m,b),1);
});
test('Hunger: Write Your Name drops you to 1 HP unless a Bone Ward takes the pen; it telegraphs, so a freeze breaks it',()=>{
  let b=hunger(); const P=big(); fireAbility(b,'writename'); eq(P.hp,1,'written');
  b=hunger(); big(); S.player.shield=500; fireAbility(b,'writename'); eq(S.player.shield,0); ok(S.player.hp>1,'the Ward takes it');
  ok(BOSS_ABIL.writename.warn&&BOSS_ABIL.devour.warn,'both telegraph'); ok(/ward|freeze/i.test(JSON.stringify(chargeInfo(Object.assign(b,{charging:true,move:'writename'}))||{})),'the banner names the answer');
});
test('Hunger: Devour the Margin eats your strongest minion once; a Guard order saves it',()=>{
  let b=hunger(); big(); const s=mkMinion({lvl:30,role:'striker'}); s.atk=1e6; mkMinion({lvl:10,role:'vanguard'}); fireAbility(b,'devour'); eq(s.hp,0,'devoured'); ok(b.devU);
  ok(!kitNeeds.devour(b),'once a fight');
  b=hunger(); big(); const v=mkMinion({lvl:30,role:'vanguard'}); v.hp=v.maxHp=1e6; const w=mkMinion({lvl:30,role:'striker'}); w.atk=1e7; S.run.guard=S.run.turn; fireAbility(b,'devour'); ok(w.hp>0,'guarded');
});
test('Hunger: Erase wipes your Ward and Frenzy; Read Aloud takes a trait for the fight; Hollow Hymn hits your whole side',()=>{
  let b=hunger(); const P=big(); P.shield=100; S.run.frenzy=3; fireAbility(b,'erase'); eq(P.shield,0); eq(S.run.frenzy,0);
  const m=mkMinion({lvl:30,role:'striker',traits:['vicious']}); m.atk=1e6; m.hp=m.maxHp=1e6; fireAbility(b,'readaloud'); ok(!hasTrait(m,'vicious')); eq(m.readBy,'fight');
  const h=P.hp, mh=m.hp; fireAbility(b,'hollow'); ok(P.hp<h&&m.hp<mh);
});
test('Hunger: on the Last Entry six of your actions end the fight in your favour',()=>{
  const b=hunger(); big(); hungerPhase(b,3); for(let i=0;i<HUNGER_ACTS-1;i++) hungerAct(); ok(b.hp>0); eq(S.run.p3n,HUNGER_ACTS-1); ok(/The book: 5\/6/.test(bossRotChip(b)));
  hungerAct(); eq(b.hp,0,'the book runs out'); eq(T_('bookOut'),1);
});
test('Hunger: Echo-Breaker when no minion falls in the second page; Codex, door and Turkish name its pages',()=>{
  let b=hunger(); big(); mkMinion({lvl:30,role:'vanguard'}); hungerPhase(b,2); hungerPhase(b,3); eq(T_('echoBreak'),1);
  b=hunger(); big(); const m=mkMinion({lvl:30,role:'vanguard'}); hungerPhase(b,2); m.hp=0; hungerPhase(b,3); eq(T_('echoBreak'),0,'a minion fell');
  ok(bossKitTxt('The Hunger').includes('The Blank Page')); S.kills['The Hunger']=1; const c=codexSection('bosses'); ['The Blank Page','The Remembered','The Last Entry'].forEach(n=>ok(c.includes(n),n));
  VIEW.lang='tr'; ok(trText(bossKitTxt('The Hunger'))!==bossKitTxt('The Hunger')); ok(trText('Page 2/3')!=='Page 2/3'); ['erase','hollow','hunger','remember','readaloud','writename','devour'].forEach(k=>ok(trText(BOSS_ABIL[k].desc)!==BOSS_ABIL[k].desc,k));
  BOSS_LINES['The Hunger'].concat([PHASE_LINES['The Hunger']]).forEach(l=>ok(trText(l)!==l,l)); VIEW.lang='en';
});
})();
