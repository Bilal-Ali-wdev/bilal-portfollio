import { clients, intro } from "@/data/site";
import Reveal from "../Reveal";

export default function Intro() {
  return (
    <section className="section">
      <Reveal>
        <p className="mono section-label" style={{ marginBottom: 40 }}>
          (01) — Intro
        </p>
      </Reveal>

      <div className="grid-3">
        {intro.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.1} className="intro-item">
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="mono" style={{ margin: "96px 0 24px" }}>
          Worked with
        </p>
        <div className="cell-grid clients">
          {clients.map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
