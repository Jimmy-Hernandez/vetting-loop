export default function Methodology() {
  return (
    <main className="doc">
      <header className="masthead">
        <p className="kicker"><span className="rule"></span>Vetta · Evidence base</p>
        <h1>Methodology &amp; sources</h1>
        <p className="standfirst">Every claim in this record is traceable. This page lists the evidence base.</p>
        <div className="close" aria-hidden="true"></div>
      </header>

      <section className="sec" style={{ marginTop: 48 }}>
        <div className="sechead">
          <span className="no">Sources</span>
          <h2>Source register</h2>
          <p className="dek">Five sources of record. Every name, number and quotation in this platform traces to one of them.</p>
        </div>
        <ul className="findings">
          <li>
            <span className="num">1</span>
            <div>
              <h4>Committee on Appointments, Second Report, August 2024</h4>
              <p>
                Per-nominee questions, memoranda observations and background checks for all 20 nominees —
                the primary record of what the committee asked and what citizens submitted against each
                appointment. Cited by line reference throughout.
              </p>
              <span className="cite">
                <b>Access</b> 258-page scanned PDF, parliament.go.ke; OCR text in this repo at
                data/parliament-pdf/ocr-2024-report.txt
              </span>
            </div>
          </li>
          <li>
            <span className="num">2</span>
            <div>
              <h4>National Assembly Hansard, 7 August 2024</h4>
              <p>
                The motion, the debate and the approval — quoted verbatim with line references, including
                the approval mechanism itself: “(Question put and agreed&nbsp;to)”.
              </p>
              <span className="cite">
                <b>Access</b> Transcribed sitting record; full text in this repo at data/hansard/aug7-2024-na.txt
              </span>
            </div>
          </li>
          <li>
            <span className="num">3</span>
            <div>
              <h4>Mzalendo voting records</h4>
              <p>
                10 recorded National Assembly divisions, including the Finance Bill 2024 — the contrast
                dataset: what a recorded, per-MP vote looks like beside a vetting approval that was carried
                on a voice vote.
              </p>
              <span className="cite">
                <b>Access</b> mzalendo.com voting-patterns; per-MP CSVs mirrored in this repo at data/mzalendo/
              </span>
            </div>
          </li>
          <li>
            <span className="num">4</span>
            <div>
              <h4>Press record</h4>
              <p>
                33 sourced integrity flags — each carrying quotation, publisher, date and URL — drawn from
                the Daily Nation, The Star, Citizen, Capital FM, the Standard and other outlets.
              </p>
              <span className="cite">
                <b>Access</b> data/flags/news-flags.json
              </span>
            </div>
          </li>
          <li>
            <span className="num">5</span>
            <div>
              <h4>Compiled analysis — “Vetting Observations, CSs and PSs, 13th Parliament”</h4>
              <p>
                Cross-checked compilation of rejections, returnee rates and exit pathways across three
                vetting cycles (C. Gaita, 24 September 2026; PRESS-T1 — press-sourced, verify against the
                Kenya Gazette and Hansard before external citation). The source of the design requirements
                below (§7).
              </p>
              <span className="cite">
                <b>Access</b> data/sources/caroline-vetting-observations.md
              </span>
            </div>
          </li>
        </ul>
      </section>

      <section className="sec">
        <div className="sechead">
          <span className="no">Design requirements</span>
          <h2>Design requirements for a durable vetting record</h2>
          <p className="dek">Four requirements drawn from the compiled analysis (§7), each with how this platform implements it.</p>
        </div>
        <ol className="gaps">
          <li>
            <span className="num">1</span>
            <div>
              <h4>Track appearances, not just outcomes</h4>
              <p>Who was nominated, who appeared, who was approved, who declined, who was rejected — and on what stated grounds.</p>
              <span className="cite">
                This platform: the nominees register renders each official outcome with its source — including the
                single rejection and the committee’s stated ground — and the /vote record reproduces the House’s
                voice-vote line verbatim rather than an invented division.
              </span>
            </div>
          </li>
          <li>
            <span className="num">2</span>
            <div>
              <h4>Track personnel across cycles</h4>
              <p>The returnee rate and docket rotations are only visible when appointment histories are linked per person.</p>
              <span className="cite">
                This platform: returnee badges and docket-rotation counts on the nominees grid link prior cabinet
                service to the 2024 record.
              </span>
            </div>
          </li>
          <li>
            <span className="num">3</span>
            <div>
              <h4>Track exit pathways</h4>
              <p>Removal from office followed by re-appointment elsewhere is a continuity fact, not a fresh start.</p>
              <span className="cite">
                This platform: each dossier carries a dated, sourced epilogue of post-vote events, so a later
                appointment resurfaces the earlier record.
              </span>
            </div>
          </li>
          <li>
            <span className="num">4</span>
            <div>
              <h4>Note the stated grounds verbatim</h4>
              <p>The committee’s own language is the primary evidence of where scrutiny happened — and where it did not.</p>
              <span className="cite">
                This platform: quotations render verbatim with publisher and date; nothing is paraphrased into the record.
              </span>
            </div>
          </li>
        </ol>
      </section>

      <section className="sec">
        <div className="sechead">
          <span className="no">Verification</span>
          <h2>Unverified items and corrections</h2>
        </div>
        <div className="prose">
          <p>
            Where a value could not be confirmed against the source, the record says so: such items carry{' '}
            <code>needs_verification</code> and render on the page with an “unverified” chip rather than being
            smoothed over. Quotations, page and line references are reproduced as they appear in the source.
          </p>
          <p>
            Corrections to the record are logged in <code>data/CHANGELOG.md</code> in this repository.
          </p>
        </div>
      </section>
    </main>
  );
}
