"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useScrollTo } from "@/lib/useScrollTo";

/** An in-page anchor that scrolls through Lenis instead of jumping. */
export default function SmoothLink({ href = "#", onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const scrollTo = useScrollTo();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!href.startsWith("#") || href === "#") return;
    e.preventDefault();
    const id = href.slice(1);
    scrollTo(id === "home" ? 0 : id);
    history.replaceState(null, "", href);
  };

  return <a href={href} onClick={handle} {...rest} />;
}
