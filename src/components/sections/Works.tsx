"use client";

import { useMemo, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories, projects } from "@/data/site";
import Reveal from "../Reveal";
import Scramble from "../Scramble";
import Split from "../Split";
import ProjectShowcase from "../ProjectShowcase";

type Filter = (typeof categories)[number];

export default function Works() {
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter]
  );

  const choose = (c: Filter) => {
    setFilter(c);
    // the page got shorter/taller — let every scroll animation re-measure
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <section id="work" className="section">
      <div className="works-head">
        <div>
          <Scramble text="(02) — SELECTED WORK" className="section-label" />
          <h2 className="works-title" data-anim="chars">
            <Split text="Works." mode="chars" />
          </h2>
        </div>
        <Reveal delay={0.2}>
          <div className="filters" role="group" aria-label="Filter projects">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className="filter"
                aria-pressed={filter === c}
                onClick={() => choose(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="projects">
        {visible.length === 0 && <p className="mono empty">Nothing here yet — check back soon.</p>}
        {visible.map((p, i) => (
          <ProjectShowcase key={`${filter}-${p.name}`} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}
