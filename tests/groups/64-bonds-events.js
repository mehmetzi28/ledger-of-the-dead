// Bonds, event chains and mausoleums (src/game-faith-story.js, Memorial hooks in src/game-phases-town.js).
(function(){
const {test,ok,eq,near,fix,seq,fresh,setLvl,foe,arena,mkMinion,renderAll,cdx,invariants,eventScene}=window.LOTD_T;
const win=n=>{ for(let i=0;i<n;i++){ arena([foe({hp:0,dead:true})],0); fix(.99); roomWon(); S.mode='town'; S.run=null; } };
const pair=()=>{ setLvl(10); const a=mkMinion({nick:'Thane',lvl:10}), b=mkMinion({nick:'Brine',lvl:10}); return [a,b]; };
const bonded=()=>{ const [a,b]=pair(); win(BOND_ROOMS); return [a,b]; };

test('Bonds: two minions standing together for 25 won rooms bond, one partner each, +5% attack, shown on cards and the Army tab',()=>{
  const [a,b]=pair(); const atk=a.atk; win(BOND_ROOMS-1); ok(!a.bond&&!b.bond,'not yet'); eq(S.bondT[bondKey(a.uid,b.uid)],BOND_ROOMS-1);
  win(1); eq(a.bond.u,b.uid); eq(b.bond.u,a.uid); { const c=JSON.parse(JSON.stringify(a)); delete c.bond; syncMinion(c); near(a.atk,c.atk*(1+BOND_ATK),1); ok(bondMul(a)>1&&bondMul(c)===1,'stronger'); } invariants('bonded');
  const c=mkMinion({nick:'Third'}); win(BOND_ROOMS+2); ok(!c.bond,'no free partner: one bond each'); eq(Object.keys(S.bondT).length,0,'pairs with a bonded minion are not counted');
  S.mode='town'; ui.tab='army'; const h=renderAll('army with bonds'); ok(h.includes('Bonded: Brine')&&h.includes('Bonded: Thane'),'chips'); ok(/id="h-bonds"/.test(h)&&h.includes('Thane &amp; Brine'),'Army tab section');
  const d=mkMinion({nick:'Dusk'}); win(3); ok(renderAll('near').includes('Third &amp; Dusk: 3/'+BOND_ROOMS+' rooms together'),'closest pairs');
});

test('Bonds: downed, benched or raiding minions do not count; the Reserve pauses the count',()=>{
  const [a,b]=pair(); win(5); a.hp=0; arena([foe({hp:0,dead:true})],0); a.hp=0; fix(.99); roomWon(); S.mode='town'; S.run=null; eq(S.bondT[bondKey(a.uid,b.uid)],5,'a downed minion shares nothing');
  S.reserve=[a]; S.army=S.army.filter(m=>m!==a); win(4); eq(S.bondT[bondKey(a.uid,b.uid)],5,'paused, not lost, in the Reserve');
});

test('Bonds: a partner lost in the same fight makes the survivor Vengeful until dawn; the Memorial names the bond',()=>{
  const [a,b]=bonded(); S.day=7; const base=b.atk/(1+BOND_ATK);
  arena([foe({hp:0,dead:true})],0); a.hp=0; fix(0); roomWon(); S.mode='town'; S.run=null;
  ok(!S.army.includes(a)); eq(S.memorial[0].bd,'Brine'); ok(!b.bond,'free to bond again'); eq(b.mood.k,'v'); near(b.atk,base*(1+BOND_VENGE),2);
  ok(S.notices.some(n=>n.m==='Brine saw Thane fall and is Vengeful until dawn.')); ui.tab='army'; ok(renderAll('vengeful').includes('Vengeful: Thane'));
  ui.tab='mem'; ok(renderAll('memorial').includes('Bonded to Brine')); invariants('vengeful');
  endDay(); ok(!b.mood,'gone at dawn'); near(b.atk,base,2); invariants('dawn');
});

test('Bonds: a partner lost elsewhere (benched, or on a raid) leaves the survivor Grieving for a day',()=>{
  let [a,b]=bonded(); S.day=4; S.reserve=[b]; S.army=S.army.filter(m=>m!==b);
  arena([foe({hp:0,dead:true})],0); a.hp=0; fix(0); roomWon(); S.mode='town'; S.run=null; eq(b.mood.k,'g'); eq(b.mood.u,5,'through tomorrow');
  endDay(); eq(b.mood&&b.mood.k,'g','still grieving on day 5'); endDay(); ok(!b.mood,'over on day 6');
  fresh(); [a,b]=bonded(); S.ti={clr:{2:1}}; S.army=S.army.filter(m=>m!==a&&m!==b); const c=mkMinion({elite:true,traits:['commander'],lvl:10}); S.army=S.army.filter(m=>m!==c);
  S.raids=[{di:2,day:S.day,units:[c,a],odds:.5,res:[],saved:1}]; S.reserve=[b]; seq([0,.99,0],0); endDay();   // the raid fails and a falls at dawn while b waits in the Reserve
  ok(S.memorial.some(e=>e.nick==='Thane'&&e.bd==='Brine'),'on the raid'); eq(b.mood&&b.mood.k,'g'); eq(b.mood.u,S.day,'news at dawn: grieves through the day that begins'); ok(!b.bond);
  fresh(); [a,b]=bonded(); S.army=S.army.filter(m=>m!==a&&m!==b); const c2=mkMinion({elite:true,traits:['commander'],lvl:10}); S.army=S.army.filter(m=>m!==c2);
  S.raids=[{di:2,day:S.day,units:[c2,a],odds:.5,res:[],saved:1},{di:1,day:S.day,units:[b],odds:1,res:[]}]; seq([0,.99,0],0); endDay();   // the partner learns when it comes home
  ok(S.army.concat(S.reserve||[],S.waiting||[]).includes(b)); eq(b.mood&&b.mood.k,'g','grieves on its return'); invariants('raid grief');
});

test('Bonds: a release or a fusion breaks the bond; saves repair bond data and keep it',()=>{
  let [a,b]=bonded(); release(a.uid); ok(!b.bond,'release'); invariants('released');
  fresh(); [a,b]=bonded(); S.mode='town'; S.gold=1e6; const k=fuse(a.uid,b.uid); ok(k&&!k.bond,'fused into one: no bond'); invariants('fused');
  fresh(); [a,b]=bonded(); const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.army[0].bond.u,b.uid); eq(g.army[1].bond.u,a.uid);
  const bad=JSON.parse(JSON.stringify(S)); bad.army[0].bond={u:999}; bad.army[1].mood={k:'x',u:'y'}; bad.bondT={'1-2':5,'nope':3,'3-4':-1}; bad.chains={priest:{s:'spared',d:'x'},deserter:{s:'end'},bogus:{s:'end'}};
  const h=normalizeSave(bad); ok(!h.army[0].bond&&!h.army[1].bond,'a one-sided bond is dropped on both'); ok(!h.army[1].mood); eq(JSON.stringify(h.bondT),'{"1-2":5}'); eq(JSON.stringify(h.chains),'{"deserter":{"s":"end"}}');
  const old=JSON.parse(JSON.stringify(S)); old.army.forEach(m=>{ delete m.bond; }); delete old.bondT; const o=normalizeSave(old); ok(!('bondT' in o)&&!('chains' in o),'old saves load unchanged');
  const met=JSON.parse(JSON.stringify(S)); met.chains={deserter:{s:'paid',d:5},priest:{s:'end'},reliquary:{s:'looted',d:4}}; const js=JSON.stringify(met.chains);
  eq(JSON.stringify(normalizeSave(met).chains),js,'chains met out of CHAIN_IDS order keep their order through a reload');
});

test('Event chains: a first meeting chosen comes back days later as its follow-up, once, and ends; walking past starts nothing',()=>{
  setLvl(10); S.day=3; eventScene('priest',10); ok(resolveEvent('pass')); ok(!S.chains||!S.chains.priest,'walking past starts nothing');
  eventScene('priest',10); const hp=S.player.hp=pMax(); ok(resolveEvent('spare')); eq(S.chains.priest.s,'spared'); eq(S.chains.priest.d,3+CHAIN_DAYS); ok(S.player.hp<hp);
  for(let i=0;i<30;i++){ Math.random=()=>i/30; const id=rollEvent().id; ok(!EVENTS[id].chain||EVENTS[id].start,'no follow-up before its day'); }
  for(let i=0;i<30;i++){ Math.random=()=>i/30; ok(rollEvent().id!=='priest','a chosen first meeting does not come again'); }
  S.day=3+CHAIN_DAYS; fix(0); eq(chainDue(),'priest_back'); fix(.99); eq(chainDue(),null,'only in some events');
  eventScene('priest_back',10); S.run.event={id:'priest_back'}; ok(resolveEvent('pass')); eq(S.chains.priest.s,'spared','a follow-up walked past keeps waiting');
  eventScene('priest_back',10); S.run.event={id:'priest_back'}; S.player.hp=1; ok(resolveEvent('bless')); eq(S.player.hp,pMax()); ok(S.run.bless); eq(S.chains.priest.s,'end'); S.day+=5; fix(0); eq(chainDue(),null,'ended');
  ok(rollEvent().id!=='priest_back');
});

test('Event chains: each choice leads to its own follow-up, and paid choices need the gold',()=>{
  setLvl(10); S.day=1; eventScene('reliquary',10); S.gold=0; ok(!resolveEvent('offer'),'too poor'); ok(/disabled/.test(renderAll('poor offer').match(/data-k="offer"[^>]*/)[0]));
  ok(resolveEvent('loot')); eq(S.chains.reliquary.s,'looted'); ok(S.gold>0);
  eventScene('deserter',10); S.gold=1e5; ok(resolveEvent('pay')); eq(S.chains.deserter.s,'paid'); eventScene('priest',10); ok(resolveEvent('finish')); eq(S.chains.priest.s,'slain');
  S.day=10; const want={relic_curse:1,deserter_true:1,priest_kin:1}, seen={}; for(let i=0;i<60;i++){ Math.random=(()=>{ let n=0; return ()=>[0,i/60][n++]||0; })(); const id=chainDue(); if(id) seen[id]=1; }
  eq(Object.keys(seen).sort().join(),Object.keys(want).sort().join());
  for(const [id,ch] of [['relic_curse','endure'],['deserter_true','take'],['priest_kin','pay']]){ eventScene(id,10); S.run.event={id}; S.player.hp=pMax(); ok(resolveEvent(ch),id); ok(S.run.event.done); }
  ok(CHAIN_IDS.every(id=>S.chains[id].s==='end'),'all three ended'); eq(chainDue(),null); invariants('chains');
  S.chains={deserter:{s:'fedFalse',d:1}}; eventScene('deserter_false',10); S.run.event={id:'deserter_false'}; const hp=S.player.hp=pMax(); ok(resolveEvent('fight')); ok(S.player.hp<hp);
});

test('Event chains: the Codex has a page that names the first meetings and their state, never the outcomes; the Doors page leaves chains out',()=>{
  const h=cdx('chains'); CHAIN_IDS.forEach(id=>ok(h.includes(EVENTS[id].name),id)); ok(h.includes('Not begun'));
  ['priest_back','priest_kin','relic_curse','relic_gift','deserter_true','deserter_false'].forEach(id=>{ ok(!h.includes(EVENTS[id].name),'no spoiler '+id); ok(!cdx('rooms').includes(EVENTS[id].name)); });
  S.chains={priest:{s:'end'},deserter:{s:'paid',d:9}}; const k=cdx('chains'); ok(k.includes('Ended')&&k.includes('Waiting'));
  ok(cdx('bonds').includes(BOND_ROOMS+' won rooms'));
});

test('Mausoleums: raised over a Memorial name in town, climbing costs, +2% minion HP and attack each, at most 5, kept through New Game+',()=>{
  setLvl(20); S.memorial=Array.from({length:7},(x,i)=>({nick:'N'+i,kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:5,st:0,tr:[],role:'striker',day:1,g:0}));
  const m=mkMinion({nick:'Live',lvl:20}), hp=m.maxHp, atk=m.atk; S.mode='town'; S.gold=MAUS_COST[0]-1; ok(!raiseMaus(0),'too poor');
  ui.tab='mem'; ok(/data-a="maus"[^>]*disabled/.test(renderAll('poor maus')),'a disabled button');
  S.gold=1e6; ok(raiseMaus(0)); eq(S.gold,1e6-MAUS_COST[0]); ok(!raiseMaus(0),'one per name'); eq(mausN(),1); near(m.maxHp,hp*(1+MAUS_K),1); ok(m.maxHp>hp,'stronger'); near(m.atk,atk*(1+MAUS_K),1);
  for(let i=1;i<7;i++) raiseMaus(i); eq(mausN(),MAUS_MAX); eq(S.gold,1e6-MAUS_COST.reduce((a,b)=>a+b,0)); invariants('mausoleums');
  ACTIONS.maus('6'); eq(mausN(),MAUS_MAX); ok(renderAll('maus').includes('Rests in a mausoleum'),'rests'); ok(renderAll('maus').includes('Mausoleums: 5/5'),'note');
  S.memorial=S.memorial.concat(Array.from({length:MEM_MAX},(x,i)=>({nick:'Z'+i,kind:'Tunnel Rat',name:'Tunnel Rat',rk:0,lvl:5,st:0,tr:[],role:'striker',day:1,g:0}))).slice(0,MEM_MAX);
  const x=mkMinion({nick:'Last'}); arena([foe({hp:0,dead:true})],0); x.hp=0; fix(0); roomWon(); S.mode='town'; S.run=null; eq(S.memorial.length,MEM_MAX); eq(mausN(),MAUS_MAX,'a mausoleum name is never dropped');
  eq(normalizeSave(JSON.parse(JSON.stringify(S))).memorial.filter(e=>e.maus).length,MAUS_MAX); S.mode='town'; S.ti={clr:{5:1}}; ok(startNGP(),'ngp'); eq(mausN(),MAUS_MAX,'kept through New Game+');
});

test('Bonds, chains and mausoleums: every new line has Turkish',()=>{
  const T=s=>ok(trText(s)!==s,'no Turkish for "'+s+'"');
  ['Bonded: Thane','Vengeful: Thane','Grieving: Thane','Bonded to Thane','Thane and Brine have fought 25 rooms side by side. They are Bonded.','Brine saw Thane fall and is Vengeful until dawn.','Brine grieves for Thane.',
   'A mausoleum rises over N1. Your minions have +4% max HP and attack for good.','Rests in a mausoleum','Mausoleums: 2/5. Your minions have +4% max HP and attack for good.','Bonds','Event chains','12/25 rooms together','+5% attack while the bond holds'].forEach(T);
  setLvl(10); for(const id of Object.keys(CHAIN_EV)){ eventScene(id,10); S.run.event={id}; S.gold=1e6; T(EVENTS[id].name); T(EVENTS[id].text); EVENTS[id].opts.forEach(o=>T(o[1]));
    for(const o of EVENTS[id].opts){ eventScene(id,10); S.run.event={id}; S.gold=1e6; S.chains={}; ok(resolveEvent(o[0]),id+' '+o[0]); T(S.run.event.done); } }
});
})();
