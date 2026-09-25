import { chromium } from '../../../artifacts/signals-integration-runtime/node_modules/playwright/index.mjs';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const checks=[];
try{const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('https://vetta.agent9.dev/');await page.locator('article').first().waitFor();assert.equal(await page.locator('article').count(),20);assert((await page.locator('h1').innerText()).includes('Follow the record'));checks.push('Public mobile homepage: 20 reviewed entries and new headline');
await page.goto('https://vetta.agent9.dev/resilience');await page.getByText('Publisher signature verified.',{exact:false}).waitFor();checks.push('Public browser verifies signed manifest');
await page.goto('https://vetta.agent9.dev/fallback');await page.getByText('Received 20 nominee dossiers',{exact:false}).waitFor({timeout:20000});checks.push('Public fallback retrieves and validates 20 roster records');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
writeFileSync(new URL('live-browser-results.json',import.meta.url),JSON.stringify({checks,consoleErrors:errors},null,2)+'\n');console.log('PASS live mobile homepage, signed manifest, and authenticated 20-record Nostr fallback.');
}finally{await browser.close()}
