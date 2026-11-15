// Runs the balance bot (tests/balance-test.js) in Node.
//   node tests/run-balance.js                                  market bot, 40 bots x 100 days, seed 7700
//   node tests/run-balance.js '{"modes":["skills"],"days":40}'  any LOTD_BALANCE.run options as JSON
//   node tests/run-balance.js '{"byLvl":true}'                 also prints each gate's clear rate by hero level on entry (Normal runs)
const ctx=require('./load-game')(['balance-test.js']);
const opts=Object.assign({bots:40,days:100,seed:7700,modes:['market']},process.argv[2]?JSON.parse(process.argv[2]):{});
const out=ctx.LOTD_BALANCE.run(opts);
for(const m of ['noSkills','skills','market','full']){
  const r=out[m]; if(!r) continue;
  console.log('\n== '+m+'  runs '+r.runs+'  clears '+r.clearRate+'  deaths '+r.deathRate+'  tower '+r.towerBest+'  levels '+JSON.stringify(r.level));
  console.table(r.gates);
  if(opts.byLvl&&r.byLvl) console.log('  clear by hero level on entry (Normal):\n    '+r.byLvl.join('\n    '));
  if(r.heat&&r.heat.length>1) console.log('  difficulty: '+r.heat.join(' | '));
  if(r.sec) console.log('  secret masters: met '+r.sec.met+', slain '+r.sec.slain);
  if(r.lore) console.log('  lore: '+Object.entries(r.lore).map(([d,v])=>d+' '+v).join(' | '));
  if(r.raids&&r.raids.sent) console.log('  raids: sent '+r.raids.sent+', won '+r.raids.won+' ('+Math.round(r.raids.won/r.raids.sent*100)+'%)');
  if(r.rift) console.log('  rift: reached by '+r.rift.open+' bots, average deepest '+r.rift.best+', best '+r.rift.deepest+'  |  passive ranks learned: '+r.passives);
}
console.log((out.ms/1000).toFixed(1)+' s');
