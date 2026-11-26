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
  if(r.sec) console.log('  secret masters: met '+r.sec.met+', slain '+r.sec.slain);
  if(r.lore) console.log('  lore: '+Object.entries(r.lore).map(([d,v])=>d+' '+v).join(' | '));
  if(r.sieges&&r.sieges.fought) console.log('  sieges: fought '+r.sieges.fought+', held '+r.sieges.won+' ('+Math.round(r.sieges.won/r.sieges.fought*100)+'%)');
  if(r.rival&&(r.rival.fights||r.rival.thefts)) console.log('  rival: met on day '+r.rival.metDay+' on average, challenges '+r.rival.fights+', won '+r.rival.wins+', lost '+r.rival.losses+' ('+r.rival.winRate+'), bodies taken '+r.rival.thefts);
  if(r.raids&&r.raids.sent) console.log('  raids: sent '+r.raids.sent+', won '+r.raids.won+' ('+Math.round(r.raids.won/r.raids.sent*100)+'%)');
  if(r.gold) console.log('  gold held (avg / median, lifetime earned / spent): '+Object.entries(r.gold).filter(([d])=>/^day/.test(d)).map(([d,g])=>d+' '+g.avg+' / '+g.median+' ('+g.earned+' / '+g.spent+')').join(' | ')+'  |  mausoleums '+r.gold.maus+', bonded pairs '+r.gold.bonds);
  if(r.rift) console.log('  rift: reached by '+r.rift.open+' bots, average deepest '+r.rift.best+', best '+r.rift.deepest+'  |  passive ranks learned: '+r.passives);
  if(r.gold&&r.gold.awaken) console.log('  awakening: '+r.gold.awaken.ranks+' ranks a bot, '+r.gold.awaken.spent+' gold');
  if(r.gold&&r.gold.headstones){ const h=r.gold.headstones; console.log('  headstones: spent avg '+h.spent+' / median '+h.medianSpent+' gold, '+h.tiers+' tiers, minion max HP +'+h.hpBonus); }
  if(r.events&&r.events.met!=null) console.log('  events: '+r.events.perBot+' a bot, '+r.events.met+' plain and '+r.events.chainMet+' chain events met, '+r.events.chainsEnded+' chains ended; outcomes ok '+(r.events.ok||0)+', bad '+(r.events.bad||0)+'\n    '+Object.keys(r.events).filter(k=>k.includes(':')).sort().map(k=>k+' '+r.events[k]).join(', '));
}
console.log((out.ms/1000).toFixed(1)+' s');
