import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/vitor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const page=await browser.newPage({viewport:{width:1000,height:660}});
page.on('pageerror',e=>console.log(e.message));await page.goto('http://127.0.0.1:5173/artifacts/kyuneth-12/characters.html');await page.waitForFunction(()=>window.ready);await page.screenshot({path:'artifacts/kyuneth-12/personagens.png'});await browser.close();
