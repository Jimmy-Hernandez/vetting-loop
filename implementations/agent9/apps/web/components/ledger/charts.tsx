import * as React from "react";
import type { GateRow, Reconstitution } from "@vetting-loop/ledger";

/**
 * One square per nomination across the three formal vetting cycles.
 * Green = approved; red = rejected by the House. Pure SVG, no script.
 */
export function GateMatrix({ rows }: { rows: GateRow[] }) {
  const cols = 16;
  const size = 20;
  const gap = 5;
  const cells: Array<{ rejected: boolean; cycle: string }> = rows.flatMap((r) =>
    Array.from({ length: r.nominated }, (_, i) => ({ rejected: i >= r.approved, cycle: r.label })),
  );
  const rowsN = Math.ceil(cells.length / cols);
  const w = cols * (size + gap) - gap;
  const h = rowsN * (size + gap) - gap;
  const total = cells.length;
  const rejected = cells.filter((c) => c.rejected).length;
  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`${total} nominations, ${rejected} rejected by the House`}>
        {cells.map((c, i) => {
          const x = (i % cols) * (size + gap);
          const y = Math.floor(i / cols) * (size + gap);
          return c.rejected ? (
            <g key={i}>
              <rect x={x} y={y} width={size} height={size} rx={3} fill="#bd1419" />
              <path d={`M${x + 6} ${y + 6}l8 8m0-8-8 8`} stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
            </g>
          ) : (
            <rect key={i} x={x} y={y} width={size} height={size} rx={3} fill="#008033" fillOpacity={0.18 + (i % 5) * 0.03} stroke="#008033" strokeOpacity={0.5} />
          );
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-mz-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-mz-green/60 bg-mz-green/25" /> Approved ({total - rejected})</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-mz-red" /> Rejected by the House ({rejected})</span>
        <span>One square per nomination · CS 2022, PS 2022, CS 2024</span>
      </figcaption>
    </figure>
  );
}

/** Horizontal bars per cycle with approval counts. */
export function GateBars({ rows }: { rows: GateRow[] }) {
  const max = Math.max(...rows.map((r) => r.nominated));
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.cycle}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-semibold">{r.label}</span>
            <span className="text-mz-muted">
              <strong className="text-mz-text">{r.approved}</strong> of {r.nominated} approved
              {r.rejected > 0 && <span className="ml-2 font-semibold text-mz-red">{r.rejected} rejected</span>}
            </span>
          </div>
          <div className="flex h-6 overflow-hidden rounded-mz bg-mz-subtle" style={{ width: `${(r.nominated / max) * 100}%` }}>
            <div className="bg-mz-green" style={{ width: `${(r.approved / r.nominated) * 100}%` }} />
            {r.rejected > 0 && <div className="bg-mz-red" style={{ width: `${(r.rejected / r.nominated) * 100}%` }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The July 2024 dissolution and August 2024 reconstitution as a flow:
 * the dissolved cabinet on the left, the approved cabinet on the right.
 */
export function ReconstitutionFlow({ r, dissolved }: { r: Reconstitution; dissolved: number }) {
  const W = 720;
  const H = 300;
  const unit = 11;
  const leftTop = 40;
  const rightTop = 40;
  const leftX = 150;
  const rightX = 560;
  const band = (y1: number, y2: number, h: number, color: string, opacity = 0.35) => (
    <path
      d={`M${leftX} ${y1} C ${(leftX + rightX) / 2} ${y1}, ${(leftX + rightX) / 2} ${y2}, ${rightX} ${y2} L ${rightX} ${y2 + h} C ${(leftX + rightX) / 2} ${y2 + h}, ${(leftX + rightX) / 2} ${y1 + h}, ${leftX} ${y1 + h} Z`}
      fill={color}
      fillOpacity={opacity}
    />
  );
  const retH = r.returnees * unit;
  const outH = (dissolved - r.returnees) * unit;
  const newH = r.newFaces * unit;
  const rejH = r.rejected * unit;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Of ${dissolved} dissolved cabinet members, ${r.returnees} returned among ${r.approved} approved`}>
        <text x={4} y={22} className="fill-mz-muted text-[12px] font-semibold uppercase tracking-wider">Dissolved 11 Jul 2024</text>
        <text x={W - 4} y={22} textAnchor="end" className="fill-mz-muted text-[12px] font-semibold uppercase tracking-wider">Approved 7 Aug 2024</text>
        {band(leftTop, rightTop, retH, "#bd1419", 0.28)}
        <rect x={leftX - 14} y={leftTop} width={14} height={retH} fill="#bd1419" />
        <rect x={leftX - 14} y={leftTop + retH + 6} width={14} height={outH} fill="#9ca3af" />
        <rect x={rightX} y={rightTop} width={14} height={retH} fill="#bd1419" />
        <rect x={rightX} y={rightTop + retH + 6} width={14} height={newH} fill="#008033" />
        <rect x={rightX} y={rightTop + retH + newH + 12} width={14} height={rejH} fill="#e5e7eb" stroke="#bd1419" strokeDasharray="3 2" />
        <text x={leftX - 22} y={leftTop + retH / 2 + 5} textAnchor="end" className="fill-mz-red text-[15px] font-bold">{r.returnees} returned</text>
        <text x={leftX - 22} y={leftTop + retH + 6 + outH / 2 + 5} textAnchor="end" className="fill-mz-muted text-[14px] font-semibold">{dissolved - r.returnees} did not</text>
        <text x={rightX + 24} y={rightTop + retH / 2 + 5} className="fill-mz-red text-[15px] font-bold">{r.returnees} returnees</text>
        <text x={rightX + 24} y={rightTop + retH + 6 + newH / 2 + 5} className="fill-mz-green text-[14px] font-bold">{r.newFaces} new</text>
        <text x={rightX + 24} y={rightTop + retH + newH + 12 + rejH / 2 + 4} className="fill-mz-muted text-[12px]">{r.rejected} rejected</text>
        <text x={(leftX + rightX) / 2} y={leftTop + retH / 2 + 5} textAnchor="middle" className="fill-mz-red text-[12px] font-semibold">
          {r.rotatedDocket} of {r.returnees} changed docket
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-mz-muted">
        Cabinet members removed on 11 Jul 2024 (21 Cabinet Secretaries and the Attorney General; the Prime CS was retained) against the 19 approved on
        7 Aug 2024. Computed from linked appointment histories.
      </figcaption>
    </figure>
  );
}
