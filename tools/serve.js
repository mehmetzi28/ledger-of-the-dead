// Tiny static server for playing/testing locally with working saves (browsers block localStorage on data: pages).
// Run: node tools/serve.js   then open http://localhost:5173
const http=require('http'), fs=require('fs'), path=require('path');
const root=path.join(__dirname,'..'), port=+process.env.PORT||5173;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/') p='/index.html';
  const f=path.normalize(path.join(root,p));
  if(!f.startsWith(root)){ res.writeHead(403); return res.end(); }
  fs.readFile(f,(err,data)=>{
    if(err){ res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'}); res.end(data);
  });
}).listen(port,'127.0.0.1',()=>console.log('Ledger of the Dead at http://localhost:'+port));
