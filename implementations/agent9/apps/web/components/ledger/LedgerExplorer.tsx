"use client";

import * as React from "react";
import Link from "next/link";
import type { SignalId } from "@vetting-loop/ledger";
import type { LedgerRow } from "@/lib/ledger";
import { Monogram, SignalChip, VerificationTag } from "./ui";

const TIERS: Array<{ id: LedgerRow["tier"] | "all"; label: string }> = [
  { id: "all", label: "Everyone" },
  { id: "cabinet", label: "Cabinet level" },
  { id: "ps", label: "Principal Secretaries" },
  { id: "envoy", label: "Envoys" },
];

/**
 * Client-side filter over rows rendered at build time. Filtering never leaves
 * the browser: searches are not sent anywhere and are not logged.
 */
export function LedgerExplorer({ rows, signals }: { rows: LedgerRow[]; signals: Array<{ id: SignalId; label: string }> }) {
  const [q, setQ] = React.useState("");
  const [tier, setTier] = React.useState<(typeof TIERS)[number]["id"]>("all");
  const [signal, setSignal] = React.useState<SignalId | "any" | "all">("all");

  const needle = q.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (tier === "all" || r.tier === tier) &&
      (signal === "all" || (signal === "any" ? r.signals.length > 0 : r.signals.includes(signal))) &&
      (!needle || r.name.toLowerCase().includes(needle) || r.role.toLowerCase().includes(needle)),
  );

  return (
    <div>
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="mz-eyebrow mb-1 block">Search by name or office</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Treasury, Murkomen, Envoy"
            className="w-full rounded-mz border border-mz-border px-3 py-2.5 text-sm focus:border-mz-red focus:outline-none focus:ring-2 focus:ring-mz-red/20"
          />
        </label>
        <label className="block">
          <span className="mz-eyebrow mb-1 block">Office</span>
          <select value={tier} onChange={(e) => setTier(e.target.value as typeof tier)} className="w-full rounded-mz border border-mz-border bg-white px-3 py-2.5 text-sm">
            {TIERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mz-eyebrow mb-1 block">Signal</span>
          <select value={signal} onChange={(e) => setSignal(e.target.value as typeof signal)} className="w-full rounded-mz border border-mz-border bg-white px-3 py-2.5 text-sm">
            <option value="all">All records</option>
            <option value="any">Any signal</option>
            {signals.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <p className="mb-3 text-sm text-mz-muted" aria-live="polite">
        Showing <strong className="text-mz-text">{shown.length}</strong> of {rows.length} people
      </p>

      <div className="overflow-hidden rounded-mz border border-mz-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-mz-subtle text-xs uppercase tracking-wider text-mz-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Person</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">Appointments</th>
              <th className="px-4 py-3 font-semibold">Signals</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mz-border">
            {shown.map((r) => (
              <tr key={r.slug} className="bg-white hover:bg-mz-subtle/60">
                <td className="px-4 py-3">
                  <Link href={`/people/${r.slug}/`} className="flex items-center gap-3">
                    <Monogram name={r.name} tone={r.signals.length ? "red" : "muted"} />
                    <span>
                      <span className="block font-semibold text-mz-red hover:underline">{r.name}</span>
                      <span className="block text-xs text-mz-muted">{r.role}</span>
                    </span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-mz-muted md:table-cell">{r.appointments}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {r.signals.length ? r.signals.map((s) => <SignalChip key={s} id={s} />) : <span className="text-xs text-mz-muted">None</span>}
                  </div>
                </td>
                <td className="hidden px-4 py-3 lg:table-cell"><VerificationTag v={r.verification} /></td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-mz-muted">No records match. Clear a filter to widen the search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
