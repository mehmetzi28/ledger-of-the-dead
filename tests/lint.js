// Lint: finds line comments whose text looks like code. Much of index.html is long one-line statements; a "// note" dropped
// into the middle of one silently comments out everything after it on that line (it happened twice). Run by run-tests.js.
//   node tests/lint.js [file]      exit code 1 if anything looks swallowed
const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'..','index.html'),'utf8');
const start=html.indexOf('<script>'), body=html.slice(start);
const lines=body.split('\n'), off=html.slice(0,start).split('\n').length-1, hits=[];
function commentAt(line){   // index of a // that starts a comment, skipping strings, template literals and regex literals (roughly)
  let q=null;
  for(let i=0;i<line.length;i++){ const c=line[i];
    if(q){ if(c==='\\'){ i++; continue; } if(c===q) q=null; continue; }
    if(c==='"'||c==="'"||c==='`'){ q=c; continue; }
    if(c==='/'&&line[i+1]==='/') return i;
    if(c==='/'&&line[i+1]!=='*'){ const prev=line.slice(0,i).trimEnd().slice(-1); if(!prev||'(,=:[!&|?{};+-*%<>~^'.includes(prev)){ let j=i+1; for(;j<line.length;j++){ if(line[j]==='\\'){ j++; continue; } if(line[j]==='[') { while(j<line.length&&line[j]!==']') j++; continue; } if(line[j]==='/') break; } i=j; continue; } }
  }
  return -1;
}
lines.forEach((l,n)=>{ const i=commentAt(l); if(i<0) return; const c=l.slice(i+2);
  if(/;\s*[A-Za-z_$][\w$.\[\]'"]*\s*(=(?!=)|\()/.test(c)&&/[;})]\s*$/.test(c.trim())) hits.push((n+off+1)+': '+c.trim().slice(0,120)); });
if(require.main===module){ console.log(hits.length?hits.length+' line comment(s) look like swallowed code:':'lint: no swallowed code'); hits.forEach(h=>console.log('  index.html:'+h)); process.exit(hits.length?1:0); }
module.exports=hits;
