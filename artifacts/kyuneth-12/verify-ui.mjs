import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/vitor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/');
await page.getByRole('button',{name:'COMPUTADOR',exact:true}).click();await page.getByRole('button',{name:/HISTÓRIA/}).click();
await page.getByLabel('NOME DO PROTAGONISTA').fill('Viajante');await page.getByRole('button',{name:/CONFIRMAR/}).click();
await page.locator('.story-dialogue-box').waitFor();await page.waitForTimeout(1200);await page.screenshot({path:'artifacts/kyuneth-12/prologo-interface.png'});
for(let i=0;i<8;i++){
 const hint=page.locator('.story-advance-hint');if(!await hint.evaluate(e=>e.classList.contains('is-ready')))await page.locator('.story-dialogue-box').click();
 await page.locator('.story-advance-hint.is-ready').waitFor();await page.locator('.story-dialogue-box').click();await page.waitForTimeout(120);
}
await page.locator('.kyuneth-state').waitFor();await page.waitForTimeout(2600);await page.screenshot({path:'artifacts/kyuneth-12/chegada.png'});
await page.keyboard.down('w');await page.waitForTimeout(2700);await page.keyboard.up('w');await page.screenshot({path:'artifacts/kyuneth-12/exploracao-interface.png'});
await page.keyboard.press('Escape');await page.getByRole('dialog',{name:'Jogo pausado'}).waitFor();await page.screenshot({path:'artifacts/kyuneth-12/pausa.png'});
await page.getByRole('button',{name:'CONTINUAR',exact:true}).click();await page.getByRole('dialog',{name:'Jogo pausado'}).waitFor({state:'hidden'});
for(const [name,width,height] of [['celular-vertical',390,844],['celular-horizontal',844,390]]){
 await page.setViewportSize({width,height});await page.waitForTimeout(400);await page.screenshot({path:`artifacts/kyuneth-12/${name}.png`});
}
console.log(JSON.stringify({errors,flow:'menu > nome > 8 falas > chegada > caminhada > pausa > continuar',viewports:3}));
fs.writeFileSync('artifacts/kyuneth-12/ui-report.json',JSON.stringify({errors,flow:true,viewports:3},null,2));
await browser.close();
