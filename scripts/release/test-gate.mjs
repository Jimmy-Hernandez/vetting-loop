import {readFileSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url));const f=root+'app/public/data/release.json';const original=readFileSync(f);
const check=()=>execFileSync(process.execPath,[root+'scripts/release/check.mjs'],{stdio:'pipe'});
check();
try{const data=JSON.parse(original);data.nominees[0].name='Injected name';writeFileSync(f,JSON.stringify(data));assert.throws(check);console.log('PASS altered published roster rejected')}finally{writeFileSync(f,original)}
const extra=root+'app/public/data/injected.json';
try{writeFileSync(extra,'{}');assert.throws(check);console.log('PASS ungated legacy public data rejected')}finally{rmSync(extra,{force:true})}
const source=root+'review/source-data/episode.json';const sourceBytes=readFileSync(source);
try{writeFileSync(source,Buffer.concat([sourceBytes,Buffer.from(' ')]));assert.throws(check);console.log('PASS changed source invalidates release')}finally{writeFileSync(source,sourceBytes)}
check();console.log('PASS original release restored and accepted');
