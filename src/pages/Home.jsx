import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '../design-system/components/navigation/SiteHeader.jsx';
import { SiteFooter } from '../design-system/components/navigation/SiteFooter.jsx';
import { Button } from '../design-system/components/core/Button.jsx';
import { Card } from '../design-system/components/core/Card.jsx';
import { Icon } from '../design-system/components/core/Icon.jsx';
import { Badge } from '../design-system/components/core/Badge.jsx';
import { ProgressMeter } from '../design-system/components/data/ProgressMeter.jsx';
import logoOrange from '../assets/echaris-logo-orange.png';
import logoWhite from '../assets/echaris-logo-white.png';

const LINKS = [
  { href: '/', label: 'Home' }, { href: '/about', label: 'About us' },
  { href: '/services', label: 'Services' }, { href: '/marketplace', label: 'Marketplace' },
  { href: '/contact', label: 'Contact' },
];

function Head({ eyebrow, title, lead, align, maxWidth = 640 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth, margin: align === 'center' ? '0 auto' : undefined, textAlign: align }}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="h2">{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

function Feature({ icon, title, children }) {
  return (
    <Card padding={24} style={{ height: '100%' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--orange-50)', color: 'var(--orange-700)', marginBottom: 16 }}>
        <Icon name={icon} size={22} />
      </span>
      <h3 style={{ fontSize: 'var(--fs-h4)', fontWeight: 'var(--fw-bold)', marginBottom: 8, color: 'var(--text-heading)' }}>{title}</h3>
      <p style={{ fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-muted)', margin: 0 }}>{children}</p>
    </Card>
  );
}

function Row({ label, value }) {
  return <div className="row"><span className="row-l">{label}</span><span className="row-v">{value}</span></div>;
}

const GP_STEPS = [
  ['01', 'Commit capital', '3-month term'],
  ['02', "Withdraw 3 months' returns", '30% available immediately'],
  ['03', 'Capital returned', 'Original capital returned after 3 months'],
];

const GP_FACTS = [
  ['₦50,000', 'Minimum capital commitment'],
  ['10%', 'Monthly performance returns'],
  ['30%', 'Total 3-month returns'],
  ['3 months', 'Program duration'],
];

const PRODUCTS = [
  { name: 'iPhone 16 Pro', cat: 'Phones', value: '₦1,200,000', img: 'assets/mp-iphone.png' },
  { name: 'MacBook Air M4', cat: 'Laptops', value: '₦1,650,000', img: 'assets/mp-laptop.png' },
  { name: 'LG double-door refrigerator', cat: 'Appliances', value: '₦890,000', img: 'assets/mp-fridge.png' },
  { name: 'Samsung 65" QLED smart TV', cat: 'Electronics', value: '₦1,150,000', img: 'assets/mp-tv.png' },
];

// [open, close, low, high] — cumulative performance returns in ₦'000
const CANDLES = [
  [0, 25, 0, 28], [25, 50, 22, 54], [50, 45, 41, 56], [45, 78, 43, 82],
  [78, 100, 74, 105], [100, 128, 96, 133], [128, 121, 117, 134], [121, 155, 119, 160],
  [155, 185, 151, 191], [185, 216, 180, 221], [216, 248, 211, 253], [248, 300, 244, 306],
];
const CX = i => 54 + i * 38, CW = 17, MAX = 320;
const CY = v => 222 - (v / MAX) * 202;

function Candles() {
  const closes = CANDLES.map((c, i) => [CX(i), CY(c[1])]);
  const trend = closes.map(([x, y], i) => (i ? 'L' : 'M') + x + ' ' + y).join(' ');
  return (
    <svg className="chart" viewBox="0 0 560 268" role="img" aria-label="Candlestick chart of accumulated performance returns rising to ₦150,000 over three months">
      <defs>
        <linearGradient id="tarea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF5A00" stopOpacity=".22" />
          <stop offset="100%" stopColor="#FF5A00" stopOpacity="0" />
        </linearGradient>
        <filter id="tglow" x="-20%" y="-60%" width="140%" height="240%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {[0, 60, 120, 180, 240, 300].map(v => (
        <g key={v}>
          <line x1="34" x2="500" y1={CY(v)} y2={CY(v)} stroke="rgba(255,255,255,.06)" strokeWidth="1" />
          <text x="508" y={CY(v) + 3.5} fontSize="10" fontWeight="700" letterSpacing=".03em" fill="rgba(255,255,255,.38)" fontFamily="var(--font-mono)">{v ? (v / 2) + 'k' : '0'}</text>
        </g>
      ))}
      {CANDLES.map((c, i) => <line key={'v' + i} x1={CX(i)} x2={CX(i)} y1="20" y2="222" stroke="rgba(255,255,255,.03)" strokeWidth="1" />)}

      <path d={trend + ' L' + CX(11) + ' 222 L' + CX(0) + ' 222 Z'} fill="url(#tarea)" />
      <path d={trend} fill="none" stroke="#FF5A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".85" filter="url(#tglow)" />

      {CANDLES.map(([o, c, l, hi], i) => {
        const up = c >= o, col = up ? 'var(--success-500)' : 'var(--danger-500)';
        const top = CY(Math.max(o, c)), bot = CY(Math.min(o, c));
        return (
          <g key={i}>
            <line x1={CX(i)} x2={CX(i)} y1={CY(hi)} y2={CY(l)} stroke={col} strokeWidth="1.5" />
            <rect x={CX(i) - CW / 2} y={top} width={CW} height={Math.max(3, bot - top)} rx="2" fill={col} />
          </g>
        );
      })}

      <line x1="34" x2="500" y1={CY(300)} y2={CY(300)} stroke="#FF5A00" strokeWidth="1" strokeDasharray="4 4" opacity=".7" />
      <rect x="502" y={CY(300) - 10} width="52" height="20" rx="4" fill="#FF5A00" />
      <text x="528" y={CY(300) + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff" fontFamily="var(--font-mono)">150k</text>

      <line x1="34" x2="500" y1="222" y2="222" stroke="rgba(255,255,255,.14)" strokeWidth="1.5" />
      {['M1', 'M2', 'M3'].map((m, i) => (
        <text key={m} x={CX(i * 4) + 57} y="244" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing=".05em" fill="rgba(255,255,255,.4)" fontFamily="var(--font-mono)">{m}</text>
      ))}
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const go = href => navigate(href);
  const reg = () => navigate('/register');
  const login = () => navigate('/login');
  return (
    <div>
      <SiteHeader links={LINKS} activeHref="/" onNavigate={go} onLogin={login} onRegister={reg}
        logoSrc={logoOrange} />

      <section className="band hero-band">
        <div className="wrap split">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <span className="hero-kicker"><Icon name="shield-check" size={15} />CAC registered · RC 9450649</span>
            <h1 className="hero-h1">
              Build with your capital<br /><span className="hero-em">Grow with Purpose.</span>
            </h1>
            <p className="lead hero-lead" style={{ maxWidth: 500 }}>
              ECharis provides a structured platform for managing capital commitments, tracking performance returns, and accessing marketplace financing opportunities.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button size="lg" onClick={reg}>Get started</Button>
              <Button size="lg" variant="inverse" onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
            </div>
          </div>

          <div className="hero-art">
            <div className="tick">
              <div className="tick-l">
                <span className="hero-micro">ECH · Accumulated performance returns</span>
                <div className="tick-row">
                  <span className="hero-art-v">₦150,000</span>
                  <span className="tick-up"><Icon name="trending-up" size={14} />+₦150,000</span>
                </div>
              </div>
              <div className="tf">{['1M', '2M', '3M'].map(t => <span key={t} className="tf-b" data-on={t === '3M' ? '1' : '0'}>{t}</span>)}</div>
            </div>

            <Candles />

            <div className="hero-art-grid">
              <div className="hero-art-cell"><span className="hero-art-cl">Capital committed</span><span className="hero-art-cv">₦500,000</span></div>
              <div className="hero-art-cell"><span className="hero-art-cl">Monthly returns</span><span className="hero-art-cv">₦50,000</span></div>
              <div className="hero-art-cell"><span className="hero-art-cl">Program term</span><span className="hero-art-cv">3 months</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="who">
        <svg className="who-bg" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="wline" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF5A00" stopOpacity=".25" />
              <stop offset="100%" stopColor="#FFB800" stopOpacity=".85" />
            </linearGradient>
            <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5A00" stopOpacity=".16" />
              <stop offset="100%" stopColor="#FF5A00" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 19 }, (_, i) => <line key={'v' + i} x1={i * 80} x2={i * 80} y1="0" y2="560" stroke="#fff" strokeOpacity=".035" strokeWidth="1" />)}
          {Array.from({ length: 8 }, (_, i) => <line key={'h' + i} x1="0" x2="1440" y1={i * 80} y2={i * 80} stroke="#fff" strokeOpacity=".035" strokeWidth="1" />)}
          <path d="M700 470 L840 424 L980 446 L1120 366 L1260 388 L1400 286 L1480 250 L1480 560 L700 560 Z" fill="url(#wfill)" />
          <path d="M700 470 L840 424 L980 446 L1120 366 L1260 388 L1400 286 L1480 250" fill="none" stroke="url(#wline)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {[[840, 424], [1120, 366], [1400, 286]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="4" fill="#FF5A00" stroke="#1A1A1A" strokeWidth="2" />
          ))}
        </svg>
        <div className="wrap who-in">
          <div className="who-l">
            <span className="who-eyebrow">Who we are</span>
            <h2 className="who-h">A registered Nigerian platform for capital growth and product financing</h2>
            <p className="who-lead">
              Echaris Trading Limited helps individuals grow their capital and turn that growth into something they
              can use. Every figure on your account is traceable, every condition is stated up front, and every
              capital commitment is backed by an agreement you accept before you pay.
            </p>
            <div className="who-cta">
              <Button size="lg" onClick={reg}>Get started</Button>
              <Button size="lg" variant="inverse" onClick={() => navigate('/marketplace')}>Browse marketplace</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="gp">
        <div className="wrap gp-in">
          <div className="gp-top">
            <div className="gp-l">
              <span className="gp-eyebrow">3-month growth program</span>
              <h2 className="gp-h">Commit capital.<br /><span className="gp-em">Withdraw 3 months' returns immediately.</span></h2>
              <p className="gp-lead">Commit your capital for 3 months, withdraw your 3-month performance returns immediately, and receive your original capital back when the 3-month term ends.</p>
              <div className="gp-cta"><Button size="lg" onClick={reg}>Commit capital</Button></div>
            </div>

            <div className="gp-r">
              <div className="gp-stat">
                <span className="gp-sv">30%</span>
                <span className="gp-sl">3-month performance returns</span>
                <span className="gp-chip"><Icon name="zap" size={14} />Withdraw immediately</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band mfx">
        <div className="wrap g2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Head eyebrow="Marketplace financing" title="Point your returns at a product instead of a payout"
              lead="Marketplace financing lets you attach a capital commitment to a specific product. Your monthly performance returns accumulate against that product instead of sitting in your wallet." />
            <ul className="bullets">
              <li><Icon name="store" size={18} style={{ color: 'var(--text-brand)', marginTop: 3, flex: 'none' }} /><span>Choose a product from the marketplace and see its value before you commit.</span></li>
              <li><Icon name="coins" size={18} style={{ color: 'var(--text-brand)', marginTop: 3, flex: 'none' }} /><span>Create a capital commitment attached to it. Returns accumulate toward the product.</span></li>
              <li><Icon name="truck" size={18} style={{ color: 'var(--text-brand)', marginTop: 3, flex: 'none' }} /><span>The product is delivered to you once accumulated returns reach 50% of product's value.</span></li>
              <li><Icon name="banknote" size={18} style={{ color: 'var(--text-brand)', marginTop: 3, flex: 'none' }} /><span>Once accumulated returns reach 100% of the product value, your capital commitment is returned to you.</span></li>
            </ul>
            <div className="mfx-cta">
              <Button size="lg" onClick={reg}>Start financing a product</Button>
            </div>
          </div>
          <div className="mfx-art">
            <svg className="mfx-cart" viewBox="0 0 560 420" role="img" aria-label="Sketch of a cart holding a laptop, phone, television and a box">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF5A00" stopOpacity=".2" />
                  <stop offset="100%" stopColor="#FF5A00" stopOpacity=".04" />
                </linearGradient>
                <radialGradient id="cglow">
                  <stop offset="0%" stopColor="#FF5A00" stopOpacity=".3" />
                  <stop offset="100%" stopColor="#FF5A00" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="290" cy="200" r="200" fill="url(#cglow)" />

              <g strokeLinejoin="round" strokeLinecap="round">
                <rect x="196" y="96" width="176" height="106" rx="8" fill="url(#cg)" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" />
                <line x1="284" y1="202" x2="284" y2="216" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" />
                <line x1="256" y1="216" x2="312" y2="216" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" />
                <path d="M158 236 L246 236 L262 292 L142 292 Z" fill="url(#cg)" stroke="var(--brand-primary)" strokeWidth="2.5" />
                <line x1="150" y1="292" x2="254" y2="292" stroke="var(--brand-primary)" strokeWidth="2.5" />
                <rect x="288" y="216" width="52" height="92" rx="9" fill="url(#cg)" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" />
                <line x1="304" y1="228" x2="324" y2="228" stroke="rgba(255,255,255,.4)" strokeWidth="2" />
                <path d="M366 226 L424 210 L424 288 L366 304 Z" fill="url(#cg)" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" />
                <path d="M366 226 L366 304" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" />
                <path d="M366 258 L424 242" stroke="rgba(255,255,255,.34)" strokeWidth="2" />
              </g>

              <g fill="none" stroke="var(--brand-primary)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
                <path d="M62 118 L104 118 L146 300" />
                <path d="M132 244 L470 244 L432 348 L156 348 Z" />
                <line x1="156" y1="348" x2="146" y2="300" />
                <path d="M180 268 L196 324 M256 268 L266 324 M332 268 L336 324 M408 268 L406 324" strokeWidth="2.5" stroke="rgba(255,255,255,.28)" />
                <path d="M156 348 L444 348" strokeWidth="3" stroke="rgba(255,255,255,.32)" />
              </g>
              <circle cx="196" cy="386" r="22" fill="none" stroke="var(--brand-primary)" strokeWidth="4" />
              <circle cx="196" cy="386" r="6" fill="var(--brand-primary)" />
              <circle cx="404" cy="386" r="22" fill="none" stroke="var(--brand-primary)" strokeWidth="4" />
              <circle cx="404" cy="386" r="6" fill="var(--brand-primary)" />

              <path d="M436 168 L472 132 L508 96" fill="none" stroke="#FFB800" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M486 96 L508 96 L508 118" fill="none" stroke="#FFB800" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      <section className="hw">
        <div className="wrap hw-in">
          <span className="hw-pill">How it works</span>
          <h2 className="hw-h"><span className="hw-em">4 steps to</span><br />structured capital growth.</h2>
          <p className="hw-lead">Registration to your first credited return, with nothing hidden in between.</p>

          <div className="hw-grid">
            <div className="hw-col">
              <div className="hw-step hw-l">
                <span className="hw-n">1.</span>
                <h3 className="hw-t">Create your account</h3>
                <p className="hw-d">Register with your name, email and phone number. Add a referral code if a client invited you.</p>
              </div>
              <div className="hw-step hw-l">
                <span className="hw-n">2.</span>
                <h3 className="hw-t">Verify your identity</h3>
                <p className="hw-d">Submit your NIN, driver's licence or international passport and your residential address.</p>
              </div>
            </div>

            <div className="hw-phone">
              <div className="hw-glow" />
              <div className="hw-device">
                <div className="hw-notch" />
                <div className="hw-screen">
                  <div className="hw-top">
                    <div className="hw-user">
                      <span className="hw-av">AO</span>
                      <span><span className="hw-hi">Welcome back</span><span className="hw-name">Adaeze O.</span></span>
                    </div>
                    <span className="hw-bell"><Icon name="bell" size={15} /></span>
                  </div>

                  <div className="hw-bal">
                    <span className="hw-bl">Accumulated performance returns</span>
                    <div className="hw-bv">₦300,000</div>
                    <div className="hw-acts">
                      {[['coins', 'Returns'], ['trending-up', 'Commit'], ['store', 'Market'], ['wallet', 'Wallet']].map(([ic, lb]) => (
                        <span className="hw-act" key={lb}><span className="hw-ai"><Icon name={ic} size={14} /></span>{lb}</span>
                      ))}
                    </div>
                  </div>

                  <div className="hw-rowh"><span>Monthly returns</span><span className="hw-va">View all</span></div>
                  {[['Month 6 return', '15 Nov 2026', '+₦50,000', 'Paid'],
                    ['Month 5 return', '15 Oct 2026', '+₦50,000', 'Paid'],
                    ['Month 4 return', '15 Sep 2026', '+₦50,000', 'Paid'],
                    ['Month 7 return', '15 Dec 2026', '+₦50,000', 'Upcoming']].map(([t, d, a, st]) => (
                    <div className="hw-tx" key={t}>
                      <span className="hw-ti"><Icon name="arrow-down-left" size={13} /></span>
                      <span className="hw-tm"><span className="hw-tt">{t}</span><span className="hw-td">{d}</span></span>
                      <span className="hw-tr"><span className="hw-ta">{a}</span><span className="hw-ts" data-up={st === 'Upcoming' ? '1' : '0'}>{st}</span></span>
                    </div>
                  ))}

                  <div className="hw-tabs">
                    {[['layout-grid', 'Overview', 1], ['trending-up', 'Capital', 0], ['store', 'Market', 0], ['users', 'Referrals', 0]].map(([ic, lb, on]) => (
                      <span className="hw-tab" data-on={on} key={lb}><Icon name={ic} size={15} />{lb}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="hw-col">
              <div className="hw-step hw-r">
                <span className="hw-n">3.</span>
                <h3 className="hw-t">Commit capital</h3>
                <p className="hw-d">Choose your amount, accept the MOU, and commit capital for the 3-month term. Your program activates automatically.</p>
              </div>
              <div className="hw-step hw-r">
                <span className="hw-n">4.</span>
                <h3 className="hw-t">Withdraw 3 months' returns immediately</h3>
                <p className="hw-d">Your full 30% performance returns are available to withdraw straight away. Your original capital is returned at the end of the 3-month term.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band-tight" style={{ background: 'var(--surface-page)' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
          <div className="hw-in" style={{ gap: 16 }}>
            <span className="hw-pill">Why ECharis?</span>
            <h2 className="hw-h"><span className="hw-em">Built on clarity,</span><br />security and control.</h2>
          </div>
          <div className="why">
            {[['eye', 'Transparency', 'Clear visibility into your capital, returns and transactions.'],
              ['shield-check', 'Security', 'Secure account and payment infrastructure.'],
              ['sliders-horizontal', 'Flexibility', 'Choose from multiple program durations and manage multiple commitments.'],
              ['layout-grid', 'Convenience', 'Manage your account, returns and marketplace financing from one platform.']].map(([icon, t, d]) => (
              <div className="why-c" key={t}>
                <span className="why-ic"><Icon name={icon} size={22} /></span>
                <h3 className="why-t">{t}</h3>
                <p className="why-d">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <div className="cta-panel">
            <div className="cta-l">
              <h2 className="cta-h">Ready to get started?</h2>
              <p className="cta-p">Create your ECharis client account and take the first step toward structured capital growth.</p>
            </div>
            <div className="cta-r">
              <div className="cta-b">
                <Button size="lg" onClick={reg}>Create Account</Button>
                <Button size="lg" variant="inverse" onClick={login}>Login</Button>
              </div>
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
