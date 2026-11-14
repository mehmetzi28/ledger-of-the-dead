// Elite Affixes tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Affixes: every elite gets one (two deeper), and a shield matches its final HP',()=>{
  setLvl(40); arena([foe()],0); const e=foe({elite:true}); affixAll([e]); eq(e.aff.length,1); ok(AFFIX[e.aff[0]]);
  const n=foe(); affixAll([n]); eq(n.aff,undefined,'ordinary foes have none');
  flee(); arena([foe()],3); const d=foe({elite:true}); affixAll([d]); eq(d.aff.length,2); ok(d.aff[0]!==d.aff[1]);
  fix(0); const s=foe({elite:true,hp:1000}); giveAffixes(s,1); eq(s.aff[0],'shielded'); eq(s.shield,300);
  flee(); fix(.05); S.watches=3; startRun(0); ok(S.run.enemies.length&&S.run.enemies.every(x=>x.elite&&x.aff&&x.aff.length===1),'spawned elites carry affixes');
});
test('Affixes: Splitting, Vampiric, Enraged and Warded do what they say',()=>{
  const P=S.player; P.stats.constitution=500; P.hp=pMax();
  const sp=foe({elite:true,aff:['splitting'],hp:100,atk:10}); arena([sp,foe()]); sp.hp=0; checkDeaths(); eq(S.run.enemies.length,4);
  const kids=S.run.enemies.slice(2); kids.forEach(k=>{ eq(k.maxHp,35); eq(k.atk,5); ok(k.split&&!k.elite); }); kids.forEach(k=>k.hp=0); checkDeaths(); eq(S.run.enemies.length,4,'copies do not split again'); eq(S.run.corpses.length,3);
  flee(); const v=foe({aff:['vampiric'],atk:100,hp:1e5}); arena([v]); v.hp=v.maxHp/2; fix(.5); act('strike'); eq(S.run.fx[v.id].h,40,'heals 40% of a 100 hit');
  flee(); P.hp=pMax(); const en=foe({aff:['enraged'],atk:100,hp:1e5}); arena([en]); en.hp=en.maxHp*.4; const h=P.hp; act('strike'); eq(h-P.hp,160,'60% harder below half');
  const w=foe({aff:['warded']}); addDot(w,'poison',10,3); eq(w.dots,undefined); const m=mkMinion({traits:['warded']}); addDot(m,'bleed',10,2); eq(m.dots,undefined); const o=foe(); addDot(o,'burn',10,2); ok(o.dots&&o.dots.burn);
});
test('Affixes: a Warded minion hit by a crit does not bleed, and the log does not claim it does',()=>{
  const P=S.player; P.stats.constitution=500; P.hp=pMax(); arena([foe({role:'striker',atk:10})]); const m=mkMinion({role:'vanguard',traits:['warded']}); m.hp=m.maxHp=1e5; S.run.taunt=2; fix(.1); act('strike');
  const l=S.run.log.find(x=>/hits Mn/.test(x.m)); ok(l&&/\(crit\)/.test(l.m),'a crit landed'); ok(!/bleeding/.test(l.m)); eq(m.dots,undefined);
});
test('Affixes: Wrathful minions hit harder while wounded',()=>{
  const e=foe({hp:1e6}); arena([e]); const m=mkMinion({role:'vanguard',traits:['wrathful'],lvl:10}); fix(.5);
  act('strike'); const d1=e.maxHp-e.hp; e.hp=e.maxHp; S.run.cd={}; m.hp=Math.floor(m.maxHp*.4); act('strike'); const d2=e.maxHp-e.hp; ok(d2>d1,'wounded '+d2+' vs '+d1);
});
test('Affixes: a raised elite keeps one of its affixes as a trait, and cards show them',()=>{
  const c=corpse({elite:true,aff:['vampiric']}); raiseScene([c],20); S.run.lastXp=0; ok(/Vampiric &rarr; Leeching/.test(renderAll('corpse'))); fix(0); tryRaise(c.id); eq(c.result,'raised');
  const m=S.army[0]; ok(m.traits.includes('leech')&&m.traits.includes('thick'),m.traits.join());
  returnTown(); arena([foe({elite:true,aff:['enraged','warded']})]); const h=renderAll('elite'); ok(/class="aff"[^>]*>Enraged/.test(h)&&/Warded/.test(h));
  eq(corpseOf(foe({aff:['warded']})).aff[0],'warded'); eq(corpseOf(foe()).aff,undefined);
});

})();
