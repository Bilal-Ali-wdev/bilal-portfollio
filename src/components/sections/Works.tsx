"use client";

import { useMemo, useState } from "react";
import { categories, projects } from "@/data/site";
import Reveal from "../Reveal";

type Filter = (typeof categories)[number];

export default function Works() {
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter]
  );

  return (
    <section id="work" className="section">
      <Reveal className="works-head">
        <div>
          <p className="mono section-label">(02) — Selected work</p>
          <h2 className="works-title">Works.</h2>
        </div>
        <div className="filters" role="group" aria-label="Filter projects">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="filter"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid-2 works-grid">
        {visible.length === 0 && <p className="mono empty">Nothing here yet — check back soon.</p>}
        {visible.map((p, i) => (
          <Reveal key={`${filter}-${i}`} delay={(i % 2) * 0.1}>
            <article className="card card-enter" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className={`cover project-cover cover-${p.cover}`}>
                <div className="cover-inner mono">[Project cover image]</div>
              </div>
              <div className="card-body">
                <div className="tags">
                  {p.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                  <span className="tag tag-plain">{p.year}</span>
                </div>
                <h3>{p.name}</h3>
                <p>
                  {p.role} — {p.description}
                </p>
                <a href={p.href} className="link">
                  Learn more <span className="arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
