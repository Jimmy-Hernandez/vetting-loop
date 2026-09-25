import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
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
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  const acts = [
    { to: '/nominees', no: 'Act 1', label: 'Before' },
    { to: '/hearings', no: 'Act 2', label: 'During' },
    { to: '/vote', no: 'Act 3', label: 'After' },
    { to: '/ledger', no: 'Record', label: 'Ledger' },
    { to: '/', no: '', label: 'About' },
  ];
  return (
    <>
      <header className="chrome">
        <div className="chrome-inner">
          <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/vetta-emblem.png" alt="Vetta emblem" width="108" height="40" style={{ display: 'block' }} />
            <span className="here">Vetta</span>
          </div>
          <nav className="acts" aria-label="Vetta — main navigation">
            {acts.map((a) => (
              <NavLink key={a.to} to={a.to} aria-current={loc.pathname === a.to ? 'page' : undefined}>
                <span className="no">{a.no}</span>
                {a.label}
              </NavLink>
            ))}

          </nav>
        </div>
      </header>
      {children}
      <footer className="sitefoot">
        <div className="fin">
          <span>Vetta — a civic tech tool<span className="dot">·</span>Impunity begins at confirmation.</span>
          <span>All claims source-linked<span className="dot">·</span>Non-partisan<span className="dot">·</span><Link to="/">About</Link><span className="dot">·</span><Link to="/methodology">Methodology</Link></span>
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
    <HashRouter>
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
    </HashRouter>
  );
}