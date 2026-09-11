import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function FileUpload({ label = 'Upload a document', hint = 'PNG, JPG or PDF, up to 5 MB', fileName, onFileChange, invalid, style, ...rest }) {
  const [over, setOver] = React.useState(false);
  return (
    <label
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onFileChange && onFileChange(e.dataTransfer.files[0]); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', cursor: 'pointer',
        border: '1.5px dashed ' + (invalid ? 'var(--border-danger)' : over ? 'var(--brand-primary)' : 'var(--border-default)'),
        borderRadius: 'var(--radius-md)', background: over ? 'var(--orange-50)' : 'var(--neutral-25)',
        transition: 'var(--transition-control)', ...style,
      }}
    >
      <input type="file" style={{ display: 'none' }} onChange={e => onFileChange && onFileChange(e.target.files[0])} {...rest} />
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40,
        borderRadius: 'var(--radius-md)', background: 'var(--orange-50)', color: 'var(--orange-700)', flex: 'none',
      }}>
        <Icon name={fileName ? 'file-check' : 'upload'} size={20} />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName || label}</span>
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>{fileName ? 'Click to replace' : hint}</span>
      </span>
    </label>
  );
}
