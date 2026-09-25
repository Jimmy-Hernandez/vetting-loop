import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyEvent,getEventHash} from '../../app/node_modules/nostr-tools/lib/esm/index.js';
const root=fileURLToPath(new URL('../../',import.meta.url));const dist=root+'app/dist/';
const manifestText=readFileSync(dist+'manifest.json','utf8');const manifest=JSON.parse(manifestText);const event=JSON.parse(readFileSync(dist+'manifest-event.json','utf8'));
const pin=JSON.parse(readFileSync(root+'app/src/publisher-config.json','utf8')).pubkey;
if(event.pubkey!==pin||event.kind!==30379||getEventHash(event)!==event.id||!verifyEvent(event)||event.content!==manifestText)throw Error('Invalid signed manifest');
for(const f of manifest.files){const b=readFileSync(dist+f.path);if(b.length!==f.bytes||createHash('sha256').update(b).digest('hex')!==f.sha256)throw Error('Manifest mismatch: '+f.path)}
const pending=existsSync(dist+'manifest.json.ots');
writeFileSync(dist+'timestamp-status.json',JSON.stringify({status:pending?'pending':'unavailable',bitcoinVerified:false,manifestSha256:createHash('sha256').update(manifestText).digest('hex'),message:pending?'OpenTimestamps calendar receipt obtained. Bitcoin confirmation has not yet been verified.':'No timestamp receipt is available.'},null,2)+'\n');
execFileSync('python3',['-c',`import zipfile,pathlib
p=pathlib.Path(${JSON.stringify(dist)})
files=['downloads/vetta-offline.html','downloads/README.txt','data/release.json','data/corrections.json','data/review-summary.json','manifest.json','manifest-event.json','timestamp-status.json']
if (p/'manifest.json.ots').exists(): files.append('manifest.json.ots')
with zipfile.ZipFile(p/'downloads/vetta-offline.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in files: z.write(p/f, f.removeprefix('downloads/'))
with zipfile.ZipFile(p/'downloads/vetta-offline.zip') as z:
 assert z.testzip() is None
 assert 'vetta-offline.html' in z.namelist()
print('Offline archive verified:',len(files),'files')`],{stdio:'inherit'});
console.log('Signed manifest and all public record hashes verified.');
