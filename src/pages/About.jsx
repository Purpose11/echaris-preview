import React from "react";
import { useNavigate } from "react-router-dom";

import { Reveal } from "../components/Reveal.jsx";
import { Button } from "../design-system/components/core/Button.jsx";
import { Icon } from "../design-system/components/core/Icon.jsx";

function Head({ eyebrow, title, lead, align, maxWidth = 640 }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth,
        margin: align === "center" ? "0 auto" : undefined,
        textAlign: align,
      }}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="h2">{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

const SERVICES = [
  [
    "trending-up",
    "Capital growth programs",
    "Structured programs that allow clients to commit capital and track performance over a defined period.",
  ],
  [
    "activity",
    "Performance tracking",
    "Clients get visibility into their monthly performance returns and account activity.",
  ],
  [
    "store",
    "Marketplace financing",
    "Clients access eligible products through structured marketplace financing using accumulated performance returns.",
  ],
  [
    "users",
    "Referral rewards",
    "Clients refer others with a unique referral code and earn rewards once referral requirements are completed.",
  ],
];

const OBJECTIVES = [
  [
    "01",
    "Structured growth",
    "Give clients an organised way to manage their capital commitments and financial goals.",
  ],
  [
    "02",
    "Transparency",
    "Provide clear visibility into client activities, performance and transactions.",
  ],
  [
    "03",
    "Accessibility",
    "Use digital tools to make the platform's services convenient and accessible to clients.",
  ],
  [
    "04",
    "Platform growth",
    "Build a scalable digital ecosystem capable of expanding into additional services and platforms.",
  ],
];

const VALUES = [
  ["scale", "Integrity", "Operate with honesty, accountability and responsibility."],
  [
    "eye",
    "Transparency",
    "Provide clients with clear and understandable information about their activities.",
  ],
  [
    "shield-check",
    "Security",
    "Prioritise the protection of client information and account activity.",
  ],
  ["lightbulb", "Innovation", "Use technology to improve accessibility and convenience."],
  [
    "heart-handshake",
    "Client focus",
    "Design services around the needs and experience of the people we serve.",
  ],
  [
    "sprout",
    "Growth",
    "Create structured opportunities aligned with long-term financial goals.",
  ],
];

const WHY = [
  [
    "layout-grid",
    "One digital platform",
    "Manage capital commitments, performance returns, marketplace financing and referral rewards from one account.",
  ],
  [
    "eye",
    "Clear visibility",
    "Track account activity, performance, transactions and program progress through the client dashboard.",
  ],
  [
    "sliders-horizontal",
    "Flexible programs",
    "Choose from available 3-month, 6-month and 12-month growth programs.",
  ],
  [
    "store",
    "Connected marketplace",
    "Access eligible products through the ECharis marketplace financing system.",
  ],
];

const ORG = [
  ["Registered company name", "ECharis Trading Limited", false],
  ["CAC registration", "RC 9450649", false],
  ["Business location", "Nigeria", false],
  ["Company address", "Company information to be supplied", true],
  ["Contact email", "Company information to be supplied", true],
  ["Phone number", "Company information to be supplied", true],
];

export default function About() {
  const navigate = useNavigate();
  const go = (href) => navigate(href);
  const reg = () => navigate("/register");
  return (
    <div>
      <section className="ab-hero-band">
        <div className="wrap ab-hero">
          <div className="ab-hero-l">
            <h1 className="ab-h1 anim-in anim-in-1">
              About <span className="ab-em">ECharis</span>
            </h1>
            <p className="ab-lead anim-in anim-in-2">
              A structured digital platform for capital growth, performance tracking, and
              marketplace financing.
            </p>
          </div>
        </div>
      </section>

      <section className="band" style={{ background: "var(--surface-card)" }}>
        <div
          className="wrap"
          style={{ display: "flex", flexDirection: "column", gap: 32 }}
        >
          <Reveal as="div" className="hw-in">
            <span className="hw-pill">About us</span>
            <h2 className="hw-h">
              <span className="hw-em">A registered</span>
              <br />
              Nigerian growth platform.
            </h2>
          </Reveal>

          <Reveal as="div" className="wwa" delay={100}>
            <p className="wwa-p">
              ECharis Trading Limited is a Nigerian company registered with the Corporate
              Affairs Commission under RC 9450649. The company operates a digital platform
              where clients commit trading capital to a growth program of three, six or
              twelve months, follow their performance returns month by month, and direct
              those accumulated returns toward products in the ECharis marketplace.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="band-tight" style={{ background: "var(--surface-page)" }}>
        <div className="wrap mv">
          <Reveal as="div" className="mv-c mv-m">
            <span className="mv-ic">
              <Icon name="target" size={24} />
            </span>
            <h2 className="mv-t">Our mission</h2>
            <p className="mv-d">
              To give every client a clear, documented route to grow capital and to
              convert that growth into products and outcomes they can use, on terms stated
              before they commit.
            </p>
          </Reveal>
          <Reveal as="div" className="mv-c mv-v" delay={120}>
            <span className="mv-ic">
              <Icon name="eye" size={24} />
            </span>
            <h2 className="mv-t">Our vision</h2>
            <p className="mv-d">
              To be the digital platform Nigerians trust for structured capital growth and
              marketplace access, judged on transparency rather than promises.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="band" style={{ background: "var(--surface-card)" }}>
        <div
          className="wrap"
          style={{ display: "flex", flexDirection: "column", gap: 44 }}
        >
          <Reveal as="div" className="hw-in">
            <span className="hw-pill">What we do</span>
            <h2 className="hw-h">
              <span className="hw-em">Four services</span>
              <br />
              on one client account.
            </h2>
            <p className="hw-lead">
              Everything a client needs to commit capital, follow returns and finance a
              product.
            </p>
          </Reveal>
          <Reveal as="div" className="svc reveal-group" delay={80}>
            {SERVICES.map(([icon, t, d]) => (
              <div className="svc-c" key={t}>
                <span className="svc-ic">
                  <Icon name={icon} size={22} />
                </span>
                <h3 className="svc-t">{t}</h3>
                <p className="svc-d">{d}</p>
              </div>
            ))}
          </Reveal>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button size="lg" iconRight="arrow-right" onClick={() => go("/services")}>
              Explore Our Services
            </Button>
          </div>
        </div>
      </section>

      <section className="band" style={{ background: "var(--neutral-900)" }}>
        <div
          className="wrap"
          style={{ display: "flex", flexDirection: "column", gap: 44 }}
        >
          <Reveal as="div" className="hw-in hw-dark">
            <span className="hw-pill">What we stand for</span>
            <h2 className="hw-h">
              <span className="hw-em">Six values</span>
              <br />
              every client account is held to.
            </h2>
          </Reveal>
          <Reveal as="div" className="vals reveal-group" delay={80}>
            {VALUES.map(([icon, t, d]) => (
              <div className="val-c" key={t}>
                <Icon name={icon} size={22} />
                <h3 className="val-t">{t}</h3>
                <p className="val-d">{d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <Reveal as="div" className="cta-panel">
            <div className="cta-l">
              <h2 className="cta-h">Ready to get started?</h2>
              <p className="cta-p">
                Create your ECharis client account and explore our capital growth and
                marketplace financing services.
              </p>
            </div>
            <div className="cta-r">
              <div className="cta-b">
                <Button size="lg" onClick={reg}>
                  Create Account
                </Button>
                <Button size="lg" variant="inverse" onClick={() => go("/services")}>
                  Explore Services
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
