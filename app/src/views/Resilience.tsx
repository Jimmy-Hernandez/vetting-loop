import {useEffect,useState} from 'react';
import {getEventHash,verifyEvent} from 'nostr-tools/pure';
import type {Event} from 'nostr-tools/pure';
import config from '../publisher-config.json';
interface Manifest {schema:string;version:number;createdAt:string;registerSha256:string;files:{path:string;bytes:number;sha256:string}[]}
export default function Resilience(){
 const [manifest,setManifest]=useState<Manifest|null>(null);const [status,setStatus]=useState('Loading signed manifest…');const [result,setResult]=useState('');const [timestamp,setTimestamp]=useState('Not available');
 useEffect(()=>{Promise.all([fetch('/manifest.json').then(r=>{if(!r.ok)throw Error();return r.text()}),fetch('/manifest-event.json').then(r=>{if(!r.ok)throw Error();return r.json()})]).then(([text,e])=>{
 const event:Event={id:e.id,pubkey:e.pubkey,created_at:e.created_at,kind:e.kind,tags:e.tags,content:e.content,sig:e.sig};
 if(event.pubkey!==config.pubkey||event.kind!==30379||event.tags.filter(t=>t[0]==='d').length!==1||!event.tags.some(t=>t[0]==='d'&&t[1]==='vetta:release-manifest')||event.created_at>Date.now()/1000+300||event.content!==text||getEventHash(event)!==event.id||!verifyEvent(event))throw Error('Signature rejected');
 const m=JSON.parse(text) as Manifest;if(m.schema!=='vetta.manifest'||m.version!==1||!Array.isArray(m.files))throw Error('Manifest rejected');setManifest(m);setStatus('Publisher signature verified. Compare file bytes below.');
 }).catch(()=>setStatus('No valid signed manifest available. Verification is unavailable.'));
 fetch('/timestamp-status.json').then(r=>r.json()).then(d=>setTimestamp(d.message)).catch(()=>setTimestamp('Timestamp proof not available.'))},[]);
 async function check(file:File){if(!manifest)return;const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');const entry=manifest.files.find(f=>f.sha256===hash&&f.bytes===file.size);setResult(entry?'Match: '+entry.path+' is byte-for-byte identical to the signed release.':'No match. This file is not part of the signed release.');}
 return <main className="doc"><h1>Verify and keep this release</h1><p>Signatures identify the publisher; SHA-256 fingerprints detect altered files. Neither establishes the truth of a claim.</p>
 <section className="sec"><h2>Offline copy</h2><p><a href="/downloads/vetta-offline.zip" download>Download the reviewed offline package</a> · <a href="/downloads/vetta-offline.html" download>Download the standalone HTML</a></p><p>Unzip and open the HTML file in a browser. No server is required. The package contains the reviewed roster, source passages, corrections, fingerprints and signature.</p></section>
 <section className="sec"><h2>Check a downloaded or mirrored file</h2><p role="status">{status}</p><label>Choose a release JSON or offline HTML file <input type="file" disabled={!manifest} onChange={e=>{const f=e.target.files?.[0];if(f)void check(f)}} /></label><p role="status">{result}</p><p><a href="/manifest.json">Fingerprint manifest</a> · <a href="/manifest-event.json">Publisher signature</a></p><p style={{overflowWrap:'anywhere'}}>Pinned publisher: <code>{config.pubkey}</code></p></section>
 <section className="sec"><h2>Bitcoin timestamp</h2><p>{timestamp}</p><p>A calendar receipt is pending evidence until it can be verified against a Bitcoin block.</p></section>
 <section className="sec"><h2>Publisher identity</h2><p>The domain identity document maps <code>vetta@vetta.agent9.dev</code> to the pinned publisher key. This binds a key to this domain; it does not certify the editorial record.</p><a href="/.well-known/nostr.json?name=vetta">Inspect the identity document</a></section>
 </main>;
}
