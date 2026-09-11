import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '../design-system/components/navigation/SiteHeader.jsx';
import { SiteFooter } from '../design-system/components/navigation/SiteFooter.jsx';
import { Button } from '../design-system/components/core/Button.jsx';
import { Card } from '../design-system/components/core/Card.jsx';
import { Icon } from '../design-system/components/core/Icon.jsx';
import { Badge } from '../design-system/components/core/Badge.jsx';
import { Input } from '../design-system/components/forms/Input.jsx';
import { Pagination } from '../design-system/components/navigation/Pagination.jsx';
import { EmptyState } from '../design-system/components/data/EmptyState.jsx';
import { Reveal } from '../components/Reveal.jsx';
import logoOrange from '../assets/echaris-logo-orange.png';
import logoWhite from '../assets/echaris-logo-white.png';
import imgIphone from '../assets/marketplace/mp-iphone.webp';
import imgMbair from '../assets/marketplace/mp-mbair.webp';
import imgTv from '../assets/marketplace/mp-tv.webp';
import imgFridge from '../assets/marketplace/mp-fridge.webp';
import imgWasher from '../assets/marketplace/mp-washer.webp';
import imgGen from '../assets/marketplace/mp-gen.webp';
import imgAc from '../assets/marketplace/mp-ac.webp';
import imgSofa from '../assets/marketplace/mp-sofa.webp';

const IMGS = { iphone: imgIphone, mbair: imgMbair, tv: imgTv, fridge: imgFridge, washer: imgWasher, gen: imgGen, ac: imgAc, sofa: imgSofa };

const SIZE = 7;

const LINKS = [
  { href: '/', label: 'Home' }, { href: '/about', label: 'About us' },
  { href: '/services', label: 'Services' }, { href: '/marketplace', label: 'Marketplace' },
  { href: '/contact', label: 'Contact' },
];

const NAIRA = n => '₦' + n.toLocaleString('en-NG');

const PRODUCTS = [
  { id: 'iphone', name: 'iPhone 16 Pro', cat: 'Phones', value: 1200000, stock: 'In stock', lead: '3–5 working days', desc: "6.3-inch Super Retina XDR display, A18 Pro chip and a 48MP fusion camera system. Titanium frame, USB-C, and all-day battery. Supplied unlocked with a one-year manufacturer warranty." },
  { id: 'mbair', name: 'MacBook Air M4', cat: 'Laptops', value: 1650000, stock: 'In stock', lead: '3–5 working days', desc: "13-inch Liquid Retina display with the M4 chip, 16GB unified memory and 512GB SSD. Fanless design, up to 18 hours of battery, and a 1080p camera. Includes charger and one-year warranty." },
  { id: 'tv', name: 'Samsung 65" QLED smart TV', cat: 'Electronics', value: 1150000, stock: 'In stock', lead: '3–5 working days', desc: "65-inch QLED 4K display with Quantum HDR, Motion Xcelerator and built-in smart apps. Slim bezel with a wall-mount kit and remote in the box. Two-year manufacturer warranty." },
  { id: 'fridge', name: 'LG double-door refrigerator', cat: 'Appliances', value: 890000, stock: 'Low stock', lead: '5–7 working days', desc: "530-litre double-door refrigerator with inverter linear compressor, multi-air flow cooling and a door-cooling vent. Energy efficient and stabiliser free. Two-year warranty on parts, ten on the compressor." },
  { id: 'washer', name: 'Bosch 9kg front-load washing machine', cat: 'Appliances', value: 980000, stock: 'Low stock', lead: '5–7 working days', desc: "9kg front-load washing machine with EcoSilence Drive, 15 wash programmes and a 1400rpm spin. Anti-vibration side panels and child lock. Two-year warranty, ten on the motor." },
  { id: 'gen', name: 'Elepaq 5.5kVA generator', cat: 'Generators', value: 640000, stock: 'In stock', lead: '5–7 working days', desc: "5.5kVA petrol generator with 100% copper coil, key start and a 25-litre tank giving roughly 12 hours of run time. Low-noise muffler and automatic voltage regulation. One-year warranty." },
  { id: 'ac', name: 'Hisense 1.5HP inverter AC', cat: 'Appliances', value: 520000, stock: 'In stock', lead: '3–5 working days', desc: "1.5HP inverter split unit cooling rooms up to 20m². Copper condenser, gold-fin protection and low-voltage start at 150V. Installation kit included; one-year warranty, five on the compressor." },
  { id: 'sofa', name: '7-seater sectional sofa', cat: 'Furniture', value: 750000, stock: 'Made to order', lead: '10–14 working days', desc: "7-seater L-shaped sectional in stain-resistant fabric over a hardwood frame, with high-density foam cushions and solid wood legs. Made to order in your choice of three neutral colourways." },
];

const STOCK_TONE = { 'In stock': 'success', 'Low stock': 'warning', 'Made to order': 'neutral' };

function ProductCard({ p, open, reg }) {
  return (
    <Card padding={0} interactive style={{ overflow: 'hidden', height: '100%' }}>
      <div className="pc">
        <div className="pc-img">
          <img src={IMGS[p.id]} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
        </div>
        <div className="pc-b" onClick={() => open(p)}>
          <h3 className="pc-n">{p.name}</h3>
          <div className="pc-price"><span className="pc-v">{NAIRA(p.value)}</span></div>
          <div className="pc-a">
            <Button size="sm" fullWidth onClick={e => { e.stopPropagation(); reg(); }}>Start financing</Button>
            <Button size="sm" variant="ghost" fullWidth onClick={e => { e.stopPropagation(); open(p); }}>View details</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value }) {
  return <div className="row"><span className="row-l">{label}</span><span className="row-v">{value}</span></div>;
}

function ProductDetail({ p, back, reg }) {
  const [qty, setQty] = React.useState(1);
  const total = p.value * qty;
  return (
    <section className="band" style={{ background: 'var(--surface-card)' }}>
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <button type="button" className="back" onClick={back}><Icon name="arrow-left" size={16} />Back to marketplace</button>
        <div className="pd">
          <div className="pd-img anim-in anim-in-1"><img src={IMGS[p.id]} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',borderRadius:16}} /></div>
          <div className="pd-b anim-in anim-in-2">
            <span className="micro">{p.cat}</span>
            <h1 className="h1" style={{ fontSize: 'var(--fs-h1)' }}>{p.name}</h1>
            <div className="pd-v">{NAIRA(p.value)}</div>
            <p className="pd-d">{p.desc}</p>
            <div className="rows">
              <Row label="Availability" value={<Badge tone={STOCK_TONE[p.stock]}>{p.stock}</Badge>} />
              <Row label="Delivery options" value="Home delivery or pickup station" />
            </div>
            <div className="qty">
              <div>
                <div className="micro">Quantity</div>
                <div className="qty-n">{qty} {qty === 1 ? 'unit' : 'units'} · {NAIRA(total)}</div>
              </div>
              <div className="qty-c">
                <button type="button" aria-label="Decrease quantity" disabled={qty === 1} onClick={() => setQty(q => Math.max(1, q - 1))}><Icon name="minus" size={16} /></button>
                <span className="qty-v" aria-live="polite">{qty}</span>
                <button type="button" aria-label="Increase quantity" disabled={qty === 10} onClick={() => setQty(q => Math.min(10, q + 1))}><Icon name="plus" size={16} /></button>
              </div>
            </div>
            <p className="ms-n" style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>Your products are released once accumulated performance returns reach 50% of the total value.</p>
            <div className="pc-a">
              <Button size="lg" variant="ghost" iconLeft="arrow-left" onClick={back}>Back to products</Button>
              <Button size="lg" onClick={reg} style={{ minWidth: 200 }}>Start financing</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const CATS = ['All products', 'Phones', 'Laptops', 'Electronics', 'Appliances', 'Generators', 'Furniture'];

const PRICES = [
  { id: 'any', label: 'Any price', min: 0, max: Infinity },
  { id: 'u500', label: 'Under ₦500,000', min: 0, max: 499999 },
  { id: '500-1m', label: '₦500,000 – ₦1,000,000', min: 500000, max: 1000000 },
  { id: '1m-15', label: '₦1,000,000 – ₦1,500,000', min: 1000001, max: 1500000 },
  { id: 'o15', label: 'Over ₦1,500,000', min: 1500001, max: Infinity },
];

const STEPS = [
  ['01', 'Choose a product', 'Pick what you want from the marketplace and see its value and release milestone before you start.'],
  ['02', 'Create a financing commitment', 'Commit capital to a growth program attached to that product, over a three, six or twelve month term.'],
  ['03', 'Receive your product', 'Once accumulated performance returns reach 50% of the product value, it is released for delivery or pickup.'],
];

export default function Marketplace() {
  const navigate = useNavigate();
  const [cat, setCat] = React.useState('All products');
  const [sel, setSel] = React.useState(null);
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [open2, setOpen2] = React.useState(false);
  const [price, setPrice] = React.useState('any');
  const [open3, setOpen3] = React.useState(false);
  React.useEffect(() => {
    if (!open3) return;
    const close = e => { if (!e.target.closest('.pfilter')) setOpen3(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open3]);
  React.useEffect(() => {
    if (!open2) return;
    const close = e => { if (!e.target.closest('.filter')) setOpen2(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open2]);
  const open = p => { setSel(p); window.scrollTo(0, 0); };
  const back = () => { setSel(null); window.scrollTo(0, 0); };
  const go = href => navigate(href);
  const reg = () => navigate('/register');
  const login = () => navigate('/login');
  const band = PRICES.find(b => b.id === price) || PRICES[0];
  const all = PRODUCTS.filter(p => (cat === 'All products' || p.cat === cat)
    && p.value >= band.min && p.value <= band.max
    && (p.name + ' ' + p.cat).toLowerCase().includes(q.trim().toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(all.length / SIZE));
  const pg = Math.min(page, pageCount);
  const rows = all.slice((pg - 1) * SIZE, pg * SIZE);
  const pick = c => { setCat(c); setPage(1); };

  return (
    <div>
      <SiteHeader links={LINKS} activeHref="/marketplace" onNavigate={go} onLogin={login} onRegister={reg}
        logoSrc={logoOrange} />

      <section className="ab-hero-band">
        <div className="wrap ab-hero">
          <div className="ab-hero-l">
            <h1 className="ab-h1 anim-in anim-in-1">The ECharis <span className="ab-em">marketplace</span></h1>
            <p className="ab-lead anim-in anim-in-2">
              Finance the products you want through a growth program, and take delivery once your performance returns reach the release milestone.
            </p>
          </div>
        </div>
      </section>

      {sel ? <ProductDetail p={sel} back={back} reg={reg} /> : (
      <React.Fragment>
      <section className="band" style={{ background: 'var(--surface-card)' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <Reveal as="div" className="hw-in" style={{ alignItems: 'center', textAlign: 'center' }}>
            <h2 className="hw-h"><span className="hw-em">Everything you can</span><br />finance with your returns.</h2>
          </Reveal>

          <div className="mp-tools">
            <div className="mp-search">
              <Input value={q} onChange={ev => { setQ(ev.target.value); setPage(1); }} iconLeft="search"
                placeholder="Search products" aria-label="Search products" />
            </div>
            <div className="filter">
              <button type="button" className="fbtn" aria-expanded={open2} onClick={() => setOpen2(!open2)}>
                <Icon name="sliders-horizontal" size={16} />
                <span>{cat}</span>
                <Icon name={open2 ? 'chevron-up' : 'chevron-down'} size={16} />
              </button>
              {open2 && (
                <div className="fmenu" role="listbox">
                  <span className="fmenu-h">Filter by category</span>
                  {CATS.map(c => (
                    <button key={c} type="button" role="option" aria-selected={c === cat} className="fopt"
                      onClick={() => { pick(c); setOpen2(false); }}>
                      <span>{c}</span>
                      {c === cat && <Icon name="check" size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="filter pfilter">
              <button type="button" className="fbtn" aria-expanded={open3} onClick={() => setOpen3(!open3)}>
                <Icon name="banknote" size={16} />
                <span>{band.label}</span>
                <Icon name={open3 ? 'chevron-up' : 'chevron-down'} size={16} />
              </button>
              {open3 && (
                <div className="fmenu" role="listbox">
                  <span className="fmenu-h">Filter by price</span>
                  {PRICES.map(b => (
                    <button key={b.id} type="button" role="option" aria-selected={b.id === price} className="fopt"
                      onClick={() => { setPrice(b.id); setPage(1); setOpen3(false); }}>
                      <span>{b.label}</span>
                      {b.id === price && <Icon name="check" size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {rows.length ? (
            <Reveal as="div" className="pgrid reveal-group" delay={60}>
              {rows.map(p => <ProductCard key={p.id} p={p} open={open} reg={reg} />)}
            </Reveal>
          ) : (
            <Card padding={0}>
              <EmptyState icon="search-x" title="No products match your search"
                description="Try a different product name, or clear the filter to see everything in the marketplace." />
            </Card>
          )}

          {all.length > SIZE && (
            <div className="mp-pager"><Pagination page={pg} pageCount={pageCount} onChange={setPage} /></div>
          )}

        </div>
      </section>

      </React.Fragment>
      )}

      <SiteFooter logoSrc={logoWhite} columns={[
        { title: 'Platform', links: [{ label: 'Growth programs' }, { label: 'Marketplace' }, { label: 'Referral rewards' }, { label: 'Client wallet' }] },
        { title: 'Company', links: [{ label: 'About us' }, { label: 'Services' }, { label: 'Contact' }] },
        { title: 'Legal', links: [{ label: 'Terms & conditions' }, { label: 'MOU' }, { label: 'Privacy policy' }] },
      ]} />
    </div>
  );
}
