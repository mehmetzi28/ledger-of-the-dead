// The Charnel Yard, the Library respec, the Embalmery and the Temple omen (src/game-town2.js, R5 PR A).
(function(){
const {test,ok,eq,near,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,renderAll,invariants}=window.LOTD_T;
const town=lvl=>{ fresh(lvl||40); S.mode='town'; S.gold=1e7; S.dust=1e5; S.ti=S.ti||{}; S.ti.clr={0:1,1:1,2:1,3:1,4:1,5:1}; return S; };
const bench=o=>{ const m=mkMinion(o); ok(toReserve(m.uid),'to the Reserve'); return m; };

test('Charnel Yard: the Reserve trains at dawn, never past the army\'s highest level minus two; Bone Pits lift the cap',()=>{
  town(40); S.build={crypt:2,yard:1}; const top=mkMinion({lvl:20}), p=bench({lvl:10}); p.xp=0;
  const x0=p.xp, l0=p.lvl; ok(yardDawn()>=0); ok(p.lvl>l0||p.xp>x0,'it learned'); eq(top.lvl,20,'the army does not train');
  const q=bench({lvl:18}); q.xp=0; S.build.yard=5; for(let i=0;i<200;i++) yardDawn(); eq(q.lvl,20-YARD_GAP,'capped'); ok(p.lvl<=20-YARD_GAP);
  S.build.yard=3; S.spec={yard:{3:'b'}}; for(let i=0;i<200;i++) yardDawn(); eq(q.lvl,20,'Bone Pits: up to the top');
  S.build={}; eq(yardDawn(),0,'no Yard, no training');
});
test('Charnel Yard: Drill Yard and Catacombs speed it up; Yard of Heroes trains the army\'s three weakest',()=>{
  const gain=spec=>{ town(40); S.build={crypt:5,yard:5}; S.spec=spec; mkMinion({lvl:30}); const p=bench({lvl:5}); p.xp=0; yardDawn(); return p.lvl*1e6+p.xp; };
  const base=gain({}); ok(gain({yard:{3:'a'}})>base,'Drill Yard'); ok(gain({crypt:{5:'a'}})>base,'Catacombs');
  town(40); S.build={crypt:5,yard:5}; S.spec={yard:{5:'a'}}; mkMinion({lvl:30}); const w=mkMinion({lvl:5}); w.xp=0; yardDawn(); ok(w.lvl>5||w.xp>0,'the weakest of the army trains');
  for(let i=0;i<300;i++) yardDawn(); eq(w.lvl,30-YARD_GAP,'army pupils keep the gap');
});
test('Charnel Yard: the Grave Market buys a Reserve minion, never a locked one, only with the pick',()=>{
  town(40); S.build={crypt:5,yard:5}; mkMinion({lvl:30}); const m=bench({lvl:12,role:'striker'}); ok(!yardSell(m.uid),'no Grave Market');
  S.spec={yard:{5:'b'}}; m.lk=true; ok(!yardSell(m.uid),'locked'); m.lk=false; const g=S.gold, p=yardPrice(m); eq(yardSell(m.uid),p); eq(S.gold-g,p); ok(!S.reserve.includes(m)); eq(p,YARD_SELL*12*(1+(m.stage||0)));
  ui.tab='town'; ui.tlist=true; const b=bench({lvl:10}); ok(/data-a="yardsell"/.test(renderAll('yard')),'the sell button'); ACTIONS.yardsell(String(b.uid)); ok(!S.reserve.includes(b));
});
test('Library: the first respec is free, the next cost gold and dust and wait a week; points come back',()=>{
  town(30); const P=S.player, base=freshState().player.stats; ok(!respecReady(),'needs Library 2'); S.build={library:2}; ok(respecReady()); P.pts+=5; P.stats.strength+=5; P.pts-=5;
  const spent=Object.keys(P.stats).reduce((a,k)=>a+Math.max(0,P.stats[k]-(base[k]||0)),0)+P.pts; eq(JSON.stringify(respecCost()),JSON.stringify({g:0,d:0}));
  const g=S.gold; ok(respec()); eq(S.gold,g,'free'); S.respecDay=S.day; const t=T_('respecs'); ok(t>=1); eq(P.pts,spent,'every point back'); Object.keys(P.stats).forEach(k=>eq(P.stats[k],base[k]||0,k)); ok(!respecReady(),'a week'); invariants('respec');
  S.day+=RESPEC_DAYS; ok(respecReady()); eq(respecCost().g,RESPEC_GOLD*P.lvl); P.stats.strength+=3; P.pts-=3; const g2=S.gold, d2=S.dust; ok(respec()); eq(g2-S.gold,RESPEC_GOLD*P.lvl); eq(d2-S.dust,RESPEC_DUST);
  S.day+=RESPEC_DAYS; S.gold=0; ok(!respec(),'too poor'); S.mode='battle'; S.gold=1e6; ok(!respec(),'only in town');
});
test('Library: Reading Room and Forbidden Stacks give their points once',()=>{
  town(30); const P=S.player, pt=P.pts, sp=P.sp||0; S.build={library:5}; ok(chooseSpec('library',3,'a')); eq(P.pts,pt+1); ok(chooseSpec('library',5,'a')); eq(P.sp,sp+1); ok(!chooseSpec('library',5,'a'),'once');
});
test('Embalmery: keep one untried body a run, raise it in town with a bonus, and lose it if it waits too long',()=>{
  fresh(30); S.build={embalm:1}; const a=corpse({lvl:20,name:'Tunnel Rat'}), b=corpse({lvl:20}); const r=raiseScene([a,b]); eq(embCap(),1); eq(embHold(),3);
  ok(/data-a="embkeep"/.test(renderAll('raise')),'the keep button'); ok(embKeepId(a.id)); eq(a.result,'kept'); ok(a.tried); ok(!embCan(b),'one a run'); ok(!embKeepId(b.id)); eq(S.embalm.length,1);
  S.mode='town'; S.run=null; S.spec={}; const c=Object.assign({},S.embalm[0].c,{id:'x'}), base=raiseChance(c); EMB_RAISING=true; eq(raiseChance(c),Math.min(RAISE_MAX,base+EMB_RAISE)); EMB_RAISING=false;
  S.mode='battle'; eq(embRaise(0),null,'only in town'); S.mode='town'; const n=S.army.length; const res=embRaise(0); ok(res); eq(S.embalm.length,0,'the body is spent'); eq(S.army.length,n+(res.ok?1:0)); eq(S.mode,'town'); ok(!S.run,'no run left behind');
  S.embalm=[{c:Object.assign({},S.army[0]||a,{name:'Tunnel Rat',base:'Tunnel Rat',rankI:0,lvl:5}),day:S.day}]; S.day+=embDays(1)-1; embDawn(); eq(S.embalm.length,1,'still fresh'); S.day+=1; embDawn(); eq(S.embalm.length,0,'spoiled');
});
test('Embalmery: Body Thieves keep two, Preservers keep longer, Grave Garden raises higher; a full army waits',()=>{
  fresh(30); S.build={embalm:3}; S.spec={embalm:{3:'b'}}; const a=corpse({}), b=corpse({}), c=corpse({}); raiseScene([a,b,c]); ok(embKeepId(a.id)&&embKeepId(b.id)); ok(!embKeepId(c.id),'two at most');
  S.spec={embalm:{3:'a'}}; eq(embDays(3),EMB_DAYS+3+3);
  S.mode='town'; S.run=null; S.build={embalm:5}; S.spec={embalm:{5:'b'}}; S.embalm=[{c:{name:'Tunnel Rat',base:'Tunnel Rat',role:'striker',rankI:0,lvl:20,hf:.85,af:1.1,boss:false,elite:false},day:S.day}];
  while(S.army.length<slots()) mkMinion({lvl:5}); S.reserve=[]; S.build.crypt=0; if(!reserveRoom()){ eq(embRaise(0),null,'a full army waits'); eq(S.embalm.length,1); ACTIONS.embraise('0'); ok(ui.msg&&/full/.test(ui.msg.m)); }
  S.army=[]; let m=null; for(let i=0;i<40&&!m;i++){ S.embalm=[{c:{name:'Tunnel Rat',base:'Tunnel Rat',role:'striker',rankI:0,lvl:20,hf:.85,af:1.1,boss:false,elite:false},day:S.day}]; const r=embRaise(0); if(r&&r.ok) m=S.army[S.army.length-1]; }
  ok(m,'one rises in forty tries'); if(m) eq(m.lvl,Math.min(S.player.lvl+2,23),'Grave Garden: three levels higher');
});
test('Embalmery: a won siege keeps a fallen attacker; saves keep only sound bodies',()=>{
  fresh(30); S.build={embalm:2}; S.embalm=[]; const r={fallen:[corpse({name:'Tunnel Rat'})],corpses:[],events:[]}; townSiegeWon(r); eq(S.embalm.length,1); ok(/Embalmery takes in/.test(r.events[0].m));
  S.build={}; townSiegeWon({fallen:[corpse({})],corpses:[],events:[]}); eq(S.embalm.length,1,'no Embalmery, no body');
  const g=normalizeSave(JSON.parse(JSON.stringify(Object.assign({},S,{embalm:[{c:{name:'Tunnel Rat',rankI:0,lvl:'7.5'},day:3},{c:{name:5},day:1},{c:{name:'X',rankI:99},day:1},null,{c:{name:'Y',rankI:0},day:'z'}]}))));
  eq(g.embalm.length,1); eq(g.embalm[0].c.lvl,7);
});
test('Temple: at level 5 a new omen can be called once a week',()=>{
  fresh(30); S.mode='town'; S.build={temple:4}; ok(!omenReady()); S.build.temple=5; ok(omenReady()); const id=callOmen(); ok(id&&OMENS[id]); eq(dayOmen().id,id); ok(!omenReady(),'once a week'); S.day+=7; ok(omenReady());
  ui.tab='town'; ui.tlist=true; const h=renderAll('omen'); if(bOpen('temple')) ok(/data-a="callomen"/.test(h));
});
test('Town 2: Turkish for the new messages and buttons',()=>{
  VIEW.lang='tr'; ['Keep for the Embalmery','The kept body rises: Tunnel Rat.','The Embalmery takes in a Tunnel Rat from the walls.','Your army and the Reserve are full.','2 kept bodies in the Embalmery spoiled.','The Soul Well gives you a Soul for the road.'].forEach(s=>ok(trText(s)!==s,s)); VIEW.lang='en';
});
})();
