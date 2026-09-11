import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../design-system/components/core/Card.jsx';
import { Button } from '../design-system/components/core/Button.jsx';
import { Logo } from '../design-system/components/core/Logo.jsx';
import { FormField } from '../design-system/components/forms/FormField.jsx';
import { Input } from '../design-system/components/forms/Input.jsx';
import { Select } from '../design-system/components/forms/Select.jsx';
import { Icon } from '../design-system/components/core/Icon.jsx';
import { Badge } from '../design-system/components/core/Badge.jsx';
import { ProgressMeter } from '../design-system/components/data/ProgressMeter.jsx';
import { Radio } from '../design-system/components/forms/Radio.jsx';
import { FileUpload } from '../design-system/components/forms/FileUpload.jsx';
import logoOrange from '../assets/echaris-logo-orange.png';

const DOCS = [
  { id: 'nin', label: 'National Identification Number (NIN)', desc: '11-digit number on your NIN slip or national ID card.', icon: 'shield-check', field: 'NIN', noun: 'NIN', placeholder: '12345678901', len: 11, hint: 'Enter the 11 digits with no spaces.' },
  { id: 'dl', label: "Driver's license", desc: 'License number printed on the front of the card.', icon: 'id-card', field: 'License number', noun: 'license number', placeholder: 'ABC000000AA00', len: 9, hint: 'Enter the number exactly as printed, without spaces.' },
  { id: 'passport', label: 'International passport', desc: 'Passport number on the data page.', icon: 'book-open', field: 'Passport number', noun: 'passport number', placeholder: 'A01234567', len: 8, hint: 'Starts with a letter, followed by the digits.' },
];
const STATES = ['Abia','Abuja (FCT)','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'].map(s => ({ value: s, label: s }));
const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States'].map(c => ({ value: c, label: c }));

const BLANK = { line1: '', line2: '', city: '', state: '', zip: '', country: 'Nigeria', doc: '', num: '' };
const PROGRESS = ['Details received', 'Checking your document with the verification service', 'Confirming your residential address', 'Updating your account status'];

function StatusCard({ tone, icon, title, body, children }) {
  const ring = { brand: ['var(--orange-50)', 'var(--text-brand)'], success: ['var(--success-50)', 'var(--text-success)'], danger: ['var(--danger-50)', 'var(--text-danger)'] }[tone];
  return (
    <Card padding={28}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 'var(--radius-pill)', background: ring[0], color: ring[1] }}>
          {icon === 'spinner' ? <span className="spin" /> : <Icon name={icon} size={26} />}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-display)', color: 'var(--text-heading)' }}>{title}</h2>
          <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--text-muted)', lineHeight: 1.55 }}>{body}</p>
        </div>
        {children}
      </div>
    </Card>
  );
}

function KV({ label, children, mono }) {
  return <div><div className="micro">{label}</div><div style={{ marginTop: 4, fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{children}</div></div>;
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h2 style={{ margin: 0, fontSize: 'var(--fs-h4)', fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', lineHeight: 1.5 }}>{sub}</p>
    </div>
  );
}

export default function Verify() {
  const navigate = useNavigate();
  const [view, setView] = React.useState('form');
  const [step, setStep] = React.useState(1);
  const [f, setF] = React.useState(BLANK);
  const [err, setErr] = React.useState({});
  const [stage, setStage] = React.useState(0);
  const [failure, setFailure] = React.useState(null);
  const [file, setFile] = React.useState('');
  const timers = React.useRef([]);
  const doc = DOCS.find(d => d.id === f.doc);
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setErr(p => ({ ...p, [k]: undefined })); };
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const back = () => { setErr({}); setStep(1); };

  const run = () => {
    setStage(0); setView('progress'); clear();
    [1, 2, 3].forEach((s, i) => timers.current.push(setTimeout(() => setStage(s), 1400 * (i + 1))));
    timers.current.push(setTimeout(() => {
      if (f.doc === 'nin' && f.num.replace(/\D/g, '').startsWith('0')) { setFailure({ reason: 'Name mismatch', body: 'We could not verify your identity. Please review your details and try again.' }); setView('failed'); }
      else setView('success');
    }, 5800));
  };

  const submit = e => {
    e.preventDefault();
    const n = {};
    if (step === 1) {
      if (!f.line1.trim()) n.line1 = 'Enter your house number and street.';
      if (!f.city.trim()) n.city = 'Enter your city.';
      if (!f.state) n.state = 'Select your state.';
      if (!f.country) n.country = 'Select your country.';
      setErr(n);
      if (Object.keys(n).length) return;
      setStep(2); return;
    }
    if (!f.doc) n.doc = 'Select the document you want to verify with.';
    else if (!f.num.trim()) n.num = 'Enter your ' + doc.noun + '.';
    else if (f.num.replace(/\s/g, '').length < doc.len) n.num = 'That ' + doc.field + ' is too short. ' + doc.hint;
    else if (!file) n.file = 'Upload a clear photo or scan of your document.';
    setErr(n);
    if (Object.keys(n).length) return;
    setFailure(null); run();
  };

  let body;
  if (view === 'form') body = (
    <React.Fragment>
      <div className="head">
        <h1 className="h1">Complete your identity verification</h1>
        <p className="sub">Verify your identity to unlock full platform access and enjoy a safer ECharis experience.</p>
      </div>
      <div className="wiz">
        {[['map-pin', 'Residential address'], ['shield-check', 'Identity document']].map(([ic, l], i) => (
          <div className="wiz-s" key={l} data-on={step >= i + 1 ? '1' : '0'}>
            <i></i>
            <div className="wiz-l"><Icon name={step > i + 1 ? 'check' : ic} size={14} />{l}</div>
          </div>
        ))}
      </div>
      <Card padding={28}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {step === 1 && <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionHead title="Residential address" sub="Use the address on your utility bill or bank record. This address supports identity verification, product delivery and logistics management." />
            <FormField label="Address line 1" htmlFor="line1" error={err.line1}>
              <Input id="line1" autoComplete="address-line1" iconLeft="map-pin" placeholder="e.g. 14 Ajose Adeogun Street" invalid={!!err.line1} value={f.line1} onChange={e => set('line1', e.target.value)} />
            </FormField>
            <FormField label="Address line 2" htmlFor="line2" optional>
              <Input id="line2" autoComplete="address-line2" placeholder="e.g. Apartment 4B, Ocean View Court" value={f.line2} onChange={e => set('line2', e.target.value)} />
            </FormField>
            <div className="grid2">
              <FormField label="City" htmlFor="city" error={err.city}>
                <Input id="city" autoComplete="address-level2" placeholder="Enter your city" invalid={!!err.city} value={f.city} onChange={e => set('city', e.target.value)} />
              </FormField>
              <FormField label="State" htmlFor="state" error={err.state}>
                <Select id="state" placeholder="Select your state" options={STATES} invalid={!!err.state} value={f.state} onChange={e => set('state', e.target.value)} />
              </FormField>
            </div>
            <div className="grid2">
              <FormField label="Postal / ZIP code" htmlFor="zip" optional>
                <Input id="zip" autoComplete="postal-code" inputMode="numeric" placeholder="e.g. 101241" value={f.zip} onChange={e => set('zip', e.target.value)} />
              </FormField>
              <FormField label="Country" htmlFor="country" error={err.country}>
                <Select id="country" options={COUNTRIES} invalid={!!err.country} value={f.country} onChange={e => set('country', e.target.value)} />
              </FormField>
            </div>
          </section>}

          {step === 2 && <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionHead title="Identity document" sub="Choose one document. The details must match the name on your client account." />
            <FormField error={err.doc}>
              <div className="docs" role="radiogroup" aria-label="Identity document">
                {DOCS.map(d => (
                  <label className="doc" key={d.id} data-on={f.doc === d.id ? '1' : '0'} data-err={err.doc ? '1' : '0'}>
                    <Radio name="doc" value={d.id} checked={f.doc === d.id} onChange={() => { setF(p => ({ ...p, doc: d.id, num: '' })); setErr(p => ({ ...p, doc: undefined, num: undefined })); setFile(''); }} label={d.label} description={d.desc} style={{ flex: 1 }} />
                    <Icon name={d.icon} size={20} style={{ color: f.doc === d.id ? 'var(--text-brand)' : 'var(--text-muted)', flex: 'none', marginTop: 1 }} />
                  </label>
                ))}
              </div>
            </FormField>
            {doc && (
              <React.Fragment>
                <FormField label={doc.field} htmlFor="num" error={err.num} hint={!err.num ? doc.hint : undefined}>
                  <Input id="num" inputMode={doc.id === 'nin' ? 'numeric' : 'text'} placeholder={doc.placeholder} invalid={!!err.num} value={f.num} onChange={e => set('num', e.target.value)} style={{ fontFamily: 'var(--font-mono)' }} />
                </FormField>
                <FormField label="Upload identification document" error={err.file}>
                  <FileUpload label="Upload document" hint="Supported formats: PDF, JPG, PNG · Maximum size: 5MB" accept=".pdf,.jpg,.jpeg,.png" fileName={file} invalid={!!err.file} onFileChange={fl => { setFile(fl.name); setErr(p => ({ ...p, file: undefined })); }} />
                </FormField>
              </React.Fragment>
            )}
          </section>}

          {step === 1
            ? <Button type="submit" fullWidth size="lg" iconRight="arrow-right">Continue to identity document</Button>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button type="submit" fullWidth size="lg" iconLeft="shield-check">Verify identity</Button>
              <Button type="button" fullWidth size="lg" variant="ghost" iconLeft="arrow-left" onClick={back}>Back to address</Button>
            </div>}
        </form>
      </Card>
    </React.Fragment>
  );

  else if (view === 'progress') body = (
    <React.Fragment>
      <div className="head">
        <span className="micro">Verification in progress</span>
        <h1 className="h1">Verifying your identity</h1>
        <p className="sub">Keep this page open. The result appears here automatically and your account status updates without further action from you.</p>
      </div>
      <StatusCard tone="brand" icon="spinner" title="Verification in progress" body="We are verifying your identity. This may take a few moments.">
        <ProgressMeter value={(stage + 1) * 25} label="Processing status" valueLabel={(stage + 1) * 25 + '%'} style={{ width: '100%' }} />
        <div className="steps">
          {PROGRESS.map((s, i) => (
            <div className="step" key={s} data-on={i === stage ? '1' : '0'} data-done={i < stage ? '1' : '0'}>
              <span className="dot">{i < stage ? <Icon name="check" size={12} /> : null}</span><span>{s}</span>
            </div>
          ))}
        </div>
        <div className="kv">
          <KV label="Document">{doc ? doc.label.replace(' (NIN)', '') : '—'}</KV>
          <KV label="Reference" mono>VER-7C31D8</KV>
        </div>
        <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>If the check cannot be completed here, we email you the result and update your account status.</p>
      </StatusCard>
    </React.Fragment>
  );

  else if (view === 'success') body = (
    <React.Fragment>
      <div className="head">
        <span className="micro">Verification complete</span>
        <h1 className="h1">Your identity is verified</h1>
        <p className="sub">Your client account now has full platform access.</p>
      </div>
      <StatusCard tone="success" icon="circle-check" title="Identity verified" body="Your identity has been successfully verified.">
        <div className="kv">
          <KV label="Document">{doc ? doc.label.replace(' (NIN)', '') : 'National Identification Number'}</KV>
          <KV label="Status"><Badge tone="success" icon="check">Verified</Badge></KV>
          <KV label="Verified on">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</KV>
          <KV label="Reference" mono>VER-7C31D8</KV>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <Button fullWidth size="lg" iconRight="arrow-right" onClick={() => navigate('/')}>Continue to dashboard</Button>
          <Button fullWidth size="lg" variant="ghost" iconLeft="download">Download verification receipt</Button>
        </div>
      </StatusCard>
    </React.Fragment>
  );

  else body = (
    <React.Fragment>
      <div className="head">
        <span className="micro">Verification unsuccessful</span>
        <h1 className="h1">We could not verify your identity</h1>
        <p className="sub">Nothing has changed on your account. Review your details and try again.</p>
      </div>
      <StatusCard tone="danger" icon="circle-alert" title="Verification failed" body={failure ? failure.body : ''}>
        <div className="kv">
          <KV label="Reason">{failure ? failure.reason : '—'}</KV>
          <KV label="Attempted">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</KV>
          <KV label="Document">{doc ? doc.label.replace(' (NIN)', '') : '—'}</KV>
          <KV label="Reference" mono>VER-7C31D9</KV>
        </div>
        <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>Two attempts remain today. After that, contact support and a member of the team completes the check manually.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <Button fullWidth size="lg" iconLeft="refresh-cw" onClick={run}>Retry verification</Button>
          <Button fullWidth size="lg" variant="secondary" onClick={() => { setStep(2); setView('form'); }}>Edit my details</Button>
          <Button fullWidth size="lg" variant="ghost" iconLeft="life-buoy" onClick={() => navigate('/contact')}>Contact support</Button>
        </div>
      </StatusCard>
    </React.Fragment>
  );

  return (
    <div className="page">
      <header className="bar">
        <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }}><Logo height={24} src={logoOrange} /></a>
      </header>
      <div className="wrap">{body}</div>
      <footer className="foot">
        <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--text-muted)' }}>Terms &amp; conditions</a>
        <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--text-muted)' }}>Privacy policy</a>
        <a href="/contact" onClick={e => { e.preventDefault(); navigate('/contact'); }} style={{ color: 'var(--text-muted)' }}>Contact support</a>
        <span>© 2026 Echaris Trading Limited · RC 9450649</span>
      </footer>
    </div>
  );
}
