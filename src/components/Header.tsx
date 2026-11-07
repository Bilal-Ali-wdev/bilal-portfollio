"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import { useScrollTo } from "@/lib/useScrollTo";
import { site } from "@/data/site";
import { openContact } from "@/lib/contact";
import ThemeToggle from "./ThemeToggle";
import { AboutIcon, DotsIcon, HomeIcon, LabIcon, StackIcon, WorkIcon } from "./icons";

const NAV = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "work", label: "Work", Icon: WorkIcon },
  { id: "experiments", label: "AI Lab", Icon: LabIcon },
  { id: "about", label: "About", Icon: AboutIcon },
  { id: "stack", label: "Stack", Icon: StackIcon },
] as const;

const TRACKED = [...NAV.map((n) => n.id), "contact"];

export default function Header() {
  const scrollTo = useScrollTo();
  const [active, setActive] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
      const probe = window.innerHeight * 0.4;
      let current = "home";
      for (const id of TRACKED) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      // Bottom of the page always counts as the last section.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = "contact";
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollTo(id === "home" ? 0 : id);
    history.replaceState(null, "", `#${id}`);
  };

  const index = NAV.findIndex((n) => n.id === active);

  return (
    <header className={`header${scrolled ? " is-scrolled" : ""}`}>
      <div className="scroll-progress" aria-hidden="true">
        <span />
      </div>

      <div className="header-inner">
      <a href="#home" onClick={go("home")} className="brand" aria-label="Bilal Ali — back to top">
        <Image
          src="/bilal-logo.svg"
          alt="Bilal Ali"
          width={590}
          height={194}
          priority
          className="brand-logo invert-dark"
        />
      </a>

      <nav className="nav" aria-label="Primary">
        <div className="nav-icons">
          <span
            className="nav-indicator"
            aria-hidden="true"
            style={{ transform: `translateX(${Math.max(index, 0) * 42}px)`, opacity: index < 0 ? 0 : 1 }}
          />
          {NAV.map(({ id, label, Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              className="nav-btn"
              aria-label={label}
              data-label={label}
              aria-current={active === id ? "true" : undefined}
            >
              <Icon />
            </a>
          ))}
        </div>

        <ThemeToggle />
      </nav>

      <div className="header-end">
        <button type="button" onClick={openContact} className="cta-pill" data-magnetic="0.2" aria-haspopup="dialog">
          <span className="cta-dot">
            <DotsIcon />
          </span>
          <span>{site.ctaLabel}</span>
        </button>
      </div>
      </div>
    </header>
  );
}
