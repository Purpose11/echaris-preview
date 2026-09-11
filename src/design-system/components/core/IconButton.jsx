import React from 'react';
import { Icon } from './Icon.jsx';

const sizes = { sm: 34, md: 42, lg: 50 };
const glyph = { sm: 16, md: 20, lg: 22 };

export function IconButton({ icon, label, variant = 'ghost', size = 'md', disabled, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const box = sizes[size] || sizes.md;
  const base = variant === 'primary'
    ? { background: 'var(--brand-primary)', color: 'var(--text-on-brand)', border: '1px solid var(--brand-primary)' }
    : variant === 'secondary'
    ? { background: 'var(--surface-card)', color: 'var(--text-body)', border: '1px solid var(--border-default)' }
    : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid transparent' };
  const hov = variant === 'primary' ? { background: 'var(--orange-600)' } : { background: 'var(--neutral-100)', color: 'var(--text-heading)' };
  return (
    <button
      type="button" aria-label={label} title={label} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: box, height: box, borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'var(--transition-control)',
        ...base, ...(hover && !disabled ? hov : null),
        ...(disabled ? { background: 'var(--neutral-100)', color: 'var(--text-subtle)', borderColor: 'var(--border-subtle)' } : null),
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={glyph[size] || 20} />
    </button>
  );
}
