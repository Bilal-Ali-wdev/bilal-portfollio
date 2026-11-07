"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { LOADED_EVENT, prefersReducedMotion } from "@/lib/loader";
import { site } from "@/data/site";

const GREETINGS = ["Hello", "Salam", "Hola", "Bonjour", "Ciao", "Hallo", "Merhaba"];

const CURVED = "M0 0 L100 0 L100 0 Q50 100 0 0 Z";
const FLAT = "M0 0 L100 0 L100 0 Q50 0 0 0 Z";

export default function Preloader() {
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const curve = useRef<SVGPathElement>(null);
  const lenis = useLenis();

  // Keep the page locked while the loader is up.
  useEffect(() => {
    if (!gone) lenis?.stop();
    else lenis?.start();
  }, [lenis, gone]);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const html = document.documentElement;
    const reduce = prefersReducedMotion();

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true })),
    ]);

    let cancelled = false;
    let greetTimer = 0;

    const ctx = gsap.context(() => {
      const progress = { v: 0 };
      let g = 0;

      const tl = gsap.timeline({ paused: true });

      // Greeting carousel
      const swap = () => {
        if (!word.current) return;
        g = (g + 1) % GREETINGS.length;
        gsap
          .timeline()
          .to(word.current, { yPercent: -60, opacity: 0, filter: "blur(6px)", duration: 0.18, ease: "power2.in" })
          .add(() => {
            if (word.current) word.current.textContent = GREETINGS[g];
          })
          .fromTo(
            word.current,
            { yPercent: 60, opacity: 0, filter: "blur(6px)" },
            { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.22, ease: "power2.out" }
          );
      };
      greetTimer = reduce ? 0 : window.setInterval(swap, 260);

      tl.to(progress, {
        v: 100,
        duration: reduce ? 0.3 : 2.2,
        ease: "power2.inOut",
        onUpdate: () => {
          const v = Math.round(progress.v);
          if (count.current) count.current.textContent = String(v).padStart(3, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${progress.v / 100})`;
        },
      });

      const exit = () => {
        if (cancelled) return;
        window.clearInterval(greetTimer);
        if (word.current) word.current.textContent = `${site.name}.`;

        gsap
          .timeline({
            onComplete: () => {
              html.classList.remove("has-preloader");
              setGone(true);
              ScrollTrigger.refresh();
            },
          })
          .to(".preloader-content", { y: -40, opacity: 0, duration: 0.5, ease: "power3.in", delay: 0.35 })
          .add(() => {
            html.classList.remove("is-loading");
            window.dispatchEvent(new Event(LOADED_EVENT));
          }, "-=0.1")
          .to(root.current, { yPercent: -100, duration: reduce ? 0.01 : 1.1, ease: "power4.inOut" }, "<")
          .fromTo(
            curve.current,
            { attr: { d: CURVED } },
            { attr: { d: FLAT }, duration: 1.1, ease: "power4.inOut" },
            "<"
          );
      };

      tl.play();
      Promise.all([ready, new Promise((r) => tl.eventCallback("onComplete", r))]).then(exit);
    }, root);

    return () => {
      cancelled = true;
      window.clearInterval(greetTimer);
      ctx.revert();
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <div className="preloader-content">
        <div className="preloader-top mono">
          <span>(Portfolio {site.year})</span>
          <span>Full stack · Gen AI · DevOps</span>
        </div>

        <p className="preloader-word">
          <span className="preloader-dot" />
          <span ref={word}>{GREETINGS[0]}</span>
        </p>

        <div className="preloader-bottom">
          <span className="mono">Code · Ship · Scale</span>
          <span className="preloader-count">
            <span ref={count}>000</span>
            <small>%</small>
          </span>
        </div>
        <span className="preloader-bar">
          <span ref={bar} />
        </span>
      </div>

      <svg className="preloader-curve" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path ref={curve} d={CURVED} />
      </svg>
    </div>
  );
}
