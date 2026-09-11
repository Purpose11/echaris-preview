import React from 'react';
import { Icon } from './Icon.jsx';

const tones = {
  neutral: ['var(--neutral-100)', 'var(--text-body)', 'var(--border-subtle)'],
  brand: ['var(--orange-50)', 'var(--orange-700)', 'var(--orange-100)'],
  success: ['var(--success-50)', 'var(--success-600)', 'var(--success-100)'],
  warning: ['var(--warning-50)', 'var(--warning-600)', 'var(--amber-100)'],
  danger: ['var(--danger-50)', 'var(--danger-600)', 'var(--danger-100)'],
  info: ['var(--info-50)', 'var(--info-600)', 'var(--info-100)'],
};

export function Badge({ tone = 'neutral', icon, dot, size = 'md', children, style, ...rest }) {
  const [bg, fg, bd] = tones[tone] || tones.neutral;
  const sm = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: sm ? 5 : 6,
      height: sm ? 22 : 26, padding: sm ? '0 8px' : '0 10px',
      background: bg, color: fg, border: `1px solid ${bd}`,
      borderRadius: 'var(--radius-pill)', fontSize: sm ? 'var(--fs-micro)' : 'var(--fs-caption)',
      fontWeight: 'var(--fw-semibold)', lineHeight: 1, whiteSpace: 'nowrap', ...style,
    }} {...rest}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
      {icon && <Icon name={icon} size={sm ? 12 : 14} />}
      {children}
    </span>
  );
}
