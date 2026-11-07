"use client";

import { useEffect, useRef, useState } from "react";
import { onLoaded, prefersReducedMotion } from "@/lib/loader";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>[]";

/** Mono label that decodes from random glyphs the first time it scrolls into view. */
export default function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    let io: IntersectionObserver | undefined;

    const run = () => {
      const chars = Array.from(text);
      const resolveAt = chars.map((_, i) => 6 + i * 1.4 + Math.random() * 8);
      let frame = 0;
      const tick = () => {
        frame++;
        let done = true;
        const next = chars
          .map((c, i) => {
            if (c === " " || frame >= resolveAt[i]) return c;
            done = false;
            return GLYPHS[(Math.random() * GLYPHS.length) | 0];
          })
          .join("");
        setOut(next);
        if (!done) raf = requestAnimationFrame(tick);
      };
      tick();
    };

    const stop = onLoaded(() => {
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io?.disconnect();
            run();
          }
        },
        { rootMargin: "0px 0px -8% 0px" }
      );
      io.observe(el);
    });

    return () => {
      stop();
      io?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <p ref={ref} className={`mono ${className}`.trim()} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </p>
  );
}
