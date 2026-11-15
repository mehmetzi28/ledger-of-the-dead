// Builds index.html (the shipped game, committed) from the files in src/. Never edit index.html by hand.
//   node tools/build.js           write index.html: each "@@include <file>" line in src/index.template.html becomes that file's exact bytes
//   node tools/build.js --check   write nothing; exit 1 if index.html differs from what the build would produce
// require('./build') gives {build, check, srcNewer, ...} for other scripts (run-tests.js, serve.js).
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..'), SRC=path.join(ROOT,'src'), OUT=path.join(ROOT,'index.html'), TEMPLATE=path.join(SRC,'index.template.html');
const MARK=/^@@include (\S+)$/;

function fail(msg){ const e=new Error('build: '+msg); e.buildError=true; throw e; }
function readClean(f){   // UTF-8 bytes, LF only, no BOM
  if(!fs.existsSync(f)) fail('missing file '+path.relative(ROOT,f).split(path.sep).join('/')+' (named by an @@include line in src/index.template.html)');
  const b=fs.readFileSync(f), rel=path.relative(ROOT,f).split(path.sep).join('/');
  if(b[0]===0xEF&&b[1]===0xBB&&b[2]===0xBF) fail(rel+' starts with a BOM; save it as UTF-8 without BOM');
  const cr=b.indexOf(13); if(cr>=0) fail(rel+' contains a CR (line '+(b.subarray(0,cr).toString('utf8').split('\n').length)+'); line endings must be LF');
  return b;
}
function srcFiles(){ return fs.readdirSync(SRC).filter(f=>fs.statSync(path.join(SRC,f)).isFile()).sort(); }

// Returns the bytes index.html should have. Throws on a missing include, a CR, or a src file the template does not list.
function build(){
  const tpl=readClean(TEMPLATE).toString('utf8'), parts=[], used=new Set(['index.template.html']);
  let text='';
  for(const l of tpl.split(/(?<=\n)/)){   // each piece keeps its LF; a marker line is replaced whole, LF included
    const m=l.replace(/\n$/,'').match(MARK);
    if(!m){ text+=l; continue; }
    if(used.has(m[1])) fail('src/'+m[1]+' is included twice');
    used.add(m[1]);
    parts.push(Buffer.from(text,'utf8'), readClean(path.join(SRC,m[1]))); text='';
  }
  parts.push(Buffer.from(text,'utf8'));
  const extra=srcFiles().filter(f=>!used.has(f));
  if(extra.length) fail('not listed in src/index.template.html: '+extra.map(f=>'src/'+f).join(', ')+' (add an @@include line or remove the file)');
  return Buffer.concat(parts);
}
function srcNewer(){   // true if any src file was modified after index.html (or index.html is missing)
  if(!fs.existsSync(OUT)) return true;
  const t=fs.statSync(OUT).mtimeMs;
  return srcFiles().some(f=>fs.statSync(path.join(SRC,f)).mtimeMs>t);
}
function write(){ const b=build(); fs.writeFileSync(OUT,b); return b; }   // always written, so index.html ends up newer than src/
// null when index.html matches the build; otherwise a message saying what to do.
function check(){
  const b=build(), cur=fs.existsSync(OUT)?fs.readFileSync(OUT):null;
  if(cur&&cur.equals(b)) return null;
  if(cur&&!srcNewer()) return 'index.html differs from src/ and is newer than every src file: it was edited directly. Move that edit into src/ (index.html is generated), then run node tools/build.js';
  return 'index.html is out of date with src/: run node tools/build.js';
}
module.exports={build,write,check,srcNewer,ROOT,SRC,OUT};

if(require.main===module){
  try{
    if(process.argv.includes('--check')){ const msg=check(); if(msg){ console.error('Build check failed: '+msg); process.exit(1); } console.log('build check: index.html matches src/'); }
    else { const b=write(); console.log('built index.html ('+b.length+' bytes)'); }
  }catch(e){ if(!e.buildError) throw e; console.error(e.message); process.exit(1); }
}
