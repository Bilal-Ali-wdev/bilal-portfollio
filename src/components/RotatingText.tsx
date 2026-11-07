"use client";

import { useEffect, useState } from "react";
import { onLoaded } from "@/lib/loader";
import EvaporateText from "./EvaporateText";

/** Cycles through `words`, evaporating each into the next. Starts once the preloader is done. */
export default function RotatingText({
  words,
  interval = 3200,
  className,
}: {
  words: readonly string[];
  interval?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    let timer = 0;
    const stop = onLoaded(() => {
      // first word condenses in on load; start cycling after it settles
      timer = window.setInterval(() => setI((n) => (n + 1) % words.length), interval);
    });
    return () => {
      stop();
      window.clearInterval(timer);
    };
  }, [words.length, interval]);

  return <EvaporateText text={words[i]} className={className} animateFirst />;
}
