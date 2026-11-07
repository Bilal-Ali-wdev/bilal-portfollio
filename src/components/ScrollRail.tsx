"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useLenis } from "lenis/react";
import { useScrollTo } from "@/lib/useScrollTo";
import "./ScrollRail.css";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "work", label: "Works" },
  { id: "experiments", label: "AI Lab" },
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
];

const MIN_THUMB = 44;
const IDLE_MS = 1400;

/**
 * Custom scrollbar: a slim rail with section markers, a velocity-stretched thumb
 * and a live percentage. Replaces the native scrollbar on mouse/trackpad devices.
 */
export default function ScrollRail() {
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  const [ticks, setTicks] = useState<{ id: string; label: string; at: number }[]>([]);
  const [active, setActive] = useState("home");

  const geo = useRef({ trackH: 0, thumbH: MIN_THUMB, scrollable: 1 });
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);
  const idle = useRef(0);
  const stretch = useRef(1);

  // where each section sits along the rail (0–1)
  const measure = useCallback(() => {
    const doc = document.documentElement;
    const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
    const trackH = rail.current?.clientHeight ?? 0;
    const thumbH = Math.max(MIN_THUMB, trackH * (window.innerHeight / doc.scrollHeight));
    geo.current = { trackH, thumbH, scrollable };
    if (thumb.current) thumb.current.style.height = `${thumbH}px`;

    setTicks(
      SECTIONS.flatMap((s) => {
        const el = document.getElementById(s.id);
        if (!el) return [];
        const top = el.getBoundingClientRect().top + window.scrollY - 88;
        return [{ ...s, at: Math.min(1, Math.max(0, top / scrollable)) }];
      })
    );
  }, []);

  const wake = () => {
    rail.current?.classList.add("is-awake");
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => {
      if (!drag.current) rail.current?.classList.remove("is-awake");
    }, IDLE_MS);
  };

  // move the thumb + readout on every scroll frame
  const paint = useCallback((scroll: number, velocity: number) => {
    const { trackH, thumbH, scrollable } = geo.current;
    const p = Math.min(1, Math.max(0, scroll / scrollable));
    // fast scrolling stretches the thumb a little, then it springs back
    const target = 1 + Math.min(Math.abs(velocity) * 0.012, 0.45);
    stretch.current += (target - stretch.current) * 0.25;
    const y = p * (trackH - thumbH);
    if (thumb.current) {
      thumb.current.style.transform = `translate3d(0, ${y}px, 0) scaleY(${stretch.current.toFixed(3)})`;
      thumb.current.style.transformOrigin = velocity >= 0 ? "50% 0" : "50% 100%";
    }
    if (percent.current) {
      percent.current.textContent = `${String(Math.round(p * 100)).padStart(2, "0")}%`;
      percent.current.style.transform = `translate3d(0, ${y + thumbH / 2}px, 0)`;
    }
  }, []);

  useLenis(
    (l) => {
      paint(l.scroll, l.velocity);
      if (Math.abs(l.velocity) > 0.1) wake();
      // active section = last one whose marker we've passed
      const p = l.scroll / geo.current.scrollable;
      let current = "home";
      for (const t of ticks) if (p >= t.at - 0.002) current = t.id;
      setActive((prev) => (prev === current ? prev : current));
    },
    [ticks, paint]
  );

  useEffect(() => {
    // native scrollbar off — this rail replaces it (fine pointers only, see CSS)
    document.documentElement.classList.add("has-scroll-rail");
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    const raf = requestAnimationFrame(() => {
      measure();
      paint(window.scrollY, 0);
    });
    return () => {
      document.documentElement.classList.remove("has-scroll-rail");
      ro.disconnect();
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
      window.clearTimeout(idle.current);
    };
  }, [measure, paint]);

  const jumpTo = (y: number, immediate: boolean) => {
    if (lenis) lenis.scrollTo(y, { immediate, duration: immediate ? 0 : 1.2 });
    else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
  };

  // drag the thumb
  const onThumbDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: window.scrollY };
    rail.current?.classList.add("is-dragging", "is-awake");
  };
  const onThumbMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const { trackH, thumbH, scrollable } = geo.current;
    const ratio = scrollable / Math.max(1, trackH - thumbH);
    jumpTo(drag.current.startScroll + (e.clientY - drag.current.startY) * ratio, true);
  };
  const onThumbUp = () => {
    drag.current = null;
    rail.current?.classList.remove("is-dragging");
    wake();
  };

  // click the empty track to glide there
  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const { thumbH, trackH, scrollable } = geo.current;
    const p = (e.clientY - r.top - thumbH / 2) / Math.max(1, trackH - thumbH);
    jumpTo(Math.min(1, Math.max(0, p)) * scrollable, false);
  };

  return (
    <div ref={rail} className="scroll-rail" aria-hidden="true" onPointerEnter={wake}>
      <div className="scroll-rail-track" onPointerDown={onTrackDown}>
        <span className="scroll-rail-line" />

        {ticks.map((t) => (
          <button
            key={t.id}
            type="button"
            tabIndex={-1}
            className={`scroll-rail-tick${active === t.id ? " is-active" : ""}`}
            style={{ top: `${t.at * 100}%` }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => scrollTo(t.id === "home" ? 0 : t.id)}
          >
            <span className="scroll-rail-label">{t.label}</span>
          </button>
        ))}

        <div
          ref={thumb}
          className="scroll-rail-thumb"
          onPointerDown={onThumbDown}
          onPointerMove={onThumbMove}
          onPointerUp={onThumbUp}
          onPointerCancel={onThumbUp}
        />
        <span ref={percent} className="scroll-rail-percent">
          00%
        </span>
      </div>
    </div>
  );
}
