import { useState } from 'react';
import publisher from '../publisher-config.json';
import { submitTip } from '../nostr-tips';
export default function EncryptedTips() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const enabled = publisher.tipsEnabled && /^wss:\/\//.test(publisher.tipRelay);
  return <main className="doc"><h1>Encrypted tips</h1>
    <p>Tips are encrypted in your browser for the VETTA recipient using Nostr private messages. The relay receives encrypted content. Encryption does not conceal your network address or protect a compromised device.</p>
    {!enabled && <p role="status">Encrypted delivery is not yet operational. Recipient recovery and the VETTA relay must be verified before this form opens.</p>}
    <form onSubmit={async e => { e.preventDefault(); setBusy(true); setStatus('Encrypting and submitting…'); try { await submitTip(message); setMessage(''); setStatus('Relay accepted the encrypted tip. Recipient receipt and reading are not confirmed.'); } catch (e) { setStatus(e instanceof Error ? e.message : 'Delivery not confirmed.'); } finally { setBusy(false); } }}>
      <label htmlFor="tip-message">Your tip</label><textarea id="tip-message" value={message} onChange={e => setMessage(e.target.value)} disabled={!enabled || busy} maxLength={16000} rows={10} style={{ display: 'block', width: '100%' }} />
      <p>No files or contact details are required. An ephemeral sender identity is used; replies are not supported.</p>
      <button disabled={!enabled || busy || !message.trim()} type="submit">Send encrypted tip</button>
      <p role="status">{status}</p>
    </form></main>;
}
