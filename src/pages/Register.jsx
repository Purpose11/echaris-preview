import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../design-system/components/core/Card.jsx';
import { Button } from '../design-system/components/core/Button.jsx';
import { Logo } from '../design-system/components/core/Logo.jsx';
import { FormField } from '../design-system/components/forms/FormField.jsx';
import { Input } from '../design-system/components/forms/Input.jsx';
import { Select } from '../design-system/components/forms/Select.jsx';
import { Checkbox } from '../design-system/components/forms/Checkbox.jsx';
import { Alert } from '../design-system/components/feedback/Alert.jsx';
import { Icon } from '../design-system/components/core/Icon.jsx';
import { Badge } from '../design-system/components/core/Badge.jsx';
import logoOrange from '../assets/echaris-logo-orange.png';
import logoWhite from '../assets/echaris-logo-white.png';

const BENEFITS = [
  ['lock', 'Secure Account Management', 'Your information is protected with modern security practices.'],
  ['trending-up', 'Track Your Performance', 'Monitor your capital activities and monthly returns.'],
  ['store', 'Marketplace Access', 'Explore products and financing opportunities available on the platform.'],
];
const DIALS = [
  { value: '+234', label: '+234 NG' }, { value: '+233', label: '+233 GH' },
  { value: '+254', label: '+254 KE' }, { value: '+27', label: '+27 ZA' },
  { value: '+44', label: '+44 UK' }, { value: '+1', label: '+1 US' },
];
const TAKEN = 'chidi@example.com';
const emailOk = v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());
const score = p => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++; if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(4, s);
};
const STRENGTH = [
  ['', 'var(--neutral-200)', 'var(--text-muted)'],
  ['Weak', 'var(--danger-500)', 'var(--text-danger)'],
  ['Fair', 'var(--brand-accent)', 'var(--text-brand)'],
  ['Good', 'var(--brand-primary)', 'var(--text-brand)'],
  ['Strong', 'var(--success-500)', 'var(--text-success)'],
];
const BLANK = { first: '', last: '', email: '', dial: '+234', phone: '', password: '' , ref: '' };

function Panel() {
  return (
    <aside className="panel">
      <Logo variant="white" height={26} src={logoWhite} style={{ alignSelf: 'flex-start' }} className="anim-in anim-in-1" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
        <div className="anim-in anim-in-2" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-h1)', fontWeight: 'var(--fw-extrabold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: '#fff', maxWidth: 400 }}>Start your journey with ECharis</h2>
          <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'rgba(255,255,255,.66)', lineHeight: 1.6, maxWidth: 420 }}>Create your account and access a secure platform designed to help you manage capital commitments, track performance returns, and explore marketplace opportunities.</p>
        </div>
        <div className="benefits anim-in anim-in-3">
          {BENEFITS.map(([icon, t, d]) => (
            <div className="benefit" key={t}>
              <Icon name={icon} size={20} style={{ color: 'var(--brand-primary)', marginTop: 2, flex: 'none' }} />
              <div><div className="benefit-t">{t}</div><div className="benefit-d">{d}</div></div>
            </div>
          ))}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,.45)' }}>Echaris Trading Limited · CAC registered · RC 9450649</p>
    </aside>
  );
}

function Heading({ eyebrow, title, sub }) {
  return (
    <div className="anim-in anim-in-1" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="micro" style={{ color: 'var(--text-muted)' }}>{eyebrow}</span>
      <h1 style={{ margin: 0, fontSize: 'var(--fs-h1)', fontWeight: 'var(--fw-extrabold)', letterSpacing: 'var(--ls-display)', lineHeight: 'var(--lh-tight)', color: 'var(--text-heading)' }}>{title}</h1>
      <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--text-muted)', maxWidth: 460 }}>{sub}</p>
    </div>
  );
}

function StatusCard({ tone, icon, title, body, children }) {
  const ring = { brand: ['var(--orange-50)', 'var(--text-brand)'], success: ['var(--success-50)', 'var(--text-success)'], danger: ['var(--danger-50)', 'var(--text-danger)'] }[tone];
  return (
    <Card padding={28} className="anim-in anim-in-2">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 'var(--radius-pill)', background: ring[0], color: ring[1] }}>
          {icon === 'spinner' ? <span className="spin" /> : <Icon name={icon} size={26} />}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-display)', color: 'var(--text-heading)' }}>{title}</h2>
          <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--text-muted)', lineHeight: 1.55 }}>{body}</p>
        </div>
        {children}
      </div>
    </Card>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [view, setView] = React.useState('form'); // form | sending | sent | verified
  const [f, setF] = React.useState(BLANK);
  const [show, setShow] = React.useState(false);
  const [err, setErr] = React.useState({});
  const [formError, setFormError] = React.useState(null);
  const [terms, setTerms] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const timer = React.useRef(null);
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setErr(p => ({ ...p, [k]: undefined })); setFormError(null); };
  const sc = score(f.password);

  const submit = e => {
    e.preventDefault();
    const n = {};
    if (!f.first.trim()) n.first = 'Enter your first name.';
    if (!f.last.trim()) n.last = 'Enter your last name.';
    if (!f.email.trim()) n.email = 'Enter your email address.';
    else if (!emailOk(f.email)) n.email = 'That email address is not complete. Check for a missing domain, for example .com.';
    if (!f.phone.trim()) n.phone = 'Enter your phone number.';
    else if (f.phone.replace(/\D/g, '').length < 9) n.phone = 'That phone number is too short. Enter it without the leading zero.';
    if (!f.password) n.password = 'Create a password.';
    else if (sc < 2) n.password = 'Use at least 8 characters with a mix of upper and lower case, a number and a symbol.';
    if (!terms) n.terms = 'Accept the terms and privacy policy to continue.';
    setErr(n); setFormError(null);
    if (Object.keys(n).length) return;
    setView('sending');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (f.email.trim().toLowerCase() === TAKEN) { setView('form'); setFormError('An account already exists for ' + TAKEN + '. Log in instead, or reset the password on that account.'); }
      else { setResent(false); setView('sent'); }
    }, 1600);
  };

  const eye = (
    <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}
      style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
      <Icon name={show ? 'eye-off' : 'eye'} size={18} />
    </button>
  );

  let body;
  if (view === 'form' || view === 'sending') body = (
    <React.Fragment>
      <Heading eyebrow="Create account" title="Create your account" sub="Join ECharis and start managing your financial activities from one secure platform." />
      <Card padding={28} className="anim-in anim-in-2">
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {formError && <Alert tone="danger" title="Account not created">{formError}</Alert>}
          <div className="grid2">
            <FormField label="First name" htmlFor="first" error={err.first}>
              <Input id="first" autoComplete="given-name" iconLeft="user" placeholder="Enter your first name" invalid={!!err.first} value={f.first} onChange={e => set('first', e.target.value)} />
            </FormField>
            <FormField label="Last name" htmlFor="last" error={err.last}>
              <Input id="last" autoComplete="family-name" placeholder="Enter your last name" invalid={!!err.last} value={f.last} onChange={e => set('last', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Email address" htmlFor="email" error={err.email} hint={!err.email ? 'Your verification link, statements and payout notices are sent here.' : undefined}>
            <Input id="email" type="email" inputMode="email" autoComplete="email" iconLeft="mail" placeholder="you@example.com" invalid={!!err.email} value={f.email} onChange={e => set('email', e.target.value)} />
          </FormField>
          <FormField label="Phone number" htmlFor="phone" error={err.phone}>
            <div className="phone">
              <Select aria-label="Country code" options={DIALS} value={f.dial} onChange={e => set('dial', e.target.value)} />
              <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="803 000 0000" invalid={!!err.phone} value={f.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </FormField>
          <FormField label="Referral code (optional)" htmlFor="ref">
            <Input id="ref" iconLeft="users" placeholder="e.g. ECH-ADAEZE24" value={f.ref} onChange={e => set('ref', e.target.value)} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={err.password}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Input id="password" type={show ? 'text' : 'password'} autoComplete="new-password" iconLeft="lock" placeholder="At least 8 characters" suffix={eye} invalid={!!err.password} value={f.password} onChange={e => set('password', e.target.value)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="strength">{[1, 2, 3, 4].map(i => <span key={i} style={{ background: i <= sc ? STRENGTH[sc][1] : 'var(--neutral-200)' }} />)}</div>
                <span style={{ fontSize: 'var(--fs-caption)', color: sc ? STRENGTH[sc][2] : 'var(--text-muted)' }}>{sc ? 'Password strength: ' + STRENGTH[sc][0] : 'Mix upper and lower case, a number and a symbol.'}</span>
              </div>
            </div>
          </FormField>
          <FormField error={err.terms}>
            <Checkbox checked={terms} onChange={e => { setTerms(e.target.checked); setErr(p => ({ ...p, terms: undefined })); }}
              label="I accept the terms and conditions and the privacy policy" description="Includes the client agreement covering capital commitments and performance returns." />
          </FormField>
          <Button type="submit" fullWidth size="lg" loading={view === 'sending'}>{view === 'sending' ? 'Creating your account' : 'Create account'}</Button>
        </form>
      </Card>
      <p className="anim-in anim-in-3" style={{ margin: 0, textAlign: 'center', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>Already have an account? <a href="/login" onClick={e => { e.preventDefault(); navigate('/login'); }} style={{ fontWeight: 'var(--fw-semibold)' }}>Login</a></p>
    </React.Fragment>
  );

  else if (view === 'sent') body = (
    <React.Fragment>
      <Heading eyebrow="Confirm your email" title="Confirm your email address" sub="Your client account is created. Confirming your email activates it." />
      <StatusCard tone="brand" icon="mail-check" title="Check your inbox" body="We sent a verification link to the address below. The link is valid for 30 minutes.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-subtle)', border: '1px solid var(--orange-100)' }}>
          <Icon name="mail" size={18} style={{ color: 'var(--text-brand)', flex: 'none' }} />
          <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)', wordBreak: 'break-all' }}>{f.email}</span>
        </div>
        {resent && <Alert tone="success">A new verification link is on its way to {f.email}. Older links no longer work.</Alert>}
        <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>Nothing in your inbox after a few minutes? Check your spam folder, then send the link again.</p>
        <Button variant="secondary" iconLeft="refresh-cw" onClick={() => setResent(true)} disabled={resent}>{resent ? 'Link sent' : 'Resend verification link'}</Button>
      </StatusCard>
    </React.Fragment>
  );

  else body = (
    <React.Fragment>
      <Heading eyebrow="Account ready" title="Account created successfully" sub="Your email is confirmed and your client account is open." />
      <StatusCard tone="success" icon="circle-check" title={'Welcome to Echaris, ' + f.first + '.'} body="You can explore the growth programs and the marketplace now. Identity verification is required before your first capital commitment and takes a few minutes.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', padding: '18px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div><div className="micro">Client reference</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-heading)', marginTop: 4 }}>CLT-40219</div></div>
          <div><div className="micro">Email</div><div style={{ marginTop: 4 }}><Badge tone="success" icon="check">Confirmed</Badge></div></div>
          <div><div className="micro">Opened</div><div style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)', marginTop: 4 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div></div>
          <div><div className="micro">Identity</div><div style={{ marginTop: 4 }}><Badge tone="warning">Not verified</Badge></div></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <Button fullWidth size="lg" iconRight="arrow-right" onClick={() => navigate('/verify')}>Verify your identity</Button>
          <Button fullWidth size="lg" variant="ghost" onClick={() => navigate('/')}>Complete identity verification later</Button>
        </div>
      </StatusCard>
    </React.Fragment>
  );

  return (
    <div className="auth auth--wide">
      <Panel />
      <main className="main">
        <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ alignSelf: 'flex-start' }}><Logo height={26} src={logoOrange} /></a>
        <div className="col">{body}</div>
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
