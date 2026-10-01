import http from 'node:http';import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/vitor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const html=fs.readFileSync('dist/index.html');const server=http.createServer((request,response)=>{
 const name=decodeURIComponent(new URL(request.url,'http://localhost').pathname).replace(/^\/ronin-arena\/?/,'')||'index.html';
 if(name.includes('..')||!fs.existsSync('dist/'+name)){response.writeHead(404);response.end();return;}
 const ext=name.split('.').pop(),mime={html:'text/html; charset=utf-8',js:'text/javascript',json:'application/json',webmanifest:'application/manifest+json',png:'image/png',svg:'image/svg+xml',ico:'image/x-icon'};
 response.setHeader('Content-Type',mime[ext]||'application/octet-stream');response.end(fs.readFileSync('dist/'+name));
});await new Promise(r=>server.listen(8766,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:8766/ronin-arena/');await page.getByRole('button',{name:'COMPUTADOR',exact:true}).click();await page.getByRole('button',{name:/HISTÓRIA/}).click();await page.getByLabel('NOME DO PROTAGONISTA').fill('Viajante');await page.getByRole('button',{name:/CONFIRMAR/}).click();await page.locator('.story-dialogue-box').waitFor();
 const canvas=await page.locator('.world-canvas').evaluate(c=>({w:c.width,h:c.height}));
 console.log(JSON.stringify({production:true,errors,canvas,bytes:html.length}));fs.writeFileSync('artifacts/kyuneth-12/production-report.json',JSON.stringify({production:true,errors,canvas,bytes:html.length},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
if(errors.length)process.exitCode=1;
