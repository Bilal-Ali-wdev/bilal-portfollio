"use client";

import type { CSSProperties, ReactNode } from "react";
import { seeded } from "@/lib/loader";
import "./SuccessBurst.css";

const COLORS = ["#60a5fa", "#a78bfa", "#fbbf24", "#34d399", "#fb7185", "#93c5fd"];
const SHAPES = ["is-rect", "is-dot", "is-strip"] as const;

// Confetti pieces — deterministic (seeded), so rendering stays pure.
const PIECES = Array.from({ length: 34 }, (_, i) => {
  const r = (k: number) => seeded(i * 13.7 + k);
  const angle = r(1) * Math.PI * 2;
  const dist = 70 + r(2) * 110;
  return {
    shape: SHAPES[i % SHAPES.length],
    style: {
      "--tx": `${(Math.cos(angle) * dist).toFixed(1)}px`,
      "--ty": `${(Math.sin(angle) * dist * 0.75 - 40).toFixed(1)}px`,
      "--rot": `${Math.round((r(3) - 0.5) * 720)}deg`,
      "--delay": `${(r(4) * 0.18).toFixed(2)}s`,
      "--c": COLORS[i % COLORS.length],
    } as CSSProperties,
  };
});

/**
 * A playful "it worked" moment: a check badge pops in, a paper plane takes off
 * along a dashed trail, and confetti bursts and drifts down. No "congratulations"
 * text — just the animation and a light line of copy.
 */
export default function SuccessBurst({
  title,
  children,
  compact = false,
}: {
  title: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`sb${compact ? " is-compact" : ""}`} role="status">
      <div className="sb-stage" aria-hidden="true">
        {/* paper plane flying off along its trail */}
        <svg className="sb-trail" viewBox="0 0 240 150" fill="none">
          <path className="sb-trail-path" d="M120 95 C 150 120, 200 110, 205 70 C 210 35, 170 25, 160 50 C 150 75, 200 60, 236 14" />
        </svg>
        <span className="sb-plane">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M2.5 11.2 20.6 3.3c.8-.3 1.5.4 1.2 1.2l-7.9 18.1c-.3.8-1.5.8-1.8 0l-2.4-6.3-6.3-2.4c-.8-.3-.8-1.5 0-1.8Zm8.9 4.2 1.6 4.1 5.6-12.9-7.2 8.8Z" />
          </svg>
        </span>

        {/* ripple rings */}
        <span className="sb-ring" />
        <span className="sb-ring is-late" />

        {/* confetti */}
        <span className="sb-confetti">
          {PIECES.map((p, i) => (
            <i key={i} className={p.shape} style={p.style} />
          ))}
        </span>

        {/* the badge */}
        <span className="sb-badge">
          <svg viewBox="0 0 52 52" width="34" height="34" fill="none">
            <path className="sb-check" d="m15 27 7.5 7.5L38 18" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <strong className="sb-title">{title}</strong>
      {children && <div className="sb-text">{children}</div>}
    </div>
  );
}
