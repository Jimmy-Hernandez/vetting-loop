import * as React from "react";
import { CHANNELS, STATUS_POINTS, type Finding } from "@vetting-loop/integrity";
import { CHANNEL_META, formatDate } from "@/lib/integrity";

const W = 1000;
const LANE_H = 26;
const TOP = 12;
const LEFT = 92;
const RIGHT = 16;

/**
 * 15-year lookback strip. Records left of the window edge are drawn in the
 * shaded zone to show they exist but do not count toward the rating.
 */
export function Timeline({ findings, windowStart, windowEnd }: { findings: Finding[]; windowStart: string; windowEnd: string }) {
  const startYear = Number(windowStart.slice(0, 4)) - 4;
  const t0 = Date.UTC(startYear, 0, 1);
  const t1 = Date.parse(`${windowEnd}T00:00:00Z`) + 90 * 864e5;
  const x = (iso: string) => LEFT + ((Date.parse(`${iso}T00:00:00Z`) - t0) / (t1 - t0)) * (W - LEFT - RIGHT);
  const H = TOP + LANE_H * CHANNELS.length + 28;
  const xw = x(windowStart);
  const years: number[] = [];
  for (let y = startYear; y <= Number(windowEnd.slice(0, 4)); y++) years.push(y);

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Records by source over the 15-year lookback window">
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#d4d4d4" strokeWidth="2" />
          </pattern>
        </defs>
        <rect x={LEFT} y={TOP - 6} width={xw - LEFT} height={LANE_H * CHANNELS.length + 6} fill="url(#hatch)" />
        <text x={(LEFT + xw) / 2} y={TOP + 6} textAnchor="middle" fontSize="11" fill="#6b6b6b">
          outside 15 yrs
        </text>
        <line x1={xw} x2={xw} y1={TOP - 6} y2={TOP + LANE_H * CHANNELS.length} stroke="#bd1419" strokeDasharray="4 3" />

        {CHANNELS.map((c, i) => {
          const y = TOP + LANE_H * i + LANE_H / 2;
          return (
            <g key={c}>
              <text x={0} y={y + 4} fontSize="12" fontWeight="600" fill={CHANNEL_META[c].color}>
                {CHANNEL_META[c].short}
              </text>
              <line x1={LEFT} x2={W - RIGHT} y1={y} y2={y} stroke="#e3e3e3" />
            </g>
          );
        })}

        {years.map((y) => {
          const xx = x(`${y}-01-01`);
          return (
            <g key={y}>
              <line x1={xx} x2={xx} y1={TOP + LANE_H * CHANNELS.length} y2={TOP + LANE_H * CHANNELS.length + 5} stroke="#999" />
              {(y - startYear) % 2 === 0 && (
                <text x={xx} y={H - 6} fontSize="11" textAnchor="middle" fill="#6b6b6b">
                  {y}
                </text>
              )}
            </g>
          );
        })}

        {findings.map((f) => {
          const lane = CHANNELS.indexOf(f.channel);
          const cy = TOP + LANE_H * lane + LANE_H / 2;
          const counts = STATUS_POINTS[f.status] > 0;
          const color = CHANNEL_META[f.channel].color;
          const outside = f.date < windowStart;
          return (
            <circle
              key={f.id}
              cx={x(f.date)}
              cy={cy}
              r={counts ? 7 : 6}
              fill={counts && !outside ? color : "#fff"}
              stroke={outside ? "#999" : color}
              strokeWidth={2.5}
            >
              <title>{`${formatDate(f.date)} · ${f.title} (mock)`}</title>
            </circle>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-mz-muted">
        <span>● filled: counts toward rating</span>
        <span>○ hollow: cleared, resolved, or outside the window</span>
        <span className="text-mz-red">┆ window opens {formatDate(windowStart)}</span>
      </figcaption>
    </figure>
  );
}
