import React from 'react';

export function Avatar({ name = '', src, size = 40, tone = 'brand', style, ...rest }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  const palette = tone === 'brand'
    ? { background: 'var(--orange-100)', color: 'var(--orange-800)' }
    : { background: 'var(--neutral-200)', color: 'var(--neutral-700)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: 'var(--radius-pill)', overflow: 'hidden',
      fontSize: Math.round(size * 0.36), fontWeight: 'var(--fw-bold)', letterSpacing: '0.01em',
      flex: 'none', ...palette, ...style,
    }} {...rest}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </span>
  );
}
