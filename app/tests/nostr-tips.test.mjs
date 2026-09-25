import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {generateSecretKey,getPublicKey} from 'nostr-tools/pure';
import {unwrapEvent} from 'nostr-tools/nip17';
const receiver=generateSecretKey();
const source=readFileSync(new URL('../src/nostr-tips.ts',import.meta.url),'utf8').replace("import publisher from './publisher-config.json';",`const publisher=${JSON.stringify({pubkey:getPublicKey(receiver),tipsEnabled:false,tipRelay:''})};`).replaceAll("'nostr-tools/pure'",JSON.stringify(import.meta.resolve('nostr-tools/pure'))).replaceAll("'nostr-tools/nip17'",JSON.stringify(import.meta.resolve('nostr-tools/nip17')));
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2023}}).outputText;
const {encryptTip,submitTip}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('actual encryption helper supports synthetic recipient roundtrip',()=>{
 const event=encryptTip('Synthetic helper roundtrip',getPublicKey(receiver));
 assert.equal(unwrapEvent(event,receiver).content,'Synthetic helper roundtrip');
 assert.throws(()=>unwrapEvent(event,generateSecretKey()));
 assert.ok(!event.content.includes('Synthetic helper roundtrip'));
});
test('disabled tips cannot connect or send',async()=>{
 globalThis.WebSocket=class {constructor(){assert.fail('Network connection attempted');}};
 await assert.rejects(submitTip('Do not send'),/not operational/);
});
test('rejects empty, oversized and invalid recipient input before encryption',()=>{
 assert.throws(()=>encryptTip(' ',getPublicKey(receiver)));
 assert.throws(()=>encryptTip('x'.repeat(16001),getPublicKey(receiver)));
 assert.throws(()=>encryptTip('test','wrong'));
});
