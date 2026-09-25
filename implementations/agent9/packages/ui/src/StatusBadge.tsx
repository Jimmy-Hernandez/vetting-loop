import * as React from 'react';

export function StatusBadge({ status, variant }: { status: string; variant?: 'nominee'|'question'|'vote' }) {
  let color = 'bg-neutral-800 text-neutral-300';
  
  if (variant === 'question') {
    if (status === 'asked') color = 'bg-emerald-950 text-emerald-400';
    if (status === 'ignored') color = 'bg-red-950 text-red-400';
    if (status === 'partially_asked') color = 'bg-amber-950 text-amber-400';
    if (status === 'pending') color = 'bg-neutral-800 text-neutral-400';
  } else if (variant === 'vote') {
    if (status === 'aye') color = 'bg-red-950 text-red-400';
    if (status === 'nay') color = 'bg-emerald-950 text-emerald-400';
    if (status === 'abstain') color = 'bg-neutral-800 text-neutral-400';
    if (status === 'absent') color = 'bg-neutral-900 text-neutral-500';
  } else {
    if (status === 'approved') color = 'bg-red-950 text-red-400';
    if (status === 'rejected') color = 'bg-emerald-950 text-emerald-400';
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${color}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
