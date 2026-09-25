// Every source scalar is accounted for. Publication is a separately reviewed projection.
import {readFileSync,writeFileSync,mkdirSync,readdirSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,relative} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const sha=x=>createHash('sha256').update(x).digest('hex');
const read=p=>JSON.parse(readFileSync(join(root,p),'utf8'));
const write=(p,x)=>{mkdirSync(join(root,p,'..'),{recursive:true});writeFileSync(join(root,p),JSON.stringify(x,null,2)+'\n')};
const approvals=read('review/roster-approvals.json');
const sourceRoot=join(root,'review/source-data');
const rows=[];const files={};
function walk(x,file,path='') {
 if(x && typeof x==='object') {for(const [k,v] of Object.entries(x)) walk(v,file,path+'/'+k.replaceAll('~','~0').replaceAll('/','~1'));return;}
 rows.push({id:sha(file+'#'+path),file,path,valueSha256:sha(JSON.stringify(x)),decision:'withheld',reason:'Independent claim-level source clearance incomplete'});
}
for(const f of readdirSync(sourceRoot,{recursive:true}).filter(x=>x.endsWith('.json')).sort()){
 const b=readFileSync(join(sourceRoot,f));files[f]=sha(b);walk(JSON.parse(b),f);
}
for(const a of approvals){
 const row=rows.find(r=>r.file===a.file&&r.path===a.path);
 if(!row || !a.source || !a.passage || !a.reviewer || !Number.isInteger(a.lineStart) || !Number.isInteger(a.lineEnd))throw Error('Incomplete approval');
 const sourceFile=join(root,a.sourceFile);
 if(!a.sourceFile?.startsWith('data/') || a.sourceFile.includes('..'))throw Error('Source path invalid');
 const lines=readFileSync(sourceFile,'utf8').split('\n').slice(a.lineStart-1,a.lineEnd).join('\n');
 if(!lines.includes(a.passage))throw Error('Source passage mismatch: '+a.path);
 row.decision=row.valueSha256===sha(JSON.stringify(a.value))?'retained':'corrected';
 row.approvedValueSha256=sha(JSON.stringify(a.value));row.evidence=a;
 row.reason='Primary source passage matched; independently reviewed';
}
const counts=Object.fromEntries(['retained','corrected','withheld'].map(k=>[k,rows.filter(r=>r.decision===k).length]));
const register={schema:'vetta.review',version:1,sourceFiles:files,counts,rows};
write('review/claim-register.json',register);
const registerSha256=sha(readFileSync(join(root,'review/claim-register.json')));
const raw=read('review/source-data/episode.json');
function approved(path){const a=approvals.find(a=>a.file==='episode.json'&&a.path===path);if(!a)throw Error('Roster not approved '+path);return a.value;}
const nominees=raw.nominees.map((n,i)=>({id:n.id,slug:n.slug,name:approved(`/nominees/${i}/name`),portfolio:approved(`/nominees/${i}/portfolio`),status:approved(`/nominees/${i}/status`),sources:approvals.filter(a=>a.file==='episode.json'&&a.path.startsWith(`/nominees/${i}/`)).map(a=>({url:a.source,passage:a.passage,lineStart:a.lineStart,lineEnd:a.lineEnd})),review:'Roster fields reviewed. Dossier claims withheld pending source clearance.'}));
const release={schema:'vetta.reviewed-record',version:1,title:'Follow the record. Question the process.',episode:'August 2024 Cabinet vetting',nominees,review:{registerSha256,counts,note:'Counts describe source fields reviewed or withheld, not confirmed factual errors. Withheld material is not evidence of misconduct or clearance.'}};
const out=join(root,'app/public/data');rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
write('app/public/data/release.json',release);
write('app/public/data/corrections.json',{schema:'vetta.corrections',version:1,entries:[{date:'2026-09-25',action:'Accuracy-first release',reason:'Withheld unapproved claims, hearing metrics, and expanded appointment ledger. Retained only independently source-reviewed nominee names, portfolios and outcomes.',registerSha256},...rows.filter(r=>r.decision==='corrected').map(r=>({date:'2026-09-25',record:r.file+'#'+r.path,action:'Corrected roster field',value:r.evidence.value,source:r.evidence.source,passage:r.evidence.passage}))]});
write('app/public/data/review-summary.json',{schema:register.schema,version:1,counts,registerSha256,sourceFiles:files,note:release.review.note});
console.log(JSON.stringify({sourceFields:rows.length,counts,roster:nominees.length,registerSha256}));
for(const f of ['episode.json','divisions.json','hansard-excerpts.json','terry/ledger.json'])write('app/public/data/'+f,{status:'withheld',reason:'Superseded dataset withdrawn pending source clearance.',reviewedRecord:'/data/release.json'});
write('review/release-approval.json',{registerSha256,files:Object.fromEntries(['release.json','corrections.json','review-summary.json','episode.json','divisions.json','hansard-excerpts.json','terry/ledger.json'].map(f=>[f,sha(readFileSync(join(out,f)))]))});
