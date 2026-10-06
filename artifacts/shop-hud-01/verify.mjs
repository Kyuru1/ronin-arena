import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/vitor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page = await browser.newPage({viewport:{width:1366,height:768}});
const errors=[], checks=[];
page.on('pageerror', error=>errors.push(error.message));
const base='http://127.0.0.1:5173/artifacts/shop-hud-01/';
const tab = name=>page.locator('.store-nav').getByRole('button',{name,exact:false}).click();
async function shot(name) { await page.screenshot({path:`artifacts/shop-hud-01/${name}.png`}); }
async function fits() {
  const issues=await page.locator('.store-frame').evaluate(root=>{
    const r=root.getBoundingClientRect();
    const errors=[];
    if(r.left<0||r.top<0||r.right>innerWidth+1||r.bottom>innerHeight+1) errors.push('frame outside viewport');
    for(const e of root.querySelectorAll('.store-nav,.store-header,.shop-content,.store-footer,.store-card,.store-weapon')) if(e.scrollWidth>e.clientWidth+2) errors.push(`${e.className}: horizontal overflow`);
    const footer=root.querySelector('.store-footer').getBoundingClientRect();
    if(footer.bottom>innerHeight||footer.top<0) errors.push('footer not visible');
    if(root.querySelector('.shop-content').clientHeight < 100) errors.push('content area too short');
    return errors;
  });
  assert.deepEqual(issues,[]);
}
try {
  await page.goto(base); await page.locator('.store-frame').waitFor(); await page.evaluate(()=>document.fonts.ready);
  await fits(); await shot('desktop-overview');
  assert.match(await page.locator('.store-heading').evaluate(e=>getComputedStyle(e).fontFamily),/Press Start/);
  await tab('Melhorar arma'); await fits(); await shot('desktop-upgrades');
  await page.locator('.store-upgrades .store-card').first().getByRole('button',{name:'Melhorar',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.testGame.coins),4);
  assert.equal(await page.evaluate(()=>window.testGame.weaponLevels.katana.damage),1);
  await page.locator('.store-back').click(); assert.equal(await page.locator('.store-categories').count(),1);
  await page.locator('.store-nav button').first().focus(); await page.keyboard.press('Tab'); assert.equal(await page.locator('.store-nav button').nth(1).evaluate(e=>e===document.activeElement),true);
  checks.push('Upgrade deducts exact cost, updates level, and Back returns to overview');
  await tab('Ronin'); await fits(); await shot('desktop-ronin');
  await page.keyboard.press('Escape'); assert.equal(await page.locator('.store-categories').count(),1);
  await page.goto(base+'?coins=200'); await tab('Armas');
  assert.equal(await page.locator('.store-weapon-list .store-weapon').count(),10);
  assert.equal(await page.locator('.store-weapon-list').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),2);
  await fits(); await shot('desktop-weapons-catalog');
  await page.locator('.store-weapon').filter({hasText:'ARCO'}).click();
  await page.getByRole('button',{name:/Comprar e equipar/}).click();
  assert.equal(await page.evaluate(()=>window.testGame.coins),165);
  assert.equal(await page.evaluate(()=>window.testGame.currentWeapon),'bow');
  await fits(); await shot('desktop-weapons');
  await page.getByRole('button',{name:/Vender arma/}).click();
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.testGame.weapons.length),2);
  await page.getByRole('button',{name:/Vender arma/}).click(); await page.getByRole('button',{name:'Confirmar venda',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.testGame.coins),185);
  checks.push('Weapon purchase equips, selling requires confirmation and refunds correctly');
  await tab('Sua jornada'); await fits(); await shot('desktop-character');
  await page.getByRole('button',{name:/Começar onda/}).click();
  await page.keyboard.press('Escape'); assert.equal(await page.locator('.store-leave-confirm').count(),0);
  await page.getByRole('button',{name:/Começar onda/}).click(); await page.getByRole('button',{name:/Guardar e seguir/}).click(); await page.locator('#closed').waitFor();
  checks.push('Leaving with affordable options can be cancelled or confirmed');
  for(const [name,width,height] of [['mobile',390,844],['landscape',740,360],['small',800,600]]) {
    await page.setViewportSize({width,height}); await page.goto(base+'?mobile&coins=24');
    for(const section of ['Visão geral','Armas','Melhorar arma','Ronin','Sua jornada']) { await tab(section); await fits(); if(section==='Armas'||section==='Visão geral') await shot(`${name}-${section==='Armas'?'weapons':'overview'}`); }
    checks.push(`${name}: all five sections fit, with footer visible and no horizontal overflow`);
  }
  for(const [name,width,height,mobile] of [['desktop',1366,768,false],['mobile',390,844,true]]) {
    await page.setViewportSize({width,height}); await page.goto(base+'?hud'+(mobile?'&mobile':'')); await page.locator('.arena-hud').waitFor();
    for(const selector of ['.dash-action','.hud-race-ability','.weapon-hud-group']) {
      const r=await page.locator(selector).boundingBox(); assert.ok(r && r.x>=0 && r.y>=0 && r.x+r.width<=width && r.y+r.height<=height,`${name}: ${selector} outside viewport`);
    }
    await shot(`${name}-hud`);
    checks.push(`${name}: dash, ability and arsenal visible within viewport`);
  }
  await page.goto(base+'?coins=0'); await page.getByRole('button',{name:/Começar onda/}).click(); await page.locator('#closed').waitFor();
  checks.push('No unnecessary confirmation when no purchase is affordable');
  await page.goto('http://127.0.0.1:5173/');
  await page.getByRole('button',{name:/COMPUTADOR|COMPUTER/}).first().click();
  const story=page.locator('.story-menu-button'); await story.waitFor();
  assert.equal(await story.isDisabled(),true);
  assert.match(await story.innerText(),/EM DESENVOLVIMENTO/);
  await shot('story-disabled');
  checks.push('Story entry remains visible as in development and cannot be opened');
  assert.deepEqual(errors,[]);
} catch(error) { errors.push(error.stack); }
await browser.close();
fs.writeFileSync('artifacts/shop-hud-01/report.json', JSON.stringify({checks,errors},null,2));
console.log(JSON.stringify({checks,errors},null,2));
if(errors.length) process.exitCode=1;
