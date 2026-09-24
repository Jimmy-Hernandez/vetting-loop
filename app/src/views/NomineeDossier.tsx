import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Episode, Nominee } from '../types';
import { loadEpisode, placeholderEpisode, checkOutcome } from '../data';

function Empty({ children }: { children: string }) {
  return <div className="empty">{children}</div>;
}

function Section({ no, title, dek, children }: { no: string; title: string; dek?: string; children: React.ReactNode }) {
  return (
    <section className="sec">
      <div className="sechead">
        <span className="no">{no}</span>
        <h2>{title}</h2>
        {dek && <p className="dek">{dek}</p>}
      </div>
      <div className="dossier">{children}</div>
    </section>
  );
}

const AGENCIES: Array<[keyof Nominee['backgroundChecks'], string]> = [
  ['eacc', 'EACC'], ['helb', 'HELB'], ['dci', 'DCI'],
  ['orpp', 'ORPP'], ['kra', 'KRA'], ['cue', 'CUE'],
];

export default function NomineeDossier() {
  const { idOrSlug } = useParams();
  const [ep, setEp] = useState<Episode | null>(null);
  useEffect(() => { loadEpisode().then((e) => setEp(e ?? placeholderEpisode())); }, []);
  if (!ep) return <main className="doc" />;

  const n = (ep.nominees ?? []).find((x) => x.id === idOrSlug || (x.slug && x.slug === idOrSlug));
  if (!n) {
    return (
      <main className="doc">
        <div className="empty" style={{ marginTop: 'var(--s12)' }}>
          Nominee not found. <Link to="/nominees">Return to the register</Link>.
        </div>
      </main>
    );
  }

  const flags = n.flags ?? [];
  const pos = n.positiveFindings ?? [];
  const asked = n.hearingQuestions?.asked ?? [];
  const ignored = n.hearingQuestions?.ignored ?? [];
  const mem = n.memoranda;

  // epigraph: first flag quote, else first positive finding claim
  const epi = flags[0]?.quote
    ? { q: flags[0].quote, attr: flags[0].date ? `${flags[0].publisher}${flags[0].date ? ' · ' + flags[0].date : ''}` : flags[0].publisher, url: flags[0].url, claim: false }
    : pos[0]?.claim
      ? { q: pos[0].claim, attr: `Committee on Appointments report · p. ${pos[0].page} · OCR confidence: ${pos[0].ocr_confidence}`, url: '', claim: true }
      : null;

  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>Nominee dossier</p>
        <h1>{n.name}</h1>
        <p className="standfirst">{n.portfolio}{n.reportPageRef ? ` · Committee report ${n.reportPageRef}` : ''}</p>
        <div className="close" aria-hidden="true"></div>
      </header>

      <div className="dossier" style={{ marginTop: 'var(--s8)' }}>
        {n.priorRole?.prior_role && (
          <div style={{ marginBottom: 'var(--s4)' }}>
            <span className="badge prior">Returned from 2022 Cabinet</span>
            {n.priorRole.needs_verification && <span className="src-chip unverified" style={{ marginLeft: 8 }}>needs verification</span>}
          </div>
        )}
        <dl className="dossier-id">
          <div className="di"><dt>Portfolio</dt><dd>{n.portfolio}</dd></div>
          {n.priorRole?.prior_role && (
            <div className="di"><dt>Prior role (2022 cabinet)</dt>
              <dd>
                {n.priorRole.prior_role} — {n.priorRole.prior_portfolio}
                {n.priorRole.priorRoleType === 'constitutional_office' && <span className="status-note" style={{ display: 'block' }}>Constitutional office (Attorney-General), appointed alongside the cabinet rather than vetted as a CS nominee</span>}
              </dd>
            </div>
          )}
          <div className="di"><dt>Party</dt><dd>{n.party ? <span className="party">{n.party}</span> : <span className="status-note">Not recorded</span>}</dd></div>
          <div className="di"><dt>Report reference</dt><dd>{n.reportPageRef || '—'}</dd></div>
          <div className="di">
            <dt>Status</dt>
            <dd>
              {n.status === 'approved' ? <span className="status-ok">Approved</span> : <span className="status-rej">Rejected</span>}
              <span className="status-note">Voice vote, {ep.date}</span>
            </dd>
          </div>
        </dl>

        {n.subsequentEvents && n.subsequentEvents.length > 0 && (
          <div className="epilogue">
            <h4>What happened after the vote</h4>
            <ul>
              {n.subsequentEvents.map((e, i) => (
                <li key={i}>
                  <span className="ev-date">{e.date ?? 'Date not stated in source'}</span>
                  <span className="ev-text">{e.text}</span>
                  {e.kind === 'context' && <span className="src-chip">context</span>}
                  {e.needs_verification && <span className="src-chip unverified">needs verification</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {epi ? (
          <div className="epigraph">
            <blockquote>
              <p className="q">“{epi.q}”</p>
              <p className="attr">
                — {epi.attr}
                {epi.url && <> · <a href={epi.url}>{epi.url}</a></>}
              </p>
            </blockquote>
          </div>
        ) : (
          <Empty>No verbatim quote on record for this nominee.</Empty>
        )}
      </div>

      <Section no="§ 1" title="Integrity flags" dek="Every claim sourced: quote, publisher, date, legal status.">
        {flags.length === 0 ? (
          <Empty>No sourced flags for this nominee.</Empty>
        ) : (
          <ol className="findings">
            {flags.map((f, i) => (
              <li key={i}>
                <span className="num">{i + 1}</span>
                <div>
                  <h4>{f.claim}</h4>
                  <p>“{f.quote}”</p>
                  <span className="cite">
                    <b>Source</b> {f.publisher}{f.date ? ` · ${f.date}` : ''}
                    {f.url && <> · <a href={f.url}>{f.url}</a></>}
                    {f.legal_status && <> · <b>Legal status</b> {f.legal_status}</>}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section no="§ 2" title="Positive findings" dek="Co-equal with flags. Page and OCR confidence cited.">
        {pos.length === 0 ? (
          <Empty>No positive findings recorded — an honest empty result, not an omission.</Empty>
        ) : (
          <ol className="findings positive">
            {pos.map((p, i) => (
              <li key={i}>
                <span className="num">{i + 1}</span>
                <div>
                  <h4>{p.claim}</h4>
                  <span className="cite">
                    <b>Source</b> Committee report p. {p.page} · OCR confidence: {p.ocr_confidence}
                    {p.needs_verification && <> <span className="src-chip unverified" style={{ marginLeft: 8 }}>unverified</span></>}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section no="§ 3" title="Background checks" dek="Agency clearances as recorded in the committee report.">
        <dl className="checks">
          {AGENCIES.map(([k, label]) => {
            const c = checkOutcome(n, k);
            return (
              <div className="ck" key={k}>
                <dt>{label}</dt>
                <dd>
                  {c ? c.outcome || '—' : <span className="none">No record in file</span>}
                  {c?.page ? <span className="status-note" style={{ display: 'block', fontWeight: 500, color: '#888', fontSize: 11 }}>p. {c.page}</span> : null}
                  {c?.quote ? <span className="q">“{c.quote}”</span> : null}
                </dd>
              </div>
            );
          })}
        </dl>
      </Section>

      <Section no="§ 4" title="The hearing" dek="What the committee asked — and what went unasked.">
        <div className="qa-cols">
          <div className="qcols">
            <h4>Asked ({asked.length})</h4>
            {asked.length === 0 ? <Empty>No questions recorded.</Empty> : (
              <ul>
                <p className="kicker"><span className="rule"></span>Act 2 · During — the hearing record</p>
            {asked.map((q, i) => (
                  <li key={i}>
                    {q.text}
                    <br />
                    <span className="src-chip">{q.source === 'mp' ? `MP${q.mp_name ? ' · ' + q.mp_name : ''}` : 'Committee'}</span>
                    {q.source_url && <a href={q.source_url}> source</a>}
                    {q.line ? <span className="src-chip">line {q.line}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="qcols">
            <h4>Ignored ({ignored.length})</h4>
            {ignored.length === 0 ? <Empty>Nothing recorded as ignored.</Empty> : (
              <ul>
                {ignored.map((q, i) => (
                  <li key={i}>
                    {q.text}
                    <br />
                    {q.kind === 'affidavit_clause' && <span className="src-chip citizen">citizen memorandum</span>}
                    {!q.kind && <span className="src-chip citizen">citizen</span>}
                    {q.needs_verification && <span className="src-chip unverified">unverified</span>}
                    {q.source_url && <a href={q.source_url}> source</a>}
                    {q.line ? <span className="src-chip">line {q.line}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      <Section no="§ 5" title="Memoranda" dek="Observations on memoranda submitted against the nominee.">
        <div className="memoranda">
          {mem?.header_found ? (
            <>
              <h4>Memoranda from the public — observed by the Committee</h4>
              <span className="mtag">{mem.count ?? 0} memoranda observed</span>
              {mem.quote && <p className="q">“{mem.quote}”</p>}
              <span className="mref">
                Report L{mem.hdr_line}
                {mem.report_page ? ` · ${mem.report_page}` : ''}
              </span>
              {mem.needs_verification && <span className="src-chip unverified">needs verification</span>}
            </>
          ) : (
            <>
              <span className="mtag missing">No memoranda section in the Committee report — inline narrative only.</span>
              {mem?.quote && <p className="q">“{mem.quote}”</p>}
              {mem?.hdr_line ? <span className="mref">Report L{mem.hdr_line}</span> : null}
              {mem?.needs_verification && <span className="src-chip unverified">needs verification</span>}
            </>
          )}
        </div>
      </Section>
    </main>
  );
}