import * as React from 'react';
import { SourceLink } from './SourceLink';

interface VoteProps {
  votes: Array<{ id: string; mpName: string; constituency: string; party: string; choice: 'aye'|'nay'|'abstain'|'absent'; source: { url: string; publisher: string } }>;
}

export function VoteTable({ votes }: VoteProps) {
  return (
    <div className="w-full overflow-x-auto border border-neutral-800 rounded-lg">
      <table className="w-full text-left text-sm text-neutral-300">
        <thead className="bg-neutral-900/50 text-xs uppercase font-mono text-neutral-500">
          <tr>
            <th className="px-4 py-3">MP Name</th>
            <th className="px-4 py-3">Constituency</th>
            <th className="px-4 py-3">Party</th>
            <th className="px-4 py-3">Vote</th>
            <th className="px-4 py-3">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {votes.map(v => {
            let color = 'text-neutral-400';
            if (v.choice === 'aye') color = 'text-red-400';
            if (v.choice === 'nay') color = 'text-emerald-400';
            if (v.choice === 'absent') color = 'text-neutral-600';
            return (
              <tr key={v.id} className="hover:bg-neutral-900/30 transition-colors">
                <td className="px-4 py-3 font-medium text-neutral-200">{v.mpName}</td>
                <td className="px-4 py-3">{v.constituency}</td>
                <td className="px-4 py-3">{v.party}</td>
                <td className={`px-4 py-3 font-mono uppercase text-xs font-bold ${color}`}>{v.choice}</td>
                <td className="px-4 py-3"><SourceLink source={{...v.source, documentType: 'hansard'}} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
