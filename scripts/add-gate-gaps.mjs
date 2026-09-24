// UNIT 3: add top-level gateGaps to episode.json — sources per brief; Kemosi from compiled tracker (The Star 4 May 2024)
import fs from 'fs';

const FILE = 'app/public/data/episode.json';
const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));

j.gateGaps = [
  {
    title: 'No recorded per-MP vote',
    text: 'The 19 approvals passed by voice vote on 8 August 2024. Hansard records only "(Question put and agreed to)" — no per-MP vote exists anywhere in the record.',
    source: 'Hansard, 7 Aug 2024 (data/hansard/aug7-2024-na.txt); Committee on Appointments Second Report',
    needs_verification: true,
  },
  {
    title: 'The Kemosi case — declined, yet gazetted',
    text: 'Vincent Mogaka Kemosi, nominated High Commissioner to Ghana (March 2024), declined vetting citing personal and family matters — and was nonetheless gazetted in May 2024. The vetting gate applies only to those who appear before it.',
    source: 'compiled tracker / The Star 4 May 2024',
    needs_verification: true,
  },
  {
    title: 'One rejection in three cycles',
    text: 'Of three CS vetting cycles 2022–2024 (22 + 20 + 20 nominees), one nominee has been rejected — Stella Soi Lang\'at, August 2024.',
    source: 'compiled tracker (2022 Part 1 slate: 22; 2024: 20 vetted; Lang\'at rejection, Committee on Appointments Second Report)',
    needs_verification: true,
  },
];

fs.writeFileSync(FILE, JSON.stringify(j, null, 2) + '\n');
console.log('gateGaps:', j.gateGaps.length);
