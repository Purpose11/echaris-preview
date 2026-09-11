import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';

const tones = {
  info: ['var(--info-50)', 'var(--info-100)', 'var(--info-600)', 'info'],
  success: ['var(--success-50)', 'var(--success-100)', 'var(--success-600)', 'circle-check'],
  warning: ['var(--warning-50)', 'var(--amber-100)', 'var(--warning-600)', 'triangle-alert'],
  danger: ['var(--danger-50)', 'var(--danger-100)', 'var(--danger-600)', 'circle-alert'],
  brand: ['var(--orange-50)', 'var(--orange-100)', 'var(--orange-700)', 'megaphone'],
};

export function Alert({ tone = 'info', title, children, icon, action, onDismiss, style }) {
  const [bg, bd, fg, defIcon] = tones[tone] || tones.info;
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
      background: bg, border: `1px solid ${bd}`, borderRadius: 'var(--radius-md)', ...style,
    }}>
      <Icon name={icon || defIcon} size={18} style={{ color: fg, marginTop: 1 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {title && <strong style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-bold)', color: fg }}>{title}</strong>}
        {children && <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-body)' }}>{children}</div>}
        {action && <div style={{ marginTop: 8 }}>{action}</div>}
      </div>
      {onDismiss && <IconButton icon="x" label="Dismiss" size="sm" onClick={onDismiss} />}
    </div>
  );
}
