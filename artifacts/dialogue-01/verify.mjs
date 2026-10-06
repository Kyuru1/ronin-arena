import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/vitor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:5180/artifacts/dialogue-01/';
const wait=ms=>page.waitForTimeout(ms);
const say=()=>page.locator('.dialogue-copy p').innerText();
const click=async()=>{await page.locator('.story-advance-hint').click();await wait(200);};
const pos=()=>page.evaluate(()=>({x:window.testPlayer.x,y:window.testPlayer.y}));
try {
 await page.goto(base);await page.locator('.world-canvas').waitFor();await wait(2600);
 const welcome=await page.evaluate(async()=> (await import('/src/story/storyContent.ts')).createKetlinDialogue('Akira').lines);
 assert.ok(welcome.some(line=>line.text.includes('Jeff'))&&welcome.some(line=>line.text.includes('casa')));
 assert.ok(welcome.every(line=>!/(desaparecid|guerreiros.*não voltaram)/i.test(line.text)));
 checks.push('First welcome establishes work and home before the missing warriors are revealed');
 await page.keyboard.down('w');await wait(140);await page.keyboard.up('w');
 await page.locator('.cinematic-dialogue').waitFor();
 assert.equal(await page.locator('.dialogue-portrait').count(),2);
 assert.equal(await page.locator('.is-speaking').getAttribute('data-participant'),'ketlin');
 checks.push('Ketlin proximity starts conversation with two native portraits');
 const before=await pos();await page.keyboard.down('d');await wait(400);await page.keyboard.up('d');assert.deepEqual(await pos(),before);
 checks.push('Movement blocked during conversation');
 await page.locator('.story-advance-hint').dblclick();await wait(220);
 assert.equal(await page.locator('.is-speaking').getAttribute('data-participant'),'ketlin');
 assert.match(await say(),/visitas\.$/);checks.push('Double click reveals without skipping the current line');
 await page.screenshot({path:'artifacts/dialogue-01/desktop-ketlin.png'});
 await click();assert.equal(await page.locator('.is-speaking').getAttribute('data-participant'),'player');
 await page.keyboard.press('Escape');const pausedText=await say();await wait(400);assert.equal(await say(),pausedText);
 await page.locator('.story-advance-hint').dispatchEvent('click');assert.equal(await say(),pausedText);
 await page.keyboard.press('Escape');await wait(200);assert.notEqual(await say(),pausedText);checks.push('Pause suspends typing and input, resume continues');
 await click();await page.screenshot({path:'artifacts/dialogue-01/desktop-player.png'});
 for(const [name,width,height] of [['mobile',390,844],['landscape',740,360],['small-window',800,600]]) {
  await page.setViewportSize({width,height});await wait(200);
  const box=await page.locator('.story-dialogue-box').boundingBox();
  assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=height);
  assert.equal(await page.locator('.story-dialogue-box').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
  await page.screenshot({path:`artifacts/dialogue-01/${name}.png`});
 }
 checks.push('Mobile, landscape and window layouts fit the viewport');
 await page.setViewportSize({width:1280,height:800});
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'ALTERNAR TELA CHEIA'}).click();
 assert.equal(await page.evaluate(()=>!!document.fullscreenElement),true);
 await page.getByRole('button',{name:'CONTINUAR',exact:true}).click();await wait(200);
 assert.equal(await page.locator('.cinematic-dialogue').isVisible(),true);checks.push('Fullscreen preserves active conversation');
 await page.screenshot({path:'artifacts/dialogue-01/fullscreen.png'});
 await page.evaluate(()=>document.exitFullscreen());
 for(let i=2;i<welcome.length;i++) { // line 1 is already revealed
  await click();
  assert.equal(await page.locator('.is-speaking').getAttribute('data-participant'),welcome[i].speaker);
  await click();
  if(i===6) await page.screenshot({path:'artifacts/dialogue-01/late-welcome.png'});
 }
 checks.push('Speaker focus follows every line through the full welcome');
 await click();
 // Last line may still be typing depending on elapsed time.
 for(let i=0;i<3&&await page.locator('.cinematic-dialogue').count();i++) await click();
 assert.equal(await page.locator('.cinematic-dialogue').count(),0);
 const released=await pos();await page.keyboard.down('s');await wait(450);await page.keyboard.up('s');assert.ok((await pos()).y>released.y+10);
 checks.push('Conversation removes its box and restores movement');
 await page.keyboard.down('w');await wait(500);await page.keyboard.up('w');assert.equal(await page.locator('.cinematic-dialogue').count(),0);checks.push('Completed conversation does not reopen on proximity');
 await page.goto(base+'?mode=cast');await page.locator('.cinematic-dialogue').waitFor();
 assert.equal(await page.locator('.is-speaking').getAttribute('data-participant'),'jeff');
 await wait(250);await click();assert.equal(await page.locator('.is-speaking').getAttribute('data-participant'),'ketlin');
 while(await page.locator('.cinematic-dialogue').count()) await click();await wait(200);
 assert.equal(await page.evaluate(()=>window.completions),1);assert.equal(await page.locator('.cinematic-dialogue').count(),0);checks.push('Three-person cast and idempotent completion');
 await page.goto(base+'?mode=empty');await wait(500);assert.equal(await page.evaluate(()=>window.completions),1);checks.push('Empty sequence completes without a crash');
 await page.goto(base+'?mode=intro');await page.locator('.cinematic-dialogue').waitFor();
 for(let i=0;i<8;i++){await click();await click();}
 assert.equal(await page.evaluate(()=>window.completions),1);checks.push('Existing intro completes through shared controller');
 assert.deepEqual(errors,[]);
} catch(error) {errors.push(error.stack);}
fs.writeFileSync('artifacts/dialogue-01/report.json',JSON.stringify({checks,errors},null,2));
console.log(JSON.stringify({checks,errors},null,2));
await browser.close();if(errors.length)process.exitCode=1;


