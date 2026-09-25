import test from 'node:test';
import assert from 'node:assert/strict';
import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { wrapEvent, unwrapEvent } from 'nostr-tools/nip17';
import { validateRecord, selectRecord, RECORD_ADDRESS, RECORD_KIND } from '../src/nostr-security.ts';
const key = generateSecretKey(), pubkey = getPublicKey(key), now = 1800000000;
const payload = { schema: 'vetta.fallback', version: 1, approval: { status: 'approved', registerSha256: 'a'.repeat(64), reviewedAt: new Date(now * 1000).toISOString() }, episode: { title: 'Record', date: '2024-08-07', summary: 'Roster only; claims withheld.', nominees: [], trail: null } };
const signed = (changes = {}, content = payload) => finalizeEvent({ kind: RECORD_KIND, created_at: now, tags: [['d', RECORD_ADDRESS]], content: JSON.stringify(content), ...changes }, key);
test('accepts authentic approved custom addressable record', () => assert.ok(validateRecord(signed(), pubkey, now)));
test('rejects wrong publisher, forged author, tampering and cached verification bypass', () => {
  const event = signed();
  assert.equal(validateRecord(event, getPublicKey(generateSecretKey()), now), null);
  assert.equal(validateRecord({ ...event, pubkey: getPublicKey(generateSecretKey()) }, pubkey, now), null);
  event.content += ' ';
  assert.equal(validateRecord(event, pubkey, now), null);
  assert.equal(validateRecord({ ...signed(), sig: '0'.repeat(128) }, pubkey, now), null);
});
test('rejects legacy kind, incorrect or duplicate address, future timestamp and oversize content', () => {
  for (const change of [{kind:1},{kind:30078},{tags:[['d','wrong']]},{tags:[['d', RECORD_ADDRESS],['d',RECORD_ADDRESS]]},{created_at:now+301},{content:'x'.repeat(1000001)}]) assert.equal(validateRecord(signed(change), pubkey, now), null);
});
test('rejects missing approval, schema drift and malformed dossiers', () => {
  assert.equal(validateRecord(signed({}, {...payload, version:2}), pubkey, now),null);
  assert.equal(validateRecord(signed({}, {...payload, approval:{...payload.approval,status:'pending'}}),pubkey,now),null);
  assert.equal(validateRecord(signed({}, {...payload,episode:{...payload.episode,nominees:[{}]}}),pubkey,now),null);
});
test('latest selection is input-order independent, tie uses smallest id', () => {
  const old=signed({created_at:now-1}), a=signed(), b=signed({}, {...payload,episode:{...payload.episode,title:'Other'}});
  const expected=[a,b].sort((x,y)=>x.id.localeCompare(y.id))[0].id;
  assert.equal(selectRecord([old,a,b],pubkey,now)?.event.id,expected);
  assert.equal(selectRecord([b,a,old],pubkey,now)?.event.id,expected);
});
test('NIP17 synthetic roundtrip is readable only by intended recipient', () => {
  const sender=generateSecretKey(), receiver=generateSecretKey();
  const event=wrapEvent(sender,{publicKey:getPublicKey(receiver)},'Synthetic tip only');
  assert.equal(event.kind,1059);
  assert.ok(!event.content.includes('Synthetic tip only'));
  assert.equal(unwrapEvent(event,receiver).content,'Synthetic tip only');
  assert.throws(()=>unwrapEvent(event,generateSecretKey()));
});
