import React from 'react';

export function ProgressMeter({ value = 0, max = 100, label, valueLabel, milestone, milestoneLabel, tone = 'brand', size = 'md', style }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const mPct = milestone != null ? Math.max(0, Math.min(100, (milestone / max) * 100)) : null;
  const h = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;
  const fill = tone === 'success' ? 'var(--success-500)' : tone === 'accent' ? 'var(--brand-accent)' : 'linear-gradient(90deg,#FF5A00,#FFB800)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {(label || valueLabel) && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          {label && <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-medium)', color: 'var(--text-body)' }}>{label}</span>}
          {valueLabel && <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)', fontVariantNumeric: 'tabular-nums' }}>{valueLabel}</span>}
        </div>
      )}
      <div role="progressbar" aria-valuenow={value} aria-valuemax={max} style={{ position: 'relative', height: h, borderRadius: 'var(--radius-pill)', background: 'var(--neutral-200)', overflow: 'visible' }}>
        <div style={{ width: pct + '%', height: '100%', borderRadius: 'var(--radius-pill)', background: fill, transition: 'width var(--duration-slow) var(--ease-out)' }} />
        {mPct != null && (
          <span style={{ position: 'absolute', top: -3, left: mPct + '%', width: 2, height: h + 6, background: 'var(--neutral-900)', borderRadius: 1 }} />
        )}
      </div>
      {milestoneLabel && <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>{milestoneLabel}</span>}
    </div>
  );
}
