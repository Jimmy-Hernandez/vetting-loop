// UNIT 1: add priorRole to nominees — sourced to Caroline's compiled Ruto cabinet tracker (PRESS-T1, needs_verification)
import fs from 'fs';

const FILE = 'app/public/data/episode.json';
const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Tracker Part 2 table, "2022 cabinet?" column (doc_bc3548f2fa49)
const prior = {
  'nominee-01': 'Interior and National Administration',                       // Kindiki
  'nominee-03': 'Water, Sanitation and Irrigation',                           // Wahome
  'nominee-05': 'Environment, Climate Change and Forestry',                   // Tuya (moved from Environment)
  'nominee-07': 'Defence',                                                    // Duale (moved from Defence)
  'nominee-09': 'Energy and Petroleum',                                       // Chirchir (moved from Energy)
  'nominee-12': 'Mining, Blue Economy and Maritime Affairs',                  // Mvurya (moved from Mining)
  'nominee-13': 'East African Community and Regional Development',            // Miano (moved from EAC)
  'nominee-15': 'Roads and Transport',                                        // Murkomen (moved from Roads)
  'nominee-17': 'Foreign and Diaspora Affairs',                               // Mutua (moved from Foreign)
  'nominee-19': 'Attorney-General',                                           // Muturi (was AG in 2022 cabinet)
};
const CONSTITUTIONAL = new Set(['nominee-19']);

for (const n of j.nominees) {
  const p = prior[n.id];
  n.priorRole = p
    ? {
        prior_role: '2022 Cabinet Secretary',
        prior_portfolio: p,
        priorRoleType: CONSTITUTIONAL.has(n.id) ? 'constitutional_office' : undefined,
        needs_verification: true,
      }
    : { prior_role: null, prior_portfolio: null, needs_verification: false };
}

fs.writeFileSync(FILE, JSON.stringify(j, null, 2) + '\n');
const r = j.nominees.filter((n) => n.priorRole.prior_role).length;
console.log('returnees:', r, '/', j.nominees.length);
