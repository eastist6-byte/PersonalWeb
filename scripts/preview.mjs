import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {ROOT,inside} from './paths.mjs';
const record=JSON.parse(await fs.readFile(inside(ROOT,'work/generated/build.json'),'utf8').catch(()=>{throw new Error('请先运行 npm run build');}));
const base=record.base,root=inside(ROOT,'outputs/pages'),port=Number(process.env.PORT??4433);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2','.woff':'font/woff','.zip':'application/zip','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
    const u=new URL(req.url,'http://127.0.0.1');
    if(base!=='/'&&u.pathname===base.slice(0,-1)){res.writeHead(308,{Location:base});return res.end();}
    if(!u.pathname.startsWith(base))return missing(res,req);
    const rel=decodeURIComponent(u.pathname.slice(base.length));
    if(rel.includes('\\')||rel.split('/').some(part=>part==='..'||part.startsWith('.')))return missing(res,req);
    let file=inside(root,rel);
    const stat=await fs.stat(file).catch(()=>null);
    if(!stat)return missing(res,req);
    if(stat.isDirectory()){
      if(!u.pathname.endsWith('/')){res.writeHead(308,{Location:u.pathname+'/'+u.search});return res.end();}
      file=path.join(file,'index.html');
    }
    const bytes=await fs.readFile(file).catch(()=>null);
    if(!bytes)return missing(res,req);
    res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]??'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(400);res.end('Bad request');}
});
async function missing(res,req){
  const bytes=await fs.readFile(path.join(root,'404.html'));
  res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  res.end(req.method==='HEAD'?undefined:bytes);
}
server.listen(port,'127.0.0.1',()=>console.log('静态预览：http://127.0.0.1:'+port+base));
