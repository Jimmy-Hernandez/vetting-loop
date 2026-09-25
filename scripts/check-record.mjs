import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
export function checkRecord(episode, divisions, ledger) {
  const errors = [];
  const require = (ok, message) => { if (!ok) errors.push(message); };
  require(episode.date === '2024-08-07', 'Episode date must be 2024-08-07');
  require(episode.nominees?.length === 20, 'Episode must contain 20 nominees');
  const nominees = episode.nominees ?? [];
  require(nominees.filter(n => n.status === 'approved').length === 19, 'Expected 19 approvals');
  require(nominees.filter(n => n.status === 'rejected').length === 1, 'Expected one rejection');
  require(new Set(nominees.map(n => n.id)).size === nominees.length, 'Duplicate nominee ID');
  require(new Set(nominees.map(n => n.slug)).size === nominees.length, 'Duplicate nominee slug');
  require(divisions.vetting_vote?.mechanism === 'voice_vote', 'Vetting must remain a voice vote');
  require(Array.isArray(divisions.vetting_vote?.recorded_votes) && divisions.vetting_vote.recorded_votes.length === 0, 'Never invent individual MP votes for this episode');
  const http = value => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };
  for (const n of nominees) {
    require(Boolean(n.name && n.id && n.slug), 'Nominee identity missing');
    for (const f of n.flags ?? []) require(Boolean(f.claim && f.quote && f.publisher && f.date && f.legal_status && http(f.url)), `${n.id}: missing flag provenance`);
    for (const f of n.positiveFindings ?? []) require(Boolean(f.claim && Number.isInteger(f.page) && f.page > 0 && f.ocr_confidence), `${n.id}: missing positive-finding provenance`);
    for (const q of [...(n.hearingQuestions?.asked ?? []), ...(n.hearingQuestions?.ignored ?? [])]) require(Boolean(q.text && (http(q.source_url) || (q.source_url === null && q.needs_verification === true)) && Number.isInteger(q.line) && q.line > 0), `${n.id}: missing question source/line`);
  }
  require(Array.isArray(ledger.people) && ledger.people.length > 0, 'Ledger people missing');
  const cycleIds = new Set((ledger.cycles ?? []).map(c => c.id));
  for (const p of ledger.people ?? []) for (const a of p.appointments ?? []) require(cycleIds.has(a.cycle), 'Appointment references unknown cycle');
  return errors;
}
export function auditRecord(episode) {
  const statuses = new Set(['convicted','charged','case_filed','self_admitted','accused_reported','official_clearance','no_action_recorded']);
  const findings = [];
  for (const n of episode.nominees) {
    for (const [i,q] of (n.hearingQuestions?.ignored ?? []).entries()) if (!q.source_url) findings.push({nominee:n.id, field:`hearingQuestions.ignored[${i}].source_url`, issue:"source URL absent; already marked needs_verification"});
    for (const [i,f] of (n.flags ?? []).entries()) {
      if (!statuses.has(f.legal_status)) findings.push({nominee:n.id, field:`flags[${i}].legal_status`, issue:'outside agreed taxonomy'});
      if (!f.source_class) findings.push({nominee:n.id, field:`flags[${i}].source_class`, issue:'provenance class not encoded'});
    }
  }
  return {scope:'Offline structural audit only. No fresh URL, quotation fidelity, OCR attribution or factual verification.', findings};
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const episode = read('app/public/data/episode.json');
  const errors = checkRecord(episode,read('app/public/data/divisions.json'),read('app/public/data/terry/ledger.json'));
  const audit = auditRecord(episode);
  if (process.argv.includes('--report')) writeFileSync(new URL('../docs/data-audit.json',import.meta.url),JSON.stringify(audit,null,2)+'\n');
  console.log(JSON.stringify({structuralErrors:errors, editorialFindings:audit.findings.length, scope:audit.scope},null,2));
  process.exitCode = errors.length ? 1 : 0;
}
