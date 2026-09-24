import type { Episode, DivisionsFile, HansardExcerptsFile, Nominee, BackgroundCheck } from './types';

// Graceful loaders: fetch JSON from /data/*; return null on failure.
// Views must render empty states from null — never invented data.

async function fetchJson<T>(file: string): Promise<T | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${file}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const loadEpisode = () => fetchJson<Episode>('episode.json');
export const loadDivisions = () => fetchJson<DivisionsFile>('divisions.json');
export const loadHansardExcerpts = () => fetchJson<HansardExcerptsFile>('hansard-excerpts.json');

export function isPlaceholder(e: Episode | null): boolean {
  return !!(e as unknown as { placeholder?: boolean } | null)?.placeholder;
}

export function countsFor(n: Nominee) {
  return {
    flags: n.flags?.length ?? 0,
    positive: n.positiveFindings?.length ?? 0,
    memoranda: n.memoranda?.count ?? 0,
  };
}

export function checkOutcome(n: Nominee, key: keyof Nominee['backgroundChecks']): BackgroundCheck | null {
  const c = n.backgroundChecks?.[key];
  return c && (c.outcome || c.page || c.quote) ? c : null;
}

// ---------- placeholder fixtures (data lane JSON absent at build time) ----------

export function placeholderEpisode(): Episode {
  const mk = (id: string, name: string, portfolio: string, status: 'approved' | 'rejected'): Nominee => ({
    id,
    name,
    slug: id.replace('nominee-', 'nominee-'),
    portfolio,
    party: null,
    status,
    flags: [],
    positiveFindings: [],
    backgroundChecks: { eacc: { outcome: '', page: 0, quote: '' }, helb: { outcome: '', page: 0, quote: '' }, dci: { outcome: '', page: 0, quote: '' }, orpp: { outcome: '', page: 0, quote: '' }, kra: { outcome: '', page: 0, quote: '' }, cue: { outcome: '', page: 0, quote: '' } },
    hearingQuestions: { asked: [], ignored: [] },
    memoranda: { header_found: false, count: 0, summary: '', report_page: '' },
    reportPageRef: '',
  });
  return {
    slug: 'cs-vetting-august-2024',
    title: 'The Vetting of the Cabinet — August 2024',
    date: '2024-08-07',
    summary:
      'PLACEHOLDER FIXTURE — the data lane has not yet published app/public/data/episode.json. Two nominal entries stand in for the 20 real nominees. No factual content is asserted here; every field is empty pending the real data file.',
    nominees: [
      mk('nominee-placeholder-1', 'Placeholder Nominee One', 'Ministry — pending data lane', 'approved'),
      mk('nominee-placeholder-2', 'Placeholder Nominee Two', 'Ministry — pending data lane', 'rejected'),
    ],
  };
}

export function placeholderDivisions(): DivisionsFile {
  return {
    divisions: [],
    vetting_vote: {
      motion_text:
        'PLACEHOLDER — verbatim motion text pending data lane divisions.json.',
      mechanism: 'voice_vote',
      recorded_votes: [],
      hansard_line: '(Question put and agreed to)',
      hansard_date: '2024-08-07',
    },
  };
}

export function placeholderExcerpts(): HansardExcerptsFile {
  return {
    excerpts: [
      {
        speaker: 'PLACEHOLDER',
        role: '',
        text: 'Hansard excerpts pending data lane hansard-excerpts.json.',
        date: '2024-08-07',
        url: '',
      },
    ],
  };
}