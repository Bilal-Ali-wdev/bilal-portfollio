"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { labProjects, techLogos, type LabProject } from "@/data/site";
import Scramble from "../Scramble";
import Split from "../Split";
import "./Lab.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Experiments() {
  const zoom = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<LabProject | null>(null);
  const lenis = useLenis();

  const openZoom = (item: LabProject) => {
    setActive(item);
    zoom.current?.showModal();
    lenis?.stop();
  };
  const closeZoom = () => zoom.current?.close();

  return (
    <section id="experiments" className="section">
      <Scramble text="(03) — LAB" className="section-label" />
      <h2 className="display" data-anim="rise">
        <Split text="AI automations," muted="n8n workflows & agents." />
      </h2>

      <div className="lab-list">
        {labProjects.map((item, i) => (
          <LabRow key={item.title} item={item} index={i} onZoom={openZoom} />
        ))}
      </div>

      {/* full-size view of a workflow */}
      <dialog
        ref={zoom}
        className="lab-zoom"
        aria-label={active ? `${active.title} workflow` : "Workflow"}
        data-lenis-prevent
        onClick={(e) => e.target === e.currentTarget && closeZoom()}
        onClose={() => lenis?.start()}
      >
        {active && (
          <figure className="lab-zoom-figure">
            <button type="button" className="contact-close lab-zoom-close" onClick={closeZoom} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <Image
              src={active.image}
              alt={`${active.title} — n8n workflow`}
              width={1600}
              height={900}
              quality={95}
              sizes="95vw"
              className="lab-zoom-img"
            />
            <figcaption>
              <span className="mono">{active.badge}</span>
              <strong>{active.title}</strong>
            </figcaption>
          </figure>
        )}
      </dialog>
    </section>
  );
}

function LabRow({ item, index, onZoom }: { item: LabProject; index: number; onZoom: (item: LabProject) => void }) {
  const root = useRef<HTMLElement>(null);
  const flip = index % 2 === 1;
  const tilt = flip ? 1 : -1; // the display always turns toward its text

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const st = { trigger: root.current, start: "top bottom", end: "center center", scrub: 1.2 };

      // the display swings round to face the viewer as it scrolls in
      gsap.fromTo(
        ".mon",
        { rotateX: -14, rotateY: 40 * tilt, y: 60, scale: 0.9 },
        { rotateX: -6, rotateY: 18 * tilt, y: 0, scale: 1, ease: "none", scrollTrigger: st }
      );
      gsap.fromTo(".stage-flutes", { xPercent: -6 * tilt }, { xPercent: 6 * tilt, ease: "none", scrollTrigger: { ...st, end: "bottom top" } });

      // the screen powers on, then the details rise in
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top 72%", once: true } })
        .from(".mon-shot", { opacity: 0, filter: "brightness(2.6) blur(10px)", scale: 1.05, duration: 1.1, ease: "power2.out", clearProps: "filter,transform" })
        .from(".lab-info > *", { y: 32, opacity: 0, duration: 0.85, ease: "power3.out", stagger: 0.07 }, 0);
    },
    { scope: root }
  );

  return (
    <article ref={root} className={`lab-row${flip ? " is-flipped" : ""}`}>
      <div className="lab-info">
        <span className="lab-number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="lab-title">{item.title}</h3>
        <p className="lab-desc">{item.description}</p>
        <ul className="lab-points">
          {item.points.map((pt) => (
            <li key={pt}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12 5 5L20 7" />
              </svg>
              {pt}
            </li>
          ))}
        </ul>
        <ul className="project-tech" aria-label="Built with">
          {item.tools.map((t) => {
            const icon = techLogos[t];
            return (
              <li key={t} className="tech-icon" data-name={t} title={t}>
                {icon ? (
                  <Image src={icon.logo} alt={t} width={26} height={26} className={icon.invertDark ? "invert-dark" : undefined} />
                ) : (
                  <span className="tech-fallback">{t}</span>
                )}
              </li>
            );
          })}
        </ul>
        <button type="button" className="project-cta lab-cta" onClick={() => onZoom(item)}>
          <span className="project-cta-line" aria-hidden="true" />
          View workflow <span className="arrow" aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="project-stage lab-stage" style={{ "--acc-deep": item.accent[0], "--acc": item.accent[1] } as CSSProperties}>
        <div className="stage-flutes" aria-hidden="true" />
        <div className="stage-floor" aria-hidden="true" />
        <span className="stage-badge mono">{item.badge}</span>

        {/* A 3D desktop display: front glass, aluminium edges and back, and a stand on the desk */}
        <div className="desk">
          <div className="mon">
            <button type="button" className="mon-front" onClick={() => onZoom(item)} aria-label={`View the ${item.title} workflow full size`}>
              <span className="mon-screen" style={{ background: item.screenBg }}>
                <Image src={item.image} alt="" fill quality={95} sizes="(max-width: 860px) 90vw, 50vw" className="mon-shot" />
                <span className="mon-glare" aria-hidden="true" />
              </span>
              <span className="mon-zoom" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                Expand
              </span>
            </button>
            <span className="mon-edge is-right" aria-hidden="true" />
            <span className="mon-edge is-left" aria-hidden="true" />
            <span className="mon-edge is-top" aria-hidden="true" />
            <span className="mon-edge is-bottom" aria-hidden="true" />
            <span className="mon-back" aria-hidden="true" />
            <span className="mon-neck" aria-hidden="true" />
            <span className="mon-foot" aria-hidden="true">
              <span className="mon-foot-shadow" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
