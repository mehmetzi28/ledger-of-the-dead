// The rival's stolen bodies (src/game-rival-trials.js rivalTheft, rivalRoom, rivalReclaim, rivalFix; checkDeaths in src/game-runs.js).
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,corpse,mkMinion,renderAll,cdx,invariants,canon}=window.LOTD_T;
const meet=()=>{ setLvl(30); S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1}; S.kills['Tunnel Rat']=5; rivalTick(); return S.rival; };
const steal=(body,di)=>{ const g=S.rival; g.steal=S.day; arena([foe({hp:0,dead:true})],di||0); S.run.room=1; S.run.corpses=[body,corpse({lvl:1})]; fix(.99); roomWon(); return S.run; };
const bossRoom=di=>{ S.mode='town'; S.run=null; S.watches=WATCHES; startRun(di); S.run.room=S.run.rooms-1; spawnRoom(); return S.run; };
const challenge=()=>{ const g=S.rival; g.next=S.day; g.gi=1; g.done=0; return bossRoom(1); };
const mob=(di,i)=>DUNGEONS[di].mobs.find(m=>m[1]!=='mender')||DUNGEONS[di].mobs[i||0];
const rec=(di,o)=>{ const m=mob(di); return Object.assign({base:m[0],name:m[0],role:m[1],rankI:di,hf:m[2],af:m[3],elite:false,di,day:S.day},o||{}); };

test('Rival bodies: a theft keeps a compact record (condition, affixes, gate, day), at most 6, and says so',()=>{
  fresh(); const g=meet(); const m=mob(0);
  const r=steal(corpse({base:m[0],name:'Elite '+m[0],role:m[1],hf:m[2],af:m[3],elite:true,aff:['plague'],cd:'preserved',lvl:9}),0);
  eq(g.stash.length,1); const b=g.stash[0]; eq(b.base,m[0]); eq(b.name,'Elite '+m[0]); ok(b.elite); eq(String(b.aff),'plague'); eq(b.cd,'preserved'); eq(b.di,0); eq(b.day,S.day);
  ok(!('lvl' in b)&&!('id' in b),'compact'); ok(r.events.some(e=>/is taken\. It will raise them against you\./.test(e.m)));
  for(let i=0;i<7;i++) g.stash.push(rec(0,{name:'N'+i}));
  steal(corpse({base:m[0],name:'Last',lvl:9}),0); eq(g.stash.length,RIVAL_STASH); eq(g.stash[RIVAL_STASH-1].name,'Last','the newest kept, the oldest dropped');
});

test('Rival bodies: challenge followers rise from the stash, this gate first, elites keep affixes, a condition label, no gear or trophies',()=>{
  fresh(); const g=meet(); g.step=2;   /* 3 followers */
  g.stash=[rec(0,{name:'Far'}),rec(1,{name:'Here A',cd:'preserved'}),rec(2,{name:'Far2'}),rec(1,{name:'Here B',elite:true,aff:['shielded','plague']})];
  const r=challenge(), riv=r.enemies[0], f=r.enemies.slice(1); ok(riv.rival); eq(f.length,3);
  const st=f.filter(x=>x.stash); eq(st.length,3,'all places from the stash'); ok(st[0].name.startsWith('Here')&&st[1].name.startsWith('Here'),'this gate first'); eq(st[2].name,'Far2','then the newest from elsewhere');
  const B=st.find(x=>x.name==='Here B'); ok(B.elite&&String(B.aff)==='shielded,plague'&&B.shield>0,'elite and its affixes'); ok(f.every(x=>x.lvl===riv.lvl&&x.follower));
  const A=st.find(x=>x.name==='Here A'); eq(A.scd,'preserved'); ok(!A.cd&&!A.traits,'no trait on the foe side');
  ok(/class="stash-t"[^>]*>Preserved</.test(renderAll('battle')),'the condition on its card');
  const t0=JSON.stringify(S.trophies); fix(0); r.loot=[]; r.troph={}; A.hp=0; checkDeaths(); eq(r.loot.length,0,'no gear'); ok(!Object.keys(r.troph||{}).length,'no trophies');
  invariants('stash room'); eq(JSON.stringify(S.trophies),t0);
});

test('Rival bodies: a killed stash follower leaves its original condition and leaves the stash; a loss keeps the rest',()=>{
  fresh(); const g=meet(); g.step=2; g.stash=[rec(1,{name:'Here A',cd:'charred'}),rec(1,{name:'Here B',elite:true,aff:['vampiric']}),rec(1,{name:'Here C'})];
  let r=challenge(); const A=r.enemies.find(x=>x.name==='Here A'), B=r.enemies.find(x=>x.name==='Here B');
  A.stun=2; A.hp=0; A.cd='preserved'; checkDeaths(); let c=r.corpses.find(x=>x.name==='Here A'); eq(c.cd,'charred','the condition it was stolen with');
  eq(g.stash.length,2); ok(!g.stash.some(b=>b.name==='Here A'),'gone from the stash at once');
  B.hp=0; B.cd='mangled'; checkDeaths(); c=r.corpses.find(x=>x.name==='Here B'); ok(!('cd' in c),'no condition stays none'); ok(c.elite&&String(c.aff)==='vampiric','the elite keeps its affix');
  eq(g.stash.length,1); defeat(); eq(g.stash.length,1,'losing keeps the bodies'); eq(g.stash[0].name,'Here C');
});

test('Rival bodies: save repair, record page, Codex and Turkish',()=>{
  fresh(); const g=meet(); const m=mob(1);
  const bad=normalizeSave(Object.assign(JSON.parse(JSON.stringify(S)),{rival:Object.assign({},g,{stash:[{base:'Nobody'},5,{base:m[0],di:99,rankI:1,cd:'zzz',aff:['vampiric','bad'],elite:1,day:'x'},...Array.from({length:8},(_,i)=>({base:m[0],name:'S'+i,di:1,cd:'rot'}))]})}));
  eq(bad.rival.stash.length,RIVAL_STASH); eq(bad.rival.stash[RIVAL_STASH-1].name,'S7'); ok(bad.rival.stash.every(b=>b.base===m[0]&&b.role===m[1]&&RK[b.di]));
  const one=normalizeSave(Object.assign(JSON.parse(JSON.stringify(S)),{rival:Object.assign({},g,{stash:[{base:m[0],di:99,rankI:1,cd:'zzz',aff:['vampiric','bad'],elite:1}]})})).rival.stash[0];
  eq(one.di,1); ok(!('cd' in one)); eq(String(one.aff),'vampiric'); eq(one.elite,true); eq(one.day,0);
  const old=JSON.parse(JSON.stringify(S)); delete old.rival.stash; eq(canon(normalizeSave(old).rival.stash),'[]','an old save gets an empty stash');
  g.stash=[rec(1,{name:'Grim Hound',cd:'preserved'})]; S.mode='town'; S.run=null; ui.tab='rec'; const h=renderAll('rec'); ok(/Bodies it holds/.test(h)&&/Grim Hound/.test(h)&&h.includes(DUNGEONS[1].name+' &middot; Preserved'));
  ok(/Stolen bodies/.test(cdx('rival')));
  for(const s of [g.name+' was here before you: the body of Grim Hound is taken. It will raise them against you.','Bodies it holds','Bodies they steal stand with them at their next challenge.','A body the rival stole. Frozen when it died.'])
    ok(trText(s)!==s&&!/raise them against/.test(trText(s)),'Turkish for: '+s);
  ok(trText(g.name+' was here before you: the body of Grim Hound is taken. It will raise them against you.').includes('Grim Hound'),'names stay English');
});
test('Rival bodies: a theft prefers the role your army leans on, and the Rival page names it',()=>{
  fresh(); const g=meet(); const D=DUNGEONS[0].mobs, a=D[0], b=D.find(m=>m[1]!==a[1]);
  S.army=[mkMinion({role:b[1]}),mkMinion({role:b[1]}),mkMinion({role:a[1]})]; eq(rivalWant(),b[1],'the most minions');
  const big=corpse({base:a[0],name:'Big',role:a[1],elite:true,lvl:9}), mine=corpse({base:b[0],name:'Mine',role:b[1],lvl:2});
  g.steal=S.day; arena([foe({hp:0,dead:true})],0); S.run.room=1; S.run.corpses=[big,mine]; rivalTheft(S.run);
  ok(mine.result==='taken'&&big.result!=='taken','the leaned-on role over a richer body');
  S.army=[]; eq(rivalWant(),null); S.army=[mkMinion({role:a[1],lvl:9}),mkMinion({role:b[1],lvl:2})]; eq(rivalWant(),a[1],'a tie goes to the most levels');
  S.mode='town'; ui.tab='rec'; const h=renderAll('rival page'); ok(new RegExp('Hunting.*your '+a[1]+'s').test(h),'the Rival page says what they are after');
  ok(/role your army leans on most/.test(cdx('rival')||rivalCardHTML()+cxRivalHTML()),'the Codex says so');
});

test('Rival bodies: the rival speaks into the Ledger after a theft, the dawn before, after a win and after a loss; Turkish keeps the name',()=>{
  fresh(); const g=meet(); const said=k=>RIVAL_TAUNT[k].map(x=>g.name+': "'+x+'"');
  const r=steal(corpse({name:'Taunted',lvl:9}),0); ok(r.events.some(e=>said('theft').includes(e.m)),'after a theft');
  S.mode='town'; S.run=null; S.day=g.next-1; g.warned=0; g.gi=-1; S.notices=[]; rivalTick(); ok(S.notices.some(n=>said('warn').includes(n.m)),'the dawn before a challenge');
  const run=challenge(); rivalBeaten(run.enemies[0],run); ok(run.log.some(l=>said('beaten').includes(l.m)),'after you beat them');
  run.log=[]; rivalLost(run); ok(run.log.some(l=>said('won').includes(l.m)),'after they beat you');
  for(const k in RIVAL_TAUNT){ ok(RIVAL_TAUNT[k].length>=3,k+' pool'); for(const x of RIVAL_TAUNT[k]){ const t=trText(g.name+': "'+x+'"'); ok(t!==g.name+': "'+x+'"'&&t.startsWith(g.name+': "'),'Turkish: '+x); } }
});

})();
