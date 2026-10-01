import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/vitor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/');await page.getByRole('button',{name:'CELULAR',exact:true}).click();await page.getByRole('button',{name:/HISTÓRIA/}).click();await page.getByLabel('NOME DO PROTAGONISTA').fill('Viajante');await page.evaluate(()=>{
 const NativeImage=window.Image;window.failKyunethArt=true;
 window.Image=class extends NativeImage {
  set src(value){super.src=window.failKyunethArt?'data:image/png;base64,invalid':value;}
  get src(){return super.src;}
 };
});
await page.getByRole('button',{name:/CONFIRMAR/}).click();
await page.getByRole('button',{name:'TENTAR NOVAMENTE'}).waitFor();await page.evaluate(()=>{window.failKyunethArt=false;});await page.getByRole('button',{name:'TENTAR NOVAMENTE'}).click();await page.locator('.story-dialogue-box').waitFor();
for(let i=0;i<8;i++){
 if(!await page.locator('.story-advance-hint').evaluate(e=>e.classList.contains('is-ready')))await page.locator('.story-dialogue-box').tap();await page.locator('.story-advance-hint.is-ready').waitFor();await page.locator('.story-dialogue-box').tap();await page.waitForTimeout(120);
}
await page.locator('.kyuneth-state').waitFor();await page.waitForTimeout(2500);
const up=page.getByRole('button',{name:'Mover para cima'});const box=await up.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(1300);await page.mouse.up();
await page.screenshot({path:'artifacts/kyuneth-12/celular-touch.png'});
console.log(JSON.stringify({retry:true,touch:true,errors}));fs.writeFileSync('artifacts/kyuneth-12/touch-report.json',JSON.stringify({retry:true,touch:true,errors},null,2));await browser.close();if(errors.length)process.exitCode=1;

