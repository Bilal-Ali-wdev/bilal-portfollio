import { experiments } from "@/data/site";
import Reveal from "../Reveal";

export default function Experiments() {
  return (
    <section id="experiments" className="section">
      <Reveal>
        <p className="mono section-label">(03) — Lab</p>
        <h2 className="display">
          AI Experiments<span className="muted">, side projects &amp; playgrounds.</span>
        </h2>
      </Reveal>

      <div className="grid-3" style={{ gap: 24, marginTop: 48 }}>
        {experiments.map((x, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <article className="card lab-card">
              <div className={`cover cover-${x.cover}`}>
                <div className="cover-inner" />
              </div>
              <h3>{x.name}</h3>
              <p>{x.body}</p>
              <a href={x.href} className="link">
                Give it a try <span className="arrow arrow-right" aria-hidden="true">→</span>
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
