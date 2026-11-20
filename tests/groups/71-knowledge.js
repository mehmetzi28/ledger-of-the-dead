// Bestiary knowledge on foe intents (by mastery tier), the second planned intent (e.it2), the order hints and the Codex page
// (src/game-gate-rules.js planFoes, nextInfo, foeKnow, orderHints; src/game-runs.js allyDr, blowCounters; src/ui-screens.js intentHTML, cmdHTML).
(function(){
const {test,ok,eq,fix,seed,fresh,foe,arena,mkMinion,renderAll,bossFight}=window.LOTD_T;
const kills=(name,n)=>{ S.kills=S.kills||{}; S.kills[name]=n; };
const card=e=>{ const h=renderAll('knowledge'), i=h.indexOf('data-u="'+e.id+'"'); ok(i>=0,'the foe card is drawn'); return h.slice(i,h.indexOf('</button>',i)); };

test('Knowledge: unstudied shows the action only; Studied adds the blow after reduction and ward and a crit mark; Known adds the next move and affixes',()=>{
  fresh(); const a=foe({name:'Grim Biter',base:'Tunnel Rat',role:'striker',atk:300,aff:['vampiric']}); arena([a]); planFoes(); a.it={k:'atk',t:'p'}; kills('Tunnel Rat',0);
  let c=card(a); ok(c.includes('Attacks you')&&!c.includes('about ')&&!c.includes('then likely')&&!c.includes('can crit'),'action only');
  kills('Tunnel Rat',25); const P=S.player; P.shield=40; c=card(a);
  ok(c.includes('about '+aboutN(Math.max(0,allyDr(P,300)-40))),'damage after reduction and ward: '+c); ok(c.includes('can crit'),'a striker can crit'); ok(!c.includes('then likely'),'not yet Known');
  kills('Tunnel Rat',75); c=card(a); const n=nextInfo(a); ok(n&&c.includes('then likely')&&c.includes(n.txt),'Known: the move after');
  ok(c.includes(AFFIX.vampiric.desc),'Known: the affix explained in the tooltip');
});
test('Knowledge: Mastered gives boss signature numbers, Ledgered the answers you hold; a boss needs 6/15/35 kills',()=>{
  fresh(); const b=bossFight(5); giveAbility(b,'decree'); b.abilT=1; planFoes(); const P=S.player; P.shield=0; mkMinion({role:'striker'});
  kills(b.base,5); let c=card(b); ok(c.includes('Gathers for Royal Decree')&&!c.includes('kn-ans')&&!c.includes('then likely'),'too few kills: no knowledge');
  kills(b.base,6); c=card(b); ok(c.includes('then likely')&&c.includes('Will use Royal Decree'),'Known boss: then it lands');
  ok(!c.includes('>you '),'not yet Mastered');
  kills(b.base,15); c=card(b); const d=allyDr(P,Math.round(pMax()*.45)); ok(c.includes('you '+d),'Mastered: exact damage to you '+d);
  kills(b.base,35); c=card(b); ok(c.includes('kn-ans')&&c.includes('Bone Ward')&&c.includes('Focus')&&!c.includes('>Taunt<'),'Ledgered: ward and focus, no Taunt for a Decree');
  P.shield=5; ok(!card(b).includes('>Bone Ward<'),'a ward already up is not offered');
  b.charging=true; b.move='decree'; P.shield=0; c=card(b); ok(c.includes('Charging: Royal Decree')&&c.includes('you '+d)&&c.includes('Focus breaks this'),'the charge banner carries it too');
});
test('Knowledge: the second intent is truthful: promoted and then carried out, re-rolled only when it no longer holds',()=>{
  fresh(); seed(4242); const A=foe({name:'Foe A',role:'striker',atk:2,hp:1e7}), B=foe({name:'Foe B',role:'vanguard',atk:2,hp:1e7}); arena([A,B]);
  ['vanguard','striker','mender','reaper'].forEach(r=>{ const m=mkMinion({role:r}); m.maxHp=m.hp=1e6; }); S.player.hp=1e6; S.player.lvl=50; planFoes();
  for(let t=0;t<8;t++){ const want=[A,B].map(e=>e.it2&&Object.assign({},e.it2)); act('strike'); eq(S.mode,'battle');
    [A,B].forEach((e,i)=>{ eq(JSON.stringify(e.it),JSON.stringify(want[i]),'turn '+t+': the shown next move became the plan'); });
    const plan=[A,B].map(e=>e.it); S.run.log=[]; act('strike'); const L=S.run.log.map(x=>x.m).join('|');
    [A,B].forEach((e,i)=>{ const tg=allies().find(a=>fxKey(a)===plan[i].t); ok(L.includes(e.name+' hits '+(tg.id==='p'?'you':nameOf(tg))),'carried out: '+e.name+' on '+plan[i].t); }); }
  const r=S.run, v=S.army.find(m=>m.role==='vanguard'); r.taunt=1; delete A.it2; planFoes(); eq(A.it2.t,fxKey(v),'rolled under Taunt'); ok(A.it2.tn);
  r.taunt=0; delete A.it; planFoes(); ok(!A.it.tn,'Taunt lapsed: the promoted move is rolled again');
  const tgt=allies().find(a=>fxKey(a)===A.it2.t); if(tgt.id!=='p'){ tgt.hp=0; planFoes(); ok(A.it2.t!==fxKey(tgt),'its target fell: rolled again'); }
});
test('Knowledge: a boss move turn keeps its planned blow, which the card showed as the next move',()=>{
  fresh(); fix(.5); const b=bossFight(1); giveAbility(b,'bonewall'); b.abilT=1; mkMinion({role:'vanguard'}).maxHp=1e6; S.player.hp=S.player.maxHp=1e6; planFoes(); kills(b.base,6);
  const said=nextInfo(b), it=JSON.stringify(b.it); eq(said.txt,planTxt(b,b.it).txt); act('strike'); ok(b.shield>0,'the wall went up'); eq(JSON.stringify(b.it),it,'the blow is kept for its next turn');
});
test('Knowledge: menders heal whoever is most hurt when the move comes up, as a fresh roll would',()=>{
  fresh(); fix(.5); const m=foe({name:'Mender',role:'mender',hp:1000}), x=foe({name:'X',hp:1000}); arena([m,x]); mkMinion({role:'vanguard'}); planFoes();
  eq(m.it2.k,'atk','nobody hurt: it attacks'); x.hp=100; delete m.it; planFoes(); eq(m.it.k,'heal'); eq(m.it.t,x.id,'the promoted attack gives way to a heal');
});
test('Order hints: Taunt pulls, Bone Shield ward, Execute marks, Focus on a charge; each gone once its order is given',()=>{
  fresh(); const a=foe({name:'A',role:'striker',atk:5}), b=foe({name:'B',role:'striker',atk:5,hp:300,maxHp:1000}); arena([a,b]);
  const v=mkMinion({role:'vanguard'}), s=mkMinion({role:'striker'}), md=mkMinion({role:'mender'}); mkMinion({role:'reaper'}); planFoes();
  a.it={k:'atk',t:'p'}; b.it={k:'atk',t:fxKey(s)}; let h=renderAll('hints'); ok(h.includes('pulls 2'),'two blows to pull');
  b.it={k:'atk',t:fxKey(v)}; ok(renderAll('hints').includes('pulls 1'),'a blow already on a vanguard is not counted');
  S.player.shield=0; const w=Math.min(Math.round(pMax()*.6),Math.round(md.atk*1.5)); ok(renderAll('hints').includes('+'+w+' ward'),'Bone Shield ward');
  ok(card(b).includes('kn-exe')&&!card(a).includes('kn-exe'),'Execute marks the foe below 40%');
  command('vanguard'); command('mender'); command('reaper'); h=renderAll('hints'); ok(!h.includes('pulls ')&&!h.includes('kn-exe')&&!/ord-h/.test(h),'given: hints hidden');
  fresh(); const c=bossFight(5); c.charging=true; c.move='decree'; mkMinion({role:'striker'}); ok(card(c).includes('Focus breaks this')); command('striker'); ok(!card(c).includes('Focus breaks this'),'Focus given');
});
test('Knowledge: drawing it never touches Math.random or the game state',()=>{
  fresh(); const b=bossFight(5); giveAbility(b,'cinder'); b.abilT=2; const e=foe({name:'Low',role:'striker',hp:100,maxHp:1000,aff:['vampiric']}); S.run.enemies.push(e);
  ['vanguard','striker','mender','reaper'].forEach(r=>mkMinion({role:r})); planFoes(); kills(b.base,99); kills(e.base,999);
  renderAll('warm-up');   // the bounty board is made on first sight, with its own rolls
  const before=JSON.stringify(S.run)+JSON.stringify(S.player), R=Math.random; Math.random=()=>{ throw new Error('random during render '+new Error().stack.split('\n').slice(2,6).join(' < ')); };
  try{ renderAll('no rng'); b.charging=true; b.move='cinder'; renderAll('no rng, charging'); delete b.charging; delete b.move; } finally { Math.random=R; }
  eq(JSON.stringify(S.run)+JSON.stringify(S.player),before,'nothing changed');
});
test('Knowledge: the same seeded fight ends the same whether or not its knowledge is drawn',()=>{
  const fight=draw=>{ fresh(); renderAll('warm-up'); seed(9); const A=foe({name:'A',role:'striker',atk:30,hp:4000}), B=foe({name:'B',role:'mender',atk:20,hp:3000}); arena([A,B]);
    ['vanguard','striker','mender'].forEach(r=>mkMinion({role:r,lvl:20})); planFoes(); kills('Tunnel Rat',999);
    const L=[]; let shown=false; for(let t=0;t<12&&S.mode==='battle';t++){ if(renderAll('fight').includes('class="kn')) shown=true; S.run.log=[]; act('strike'); L.push(S.run.log.map(x=>x.m)); }
    ok(shown===draw,'knowledge drawn: '+draw); return JSON.stringify([L,S.player.hp,S.army.map(m=>m.hp),A.hp,B.hp]); };
  const K=foeKnow, O=orderHints, on=fight(true); let off;   // off: the same screens drawn with the Ledger silent
  try{ foeKnow=()=>({lv:0}); orderHints=()=>({}); off=fight(false); } finally { foeKnow=K; orderHints=O; }
  eq(on,off);
});
test('Safety: the same seeded fight ends with identical state whether or not render() runs each turn',()=>{
  const fight=draw=>{ fresh(); renderAll('warm-up'); seed(9); const A=foe({name:'A',role:'striker',atk:30,hp:4000}), B=foe({name:'B',role:'mender',atk:20,hp:3000}); arena([A,B]);
    ['vanguard','striker','mender','reaper'].forEach(r=>mkMinion({role:r,lvl:20})); planFoes(); kills('Tunnel Rat',999);
    for(let t=0;t<12&&S.mode==='battle';t++){ if(draw) renderAll('fight'); act('strike'); }
    return JSON.stringify([S.run,S.player,S.army,S.mode]); };
  eq(fight(true),fight(false));
});
test('Knowledge: the Codex explains it, and all of it reads in Turkish',()=>{
  const cx=codexSection('basics'); ok(cx.includes('What the Ledger tells you')&&cx.includes('Ledgered'));
  try{ VIEW.lang='tr';
    ['about 120','can crit','you 85','army 40','vanguard 60','then likely','Focus breaks this','pulls 3','12 ward','Taunt pulls this onto a vanguard','Bone Ward soaks it','Grave Chill freezes it first','Focus breaks it',
     'A striker: its blow can crit for 80% more and open a wound','Below 40% HP: Execute doubles your reapers\' blows on it this turn'].forEach(t=>ok(trText(t)!==t,'untranslated: '+t));
    const i=cx.indexOf('What the Ledger tells you'), part=cx.slice(i,cx.indexOf('<p class="group-h">Lore',i)); part.replace(/<[^>]+>/g,'|').split('|').map(x=>x.replace(/&#39;/g,"'").trim()).filter(x=>/[A-Za-z]/.test(x)).forEach(x=>ok(trText(x)!==x,'untranslated: '+x));
  } finally { VIEW.lang='en'; }
});
})();
