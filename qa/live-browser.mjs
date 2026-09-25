import { chromium } from '../../../artifacts/signals-integration-runtime/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const checks=[];
try{const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('https://vetta.agent9.dev/');await page.locator('article').first().waitFor();assert.equal(await page.locator('article').count(),20);assert((await page.locator('h1').innerText()).includes('Follow the record'));checks.push('Public mobile homepage: 20 reviewed entries and new headline');
await page.goto('https://vetta.agent9.dev/resilience');await page.getByText('Publisher signature verified.',{exact:false}).waitFor();checks.push('Public browser verifies signed manifest');
if(process.env.QA_REPLAY==='1'){
 const signed=JSON.parse(readFileSync(new URL('../review/publication-bundle.json',import.meta.url),'utf8')).snapshot;
 await page.addInitScript(event=>{window.WebSocket=class{readyState=0;onopen=null;onmessage=null;onerror=null;onclose=null;constructor(){setTimeout(()=>{this.readyState=1;this.onopen?.()},0)}send(text){const a=JSON.parse(text);if(a[0]==='REQ')setTimeout(()=>{this.onmessage?.({data:JSON.stringify(['EVENT',a[1],event])});this.onmessage?.({data:JSON.stringify(['EOSE',a[1]])})},0)}close(){this.readyState=3}}},signed);
}
await page.goto('https://vetta.agent9.dev/fallback');await page.getByText('Received 20 nominee dossiers',{exact:false}).waitFor({timeout:20000});checks.push(process.env.QA_REPLAY==='1'?'Deployed fallback validates 20 records from a replay of the signed published snapshot':'Public fallback retrieves and validates 20 roster records');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
writeFileSync(new URL(process.env.QA_REPLAY==='1'?'browser-replay-results.json':'live-browser-results.json',import.meta.url),JSON.stringify({checks,consoleErrors:errors},null,2)+'\n');console.log('PASS deployed mobile homepage, signed manifest, authenticated 20-record fallback rendering and no horizontal overflow. Mode: '+(process.env.QA_REPLAY==='1'?'signed-response replay':'live relay'));
}finally{await browser.close()}
