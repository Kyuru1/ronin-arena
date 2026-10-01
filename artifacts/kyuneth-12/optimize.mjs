import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url),sharp=require('C:/Users/vitor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
let before=0,after=0;
for(const name of fs.readdirSync('src/story/assets').filter(x=>x.endsWith('.png'))){
 const file=`src/story/assets/${name}`,input=fs.readFileSync(file);before+=input.length;
 // Lossless encoding only: do not change pixels, alpha, palette, resolution, or art.
 const encoded=await sharp(input).png({compressionLevel:9,effort:10}).toBuffer();
 if(encoded.length<input.length)fs.writeFileSync(file,encoded);
 after+=Math.min(encoded.length,input.length);
}
console.log(JSON.stringify({before,after}));
