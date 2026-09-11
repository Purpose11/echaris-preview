import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Checkbox({ label, description, checked, disabled, onChange, style, ...rest }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} {...rest} />
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
        width: 20, height: 20, marginTop: 1, borderRadius: 'var(--radius-xs)',
        border: '1px solid ' + (checked ? 'var(--brand-primary)' : 'var(--border-default)'),
        background: disabled ? 'var(--neutral-100)' : checked ? 'var(--brand-primary)' : 'var(--surface-card)',
        color: 'var(--text-on-brand)', transition: 'var(--transition-control)',
      }}>
        {checked && <Icon name="check" size={14} />}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {label && <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-medium)', color: disabled ? 'var(--text-subtle)' : 'var(--text-heading)' }}>{label}</span>}
        {description && <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>{description}</span>}
      </span>
    </label>
  );
}
