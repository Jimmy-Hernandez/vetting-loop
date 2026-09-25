'use client';
import * as React from 'react';
import { useState } from 'react';

interface HearingRowProps {
  exchange: { id: string; topic: string; askedBy: string; questionText: string; responseText?: string; addressesCitizenQuestion: boolean; status?: 'asked'|'ignored' };
}

export function HearingRow({ exchange }: HearingRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-neutral-800 py-4 last:border-0 group">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <span className="px-2 py-0.5 bg-neutral-900 text-neutral-400 text-[10px] uppercase font-mono rounded">
          {exchange.topic}
        </span>
        {exchange.addressesCitizenQuestion && (
          <span className="px-2 py-0.5 bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-[10px] uppercase font-mono rounded flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            Citizen Q
          </span>
        )}
        <span className="text-xs font-mono text-neutral-500 ml-auto">{exchange.askedBy}</span>
      </div>
      <p className="text-sm text-neutral-200 font-medium mb-2">{exchange.questionText}</p>
      
      {exchange.responseText && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-neutral-500">Response:</span>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-mono text-emerald-500 hover:text-emerald-400 transition-colors focus:outline-none"
            >
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          <p className={`text-sm text-neutral-400 border-l-2 border-neutral-800 pl-3 ${expanded ? '' : 'line-clamp-2'}`}>
            {exchange.responseText}
          </p>
        </div>
      )}
    </div>
  );
}
