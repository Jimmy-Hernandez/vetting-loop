import * as React from 'react';

interface FlagProps {
  flag: { id: string; summary: string; severity: 'low' | 'medium' | 'high' };
  sources: Array<{ id: string; title: string; url: string; publisher: string; documentType: string }>;
}

export function FlagCard({ flag, sources }: FlagProps) {
  const borderColor = flag.severity === 'high' ? 'border-red-800' : flag.severity === 'medium' ? 'border-amber-800' : 'border-neutral-800';
  const bgColor = flag.severity === 'high' ? 'bg-red-950/20' : flag.severity === 'medium' ? 'bg-amber-950/20' : 'bg-transparent';
  const badgeColor = flag.severity === 'high' ? 'bg-red-900 text-red-100' : flag.severity === 'medium' ? 'bg-amber-900 text-amber-100' : 'bg-neutral-800 text-neutral-300';

  return (
    <div className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded ${badgeColor}`}>
          {flag.severity} severity
        </span>
      </div>
      <p className="text-sm text-neutral-200 mb-4">{flag.summary}</p>
      <div className="flex flex-wrap gap-2">
        {sources.map(src => (
          <a key={src.id} href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            {src.publisher} · {src.documentType.replace('_', ' ')}
          </a>
        ))}
      </div>
    </div>
  );
}
