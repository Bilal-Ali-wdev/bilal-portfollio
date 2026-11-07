"use client";

import { useLenis } from "lenis/react";
import { useCallback } from "react";

const HEADER_OFFSET = -88;

/** Smooth-scrolls to a section id (or the top) through Lenis, with a native fallback. */
export function useScrollTo() {
  const lenis = useLenis();

  return useCallback(
    (target: string | 0) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const el = target === 0 ? null : document.getElementById(target.replace(/^#/, ""));
      if (target !== 0 && !el) return;

      if (lenis) {
        lenis.scrollTo(el ?? 0, {
          offset: el ? HEADER_OFFSET : 0,
          duration: 1.4,
          immediate: reduce,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        });
      } else {
        const top = el ? el.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET : 0;
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      }
    },
    [lenis]
  );
}
