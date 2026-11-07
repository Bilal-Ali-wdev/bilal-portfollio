import Image from "next/image";
import { clients, intro } from "@/data/site";
import Reveal from "../Reveal";
import Scramble from "../Scramble";

export default function Intro() {
  return (
    <section className="section">
      <Scramble text="(01) — INTRO" className="section-label label-lg" />

      <div className="grid-3">
        {intro.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.12} className="intro-item">
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </Reveal>
        ))}
      </div>

      <Scramble text="WORKED WITH" className="clients-label" />
      <div className="cell-grid clients">
        {clients.map((c) => (
          <div key={c.name} className="client">
            <span className="client-drift">
            <Image
              src={c.logo}
              alt={c.name}
              width={c.width}
              height={c.height}
              unoptimized
              className="client-logo"
              style={{ height: c.h, width: "auto" }}
            />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
