"use client";

import { site } from "@/data/site";
import { useScrollTo } from "@/lib/useScrollTo";
import { openContact } from "@/lib/contact";
import SmoothLink from "../SmoothLink";
import Split from "../Split";

const MENU = [
  { label: "Home", href: "#home" },
  { label: "Works", href: "#work" },
  { label: "About me", href: "#about" },
  { label: "Stack", href: "#stack" },
];

export default function Footer() {
  const scrollTo = useScrollTo();

  return (
    <footer id="contact" className="footer">
      <div className="footer-inner">
      <div className="footer-grid">
        <div>
          <h2 data-anim="rise">
            <span className="footer-line">
              <Split text="Let's build" />
            </span>
            <span className="footer-line footer-muted">
              <Split text="something that scales." />
            </span>
          </h2>
          <button type="button" onClick={openContact} className="footer-cta" data-magnetic="0.3" aria-haspopup="dialog">
            {site.ctaLabel} <span className="arrow" aria-hidden="true">↗</span>
          </button>
        </div>

        <nav className="footer-nav" aria-label="Footer menu">
          <span className="mono">Menu</span>
          {MENU.map((m) => (
            <SmoothLink key={m.href} href={m.href}>
              {m.label}
            </SmoothLink>
          ))}
        </nav>

        <nav className="footer-nav" aria-label="Contact">
          <span className="mono">Contact</span>
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {s.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="footer-bottom">
        <span className="mono">
          © {site.year} {site.name}
        </span>
        <button type="button" className="to-top" onClick={() => scrollTo(0)} data-magnetic="0.35">
          BACK TO TOP <span aria-hidden="true">↑</span>
        </button>
        <span className="mono">Built and deployed by {site.name}</span>
      </div>
      </div>
    </footer>
  );
}
