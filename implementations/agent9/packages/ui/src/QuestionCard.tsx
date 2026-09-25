'use client';
import * as React from 'react';
import { StatusBadge } from './StatusBadge';

interface QuestionProps {
  question: { id: string; body: string; upvotes: number; status: 'pending'|'asked'|'ignored'|'partially_asked'; submitterLabel?: string; askedBy?: string };
  onUpvote?: (id: string) => void;
}

export function QuestionCard({ question, onUpvote }: QuestionProps) {
  return (
    <div className="p-4 border border-neutral-800 rounded-lg bg-neutral-900/50 flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <button 
          onClick={() => onUpvote?.(question.id)}
          className="p-1 text-neutral-400 hover:text-emerald-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <span className="font-mono text-lg font-bold text-neutral-200">{question.upvotes}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <StatusBadge status={question.status} variant="question" />
          {question.submitterLabel && (
            <span className="text-xs text-neutral-500 font-mono">By {question.submitterLabel}</span>
          )}
        </div>
        <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap">{question.body}</p>
        {question.status === 'asked' && question.askedBy && (
          <div className="mt-4 text-xs font-mono text-emerald-500/80">
            ↳ Asked by {question.askedBy}
          </div>
        )}
      </div>
    </div>
  );
}
