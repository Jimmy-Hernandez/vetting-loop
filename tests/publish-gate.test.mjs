import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
for (const [enabled, acknowledged, expected] of [['0',false,2],['1',false,2],['0',true,2],['1',true,0]]) {
 test(`publication authorization: enabled=${enabled}, acknowledged=${acknowledged}`,()=>{
  const script=`import {assertPublishEnabled} from './scripts/nostr/nostr-config.mjs'; process.exit(assertPublishEnabled(${JSON.stringify(acknowledged?['--i-have-verified-the-data']:[])})?0:2)`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{env:{...process.env,NOSTR_PUBLISH_ENABLED:enabled}});
  assert.equal(result.status,expected);
 });
}
