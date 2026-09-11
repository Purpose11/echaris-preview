import React from 'react';
import { IconButton } from '../core/IconButton.jsx';

export function Pagination({ page = 1, pageCount = 1, total, pageSize, onChange, style }) {
  const nums = [];
  const push = n => nums.push(n);
  if (pageCount <= 7) { for (let i = 1; i <= pageCount; i++) push(i); }
  else {
    push(1);
    if (page > 3) push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) push(i);
    if (page < pageCount - 2) push('…');
    push(pageCount);
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', ...style }}>
      {total != null && (
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
          Showing {(page - 1) * (pageSize || 10) + 1}–{Math.min(page * (pageSize || 10), total)} of {total.toLocaleString('en-NG')}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconButton icon="chevron-left" label="Previous page" size="sm" variant="secondary" disabled={page <= 1} onClick={() => onChange && onChange(page - 1)} />
        {nums.map((n, i) => n === '…' ? (
          <span key={'e' + i} style={{ width: 34, textAlign: 'center', color: 'var(--text-subtle)' }}>…</span>
        ) : (
          <button key={n} onClick={() => onChange && onChange(n)}
            style={{
              minWidth: 34, height: 34, padding: '0 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              border: '1px solid ' + (n === page ? 'var(--brand-primary)' : 'transparent'),
              background: n === page ? 'var(--orange-50)' : 'transparent',
              color: n === page ? 'var(--orange-700)' : 'var(--text-body)',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)',
              fontWeight: n === page ? 'var(--fw-bold)' : 'var(--fw-medium)',
            }}>{n}</button>
        ))}
        <IconButton icon="chevron-right" label="Next page" size="sm" variant="secondary" disabled={page >= pageCount} onClick={() => onChange && onChange(page + 1)} />
      </div>
    </div>
  );
}
