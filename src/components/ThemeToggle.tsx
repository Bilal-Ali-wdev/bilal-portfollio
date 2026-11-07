"use client";

import { MoonIcon, SunIcon } from "./icons";

export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable — theme still applies for this visit */
    }
  };

  return (
    <button type="button" className="theme-btn" onClick={toggle} aria-label="Toggle dark mode">
      <MoonIcon className="icon-moon" />
      <SunIcon className="icon-sun" />
    </button>
  );
}
