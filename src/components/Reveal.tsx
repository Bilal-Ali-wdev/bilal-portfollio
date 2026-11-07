"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { onLoaded } from "@/lib/loader";

type Props = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  /** "up" fades and lifts; "clip" wipes open from the bottom like a curtain. */
  variant?: "up" | "clip";
};

/** Animates its content in the first time it scrolls into view (after the preloader). */
export default function Reveal({ children, as: Tag = "div", delay = 0, className = "", variant = "up" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let io: IntersectionObserver | undefined;
    const stop = onLoaded(() => {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add("is-in");
            io?.disconnect();
          }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
      );
      io.observe(el);
    });
    return () => {
      stop();
      io?.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${className}`.trim()}
      style={{ "--delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
