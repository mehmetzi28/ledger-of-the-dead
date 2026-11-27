// Runs the balance bot (tests/balance-test.js) in Node.
//   node tests/run-balance.js                                  market bot, 40 bots x 100 days, seed 7700
//   node tests/run-balance.js '{"modes":["skills"],"days":40}'  any LOTD_BALANCE.run options as JSON
//   node tests/run-balance.js '{"byLvl":true}'                 also prints each gate's clear rate by hero level on entry (Normal runs)
//   node tests/run-balance.js '{"tiers":{"gates":[1,2],"near":8}}'  every 2nd dawn (tiers.every) each listed gate is also fought once per
//        difficulty (tiers.heats, default Hard/Brutal/Nightmare) from a copy of the bot, within `near` levels of tierRec; prints clear % by level
const ctx=require('./load-game')(['balance-test.js']);
const opts=Object.assign({bots:40,days:100,seed:7700,modes:['market']},process.argv[2]?JSON.parse(process.argv[2]):{});
const out=ctx.LOTD_BALANCE.run(opts);
for(const m of ['noSkills','skills','market','full']){
  const r=out[m]; if(!r) continue;
  console.log('\n== '+m+'  runs '+r.runs+'  clears '+r.clearRate+'  deaths '+r.deathRate+'  tower '+r.towerBest+'  levels '+JSON.stringify(r.level));
  console.table(r.gates);
  if(opts.byLvl&&r.byLvl) console.log('  clear by hero level on entry (Normal):\n    '+r.byLvl.join('\n    '));
  if(r.tiers&&r.tiers.length) console.log('  clear by hero level (2-level bins) per difficulty:\n    '+r.tiers.join('\n    '));
  if(r.heat&&r.heat.length>1) console.log('  difficulty: '+r.heat.join(' | '));
  if(r.raise) console.log('  raises: '+r.raise+' attempts answered');
  if(r.nem) console.log('  nemeses (a bot): born '+r.nem.born+', avenged '+r.nem.slain+', arch '+r.nem.arch+', alive at the end '+r.nem.alive);
  if(r.sweeps) console.log('  sweeps: '+r.sweeps.n+' ('+r.sweeps.perBot+' a bot, '+r.sweeps.stopped+' stopped by a master)');
  if(r.abbey) console.log('  vane abbey: opened by '+r.abbey.open+' bots ('+r.abbey.inSim+' within the days, on day '+r.abbey.day+' on average; the rest after the final Tower climb; '+r.abbey.probed+' still sealed, opened anyway for the measuring runs in the SS row)');
  if(r.sec) console.log('  secret masters: met '+r.sec.met+', slain '+r.sec.slain);
  if(r.lore) console.log('  lore: '+Object.entries(r.lore).map(([d,v])=>d+' '+v).join(' | '));
  if(r.sieges&&r.sieges.fought) console.log('  sieges: fought '+r.sieges.fought+', held '+r.sieges.won+' ('+Math.round(r.sieges.won/r.sieges.fought*100)+'%)');
  if(r.rival&&(r.rival.fights||r.rival.thefts)) console.log('  rival: met on day '+r.rival.metDay+' on average, challenges '+r.rival.fights+', won '+r.rival.wins+', lost '+r.rival.losses+' ('+r.rival.winRate+'), bodies taken '+r.rival.thefts);
  if(r.raids&&r.raids.sent) console.log('  raids: sent '+r.raids.sent+', won '+r.raids.won+' ('+Math.round(r.raids.won/r.raids.sent*100)+'%)');
  if(r.gold) console.log('  gold held (avg / median, lifetime earned / spent): '+Object.entries(r.gold).filter(([d])=>/^day/.test(d)).map(([d,g])=>d+' '+g.avg+' / '+g.median+' ('+g.earned+' / '+g.spent+')').join(' | ')+'  |  mausoleums '+r.gold.maus+', bonded pairs '+r.gold.bonds);
  if(r.rift) console.log('  rift: reached by '+r.rift.open+' bots, average deepest '+r.rift.best+', best '+r.rift.deepest+'  |  passive ranks learned: '+r.passives);
  if(r.rift&&r.rift.sig) console.log('  rift sigils: '+r.rift.sig.dives+' sigiled dives a bot ('+r.rift.sig.k+' sigils each), '+r.rift.sig.won+' cleared; '+r.rift.sig.shards+' shards earned, '+r.rift.sig.guards+' guardians slain a bot');
  if(r.rift&&r.rift.sig) console.log('  riftborn: '+r.rift.sig.rb+' found a bot, '+r.rift.sig.worn+' of bots wear one for their last Rift dives (deepest worn '+r.rift.sig.rbd+'), '+r.rift.sig.at+' attunements; weekly dives '+r.rift.sig.wd+' a bot, best depth '+r.rift.sig.wt);
  if(r.trials) console.log('  trials: '+r.trials.n+' tried ('+r.trials.perBot+' a bot), '+r.trials.done+' completed, hearts won '+r.trials.hearts+' a bot | '+r.trials.tiers.join(' | '));
  if(r.gold&&r.gold.hforge) console.log('  heartforge: '+r.gold.hforge.n+' pieces a bot, '+r.gold.hforge.spent+' gold');
  if(r.gold&&r.gold.brew){ const b=r.gold.brew; console.log('  brewing: '+b.n+' brews a bot ('+b.spent+' gold), '+b.prep+' brews carried into runs; commissions '+b.comm+' (+'+b.commG+' gold); black market '+b.bm+' trades'); }
  if(r.gold&&r.gold.gods) console.log('  gods: '+r.gold.gods.join(' | '));
  if(r.gold&&r.gold.arc&&r.gold.arc.d2!=='-'){ const a=r.gold.arc; console.log('  rival war: chapter '+a.ch+' on average; chapter 2 on day '+a.d2+', chapter 3 on day '+a.d3+'; wagers won '+a.ww+', lost '+a.wl+' a bot; their sieges held '+a.sw+' of '+(a.sw+a.sl)+'; '+a.rec+' bodies reclaimed a bot'); if(a.d4) console.log('  rival end: chapter 4 on day '+a.d4+', chapter 5 on day '+a.d5+', ended on day '+a.ed+'; their gate cleared '+a.rgC+' of '+a.rgR+' runs; the Reckoning won '+a.rkW+' of '+a.rkT+'; rival uniques worn at the end '+a.uq); }
  if(r.gold&&r.gold.exp){ const e=r.gold.exp; console.log('  expeditions: '+e.nights+' nights a bot, '+e.won+' held; homecomings with spoils: gate '+e.gate+', cursed '+e.curse+', band '+e.band+', hunt '+e.hunt+', scavenge '+e.scav+'; '+e.clean+' whole, '+e.long+' long; '+e.rallies+' rallies'); }
  if(r.gold&&r.gold.town2){ const t=r.gold.town2; console.log('  town: '+t.n+' new-building levels a bot, '+t.spec+' specializations, '+t.emb+' embalmed raises, '+t.omen+' omens called | levels '+t.lv); console.log('  dread: '+t.dread+' at day 100, band entries calm/uneasy/afraid/terror '+t.bands+', tithes '+t.tithes+' | orders taken '+t.pick+', fulfilled '+t.ord+' (Hunts '+t.hunts+'; quest and order rewards '+t.claims+') | upkeep paid '+t.upk+' gold'); }
  if(r.gold&&r.gold.awaken) console.log('  awakening: '+r.gold.awaken.ranks+' ranks a bot, '+r.gold.awaken.spent+' gold');
  if(r.gold&&r.gold.headstones){ const h=r.gold.headstones; console.log('  headstones: spent avg '+h.spent+' / median '+h.medianSpent+' gold, '+h.tiers+' tiers, minion max HP +'+h.hpBonus); }
  if(r.events&&r.events.met!=null) console.log('  events: '+r.events.perBot+' a bot, '+r.events.met+' plain and '+r.events.chainMet+' chain events met, '+r.events.chainsEnded+' chains ended; outcomes ok '+(r.events.ok||0)+', bad '+(r.events.bad||0)+'\n    '+Object.keys(r.events).filter(k=>k.includes(':')).sort().map(k=>k+' '+r.events[k]).join(', '));
}
console.log((out.ms/1000).toFixed(1)+' s');
