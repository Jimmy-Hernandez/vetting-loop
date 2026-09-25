import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import ReviewedRecord from './views/ReviewedRecord';
import Corrections from './views/Corrections';
import Support from './views/Support';
import Resilience from './views/Resilience';
import Tips from './views/EncryptedTips';
import NostrFallback from './views/NostrFallback';

function Chrome({ children }: { children: ReactNode }) {
  const loc = useLocation();
  useEffect(() => {
    // Footer links deep-link into Methodology sections; honour the hash, else start at the top.
    const target = loc.hash ? document.getElementById(loc.hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [loc.pathname, loc.hash]);
  // The three acts read as one sequence: phase above, subject below.
  const acts = [
    { to: '/', no: '', phase: 'Home', label: 'About', aria: 'About VETTA' },
    { to: '/nominees', no: '01', phase: 'Before', label: 'The Vote', aria: 'Act 1, before the vote: the nominees' },
    { to: '/hearings', no: '02', phase: 'During', label: 'The Record', aria: 'Act 2, during: the hearing record' },
    { to: '/vote', no: '03', phase: 'After', label: 'Accountability', aria: 'Act 3, after: the accountability trail' },
    { to: '/ledger', no: '', phase: 'The data', label: 'Ledger', aria: 'Ledger, the full data', cta: true },
  ];
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="chrome">
        <div className="chrome-inner">
          <Link to="/" className="brand" aria-label="VETTA, home">
            <img src="/brand/vetta-lockup-reverse.svg" alt="VETTA" width="123" height="24" />
          </Link>
          <nav className="acts" aria-label="Main navigation">
            {acts.map((a) => (
              <NavLink key={a.to} to={a.to} end className={a.cta ? 'act-cta' : a.no ? 'act-seq' : undefined} aria-label={a.aria} aria-current={loc.pathname === a.to ? 'page' : undefined}>
                <span className="no">{a.no && <b>{a.no}</b>}{a.phase}</span>
                {a.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <div id="main">{children}</div>
      <footer className="sitefoot">
        <div className="fin">
          <div className="fin-brand">
            <img src="/brand/vetta-lockup-reverse.svg" alt="VETTA" width="113" height="22" />
            <p>The public record of parliamentary vetting. Follow the record. Question the process.</p>
          </div>
          <nav className="fin-links" aria-label="Footer">
            {/* Only what the header does not already carry: how the record is built and kept honest. */}
            <Link to="/methodology">Methodology</Link>
            <Link to="/methodology#sources">Sources and data credits</Link>
            <Link to="/methodology#corrections">Corrections</Link>
          </nav>
        </div>
        <div className="fin-base">
          <span>Reviewed roster · Dossier review ongoing<span className="dot">·</span>Non-partisan<span className="dot">·</span>Civic tech prototype</span>
        </div>
      </footer>
    </>
  );
}

function Fallback() {
  return (
    <main className="doc">
      <div className="empty" style={{ marginTop: 'var(--s12)' }}>
        Not found. <Link to="/">Return to the record</Link>.
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Chrome>
        <Routes>
          <Route path="/" element={<ReviewedRecord />} />
          <Route path="/nominees" element={<ReviewedRecord mode="nominees" />} />
          <Route path="/nominee/:idOrSlug" element={<ReviewedRecord mode="nominee" />} />
          <Route path="/hearings" element={<ReviewedRecord mode="hearings" />} />
          <Route path="/vote" element={<ReviewedRecord mode="vote" />} />
          <Route path="/ledger" element={<ReviewedRecord mode="ledger" />} />
          <Route path="/signals" element={<Corrections />} />
          <Route path="/methodology" element={<Corrections />} />
          <Route path="/about" element={<ReviewedRecord />} />
          <Route path="/corrections" element={<Corrections />} />
          <Route path="/resilience" element={<Resilience />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/support" element={<Support />} />
          <Route path="/fallback" element={<NostrFallback />} />
          <Route path="*" element={<Fallback />} />
        </Routes>
      </Chrome>
    </BrowserRouter>
  );
}