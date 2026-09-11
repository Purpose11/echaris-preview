import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '../design-system/components/navigation/SiteHeader.jsx';
import { SiteFooter } from '../design-system/components/navigation/SiteFooter.jsx';
import { Button } from '../design-system/components/core/Button.jsx';
import { Card } from '../design-system/components/core/Card.jsx';
import { Icon } from '../design-system/components/core/Icon.jsx';
import { Avatar } from '../design-system/components/core/Avatar.jsx';
import { FormField } from '../design-system/components/forms/FormField.jsx';
import { Input } from '../design-system/components/forms/Input.jsx';
import { Textarea } from '../design-system/components/forms/Textarea.jsx';
import logoOrange from '../assets/echaris-logo-orange.png';
import logoWhite from '../assets/echaris-logo-white.png';

const WA = props => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={props.size || 20} height={props.size || 20} aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.82 2.42a8.19 8.19 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24m-3.7 4.1c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.15s.92 2.5 1.05 2.67c.13.17 1.8 2.86 4.46 3.9 2.21.87 2.66.7 3.14.65.48-.04 1.55-.63 1.77-1.25.22-.61.22-1.14.15-1.25-.06-.11-.24-.17-.5-.3-.26-.13-1.55-.77-1.79-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.82 1.02-.15.18-.3.2-.56.07-.26-.13-1.1-.41-2.1-1.3-.78-.69-1.3-1.55-1.45-1.81-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.18.04-.33-.02-.46-.07-.13-.58-1.41-.8-1.93-.21-.5-.42-.44-.58-.44z" />
  </svg>
);

const LINKS = [
  { href: '/', label: 'Home' }, { href: '/about', label: 'About us' },
  { href: '/services', label: 'Services' }, { href: '/marketplace', label: 'Marketplace' },
  { href: '/contact', label: 'Contact' },
];

const BLANK = { name: '', phone: '', email: '', subject: '', message: '' };
const emailOk = v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());

export default function Contact() {
  const navigate = useNavigate();
  const [f, setF] = React.useState(BLANK);
  const [err, setErr] = React.useState({});
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setErr(p => ({ ...p, [k]: undefined })); };

  const go = href => navigate(href);
  const reg = () => navigate('/register');
  const login = () => navigate('/login');

  const submit = e => {
    e.preventDefault();
    const n = {};
    if (!f.name.trim()) n.name = 'Enter your name so we know who to reply to.';
    if (!f.phone.trim()) n.phone = 'Enter a phone number we can reach you on.';
    if (!f.email.trim()) n.email = 'Enter your email address.';
    else if (!emailOk(f.email)) n.email = 'That email address is not complete. Check for a missing domain, for example .com.';
    if (!f.subject.trim()) n.subject = 'Add a subject so we can route your message.';
    if (!f.message.trim()) n.message = 'Tell us what you need help with.';
    setErr(n);
    if (Object.keys(n).length) return;
    setBusy(true);
    setTimeout(() => { setBusy(false); setSent(true); }, 1200);
  };

  return (
    <div>
      <SiteHeader links={LINKS} activeHref="/contact" onNavigate={go} onLogin={login} onRegister={reg}
        logoSrc={logoOrange} />

      <section className="ab-hero-band">
        <div className="wrap ab-hero">
          <div className="ab-hero-l">
            <h1 className="ab-h1">Contact <span className="ab-em">ECharis</span></h1>
            <p className="ab-lead">
              Send us a message about your client account, your capital commitments, or anything else on the platform.
            </p>
          </div>
        </div>
      </section>

      <section className="band" style={{ background: 'var(--surface-card)' }}>
        <div className="wrap ct">
          <Card padding={40} className="cf-card">
            {sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 'var(--radius-pill)', background: 'var(--success-50)', color: 'var(--text-success)' }}>
                  <Icon name="circle-check" size={22} />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h2 style={{ margin: 0, fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>Message sent</h2>
                  <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Thank you. We have your message and a reply is on the way to {f.email}.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => { setF(BLANK); setSent(false); }}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="ct-form">
                <div className="cf-head">
                  <span className="cf-eyebrow">Get in touch</span>
                  <h2 className="cf-h">Send a message</h2>
                </div>

                <div className="cf">
                  <FormField error={err.name}>
                    <Input id="name" placeholder="Your name" invalid={!!err.name}
                      value={f.name} onChange={e => set('name', e.target.value)} />
                  </FormField>
                  <FormField error={err.phone}>
                    <Input id="phone" type="tel" inputMode="tel" placeholder="Phone number" invalid={!!err.phone}
                      value={f.phone} onChange={e => set('phone', e.target.value)} />
                  </FormField>
                  <FormField error={err.email}>
                    <Input id="email" type="email" placeholder="Email address" invalid={!!err.email}
                      value={f.email} onChange={e => set('email', e.target.value)} />
                  </FormField>
                  <FormField error={err.subject}>
                    <Input id="subject" placeholder="Subject" invalid={!!err.subject}
                      value={f.subject} onChange={e => set('subject', e.target.value)} />
                  </FormField>
                  <FormField error={err.message}>
                    <Textarea id="message" rows={6} placeholder="Message" invalid={!!err.message}
                      value={f.message} onChange={e => set('message', e.target.value)} />
                  </FormField>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Button type="submit" size="lg" fullWidth loading={busy} className="cf-submit">{busy ? 'Sending message' : 'Send message'}</Button>
                </div>
              </form>
            )}
          </Card>


        </div>
      </section>

      <section className="band-tight" style={{ background: 'var(--surface-card)', paddingTop: 0 }}>
        <div className="wrap">
          <div className="wa">
            <div className="wa-l">
              <h2 className="wa-h">Contact us on WhatsApp</h2>
              <p className="wa-p">For payment issues, KYC and compliance, fraud suspicions and technical help contact us below</p>
              <button type="button" className="wa-btn"><WA size={20} />Send us a message</button>
            </div>

            <div className="wa-r">
              <span className="wa-badge"><WA size={30} /><span className="wa-dot" /></span>
              <div className="wa-chat">
                <div className="wa-top">
                  <Avatar name="Customer Support" size={40} />
                  <div>
                    <div className="wa-name">Customer support</div>
                    <div className="wa-on">online</div>
                  </div>
                </div>
                <div className="wa-body">
                  <div className="wa-bub">
                    <p>Hi there</p>
                    <p>How can I help you?</p>
                  </div>
                  <button type="button" className="wa-send"><WA size={20} />Send us a message</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band-tight" style={{ background: 'var(--surface-card)', paddingTop: 0 }}>
        <div className="wrap ct-reach">
            <div className="ct-panel">
              <span className="cf-eyebrow">Reach us directly</span>

              <div className="ct-rows">
                <a className="ct-row" href="mailto:info@echaris.com">
                  <span className="ct-ic"><Icon name="mail" size={18} /></span>
                  <span>
                    <span className="ct-l">EMAIL</span>
                    <span className="ct-v">info@echaris.com</span>
                  </span>
                  <Icon name="arrow-up-right" size={16} />
                </a>

                <a className="ct-row" href="tel:09033324525354">
                  <span className="ct-ic"><Icon name="phone" size={18} /></span>
                  <span>
                    <span className="ct-l">PHONE</span>
                    <span className="ct-v">09033324525354</span>
                  </span>
                  <Icon name="arrow-up-right" size={16} />
                </a>
              </div>
            </div>
        </div>
      </section>

      <SiteFooter logoSrc={logoWhite} columns={[
        { title: 'Platform', links: [{ label: 'Growth programs' }, { label: 'Marketplace' }, { label: 'Referral rewards' }, { label: 'Client wallet' }] },
        { title: 'Company', links: [{ label: 'About us' }, { label: 'Services' }, { label: 'Contact' }] },
        { title: 'Legal', links: [{ label: 'Terms & conditions' }, { label: 'MOU' }, { label: 'Privacy policy' }] },
      ]} />
    </div>
  );
}
