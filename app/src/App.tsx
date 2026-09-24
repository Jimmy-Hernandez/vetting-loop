import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Home from './views/Home';
import Nominees from './views/Nominees';
import NomineeDossier from './views/NomineeDossier';
import Vote from './views/Vote';
import Methodology from './views/Methodology';
import NostrFallback from './views/NostrFallback';

function Chrome({ children }: { children: ReactNode }) {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  const acts = [
    { to: '/nominees', no: 'Act 1', label: 'Before' },
    { to: '/vote', no: 'Act 2', label: 'During' },
    { to: '/', no: 'Act 3', label: 'After' },
  ];
  return (
    <>
      <header className="chrome">
        <div className="chrome-inner">
          <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/vetta-emblem.png" alt="Vetta emblem" width="26" height="26" style={{ display: 'block', borderRadius: 4 }} />
            <a href="https://mzalendo.com">Mzalendo</a>
            <span className="sep">›</span>Civic Tech Tools
            <span className="sep">›</span><span className="here">Vetta</span>
          </div>
          <nav className="acts" aria-label="Vetta — three acts">
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
          <span>All claims source-linked<span className="dot">·</span>Non-partisan<span className="dot">·</span><Link to="/methodology">Methodology</Link></span>
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
          <Route path="/" element={<Home />} />
          <Route path="/nominees" element={<Nominees />} />
          <Route path="/nominee/:idOrSlug" element={<NomineeDossier />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/fallback" element={<NostrFallback />} />
          <Route path="*" element={<Fallback />} />
        </Routes>
      </Chrome>
    </HashRouter>
  );
}