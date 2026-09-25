import { generateSecretKey } from 'nostr-tools/pure';
import { wrapEvent } from 'nostr-tools/nip17';
import publisher from './publisher-config.json';

/** An ephemeral sender key is held only for encryption, never persisted. */
export function encryptTip(message: string, recipient: string) {
  if (!/^[a-f0-9]{64}$/.test(recipient)) throw new Error('Invalid recipient identity.');
  if (!message.trim() || new TextEncoder().encode(message).length > 16000) throw new Error('Enter a tip of at most 16 KB.');
  const secret = generateSecretKey();
  try { return wrapEvent(secret, { publicKey: recipient }, message.trim()); }
  finally { secret.fill(0); }
}
export function submitTip(message: string): Promise<string> {
  if (!publisher.tipsEnabled || !/^wss:\/\//.test(publisher.tipRelay)) return Promise.reject(new Error('Encrypted delivery is not operational. Recipient recovery and the owned relay must be verified before enabling tips.'));
  const event = encryptTip(message, publisher.pubkey);
  return new Promise((resolve, reject) => {
    let ws: WebSocket;
    try { ws = new WebSocket(publisher.tipRelay); } catch { reject(new Error('Tip relay unavailable.')); return; }
    let settled = false;
    const finish = (accepted: boolean, reason: string) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      ws.onmessage = ws.onerror = ws.onclose = ws.onopen = null;
      try { ws.close(); } catch { /* already closed */ }
      if (accepted) resolve(event.id); else reject(new Error(reason));
    };
    const timer = setTimeout(() => finish(false, 'Relay acceptance was not confirmed. The tip may have reached the relay.'), 10000);
    ws.onopen = () => ws.send(JSON.stringify(['EVENT', event]));
    ws.onmessage = m => {
      try {
        if (typeof m.data !== 'string' || m.data.length > 4096) return;
        const response = JSON.parse(m.data);
        if (Array.isArray(response) && response[0] === 'OK' && response[1] === event.id) finish(response[2] === true, 'The relay did not accept the encrypted tip.');
      } catch { /* malformed acknowledgements are ignored */ }
    };
    ws.onerror = ws.onclose = () => finish(false, 'Relay acceptance was not confirmed.');
  });
}
