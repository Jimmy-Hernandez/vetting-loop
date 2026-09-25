import type { ReactNode } from 'react';

// External source link: opens in a new tab, labelled by host rather than a raw URL.
function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export default function ExtLink({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <a className="ext" href={href} target="_blank" rel="noopener noreferrer">
      {children ?? hostOf(href)}
    </a>
  );
}
