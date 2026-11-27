// Ledger of the Dead — balance test bot.
// How to run: open index.html in a browser, open the developer console, paste this whole file, then run:
//   LOTD_BALANCE.run()                          // 30 bots x 40 days, with and without skills
//   LOTD_BALANCE.run({bots:10, days:30})        // quicker
//   LOTD_BALANCE.run({diff:{hp:2.4}})           // try a DIFF change without editing the game
//   LOTD_BALANCE.run({push:true})               // bots enter the hardest unlocked gate (below Recommended)
//   LOTD_BALANCE.run({modes:['skills']})        // only the bot that learns skills (faster)
//   LOTD_BALANCE.run({stats:['will','constitution']})   // replaces STAT_ORDER: the bot spends its points in this order, round and round
//   LOTD_BALANCE.run({mods:'a'})                // buys every skill's rank-3 upgrade a ('b' for b; default 'none', so earlier numbers stay comparable)
//   LOTD_BALANCE.run({mod:'mend:a'})            // rushes that skill to rank 3 before any other rank and takes that upgrade (with mods, overrides that skill)
//   Measured 2026-11-19 after the stat rebalance (market, seeds 7700/9100): stats Will+Con 88/88%, Will 78/80%, Will+Int 84/82%, Will+Str 79/83%,
//   default mix 85/86%. Rank-3: all a 85/86%, all b 84/86%; each rushed pair within ~2 points (Ossified 87/86% vs Marrow Ward 85/84% after
//   15%->8%; it was 88/87%). The bot reaches rank 3 only from level ~38 when it learns rank by rank, which is why mod rushes the skill.
//   modes: 'noSkills', 'skills', 'full' (market + the town economy), 'market' (skills + sells loot, buys gear, potions and salts, empowers minions at the
//          Bone Altar, drinks potions, and answers telegraphed boss moves with Grave Chill or Bone Ward)
// With the local server running (node tools/serve.js) you can load this file instead of pasting it:
//   await new Promise(r=>{ const s=document.createElement('script'); s.src='/tests/balance-test.js'; s.onload=r; document.head.appendChild(s); })
// Targets used for tuning (fair bot with skills): ~80% clears per gate at its Recommended level; the no-skill bot should do clearly worse.
// Difficulty comes from foe armor (DIFF.armor / TW.armor): fights last more turns instead of numbers growing.
// The ~80% target is for the 'market' bot (skills + shopping + altar). The early option is no longer needed: SAFE for A and S
// now matches where they are balanced. Current numbers, averaged over seeds 7700 and 9100 (results swing ~±7 points per seed set):
// LOTD_BALANCE.run({bots:40, days:100, seed:7700, modes:['market']})   (one mode per call, ~15 s in a browser), or in Node: node tests/run-balance.js
//   2026-11-26 Soul Tether, one soul per boss, Awakening, B/A/S/Tower/Rift/rival/siege retune (seeds 7700/9100): market 89/90%, tower 78/79, rift 25/27;
//   full 90/90%, tower 88/88, rift 12/12, sieges 84%, rival 71/68%; full awakens ~6.5 ranks (~60k gold). Tower by day (market): 35 ~43, 60 ~68, 100 ~78.
//   2026-11-20 headstones and events in 'full' (seed 7700): market 87% (unchanged); full 89%, tower 86; "off":["events"] 88%, tower 82;
//   ~264 events a bot (243 chain meetings, 120 chains ended over 40 bots). Headstones: ~186k gold a bot (median 156k), 28 tiers, +5% max HP;
//   full gold held day 100 avg/median 20k/19k with them, 39k/32k with "off":["head"].
//   2026-11-20 Guard (the full bot gives it only before a telegraphed move that would kill it; market never): market 87%, full 88%, tower 84.5.
//   Guarding whenever the foe cards add up to a kill gave full 91% (market +4), so the bot stays strict.
//   Later: it also guards under 25% HP when one plain blow on you (its card) would kill, and plays Rift events: market 87/86%, full 89/88% (seeds 7700/9100).
//   Tier probe then (full, '{"tiers":{"gates":[0,1,2,3,4,5],"near":2}}', seeds 7700/9100) at each tier's Recommended level: Hard 82-100%, Brutal 82-97%,
//   Nightmare 90-100%: the Nightmare advice (REC_TIER[3]) sits ~10-15 levels high; at equal levels Nightmare is ~0-5 points under Brutal on B/A, ~15-60 on C/D.
//   2026-11-20 later (rival stolen bodies, tempering, compounds, siege wall, pre-rolled doors; rival 15.4/6.4, TEMPER_GOLD 150): market 87/88%,
//   tower 70/71, rift ~17/18; full 89/88%, tower 82/84, rift ~9/8; full heat:0 92%; sieges 87/85%; rival 68/68%; raids 78/78%; raises 19-20% / 32-33%;
//   gold held day 100 avg/median market 35k/20k, 33k/15k; full 39k/22k, 34k/28k (tempering is capped by lines, not by cost).
//   2026-11-20 (after difficulty rules, corpse conditions, marks, second intents; Hard XP 1.2, marks trimmed, rival 14.8/6.2): market 87/86%,
//   tower 70/71, rift ~17/16; full 88/88%, tower 85/84, rift ~9; full heat:0 92/92%; sieges 85/84%; rival 64/71%; raids 78/78%; raises 20% / 32%.
//   2026-11-19 (after the stat rebalance): market ~85-86%, tower ~71-72; full ~87-88%, tower ~85; full heat:0 ~91%; sieges held 83-85%; rival ~67-72%.
//   2026-11-19 (after rows, foe intents, capstones, bonds, mausoleums; Hard 1.8, TW.hpG .042, sieges x2.4/x2.5, rival 12.8/5.4): market 85/86%,
//   tower 71.5/70.1, rift ~15; full 88/87%, tower 84/83, rift ~8.5; full heat:0 92/91%; sieges held 86/84%; rival 71/62%; raids 77/78% (seeds 7700/9100).
//   Stat builds then (market): Will+Con 90/89%, Will+Int 88/89%, Will+Str 89/88%, Will 86/88% (all above the default mix since rows).
//   Gold (run-balance prints held gold avg/median at dusk on days 30/60/100, lifetime earned/spent): 2026-11-19 before bonds and mausoleums,
//   market 2.0k/1.8k, 12.5k/5.5k, 48k/39k; full 2.5k/2.6k, 8.1k/7.2k, 49k/39k. With mausoleums (full only; ~4 of 5 raised by day 100) full day 100
//   ~50k/34-45k: late income (~17k a day, mostly sell/buy churn) outruns any capped sink. "off":["maus"] and ["bonds"] measure without them.
//   market:    clears ~81% overall, deaths ~16%, level ~51 on day 100, tower ~62 (daily quest: clear 4 rooms, 1 point + 15% of a level;
//              skill bots pick Death's Toll at level 20 and use it with five Souls)
//   full:      the market bot plus buildings, salvage, enchanting, fusion, bounties and orders against charging bosses:
//              ~85% overall, deaths ~12%, level ~56 on day 100, tower ~76 (with faith, Hard on cleared gates and devotion
//              blessings; ~87% and tower ~70 without them). Target: a little above market.
//              Blessings measured: Grace in the Tower as well was worth ~5 floors to the whole bot (~11 per Honored bot), at 10% HP
//              still ~4; gates-only Grace with a 3-Soul Tithe lands at tower ~72-73 and 86% clears.
//              opts.off (e.g. ['fuse','crypt']) switches parts off to measure each one.
//              'reserve' off: the bot keeps no bench (raiders who come home to it take an army place if stronger, or are let go).
//              'rival' off: no rival (no thefts, no challenges). The rival only plays in the 'full' mode, so 'market' numbers stay
//              comparable with earlier runs; there the bot goes to a challenge's gate on its day and fights it like any boss room.
//              'trials' off: the full bot skips the weekly Trial (it tries it each day until it completes it, at most 3 tries a week).
//              'kits' off: the bot ignores foe kits when it picks targets and wards; 'sweep' off: it never sweeps an outgrown gate.
//              'bosskits' off: bosses fight with their old single move (no move sets, twists or hazards).
//   The full bot now swears faith by default (Honored on even bots, Dishonored on odd) and climbs to Hard on cleared gates
//   (opts.heat:1); pass faith/heat to override, heat:0 for the old behaviour. Every run also reports secret masters met/slain.
//   opts.ngp (1+) starts every bot at that New Game+ ascension level, with opts.asc (rule ids) and opts.pacts (pact ids): an Ascension probe.
//   opts.faith ('hon'|'dis') swears an oath once the shrine opens (3 gates cleared, level 8); opts.ult ('toll'|'rise'|'prison'|'requiem'|'longname') picks the ultimate; opts.heat (1-3) lets
//   the bot climb a cleared gate's difficulty up to that level, stepping down after a death there. Measured (full, seed 7700):
//   both faiths +1-2 points of clears (Honored and Dishonored within a point of each other); the three ultimates within ~2 Tower
//   floors after Death's Toll went to 400%; Hard clears ~82% (Normal 85%), Brutal ~63%, Nightmare ~41% with ~54% deaths, and
//   Nightmare bots level slower (51.6 vs 53.9 on day 100), so it is a challenge, not the best farm.
// Secret-master duel: LOTD_BALANCE.duel(seed, days, trials) plays one full bot to that day, then fights each cleared gate's
//   boss room straight away (full HP) with and without the secret master. opts {faith, ult, heat} set up the bot; opts.log={gate,n} keeps the
//   last n log lines of the first lost secret fight in that gate (row.log, row.end) to see what killed it. To sweep constants without editing the game, run
//   Node with LOTD_HTML pointing at a tuned copy of index.html.
//   Tuned (seeds 7700, 7701, 9100): ordinary boss rooms ~100%; secret masters ~55-65% at fresh HP on days 30, 50 and 75 (the Rat
//   Warren's is the mildest, ~80-100%). Their HP grows SB_GROW per level you stand past your hardest gate's Recommended level, so
//   they keep pace with a growing army; attack does not grow (it only one-shot the player). Real fights come after three rooms.
//   Frequency: at 2% + 0.25% per miss the full bots met one every ~19 boss rooms of a gate (540 per 12000 runs); now 1% + 0.05%
//   per miss (+1% per difficulty level), about every 41.
// Abyss probe: LOTD_BALANCE.probe(seed, days, climbs) plays one full bot to that day, then climbs from its best checkpoint
//   again and again. With the gentler curve past floor 60, day-200 bots (level ~85) reach the 90s; floor 100 is endgame.
//              (after gear rolls, events, cursed gates, status effects and the early-game pass: E and D are gentler)
//   skills:    clears 63-87% per gate, deaths ~21%, level ~31 on day 100 (seed 7700, before the A trim)
//   no skills: clears 41-75% per gate, deaths ~35%, level ~24 on day 100 (seed 7700, before the last C tweak)
// The bots play the real game functions from a new game: they allocate stats, equip gear, raise the dead,
// pick the highest gate they are "Fair" for (level >= SAFE), and climb the Hell Tower once at the end.
// Both modes use the same random seeds, so the only difference between them is whether the bot learns skills.
// Your real save is not touched: saving is switched off while the test runs and the game is restored afterwards.
(function(){
  const STAT_ORDER=['intelligence','constitution','will','intelligence','constitution','strength'];
  const SKILL_ORDER=['spear','bonearmor','mend','blast','soulwell','curse','gravepact','chill','frenzy','edge','mastery','reap','lance','robber','scholar','calcify','sanguine','thrift','deathless','pest'];   /* R11: Hoarfrost Lance among the actives, Pestilence last */   // the small passives last: actives come first
  const itemScore=d=>d.tier*10+(d.uq?25:0)+(d.rival?6.5:d.set||0);   // the rival's book: worn over the gate and Tower uniques
  function botOmens(){
    const id=faithOf(), f=forecast(), spare=faithRank()>=DEV_RANKS&&faithDev()-CALL_COST>=DEV_RANKS*DEV_STEP;
    if(id==='dis'){ if(canCall()) callGodOmen(); return; }
    const want={hon:'paletide',vesh:'longnight',ulm:'boneharvest',choir:'eclipse'}[id];
    if(f.id===want) return;
    if(f.id==='soulstorm'&&id!=='vesh'&&spare&&canWard()){ wardOmen(); return; }
    if(canCall(want)&&(freeCall()||spare)) callGodOmen(want);
  }
  const BOT_SIG=['thin','wounds','iron','short','hands','loud','typed','hungry','mirror','named'];   // the sigils the bot takes first: the cheapest in depth (the probe order)
  const cval=c=>c.rankI*100+c.lvl+(c.boss?40:0)+(c.elite?15:0)-(c.traits&&typeof faithOf==='function'&&faithOf()==='vesh'&&c.traits.some(t=>t==='necrotic'||t==='witchrot')?150:0);   // Vesh's vow: rot-spreading minions go to the bench
  function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

  // ----- town: stats, skills, gear
  function town(B){
    if(typeof collCheck==='function'&&S.mode==='town'){ const sel=S.ti&&S.ti.sel; checkTitles(); if(S.ti&&S.ti.sel!==sel){ S.ti.sel=sel; syncArmy(); } }   /* R16: titles and milestones are earned (the UI does it after every action); the worn title stays off, as before */
    if(typeof titleInscribe==='function'&&!B.off.insc&&S.mode==='town'&&inscList().length<inscSlots()) for(const f of ['army','endless','hero','rival','gate']){ if(inscList().length>=inscSlots()) break; if(inscOn(f)) continue; const t=TITLES.find(t=>famOf(t)===f&&S.ti&&S.ti.got&&S.ti.got[t.id]&&(f!=='gate'||titleGate(t)==null)); if(t) titleInscribe(t.id); }   /* R16: inscribe the army, Tower, hero, rival and gate perks; "off":["insc"] measures them */
    if(typeof siteVisit==='function'&&MAP_ON&&S.mode==='town'&&S.watches>0&&!B.force){   // R19: dig a graveyard while the army has room, walk a fresh battlefield; only a walk that leaves a watch for a run
      const ids=MAP_IDS.filter(id=>['grave','field'].includes(VALLEY_NODES[id].k)&&mapSeen(id)&&siteReady(id)&&mapCan(id,1)&&(armyRoom()||(VALLEY_NODES[id].k==='field'&&reserveRoom()))).sort((a,b)=>tripSteps(a)-tripSteps(b));
      if(ids.length) siteVisit(ids[0]);
      for(let i=((S.map&&S.map.bodies)||[]).length-1;i>=0;i--){ if(!armyRoom()&&!reserveRoom()) break; siteRaise(i); } }
    const P=S.player;
    const SO=B.stats||STAT_ORDER; while(P.pts>0) alloc(SO[B.statI++%SO.length]);   // opts.stats overrides the stat order
    if(B.skills&&B.mod){ const id=B.mod.split(':')[0]; while(P.sp>0&&sk(id)<SK_MAX&&P.lvl>=skReq(SKILL[id],sk(id)+1)){ const sp=P.sp; learnSkill(id); if(P.sp===sp) break; } }   // opts.mod rushes that skill to rank 3 first
    if(B.skills){
      let again=true;
      while(again&&P.sp>0){ again=false;
        for(let rank=1;rank<=SK_MAX&&!again;rank++) for(const id of (B.lean&&PATHS[B.lean]?[...PATHS[B.lean].skills,...SKILL_ORDER.filter(x=>!PATHS[B.lean].skills.includes(x))]:SKILL_ORDER)){   // opts.lean: that path's skills first, and it is followed (R11 signature probes)
          if(sk(id)===rank-1&&P.lvl>=skReq(SKILL[id],rank)){ const sp=P.sp; learnSkill(id); if(P.sp<sp){ again=true; break; } } } }   // stop if learning fails (e.g. not in town)
    }
    if(B.skills&&B.lean&&PATHS[B.lean]&&P.capPath!==B.lean) choosePath(B.lean);
    if(B.skills&&(B.mods||B.mod)) for(const id in SKILL_MODS) if(sk(id)>=SK_MAX&&!skMod(id)){   // opts.mods: 'a' or 'b' picks that upgrade on every skill at rank 3; opts.mod 'skill:c' forces one skill's choice (alone, or over opts.mods)
      const f=B.mod&&B.mod.split(':'), c=f&&f[0]===id?f[1]:B.mods; if(c==='a'||c==='b') chooseMod(id,c); }
    if(B.skills&&S.player.lvl>=ULT_LV&&S.player.ult!==(B.ult||'toll')) chooseUlt(B.ult||'toll');
    if(B.skills&&!B.off.runes&&typeof slotRune==='function') for(const s of SKILLS) if(s.type==='active'&&sk(s.id)){ const want=[s.id+'_'+(B.runes||'a'),s.id+'_'+((B.runes||'a')==='a'?'b':'a')].find(runeOwned); if(want&&!(S.player.runes&&S.player.runes[s.id]===want)) slotRune(s.id,want); }   /* R11: slot the preferred rune ('runes':'a'|'b'), else the other; "off":["runes"] */   // ultimates open at level 20
    if(B.faith&&(typeof faithOpen==='function'?faithOpen():S.player.lvl>=FAITH_LV)&&!faithOf()) swear(B.faith);   // opts.faith: 'hon' or 'dis'
    if(B.full&&!B.off.calls&&typeof forecast==='function'&&forecast()) botOmens();   // R8: call the god's best omen when devotion past rank 5 (or the Temple) pays for it; ward Soul Storm; "off":["calls"]
    if(typeof markPend==='function'&&!(B.off&&B.off.marks)) for(const m of raidPool()) while(markPend(m)&&chooseMark(m.uid,markOpts(m)[0]));   // evolution marks: mark A at Elder, empowered at Eternal; "off":["marks"] takes none
    const isc=it=>itemScore(ITEM[it.id])+(B.full&&!B.off.riftborn&&B.rbOn&&it.rb?20+it.rb.d/4:0)+(B.full&&it.hf?30:0);   // R9 PR B: 'full' wears its Riftborn pieces over uniques for its Rift dives (B.rbOn), and its uniques elsewhere; "off":["riftborn"]
    for(const sl of GEAR_SLOTS){
      const cur=S.equip[sl]; let best=null, bs=cur?isc(cur):-1;
      for(const it of S.inv){ const d=ITEM[it.id]; if(d.slot===sl&&isc(it)>bs){ best=it; bs=isc(it); } }
      if(best) equip(best.u);
    }
    if(B.skills&&!B.off.mgear&&S.mode==='town') for(const m of S.army.concat(S.reserve||[])) if(m.armed) for(const sl of GEAR_SLOTS){ const cur=m.eq&&m.eq[sl]; let best=null, bs=cur?itemScore(ITEM[cur.id])+(ITEM[cur.id].flag?50:0):-1;   /* R12: gear-bearers take the best spare piece (a unique first); "off":["mgear"] */
      for(const it of S.inv){ const d=ITEM[it.id]; const sc=itemScore(d)+(d.flag?50:0); if(d.slot===sl&&sc>bs){ best=it; bs=sc; } } if(best) giveGear(m.uid,best.u); }
    if(!B.off.specs&&typeof chooseMSpec==='function'&&S.mode==='town'){ const T={vanguard:'bastion',striker:'cleaver',mender:'saint',reaper:'executioner',hexer:'malign'}; for(const m of S.army.concat(S.reserve||[])) if(mspecPend(m)) chooseMSpec(m.uid,T[m.role]); }   /* R12: specs by a fixed table; "off":["specs"] */
    if(B.skills&&!B.off.charms&&typeof craftCharm==='function'&&S.mode==='town'){   /* R12: make charms (best kits first) and give them out, front row the guards; "off":["charms"] */
      const want=['banner','shield','call','stance','pack','frenzy','marker','ambush','thief','skirm','burrow','thorns','hexer','bomb','purify','sapper'], need=S.army.filter(m=>!m.charm).length;
      for(let g=0;g<need;g++){ const n=charmKinds().filter(x=>!craftWhy(x)).sort((a,b)=>want.indexOf(KIT_OF[a])-want.indexOf(KIT_OF[b])||charmV({k:KIT_OF[b],src:b})-charmV({k:KIT_OF[a],src:a}))[0]; if(!n||S.gold<charmCost(n)*3) break; craftCharm(n); }
      const DEF=['shield','stance','skirm','burrow','thorns','call'];
      for(const m of S.army.filter(x=>!x.charm)){ const P=S.charms||[]; if(!P.length) break; const front=m.role==='vanguard';
        let i=P.findIndex(c=>front===DEF.includes(c.k)); if(i<0) i=0; giveCharm(m.uid,i); }
    }
    if(B.full&&!B.off.riftborn&&typeof attune==='function'&&S.mode==='town') for(const sl of GEAR_SLOTS){ const it=S.equip[sl]; if(it&&it.rb) while(attune(it.u)); }   // attune what it wears
    if(B.full){   // the new economy: claim bounties, salvage the better spares for dust, build, enchant what you wear
      if(B.full&&typeof wagerOpen==='function'&&wagerOpen()&&rivalToday()&&!arc().wg){ const c=(S.reserve||[]).filter(canStake).sort((a,b)=>cval(a)-cval(b))[0]; if(c) wager(c.uid); }   // R7: stake the weakest Reserve body they would take
      if(!B.off.town2) botOrders(B);   // take today's order before the bounties are claimed (Old debt)
      if(!B.off.bounty&&townOpen()) for(let i=0;i<3;i++) claimBounty(i);   // the board shows once the town opens
      if(!B.off.salvage) for(const it of S.inv.slice()) if(!ITEM[it.id].uq&&ITEM[it.id].tier>=2&&!it.rb&&!it.hf) salvage(it.u);   /* keeps Riftborn pieces for the Rift */
    }
    if(B.market){   // sell everything not worn, buy better gear from the merchant, keep the potion belt full
      if(B.full&&!B.off.forge&&typeof heartforge==='function') hfPolicy(B);   // heart-forging before the hearts are sold ("off":["forge"])
      if(B.full&&!B.off.brew&&typeof brewIt==='function') brewPolicy(B);   // brewing, commissions and the black market before the pouch is sold ("off":["brew"])
      if(!(typeof vowWarn==='function'&&vowWarn('sell'))) sellAllTrophies(); for(const it of S.inv.slice())   /* R8: Ulm's vow */ if(!ITEM[it.id].uq&&!it.rb&&!it.hf) sellItem(it.u);
      shopStock().forEach((s,i)=>{ if(s.sold) return; const d=ITEM[s.id], cur=S.equip[d.slot];
        if((!cur||itemScore(d)>isc(cur))&&S.gold-buyPrice(d)>=POTIONS.hp.price()*2&&buyStock(i)){ const it=S.inv[S.inv.length-1]; equip(it.u); for(const x of S.inv.slice()) if(!ITEM[x.id].uq&&!x.rb&&!x.hf) sellItem(x.u); } });
      while(buyPotion('hp')); while(buyPotion('mp')); while(buySalt());
      // Bone Altar: strongest minions first, keeping enough gold to refill potions next time
      const reserve=(POTIONS.hp.price()+POTIONS.mp.price())*BELT_MAX;
      if(B.full){
        if(typeof repairBuilding==='function'&&S.siege&&S.siege.dmg) repairBuilding();   // a building burned in a siege: repair it first
        if(townOpen()) for(const k of ['crypt','ossuary','altar','forge']){ const c=buildCost(k); if(!B.off[k]&&c&&S.gold-c[0]>=reserve) build(k); }
        if(townOpen()&&!B.off.town2&&typeof townPolicy==='function') townPolicy(B,reserve);   // the R5 buildings and specializations ("off":["town2"])
        if(typeof buildWork==='function'&&!B.off.siegetiers) for(const k of ['caltrops','palisade']) if(WORKS[k]&&S.gold-WORKS[k].g>=reserve) buildWork(k);   // R14: the caltrops and the palisade
        if(!B.off.enchant) for(const sl of GEAR_SLOTS){ const it=S.equip[sl]; if(it&&!ITEM[it.id].uq) while((it.ro||[]).length<lineMax(it)&&enchant(it.u,-1)); }
        if(!B.off.awaken&&typeof awaken==='function') for(let g=0;g<25;g++){   // awakening: the cheapest rank of a worn unique while 10000 gold stays in hand ("off":["awaken"])
          const c=GEAR_SLOTS.map(sl=>S.equip[sl]).filter(it=>it&&canAwaken(it)).sort((a,b)=>awakenCost(a).g-awakenCost(b).g)[0];
          if(!c||S.gold-awakenCost(c).g<10000||!awaken(c.u)) break; }
        if(!B.off.temper&&typeof temper==='function') for(let g=0;g<200&&S.gold>10000;g++){   // tempering: worn lines, cheapest first, keeping 10000 gold in hand
          const c=[]; for(const sl of GEAR_SLOTS){ const it=S.equip[sl]; if(it) (it.ro||[]).forEach((r,i)=>{ if(temperTo(it,i)!=null) c.push([temperCost(it),it,i]); }); }
          c.sort((a,b)=>a[0]-b[0]); if(!c.length||S.gold-c[0][0]<10000||!temper(c[0][1].u,c[0][2])) break; }
        if(!B.off.fuse&&S.army.length>=slots()){ const by={}; for(const m of S.army) (by[m.role]=by[m.role]||[]).push(m);
          const pair=Object.values(by).filter(a=>a.length>=2).map(a=>a.sort((x,y)=>cval(x)-cval(y)).slice(0,2)).sort((a,b)=>cval(a[0])-cval(b[0]))[0];
          if(pair&&S.gold-fuseCost(pair[0],pair[1])>=reserve) fuse(pair[0].uid,pair[1].uid); }
      }
      for(const m of S.army.slice().sort((a,b)=>cval(b)-cval(a))){ while(S.gold-empowerCost(m)>=reserve&&empower(m.uid)); }
      if(B.full&&!B.off.maus&&typeof raiseMaus==='function') for(let i=0;i<MAUS_MAX;i++){ const j=(S.memorial||[]).findIndex(e=>!e.maus); if(j<0||S.gold-mausCost()<reserve||!raiseMaus(j)) break; }   // mausoleums: the late gold sink, with what the Altar leaves
      if(B.full&&!B.off.head&&typeof carveHead==='function') for(let g=0;g<500;g++){   // headstones last: the cheapest next tier while 10000 gold stays in hand; "off":["head"] carves none
        const M=S.memorial||[]; let j=-1; M.forEach((e,i)=>{ if((e.hs|0)<HEAD_TOP&&(j<0||headCost(e)<headCost(M[j]))) j=i; });
        if(j<0||S.gold-headCost(M[j])<Math.max(10000,reserve)||!carveHead(j)) break; }
    }
    if(useRes(B)){   // the Reserve: whoever is stronger than the weakest army minion swaps in; a full bench lets its weakest go
      for(let i=0;i<20;i++){ const R=S.reserve||[], r=R.slice().sort((a,b)=>cval(b)-cval(a))[0], w=S.army.slice().sort((a,b)=>cval(a)-cval(b))[0]; if(!r) break;
        if(armyRoom()){ toArmy(r.uid); continue; } if(!w||cval(r)<=cval(w)) break; swapReserve(w.uid,r.uid); }
      while((S.reserve||[]).length>=reserveMax()) release(S.reserve.slice().sort((a,b)=>cval(a)-cval(b))[0].uid);
      for(const m of (S.waiting||[]).slice()) release(m.uid);
    } else if(B.full&&typeof reserveOpen==='function'&&reserveOpen()){   // "off":["reserve"]: keep no bench; raiders who came home to it take an army place if they are stronger, or go
      for(const r of benched().sort((a,b)=>cval(b)-cval(a))){ const w=S.army.slice().sort((a,b)=>cval(a)-cval(b))[0];
        if(!armyRoom()&&w&&cval(r)>cval(w)) release(w.uid);
        if(armyRoom()&&S.reserve.includes(r)) toArmy(r.uid); else if(armyRoom()&&S.waiting.includes(r)) fromGate(r.uid,'army'); else release(r.uid); }
    }
    if(B.full&&!B.off.raid&&typeof expChoose==='function'&&!(B.off&&B.off.exp)) for(let i=(S.raids||[]).length-1;i>=0;i--){ const x=S.raids[i]; if(!(x.night>0)||x.night>=x.nights) continue;   // the dawn choice: press on at 70% or better, else come home
      expChoose(i,expNightOdds(x.units,x.t,{pressed:x.pressed||0})>=.7?'press':'home'); }
    if(B.full&&!B.off.raid&&typeof sendRaid==='function'&&!(S.raidOrders||[]).length&&S.army.length>=5&&S.watches===1){   // before the day's last run, order a Commander and its weakest companions
      const c=S.army.filter(m=>isCommander(m)&&!inOrder(m)).sort((a,b)=>cval(b)-cval(a))[0];
      if(c){ const pool=S.army.filter(m=>m!==c&&!inOrder(m)).sort((a,b)=>cval(a)-cval(b)), max=Math.min(2,squadMax(c)-1), fol=[];
        if(B.off&&B.off.exp) fol.push(...pool.slice(0,max));
        else { const need=[m=>m.role==='vanguard',m=>m.role==='striker'||m.role==='reaper',m=>m.role==='mender'];   // R6: the weakest who cover the three steps, then the weakest left
          for(const f of need){ if(fol.length>=max) break; if(fol.some(f)||(f===need[0]&&c.role==='vanguard')||(f===need[1]&&(c.role==='striker'||c.role==='reaper'))) continue; const m=pool.find(y=>f(y)&&!fol.includes(y)); if(m) fol.push(m); }
          for(const m of pool){ if(fol.length>=max) break; if(!fol.includes(m)) fol.push(m); } }
        const units=[c].concat(fol), T=typeof expTargets==='function'&&!(B.off&&B.off.exp)?expTargets():raidGates().map(di=>({k:'gate',di})), od=t=>typeof expNightOdds==='function'?expNightOdds(units,t,{}):raidOdds(units,t.di);
        const pick=T.filter(t=>t.k==='curse'&&od(t)>=.55)[0]||T.filter(t=>t.k==='gate').reverse().find(t=>od(t)>=.55)||T.find(t=>t.k==='band'&&od(t)>=.55)||T.find(t=>t.k==='scav'&&od(t)>=.55);
        if(pick&&fol.length) sendRaid(c.uid,pick.di,fol.map(m=>m.uid),pick,(pick.k==='gate'||pick.k==='curse')&&od(pick)>=.8&&!(S.siege&&S.siege.next&&S.siege.next-S.day<=2)&&!(B.lastDay&&S.day>B.lastDay-2)?2:1); }   // two nights only with no siege close and days left
    }
    if(S.inv.length>20){ S.inv.sort((a,b)=>itemScore(ITEM[b.id])-itemScore(ITEM[a.id])); S.inv=S.inv.filter((it,i)=>i<12||ITEM[it.id].uq); }
  }
  // fair bots enter the highest gate they meet the Recommended level for; push bots enter the highest gate they have unlocked.
  function pickGate(B){ if(B.force!=null) return B.force; const l=S.player.lvl; let g=0; for(let i=0;i<DUNGEONS.length;i++) if((typeof gateLocked==='function'?!gateLocked(i):l>=RK[i].unlock)&&(B.push||l>=SAFE[i]+(typeof ngpRec==='function'?Math.round(ngpRec(i)):0))) g=i; return g; }   /* Vane Abbey opens by its keys, not by level */

  // ----- battle: one decision per turn
  function chooseTarget(B){
    const all=liveFoes(), f0=typeof reachable==='function'?all.filter(reachable):all, f=f0.length?f0:all;
    if(B&&!(B.off&&B.off.kits)&&typeof kitOf==='function'){   /* foe kits: Banner-bearer, then a Gravecaller that can still call, Shieldbearer, Purifier; a Bomber last while your front row stands */
      const rank=e=>{ const k=kitOf(e); return k==='banner'?0:k==='call'&&!e.gcU?1:k==='shield'?2:k==='purify'?3:e.role==='mender'?4:k==='bomb'&&S.army.some(m=>m.hp>0&&rowOf(m)==='f')?9:5; };
      const bloom=all.some(e=>e.twist==='bloom'), seedR=e=>bloom&&e.seed!=null?-1:0;   /* the Orchard Mother's Bloom: kill seedlings before they mature */
      const pool=f.slice().sort((a,b)=>seedR(a)-seedR(b)||rank(a)-rank(b)||a.hp-b.hp); setTarget(pool[0].id); return pool[0]; }
    const men=f.filter(e=>e.role==='mender'), pool=(men.length?men:f).slice().sort((a,b)=>a.hp-b.hp);
    setTarget(pool[0].id); return pool[0];
  }
  const kitWard=(B,want)=>{ if(!B||(B.off&&B.off.kits)||typeof kitOf!=='function') return want;   /* never ward into a Sapper's blow; ward before an ambush or a surfacing Burrower on you */
    const its=liveFoes().filter(e=>!(e.stun>0)&&e.it&&e.it.k==='atk'&&e.it.t==='p');
    if(its.some(e=>hasKit(e,'sapper'))) return false; if(its.some(e=>e.it.amb||e.it.sf)) return true; return want; };
  function goOn(B){   /* R13: the nemesis's sigil door when it stands at most NEM_DOOR_LV levels above the room; "off":["nemesis"] */
    const r=S.run; if(!B.off.nemesis&&typeof nemUp==='function'&&r.doors&&r.doors.includes('nem')){ const ne=((r.pre&&r.pre.nem)||[]).find(e=>e.nem), n=ne&&nemById(ne.nem); if(n&&nemUp(n)<=NEM_DOOR_LV) return descend('nem'); }
    return descend(); }
  function decide(B){
    if(!B.off.actives&&typeof canActive==='function'){ const fo=liveFoes(), boss=fo.some(e=>e.boss), t0=currentTarget();   /* R12: Elder actives when they beat the hero's action; "off":["actives"] */
      for(const m of S.army){ if(!canActive(m)) continue; const R=m.role;
        if(R==='striker'&&t0&&t0.hp<m.atk*dmgMul()*MA_EXEC*maEmp(m)*.8) return 'ma:'+m.uid;
        if(R==='reaper'&&fo.length>=2) return 'ma:'+m.uid;
        if(R==='mender'){ const L=S.army.filter(a=>a.hp>0); if(L.length>=3&&L.reduce((s,a)=>s+a.hp/a.maxHp,0)/L.length<.5) return 'ma:'+m.uid; }
        if(R==='vanguard'&&fo.some(e=>e.charging)) return 'ma:'+m.uid;
        if(R==='hexer'&&boss&&t0&&t0.boss&&S.run.turn<=2) return 'ma:'+m.uid; } }
    if(B.skills&&!B.off.sig&&typeof canSgn==='function'&&canSgn()){ const sp=sgnPath(), fo=liveFoes(), live=S.army.filter(m=>m.hp>0); if(fo.some(e=>e.boss)||fo.length>=3||(sp==='blood'&&live.length&&live.reduce((a,m)=>a+m.hp/m.maxHp,0)/live.length<.5)){ useSgn(); if(S.mode!=='battle') return 'none'; } }   /* R11: the signature (a free action) on a boss or a crowd; "off":["sig"] */
    const P=S.player, t=chooseTarget(B), max=pMax(), res=Math.min(15,Math.round(pMana()*.2)), foes=liveFoes();
    if(B.full&&!(B.off&&B.off.rally)&&typeof canRally==='function'&&canRally()){ const aff=S.army.filter(m=>m.hp>0&&(Object.keys(m.st||{}).length||Object.keys(m.dots||{}).length)).length; rally(aff>=2?'cleanse':'dmg'); }   // R6: a Commander's free Rally, once a room
    const charging=foes.find(e=>e.charging);   // a boss is winding up a telegraphed move: freeze it, or ward against the hit
    if(charging){
      const mv=charging.move||charging.abil;
      if(B.full&&!B.off.orders&&mv==='sunder'&&canCommand('vanguard')) command('vanguard');   // orders are free: send the blow at a vanguard
      if(mv==='edict'&&charging.charging){ const named=S.army.find(m=>fxKey(m)===charging.edictT&&m.hp>0);   /* the Edict of Ash: Taunt onto another vanguard, else Guard */
        if(named&&B.full&&!B.off.orders&&canCommand('vanguard')&&S.army.some(m=>m!==named&&m.role==='vanguard'&&m.hp>0)) command('vanguard');
        else if(named&&B.full&&!B.off.guard&&typeof canGuard==='function'&&canGuard()&&guardFront()!==named&&!(B.skills&&canUse('chill'))) return 'guard'; }
      if(B.full&&!B.off.orders&&canCommand('striker')){ setTarget(charging.id); command('striker'); }   // and let a Focus crit break the charge
      if(B.skills&&charging.charging&&canUse('chill')&&P.mana>=SKILL.chill.cost){ setTarget(charging.id); return 'sk:chill'; }
      if((mv==='decree'||mv==='cinder'||mv==='sunder'||mv==='lance'||mv==='called')&&charging.charging&&P.mana>=6&&P.shield<max*.3) return 'ward';
    }
    { const ab=typeof BK_TIDE!=='undefined'&&foes.find(e=>e.tide>=BK_TIDE-1&&!(e.stun>0)); if(ab&&B.skills&&canUse('chill')){ setTarget(ab.id); return 'sk:chill'; } }   /* the Drowned Abbot's tide: freeze it before the flood */
    if(S.run.conf&&P.mana>=6) return 'ward';   /* Confession: ward to end it */
    if(B.full&&!B.off.guard&&typeof canGuard==='function'&&canGuard()&&(foes.some(e=>{ if(!e.charging||e.stun>0) return false; const s=sigBlow(e,e.move||e.abil); return s&&s.you>=P.hp; })||P.hp<max*.25&&foes.some(e=>{ const i=e.stun>0?null:intentInfo(e); return i&&i.k==='atk'&&i.tg.id==='p'&&foeBlow(e,i.tg)>=P.hp; }))) return 'guard';   // Guard ('full' only; "off":["guard"]): a telegraphed move that would kill you, or under 25% HP a plain blow on you that would
    if(B.skills&&canUlt()){ const u=P.ult, down=S.army.filter(m=>m.hp<=0).length;
      if(u==='toll'&&foes.length>=2) return 'ult';
      if(u==='rise'&&(down>=2||P.hp<max*.4||(down>=1&&t.boss))) return 'ult';
      if(u==='prison'&&(t.boss||foes.length>=3||charging)) return 'ult';
      if(u==='requiem'&&(t.boss||S.army.filter(m=>m.hp>0).length>=3)) return 'ult';
      if(u==='longname'&&foes.filter(e=>!e.boss).length>=3) return 'ult'; }
    if(B.full&&!B.off.brew&&S.belt.iron&&charging&&charging.charging&&!(S.run.iron>=S.run.turn)) return 'pot:iron';   /* an Iron Draught under a telegraphed blow */
    if(B.full&&!B.off.brew&&S.belt.blood&&S.army.filter(m=>m.hp>0).length>=2&&S.army.filter(m=>m.hp>0).reduce((a,m)=>a+m.hp/m.maxHp,0)/S.army.filter(m=>m.hp>0).length<.45) return 'pot:blood';
    if(B.market&&P.hp<max*.3&&S.belt.hp) return 'pot:hp';
    if(B.market&&P.mana<10&&P.hp<max*.6&&S.belt.mp) return 'pot:mp';
    if(P.hp<max*.35&&P.mana>=8) return 'siphon';
    if(B.skills){
      const ok=id=>canUse(id)&&P.mana-SKILL[id].cost>=res, live=S.army.filter(m=>m.hp>0);
      if(ok('reap')&&t.hp<t.maxHp*(typeof reapLow==='function'?reapLow():.35)&&t.hp>pAtk()) return 'sk:reap';
      if(ok('blast')&&foes.length>=2&&!(faithOf&&faithOf()==='vesh'&&foes.some(f=>f.dots&&f.dots.blight))) return 'sk:blast';   // Vesh: no Spreading Rot
      if(ok('mend')&&live.length&&live.reduce((a,m)=>a+m.hp/m.maxHp,0)/live.length<.55) return 'sk:mend';
      if(ok('chill')&&(t.boss||foes.length>=3)) return 'sk:chill';
      if(SKILL.lance&&ok('lance')&&(t.boss||foes.length>=2)&&!(t.stun>0)) return 'sk:lance';
      if(ok('frenzy')&&live.length>=2) return 'sk:frenzy';
      if(ok('curse')&&t.hp>pSiph()*3) return 'sk:curse';
      if(ok('spear')&&t.hp>pAtk()) return 'sk:spear';
    }
    if(P.shield===0&&P.mana>=6+res&&kitWard(B,P.hp<max*.6)) return 'ward';
    if(P.mana>=8+res&&pSiph()>=pAtk()) return 'siphon';
    return 'strike';
  }
  const CURC={}, STC={t:{},d60:[],d100:[],pn:0,pw:0}, RZ={t:0,ok:0}, SWC={n:0,stop:0}, HFC={n:0,g:0}, BRC={n:0,g:0,comm:0,commG:0,bm:0};
  const useRes=B=>B&&B.full&&!B.off.reserve&&typeof reserveOpen==='function'&&reserveOpen();   // the Reserve, switchable with "off":["reserve"]
  function raisePhase(B){
    const r=S.run, P=S.player;
    for(const c of r.corpses.filter(c=>!c.tried).sort((a,b)=>cval(b)-cval(a))){
      if(P.mana<raiseCost(c)) continue; if(typeof vowWarn==='function'&&vowWarn('raise')) break;
      if(c.role==='hexer'&&(B.off.hexer||(typeof hexCap==='function'&&S.army.filter(m=>m.role==='hexer').length>=hexCap()))) continue;   /* R12: hexers up to the cap; "off":["hexer"] raises none */   // R8: Morrow's vow (no more than 10 a run)
      if(S.army.length>=slots()){
        const w=S.army.slice().sort((a,b)=>cval(a)-cval(b))[0];
        const better=w&&cval(w)<cval(c)-3&&raiseChance(c)>=40;   // worth an army place now
        if(!better&&useRes(B)&&r.cleared&&reserveRoom()&&w&&cval(c)>cval(w)&&raiseChance(c)>=40){ tryRaise(c.id,S.salts>0&&(c.boss||c.elite),true); continue; }   // the gate is done, so mana is free: bench it, swap it in at the gate
        if(!better) continue;
        release(w.uid);
      }
      tryRaise(c.id, typeof S.salts==='number'&&S.salts>0&&(c.boss||c.elite));   // salts on the bodies worth the most
    }
    if(B&&B.full&&!B.off.embalm&&typeof embCan==='function') for(const c of r.corpses.filter(c=>!c.tried&&!c.boss).sort((a,b)=>cval(b)-cval(a))) if(embCan(c)&&cval(c)>=Math.min(...S.army.map(cval),99)) embKeepId(c.id);   // the Embalmery: the best body left untried goes home
    for(const c of r.corpses) if(c.tried&&!c._z&&(c.result==='raised'||c.result==='failed')){ c._z=1; RZ.t++; if(c.result==='raised') RZ.ok++; }   // raise attempts and successes (the report's raise rate; bodies spent by Corpse Explosion or taken by the rival are not attempts)
  }
  // between-room events and event chains ('full' only; "off":["events"] walks past them all, as the other modes do): what a careful player
  // takes from what the screen shows (HP, gold, belt, army places), never from the hidden outcome of a chain
  const EVT_PICK={
    shrine:f=>f.hp>=.6?'bleed':'pass', pedlar:f=>'buy', coffer:f=>f.hp>=.5?'open':'pass', oldgods:f=>'pray', defiled:f=>f.hp>=.4?'take':'pass', vshrine:f=>'pray', ushrine:f=>'pray', cshrine:f=>'pray', godshrine:f=>f.can('desecrate')?'desecrate':'pass',   /* R8: keeps its god */
    straggler:f=>f.room?'raise':'finish', priest:f=>f.hp>=.4?'spare':'pass', priest_back:f=>f.hp<.6?'bless':'warn',
    priest_kin:f=>f.can('pay')?'pay':f.hp>=.5?'fight':'pass', reliquary:f=>f.can('offer')?'offer':'pass', relic_curse:f=>f.can('return')?'return':f.hp>=.5?'endure':'pass',
    relic_gift:f=>'take', deserter:f=>f.can('pay')?'pay':'bread', deserter_true:f=>'take', deserter_false:f=>f.can('pay')?'pay':f.hp>=.5?'fight':'pass',
    rfold:f=>f.hp>=.8?'skip':'pass', rmem:f=>f.room?'raise':'free', rfrag:f=>'read', rshrine:f=>f.hp>=.7?'tear':'pass',   /* R9 PR B: the Rift's events */
    mourners:f=>f.room?'take':'bless', hanged:f=>f.hp>=.6?'cut':'leave', patrol:f=>'spare', bonemerch:f=>'pass', bell:f=>'pass', statue:f=>'tears', thief:f=>f.hp>=.6?'duel':'pass', fever:f=>'pass', wagon:f=>'cargo',
    saint:f=>f.can('break')&&faithOf()==='dis'?'break':'pass', tanner:f=>'take', tanner_2:f=>f.can('pay')?'pay':f.hp>=.5?'fight':'pass', tanner_3:f=>f.can('settle')?'settle':'pass',
    warden:f=>'take', warden_2:f=>f.hp>=.5?'rest':'pass', warden_3:f=>f.hp>=.5?'stand':'pass', ashchoir:f=>'listen', ashchoir_2:f=>f.hp>=.4?'search':'pass', ashchoir_3:f=>f.room?'bind':'free'};   /* R13 PR B: the valley's events and chains */
  function playEvent(B){
    const r=S.run, ev=r&&r.event; if(!B.full||B.off.events||!ev||ev.done||!EVENTS[ev.id]) return;
    const E=EVENTS[ev.id], f={hp:S.player.hp/pMax(),room:S.army.length<slots(),can:k=>!E.off||!E.off(k)}, ch=(EVT_PICK[ev.id]||(()=>'pass'))(f);
    const got=resolveEvent(ch)?ch:resolveEvent('pass')?'pass':'none', last=r.events[r.events.length-1], k=(E.chain?'chain ':'')+ev.id+':'+got;   // a choice it cannot take falls back to walking past
    B.ev=B.ev||{}; B.ev[k]=(B.ev[k]||0)+1; if(got!=='none'&&last.c) B.ev[last.c]=(B.ev[last.c]||0)+1;   // also counts outcomes the log marks good (ok) or bad
  }
  function hfPolicy(B){   // forge a heartforged piece for a worn slot that is neither unique nor heartforged, from the best spare heart, keeping 3000 gold
    const pref=['atk','mpow','crit','hp','will','raise','siph','ward','mana','constitution','strength','intelligence','fdmg','frdmg','rdmg','sdmg','fres','frres','rres','sres'];
    for(const sl of GEAR_SLOTS){ const cur=S.equip[sl]; if(cur&&(ITEM[cur.id].uq||cur.hf||(cur.rb&&!B.off.riftborn))) continue; const cs=cur?ITEM[cur.id].set:-1;
      const hs=hfHearts().filter(k=>(S.trophies[k]||0)-1>=heartsKept(k)).map(k=>k.slice(2)).filter(b=>hfInfo(b).set>=cs).sort((a,b)=>hfInfo(b).set-hfInfo(a).set||hfInfo(a).gold-hfInfo(b).gold);
      for(const boss of hs){ const I=hfInfo(boss), c=hfCost(boss); if(S.gold-c.g<3000||(S.dust||0)<c.d) continue;
        const lines=hfLinesFor(boss,sl).sort((a,b)=>pref.indexOf(a)-pref.indexOf(b)).slice(0,I.n-(I.pw?1:0)); const it=heartforge(boss,sl,lines); if(it){ equip(it.u); HFC.n++; HFC.g+=c.g; } break; } }
  }
  function botOrders(B){
  if(!B.off.orders&&typeof orders==='function'){ const O=orders(); if(O&&O.pick<0){ const pref=['hunt','debt','tribute','harvest','clean','climb','watch'];   // R5 PR B: take the order the bot can do, a Hunt first ("off":["orders"] takes none)
    const roles=new Set(S.army.map(m=>m.role)); let best=-1, bs=99; O.list.forEach((o,i)=>{ let r=pref.indexOf(o.k); if(r<0) return; if(o.k==='harvest'&&!roles.has(o.role)) r+=5; if(r<bs){ bs=r; best=i; } });
    if(best>=0&&pickOrder(best)){ TW2C.ord++; if(O.list[best].k==='watch'&&S.watches>1) standWatch(); } } }
}
// R5: the second ring of buildings, their specializations, the Embalmery and the Grave Market
const BOT_SPEC={crypt:{3:'b',5:'b'},forge:{3:'a',5:'a'},ossuary:{3:'b',5:'b'},altar:{3:'a',5:'b'},yard:{3:'b',5:'a'},library:{3:'a',5:'a'},embalm:{3:'b',5:'a'},bell:{3:'b',5:'a'},apoth:{3:'a',5:'b'},war:{3:'a',5:'a'}};
const TW2C={n:0,spec:0,emb:0,omen:0,ord:0};
function townPolicy(B,reserve){
  for(const k of ['yard','library','embalm','apoth','war','bell','temple']){ if(B.off[k]||!bOpen(k)) continue; const c=buildCost(k); if(c&&S.gold-c[0]>=Math.max(reserve,5000)&&build(k)) TW2C.n++; }
  for(const k in SPEC) for(const lv of specPend(k)) if(chooseSpec(k,lv,(BOT_SPEC[k]||{})[lv]||'a')) TW2C.spec++;
  if(!B.off.embalm) for(let i=(S.embalm||[]).length-1;i>=0;i--){ if(!armyRoom()&&!reserveRoom()) break; if(embRaise(i)) TW2C.emb++; }
  if(B.dread&&typeof dreadOn==='function'&&dreadOn()) S.dread=B.dread==='calm'?Math.min(dreadOf(),10):B.dread==='afraid'?clamp(dreadOf(),55,75):B.dread==='terror'?Math.max(dreadOf(),85):dreadOf();   // a probe holds the town in one band
  if(typeof titheReady==='function'&&titheReady()&&(B.dread==='calm'||(B.dread!=='terror'&&dreadOf()>=45&&S.gold>20000))) payTithe();   // keep the town Uneasy; "dread":"calm"|"terror" probes the bands
  if(typeof omenReady==='function'&&omenReady()&&dayOmen().id&&/drought|plague|still/i.test(dayOmen().id)&&callOmen()) TW2C.omen++;
}
function brewPolicy(B){   // keep one oil (the deepest open gate's weakness), incense, a Second Draft and a Banner of Courage armed; draughts on the belt; fill trophy commissions; trade dust, wardens and a Soul at the black market
    const keep=3000, mk=id=>{ if(S.gold-brewGold(id)<keep) return false; const g=S.gold; if(brewIt(id)){ BRC.n++; BRC.g+=g-S.gold; return true; } return false; };
    commissions().forEach((c,i)=>{ if(c.k==='tro'){ const p=commFill(i); if(p){ BRC.comm++; BRC.commG+=p.g; } } });
    if(bmOpen()){ for(const k of ['dust','warden']) if(bmTrade(k)) BRC.bm++; if(S.gold>20000&&bmTrade('soul')) BRC.bm++; }
    const weakOf=gi=>{ const res=GATE_RES[gi]||{}, w=Object.keys(res).filter(t=>res[t]<0)[0]; return w?'oil_'+w:null; };
    for(const gi of [topGate(),Math.max(0,topGate()-1)]){ const o=weakOf(gi); if(o&&stashN(o)<1) mk(o); }   // the oils for the two deepest gates; playRun arms the one that fits
    const want=[['inc_grave','inc'],['inc_low','inc'],['ch_draft','charm'],['bn_courage','banner']];
    for(const [id,kind] of want){ if(!id||!BREWS[id]) continue; if(S.prep&&S.prep[kind]&&stashN(S.prep[kind])>0) continue; if(stashN(id)<1) mk(id); if(stashN(id)>0) prepSet(kind,id); }
    for(const id of ['dr_iron','dr_blood']) while((S.belt[BREWS[id].belt]||0)<2&&mk(id));
  }
  function playRun(B,rec){
    const duel=typeof rivalToday==='function'&&rivalToday()&&S.player.lvl>=RK[rv().gi].unlock, gi=duel?rv().gi:pickGate(B), lvl=S.player.lvl;   // a rival's challenge today: go and meet it (rivalOpen is off outside 'full')
    if(B.heat&&B.hw&&B.hw[gi]!=null&&S.day-B.hwDay[gi]>=3) delete B.hw[gi];   // try again a few days later
    if(B.heat){ B.hw=B.hw||{}; setHeat(gi,Math.min(B.heat,heatMax(gi),B.hw[gi]==null?9:B.hw[gi])); }   // opts.heat: the highest difficulty the bot picks; it steps down a level after each death there
    if(!duel&&!B.off.sweep&&typeof sweepOk==='function'&&sweepOk(gi)){ sweep(gi); SWC.n++;   /* an outgrown gate is swept; only a stopped sweep (a secret master) is fought, and left out of the table */
      if(S.mode==='raise'){ returnTown(); return; } SWC.stop++; let g=0; while(S.mode==='battle'&&g++<400) act(decide(B)); if(S.mode==='raise'){ raisePhase(B); } returnTown(); return; }
    if(B.full&&!B.off.brew&&typeof prepSet==='function'){ const res=GATE_RES[gi]||{}, w=Object.keys(res).filter(t=>res[t]<0)[0], o=w?'oil_'+w:null; S.prep=S.prep||{}; if(o&&stashN(o)>0) S.prep.oil=o; else delete S.prep.oil; }   // arm the oil of this gate's weakness, or none
    startRun(gi);
    if(S.mode!=='battle'){ S.watches=0; endDay(); return; }
    const run={gate:gi,lvl,diff:lvl-SAFE[gi],heat:S.run.heat||0,mod:S.run.mod||null,cleared:false,died:false,left:false,rooms:0,turns:0,hpEnd:[]}; if(duel) run.rival=1; let guard=0;   // a challenge run is left out of the gate table (reported on the rival line)
    for(;;){
      if(S.mode==='battle'){ if(++guard>400){ flee(); run.left=true; break; } if(S.run.enemies.some(e=>e.boss&&!e.secret&&!e.rival)){ run.bossIn=1; run.bossT=(run.bossT||0)+1; } act(decide(B)); run.turns++; continue; }   /* bossIn, bossT: the boss room and its actions */
      if(S.mode==='raise'){
        run.rooms++; run.hpEnd.push(S.player.hp/pMax()); playEvent(B); raisePhase(B);
        if(S.run.cleared){ run.cleared=true; returnTown(); break; }
        const P=S.player, live=S.army.filter(m=>m.hp>0).length;
        if(P.hp+pMax()*DIFF.heal>=pMax()*.5||(P.hp>=pMax()*.3&&live>=2)) goOn(B); else { run.left=true; returnTown(); break; }
        continue;
      }
      if(S.mode==='defeat'){ run.died=true; if(B.heat){ B.hw[gi]=Math.max(0,run.heat-1); B.hwDay=B.hwDay||{}; B.hwDay[gi]=S.day; } returnTown(); break; }
      break;
    }
    rec.push(run); if(!run.rival){ const k=run.mod||'-', c=CURC[k]=CURC[k]||{n:0,c:0}; c.n++; if(run.cleared) c.c++; }   /* clears by curse (R13) */
  }
  function climb(B,from){   // one tower climb (from floor 1 unless told otherwise), never retreating; returns the highest floor cleared
    S.watches=Math.max(1,S.watches); S.mode='town'; S.run=null; startTower(from||1); let guard=0;
    while(S.mode!=='town'&&guard++<60000){
      if(S.mode==='battle') act(decide(B));
      else if(S.mode==='raise'){ playEvent(B); raisePhase(B); if(S.run.cleared) break; descend(); }
      else break;
    }
    return S.tower.best;
  }
  function tierProbe(B,seed,out){   // opts.tiers: at dawn every few days, fight given gates once per difficulty from a copy of the bot (own random numbers), then go on as if nothing happened
    const T=B.tiers, snap=JSON.stringify(S), rand=Math.random, lvl=S.player.lvl;
    try{ for(const gi of T.gates) for(const h of (T.heats||[1,2,3])){
      if(lvl<RK[gi].unlock||(T.near!=null&&Math.abs(lvl-tierRec(gi,h))>T.near)) continue;
      S=JSON.parse(snap); Math.random=mulberry32(seed*7919+S.day*31+gi*5+h); if(typeof ABBEY!=='undefined'&&gi===ABBEY) abbeyState().open=1;   /* the probe may fight the sealed abbey (the snapshot is restored after) */ S.mode='town'; S.run=null; S.watches=Math.max(1,S.watches);
      if(gateMod(gi)) continue; S.ti=S.ti||{}; S.ti.clr=S.ti.clr||{}; S.ti.clr[gi]=1; S.heatMax=S.heatMax||{}; S.heatMax[gi]=HEAT.length; S.heat=S.heat||{}; S.heat[gi]=h;
      startRun(gi); if(S.mode!=='battle') continue; const r={gate:gi,heat:h,lvl,cleared:false}; let guard=0;
      for(;;){ if(S.mode==='battle'){ if(++guard>400) break; act(decide(B)); continue; }
        if(S.mode==='raise'){ raisePhase(B); if(S.run.cleared){ r.cleared=true; break; } const P=S.player, live=S.army.filter(m=>m.hp>0).length;
          if(P.hp+pMax()*DIFF.heal>=pMax()*.5||(P.hp>=pMax()*.3&&live>=2)) descend(); else break; continue; }
        break; }
      out.push(r); } }
    finally{ S=JSON.parse(snap); Math.random=rand; }
  }
  function fightSiege(B){   // a siege is fought like rooms: the same decisions, raise the last wave's bodies, then dawn
    if(typeof siegeWallPick==='function'&&S.mode==='siege'){ siegeGuard(guardDefault()); wallPool().sort((x,y)=>y.lvl-x.lvl||y.atk-x.atk).slice(0,SIEGE_WALL).forEach(m=>siegeWallPick(m.uid)); }   // guard the highest-level building, send the 2 strongest from the Reserve
    if(typeof siegeRoadPick==='function'&&S.mode==='siege') siegeRoadPick(B.siege||(bl('ossuary')>=3||siegeTier()<2?'grave':'river'));   /* R14: the Graveyard at tier 1 or with the Ossuary at 3+, else the River gate; "siege":"north" probes a wall */
    if(!beginSiege()) return; let guard=0; const st=S.run.tier||1, w0=T_('siegeWins'), pg=!!S.run.purge;
    while(guard++<2000){
      if(S.mode==='battle'){ act(decide(B)); continue; }
      if(S.mode==='raise'){ raisePhase(B); returnTown(); break; }
      if(S.mode==='defeat'){ returnTown(); break; }
      break; }
    if(S.mode!=='town') returnTown();
    const z=STC.t[st]=STC.t[st]||{n:0,w:0}; z.n++; if(T_('siegeWins')>w0) z.w++; if(pg){ STC.pn++; if(T_('siegeWins')>w0) STC.pw++; }
  }
  function playTrial(B,out){   // the week's Trial ('full'; "off":["trials"] skips it): four rooms straight through, no raising; records the score
    const p=trialPlan(), lvl=S.player.lvl; if(!startTrial()) return; let guard=0;
    while(S.mode!=='town'&&guard++<1000){ if(S.mode==='battle') act(decide(B)); else if(S.mode==='raise'){ if(S.run.cleared) break; descend(); } else break; }
    const r=S.run, x={di:p.di,t:p.tier,lvl,done:!!(r&&r.trialRes)}; if(x.done){ x.s=r.trialRes.s; x.tt=r.trialRes.turns; x.downs=r.trialRes.downs; x.par=TRIAL_PAR; x.hearts=r.trialRes.h||0; }
    out.push(x); if(S.mode!=='town') returnTown();
  }
  function playWeek(B){   // R9 PR B ('full'; "off":["weekly"]): the weekly dive once a day, deeper while HP and the army hold
    B.rbOn=true; town(B); if(!startWeek()){ B.rbOn=false; return; } let guard=0;
    while(S.mode!=='town'&&guard++<6000){
      if(S.mode==='battle'){ act(decide(B)); continue; }
      if(S.mode==='raise'){ raisePhase(B); const P=S.player, live=S.army.filter(m=>m.hp>0).length; if(P.hp>=pMax()*.45&&live>=2) descend(); else break; continue; }
      break; }
    returnTown(); B.rbOn=false;
  }
  function playArc(B){   // R7 PR B ('full'): the rival's gate while it is open, the Reckoning when it waits; ends them unless opts.rival is 'spare'
    if(!B.full||typeof rgReady!=='function') return; const go=rgReady()?startRivalGate():reckReady()?startReckoning():false; if(!go) return; const rk=!!S.run.rk; let guard=0;
    while(S.mode!=='town'&&guard++<2000){
      if(S.mode==='battle'){ act(decide(B)); continue; }
      if(S.mode==='raise'){ raisePhase(B); if(S.run.cleared){ returnTown(); break; } const P=S.player, live=S.army.filter(m=>m.hp>0).length;
        if(P.hp+pMax()*DIFF.heal>=pMax()*.5||(P.hp>=pMax()*.3&&live>=2)) descend(); else { returnTown(); break; } continue; }
      if(S.mode==='defeat'){ returnTown(); break; }
      break; }
    if(S.mode!=='town') returnTown(); if(rk&&arc().pick) arcEnd(B.rival==='spare'?'spare':'end');
  }
  function simBot(seed,B,days){
    if(typeof MAP_ON!=='undefined') MAP_ON=!B.off.map;   /* R19: "off":["map"] puts the hero at every gate for free */
    Math.random=mulberry32(seed); newGame(); if(B.ngp>0&&typeof ascBegin==='function'){ S.ngp=B.ngp; S.asc={rules:(B.asc||[]).filter(k=>ASC_RULES[k]),kp:0}; S.pacts=cleanPacts(B.pacts||[]); S.watches=WATCHES-pactWatch(); ascBegin(); }   /* opts.ngp/asc/pacts: a New Game+ probe (a fresh save at that ascension level with those rules) */ B.lastDay=days; B.statI=0; B.hw={}; B.hwDay={}; if(typeof BOSS_KITS_ON!=='undefined') BOSS_KITS_ON=!B.off.bosskits; if(typeof STIERS_ON!=='undefined') STIERS_ON=!B.off.siegetiers; if(typeof INSC_ON!=='undefined') INSC_ON=!B.off.insc; if(B.custom&&typeof custClamp==='function') S.custom=custClamp(B.custom); if(B.iron) { S.iron=true; S.ironDeaths=0; }   /* R15: "custom":{foeHp,...} and "iron":true probes */   /* 'bosskits' off: the old single boss moves */
    let abbeyDay=null; HFC.n=0; HFC.g=0; TW2C.n=0; TW2C.spec=0; TW2C.emb=0; TW2C.omen=0; TW2C.ord=0; BRC.n=0; BRC.g=0; BRC.comm=0; BRC.commG=0; BRC.bm=0; const rec=[], lvAt={}, firstClear={}, loreAt={}, tiers=[], trials=[], goldAt={}, gl={earn:0,spend:0,S:null};
    const goldWatch=()=>{ if(gl.S===S) return; gl.S=S; let v=S.gold||0; Object.defineProperty(S,'gold',{enumerable:true,configurable:true,get:()=>v,set:x=>{ if(x>v) gl.earn+=x-v; else gl.spend+=v-x; v=x; }}); };   // lifetime gold earned and spent
    while(S.day<=days){
      goldWatch();
      if(B.tiers&&S.watches===WATCHES&&S.day%(B.tiers.every||2)===0){ const m=typeof MAP_ON!=='undefined'&&MAP_ON; if(m) MAP_ON=false; tierProbe(B,seed,tiers); if(m) MAP_ON=true; }
      if(S.mode==='siege') fightSiege(B);
      town(B); const d=S.day; if(B.full&&!B.off.trials&&typeof trialReady==='function'&&trialReady()&&!trialBestWeek()&&(B.trw&&B.trw.w===trialWeek()?B.trw.n:0)<3){ B.trw=B.trw&&B.trw.w===trialWeek()?B.trw:{w:trialWeek(),n:0}; B.trw.n++; playTrial(B,trials); town(B); }
      if(B.full&&!B.off.weekly&&typeof weekReady==='function'&&weekReady()&&(B.wkw&&B.wkw.w===weekNo()?B.wkw.n:0)<2){ B.wkw=B.wkw&&B.wkw.w===weekNo()?B.wkw:{w:weekNo(),n:0}; B.wkw.n++; playWeek(B); town(B); }   // R9 PR B: the weekly dive after the Trial, twice a week (it pays no XP)
      if(B.full&&S.watches>0){ playArc(B); if(S.mode==='siege') fightSiege(B); town(B); }   // until it completes the week's Trial, at most 3 tries a week
      playRun(B,rec); if(S.mode==='siege') fightSiege(B);
      const last=rec[rec.length-1]; if(last&&last.cleared&&firstClear[last.gate]==null) firstClear[last.gate]=d;
      if(abbeyDay==null&&S.abbey&&S.abbey.open) abbeyDay=d;
      if(S.day!==d&&typeof faithRank==='function'&&faithOf()){ const k=faithRank(); B.fr=B.fr||{}; for(let i=1;i<=k;i++) if(B.fr[i]==null) B.fr[i]=d; }   // R8: the day each devotion rank was first held
      if(S.day!==d){ if(typeof loreCheck==='function') loreCheck(); lvAt[d]=S.player.lvl; if(typeof stierRaw==='function'&&siegeOpen()&&(d===60||d===100)) STC['d'+d].push(stierRaw());   /* R14: the siege tier on day 60 and 100 */ goldAt[d]=[S.gold,gl.earn,gl.spend];   /* the game checks lore when it draws; bots never draw */ loreAt[d]=[Object.keys(S.story||{}).length,S.pages||0]; }
    }
    town(B); if(typeof MAP_ON!=='undefined') MAP_ON=false;   /* the closing measures (climb, abbey, Rift) are not about the roads */
    const tower=(typeof towerOpen==='function'?towerOpen():S.player.lvl>=TW.unlock)?climb(B):0;
    let abbeyEnd=false, abbeyProbe=false; if(typeof abbeyCheck==='function'){ abbeyCheck(); abbeyEnd=!!(S.abbey&&S.abbey.open)&&abbeyDay==null; if(abbeyEnd) abbeyDay=days+1;   /* the deep route may open after the final climb */
      if(!abbeyOpen()&&!B.off.abbeyprobe){ abbeyState().open=1; abbeyProbe=true; }   /* still sealed: open it anyway for a few measuring runs (reported apart from abbeyDay) */
      if(abbeyOpen()){ B.force=ABBEY; for(let i=0;i<8&&!(S.ti.clr&&S.ti.clr[ABBEY]&&i>=4);i++){ S.mode='town'; S.run=null; S.watches=WATCHES; town(B); playRun(B,rec); if(S.mode!=='town') returnTown(); } delete B.force; } }
    let riftDeaths=0; B.rbOn=true;   // the Rift: keep going one depth deeper until it has killed the bot 3 times (at most 120 runs; 40 capped it once the Soul Tether came in)
    if(typeof riftOpen==='function'&&riftOpen()&&!B.off.rift) for(let i=0;i<120&&riftDeaths<3;i++){
      S.mode='town'; S.run=null; S.watches=Math.max(1,S.watches); town(B); if(!startRift(riftBest()+1)) break; let guard=0;
      while(S.mode!=='town'&&guard++<4000){ if(S.mode==='battle') act(decide(B)); else if(S.mode==='raise'){ playEvent(B); raisePhase(B); if(S.run.cleared) break; descend(); } else break; }
      if(S.mode==='defeat') riftDeaths++; returnTown(); }
    const sg={n:0,won:0,k:0};   // R9: then up to 12 sigiled dives five depths above its best, with every sigil it may carry (shards open more); "off":["sigils"]
    if(B.full&&!B.off.sigils&&typeof sigOpenN==='function'&&riftOpen()&&!B.off.rift&&sigOpenN()) for(let i=0;i<12;i++){
      S.mode='town'; S.run=null; S.watches=Math.max(1,S.watches); town(B); while(unlockSigil());
      S.rift.sig=SIGIL_IDS.filter(sigOpen).sort((a,b)=>BOT_SIG.indexOf(a)-BOT_SIG.indexOf(b)).slice(0,SIGIL_MAX); if(!startRift(Math.max(1,riftBest()-4))) break; sg.n++; sg.k+=S.run.sig.length; let guard=0;
      while(S.mode!=='town'&&guard++<4000){ if(S.mode==='battle') act(decide(B)); else if(S.mode==='raise'){ playEvent(B); raisePhase(B); if(S.run.cleared) break; descend(); } else break; }
      if(S.run&&S.run.cleared) sg.won++; returnTown(); }
    B.rbW=GEAR_SLOTS.filter(sl=>S.equip[sl]&&S.equip[sl].rb).length; B.rbWd=Math.max(0,...GEAR_SLOTS.map(sl=>S.equip[sl]&&S.equip[sl].rb?S.equip[sl].rb.d:0)); B.rbOn=false;   // what it wore for the Rift
    const sieges={fought:T_('sieges'),won:T_('siegeWins')}, raids={sent:T_('raidsSent'),won:T_('raidWins')}, passives=['robber','scholar','calcify','sanguine','thrift','deathless'].reduce((a,id)=>a+sk(id),0);
    const sec={met:T_('secretMet'),slain:SECRET.reduce((a,B,i)=>a+T_('secret_'+i),0)};
    const rival={met:T_('rivalMet'),wins:T_('rivalWins'),losses:T_('rivalLosses'),thefts:T_('rivalThefts'),day:(S.rival&&S.rival.met)||0};
    const head=typeof headBonus==='function'?{g:T_('headG'),t:headTiers(),b:headBonus()}:null;
    const awk={g:T_('awakenG'),n:T_('awakened')};   // awakening ranks bought and their gold
    return {god:typeof faithOf==='function'&&faithOf()?{id:faithOf(),rank:faithRank(),r1:(B.fr||{})[1]||0,r3:(B.fr||{})[3]||0,r5:(B.fr||{})[5]||0,vb:T_('vowsBroken'),cv:T_('converted'),calls:T_('godCalls'),wards:T_('wards')}:null,arc:{ch:(S.rival&&S.rival.arc&&S.rival.arc.ch)||0,d2:(S.rival&&S.rival.arc&&S.rival.arc.op[2])||0,d3:(S.rival&&S.rival.arc&&S.rival.arc.op[3])||0,ww:T_('wagerWins'),wl:T_('wagerLosses'),sw:T_('rivalSiegeWins'),sl:T_('rivalSiegeLosses'),rec:T_('reclaimed'),d4:(S.rival&&S.rival.arc&&S.rival.arc.op[4])||0,d5:(S.rival&&S.rival.arc&&S.rival.arc.op[5])||0,ed:(S.rival&&S.rival.arc&&S.rival.arc.ed)||0,rgR:T_('rgRuns'),rgC:T_('rgClears'),rkT:T_('reckTries'),rkW:T_('reckWins'),uq:typeof RIVAL_UQ!=='undefined'?RIVAL_UQ.filter(id=>GEAR_SLOTS.some(sl=>S.equip[sl]&&S.equip[sl].id===id)).length:0},exp:{nights:T_('expNights'),won:T_('expNightsWon'),clean:T_('expClean'),long:T_('expLong'),hunt:T_('exp_hunt'),curse:T_('exp_curse'),band:T_('exp_band'),scav:T_('exp_scav'),gate:T_('exp_gate'),rallies:T_('rallies'),camps:T_('expCamps')},map:typeof MAP_ON!=='undefined'?{st:T_('mapSteps'),w:T_('mapW'),sites:T_('mapSites'),dug:T_('mapDug')+T_('mapField'),raised:T_('mapRaised'),all:T_('raised'),days:days}:null,town2:{n:TW2C.n,spec:TW2C.spec,emb:TW2C.emb,omen:TW2C.omen,yard:T_('yardSold'),ord:T_('orders'),pick:TW2C.ord,hunts:T_('ord_hunt'),claims:(S.ti&&S.ti.claims)||0,dread:typeof dreadOf==='function'?dreadOf():0,upk:T_('upkeepG'),tithes:T_('tithes'),bands:['calm','uneasy','afraid','terror'].map(b=>T_('band_'+b)),lv:Object.fromEntries(Object.keys(BUILD).map(k=>[k,blRaw(k)]))},hf:{n:HFC.n,g:HFC.g},brew:{n:BRC.n,g:BRC.g,comm:BRC.comm,commG:BRC.commG,bm:BRC.bm,prep:T_('prepUsed')},abbeyDay,abbeyEnd,abbeyProbe,trials,ev:B.ev||{},chainsEnded:T_('chains'),head,awk,maus:typeof mausN==='function'?mausN():0,bonds:typeof bondPairs==='function'?bondPairs().length:0,rec,tiers,lvAt,goldAt,firstClear,lvl:S.player.lvl,tower,sec,loreAt,raids,sieges,rival,rift:typeof riftBest==='function'?riftBest():0,sig:{n:sg.n,won:sg.won,k:sg.k,sh:typeof riftShards==='function'?riftShards()+T_('sigUnlocks')*0:0,gu:T_('guardians'),gt:T_('shards'),rb:T_('riftborn'),at:T_('attuned'),wd:T_('weekDives'),wt:(S.rift&&S.rift.wk&&S.rift.wk.top)||0,worn:B.rbW||0,rbd:B.rbWd||0},passives,nem:{born:T_('nemBorn'),slain:T_('nemSlain'),arch:T_('nemArch'),alive:(S.nem||[]).length}};
  }

  // ----- reporting
  const pc=(a,b)=>b?Math.round(a/b*100)+'%':'-';
  const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:'-';
  function summarize(res,days,raw0){
    const gates=DUNGEONS.map((D,i)=>{
      const g=[].concat(...res.map(r=>r.rec)).filter(x=>x.gate===i&&!x.rival);
      const fc=res.map(r=>r.firstClear[i]).filter(x=>x!=null), rooms=g.reduce((a,x)=>a+x.rooms,0)||1;
      return {gate:RANKS[i]+' '+D.name,runs:g.length,avgLvlVsSafe:avg(g.map(x=>x.diff)),clear:pc(g.filter(x=>x.cleared).length,g.length),death:pc(g.filter(x=>x.died).length,g.length),
        turnsPerRoom:Math.round(g.reduce((a,x)=>a+x.turns,0)/rooms*10)/10,hpAfterRoom:(h=>h.length?Math.round(h.reduce((a,b)=>a+b,0)/h.length*100)+'%':'-')([].concat(...g.map(x=>x.hpEnd))),
        bossWin:pc(g.filter(x=>x.bossIn&&x.cleared).length,g.filter(x=>x.bossIn).length),bossActs:avg(g.filter(x=>x.bossIn&&x.cleared).map(x=>x.bossT)),
        firstClearDay:avg(fc),botsCleared:fc.length+'/'+res.length};
    });
    const all=[].concat(...res.map(r=>r.rec)), lv={};
    [10,20,30,days].forEach(d=>{ if(d<=days) lv['day'+d]=avg(res.map(r=>r.lvAt[d]).filter(x=>x!=null)); });
    const heat=HEAT.map((H,h)=>{ const g=all.filter(x=>x.heat===h); return g.length?H.name+' '+g.length+' runs, clear '+pc(g.filter(x=>x.cleared).length,g.length)+', death '+pc(g.filter(x=>x.died).length,g.length):null; }).filter(Boolean);
    const lore={}; [10,30,60,days].forEach(d=>{ const a=res.map(r=>r.loreAt&&r.loreAt[d]).filter(Boolean); if(a.length) lore['day'+d]=avg(a.map(x=>x[0]))+' passages, '+avg(a.map(x=>x[1]))+' pages'; });
    const sec={met:res.reduce((a,r)=>a+(r.sec?r.sec.met:0),0),slain:res.reduce((a,r)=>a+(r.sec?r.sec.slain:0),0)};
    const raids={sent:res.reduce((a,r)=>a+(r.raids?r.raids.sent:0),0),won:res.reduce((a,r)=>a+(r.raids?r.raids.won:0),0)};
    const sieges={fought:res.reduce((a,r)=>a+(r.sieges?r.sieges.fought:0),0),won:res.reduce((a,r)=>a+(r.sieges?r.sieges.won:0),0)};
    const rival={fights:res.reduce((a,r)=>a+(r.rival?r.rival.met:0),0),wins:res.reduce((a,r)=>a+(r.rival?r.rival.wins:0),0),losses:res.reduce((a,r)=>a+(r.rival?r.rival.losses:0),0),thefts:res.reduce((a,r)=>a+(r.rival?r.rival.thefts:0),0),metDay:avg(res.map(r=>r.rival&&r.rival.day).filter(x=>x>0))}; rival.winRate=pc(rival.wins,rival.wins+rival.losses);
    const SG=res.map(r=>r.sig||{}), rift={sig:SG.some(x=>x.n)?{dives:avg(SG.map(x=>x.n||0)),won:pc(SG.reduce((a,x)=>a+(x.won||0),0),SG.reduce((a,x)=>a+(x.n||0),0)),k:avg(SG.map(x=>x.n?x.k/x.n:0)),shards:avg(SG.map(x=>x.gt||0)),guards:avg(SG.map(x=>x.gu||0)),rb:avg(SG.map(x=>x.rb||0)),at:avg(SG.map(x=>x.at||0)),wd:avg(SG.map(x=>x.wd||0)),wt:avg(SG.map(x=>x.wt||0)),worn:pc(SG.filter(x=>x.worn).length,SG.length),rbd:avg(SG.map(x=>x.rbd||0))}:null,all:res.map(r=>r.rift||0).sort((a,b)=>a-b).join(','),best:avg(res.map(r=>r.rift||0)),open:res.filter(r=>r.rift>0).length+'/'+res.length,deepest:Math.max(0,...res.map(r=>r.rift||0))};
    const byLvl=DUNGEONS.map((D,i)=>{ const g=all.filter(x=>x.gate===i&&!x.heat), o={}; for(const x of g){ const k=x.lvl; (o[k]=o[k]||[0,0])[0]++; if(x.cleared) o[k][1]++; } return RANKS[i]+': '+Object.keys(o).map(Number).sort((x,y)=>x-y).map(l=>'Lv'+l+' '+pc(o[l][1],o[l][0])+'/'+o[l][0]).join('  '); });   // Normal runs only: clear rate by hero level on entry (run-balance.js prints it with {"byLvl":true})
    const tp=[].concat(...res.map(r=>r.tiers||[])), tiers=[];   // opts.tiers: clear rate by hero level for each gate and difficulty (the model's advice in brackets)
    for(const gi of [...new Set(tp.map(x=>x.gate))]) for(const h of [...new Set(tp.map(x=>x.heat))].sort()){ const g=tp.filter(x=>x.gate===gi&&x.heat===h), o={}; if(!g.length) continue;
      for(const x of g){ const k=x.lvl-x.lvl%2; (o[k]=o[k]||[0,0])[0]++; if(x.cleared) o[k][1]++; }
      tiers.push(RANKS[gi]+' '+HEAT[h].name+' [rec '+tierRec(gi,h)+']: '+Object.keys(o).map(Number).sort((x,y)=>x-y).map(l=>'Lv'+l+' '+pc(o[l][1],o[l][0])+'/'+o[l][0]).join('  ')); }
    const med=a=>{ if(!a.length) return '-'; const b=a.slice().sort((x,y)=>x-y), m=b.length>>1; return Math.round(b.length%2?b[m]:(b[m-1]+b[m])/2); };
    const gold={}; [30,60,100,days].forEach(d=>{ if(d>days) return; const a=res.map(r=>r.goldAt&&r.goldAt[d]).filter(Boolean); if(a.length) gold['day'+d]={avg:Math.round(avg(a.map(x=>x[0]))),median:med(a.map(x=>x[0])),earned:Math.round(avg(a.map(x=>x[1]))),spent:Math.round(avg(a.map(x=>x[2])))}; });   // gold held at dusk, and lifetime earned vs spent
    gold.maus=avg(res.map(r=>r.maus||0)); gold.bonds=avg(res.map(r=>r.bonds||0));   // mausoleums raised and bonded pairs at the end
    { const f=res.map(r=>r.hf).filter(Boolean); if(f.some(x=>x.n)) gold.hforge={n:avg(f.map(x=>x.n)),spent:Math.round(avg(f.map(x=>x.g)))}; }
    { const f=res.map(r=>r.brew).filter(Boolean); if(f.some(x=>x.n||x.comm)) gold.brew={n:avg(f.map(x=>x.n)),spent:Math.round(avg(f.map(x=>x.g))),comm:avg(f.map(x=>x.comm)),commG:Math.round(avg(f.map(x=>x.commG))),bm:avg(f.map(x=>x.bm)),prep:avg(f.map(x=>x.prep))}; }
    { const f=res.filter(r=>r.god).map(r=>Object.assign({},r.god,{runs:r.rec.filter(x=>!x.rival&&x.gate<6),tw:r.tower,rift:r.rift})); if(f.length){ const by={}; f.forEach(x=>{ (by[x.id]=by[x.id]||[]).push(x); }); gold.gods=Object.keys(by).map(id=>{ const L=by[id], d=k=>{ const v=L.map(x=>x[k]).filter(x=>x>0); return v.length?avg(v)+' ('+v.length+')':'-'; }; const rn=[].concat(...L.map(x=>x.runs)); return id+': clears '+(rn.length?Math.round(100*rn.filter(x=>x.cleared).length/rn.length):0)+'%, Tower '+avg(L.map(x=>x.tw))+', Rift '+avg(L.map(x=>x.rift))+', rank '+avg(L.map(x=>x.rank))+', rank 1 on day '+d('r1')+', 3 on '+d('r3')+', 5 on '+d('r5')+', vows broken '+avg(L.map(x=>x.vb))+', omens called '+avg(L.map(x=>x.calls||0))+', warded '+avg(L.map(x=>x.wards||0)); }); } }
    { const f=res.map(r=>r.arc).filter(Boolean); if(f.length&&f.some(x=>x.ch>0)){ const d=k=>{ const v=f.map(x=>x[k]).filter(x=>x>0); return v.length?avg(v)+' ('+v.length+' bots)':'-'; }; gold.arc={ch:avg(f.map(x=>x.ch)),d2:d('d2'),d3:d('d3'),ww:avg(f.map(x=>x.ww)),wl:avg(f.map(x=>x.wl)),sw:f.reduce((a,x)=>a+x.sw,0),sl:f.reduce((a,x)=>a+x.sl,0),rec:avg(f.map(x=>x.rec)),d4:d('d4'),d5:d('d5'),ed:d('ed'),rgR:f.reduce((a,x)=>a+(x.rgR||0),0),rgC:f.reduce((a,x)=>a+(x.rgC||0),0),rkT:f.reduce((a,x)=>a+(x.rkT||0),0),rkW:f.reduce((a,x)=>a+(x.rkW||0),0),uq:avg(f.map(x=>x.uq||0))}; } }
    { const f=res.map(r=>r.exp).filter(Boolean); if(f.length&&f.some(x=>x.nights||x.rallies)){ gold.exp={}; for(const k in f[0]) gold.exp[k]=avg(f.map(x=>x[k])); } }
    { const f=res.map(r=>r.map).filter(Boolean); if(f.length) gold.map={spd:avg(f.map(x=>x.st/x.days)),wpc:+(f.reduce((a,x)=>a+x.w,0)/f.reduce((a,x)=>a+x.days*WATCHES,0)*100).toFixed(1),sites:avg(f.map(x=>x.sites)),dug:avg(f.map(x=>x.dug)),raised:avg(f.map(x=>x.raised)),rpc:+(f.reduce((a,x)=>a+x.raised,0)/Math.max(1,f.reduce((a,x)=>a+x.all,0))*100).toFixed(1)}; }
    { const f=res.map(r=>r.town2).filter(Boolean); if(f.length&&f.some(x=>x.n||x.spec)) gold.town2={n:avg(f.map(x=>x.n)),spec:avg(f.map(x=>x.spec)),emb:avg(f.map(x=>x.emb)),omen:avg(f.map(x=>x.omen)),ord:avg(f.map(x=>x.ord||0)),hunts:avg(f.map(x=>x.hunts||0)),claims:avg(f.map(x=>x.claims||0)),pick:avg(f.map(x=>x.pick||0)),dread:avg(f.map(x=>x.dread||0)),upk:Math.round(avg(f.map(x=>x.upk||0))),tithes:avg(f.map(x=>x.tithes||0)),bands:[0,1,2,3].map(i=>avg(f.map(x=>(x.bands||[])[i]||0))).join('/'),lv:Object.keys(f[0].lv).map(k=>k+' '+avg(f.map(x=>x.lv[k]||0))).join(', ')}; }
    { const a=res.map(r=>r.awk).filter(Boolean); if(a.some(x=>x.n)) gold.awaken={spent:Math.round(avg(a.map(x=>x.g))),ranks:avg(a.map(x=>x.n))}; }
    { const h=res.map(r=>r.head).filter(Boolean); if(h.some(x=>x.g)) gold.headstones={spent:Math.round(avg(h.map(x=>x.g))),medianSpent:med(h.map(x=>x.g)),tiers:avg(h.map(x=>x.t)),hpBonus:avg(h.map(x=>x.b*100))+'%'}; }   // headstones ('full'): gold spent, tiers and the max HP bonus at the end, per bot
    const events={}; for(const r of res) for(const k in r.ev||{}) events[k]=(events[k]||0)+r.ev[k];   // events met by id:choice (summed over bots), and ok/bad outcomes
    if(Object.keys(events).length){ const n=k=>Object.keys(events).filter(x=>k(x)).reduce((a,x)=>a+events[x],0); events.perBot=avg(res.map(r=>Object.keys(r.ev||{}).filter(x=>x.includes(':')).reduce((a,x)=>a+r.ev[x],0)));
      events.met=n(x=>x.includes(':')&&!x.startsWith('chain ')); events.chainMet=n(x=>x.startsWith('chain ')); events.chainsEnded=res.reduce((a,r)=>a+(r.chainsEnded||0),0); }
    const tr=[].concat(...res.map(r=>r.trials||[])), trials=tr.length?{n:tr.length,done:pc(tr.filter(x=>x.done).length,tr.length),perBot:avg(res.map(r=>(r.trials||[]).length)),
      tiers:HEAT.slice(0,3).map((H,h)=>{ const g=tr.filter(x=>x.done&&x.t===h); return g.length?H.name+' '+g.length+': score median '+med(g.map(x=>x.s))+' (turns '+med(g.map(x=>x.tt))+', downed '+avg(g.map(x=>x.downs))+')'+(g[0].par!=null?', par beaten '+pc(g.filter(x=>x.s<=x.par).length,g.length):''):null; }).filter(Boolean),
      hearts:avg(res.map(r=>(r.trials||[]).reduce((a,x)=>a+(x.hearts||0),0)))}:null;   // the weekly Trial ('full'): attempts, completions, score by difficulty, and hearts won per bot
    const ad=res.map(r=>r.abbeyDay).filter(x=>x!=null), abbey={open:ad.length+'/'+res.length,inSim:res.filter(r=>r.abbeyDay!=null&&!r.abbeyEnd).length,probed:res.filter(r=>r.abbeyProbe).length,day:avg(res.filter(r=>r.abbeyDay!=null&&!r.abbeyEnd).map(r=>r.abbeyDay))};   /* abbeyDay: the day the seventh gate opened (after the final climb counts as days+1) */
    const raw=raw0?all.filter(x=>!x.rival).map(x=>({g:x.gate,l:x.lvl,h:x.heat|0,c:x.cleared?1:0,d:x.died?1:0,rm:x.rooms,t:x.turns})):undefined;   /* R15: the bot's runs for a play log replay (run-balance.js {"log"}) */
    return {raw,abbey,trials,gold,events,gates,heat,byLvl,tiers,sec,lore,raids,sieges,rival,rift,passives:avg(res.map(r=>r.passives||0)),stiers:(z=>{ STC.t={}; STC.d60=[]; STC.d100=[]; STC.pn=STC.pw=0; return z; })(Object.keys(STC.t).length?{purge:STC.pw+' of '+STC.pn,held:Object.keys(STC.t).sort().map(t=>'t'+t+' '+Math.round(STC.t[t].w/STC.t[t].n*100)+'% of '+STC.t[t].n).join(', '),d60:STC.d60.length?(STC.d60.reduce((a,b)=>a+b,0)/STC.d60.length).toFixed(1):'-',d100:STC.d100.length?(STC.d100.reduce((a,b)=>a+b,0)/STC.d100.length).toFixed(1):'-'}:null),curses:(z=>{ for(const k in CURC) delete CURC[k]; return z; })(Object.keys(CURC).sort().map(k=>k+' '+Math.round(CURC[k].c/CURC[k].n*100)+'% of '+CURC[k].n).join(', ')),nem:{born:avg(res.map(r=>r.nem?r.nem.born:0)),slain:avg(res.map(r=>r.nem?r.nem.slain:0)),arch:avg(res.map(r=>r.nem?r.nem.arch:0)),alive:avg(res.map(r=>r.nem?r.nem.alive:0))},raise:(z=>(RZ.t=RZ.ok=0,z))(RZ.t?pc(RZ.ok,RZ.t)+' of '+RZ.t:null),sweeps:(z=>(SWC.n=SWC.stop=0,z))(SWC.n?{n:SWC.n,perBot:+(SWC.n/res.length).toFixed(1),stopped:SWC.stop}:null),runs:all.length,deathRate:pc(all.filter(x=>x.died).length,all.length),clearRate:pc(all.filter(x=>x.cleared).length,all.length),level:lv,towerBest:avg(res.map(r=>r.tower))};
  }

  function run(opts){
    opts=Object.assign({bots:30,days:40,seed:1000,diff:null,tw:null,push:false,early:0,modes:['noSkills','skills']},opts||{});
    const keep={bondsRoom:typeof bondsRoom==='function'?bondsRoom:null,siegeOpen:typeof siegeOpen==='function'?siegeOpen:null,rivalOpen:typeof rivalOpen==='function'?rivalOpen:null,rivalArcOn:typeof rivalArcOn==='function'?rivalArcOn:null,S:JSON.stringify(S),rand:Math.random,save:save,DIFF:JSON.stringify(DIFF),TW:JSON.stringify(TW),SAFE:SAFE.slice()};
    save=function(){};
    const sfxWas=typeof SFX!=='undefined'&&SFX.on; if(typeof SFX!=='undefined') SFX.on=false;   // no sound during simulations
    if(opts.early){ SAFE[4]-=opts.early; SAFE[5]-=opts.early; }   // let fair bots enter A and S early (the XP curve stalls them near level 20)
    if(opts.diff) Object.assign(DIFF,JSON.parse(JSON.stringify(opts.diff)));
    if(opts.tw) Object.assign(TW,opts.tw);
    const out={settings:{DIFF:JSON.parse(JSON.stringify(DIFF)),TW:Object.assign({},TW),bots:opts.bots,days:opts.days}}, t0=Date.now();
    try{
      for(const [name,skills,market,full] of [['noSkills',false,false,false],['skills',true,false,false],['market',true,true,false],['full',true,true,true]].filter(m=>opts.modes.includes(m[0]))){
        if(keep.bondsRoom) bondsRoom=(opts.off||[]).includes('bonds')?()=>{}:keep.bondsRoom;   // "off":["bonds"]: no minion ever bonds
        if(keep.siegeOpen) siegeOpen=(opts.off||[]).includes('siege')?()=>false:keep.siegeOpen;   // "off":["siege"]: the living never come
        if(keep.rivalOpen) rivalOpen=(!full||(opts.off||[]).includes('rival'))?()=>false:keep.rivalOpen;   // the rival plays only in 'full'; "off":["rival"] switches it off there
        if(keep.rivalArcOn) rivalArcOn=(opts.off||[]).includes('rivalarc')?()=>false:keep.rivalArcOn;   // "off":["rivalarc"]: the rival stays in chapter 1
        const res=[]; for(let b=0;b<opts.bots;b++) res.push(simBot(opts.seed+b,{skills,market,full,push:opts.push,dread:opts.dread,faith:opts.faith||(full?(typeof GODS!=='undefined'?GODS[b%GODS.length]:(b%2?'dis':'hon')):null),ult:opts.ult,heat:opts.heat!=null?opts.heat:(full?1:0),tiers:opts.tiers,stats:opts.stats,mods:opts.mods,mod:opts.mod,rival:opts.rival,runes:opts.runes,lean:opts.lean,ngp:opts.ngp,asc:opts.asc,pacts:opts.pacts,siege:opts.siege,custom:opts.custom,iron:opts.iron,off:Object.fromEntries((opts.off||[]).map(k=>[k,1]))},opts.days));
        out[name]=summarize(res,opts.days,!!opts.raw);
      }
    } finally {
      if(keep.bondsRoom) bondsRoom=keep.bondsRoom; if(keep.siegeOpen) siegeOpen=keep.siegeOpen; if(keep.rivalOpen) rivalOpen=keep.rivalOpen; if(keep.rivalArcOn) rivalArcOn=keep.rivalArcOn; Math.random=keep.rand; save=keep.save; keep.SAFE.forEach((v,i)=>SAFE[i]=v); if(typeof SFX!=='undefined') SFX.on=sfxWas;
      Object.assign(DIFF,JSON.parse(keep.DIFF)); Object.assign(TW,JSON.parse(keep.TW));
      S=JSON.parse(keep.S);
    }
    out.ms=Date.now()-t0;
    return out;
  }
  // for tools: play one bot to a given day, then climb from checkpoints (see the Abyss probe in the notes)
  function probe(seed,days,climbs){ const B={skills:true,market:true,full:true,off:{}}, keep={S:JSON.stringify(S),rand:Math.random,save}; save=function(){};
    try{ simBot(seed,B,days); const out=[];
      for(let i=0;i<climbs;i++){ town(B); S.player.hp=pMax(); S.player.mana=pMana(); S.army.forEach(m=>m.hp=m.maxHp); const f=Math.max(...towerStarts()); climb(B,f); out.push(S.tower.best); if(S.mode!=='town') returnTown(); }
      return {lvl:S.player.lvl,best:S.tower.best,path:out}; }
    finally{ Math.random=keep.rand; save=keep.save; S=JSON.parse(keep.S); } }
  // for tools: play one bot to a given day, then fight the boss room of each cleared gate many times, with and without the secret master
  // (fresh HP and army, straight into the boss room: kinder than a real run, so these rates are an upper bound)
  function duel(seed,days,trials,opts){ opts=opts||{}; const B={skills:true,market:true,full:true,off:{},faith:opts.faith,ult:opts.ult}, keep={S:JSON.stringify(S),rand:Math.random,save,roll:secretRoll}; save=function(){};
    try{ simBot(seed,B,days); if(S.mode!=='town') returnTown(); town(B); const snap=JSON.stringify(S), out={lvl:S.player.lvl,gates:[],army:S.army.map(m=>m.role[0]+rowOf(m)+m.lvl).join(" ")};
      for(let di=0;di<DUNGEONS.length;di++){ if(!(S.ti&&S.ti.clr&&S.ti.clr[di])) continue; const row={gate:DUNGEONS[di].name};
        for(const sec of [false,true]){ let win=0,turns=0;
          for(let i=0;i<trials;i++){ S=JSON.parse(snap); S.mode='town'; S.watches=1; S.run=null; if(opts.heat) setHeat(di,Math.min(opts.heat,heatMax(di)));
            secretRoll=()=>sec; startRun(di); const r=S.run; r.room=r.rooms-1; spawnRoom(); let g=0;
            while(S.mode==='battle'&&g++<400){ act(decide(B)); turns++; }
            if(S.mode==='raise') win++; else if(opts.log&&sec&&di===opts.log.gate&&i===0) { row.log=(S.run.full||S.run.log.slice().reverse().map(l=>l.m)).slice(-(opts.log.n||25));   /* S.run.full: every line, when a probe keeps them */ row.end=S.mode+' turn '+S.run.turn+' foes '+S.run.enemies.map(e=>e.name+' '+e.hp+'/'+e.maxHp+(e.shield?' sh'+e.shield:'')).join(', ')+' P '+S.player.hp+'/'+pMax(); } }
          row[sec?'secret':'boss']=Math.round(win/trials*100)+'%'; row[sec?'secretTurns':'bossTurns']=Math.round(turns/trials); }
        out.gates.push(row); }
      return out; }
    finally{ Math.random=keep.rand; save=keep.save; secretRoll=keep.roll; S=JSON.parse(keep.S); } }
  window.LOTD_BALANCE={run,probe,duel};
})();
