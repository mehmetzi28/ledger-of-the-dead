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
  has('gear',TIERS); has('supplies',Object.values(POTIONS).map(p=>p.name)); has('rooms',Object.values(DOORS).map(d=>d.name).concat(Object.values(EVENTS).filter(e=>!e.chain).map(e=>e.name))); has('chains',CHAIN_IDS.map(id=>EVENTS[id].name));
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

test('Codex: the stats list every benefit of each point, from the constants',()=>{
  const h=cdx('basics');
  ok(h.includes('3 + 2.2 per point')&&h.includes(STR_CRIT+'% crit chance per point (up to '+STR_CRIT_CAP+'%)')&&h.includes('per '+STR_PEN+' points (up to '+STR_PEN_CAP+'%)')&&h.includes(STR_MINION+'% minion attack per point'),'Strength');
  ok(h.includes('24 + '+CON_HP+' per point')&&h.includes(CON_DR+'% less damage taken per point (up to '+CON_DR_CAP+'%)')&&h.includes(CON_HEAL+'% more healing received per point (up to '+CON_HEAL_CAP+'%)'),'Constitution');
  ok(h.includes('Mana (6 per point), Soul Siphon (2.8 per point), Bone Ward (3 per point), '+INT_SKILL+'% skill damage')&&h.includes(INT_MINION+'% minion attack per point'),'Intelligence');
  ok(h.includes(RAISE_WILL+'% raise chance per point')&&!h.includes('2.2% raise'),'Will follows RAISE_WILL');
  for(const r of ['Strike damage: 3 + 2.2 per point + your level + gear. Also 0.5% crit chance per point (up to 15%), 1% of foe armor pierced by Strike per 2 points (up to 25%), and 1.3% minion attack per point.','Max HP: 24 + 5 per point + 4 per level + gear. Also 0.25% less damage taken per point (up to 8%) and 1.5% more healing received per point (up to 20%).','Mana (6 per point), Soul Siphon (2.8 per point), Bone Ward (3 per point), 2% skill damage per point (Bone Spear, Corpse Explosion, Grave Chill and Reap) and 1.2% minion attack per point.'])
    ok(!/per point/.test(trText(r)),trText(r));
});

const cxNodes=k=>codexSection(k).replace(/<[^>]+>/g,'\u0001').split('\u0001').map(s=>s.replace(/&middot;/g,'·').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/gi,' ')).filter(s=>/[A-Za-z]{2}/.test(s));
test('Codex: every page renders real text, on a new save and a late one, and the new pages are listed',()=>{
  for(const st of ['fresh','rich']){ if(st==='rich') richState(); else fresh();
    for(const [k] of CODEX){ const t=cxNodes(k).join(' '); ok(t.replace(/\s+/g,' ').trim().length>80,st+': '+k+' has text'); } }
  ['army','reserve','fusion','records'].forEach(k=>ok(CODEX.some(c=>c[0]===k),k+' is a page'));
  ok(CODEX.findIndex(c=>c[0]==='army')===CODEX.findIndex(c=>c[0]==='minions')+1,'Army sits with the minion pages');
});
test('Codex: every line of every page has Turkish (names stay English)',()=>{
  richState(); S.omen={day:S.day,id:'eclipse'};
  const names=[...new Set(allNames().concat(DUNGEONS.map(D=>D.name),SECRET.map(B=>B.name),Object.values(BOSS_ABIL).map(a=>a.name),Object.values(FLAGS).map(f=>f.split(':')[0]),
    SET_NAMES,USET.map(U=>U.name),Object.values(ITEM).map(d=>d.name),[SIEGE_BOSS]))].sort((a,b)=>b.length-a.length);
  const core=s=>s.replace(/^[\s·.,:;+\-−–]*/,'').replace(/[\s·.,:;!?\-–]*$/,'').replace(/\d+(?:[.,]\d+)?/g,'#');
  const bare=s=>{ let t=s; for(const n of names) t=t.split(n).join(' '); return !/[A-Za-z]{2}/.test(t.replace(/\b(Lv|HP|ATK|XP)\b/g,' ')); };
  for(const [k,label] of CODEX){ ok(trText(label)!==label||TR_DICT.has(label),'tab name '+label);
    for(const s of cxNodes(k)) ok(trText(s)!==s||TR_DICT.has(core(s))||bare(s),k+': no Turkish for "'+s.trim().slice(0,90)+'"'); }
});
test('Codex: raising, mastery, skills, omens, uniques, fusion, the Reserve and records follow the constants',()=>{
  fresh(); const txt=k=>cdx(k).replace(/<[^>]+>/g,' ').replace(/&middot;/g,'·').replace(/&#39;/g,"'");
  const r=txt('raising');
  ok(r.includes('Each Will point adds '+RAISE_WILL+'%')&&r.includes('each level you stand above the body '+RAISE_LV+'%')&&r.includes('An elite '+RAISE_ELITE+'% more, a boss '+RAISE_BOSS+'%'),'raise terms');
  ok(r.includes('Grave Salts add '+SALT_BONUS+'% ('+SENSE_SALT+'% with '+SKILL_MODS.thrift.b[0]+') and may lift it to '+SALT_CAP+'%')&&r.includes('between '+RAISE_MIN+'% and '+RAISE_MAX+'%'),'raise caps');
  ok(r.includes('shatters when the room ends '+SHATTER_BASE+'% of the time, '+SHATTER_WILL+'% less per Will point (never below '+SHATTER_MIN+'%)'),'shatter');
  MASTERY.filter(t=>t.raise).forEach(t=>ok(r.includes(t.name+' '+t.raise+'%'),'mastery raise '+t.name));
  setLvl(10); S.player.stats.will=20; const c=corpse({rankI:1,lvl:8,elite:true});   // the stated formula is the real one
  eq(raiseChance(c),Math.round(RAISE_BASE+20*RAISE_WILL+2*RAISE_LV-RK[1].pen-RAISE_ELITE),'raise formula');
  const b=txt('basics'); MASTERY.forEach(t=>{ ok(b.includes(t.name)&&b.includes(t.at+' kills'),'tier '+t.name); if(t.bossAt!=null) ok(b.includes(t.bossAt+' for bosses'),'boss tier '+t.name); ok(b.includes(masteryGives(t)),'gives '+t.name); });
  const sk=txt('skills'); for(const s of SKILLS){ [1,2,3].forEach(n=>ok(sk.includes(s.desc(n).replace(/<[^>]+>/g,' ')),s.name+' rank '+n)); const M=SKILL_MODS[s.id]; ok(sk.includes(M.a[0]+' ('+M.a[1]+') or '+M.b[0]+' ('+M.b[1]+')'),s.name+' upgrades'); }
  const om=txt('omens'); eq(Object.keys(OMENS).length,7); Object.values(OMENS).forEach(O=>ok(om.includes(O.name)&&om.includes(O.desc),O.name)); ok(om.includes(Math.round(OMEN_CHANCE*100)+'% of dawns'));
  const st=txt('status'); Object.values(CONDS).forEach(x=>ok(st.includes(x.name)&&st.includes(x.desc),x.name)); Object.values(DOTS).forEach(x=>ok(st.includes(x.name),x.name));
  const tr=txt('traits'); AFFIX_TRAITS.forEach(t=>ok(tr.includes(TRAITS[t].name)&&tr.includes(TRAITS[t].desc),t)); const af=txt('affixes'); AFFIX_IDS.forEach(a=>ok(af.includes(AFFIX[a].name),a));
  const u=txt('uniques'); DUNGEONS.forEach((D,i)=>ok(u.includes('Boss '+(+UQ[i].toFixed(4))+'% per drop · elite '+(+(UQ[i]*UQ_MOB*2).toFixed(4))+'% · foe '+(+(UQ[i]*UQ_MOB).toFixed(4))+'%'),D.name+' unique odds'));
  const f=txt('fusion'); ok(f.includes('until it carries '+FUSE_TRAITS)&&f.includes('at most '+FUSE_MAX+' fusions')&&f.includes(FUSE_GOLD+' gold per level'),'fusion');
  const a=mkMinion({lvl:5}), m2=mkMinion({lvl:3}); S.mode='town'; S.gold=1e6; const g=S.gold; ok(fuse(a.uid,m2.uid)); eq(g-S.gold,8*FUSE_GOLD,'fusion costs what the Codex says');
  ok(txt('reserve').includes('holds '+RESERVE_BASE+' minions, +'+RESERVE_CRYPT+' per Crypt level'),'reserve');
  const ar=txt('army'); STAGES.slice(1).forEach((n,i)=>ok(ar.includes(n.trim())&&ar.includes('+'+EVOLVE_AT[i+1]+' levels'),'stage '+n)); ok(ar.includes('best '+QG_N+' pieces'),'quick equip');
  const rc=txt('records'); REC_NUM.forEach(k=>{ ok(CDX_REC[k],'a line for record '+k); ok(rc.includes(CDX_REC[k]),k); }); ok(rc.includes('last '+HIST_N+' runs'),'history');
  const ti=txt('titles'); ok(ti.includes('There are '+TITLES.length)&&ti.includes('Rift dives'),'titles');
  ok(txt('minions').includes(Math.round(LV_HP*100)+'% HP and '+Math.round(LV_ATK*100)+'% attack'),'level growth');
});
})();
