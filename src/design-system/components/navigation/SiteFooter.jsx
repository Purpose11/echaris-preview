import React from 'react';
import { Logo } from '../core/Logo.jsx';

export function SiteFooter({ columns = [], tagline = 'Grow with Confidence.', legal, logoSrc, style }) {
  return (
    <footer className="sf" style={{ background: 'var(--surface-inverse)', color: 'var(--neutral-300)', padding: '64px 0 32px', ...style }}>
      <div className="wrap">
        <div className="sf-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(' + Math.max(columns.length, 1) + ', 1fr)', gap: 48 }}>
          <div className="sf-brand" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 300 }}>
            <Logo variant="white" height={28} src={logoSrc} />
            <p style={{ fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--neutral-400)' }}>{tagline}</p>
          </div>
          {columns.map(c => (
            <div key={c.title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 'var(--fs-micro)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: 'var(--neutral-500)' }}>{c.title}</span>
              {c.links.map(l => (
                <a key={l.label} href={l.href || '#'} style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--neutral-300)', textDecoration: 'none' }}>{l.label}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="sf-bottom" style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--neutral-800)', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', fontSize: 'var(--fs-caption)', color: 'var(--neutral-500)' }}>
          <span>{legal || 'Echaris Trading Limited · CAC Registered RC 9450649'}</span>
          <span>© {new Date().getFullYear()} Echaris Trading Limited. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
