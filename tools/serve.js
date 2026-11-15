// Tiny static server for playing/testing locally with working saves (browsers block localStorage on data: pages).
// Serves the built index.html and rebuilds it from src/ first when a src file is newer, so edit-and-refresh works.
// Run: node tools/serve.js   then open http://localhost:5173  (add a port, e.g. 5174, for a separate set of saves)
const http=require('http'), fs=require('fs'), path=require('path');
const root=path.join(__dirname,'..'), port=+process.argv[2]||+process.env.PORT||5173;   // node tools/serve.js 5174 runs a second copy with its own saves (saves are kept per port)
const build=require('./build');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/') p='/index.html';
  if(p==='/index.html'&&build.srcNewer()){ try{ build.write(); console.log('rebuilt index.html from src/'); }catch(e){ console.error(e.message); res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'}); return res.end(e.message); } }   // edit src/, refresh the page
  const f=path.normalize(path.join(root,p));
  if(!f.startsWith(root)){ res.writeHead(403); return res.end(); }
  fs.readFile(f,(err,data)=>{
    if(err){ res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'}); res.end(data);
  });
}).listen(port,'127.0.0.1',()=>console.log('Ledger of the Dead at http://localhost:'+port));
