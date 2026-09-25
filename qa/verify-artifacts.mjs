import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getEventHash,verifyEvent} from '../app/node_modules/nostr-tools/lib/esm/index.js';
const dir=new URL('../app/dist/',import.meta.url);
const read=p=>readFileSync(new URL(p,dir));
const event=JSON.parse(read('manifest-event.json'));const text=read('manifest.json').toString();
assert.equal(event.content,text);assert.equal(getEventHash(event),event.id);assert(verifyEvent(event));
const m=JSON.parse(text);for(const f of m.files){const b=read(f.path);assert.equal(b.length,f.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256)}
const release=JSON.parse(read('data/release.json'));for(const n of release.nominees)assert.equal(createHash('sha256').update(JSON.stringify(n)).digest('hex'),m.records.find(r=>r.slug===n.slug).sha256);
const altered=JSON.parse(JSON.stringify(event));altered.content+=' ';assert.notEqual(getEventHash(altered),altered.id);assert.equal(verifyEvent(altered),false);
const identity=JSON.parse(read('.well-known/nostr.json'));assert.equal(identity.names.vetta,event.pubkey);
console.log('PASS exact file/record hashes, signed manifest, tamper rejection, and identity pin consistency.');
