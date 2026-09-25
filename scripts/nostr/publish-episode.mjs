// Public addressable snapshot with immutable correction-chain events.
// All content comes from the same gated release as the site and offline package.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {finalizeEvent,getPublicKey,nip19,verifyEvent} from '../../app/node_modules/nostr-tools/lib/esm/index.js';
const root=fileURLToPath(new URL('../../',import.meta.url));
execFileSync(process.execPath,[join(root,'scripts/release/check.mjs')],{stdio:'inherit'});
const read=p=>JSON.parse(readFileSync(join(root,p),'utf8'));
const config=read('app/src/publisher-config.json');const release=read('app/dist/data/release.json');
const relayArg=process.argv.indexOf('--relay');
const relays=relayArg>=0?[process.argv[relayArg+1]]:config.relays;
if(!relays.every(r=>typeof r==='string'&&/^wss:\/\//.test(r)))throw Error('Only secure relay URLs are accepted');
const current=read('app/public/data/release.json');if(JSON.stringify(current)!==JSON.stringify(release))throw Error('Build is stale');
const payload={schema:'vetta.fallback',version:1,approval:{status:'approved',registerSha256:release.review.registerSha256,reviewedAt:new Date().toISOString()},episode:{title:release.episode,date:'2024-08-07',summary:'Reviewed historical roster only. 19 House approvals and one committee rejection recommendation. Other dossier claims and hearing metrics are withheld pending source clearance.',nominees:release.nominees.map(n=>({slug:n.slug,name:n.name,portfolio:n.portfolio,status:n.status==='rejected'?'committee_rejection_recommended':n.status,flags:[],positiveCount:0})),trail:null}};
if(process.argv.includes('--dry-run')){console.log('Dry run passed: reviewed snapshot prepared; no key loaded or network opened.');process.exit(0)}
if(!process.argv.includes('--publish'))throw Error('Use --dry-run or --publish');
if(relays.length===0)throw Error('No verified publication relay configured');
const key=JSON.parse(readFileSync(process.env.VETTA_KEY_FILE||'/home/pi/.config/vetta/vetta-org-key.json','utf8'));const sk=nip19.decode(key.nsec).data;
if(getPublicKey(sk)!==config.pubkey)throw Error('Publisher key mismatch');
const state=join(root,'review/publication-receipt.json');const previous=existsSync(state)?JSON.parse(readFileSync(state,'utf8')):null;
const now=Math.floor(Date.now()/1000);
const snapshot=finalizeEvent({kind:30378,created_at:now,tags:[['d','vetta:episode:aug2024']],content:JSON.stringify(payload)},sk);
const correction=finalizeEvent({kind:1,created_at:now,tags:[['t','vetta-corrections'],['e',snapshot.id],...(previous?[['e',previous.snapshotId,'','reply']]:[])],content:JSON.stringify({schema:'vetta.correction',version:1,snapshotId:snapshot.id,previousSnapshotId:previous?.snapshotId??null,registerSha256:release.review.registerSha256,changes:read('app/dist/data/corrections.json')})},sk);
async function publishBatch(url,events){return new Promise(resolve=>{
 const results=new Map();let ws;let done=false;let notice='';let sent=false;
 const timer=setTimeout(()=>finish('acknowledgment timeout'),20000);
 function finish(reason=''){if(done)return;done=true;clearTimeout(timer);try{ws?.close()}catch{}resolve(events.map(event=>results.get(event.id)||{relay:url,eventId:event.id,accepted:false,detail:reason||notice||'connection closed'}))}
 try{ws=new WebSocket(url);ws.onopen=()=>ws.send(JSON.stringify(['REQ','publication-preflight',{ids:[events[0].id]}]));ws.onmessage=m=>{try{const a=JSON.parse(m.data);if(a[0]==='EOSE'&&a[1]==='publication-preflight'&&!sent){sent=true;ws.send(JSON.stringify(['CLOSE','publication-preflight']));for(const event of events)ws.send(JSON.stringify(['EVENT',event]))}if(a[0]==='NOTICE')notice=String(a[1]);if(a[0]==='OK'&&events.some(e=>e.id===a[1])){results.set(a[1],{relay:url,eventId:a[1],accepted:a[2]===true,detail:String(a[3]??'')});if(results.size===events.length)finish()}}catch{}};ws.onerror=()=>finish('websocket error');ws.onclose=()=>finish()}catch{finish('connection failed')}
})}

const manifest=read('app/dist/manifest-event.json');const profile=read('app/dist/publisher-profile.json');
const bundlePath=join(root,'review/publication-bundle.json');
let bundle={snapshot,correction,manifest,profile,previousSnapshotId:previous?.snapshotId??null};
if(process.argv.includes('--retry')){bundle=JSON.parse(readFileSync(bundlePath,'utf8'));if(bundle.manifest.id!==manifest.id)throw Error('Retry bundle belongs to an older build')}else{writeFileSync(bundlePath,JSON.stringify(bundle,null,2)+'\n')}
const events=[bundle.snapshot,bundle.correction,bundle.manifest,bundle.profile];
for(const event of events)if(!verifyEvent(event))throw Error('Invalid signature');
async function publishWithRetry(relay){
 const acknowledged=new Map();let latest=[];
 for(let attempt=0;attempt<3;attempt++){
  latest=await publishBatch(relay,events.filter(e=>!acknowledged.has(e.id)));
  for(const result of latest)if(result.accepted)acknowledged.set(result.eventId,result);
  if(acknowledged.size===events.length)break;
  if(attempt<2)await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));
 }
 return events.map(e=>acknowledged.get(e.id)||latest.find(r=>r.eventId===e.id)||{relay,eventId:e.id,accepted:false,detail:'not acknowledged'});
}
const results=(await Promise.all(relays.map(publishWithRetry))).flat();
const ok=results.every(r=>r.accepted);mkdirSync(join(root,'review'),{recursive:true});
writeFileSync(join(root,'review/publication-attempt.json'),JSON.stringify({snapshotId:bundle.snapshot.id,correctionId:bundle.correction.id,results},null,2)+'\n');
if(!ok)throw Error('Relay did not acknowledge every event; inspect publication-attempt.json');
writeFileSync(state,JSON.stringify({snapshotId:bundle.snapshot.id,correctionId:bundle.correction.id,previousSnapshotId:bundle.previousSnapshotId,results},null,2)+'\n');
writeFileSync(join(root,'app/dist/nostr-snapshot.json'),JSON.stringify(bundle.snapshot,null,2)+'\n');
console.log('Reviewed snapshot, correction trail, signed manifest and identity profile acknowledged by configured relays.');
