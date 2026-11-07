"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useLenis } from "lenis/react";
import { prefersReducedMotion } from "@/lib/loader";

/**
 * Infinite marquee whose speed and skew follow scroll velocity,
 * and whose direction flips with the scroll direction.
 */
export default function VelocityMarquee({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  const motion = useRef({ velocity: 0, direction: 1 });

  useLenis((l) => {
    motion.current.velocity = l.velocity;
    if (l.direction) motion.current.direction = l.direction;
  });

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;

    const setX = gsap.quickSetter(el, "x", "px");
    const setSkew = gsap.quickSetter(el, "skewX", "deg");
    let x = 0;
    let skew = 0;

    const tick = (_t: number, deltaMs: number) => {
      const dt = deltaMs / 1000;
      const { velocity, direction } = motion.current;
      const half = el.scrollWidth / 2;
      const speed = 60 + Math.min(Math.abs(velocity) * 40, 900);
      x -= speed * direction * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      skew += (gsap.utils.clamp(-10, 10, -velocity * 0.6) - skew) * 0.12;
      setX(x);
      setSkew(skew);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const row = (key: string) => (
    <div className="marquee-row" key={key} aria-hidden={key === "b" ? "true" : undefined}>
      {items.map((item, i) => (
        <span className="marquee-item" key={i}>
          {item}
          <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true" className="marquee-star">
            <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee">
      <div ref={track} className="marquee-track">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
