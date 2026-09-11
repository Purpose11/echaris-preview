import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../design-system/components/core/Card.jsx';
import { Button } from '../design-system/components/core/Button.jsx';
import { Logo } from '../design-system/components/core/Logo.jsx';
import { FormField } from '../design-system/components/forms/FormField.jsx';
import { Input } from '../design-system/components/forms/Input.jsx';
import { Alert } from '../design-system/components/feedback/Alert.jsx';
import { Icon } from '../design-system/components/core/Icon.jsx';
import logoOrange from '../assets/echaris-logo-orange.png';
import logoWhite from '../assets/echaris-logo-white.png';

const EMAIL = 'adaeze@example.com';
const emailOk = v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());

function TrustPanel() {
  const items = [
    ['lock', 'Secure reset link', 'The reset link is sent only to the email address on your client account and expires after 30 minutes.'],
    ['shield-check', 'One-time use', 'Each link works once. Requesting a new link cancels the previous one.'],
    ['bell', 'Account alerts', 'You receive an email whenever your password is changed.'],
  ];
  return (
    <aside className="panel">
      <Logo variant="white" height={26} src={logoWhite} style={{ alignSelf: 'flex-start' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span className="micro">Account recovery</span>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-h1)', fontWeight: 'var(--fw-extrabold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: '#fff', maxWidth: 440 }}>Reset your password and get back to your client account securely.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,.12)' }}>
          {items.map(([icon, t, d]) => (
            <div className="trust" key={t}>
              <Icon name={icon} size={20} style={{ color: 'var(--brand-primary)', marginTop: 2, flex: 'none' }} />
              <div><div className="trust-t">{t}</div><div className="trust-d">{d}</div></div>
            </div>
          ))}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,.45)' }}>Echaris Trading Limited · CAC registered · RC 9450649</p>
    </aside>
  );
}

const H1 = { margin: 0, fontSize: 'var(--fs-h1)', fontWeight: 'var(--fw-extrabold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: 'var(--text-heading)' };
const SUB = { margin: 0, fontSize: 'var(--fs-body)', color: 'var(--text-muted)', lineHeight: 1.55 };
const RING = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 'var(--radius-pill)' };

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [view, setView] = React.useState('request');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState({ next: '', confirm: '' });
  const [show, setShow] = React.useState(false);
  const [err, setErr] = React.useState({});
  const [formError, setFormError] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const timer = React.useRef(null);

  const preset = key => {
    clearTimeout(timer.current);
    setErr({}); setFormError(null); setBusy(false); setShow(false);
    if (key === 'sent') { setView('sent'); setEmail(EMAIL); }
  };

  const request = e => {
    e.preventDefault();
    const n = {};
    if (!email.trim()) n.email = 'Enter the email address on your client account.';
    else if (!emailOk(email)) n.email = 'That email address is not complete. Check for a missing domain, for example .com.';
    setErr(n);
    if (Object.keys(n).length) return;
    setBusy(true);
    timer.current = setTimeout(() => { setBusy(false); setView('sent'); }, 1400);
  };

  const reset = e => {
    e.preventDefault();
    const n = {};
    if (!pw.next) n.next = 'Enter a new password.';
    else if (pw.next.length < 8) n.next = 'Use at least 8 characters.';
    if (!pw.confirm) n.confirm = 'Repeat your new password.';
    else if (pw.next && pw.confirm !== pw.next) n.confirm = 'The two passwords do not match. Enter the same password in both fields.';
    setErr(n); setFormError(null);
    if (Object.keys(n).length) return;
    setBusy(true);
    timer.current = setTimeout(() => { setBusy(false); setView('done'); }, 1400);
  };

  const eye = (
    <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}
      style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
      <Icon name={show ? 'eye-off' : 'eye'} size={18} />
    </button>
  );

  return (
    <div className="auth">
      <TrustPanel />
      <main className="main">
        <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ alignSelf: 'flex-start' }}><Logo height={26} src={logoOrange} /></a>
        <div style={{ width: '100%', maxWidth: 452, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {view === 'request' && (
            <React.Fragment>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h1 style={H1}>Reset your password</h1>
                <p style={SUB}>Enter the email address on your client account and we send you a link to set a new password.</p>
              </div>
              <Card padding={28}>
                <form onSubmit={request} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <FormField label="Email address" htmlFor="email" error={err.email}>
                    <Input id="email" type="email" inputMode="email" autoComplete="email" iconLeft="mail" placeholder="Enter your email address"
                      invalid={!!err.email} value={email} onChange={e => { setEmail(e.target.value); setErr({}); }} />
                  </FormField>
                  <Button type="submit" fullWidth size="lg" loading={busy}>{busy ? 'Sending reset link' : 'Send reset link'}</Button>
                </form>
              </Card>
              <p style={{ margin: 0, textAlign: 'center', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>
                Remembered it? <a href="/login" onClick={e => { e.preventDefault(); navigate('/login'); }} style={{ fontWeight: 'var(--fw-semibold)' }}>Back to log in</a>
              </p>
            </React.Fragment>
          )}

          {view === 'sent' && (
            <Card padding={28}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
                <span style={{ ...RING, background: 'var(--surface-brand-subtle)', color: 'var(--text-brand)' }}><Icon name="mail" size={22} /></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h1 style={{ ...H1, fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-bold)' }}>Password Reset Link Sent</h1>
                  <p style={SUB}>We sent a password reset link to {email || EMAIL}.</p>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--fs-caption)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  No email after a few minutes? Check your spam folder, or <a href="#" onClick={e => { e.preventDefault(); preset('sent'); }} style={{ fontWeight: 'var(--fw-semibold)' }}>send the link again</a>.
                </p>
              </div>
            </Card>
          )}

          {view === 'reset' && (
            <React.Fragment>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h1 style={H1}>Set a new password</h1>
                <p style={SUB}>Choose a password you have not used on your client account before.</p>
              </div>
              <Card padding={28}>
                <form onSubmit={reset} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {formError && <Alert tone="danger" title="Link no longer valid">{formError}</Alert>}
                  <FormField label="New password" htmlFor="next" error={err.next} hint={!err.next ? 'At least 8 characters, with one number and one uppercase letter.' : undefined}>
                    <Input id="next" type={show ? 'text' : 'password'} autoComplete="new-password" iconLeft="lock" placeholder="At least 8 characters" suffix={eye}
                      invalid={!!err.next} value={pw.next} onChange={e => { setPw(p => ({ ...p, next: e.target.value })); setErr(p => ({ ...p, next: undefined })); }} />
                  </FormField>
                  <FormField label="Confirm new password" htmlFor="confirm" error={err.confirm}>
                    <Input id="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" iconLeft="lock" placeholder="Repeat the new password"
                      invalid={!!err.confirm} value={pw.confirm} onChange={e => { setPw(p => ({ ...p, confirm: e.target.value })); setErr(p => ({ ...p, confirm: undefined })); }} />
                  </FormField>
                  {formError
                    ? <Button fullWidth size="lg" onClick={() => preset('request')}>Request a new link</Button>
                    : <Button type="submit" fullWidth size="lg" loading={busy}>{busy ? 'Saving new password' : 'Save new password'}</Button>}
                </form>
              </Card>
            </React.Fragment>
          )}

          {view === 'done' && (
            <Card padding={28}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
                <span style={{ ...RING, background: 'var(--success-50)', color: 'var(--text-success)' }}><Icon name="circle-check" size={22} /></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h1 style={{ ...H1, fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-bold)' }}>Password updated</h1>
                  <p style={SUB}>Your password has been changed. A confirmation email is on its way to {email || EMAIL}.</p>
                </div>
                <Button fullWidth size="lg" onClick={() => navigate('/login')} iconRight="arrow-right">Log in</Button>
              </div>
            </Card>
          )}

        </div>
        <footer style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 20, fontSize: 'var(--fs-caption)', color: 'var(--text-subtle)' }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--text-muted)' }}>Terms &amp; conditions</a>
          <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--text-muted)' }}>Privacy policy</a>
          <a href="/contact" onClick={e => { e.preventDefault(); navigate('/contact'); }} style={{ color: 'var(--text-muted)' }}>Contact support</a>
          <span>© 2026 Echaris Trading Limited</span>
        </footer>
      </main>
    </div>
  );
}
