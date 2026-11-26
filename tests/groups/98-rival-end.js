// The rival's war, chapters 4-5: their gate, the Reckoning, the endings, the ally and the rival's uniques (src/game-rival-arc.js, R7 PR B).
(function(){
const {test,ok,eq,near,fix,fresh,setLvl,foe,arena,corpse,mkMinion,renderAll,cdx,invariants}=window.LOTD_T;
const meet=()=>{ setLvl(40); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1}; S.kills['Tunnel Rat']=5; S.mode='town'; S.run=null; S.watches=WATCHES; rivalTick(); return S.rival; };
const mob=di=>DUNGEONS[di].mobs.find(m=>m[1]!=='mender');
const rec=(di,o)=>{ const m=mob(di); return Object.assign({base:m[0],name:m[0],role:m[1],rankI:di,hf:m[2],af:m[3],elite:false,di,day:S.day},o||{}); };
const benchMob=(di,o)=>{ const m=mob(di), x=mkMinion(Object.assign({name:m[0],kind:m[0],role:m[1],rankI:di,hf:m[2],af:m[3]},o||{})); S.army=S.army.filter(y=>y!==x); S.reserve=(S.reserve||[]).concat([x]); return x; };
const killAll=()=>{ S.run.enemies.forEach(e=>{ e.hp=0; }); fix(.99); checkDeaths(); roomWon(); };
const ch4=()=>{ const g=meet(); g.arc=arcFix({ch:3,rs:1,op:{2:1,3:S.day}},g); g.stash=[rec(0,{name:'Old A',day:1}),rec(1,{name:'Mine B',day:2,mine:'Bonny'}),rec(2,{name:'Best C',day:3,elite:true}),rec(1,{name:'New D',day:4}),rec(0,{name:'New E',day:5}),rec(1,{name:'New F',day:6})];
  mkMinion({lvl:40,role:'striker'}); arcOpen(4); return g; };
const ch5=()=>{ const g=ch4(); arcOpen(5); S.day=arc().rd; return g; };

test('Their gate: chapter 4 opens once their siege is fought; open 7 days, closed 10, then open again',()=>{
  fresh(); const g=meet(); g.arc=arcFix({ch:3,rs:1,op:{2:1,3:S.day}},g); S.run={siege:1,di:1,events:[]}; mkMinion({lvl:30}); rivalSiegeWon(S.run); S.run=null;
  eq(arc().ch,4); eq(arc().gu,S.day+ARC_GATE_DAYS); ok(S.story.rarc4,'a passage'); S.mode='town'; ok(rgOpen()&&rgReady());
  fresh(); const h=meet(); h.arc=arcFix({ch:3,rs:1,op:{2:1,3:S.day}},h); S.run={siege:1,di:1,events:[]}; rivalSiegeLost(S.run); S.run=null; eq(arc().ch,4,'a lost siege opens it too');
  const d0=S.day; S.day=d0+ARC_GATE_DAYS; arcTick(); ok(!rgOpen(),'closed after a week'); eq(arc().gr,S.day+ARC_GATE_WAIT); ok(S.notices.some(n=>/Ledger closes/.test(n.m)));
  S.mode='town'; ui.tab='gates'; ui.gsub='open'; ok(/is closed\. It opens again in 10 days/.test(renderAll('rg closed')));
  S.day=arc().gr; arcTick(); ok(rgOpen(),'open again'); ok(/data-a="rgate"/.test(renderAll('rg open again')));
  const bad=JSON.parse(JSON.stringify(S)); bad.rival.arc.gu=-4; bad.rival.arc.gr='x'; const f=normalizeSave(bad).rival.arc; eq(f.gu,0); eq(f.gr,0);
});
test('Their gate: four rooms of their stolen dead, yours first, their best as an elite, a lieutenant shaped like your strongest',()=>{
  fresh(); const g=ch4(); const w=S.watches; ok(startRivalGate()); const r=S.run; eq(S.watches,w-1); ok(r.rg); eq(r.rooms,4); eq(T_('rgRuns'),1);
  ok(r.enemies.filter(e=>e.stash).length>=3,'their newest dead'); ok(r.enemies.length>=3); const stats=r.enemies[0];
  killAll(); eq(r.doors,null,'no doors'); eq(r.event,null,'no events'); const before=S.army.length; rivalTheft(r); eq(S.army.length,before);
  S.mode='battle'; r.room=1; r.corpses=[]; spawnRoom(); ok(r.enemies.some(e=>e.name==='Mine B'),'the ones that were yours'); killAll();
  S.mode='battle'; r.room=2; r.corpses=[]; spawnRoom(); ok(r.enemies.some(e=>e.elite&&e.stash),'their best as an elite'); killAll();
  S.mode='battle'; r.room=3; r.corpses=[]; spawnRoom(); const lt=r.enemies.find(e=>e.rgLt); ok(lt&&lt.boss&&/^Reflection of /.test(lt.name),'the lieutenant: '+(lt&&lt.name));
  killAll(); eq(arc().ch,5); eq(arc().rd,S.day+1); eq(T_('rgClears'),1); ok(r.events.some(e=>/closed for good/.test(e.m))); invariants('rival gate');
});
test('Their gate: a stolen body killed there rises easier; nothing opens with the arc off',()=>{
  fresh(); ch4(); startRivalGate(); const c=Object.assign(corpse(),{recl:1}), plain=corpse(); eq(raiseChance(c)-raiseChance(plain)>0||raiseChance(plain)>=RAISE_MAX,true); eq(rgRaise(c),ARC_RECL_RAISE); eq(rgRaise(plain),0);
  S.run=null; eq(rgRaise(c),0,'only in their gate');
  rivalArcOn=()=>false; try{ S.mode='town'; ok(!rgOpen()); ok(!startRivalGate()); eq(arcGateHTML(),''); } finally { rivalArcOn=()=>true; }
});
test('The Reckoning: the day after, the rival with every move; The Last Page burns their followers to heal',()=>{
  fresh(); ch4(); arcOpen(5); S.mode='town'; ok(!reckReady(),'from tomorrow'); S.day=arc().rd; ok(reckReady()); ui.tab='gates'; ui.gsub='open'; ok(/data-a="reck"/.test(renderAll('reckoning')));
  ok(startReckoning()); const r=S.run, e=r.enemies.find(x=>x.reck); ok(r.rk&&e&&e.rival); ok(e.kit&&e.kit.length>=5,'every move'); ok(S.story.rarc5d);
  const fol=r.enemies.filter(x=>x!==e&&x.follower).length; ok(fol>0,'followers'); e.hp=Math.floor(e.maxHp*.45); const h0=e.hp; checkPhase();
  ok(e.phase2); eq(r.enemies.filter(x=>x.follower).length,0,'burned'); eq(e.hp,Math.min(e.maxHp,h0+Math.round(e.maxHp*ARC_LAST_HEAL*fol))); eq(canRetry(),false);
  e.hp=0; fix(.99); checkDeaths(); eq(arc().pick,1); eq(T_('reckWins'),1);
});
test('The Reckoning: fall or flee and they take a Reserve minion and wait a week; a won duel is no ordinary challenge',()=>{
  fresh(); const g=ch5(); const w=benchMob(1,{lvl:5}), s=benchMob(2,{lvl:30}); const wins=g.wins; startReckoning(); S.mode='battle'; flee();
  eq(arc().rd,S.day+ARC_DUEL_WAIT); ok(!S.reserve.includes(w),'the weakest'); ok(S.reserve.includes(s)); eq(T_('reckLosses'),1); eq(arc().pick,0);
  S.day=arc().rd; S.mode='town'; S.watches=WATCHES; startReckoning(); const e=S.run.enemies.find(x=>x.reck); e.hp=0; fix(.99); checkDeaths(); eq(g.wins,wins,'not counted as a challenge win'); eq(arc().pick,1);
});
test('The end: end them and their book is yours (three uniques, every body they hold); no more thefts or challenges',()=>{
  fresh(); const g=ch5(); arc().pick=1; S.mode='town'; ui.tab='gates'; ui.gsub='open'; ok(/data-a="rend" data-k="end"/.test(renderAll('kneels'))); g.thefts=3;
  const n=g.stash.length, k0=S.army.length+(S.reserve||[]).length+(S.waiting||[]).length; ok(!arcEnd('nope')); ok(arcEnd('end'));
  eq(arc().end,'ended'); RIVAL_UQ.forEach(id=>ok(S.inv.some(it=>it.id===id),id)); eq(g.stash.length,0); eq(S.army.length+(S.reserve||[]).length+(S.waiting||[]).length,k0+n);
  eq(T_('rivalEnded'),1); eq(T_('arcClean'),1); ok(S.ti.got&&S.ti.got.r_end&&S.ti.got.r_clean,'Last Word and Not in Their Book'); ok(S.story.rend); ok(!arcEnd('spare'),'once');
  ok(!rivalOpen(),'the rival is gone'); S.day+=30; rivalTick(); eq(rivalToday(),false);
  const o=normalizeSave(JSON.parse(JSON.stringify(S))); eq(o.rival.arc.end,'ended'); invariants('ended');
  S.ti.clr={5:1}; ok(startNGP()); eq(S.rival.arc.end,'ended','the cycle remembers'); ok(!rivalOpen()); eq(S.ally,null);
});
test('The end: spare them and they stand with you next cycle: a weekly trade and the first wave of a siege',()=>{
  fresh(); const g=ch5(); arc().pick=1; S.mode='town'; g.thefts=9; const name=g.name; ok(arcEnd('spare')); eq(arc().end,'spared'); eq(T_('rivalSpared'),1); eq(T_('arcClean'),0); ok(S.ti.got.r_spare);
  ok(S.ally&&S.ally.name===name); ok(!allyOn(),'not this cycle'); S.ti.clr={5:1}; ok(startNGP()); ok(allyOn()); ok(S.ally.stash.length>0);
  const b=allyOffer(); ok(b); const m=benchMob(Math.min(b.rankI,4),{lvl:5}); m.rankI=b.rankI; S.mode='town'; ok(allyCan(m)); ui.tab='gates'; ui.gsub='open'; ok(/data-a="atrade"/.test(renderAll('ally')));
  ok(allyTrade(m.uid)); ok(!S.reserve.includes(m)); ok(S.ally.stash.some(x=>x.name===m.nick||x.base===(m.kind||m.name))); eq(allyOffer(),null,'once a week'); eq(T_('allyTrades'),1);
  S.build={crypt:3,forge:3,altar:3,ossuary:3}; setLvl(20); S.ti.clr=Object.assign(S.ti.clr,{0:1,1:1,2:1}); siegeTick(); S.siege.next=S.day; S.watches=0; endDay();
  if(S.mode==='siege'){ beginSiege(); eq(S.run.room,1,'they hold the first wave'); eq(T_('allyAid'),1); }
  const o=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(o.ally),JSON.stringify(S.ally)); eq(normalizeSave(Object.assign(JSON.parse(JSON.stringify(S)),{ally:{name:'Nobody'}})).ally,null);
  invariants('ally');
});
test('The rival\'s uniques: Pickpocket, Second Hand, Two Books and the Rival\'s Book',()=>{
  fresh(); setLvl(60); ['r1','r2','r3'].forEach(id=>{ const it=addItem(id); equip(it.u); }); eq(usetCount(USET.length-1),3); ok(rivalBook());
  const m=mkMinion({lvl:40}); m.recl=1; const plain=mkMinion({lvl:40}); syncArmy(); ok(m.maxHp>plain.maxHp*(1+RECL_K+BOOK_K)-2,'Reclaimed +15% with the book');
  const r={room:0}; eq(quillK(r,1),2); eq(quillK(r,1),1,'once a room'); r.room=1; eq(quillK(r,0),1,'no trophy, no double'); eq(quillK(r,1),2);
  arena([foe()]); const d=mkMinion({lvl:5}); ok(secondHand(d,S.run)); ok(!secondHand(d,S.run),'once a run'); eq(T_('secondHand'),1);
  S.ti.reclaimed=40; eq(twoBooks(),TWO_BOOKS_MAX); S.ti.reclaimed=4; eq(twoBooks(),4);
  eq(uniqHeart('r1'),'b:'+DUNGEONS[5].boss[0]); eq(setCount(5),0,'the rival\'s pieces count only toward their own set'); ok(awakenCost(S.equip.weapon));
});
test('The rival\'s end: the Codex states it, the title count, and Turkish for the new words',()=>{
  fresh(); meet(); const c=cdx('rival'); ok(/Their gate/.test(c)&&/The Reckoning/.test(c)&&/The ally/.test(c)); ok(new RegExp(ARC_GATE_DAYS+' days').test(c));
  VIEW.lang='tr'; try{ ['Last Word','Mercy in Red Ink','Not in Their Book','Their gate has fallen','The Rival\'s Ledger is closed. It opens again in 3 days.','Corvin Hale kneels.','Second Hand: Mn1 is stolen back from the dark.','The Last Page: Corvin Hale burns 3 of their own dead and heals 120.'].forEach(s=>ok(trText(s)!==s,'untranslated: '+s)); } finally { VIEW.lang='en'; }
});
})();
