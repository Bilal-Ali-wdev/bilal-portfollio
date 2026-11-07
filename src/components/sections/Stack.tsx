import { stack } from "@/data/site";
import Reveal from "../Reveal";

export default function Stack() {
  return (
    <section id="stack" className="section">
      <Reveal>
        <p className="mono section-label" style={{ marginBottom: 24 }}>
          (05) — My stack
        </p>
        <ul className="cell-grid stack-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {stack.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
