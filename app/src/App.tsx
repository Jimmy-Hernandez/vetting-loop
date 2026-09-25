import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Hearings from './views/Hearings';
import Nominees from './views/Nominees';
import NomineeDossier from './views/NomineeDossier';
import Vote from './views/Vote';
import Methodology from './views/Methodology';
import About from './views/About';
import NostrFallback from './views/NostrFallback';
import Ledger from './views/Ledger';

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
    { to: '/nominees', no: '01', phase: 'BEFORE', label: 'VOICE', aria: 'Act 1, before: the voice' },
    { to: '/hearings', no: '02', phase: 'DURING', label: 'VOTE', aria: 'Act 2, during: the vote' },
    { to: '/vote', no: '03', phase: 'AFTER', label: 'VERDICT', aria: 'Act 3, after: the verdict' },
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
            <p>The public record of parliamentary vetting. Impunity begins at confirmation.</p>
          </div>
          <nav className="fin-links" aria-label="Footer">
            {/* Only what the header does not already carry: how the record is built and kept honest. */}
            <Link to="/methodology">Methodology</Link>
            <Link to="/methodology#sources">Sources and data credits</Link>
            <Link to="/methodology#corrections">Corrections</Link>
          </nav>
        </div>
        <div className="fin-base">
          <span>All claims source-linked<span className="dot">·</span>Non-partisan<span className="dot">·</span>Civic tech prototype</span>
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
          <Route path="/" element={<About />} />
          <Route path="/nominees" element={<Nominees />} />
          <Route path="/nominee/:idOrSlug" element={<NomineeDossier />} />
          <Route path="/hearings" element={<Hearings />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/signals" element={<Methodology />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/about" element={<About />} />
          <Route path="/fallback" element={<NostrFallback />} />
          <Route path="*" element={<Fallback />} />
        </Routes>
      </Chrome>
    </BrowserRouter>
  );
}
