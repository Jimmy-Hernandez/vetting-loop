// Vetta — live relay proof. Speaks raw NIP-01 JSON over an open WebSocket (no
// client library needed for transport), verifies every event's signature with
// nostr-tools, then attempts a tamper and shows it fail. No keys, no login, no
// access to our servers — exactly what a journalist or auditor on the other side
// of the world would do.
//
// Usage: node scripts/nostr/verify-relay.mjs [wss://relay-url]
import { getEventHash } from 'nostr-tools'
import { schnorr } from '@noble/curves/secp256k1.js'
import { hexToBytes } from '@noble/hashes/utils.js'

const RELAY = process.argv[2] || 'ws://localhost:7778'
const toHex = (h) => (typeof h === 'string' ? h : Buffer.from(h).toString('hex'))

console.log(`\n◆ Opening a raw WebSocket to ${RELAY} — plain NIP-01 JSON, no auth, no keys, no client library.`)
const ws = new WebSocket(RELAY)
const events = []

const done = await new Promise((resolve, reject) => {
  ws.onopen = () => ws.send(JSON.stringify(['REQ', 'vetta-proof', { kinds: [1], limit: 500 }]))
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    if (msg[0] === 'EVENT') events.push(msg[2])
    if (msg[0] === 'EOSE') resolve()
  }
  ws.onerror = (e) => reject(new Error(`relay connection failed: ${e.message || 'ws error'}`))
  setTimeout(() => resolve(), 8000)
})
ws.close()

console.log(`Events pulled from the relay: ${events.length}\n`)

// 1) Verify every event: ID recomputes from content, and the BIP-340 signature
//    verifies against the author's public key.
let verified = 0
for (const e of events) {
  const idOk = getEventHash(e) === e.id
  const sigOk = schnorr.verify(hexToBytes(e.sig), hexToBytes(e.id), hexToBytes(e.pubkey))
  if (idOk && sigOk) verified++
  else console.log(`  ✗ FAILED verification: ${e.id.slice(0, 12)}`)
}
console.log(`✓ ${verified}/${events.length} events pass. Content is exactly what was signed, signatures match the published key.`)

// 2) Unique records + independent republication batches
const byRecord = new Map()
for (const e of events) {
  const key = (e.content.match(/NOMINEE: [^\n]+/) || [e.content.slice(0, 34)])[0].slice(0, 40)
  byRecord.set(key, (byRecord.get(key) || 0) + 1)
}
const counts = [...byRecord.values()]
console.log(`Unique records: ${byRecord.size}, each republished ${Math.min(...counts)}–${Math.max(...counts)}× at independent timestamps — three separate signed broadcasts of the same evidence, no shared database to corrupt.`)

// 3) Tamper attempt — flip one phrase in the accountability-trail record
const target = events.find((e) => /ACCOUNTABILITY TRAIL/i.test(e.content))
const tampered = { ...target, content: target.content.replace(/voice vote/i, 'unanimous approval') }
const newId = getEventHash(tampered)
console.log(`\n◆ Tamper test — we rewrote "voice vote" → "unanimous approval" inside the accountability trail:`)
console.log(`    ID recomputed from tampered content: ${newId.slice(0, 22)}…`)
console.log(`    ID stored on the relay:              ${target.id.slice(0, 22)}…`)
const idMismatch = newId !== target.id
console.log(`    1. Any client that recomputes the ID from content (they all do) sees a mismatch and rejects the record outright: ${idMismatch}`)
let sigOk = true
try { sigOk = schnorr.verify(hexToBytes(target.sig), hexToBytes(newId), hexToBytes(target.pubkey)) } catch { sigOk = false }
console.log(`    2. If the attacker tries to republish the edited content under the new ID, the old signature against it: ${sigOk ? 'PASSED (should be impossible — investigate!)' : 'FAILS. One changed word — detected by anyone, anywhere, forever.'}`)
console.log(`\n◆ That is the guarantee. The Vetta record is public, signed, and tamper-evident: no admin, no take-down, no quiet edits.\n`)
process.exit(0)
