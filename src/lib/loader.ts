"use client";

/** Fired once the preloader starts revealing the page. */
export const LOADED_EVENT = "app:loaded";

export function isLoaded() {
  return typeof document !== "undefined" && !document.documentElement.classList.contains("is-loading");
}

/** Runs `cb` once the page has been revealed (immediately if it already has). Returns a cleanup. */
export function onLoaded(cb: () => void) {
  if (isLoaded()) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(LOADED_EVENT, handler, { once: true });
  return () => window.removeEventListener(LOADED_EVENT, handler);
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Small deterministic pseudo-random number in [0, 1) — same on server and client. */
export function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
