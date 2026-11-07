"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { techLogos, type Project } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = { project: Project; index: number };

/** One project row: details on one side, a tilted MacBook with the screenshot on the other. */
export default function ProjectShowcase({ project: p, index }: Props) {
  const root = useRef<HTMLElement>(null);
  const flip = index % 2 === 1; // alternate sides
  const tilt = flip ? 1 : -1; // laptop always turns toward the text

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const st = { trigger: root.current, start: "top bottom", end: "center center", scrub: 1.2 };

      // laptop turns toward the viewer while its lid opens, as it scrolls in
      gsap.fromTo(
        ".mbp",
        { rotateX: -26, rotateY: 34 * tilt, y: 50, scale: 0.92 },
        { rotateX: -9, rotateY: 15 * tilt, y: 0, scale: 1, ease: "none", scrollTrigger: st }
      );
      gsap.fromTo(".mbp-lid", { rotateX: -72 }, { rotateX: 4, ease: "none", scrollTrigger: st });
      // backdrop drifts the other way for depth
      gsap.fromTo(".stage-flutes", { xPercent: -6 * tilt }, { xPercent: 6 * tilt, ease: "none", scrollTrigger: { ...st, end: "bottom top" } });
      // details rise in, line by line
      gsap.from(".project-info > *", {
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });
    },
    { scope: root }
  );

  const number = String(index + 1).padStart(2, "0");
  // shared props for every link to the live site
  const live = p.href ? { href: p.href, target: "_blank", rel: "noopener noreferrer" } : null;
  const Stage = live ? "a" : "div";

  return (
    <article ref={root} className={`project${flip ? " is-flipped" : ""}`}>
      <div className="project-info">
        <span className="project-number" aria-hidden="true">
          {number}
        </span>
        <h3 className="project-name">
          {live ? (
            <a {...live} className="project-name-link">
              {p.name}
              <span className="project-name-arrow" aria-hidden="true">
                ↗
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            p.name
          )}
        </h3>
        <p className="project-desc">{p.description}</p>
        <p className="project-highlight">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 17 6-6 4 4 8-8" />
            <path d="M14 7h7v7" />
          </svg>
          {p.highlight}
        </p>
        <ul className="project-tech" aria-label="Built with">
          {p.tech.map((t) => {
            const icon = techLogos[t];
            return (
              <li key={t} className="tech-icon" data-name={t} title={t}>
                {icon ? (
                  <Image
                    src={icon.logo}
                    alt={t}
                    width={26}
                    height={26}
                    className={icon.invertDark ? "invert-dark" : undefined}
                  />
                ) : (
                  // no logo registered yet — fall back to the name
                  <span className="tech-fallback">{t}</span>
                )}
              </li>
            );
          })}
        </ul>
        {live ? (
          <a {...live} className="project-open" data-magnetic="0.2">
            <span>Open project</span>
            <span className="project-open-icon" aria-hidden="true">
              ↗
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <span className="project-cta is-soon">
            <span className="project-cta-line" aria-hidden="true" />
            Case study coming soon
          </span>
        )}
      </div>

      {/* the whole laptop card opens the live site when there is one */}
      <Stage
        {...(live ?? {})}
        className={`project-stage${live ? " is-link" : ""}`}
        aria-label={live ? `Open ${p.name} live site (opens in a new tab)` : undefined}
        style={{ "--acc-deep": p.accent[0], "--acc": p.accent[1] } as CSSProperties}
      >
        <div className="stage-flutes" aria-hidden="true" />
        <div className="stage-floor" aria-hidden="true" />
        <span className="stage-badge mono">{p.badge}</span>
        {live && (
          <span className="stage-visit" aria-hidden="true">
            Visit live site <span>↗</span>
          </span>
        )}

        {/* A real 3D laptop: the lid and base are separate planes in CSS 3D space */}
        <div className="device">
          <div className="mbp">
            <div className="mbp-lid">
              <div className="mbp-lid-front">
                <div className="mbp-display">
                  <Image
                    src={p.image}
                    alt={`${p.name} website`}
                    fill
                    quality={95}
                    sizes="(max-width: 860px) 100vw, 60vw"
                    className="mbp-shot"
                  />
                  <span className="mbp-glare" aria-hidden="true" />
                </div>
                <span className="mbp-notch" aria-hidden="true">
                  <span />
                </span>
              </div>
              <div className="mbp-lid-back" aria-hidden="true" />
            </div>
            <div className="mbp-base" aria-hidden="true">
              <div className="mbp-deck">
                <span className="mbp-speaker is-left" />
                <span className="mbp-keyboard" />
                <span className="mbp-speaker is-right" />
                <span className="mbp-trackpad" />
              </div>
              <div className="mbp-front" />
              <div className="mbp-shadow" />
            </div>
          </div>
        </div>
      </Stage>
    </article>
  );
}
