import { about } from "@/data/site";
import Reveal from "../Reveal";

export default function About() {
  return (
    <section id="about" className="section">
      <Reveal>
        <p className="mono section-label">(04) — About</p>
        <h2 className="display" style={{ maxWidth: 1000 }}>
          {about.headline} <span className="muted">{about.headlineMuted}</span>
        </h2>
      </Reveal>

      <div className="grid-2 about-grid">
        <Reveal>
          <p className="bio">{about.bio}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mono" style={{ margin: "0 0 12px" }}>
            Journey
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {about.journey.map((j, i) => (
              <li key={i} className="journey-row">
                <span>{j.title}</span>
                <span className="mono">{j.period}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
