import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure';
const key=generateSecretKey(), pubkey=getPublicKey(key);
const now=Math.floor(Date.now()/1000);
const event=finalizeEvent({kind:30378,created_at:now,tags:[['d','vetta:episode:aug2024']],content:JSON.stringify({schema:'vetta.fallback',version:1,approval:{status:'approved',registerSha256:'a'.repeat(64),reviewedAt:new Date().toISOString()},episode:{title:'Test',date:'2024-08-07',summary:'Test',nominees:[],trail:null}})},key);
const securityUrl = new URL('../src/nostr-security.ts',import.meta.url).href;
const source=readFileSync(new URL('../src/nostr-fallback.ts',import.meta.url),'utf8').replace("import publisher from './publisher-config.json';",`const publisher = ${JSON.stringify({pubkey,relays:[]})};`).replaceAll("'./nostr-security'",JSON.stringify(securityUrl));
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2023}}).outputText;
const {fetchEpisodeFromNostr}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
class Socket {
 static all=[];
 readyState=0; sent=[]; closed=false;
 constructor(url){this.url=url;Socket.all.push(this);queueMicrotask(()=>{this.readyState=1;this.onopen?.();});}
 send(s){this.sent.push(JSON.parse(s));}
 close(){this.closed=true;this.readyState=3;}
 message(msg){this.onmessage?.({data:JSON.stringify(msg)});}
}
globalThis.WebSocket=Socket;
test('EOSE closes subscriptions and sockets; forged/wrong subscription events ignored',async()=>{
 Socket.all=[];
 const promise=fetchEpisodeFromNostr(['wss://test.invalid']);
 await new Promise(r=>setImmediate(r));
 const ws=Socket.all[0];
 assert.deepEqual(ws.sent[0][2].authors,[pubkey]);
 assert.deepEqual(ws.sent[0][2].kinds,[30378]);
 ws.message(['EVENT','wrong',event]);
 ws.message(['EVENT','vetta-approved',{...event,content:'forged'}]);
 ws.message(['EVENT','vetta-approved',event]);
 ws.message(['EOSE','vetta-approved']);
 const result=await promise;
 assert.equal(result.episode.title,'Test');
 assert.equal(result.sources.length,1);
 assert.equal(ws.closed,true);
 assert.deepEqual(ws.sent.at(-1),['CLOSE','vetta-approved']);
});
test('timeout closes every relay and yields no unauthenticated sources',async()=>{
 Socket.all=[];
 const result=await fetchEpisodeFromNostr(['wss://first.invalid','wss://second.invalid'],undefined,15);
 assert.equal(result.sources.length,0);
 assert.ok(Socket.all.every(s=>s.closed));
});
test('error completes and closes promptly; arbitrary insecure relay rejected',async()=>{
 Socket.all=[];
 const p=fetchEpisodeFromNostr(['ws://remote.invalid','wss://test.invalid']);
 await new Promise(r=>setImmediate(r));
 assert.equal(Socket.all.length,1);
 Socket.all[0].onerror();
 assert.equal((await p).sources.length,0);
 assert.equal(Socket.all[0].closed,true);
});
