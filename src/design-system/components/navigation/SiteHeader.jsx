import React from 'react';
import { Logo } from '../core/Logo.jsx';
import { Button } from '../core/Button.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { Icon } from '../core/Icon.jsx';
import { useTheme } from '../../../hooks/useTheme.js';

export function SiteHeader({ links = [], activeHref, onNavigate, onLogin, onRegister, logoSrc, style }) {
  const [open, setOpen] = React.useState(false);
  const [theme, toggleTheme] = useTheme();

  React.useEffect(() => {
    if (!open) return;
    // Block the scroll gesture itself instead of touching overflow/position on
    // <html>/<body>. Either of those approaches changes a layout-affecting CSS
    // property on an ancestor of the sticky header, which can make the browser
    // recompute (and reset) the header's "stuck" offset independently of the
    // position:fixed panel — the panel doesn't move, the header does, and they
    // visually disconnect. Intercepting wheel/touch/key events at the document
    // level prevents scrolling with zero effect on layout, so nothing about the
    // header's sticky state can be disturbed while the menu is open.
    const allow = e => e.target.closest && e.target.closest('.sh-mobile-panel');
    const preventScroll = e => { if (!allow(e)) e.preventDefault(); };
    const preventKeyScroll = e => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key) && !allow(e)) e.preventDefault();
    };
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('keydown', preventKeyScroll, { passive: false });
    return () => {
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('keydown', preventKeyScroll);
    };
  }, [open]);

  const navigate = (href) => {
    setOpen(false);
    onNavigate && onNavigate(href);
  };

  return (
    <>
    <header className="sh-header" style={{
      position: 'sticky', top: 0, zIndex: 40,
      backdropFilter: 'blur(var(--blur-glass))', WebkitBackdropFilter: 'blur(var(--blur-glass))',
      borderBottom: '1px solid var(--border-subtle)', ...style,
    }}>
      <div className="sh-bar" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 32, maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--gutter-desktop)', height: 76 }}>
        <a href="#" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ display: 'flex' }}><Logo height={30} src={logoSrc} /></a>

        <nav className="sh-links" style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          {links.map(l => (
            <a key={l.href} href={l.href}
              onClick={e => { e.preventDefault(); navigate(l.href); }}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-md)', textDecoration: 'none',
                fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-semibold)',
                color: l.href === activeHref ? 'var(--text-brand)' : 'var(--text-body)',
                background: l.href === activeHref ? 'var(--surface-brand-subtle)' : 'transparent',
                whiteSpace: 'nowrap',
              }}>{l.label}</a>
          ))}
        </nav>

        <div className="sh-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
          <Button variant="ghost" size="sm" onClick={onLogin}>Log in</Button>
          <Button variant="primary" size="sm" onClick={onRegister}>Get started</Button>
        </div>

        <div className="sh-toggle-wrap" style={{ marginLeft: 'auto', alignItems: 'center', gap: 8 }}>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
          <IconButton
            icon={open ? 'x' : 'menu'}
            label={open ? 'Close menu' : 'Open menu'}
            variant="ghost"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
          />
        </div>
      </div>
    </header>

    {open && (
      <div className="sh-mobile-panel">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(l => (
            <a key={l.href} href={l.href}
              onClick={e => { e.preventDefault(); navigate(l.href); }}
              style={{
                padding: '13px 16px', borderRadius: 'var(--radius-md)', textDecoration: 'none',
                fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-semibold)',
                color: l.href === activeHref ? 'var(--text-brand)' : 'var(--text-body)',
                background: l.href === activeHref ? 'var(--surface-brand-subtle)' : 'transparent',
              }}>{l.label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="secondary" size="md" fullWidth onClick={() => { setOpen(false); onLogin && onLogin(); }}>Log in</Button>
          <Button variant="primary" size="md" fullWidth onClick={() => { setOpen(false); onRegister && onRegister(); }}>Get started</Button>
        </div>
      </div>
    )}
    </>
  );
}
