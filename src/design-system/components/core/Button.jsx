import React from 'react';
import { Icon } from './Icon.jsx';

const sizes = {
  sm: { height: 'var(--control-height-sm)', padding: '0 14px', font: 'var(--fs-body-sm)', gap: 6, icon: 16 },
  md: { height: 'var(--control-height-md)', padding: '0 20px', font: 'var(--fs-body)', gap: 8, icon: 18 },
  lg: { height: 'var(--control-height-lg)', padding: '0 28px', font: 'var(--fs-body-lg)', gap: 10, icon: 20 },
};

const variants = {
  primary: { background: 'var(--brand-primary)', color: 'var(--text-on-brand)', border: '1px solid var(--brand-primary)', boxShadow: 'var(--shadow-brand)' },
  secondary: { background: 'var(--surface-card)', color: 'var(--text-heading)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' },
  ghost: { background: 'transparent', color: 'var(--text-body)', border: '1px solid transparent', boxShadow: 'none' },
  danger: { background: 'var(--danger-500)', color: 'var(--text-inverse)', border: '1px solid var(--danger-500)', boxShadow: 'none' },
  inverse: { background: 'var(--neutral-0)', color: 'var(--neutral-900)', border: '1px solid var(--neutral-0)', boxShadow: 'none' },
};

const hovers = {
  primary: { background: 'var(--orange-600)', borderColor: 'var(--orange-600)' },
  secondary: { background: 'var(--neutral-100)', borderColor: 'var(--border-strong)' },
  ghost: { background: 'var(--neutral-100)' },
  danger: { background: 'var(--danger-600)', borderColor: 'var(--danger-600)' },
  inverse: { background: 'var(--neutral-100)', borderColor: 'var(--neutral-100)' },
};

export function Button({
  variant = 'primary', size = 'md', iconLeft, iconRight, fullWidth, disabled, loading,
  as = 'button', children, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const El = as;
  const inert = disabled || loading;

  const composed = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap,
    height: s.height, padding: s.padding, width: fullWidth ? '100%' : undefined,
    fontFamily: 'var(--font-sans)', fontSize: s.font, fontWeight: 'var(--fw-semibold)',
    lineHeight: 1, letterSpacing: '-0.005em', textDecoration: 'none', whiteSpace: 'nowrap',
    borderRadius: 'var(--radius-md)', cursor: inert ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-control)', ...v,
    ...(hover && !inert ? hovers[variant] : null),
    ...(press && !inert ? { transform: 'translateY(1px)', boxShadow: 'none', background: variant === 'primary' ? 'var(--brand-secondary)' : undefined } : null),
    ...(inert ? { background: 'var(--neutral-100)', color: 'var(--text-subtle)', borderColor: 'var(--border-subtle)', boxShadow: 'none' } : null),
    ...style,
  };

  return (
    <El
      disabled={El === 'button' ? inert : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={composed} {...rest}
    >
      {loading && <Icon name="loader-circle" size={s.icon} style={{ animation: 'echaris-spin 900ms linear infinite' }} />}
      {!loading && iconLeft && <Icon name={iconLeft} size={s.icon} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.icon} />}
    </El>
  );
}
