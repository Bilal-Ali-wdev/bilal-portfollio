import { hero } from "@/data/site";
import Avatar from "../Avatar";
import SmoothLink from "../SmoothLink";
import RotatingText from "../RotatingText";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title">
            {hero.headline.map((t, i) => (
              <span key={i} className="line-mask">
                <span style={{ animationDelay: `${0.15 + i * 0.1}s` }}>{t}</span>
              </span>
            ))}
            <span className="line-evap muted">
              <RotatingText words={hero.headlineRotating} />
            </span>
          </h1>

          <div className="hero-actions" style={{ animation: "rise-soft 1s 0.5s var(--ease-out) both" }}>
            <SmoothLink href="#about" className="btn btn-ghost" data-magnetic="0.25">
              About me
            </SmoothLink>
            <SmoothLink href="#work" className="btn btn-solid">
              See my work <span className="arrow" aria-hidden="true">↗</span>
            </SmoothLink>
          </div>

          <div className="hero-sub" style={{ animation: "fade-in 1s 0.8s ease both" }}>
            <p>{hero.subline1}</p>
            <p>{hero.subline2}</p>
            <p className="scroll-cue mono">
              <span>Scroll</span>
              <span aria-hidden="true">↓</span>
            </p>
          </div>
        </div>

        <div className="hero-art">
          <p className="greeting">
            {hero.greeting}
            {/* hand-drawn arrow: starts at the end of the text, lands on the avatar's head */}
            <svg
            className="greet-arrow"
            aria-hidden="true"
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 12c38-8 66 12 68 60" />
            <path d="m62 62 12 12 9-15" />
            </svg>
          </p>
          <Avatar />
        </div>
      </div>
    </section>
  );
}
