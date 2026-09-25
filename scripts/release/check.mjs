import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>JSON.parse(readFileSync(join(root,p),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const register=read('review/claim-register.json');const release=read('app/public/data/release.json');
if(release.review.registerSha256!==hash(readFileSync(join(root,'review/claim-register.json'))))throw Error('Stale review register');
for(const [f,h] of Object.entries(register.sourceFiles))if(hash(readFileSync(join(root,'review/source-data',f)))!==h)throw Error('Source changed after review');
if(release.nominees.length!==20)throw Error('Roster incomplete');
for(const [i,n] of release.nominees.entries())for(const key of ['name','portfolio','status']){
 const row=register.rows.find(r=>r.file==='episode.json'&&r.path===`/nominees/${i}/${key}`);
 if(!row || !['retained','corrected'].includes(row.decision) || row.approvedValueSha256!==hash(JSON.stringify(n[key])))throw Error('Unapproved public field');
}
for(const f of readdirSync(join(root,'app/public/data'),{recursive:true}))if(f.endsWith('.json')&&!['release.json','corrections.json','review-summary.json','episode.json','divisions.json','hansard-excerpts.json','terry/ledger.json'].includes(f))throw Error('Unexpected public data file '+f);
if(release.nominees.filter(n=>n.status==='approved').length!==19||release.nominees.filter(n=>n.status==='rejected').length!==1)throw Error('Invalid outcomes');
const approval=read('review/release-approval.json');
if(approval.registerSha256!==release.review.registerSha256)throw Error('Release approval is stale');
for(const [f,h] of Object.entries(approval.files))if(hash(readFileSync(join(root,'app/public/data',f)))!==h)throw Error('Unapproved public data change: '+f);
console.log('Release gate passed: exact reviewed projection and source hashes match; original datasets excluded.');
