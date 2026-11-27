// Challenge codes and the play log, R15 PR B (src/game-playlog.js), and the bot replay of a log (tests/replay-log.js).
(function(){
const {test,ok,eq,fix,fresh,setLvl,foe,arena,mkMinion,give,renderAll,cdx,invariants}=window.LOTD_T;
const tr=s=>{ VIEW.lang='tr'; try{ return trText(s); } finally { VIEW.lang='en'; } };
const plogReset=()=>{ localStorage.removeItem(PLOG_KEY); PLOG=null; PLOG_RUN=null; PLOG_TAB=null; PLOG_OF=null; PLOG_HIT=null; };
const roomSig=()=>S.run.enemies.map(e=>e.name+'@'+e.lvl+'/'+e.maxHp+(e.aff?':'+e.aff.join(','):'')).join('|');
test('Challenge codes: seed and rules round-trip; a mistyped code fails its check letter',()=>{
  const c=chEncode(123456789,false,{foeHp:100,foeAtk:100,raise:100,gold:100,siege:100}), d=chDecode(c); ok(d&&d.s===123456789&&!d.iron&&custNorm(d.c),c);
  const ci=chEncode(4294967295,true,{foeHp:150,foeAtk:60,raise:130,gold:75,siege:0}), di=chDecode(ci.toLowerCase()); ok(di&&di.iron&&di.s===4294967295,'Ironman, the largest seed, any case');
  eq(JSON.stringify(di.c),JSON.stringify({foeHp:150,foeAtk:60,raise:130,gold:80,siege:0}),'the rules, at their steps');
  const bad=c.slice(0,-1)+(c.slice(-1)==='A'?'B':'A'); ok(!chDecode(bad),'a wrong check letter'); ok(!chDecode('hello')&&!chDecode('')&&!chDecode(null)&&!chDecode('ZZZZZZZZ-1A'),'not codes');
  const r=chRandom(false); ok(chDecode(r),'a random code is valid'); ok(chDecode(' '+c.toLowerCase()+' '),'spaces and case forgiven');
});
test('Challenge codes: the same code makes the same valley, whatever else you do; a normal game is untouched',()=>{
  const code=chEncode(777,false,{}), play=noise=>{ fresh(1); newChallenge(code); eq(S.code.c,code); setLvl(12); S.ti=S.ti||{}; S.ti.clr={0:1,1:1};
    for(let i=0;i<noise;i++) Math.random();
    const shop1=JSON.stringify(shopStock()), mod1=JSON.stringify(dayMod()); S.watches=3; startRun(0); const room0=roomSig(); flee();
    for(let i=0;i<noise*3;i++) Math.random(); closeDay(); const shop2=JSON.stringify(shopStock()), mod2=JSON.stringify(dayMod()); S.watches=3; startRun(1); const room1=roomSig(); flee();
    return {shop1,mod1,room0,shop2,mod2,room1}; };
  const a=play(0), b=play(37);
  for(const k in a) eq(b[k],a[k],k);
  const other=(()=>{ fresh(1); newChallenge(chEncode(778,false,{})); setLvl(12); S.watches=3; return JSON.stringify(shopStock())+'|'+(startRun(0),roomSig()); })(); flee();
  ok(other!==a.shop1+'|'+a.room0,'another code, another valley');
  fresh(12); ok(!chOn()&&!('code' in S)); let n=0; const R0=Math.random; Math.random=()=>{ n++; return R0(); }; try{ shopStock(); } finally { Math.random=R0; } ok(n>0,'a normal game draws from Math.random as before');
});
test('Challenge codes: the rules come with the code; the save keeps it; New Game+ keeps it; the browser lists the challenges played',()=>{
  localStorage.removeItem(CH_HIST_KEY);
  const code=chEncode(42,true,{foeHp:150,foeAtk:150,raise:100,gold:100,siege:100}); fresh(1); ok(newChallenge(code)); ok(S.iron,'Ironman'); eq(S.custom.foeHp,150,'its custom rules'); ok(!custEasy(),'harder: titles stay');
  ok(!newChallenge('nope'),'a bad code starts nothing');
  const g=normalizeSave(JSON.parse(JSON.stringify(S))); eq(g.code.c,code); eq(g.code.s,42);
  const bad=JSON.parse(JSON.stringify(S)); bad.code={c:code,s:43}; ok(!('code' in normalizeSave(bad)),'a code that does not match its seed is dropped');
  bad.code='x'; ok(!('code' in normalizeSave(bad)));
  S.ti=S.ti||{}; S.ti.clr={5:1}; S.mode='town'; ok(startNGP(null,[])); eq(S.code.c,code,'New Game+ keeps the challenge');
  closeDay(); const H=chHist(); ok(H.length>=1&&H[0].c===code&&H[0].iron!=null,'listed with its result'); invariants('code');
});
test('Play log: off until turned on; records runs, rooms, choices, the fatal blow, town spending and tabs; prunes the oldest',()=>{
  plogReset(); fresh(10); const n0=JSON.stringify(plogLoad()); S.watches=3; startRun(0); act('strike'); flee(); eq(JSON.stringify(plogLoad()),n0,'nothing while off');
  ACTIONS.plogon(); ok(plogOn()); S.watches=3; startRun(0); act('strike'); act('strike'); const e=plogRun(); ok(e&&e.g===0&&e.lv===10,'the run'); eq(e.rooms.length,1); eq(e.rooms[0].acts,2); eq(e.acts,2);
  S.run.enemies.forEach(x=>{ x.hp=0; x.dead=true; }); roomWon(); ok(e.rooms[0].won,'the room won'); if(S.run.doors&&S.run.doors.length>1){ descend(S.run.doors[1]); ok(e.rooms[1].of,'the doors it offered'); eq(e.rooms[1].k,e.rooms[1].of[1],'the door taken'); }
  const r=S.run; BLOW={n:'Tunnel Rat',k:'hit'}; hurtAlly(S.player,1); BLOW=null; S.player.hp=0; S.army.forEach(m=>m.hp=0); if(S.mode==='battle') defeat(); ok(e.death&&e.death.n==='Tunnel Rat'&&e.death.hp>0,'the blow and the HP before it');
  returnTown(); eq(e.out,'death'); ok(!PLOG_RUN,'closed');
  S.mode='town'; S.gold=1e5; ui.tab='gates'; ACTIONS.tab('market'); ACTIONS.buypot('hp'); ACTIONS.tab('codex'); ACTIONS.cx('modes'); const d=plogDay(); ok((d.x.buy||[]).includes('buypot:hp'),'what was bought'); ok(plogLoad().seen.tabs.market&&plogLoad().seen.cx.modes,'what was opened');
  ok(plogNever().tabs.includes('skills'),'never opened: Skills');
  const ex=JSON.parse(plogExport()); eq(ex.kind,'lotd-play-log'); eq(ex.runs.length,1); ok(Array.isArray(ex.never.cx),'valid JSON with the systems never opened');
  plogFlush(true); ok(JSON.parse(localStorage.getItem(PLOG_KEY)).runs.length===1,'kept under its own key, not the save'); ok(!JSON.stringify(snapshot()).includes('lotd-play-log'));
  const p=plogLoad(), big='x'.repeat(5000); for(let i=0;i<60;i++) p.runs.push({key:'f'+i,g:0,d:1,lv:1,h:0,rooms:[],acts:0,ms:0,out:'left',pad:big});
  const j=plogPrune(p,100000); ok(j.length<=100000&&p.runs.length<61&&p.pruned>0,'the oldest pruned'); ok(p.runs[p.runs.length-1].key==='f59','the newest kept');
  ui.confirm=null; ACTIONS.plogclr(); ACTIONS.plogclr(); eq(plogLoad().runs.length,0,'cleared'); ok(plogOn(),'still on');
  ACTIONS.plogoff(); ok(!plogOn()); plogReset();
});
test('Play log on screen: How I play, Records, the challenge card at New game, the Codex; every line has Turkish',()=>{
  plogReset(); fresh(8); ui.tab='play'; let h=renderAll('play off'); ok(/data-a="plogon"/.test(h),'offers to turn it on');
  ACTIONS.plogon(); const p=plogLoad(); p.runs.push({key:'a',g:0,d:1,lv:8,h:0,rooms:[{i:0,k:'fight',acts:4,won:1},{i:1,k:'elite',of:['fight','elite'],acts:6}],acts:10,ms:240000,out:'death',death:{rm:1,n:'Tunnel Rat',k:'crit',hp:12,sh:0}},{key:'b',g:1,d:2,lv:9,h:0,rooms:[{i:0,k:'fight',acts:3,won:1}],acts:3,ms:60000,out:'clear'});
  p.days.push({d:1,x:{buy:['buyitem:0']},tab:{market:120000,gates:30000}});
  h=renderAll('play'); ok(/Deaths by cause/.test(h)&&/Tunnel Rat/.test(h)&&/Actions a fight/.test(h)&&/Doors chosen/.test(h)&&/Never opened/.test(h),'How I play');
  ui.tab='rec'; S.code={c:chEncode(5,false,{}),s:5}; localStorage.setItem(CH_HIST_KEY,JSON.stringify([{c:S.code.c,day:3,lvl:5,gates:1,tower:0,iron:null}])); h=renderAll('rec'); ok(h.includes(S.code.c)&&/Export play log/.test(h),'Records');
  ui.tab='settings'; ui.confirm=null; ACTIONS.newgame(); ACTIONS.ngmode('code'); h=renderAll('code card'); ok(/id="ngcode"/.test(h),'the code box');
  ui.ngcode='bad'; ACTIONS.newgame(); ok(/not valid/.test(ui.msg&&ui.msg.m),'a bad code is refused'); ACTIONS.ngcode('iron'); ok(chDecode(ui.ngcode).iron,'a random Ironman code'); h=renderAll('code ok'); ok(/Rules: Ironman/.test(h));
  const code=ui.ngcode; ACTIONS.newgame(); eq(S.code.c,code); ok(S.iron);
  const cx=cdx('codes')+cdx('playlog'); ok(/same valley/.test(cx)||/everyone with the same code/.test(cx)); ok(/2 MB/.test(cx));
  const strip=s=>s.replace(/<[^>]+>/g,'\u0001').split('\u0001').map(x=>x.replace(/&middot;/g,'·').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/gi,' ').trim()).filter(x=>/[A-Za-z]{2}/.test(x));
  fresh(8); S.code={c:chEncode(5,false,{}),s:5}; ACTIONS.plogon(); const q=plogLoad(); q.runs.push({key:'a',g:0,d:1,lv:8,h:0,rooms:[{i:0,k:'fight',acts:4,won:1},{i:1,k:'elite',of:['fight','elite'],acts:6}],acts:10,ms:240000,out:'death',death:{rm:1,n:'Tunnel Rat',k:'crit',hp:12,sh:0}}); q.days.push({d:1,x:{},tab:{market:120000}});
  ui.ngcode=chEncode(9,true,{foeHp:60,foeAtk:100,raise:100,gold:100,siege:0}); ui.ng={mode:'code'};
  const lines=strip(playHTML()+challengeRecHTML()+plogRecHTML()+ngModesHTML()+codexSection('codes')+codexSection('playlog')).concat([NG_MODES.code.name,NG_MODES.code.desc],CH_SEEDED);
  const names=['Tunnel Rat','Normal',S.code.c,ui.ngcode].concat(DUNGEONS.map(D=>D.name));
  for(const s of lines) if(!names.includes(s)) ok(tr(s)!==s||/^[\d\s·.%:,\-A-Z]+$/.test(s),'Turkish: '+s);
  ACTIONS.plogoff(); plogReset(); localStorage.removeItem(CH_HIST_KEY);
});
test('Bot replay: a play log set beside the bot at matched gates and levels',()=>{
  const log={kind:'lotd-play-log',game:{code:null},runs:[{g:0,lv:5,h:0,out:'clear',rooms:[{acts:4,k:'fight'},{acts:3,k:'elite',of:['fight','elite']}]},{g:0,lv:6,h:0,out:'death',death:{rm:2,n:'Tunnel Rat',k:'hit'},rooms:[{acts:5,k:'fight'}]},{g:3,lv:40,h:0,out:'clear',rooms:[]},{g:'t',lv:20,out:'left',rooms:[]}],never:{tabs:['skills'],cx:['modes'],bld:[]}};
  const bot=[{g:0,l:5,h:0,c:1,rm:4,t:12},{g:0,l:6,h:0,c:1,rm:4,t:16},{g:0,l:7,h:0,c:1,rm:4,t:12},{g:0,l:6,h:0,c:0,rm:2,t:9}];
  const o=LOTD_REPLAY.compare(log,bot,{fight:9,elite:1},['E Rat Warren']); eq(o.matched,2); eq(o.unmatched,1,'no bot ran gate B at level 40'); eq(o.human,'50%'); eq(o.bot,'75%');
  eq(o.avoided.length,1,'the bot clears that room 75% of the time'); eq(o.actsHuman,4); ok(o.doors.some(d=>d.door==='elite'&&d.human==='100%'&&d.bot==='10%'),'doors: human and bot');
  ok(LOTD_REPLAY.lines(o).some(l=>/never opened by the human: tabs skills/.test(l)));
  let threw=false; try{ LOTD_REPLAY.compare({runs:[]},[],{}); }catch(e){ threw=true; } ok(threw,'not a play log');
});
})();
