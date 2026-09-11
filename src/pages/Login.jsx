import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../design-system/components/core/Card.jsx';
import { Button } from '../design-system/components/core/Button.jsx';
import { Logo } from '../design-system/components/core/Logo.jsx';
import { FormField } from '../design-system/components/forms/FormField.jsx';
import { Input } from '../design-system/components/forms/Input.jsx';
import { Checkbox } from '../design-system/components/forms/Checkbox.jsx';
import { Alert } from '../design-system/components/feedback/Alert.jsx';
import { Icon } from '../design-system/components/core/Icon.jsx';
import logoOrange from '../assets/echaris-logo-orange.png';
import logoWhite from '../assets/echaris-logo-white.png';

const ACCOUNT = { email: 'adaeze@example.com', password: 'echaris2026' };
const emailOk = v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());

function TrustPanel() {
  const items = [
    ['lock', 'Secure connection', 'Your account information is protected with advanced security encryption to keep your data safe.'],
    ['shield-check', 'Identity verification', 'Complete identity verification to help maintain a secure and trusted platform.'],
    ['bell', 'Login alerts', 'Receive email notifications whenever your account is accessed from a new device.'],
  ];
  return (
    <aside className="panel">
      <Logo variant="white" height={26} src={logoWhite} style={{ alignSelf: 'flex-start' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span className="micro">ECharis client portal</span>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-h1)', fontWeight: 'var(--fw-extrabold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: '#fff', maxWidth: 440 }}>Manage your capital, track performance returns, and access marketplace financing from one secure platform.</h2>
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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [formError, setFormError] = React.useState(null);
  const [status, setStatus] = React.useState('idle');
  const timer = React.useRef(null);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!emailOk(email)) next.email = 'That email address is not complete. Check for a missing domain, for example .com.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next); setFormError(null);
    if (Object.keys(next).length) return;
    setStatus('loading');
    timer.current = setTimeout(() => {
      if (email.trim().toLowerCase() === ACCOUNT.email && password === ACCOUNT.password) setStatus('success');
      else { setStatus('idle'); setFormError('Email address and password do not match. Check your password or reset it below.'); }
    }, 1400);
  };

  const eyeToggle = (
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
          {status === 'success' ? (
            <Card padding={28}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 'var(--radius-pill)', background: 'var(--success-50)', color: 'var(--text-success)' }}><Icon name="circle-check" size={22} /></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h1 style={{ margin: 0, fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>You are logged in</h1>
                  <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>Taking you to your dashboard. Signed in as {ACCOUNT.email}.</p>
                </div>
                <Button fullWidth size="lg" iconRight="arrow-right" onClick={() => navigate('/')}>Go to dashboard</Button>
              </div>
            </Card>
          ) : (
            <React.Fragment>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: 'var(--fs-h1)', fontWeight: 'var(--fw-extrabold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: 'var(--text-heading)' }}>Welcome back</h1>
                <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>Log in to view your capital, returns and wallet balance.</p>
              </div>
              <Card padding={28}>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {formError && <Alert tone="danger" title="Log in failed">{formError}</Alert>}
                  <FormField label="Email address" htmlFor="email" error={errors.email}>
                    <Input id="email" type="email" inputMode="email" autoComplete="email" iconLeft="mail" placeholder="Enter your email address"
                      invalid={!!errors.email} value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }} />
                  </FormField>
                  <FormField label="Password" htmlFor="password" error={errors.password}>
                    <Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" iconLeft="lock" placeholder="Enter your password"
                      suffix={eyeToggle} invalid={!!errors.password} value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }} />
                  </FormField>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <Checkbox label="Keep me logged in" />
                    <a href="/forgot-password" onClick={e => { e.preventDefault(); navigate('/forgot-password'); }} style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-semibold)' }}>Forgot password?</a>
                  </div>
                  <Button type="submit" fullWidth size="lg" loading={status === 'loading'}>{status === 'loading' ? 'Logging in' : 'Log in'}</Button>
                </form>
              </Card>
              <p style={{ margin: 0, textAlign: 'center', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>New to Echaris? <a href="/register" onClick={e => { e.preventDefault(); navigate('/register'); }} style={{ fontWeight: 'var(--fw-semibold)' }}>Create an account</a></p>
            </React.Fragment>
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
