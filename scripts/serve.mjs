import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv.includes('--dist')?'dist':'.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
http.createServer(async(req,res)=>{try{
const url=new URL(req.url,'http://localhost');const resource=decodeURIComponent(url.pathname);const file=path.resolve(root,'.'+(resource.endsWith('/')?resource+'index.html':resource));
if(!file.startsWith(root+path.sep)||!(await stat(file)).isFile())throw Error('404');
res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(await readFile(file));
}catch{res.writeHead(404);res.end('Not found');}}).listen(Number(process.env.PORT||4180),'0.0.0.0',()=>console.log(`Local: http://localhost:${process.env.PORT||4180}`));
