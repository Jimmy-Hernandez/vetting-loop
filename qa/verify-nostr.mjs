import {readFileSync,writeFileSync} from 'node:fs';
import {verifyEvent,getEventHash} from '../app/node_modules/nostr-tools/lib/esm/index.js';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const pin=read('app/src/publisher-config.json').pubkey;const receipt=read('review/publication-receipt.json');
const expected=[receipt.snapshotId,receipt.correctionId,read('app/dist/manifest-event.json').id,read('app/dist/publisher-profile.json').id];
const events=await new Promise((resolve,reject)=>{const records=[];const ws=new WebSocket('wss://relay.damus.io');const timer=setTimeout(()=>{ws.close();reject(Error('relay read timeout'))},15000);ws.onopen=()=>ws.send(JSON.stringify(['REQ','verify-release',{ids:expected}]));ws.onmessage=m=>{const a=JSON.parse(m.data);if(a[0]==='EVENT'&&a[1]==='verify-release')records.push(a[2]);if(a[0]==='EOSE'&&a[1]==='verify-release'){clearTimeout(timer);ws.close();resolve(records)}};ws.onerror=()=>{clearTimeout(timer);reject(Error('relay connection failed'))}});
for(const id of expected){const e=events.find(e=>e.id===id);assert(e,'missing published event');assert.equal(e.pubkey,pin);assert.equal(getEventHash(e),e.id);assert(verifyEvent(e))}
const snapshot=JSON.parse(events.find(e=>e.id===receipt.snapshotId).content);assert.equal(snapshot.schema,'vetta.fallback');assert.equal(snapshot.episode.nominees.length,20);assert.equal(snapshot.approval.registerSha256,read('app/dist/data/release.json').review.registerSha256);
const result={relay:'wss://relay.damus.io',verifiedSignedEvents:expected.length,roster:20,snapshotId:receipt.snapshotId,correctionId:receipt.correctionId,verifiedAt:new Date().toISOString()};
writeFileSync(new URL('qa/nostr-live-results.json',root),JSON.stringify(result,null,2)+'\n');console.log('PASS independently retrieved 4 signed events and matched reviewed roster/register.');
