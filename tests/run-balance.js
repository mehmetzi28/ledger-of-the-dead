// Runs the balance bot (tests/balance-test.js) in Node.
//   node tests/run-balance.js                                  market bot, 40 bots x 100 days, seed 7700
//   node tests/run-balance.js '{"modes":["skills"],"days":40}'  any LOTD_BALANCE.run options as JSON
const ctx=require('./load-game')(['balance-test.js']);
const opts=Object.assign({bots:40,days:100,seed:7700,modes:['market']},process.argv[2]?JSON.parse(process.argv[2]):{});
const out=ctx.LOTD_BALANCE.run(opts);
for(const m of ['noSkills','skills','market','full']){
  const r=out[m]; if(!r) continue;
  console.log('\n== '+m+'  runs '+r.runs+'  clears '+r.clearRate+'  deaths '+r.deathRate+'  tower '+r.towerBest+'  levels '+JSON.stringify(r.level));
  console.table(r.gates);
}
console.log((out.ms/1000).toFixed(1)+' s');
