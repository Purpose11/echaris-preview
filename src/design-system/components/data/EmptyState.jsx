import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function EmptyState({ icon = 'inbox', title, description, action, compact, style }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: 10, padding: compact ? '32px 24px' : '56px 24px', ...style,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52,
        borderRadius: 'var(--radius-lg)', background: 'var(--neutral-100)', color: 'var(--text-muted)', marginBottom: 4,
      }}><Icon name={icon} size={24} /></span>
      {title && <h4 style={{ fontSize: 'var(--fs-h4)', fontWeight: 'var(--fw-bold)' }}>{title}</h4>}
      {description && <p style={{ maxWidth: 380, fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>{description}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
