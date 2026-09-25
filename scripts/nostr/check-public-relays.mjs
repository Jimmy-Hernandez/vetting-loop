// Read-only: is the published record reachable on public relays? (demo depends on this)
const RELAYS = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"]
const FILTER = { kinds: [1], limit: 500 }

const LOCAL = "ws://127.0.0.1:7778"

function query(url, filter, ms = 12000) {
  return new Promise((resolve) => {
    const out = []
    let ws
    try { ws = new WebSocket(url) } catch { return resolve(null) }
    const done = () => { try { ws.close() } catch {} ; resolve(out) }
    const timer = setTimeout(done, ms)
    ws.onopen = () => ws.send(JSON.stringify(["REQ", "probe", filter]))
    ws.onmessage = (m) => {
      let d; try { d = JSON.parse(m.data) } catch { return }
      if (d[0] === "EVENT") out.push(d[2])
      if (d[0] === "EOSE") { clearTimeout(timer); done() }
    }
    ws.onerror = () => { clearTimeout(timer); resolve(null) }
  })
}

const local = await query(LOCAL, FILTER)
if (!local) { console.log("local relay unreachable"); process.exit(1) }
const authors = [...new Set(local.map((e) => e.pubkey))]
const ids = new Set(local.map((e) => e.id))
console.log(`local relay: ${local.length} events, author(s): ${authors.join(", ").slice(0, 70)}`)
const npubHex = authors[0]

for (const r of RELAYS) {
  const evs = await query(r, { kinds: [1], authors: [npubHex], limit: 500 })
  if (evs === null) { console.log(`${r}: unreachable`); continue }
  const fromUs = evs.filter((e) => e.pubkey === npubHex)
  const matched = fromUs.filter((e) => ids.has(e.id)).length
  const uniq = new Set(fromUs.map((e) => e.content)).size
  console.log(`${r}: ${fromUs.length} events from our key (${uniq} unique records, ${matched} match the local relay's ids)`)
}
process.exit(0)
