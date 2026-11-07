import { hero, site } from "@/data/site";
import Avatar from "../Avatar";
import SmoothLink from "../SmoothLink";

export default function Hero() {
  const lines = [...hero.headline.map((t) => ({ t, muted: false })), { t: hero.headlineMuted, muted: true }];

  return (
    <section id="home" className="hero">
      <div className="hero-meta mono">
        <span>(Portfolio {site.year})</span>
        <span>{site.domain}</span>
      </div>

      <div className="hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title">
            {lines.map(({ t, muted }, i) => (
              <span key={i} className="line-mask">
                <span className={muted ? "muted" : undefined} style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                  {t}
                </span>
              </span>
            ))}
          </h1>

          <div className="hero-actions" style={{ animation: "rise-soft 1s 0.5s var(--ease-out) both" }}>
            <SmoothLink href="#about" className="btn btn-ghost">
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
          <p className="greeting">{hero.greeting}</p>
          <svg
            className="greet-arrow"
            aria-hidden="true"
            width="90"
            height="90"
            viewBox="0 0 90 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M5 10c40-6 64 14 66 58" />
            <path d="m60 58 11 12 7-15" />
          </svg>
          <Avatar />
        </div>
      </div>
    </section>
  );
}
