import { chromium } from '../../../artifacts/signals-integration-runtime/node_modules/playwright/index.mjs';
import {createServer} from 'node:http';
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));const dist=root+'app/dist';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server=createServer((req,res)=>{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path.includes('..')){res.writeHead(400).end();return}let file=dist+(path==='/'?'/index.html':path);if(!existsSync(file))file=dist+'/index.html';const ext=file.slice(file.lastIndexOf('.'));res.setHeader('Content-Type',types[ext]||'application/octet-stream');res.end(readFileSync(file))});
await new Promise(resolve=>server.listen(4179,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const results=[];const errors=[];
try {
 for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/nominees','/nominee/kithure-kindiki','/hearings','/vote','/ledger','/corrections','/resilience','/tips','/support','/fallback']){
 await page.goto('http://127.0.0.1:4179'+path);await page.waitForTimeout(180);
 assert(await page.locator('h1').count()>0,path+' heading');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path+' overflow '+width);
 results.push({path,width,passed:true});
 }
 await page.goto('http://127.0.0.1:4179/resilience');await page.getByText('Publisher signature verified.',{exact:false}).waitFor();
 await page.locator('input[type=file]').setInputFiles(dist+'/data/release.json');await page.getByText('Match: data/release.json',{exact:false}).waitFor();
 await page.locator('input[type=file]').setInputFiles({name:'tampered.json',mimeType:'application/json',buffer:Buffer.from('{}')});await page.getByText('No match.',{exact:false}).waitFor();
 await page.goto('http://127.0.0.1:4179/tips');assert(await page.locator('button[type=submit]').isDisabled());
 await page.goto('http://127.0.0.1:4179/');await page.locator('article').first().waitFor();assert.equal(await page.locator('article').count(),20);await page.screenshot({path:root+`qa/home-${width}.png`,fullPage:true});
 await page.close();
 }
 const offline=await browser.newPage();await offline.route('http**/*',r=>r.abort());await offline.goto('file://'+dist+'/downloads/vetta-offline.html');assert.equal(await offline.locator('article').count(),20);assert((await offline.locator('body').innerText()).includes('committee rejection recommendation'));results.push({offlineNoNetwork:true,records:20});
 assert.deepEqual(errors,[]);writeFileSync(root+'qa/browser-results.json',JSON.stringify({results,consoleErrors:errors},null,2)+'\n');console.log('PASS 22 responsive route checks, signed-file match/tamper checks, disabled tips, and offline 20-record rendering.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
