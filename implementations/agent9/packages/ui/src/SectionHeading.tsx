import * as React from 'react';

export function SectionHeading({ label, count, note }: { label: string; count?: number; note?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-6">
      <h2 className="text-sm font-mono text-neutral-400 uppercase tracking-widest">{label}</h2>
      {count !== undefined && <span className="text-sm font-mono text-emerald-500">{count}</span>}
      {note && <span className="text-xs text-neutral-600 ml-auto">{note}</span>}
    </div>
  );
}
