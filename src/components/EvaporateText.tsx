"use client";

import { useState, type CSSProperties } from "react";
import { seeded } from "@/lib/loader";

type Props = {
  text: string;
  className?: string;
  /** Condense the very first word in too (otherwise it just appears). */
  animateFirst?: boolean;
};

/**
 * Whenever `text` changes, the old word evaporates — each letter drifts up,
 * blurs and fades like vapour — while the new word condenses into place.
 */
export default function EvaporateText({ text, className = "", animateFirst = false }: Props) {
  const [state, setState] = useState({ cur: text, prev: null as string | null, n: 0 });

  // Derive state from the prop change during render (React-recommended pattern).
  if (text !== state.cur) {
    setState({ cur: text, prev: state.cur, n: state.n + 1 });
  }

  const inMode = state.n === 0 && !animateFirst ? "static" : "in";

  return (
    <span className={`evap ${className}`.trim()}>
      <span className="sr-only">{state.cur}</span>
      {state.prev !== null && <Chars key={`o${state.n}`} text={state.prev} mode="out" seed={state.n * 97} />}
      <Chars key={`i${state.n}`} text={state.cur} mode={inMode} seed={state.n * 131 + 7} />
    </span>
  );
}

function Chars({ text, mode, seed }: { text: string; mode: "in" | "out" | "static"; seed: number }) {
  return (
    <span className={`evap-word evap-${mode}`} aria-hidden="true">
      {Array.from(text).map((ch, i) => {
        const r1 = seeded(seed + i * 3.1);
        const r2 = seeded(seed + i * 7.7 + 1);
        const r3 = seeded(seed + i * 11.3 + 2);
        const style = {
          "--i": i,
          "--dx": `${((r1 - 0.5) * 0.7).toFixed(3)}em`,
          "--dy": `${(-0.45 - r2 * 0.9).toFixed(3)}em`,
          "--r": `${((r3 - 0.5) * 50).toFixed(1)}deg`,
        } as CSSProperties;
        return (
          <span key={i} className="evap-char" style={style}>
            {ch === " " ? " " : ch}
          </span>
        );
      })}
    </span>
  );
}
