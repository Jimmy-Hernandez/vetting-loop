// UNIT 2: add subsequentEvents per nominee — sourced to compiled Ruto cabinet tracker (doc_bc3548f2fa49), needs_verification
// Entries ONLY from the tracker, dated where the tracker dates them. Tracker-undated facts carry date: null
// (never an invented date). Retained nominees: field omitted entirely (honest absence).
// NOTE: tracker's 17 Jan 2025 table lists only Kagwe/Kinyanjui/Kabogo appointments — no dated move for
// Wahome/Murkomen/Mutua/Miano/Chirchir, so they receive NO event despite the brief's cohort mention.
import fs from 'fs';

const FILE = 'app/public/data/episode.json';
const SRC = 'compiled-tracker';
const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const EV = {
  'nominee-01': [ // Kindiki
    { date: '2024-11-01', text: 'Sworn in as Deputy President following Gachagua impeachment; resigned as Interior CS.' },
  ],
  'nominee-07': [ // Duale
    { date: '2025-03-26', text: 'Moved from Environment to Health in mini-reshuffle.' },
  ],
  'nominee-02': [ // Barasa
    { date: '2025-03-26', text: 'Moved from Health to Environment.' },
  ],
  'nominee-19': [ // Muturi
    { date: '2025-03-26', text: 'Dismissed as Public Service CS after public disagreement over 2024 abductions; Geoffrey Ruku nominated.' },
    { date: '2024-07-11', text: 'Context: Muturi had served as Attorney-General in the 2022 cabinet; the AG office was vacant after the July 2024 cabinet dissolution (Dorcas Oduor later succeeded Muturi as AG).', kind: 'context' },
  ],
  'nominee-06': [ // Karanja
    { date: '2025-01-17', text: 'Replaced as Agriculture and Livestock Development CS by Mutahi Kagwe.' },
    { date: null, text: 'Subsequently removed from cabinet and nominated envoy to Brazil (tracker records this in its later-2025 changes without a date).' },
  ],
  'nominee-10': [ // Ndung'u
    { date: '2025-01-17', text: 'Replaced as Information, Communication and the Digital Economy CS by William Kabogo Gitau.' },
    { date: null, text: 'Subsequently removed from cabinet and nominated envoy to Ghana; publicly declined (tracker records this in its later-2025 changes without a date).' },
  ],
  'nominee-12': [ // Mvurya
    { date: '2025-01-17', text: 'Replaced as Investments, Trade and Industry CS by Lee Kinyanjui (tracker: "Salim Mvurya (moved)").' },
  ],
};

for (const n of j.nominees) {
  const evs = EV[n.id];
  if (evs && evs.length) {
    n.subsequentEvents = evs.map((e) => ({
      date: e.date,
      text: e.text,
      source: SRC,
      needs_verification: true,
      ...(e.kind === 'context' ? { kind: 'context' } : {}),
    }));
  }
  // else: omit the field entirely — honest absence
}

fs.writeFileSync(FILE, JSON.stringify(j, null, 2) + '\n');
const withEv = j.nominees.filter((n) => n.subsequentEvents?.length);
console.log('with subsequentEvents:', withEv.length, '→', withEv.map((n) => n.id).join(', '));
