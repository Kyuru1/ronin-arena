import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/vitor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log(e.stack)});page.on('console',m=>console.log(m.type(),m.text()));
for(const [name,x,y] of [['praca',400,373],['praia',200,410],['ferraria',557,348]]){
 await page.goto(`http://127.0.0.1:5173/artifacts/kyuneth-12/preview.html?x=${x}&y=${y}`);await page.waitForFunction(()=>window.ready);
 await page.screenshot({path:`artifacts/kyuneth-12/${name}.png`});
}
console.log(JSON.stringify({errors}));await browser.close();


