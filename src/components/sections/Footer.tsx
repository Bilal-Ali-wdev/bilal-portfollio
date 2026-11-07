"use client";

import { site } from "@/data/site";
import { useScrollTo } from "@/lib/useScrollTo";
import SmoothLink from "../SmoothLink";

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
      <div className="footer-grid">
        <div>
          <h2>
            Let&apos;s build
            <br />
            <span>something good.</span>
          </h2>
          <a href={site.socials[0].href} className="footer-cta">
            {site.ctaLabel} <span className="arrow" aria-hidden="true">↗</span>
          </a>
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
        <button type="button" className="to-top" onClick={() => scrollTo(0)}>
          BACK TO TOP <span aria-hidden="true">↑</span>
        </button>
        <span className="mono">Designed and built by {site.name}</span>
      </div>
    </footer>
  );
}
