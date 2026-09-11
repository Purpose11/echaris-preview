import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function FormField({ label, htmlFor, hint, error, success, required, optional, children, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, ...style }} {...rest}>
      {label && (
        <label htmlFor={htmlFor} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)' }}>
          {label}
          {required && <span style={{ color: 'var(--danger-500)' }} aria-hidden="true">*</span>}
          {optional && <span style={{ color: 'var(--text-subtle)', fontWeight: 'var(--fw-regular)' }}>(optional)</span>}
        </label>
      )}
      {children}
      {error ? (
        <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 'var(--fs-caption)', color: 'var(--text-danger)' }}>
          <Icon name="circle-alert" size={14} style={{ marginTop: 1 }} />{error}
        </p>
      ) : success ? (
        <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 'var(--fs-caption)', color: 'var(--text-success)' }}>
          <Icon name="circle-check" size={14} style={{ marginTop: 1 }} />{success}
        </p>
      ) : hint ? (
        <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>{hint}</p>
      ) : null}
    </div>
  );
}
