import React from 'react';

export function Textarea({ rows = 4, invalid, disabled, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const border = invalid ? 'var(--border-danger)' : focus ? 'var(--border-focus)' : 'var(--border-default)';
  return (
    <textarea
      rows={rows} disabled={disabled}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        width: '100%', padding: '12px 14px', resize: 'vertical',
        background: disabled ? 'var(--neutral-100)' : 'var(--surface-card)',
        border: `1px solid ${border}`, borderRadius: 'var(--radius-md)',
        boxShadow: focus ? 'var(--focus-ring)' : 'none', outline: 'none',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-normal)',
        color: 'var(--text-heading)', transition: 'var(--transition-control)', ...style,
      }}
      {...rest}
    />
  );
}
