import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Select({ options = [], size = 'md', placeholder, invalid, disabled, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-height-sm)' : size === 'lg' ? 'var(--control-height-lg)' : 'var(--control-height-md)';
  const border = invalid ? 'var(--border-danger)' : focus ? 'var(--border-focus)' : 'var(--border-default)';
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', minWidth: 0, height: h,
      background: disabled ? 'var(--neutral-100)' : 'var(--surface-card)',
      border: `1px solid ${border}`, borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--focus-ring)' : 'none', transition: 'var(--transition-control)', ...style,
    }}>
      <select
        disabled={disabled} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          appearance: 'none', width: '100%', height: '100%', padding: '0 38px 0 14px',
          border: 'none', outline: 'none', background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-sans)', fontSize: size === 'sm' ? 'var(--fs-body-sm)' : 'var(--fs-body)',
          color: 'var(--text-heading)',
        }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
      </select>
      <Icon name="chevron-down" size={16} style={{ position: 'absolute', right: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
    </div>
  );
}
