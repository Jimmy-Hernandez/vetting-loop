import * as React from 'react';

export function ActBanner({ act, label, active = true }: { act: 'before'|'during'|'after'; label: string; active?: boolean }) {
  const actNum = act === 'before' ? 'ACT 1' : act === 'during' ? 'ACT 2' : 'ACT 3';
  return (
    <div className={`mb-8 border-b ${active ? 'border-emerald-500/30' : 'border-neutral-800'} pb-4`}>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-900 text-neutral-500'}`}>
          {actNum}
        </span>
        <h1 className={`text-xl font-bold ${active ? 'text-neutral-100' : 'text-neutral-500'}`}>{label}</h1>
      </div>
      <div className="mt-4 flex gap-1 h-1">
        <div className={`h-full flex-1 rounded-full ${act === 'before' ? 'bg-emerald-500' : act === 'during' || act === 'after' ? 'bg-emerald-500/30' : 'bg-neutral-800'}`} />
        <div className={`h-full flex-1 rounded-full ${act === 'during' ? 'bg-emerald-500' : act === 'after' ? 'bg-emerald-500/30' : 'bg-neutral-800'}`} />
        <div className={`h-full flex-1 rounded-full ${act === 'after' ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
      </div>
    </div>
  );
}
