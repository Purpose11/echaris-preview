import React from 'react';

export function Radio({ label, description, checked, disabled, onChange, name, value, style, ...rest }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={onChange}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} {...rest} />
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
        width: 20, height: 20, marginTop: 1, borderRadius: '50%',
        border: '1.5px solid ' + (checked ? 'var(--brand-primary)' : 'var(--border-default)'),
        background: disabled ? 'var(--neutral-100)' : 'var(--surface-card)',
        transition: 'var(--transition-control)',
      }}>
        {checked && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--brand-primary)' }} />}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {label && <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-medium)', color: disabled ? 'var(--text-subtle)' : 'var(--text-heading)' }}>{label}</span>}
        {description && <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>{description}</span>}
      </span>
    </label>
  );
}
