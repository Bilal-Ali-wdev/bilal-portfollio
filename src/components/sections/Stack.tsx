"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { stackRows } from "@/data/site";
import Scramble from "../Scramble";
import Split from "../Split";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Each row repeats its set so the loop is seamless. */
const COPIES = 5;
/** Idle drift speed, px per second. */
const BASE_SPEED = 45;
/** Extra speed per unit of scroll velocity, and its cap. */
const BOOST = 22;
const MAX_BOOST = 650;
/** How quickly speed/direction changes settle (higher = snappier). */
const EASE = 2.6;

export default function Stack() {
  const root = useRef<HTMLElement>(null);
  // latest scroll velocity + direction from Lenis (1 = down, -1 = up)
  const scroll = useRef({ velocity: 0, direction: 1 });

  useLenis((l) => {
    scroll.current.velocity = l.velocity;
    if (l.direction) scroll.current.direction = l.direction;
  });

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rows = gsap.utils.toArray<HTMLElement>(".stack-track").map((track) => {
        const row = {
          track,
          dir: Number(track.dataset.dir),
          offset: Number(track.dataset.offset),
          setW: track.scrollWidth / COPIES,
          x: 0,
          speed: 0,
          hovered: false,
          setX: gsap.quickSetter(track, "x", "px") as (v: number) => void,
        };
        row.x = -row.setW * (1 + row.offset); // each row starts at its own point
        const strip = track.parentElement!;
        strip.addEventListener("pointerenter", () => (row.hovered = true));
        strip.addEventListener("pointerleave", () => (row.hovered = false));
        return row;
      });

      const measure = () => rows.forEach((r) => (r.setW = r.track.scrollWidth / COPIES));
      const ro = new ResizeObserver(measure);
      rows.forEach((r) => ro.observe(r.track));

      // skip work while the section is off-screen
      let visible = false;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      if (root.current) io.observe(root.current);

      const tick = (_t: number, deltaMs: number) => {
        if (!visible) return;
        const dt = Math.min(deltaMs, 50) / 1000;
        const { velocity, direction } = scroll.current;
        const k = 1 - Math.exp(-dt * EASE); // frame-rate independent smoothing

        for (const r of rows) {
          const target = r.hovered
            ? 0
            : (BASE_SPEED + Math.min(Math.abs(velocity) * BOOST, MAX_BOOST)) * direction * r.dir;
          r.speed += (target - r.speed) * k;
          r.x += r.speed * dt;
          // seamless wrap: keep x within one set's width of the middle
          if (r.x > -r.setW * 0.5) r.x -= r.setW;
          else if (r.x < -r.setW * 2.5) r.x += r.setW;
          r.setX(r.x);
        }
      };
      gsap.ticker.add(tick);

      // chips pop in row by row the first time the section appears
      gsap.from(".stack-row", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".stack-rows", start: "top 88%", once: true },
      });

      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        io.disconnect();
      };
    },
    { scope: root }
  );

  return (
    <section id="stack" className="section stack-section" ref={root}>
      <Scramble text="(05) — MY STACK" className="section-label" />
      <h2 className="display" data-anim="rise">
        <Split text="Tools I build with," muted="from AI agents to production." />
      </h2>

      <div className="stack-rows">
        {stackRows.map((row, r) => (
          <div className="stack-row" key={row.label}>
            <span className="stack-row-label mono">
              <span>0{r + 1}</span>
              {row.label}
            </span>
            <ul className="sr-only">
              {row.items.map((t) => (
                <li key={t.name}>{t.name}</li>
              ))}
            </ul>
            <div className="stack-strip" aria-hidden="true">
              <div className="stack-track" data-dir={row.direction} data-offset={row.offset}>
                {Array.from({ length: COPIES }, (_, c) =>
                  row.items.map((t) => (
                    <span className="stack-chip" key={`${c}-${t.name}`}>
                      <Image
                        src={t.logo}
                        alt=""
                        width={30}
                        height={30}
                        className={`stack-chip-logo${t.invertDark ? " invert-dark" : ""}`}
                      />
                      <span className="stack-chip-name">{t.name}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
