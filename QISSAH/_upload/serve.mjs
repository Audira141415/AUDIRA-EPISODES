import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT=process.env.AU_ROOT||'F:/AUDIRA-EPISODES/QISSAH';
http.createServer((req,res)=>{
  const h={'Access-Control-Allow-Origin':'https://studio.youtube.com','Access-Control-Allow-Private-Network':'true','Access-Control-Allow-Methods':'GET','Access-Control-Allow-Headers':'*'};
  if(req.method==='OPTIONS'){res.writeHead(204,h);return res.end();}
  if(req.url==='/inject.js'){res.writeHead(200,{...h,'Content-Type':'text/plain'});return res.end(fs.readFileSync('F:/AUDIRA-EPISODES/QISSAH/_upload/inject.js'));}
  if(req.url==='/meta.json'){res.writeHead(200,{...h,'Content-Type':'application/json'});return res.end(fs.readFileSync('F:/AUDIRA-EPISODES/QISSAH/_upload/meta.json'));}
  const rel=decodeURIComponent(new URL(req.url,'http://x').pathname).slice(1);
  const p=path.resolve(ROOT,rel);
  if(!p.startsWith(path.resolve(ROOT))||!/\.mp4$/i.test(p)||!fs.existsSync(p)){res.writeHead(404,h);return res.end();}
  res.writeHead(200,{...h,'Content-Type':'video/mp4','Content-Length':fs.statSync(p).size});
  fs.createReadStream(p).pipe(res);
}).listen(8765,'127.0.0.1',()=>console.log('listening 8765'));
