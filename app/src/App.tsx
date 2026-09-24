import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Home from './views/Home';
import Nominees from './views/Nominees';
import NomineeDossier from './views/NomineeDossier';
import Vote from './views/Vote';

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
          <div className="breadcrumb">
            <a href="https://mzalendo.com">Mzalendo</a>
            <span className="sep">›</span>Civic Tech Tools
            <span className="sep">›</span><span className="here">The Vetting Loop</span>
          </div>
          <nav className="acts" aria-label="The Vetting Loop — three acts">
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
          <span>The Vetting Loop — a civic tech tool<span className="dot">·</span>Impunity begins at confirmation.</span>
          <span>All claims source-linked<span className="dot">·</span>Non-partisan</span>
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
          <Route path="/" element={<Home />} />
          <Route path="/nominees" element={<Nominees />} />
          <Route path="/nominee/:id" element={<NomineeDossier />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="*" element={<Fallback />} />
        </Routes>
      </Chrome>
    </BrowserRouter>
  );
}