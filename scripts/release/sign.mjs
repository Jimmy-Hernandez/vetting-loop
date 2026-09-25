// Uses the recovery-backed org key only; never emits key material.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {finalizeEvent,getPublicKey,nip19} from '../../app/node_modules/nostr-tools/lib/esm/index.js';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));const dist=join(root,'app/dist');
const config=JSON.parse(readFileSync(join(root,'app/src/publisher-config.json'),'utf8'));
const key=JSON.parse(readFileSync(process.env.VETTA_KEY_FILE||'/home/pi/.config/vetta/vetta-org-key.json','utf8'));
const sk=nip19.decode(key.nsec).data;
if(getPublicKey(sk)!==config.pubkey)throw Error('Signing key does not match pinned publisher');
const content=readFileSync(join(dist,'manifest.json'),'utf8');
const event=finalizeEvent({kind:30379,created_at:Math.floor(Date.now()/1000),tags:[['d','vetta:release-manifest']],content},sk);
writeFileSync(join(dist,'manifest-event.json'),JSON.stringify(event,null,2)+'\n');
mkdirSync(join(dist,'.well-known'),{recursive:true});
writeFileSync(join(dist,'.well-known/nostr.json'),JSON.stringify({names:{vetta:config.pubkey},relays:{[config.pubkey]:config.relays}},null,2)+'\n');
const profile=finalizeEvent({kind:0,created_at:event.created_at,tags:[],content:JSON.stringify({name:'VETTA',display_name:'VETTA',about:'Public record of parliamentary vetting. Reviewed historical roster; dossier review ongoing.',nip05:'vetta@vetta.agent9.dev',website:'https://vetta.agent9.dev'})},sk);
writeFileSync(join(dist,'publisher-profile.json'),JSON.stringify(profile,null,2)+'\n');
console.log('Manifest and identity profile signed with pinned publisher.');
