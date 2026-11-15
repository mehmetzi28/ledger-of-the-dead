// Lint: finds line comments whose text looks like code. Much of the game is long one-line statements; a "// note" dropped
// into the middle of one silently comments out everything after it on that line (it happened twice). Run by run-tests.js.
//   node tests/lint.js           lint src/*.js (control characters: every src file), report file:line; exit code 1 if anything looks swallowed
//   node tests/lint.js [file]    lint the <script> part of one HTML file (e.g. a tuned copy of index.html)
const fs=require('fs'), path=require('path');
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
// text: the file's text; name: shown before each line number; codeFrom: line index where JavaScript starts (0 for a .js file)
function lintText(text,name,codeFrom){
  const hits=[], all=text.split('\n');
  all.forEach((l,n)=>{ if(n<codeFrom) return; const i=commentAt(l); if(i<0) return; const c=l.slice(i+2);
    if(/;\s*[A-Za-z_$][\w$.\[\]'"]*\s*(=(?!=)|\()/.test(c)&&/[;})]\s*$/.test(c.trim())) hits.push(name+':'+(n+1)+': '+c.trim().slice(0,120)); });
  // Stray control characters (a backslash-b written through a script once became a real backspace and silently broke a regex).
  all.forEach((l,n)=>{ const m=l.match(/[\x00-\x08\x0b\x0c\x0e-\x1f]/); if(m) hits.push(name+':'+(n+1)+': control character U+'+m[0].charCodeAt(0).toString(16).padStart(4,'0')+' near "'+l.slice(Math.max(0,m.index-30),m.index).trim()+'"'); });
  return hits;
}
const arg=require.main===module&&process.argv[2];
let hits;
if(arg){ const html=fs.readFileSync(arg,'utf8'); hits=lintText(html,path.basename(arg),html.slice(0,html.indexOf('<script>')).split('\n').length-1); }
else { const src=path.join(__dirname,'..','src'); hits=[].concat(...fs.readdirSync(src).sort().map(f=>lintText(fs.readFileSync(path.join(src,f),'utf8'),'src/'+f,f.endsWith('.js')?0:Infinity))); }
if(require.main===module){ console.log(hits.length?hits.length+' problem(s): line comments that look like swallowed code, or control characters:':'lint: no swallowed code'); hits.forEach(h=>console.log('  '+h)); process.exit(hits.length?1:0); }
module.exports=hits;
