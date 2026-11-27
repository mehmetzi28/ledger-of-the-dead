// UX and onboarding, R18 PR A: paced tips with Codex links, What next for the newer systems, the Codex "?" on panel headings,
// and Why did I lose (src/game-lost.js).
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,give,renderAll,TABS,richState,invariants}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const cxIds=()=>new Set(CODEX.map(c=>c[0]));
test('Tips: each has a kind and a Codex page that exists; every moment reads without error; nothing stale',()=>{
  fresh(1); const ids=cxIds();
  for(const t of TIPS){ ok(['core','ctx','sys'].includes(tipKind(t)),'kind of '+t.id); ok(ids.has(tipCx(t)),'Codex page of '+t.id+': '+tipCx(t)); ok(TIP_META[t.id],'listed in TIP_META: '+t.id);
    for(const m of ['town','battle','raise','defeat']){ S.mode=m; try{ t.when(); }catch(e){ ok(false,t.id+' in '+m+': '+e.message); } } S.mode='town'; }
  const all=TIPS.map(t=>t.m).join(' ');
  ok(!/four Old Gods/.test(all),'five gods'); ok(/5, 10, 18 and 28/.test(TIPS.find(t=>t.id==='trait').m),'every evolution step');
  ok(/twist/.test(TIPS.find(t=>t.id==='phase').m)); eq(GODS.length,5);
  ['heart','brews','orders','dread','nemesis','mark','awaken','bmarket','insc','cosmetic'].forEach(id=>ok(TIPS.some(t=>t.id===id),'a tip for '+id));
});
test('Tips: at most one new system a day; core and moment tips are never held; the pace survives a save',()=>{
  fresh(1); S.tips={}; S.player.pts=0; S.mode='town'; ui.tab='gates';
  const sys=TIPS.filter(t=>tipKind(t)==='sys'); const A=sys[0], B=sys[1]; const wA=A.when, wB=B.when;
  try{ A.when=()=>S.mode==='town'; B.when=()=>S.mode==='town'; TIPS.forEach(t=>{ if(t!==A&&t!==B) S.tips[t.id]=1; });
    eq(currentTip().id,A.id); dismissTip(A.id); eq(currentTip(),null,'the second system waits'); eq(S.tips.pace.sys,1);
    S.player.pts=3; delete S.tips.stats; S.player.lvl=1; eq(currentTip().id,'stats','a core tip still shows'); dismissTip('stats');
    dismissTip(A.id); eq(S.tips.pace.sys,1,'dismissing twice counts once');
    const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(g.tips.pace),JSON.stringify(S.tips.pace),'kept by a save');
    const bad=JSON.parse(JSON.stringify(S)); bad.tips.pace='x'; ok(!('pace' in normalizeSave(bad).tips),'a bad pace is dropped');
    S.day++; eq(currentTip().id,B.id,'the next dawn brings it');
  } finally { A.when=wA; B.when=wB; }
});
test('Tips: the box links its Codex page in town, not in a fight',()=>{
  fresh(1); S.tips={}; S.player.pts=3; ui.tab='gates'; let h=renderAll('tip in town'); ok(new RegExp('data-a="cxgo" data-k="'+tipCx(TIPS.find(t=>t.id==='stats'))+'">Read more in the Codex').test(h),'the link');
  ACTIONS.cxgo('basics'); eq(ui.tab,'codex'); eq(ui.cx,'basics');
  dismissTip('stats'); arena([foe()]); h=renderAll('tip in battle'); ok(/class="tip"/.test(h)&&!/Read more in the Codex/.test(h),'no tab jump mid-fight');
});
test('Codex links: every cxgo on every town tab opens a page that exists; panel headings carry a "?"',()=>{
  richState(); const ids=cxIds(), seen=new Set(); let heads=0;
  for(const t of TABS){ ui.tab=t; const h=renderAll('tab '+t); for(const m of h.matchAll(/data-a="cxgo" data-k="([^"]+)"/g)){ ok(ids.has(m[1]),'tab '+t+' links '+m[1]); seen.add(m[1]); } heads+=(h.match(/class="cx-ln"/g)||[]).length; }
  ok(heads>=12,'"?" links on headings: '+heads); ok(seen.size>=10,'pages linked: '+seen.size);
  for(const k of Object.keys(H_CX)) ok(ids.has(H_CX[k]),'heading '+k+' -> '+H_CX[k]);
  ui.tab='codex'; ok(!/class="cx-ln"/.test(renderAll('codex')),'not inside the Codex itself');
  ui.tab='gates'; let h=renderAll('fold'); ok(/<h2 class="win-h" id="h-goal">What next<span class="fold-sum">/.test(h)||!/id="h-goal"/.test(h),'unmapped headings untouched');
});
test('What next: orders, a nemesis, a free inscription, a heart to forge, a siege and the black market',()=>{
  fresh(20); S.mode='town'; S.player.pts=0; S.player.sp=0;
  S.nem=[{id:'n1',name:'Grubjaw',g:0,lvl:5,k:1,v:[{n:'Bob',d:1}]}]; ok(goalsAll().some(x=>/Grubjaw waits for you in the Rat Warren/.test(x.t)),'a nemesis');
  S.ti=S.ti||{}; S.ti.got={}; let i=0; for(const t of TITLES){ if(i++>=40) break; S.ti.got[t.id]=1; } S.insc=[]; ok(goalsAll().some(x=>/inscription slot/.test(x.t)&&x.k==='titles'),'an inscription');
  const b=Object.keys(BUILD)[0]; S.town=S.town||{}; S.town[b]=1; if(ordersOn()){ orders(); ok(goalsAll().some(x=>/orders are posted/.test(x.t)),'orders'); pickOrder(0); ok(!goalsAll().some(x=>/orders are posted/.test(x.t)),'taken'); }
  S.day=14; ok(goalsAll().some(x=>/black market/.test(x.t))===bmOpen(),'the black market on its day');
  eq(goals().length<=GOAL_N,true,'still at most '+GOAL_N+' shown');
});
test('Why did I lose: the room is kept turn by turn with the blow, the answers and the bestiary; the defeat screen and History show it',()=>{
  fresh(5); const e=foe({atk:9999,name:'Tunnel Rat'}); const r=arena([e]); r.tj=[]; r.tjh={}; fix(.5); S.player.hp=1; const P=S.player;
  act('strike'); eq(S.mode,'defeat'); const x=S.lost[0]; ok(x,'recorded'); eq(x.d,S.day); eq(x.g,0); ok(x.turns.length>0,'lines'); ok(x.turns.every(t=>t[0]===1),'turn 1');
  ok(x.fb&&x.fb.n==='Tunnel Rat','the blow'); ok(x.hp[1]&&x.hp[1][0]===0,'where you stood'); ok(x.foes.some(f=>f.n==='Tunnel Rat'),'still standing');
  ok(typeof x.kn==='number','what the bestiary knew'); ok(lostShown(x)&&/card showed/.test(lostShown(x)));
  let h=renderAll('defeat'); ok(/data-a="lostv" data-k="0"/.test(h)&&/Why did I fall/.test(h),'the defeat link');
  ACTIONS.lostv('0'); h=renderAll('defeat open'); ok(/class="lost"/.test(h)&&/Turn 1/.test(h)&&/Was it shown\?/.test(h)&&/The bestiary/.test(h),'the room on the defeat screen');
  ACTIONS.lostv('0'); eq(ui.lostV,null);
  returnTown(); ui.tab='hist'; h=renderAll('history'); ok(/Why you fell/.test(h)&&/See the room/.test(h),'History lists it'); ACTIONS.lostv('0'); ok(/Turn 1/.test(renderAll('history open')));
  for(let i=0;i<4;i++){ const r2=arena([foe({atk:9999})]); S.player.hp=1; act('strike'); returnTown(); } eq(S.lost.length,LOST_N,'the last '+LOST_N);
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(JSON.stringify(g.lost),JSON.stringify(S.lost),'kept by a save');
  const bad=JSON.parse(JSON.stringify(S)); bad.lost=[{d:1,g:0,turns:[[1,'<b>x</b>'],['y',2]],hp:null},{x:1},5]; const n=normalizeSave(bad).lost; eq(n.length,1); eq(n[0].turns.length,1); eq(JSON.stringify(n[0].hp),'{}');
  S.lost=n; ui.tab='hist'; ui.lostV=0; h=renderAll('escaped'); ok(h.includes('&lt;b&gt;x&lt;/b&gt;')&&!h.includes('<b>x</b>'),'a line from a save is text');
  const before=S.lost.length; S.ti.clr={5:1}; S.mode='town'; ok(startNGP(null,[])); ok(!S.lost||S.lost.length===0,'New Game+ starts a clean book'); invariants('lost');
});
test('Why did I lose: a boss move names its warning and its answer; a wound names its cure',()=>{
  const x={d:1,g:0,room:3,lv:9,turns:[],hp:{},foes:[],fb:{n:'The Rat King',k:'sig',mv:'sunder',w:1}};
  ok(/announced 1 turn ahead/.test(lostShown(x))); ok(lostAnswers(x).some(a=>/Taunt it onto a vanguard/.test(a)));
  const d={d:1,g:0,room:0,lv:3,turns:[],hp:{},foes:[],fb:{k:'dot',dot:'bleed'}}; ok(/go past your ward/.test(lostShown(d))); ok(lostAnswers(d).some(a=>/Healing Draught/.test(a))); eq(lostKnew(d),null);
  const k={d:1,g:0,room:0,lv:3,turns:[],hp:{},foes:[],fb:{n:'Tunnel Rat',k:'hit'},kit:'pack',kn:0,kills:3}; ok(/not studied its kind \(3 of 25 kills\)/.test(lostKnew(k))); ok(lostAnswers(k).some(a=>a.startsWith(KITS.pack.name)));
});
test('Turkish: the tips, What next, the Codex links and the lost room',()=>{
  const S0=['Read more in the Codex','Read about this in the Codex','Why did I fall? See the room, turn by turn','Hide the room','See the room','Was it shown?','The answers','The bestiary','No turns were written down',
    'An inscription slot is free','A boss heart can be forged into gear','You have the parts for a brew','The black market is open today','Today\'s orders are posted: take one','The living are afraid: a tithe would calm them',
    'A siege comes when this day ends: look to the walls','A siege comes when tomorrow\'s day ends: look to the walls','Grubjaw waits for you in the Rat Warren','The lost room · Rat Warren, room 2 · Day 4 · Level 9','Why you fell · the last 2',
    'Turn 3','You 10/200 HP · army 2/5 standing','Still standing: Tunnel Rat 4/90','Felled by Tunnel Rat\'s blow','Its card showed whom it would strike this turn','Hell Tower, floor 12','The Rift, depth 4',
    'The bestiary had its kind at Studied (30 kills), so its kit was on its card','You had not studied its kind (3 of 25 kills): its card showed "Kit ?"','A Healing Draught cures you; Dark Mending cures your whole side',
    'Wounds tick at the end of each turn and go past your ward; your card showed the wound and its turns left','Sundering Blow was announced 1 turn ahead (Charging on its card)','Sundering Blow was announced a turn ahead (Charging on its card)','Call the Swarm lands without a warning'];
  for(const s of S0) ok(tr(s)!==s,'Turkish: '+s);
  const most=s=>{ const w=s.split(/\s+/), o=new Set(tr(s).split(/\s+/)); return w.filter(x=>o.has(x)&&/[a-z]{3}/.test(x)).length/w.length<.34; };   // a whole sentence, not a word or two
  for(const t of TIPS){ ok(tr(t.t)!==t.t,'tip title: '+t.id); ok(most(t.m),'tip text: '+t.id+' -> '+tr(t.m)); }
});
})();
