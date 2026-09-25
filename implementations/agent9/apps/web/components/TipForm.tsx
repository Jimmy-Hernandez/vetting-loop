"use client";

import * as React from "react";
import { MAX_PLAINTEXT_BYTES, seal, type SealedBox } from "@vetting-loop/sealed";
import { REVIEWER_FINGERPRINT, REVIEWER_PUBLIC_JWK } from "@/lib/reviewer-key";

type State =
  | { phase: "editing" }
  | { phase: "sealing" }
  | { phase: "sent"; receipt: string; preview: string }
  | { phase: "error"; message: string };

const enc = new TextEncoder();

export function TipForm({ records }: { records: Array<{ slug: string; name: string }> }) {
  const [state, setState] = React.useState<State>({ phase: "editing" });
  const [message, setMessage] = React.useState("");
  const [record, setRecord] = React.useState("");
  const [links, setLinks] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [sealedPreview, setSealedPreview] = React.useState<SealedBox | null>(null);

  const payload = JSON.stringify({ v: 1, record: record || null, message, links: links || null, contact: contact || null });
  const bytes = enc.encode(payload).byteLength;
  const tooLong = bytes > MAX_PLAINTEXT_BYTES;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 20 || tooLong) return;
    setState({ phase: "sealing" });
    try {
      const box = await seal(payload, REVIEWER_PUBLIC_JWK);
      setSealedPreview(box);
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(box),
        credentials: "omit",
        referrerPolicy: "no-referrer",
        cache: "no-store",
      });
      const body = (await res.json().catch(() => ({}))) as { receipt?: string; error?: string };
      if (!res.ok || !body.receipt) throw new Error(body.error ?? `The tip line returned ${res.status}.`);
      setMessage("");
      setLinks("");
      setContact("");
      setState({ phase: "sent", receipt: body.receipt, preview: box.ct.slice(0, 96) });
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : "Sending failed." });
    }
  }

  if (state.phase === "sent") {
    return (
      <div className="rounded-mz border-2 border-mz-green bg-green-50 p-6">
        <p className="text-lg font-bold text-mz-green-dark">Sealed and delivered.</p>
        <p className="mt-2 text-sm">Keep this receipt. It is the only link between you and the tip; we cannot recover it.</p>
        <p className="mt-4 select-all rounded-mz border border-mz-green/40 bg-white px-4 py-3 text-center font-mono text-xl font-bold tracking-widest">{state.receipt}</p>
        <p className="mt-4 text-xs text-mz-muted">What the server received (first 96 characters of ciphertext):</p>
        <p className="mz-mono mt-1 break-all text-mz-muted">{state.preview}…</p>
        <button type="button" onClick={() => setState({ phase: "editing" })} className="mz-btn-ghost mt-5">Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" autoComplete="off">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">Which record does this concern? <span className="font-normal text-mz-muted">(optional)</span></span>
        <select value={record} onChange={(e) => setRecord(e.target.value)} className="w-full rounded-mz border border-mz-border bg-white px-3 py-2.5 text-sm">
          <option value="">General, or not in the ledger</option>
          {records.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">What should reviewers know?</span>
        <textarea
          required
          minLength={20}
          rows={7}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A correction, a missing appointment, a Gazette notice or Hansard reference, or a document reviewers should find. Facts and where to verify them are most useful."
          className="w-full rounded-mz border border-mz-border px-3 py-2.5 text-sm focus:border-mz-red focus:outline-none focus:ring-2 focus:ring-mz-red/20"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">Public links or references <span className="font-normal text-mz-muted">(optional)</span></span>
        <input value={links} onChange={(e) => setLinks(e.target.value)} placeholder="Gazette notice number, Hansard date, report URL" className="w-full rounded-mz border border-mz-border px-3 py-2.5 text-sm" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">How to reach you <span className="font-normal text-mz-muted">(optional; leave blank to stay anonymous)</span></span>
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Signal username or a new email address" className="w-full rounded-mz border border-mz-border px-3 py-2.5 text-sm" />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-mz bg-mz-subtle px-4 py-3 text-xs text-mz-muted">
        <span>
          Encrypted in this browser to reviewer key <strong className="font-mono text-mz-text">{REVIEWER_FINGERPRINT}</strong>
        </span>
        <span className={tooLong ? "font-semibold text-mz-red" : ""}>{bytes.toLocaleString()} / {MAX_PLAINTEXT_BYTES.toLocaleString()} bytes</span>
      </div>

      {state.phase === "error" && (
        <p role="alert" className="rounded-mz border border-mz-red/40 bg-red-50 px-4 py-3 text-sm text-mz-red">
          {state.message} Nothing readable was sent. {sealedPreview ? "The sealed box was created but not stored." : ""}
        </p>
      )}

      <button type="submit" disabled={state.phase === "sealing" || tooLong || message.trim().length < 20} className="mz-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
        {state.phase === "sealing" ? "Sealing…" : "Seal and send"}
      </button>
    </form>
  );
}

export function ReceiptCheck() {
  const [receipt, setReceipt] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  async function check(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Checking…");
    const res = await fetch(`/api/tips?receipt=${encodeURIComponent(receipt.trim().toUpperCase())}`, { credentials: "omit", cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as { status?: string };
    setStatus(res.ok && body.status ? `Status: ${body.status}` : "No tip found for that receipt. Receipts expire after 180 days.");
  }
  return (
    <form onSubmit={check} className="flex flex-col gap-2 sm:flex-row">
      <input value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder="VR-XXXX-XXXX-XXXX" className="flex-1 rounded-mz border border-mz-border px-3 py-2.5 font-mono text-sm uppercase" />
      <button className="mz-btn-ghost" type="submit">Check</button>
      {status && <p className="self-center text-sm text-mz-muted sm:ml-2" aria-live="polite">{status}</p>}
    </form>
  );
}
