// Codex tests. Helpers and the runner live in tests/game-tests.js; this file only adds tests.
(function(){
const {test,ok,eq,near,finite,fmt,BAD_TEXT,cleanHTML,mulberry32,seed,fix,seq,H,fresh,setLvl,foe,arena,mkMinion,corpse,raiseScene,wear,give,canon,firstDiff,renderAll,TABS,richState,invariants,NODE,bossFight,earn,eventScene,cursedRun,wonRoom,master,board,cdx}=window.LOTD_T;
test('Codex: a tab with a page for every part of the game, each rendering cleanly',()=>{
  ui.tab='gates'; ok(/data-a="tab" data-k="ledger"/.test(renderAll('tabs'))); eq(new Set(CODEX.map(c=>c[0])).size,CODEX.length);
  for(const [k] of CODEX){ const h=cdx(k); ok(new RegExp('data-a="cx" data-k="'+k+'"[^>]*aria-selected="true"').test(h),k+' selected'); ok(codexSection(k).length>200,k+' has content'); }
  ui.cx='nope'; ok(/Codex &middot; Basics/.test(renderAll('fallback')));
});
test('Codex: lists every role, trait, affix, boss move, status, skill, order, power, set, building, door, event, curse and bounty',()=>{
  const has=(k,names)=>{ const h=cdx(k); names.forEach(n=>ok(h.includes(n),k+' is missing '+n)); };
  has('roles',Object.values(ROLES).map(r=>r.label)); has('traits',TRAIT_IDS.map(t=>TRAITS[t].name)); has('affixes',AFFIX_IDS.map(a=>AFFIX[a].name));
  has('bosses',Object.values(BOSS_ABIL).map(a=>a.name)); has('status',Object.values(DOTS).map(d=>d.name)); has('skills',SKILLS.map(x=>x.name).concat(Object.values(SKILL_MODS).map(m=>m.a[0])));
  has('orders',Object.values(CMDS).map(c=>c.name)); has('uniques',Object.values(FLAGS).map(f=>f.split(':')[0])); has('sets',SET_NAMES);
  has('gear',TIERS); has('supplies',Object.values(POTIONS).map(p=>p.name)); has('rooms',Object.values(DOORS).map(d=>d.name).concat(Object.values(EVENTS).map(e=>e.name)));
  has('curses',Object.values(MODS).map(m=>m.name)); has('town',Object.values(BUILD).map(b=>b.name)); has('bounties',Object.keys(BOUNTIES).map(b=>BOUNTIES[b].t(BOUNTIES[b].n)));
  has('gates',DUNGEONS.map(d=>d.name));
});
test('Codex: creatures you have not met stay hidden until you meet them',()=>{
  S.kills={}; let h=cdx('gates'); ok(!h.includes('Tunnel Rat')&&!h.includes('The Rat King')&&/\?\?\?/.test(h)); ok(!cdx('tower').includes(TW_BOSS[1]));
  S.kills={'Tunnel Rat':1,'The Rat King':1}; h=cdx('gates'); ok(h.includes('Tunnel Rat (striker)')&&h.includes('The Rat King, Call the Swarm')); ok(!h.includes('Grave Beetle'));
  ok(cdx('bosses').includes('The Rat King')); S.tower.best=12; ok(cdx('tower').includes(TW_BOSS[1]));
});
test('Codex: numbers come from the game tables, so they follow balance changes',()=>{
  ok(cdx('status').includes(Math.round(DIFF.armor[3]*100)+'%')); ok(cdx('town').includes(BUILD_COST[2][0]+' gold + '+BUILD_COST[2][1]+' bone dust')); ok(cdx('skills').includes('Rank 3 (Lv '+skReq(SKILL.reap,3)+')'));
  const keep=EVENT_CHANCE; ok(cdx('rooms').includes(Math.round(keep*100)+'% of gate rooms'));
});

test('Codex: the numbers it states match what the game does',()=>{
  const txt=k=>cdx(k).replace(/<[^>]+>/g,' ');
  ok(txt('raising').includes(RAISE_MAX+'% ('+SALT_CAP+'% with salts)'),'raise caps');
  const c={rankI:0,lvl:1,boss:false,elite:false}; setLvl(80); S.player.stats.will=200; eq(raiseChance(c),RAISE_MAX); eq(saltChance(c),SALT_CAP,'salts really stop at '+SALT_CAP);
  setLvl(25); S.mode='town'; chooseUlt('rise'); const m=mkMinion({}); arena([foe({hp:1e6})]); S.run.souls=SOUL_MAX; useUlt(); const f=S.run.frenzy; ok(ULTS.rise.desc.includes(f+' turns'),'Resurrection lasts '+f+' turns, as Unholy Frenzy (3) says');
  ok(SKILL.frenzy.desc(1).includes('3 turns')); flee();
  ok(txt('skills').includes(Math.round(SIPHON_HEAL*100)+'% of what it drains'));
  ok(/rise to \d+ levels below yours/.test(txt('curses')));
  ok(!/Kept from a [AEIOU]/.test(txt('traits')),'a/an');
  ok(txt('titles').includes('Max HP (percent)')&&txt('titles').includes('Max HP (flat)')&&!txt('titles').includes('Healing received'),'only bonuses titles give');
  S.kills={}; ok(!cdx('bosses').includes('Secret masters'),'secret until met'); S.kills[SECRET[1].name]=1; ok(cdx('bosses').includes(SECRET[1].name));
  ok(txt('basics').includes('level '+RK[5].unlock+'+')); ok(txt('basics').includes(KNOW_AT+' of one kind'));
});

})();
