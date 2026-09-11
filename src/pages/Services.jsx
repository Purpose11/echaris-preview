import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '../design-system/components/navigation/SiteHeader.jsx';
import { SiteFooter } from '../design-system/components/navigation/SiteFooter.jsx';
import { Button } from '../design-system/components/core/Button.jsx';
import { Icon } from '../design-system/components/core/Icon.jsx';
import { Reveal } from '../components/Reveal.jsx';
import logoOrange from '../assets/echaris-logo-orange.png';
import logoWhite from '../assets/echaris-logo-white.png';

const LINKS = [
  { href: '/', label: 'Home' }, { href: '/about', label: 'About us' },
  { href: '/services', label: 'Services' }, { href: '/marketplace', label: 'Marketplace' },
  { href: '/contact', label: 'Contact' },
];

const SERVICES = [
  ['trending-up', 'Capital growth programs', 'Growth program', 'Commit capital for a fixed term of three, six or twelve months and receive performance returns on a monthly cycle.',
    ['Minimum capital commitment of ₦50,000, with no fixed maximum', 'Run several commitments side by side, each with its own term', 'Capital is returned to your wallet when the program matures']],
  ['activity', 'Performance tracking', 'Monthly returns', 'Every credit is recorded against the commitment that produced it, with the date, the rate applied and the resulting figure.',
    ['A full return schedule visible before you commit', 'Paid, upcoming and expected statuses on every return', 'Program progress and maturity dates on one page']],
  ['store', 'Marketplace financing', 'Product financing', 'Direct accumulated performance returns at a product from the ECharis marketplace instead of withdrawing them.',
    ['Phones, laptops, electronics, appliances and lifestyle products', "Product is released once returns reach 50% of its value", 'Home delivery or collection from a pickup station']],
  ['users', 'Referral rewards', 'Client referrals', "Every client gets a referral code. Share it and earn when someone you refer starts their first growth program.",
    ['₦3,000 credited for each referred client', "Paid by Echaris, never from the referred client's capital", 'No cap on how many clients you can refer']],
];

const PROGRAMS = [
  ['3', 'Short term', 'A first program for clients starting out.'],
  ['6', 'Most chosen', 'A balanced term with a longer run of monthly returns.'],
  ['12', 'Full year', 'The longest term, for a full year of returns.'],
];

const SUPPORT = [
  ['shield-check', 'Identity verification', 'Verification is completed once through a secure third-party check before withdrawals are processed.'],
  ['file-text', 'Digital agreements', 'Every commitment is governed by an MOU you read and accept before payment, stored on your account.'],
  ['wallet', 'Client wallet', 'Returns, referral rewards and marketplace allocations sit in one balance with a full transaction history.'],
  ['banknote', 'Withdrawals', 'Request a payout to your bank account. Each request is reviewed and confirmed by email.'],
];

const FAQ = [
  ['What is the minimum capital commitment?', 'The minimum is ₦50,000 on any term. There is no fixed maximum, and you can run several commitments side by side, each with its own term and schedule.'],
  ['How often are performance returns credited?', 'Returns are credited on a monthly cycle for the length of the term. Each credit is recorded against the commitment that produced it, with the date and the resulting figure.'],
  ['When is my capital returned?', 'Your capital is returned to your client wallet when the growth program reaches maturity at the end of its term.'],
  ['How does marketplace financing work?', 'You direct accumulated performance returns at a product instead of withdrawing them. The product is released once your accumulated returns reach 50% of its value, then delivered to your address or a pickup station.'],
  ['Is the delivery fee taken from my returns?', 'No. The delivery fee is separate from your capital commitment and your performance returns, and is paid at the point of dispatch.'],
  ['Do I need to verify my identity?', 'Yes. Identity verification is completed once through a secure third-party check, and is required before a withdrawal is processed.'],
  ['How do I withdraw from my wallet?', 'Request a payout to your bank account from the wallet. Each request is reviewed, and you receive an email once it has been processed.'],
  ['How much do I earn for a referral?', "₦3,000 is credited to your wallet for each referred client, once that client activates their first growth program. The reward is paid by Echaris, never from the referred client's capital or returns."],
];

export default function Services() {
  const navigate = useNavigate();
  const go = href => navigate(href);
  const reg = () => navigate('/register');
  const login = () => navigate('/login');
  return (
    <div>
      <SiteHeader links={LINKS} activeHref="/services" onNavigate={go} onLogin={login} onRegister={reg}
        logoSrc={logoOrange} />

      <section className="ab-hero-band">
        <div className="wrap ab-hero">
          <div className="ab-hero-l">
            <h1 className="ab-h1 anim-in anim-in-1">Our <span className="ab-em">services</span></h1>
            <p className="ab-lead anim-in anim-in-2">
              Capital growth programs, performance tracking, marketplace financing and referral rewards on one client account.
            </p>
          </div>
        </div>
      </section>

      <section className="band" style={{ background: 'var(--surface-card)' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <Reveal as="div" className="hw-in">
            <span className="hw-pill">What we offer</span>
            <h2 className="hw-h"><span className="hw-em">Four services,</span><br />one client account.</h2>
          </Reveal>

          <Reveal as="div" className="svc reveal-group" delay={80}>
            <div className="svc-c">
              <span className="svc-ic"><Icon name="trending-up" size={24} /></span>
              <span className="svl-k">Growth program</span>
              <h3 className="svc-t">Capital growth programs</h3>
              <p className="svc-d">Commit capital for a fixed term of three, six or twelve months and receive performance returns on a monthly cycle. The minimum is ₦50,000, with no fixed maximum, and your capital is returned at maturity.</p>
            </div>
            <div className="svc-c">
              <span className="svc-ic"><Icon name="activity" size={24} /></span>
              <span className="svl-k">Monthly returns</span>
              <h3 className="svc-t">Performance tracking</h3>
              <p className="svc-d">Every credit is recorded against the commitment that produced it, with the date and the resulting figure. You see the full return schedule before you commit, and paid, upcoming and expected statuses after.</p>
            </div>
            <div className="svc-c">
              <span className="svc-ic"><Icon name="store" size={24} /></span>
              <span className="svl-k">Product financing</span>
              <h3 className="svc-t">Marketplace financing</h3>
              <p className="svc-d">Direct accumulated performance returns at a product from the ECharis marketplace instead of withdrawing them. The product is released once returns reach 50% of its value, then delivered or collected.</p>
            </div>
            <div className="svc-c">
              <span className="svc-ic"><Icon name="users" size={24} /></span>
              <span className="svl-k">Client referrals</span>
              <h3 className="svc-t">Referral rewards</h3>
              <p className="svc-d">Every client gets a referral code. When someone who joins with your code activates their first growth program, ₦3,000 is credited to your wallet. There is no cap, and the reward is paid by Echaris.</p>
            </div>
          </Reveal>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button size="lg" iconRight="arrow-right" onClick={reg}>Get Started</Button>
          </div>
        </div>
      </section>

      <section className="band" style={{ background: 'var(--surface-card)' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <Reveal as="div" className="hw-in" style={{ alignItems: 'center', textAlign: 'center' }}>
            <span className="hw-pill">Questions</span>
            <h2 className="hw-h"><span className="hw-em">Frequently asked</span><br />questions.</h2>
          </Reveal>
          <Reveal as="div" className="faq" delay={80}>
            {FAQ.map(([q, a]) => (
              <details className="faq-i" key={q}>
                <summary className="faq-q"><span>{q}</span><Icon name="plus" size={18} /></summary>
                <p className="faq-a">{a}</p>
              </details>
            ))}
          </Reveal>
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
