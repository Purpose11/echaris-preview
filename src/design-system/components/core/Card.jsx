import React from 'react';

export function Card({ tone = 'default', padding = 24, interactive, header, footer, children, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    default: { background: 'var(--surface-card)', borderColor: 'var(--border-subtle)' },
    brand: { background: 'var(--surface-brand-subtle)', borderColor: 'var(--orange-100)' },
    sunken: { background: 'var(--surface-sunken)', borderColor: 'var(--border-subtle)' },
    inverse: { background: 'var(--surface-inverse)', borderColor: 'var(--neutral-800)', color: 'var(--text-inverse)' },
  };
  return (
    <section
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        border: '1px solid', borderRadius: 'var(--radius-lg)',
        boxShadow: interactive && hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'box-shadow var(--duration-fast) var(--ease-standard)',
        cursor: interactive ? 'pointer' : undefined, overflow: 'hidden',
        ...tones[tone], ...style,
      }}
      {...rest}
    >
      {header && (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: `${padding - 6}px ${padding}px`, borderBottom: '1px solid var(--border-subtle)' }}>
          {header}
        </header>
      )}
      <div style={{ padding }}>{children}</div>
      {footer && (
        <footer style={{ padding: `${padding - 8}px ${padding}px`, borderTop: '1px solid var(--border-subtle)', background: tone === 'default' ? 'var(--neutral-25)' : 'transparent' }}>
          {footer}
        </footer>
      )}
    </section>
  );
}
