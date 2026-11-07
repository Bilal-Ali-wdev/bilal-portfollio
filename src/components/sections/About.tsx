import type { CSSProperties } from "react";
import Image from "next/image";
import { about } from "@/data/site";
import Reveal from "../Reveal";
import Scramble from "../Scramble";
import Split from "../Split";

export default function About() {
  return (
    <section id="about" className="section">
      <Scramble text="(04) — ABOUT" className="section-label" />
      <h2 className="display" style={{ maxWidth: 1000 }} data-anim="fill">
        <Split text={about.headline} muted={about.headlineMuted} />
      </h2>

      <div className="about-journey">
        <Reveal>
          <p className="mono" style={{ margin: "0 0 12px" }}>
            Journey
          </p>
          <ol className="journey">
            {about.journey.map((j, i) => (
              <li key={i} className="journey-row" style={{ "--d": `${0.15 + i * 0.08}s` } as CSSProperties}>
                <span className="journey-logo">
                  <Image src={j.logo} alt="" width={64} height={64} unoptimized />
                </span>
                <span className="journey-text">
                  <span className="journey-role">{j.role}</span>
                  <span className="journey-org">
                    {j.org}
                    {j.current && <span className="journey-now">Current</span>}
                  </span>
                </span>
                <span className="journey-period mono">{j.period}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
