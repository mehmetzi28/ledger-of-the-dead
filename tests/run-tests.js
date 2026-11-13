// Runs tests/game-tests.js against index.html in Node, with a small fake browser (no packages needed).
//   node tests/run-tests.js            run everything
//   node tests/run-tests.js save       only tests whose name contains "save"
//   TRACE=1 node tests/run-tests.js    print each test name before it runs (finds a hang)
// Exit code is 1 if any test fails, so it can gate a commit or CI.
let ctx;
try{ ctx=require('./load-game')(['game-tests.js']); }
catch(e){ console.error('index.html failed to load:\n'+(e.stack||e)); process.exit(1); }

const res=ctx.LOTD_TESTS.run({filter:process.argv[2]||'',quiet:true,trace:!!process.env.TRACE});
let group='';
for(const r of res.results){
  const g=r.name.split(':')[0]; if(g!==group){ group=g; console.log('\n'+g); }
  console.log((r.ok?'  \x1b[32mok\x1b[0m   ':'  \x1b[31mFAIL\x1b[0m ')+r.name.slice(g.length+1).trim()+(r.ok?'':'\n         '+r.err));
}
console.log('\n'+res.pass+' passed, '+res.fail+' failed ('+res.results.length+' tests, '+res.ms+' ms)');
process.exit(res.fail?1:0);
