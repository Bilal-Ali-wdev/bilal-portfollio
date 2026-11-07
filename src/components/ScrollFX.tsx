"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onLoaded, prefersReducedMotion } from "@/lib/loader";

gsap.registerPlugin(ScrollTrigger);

/**
 * One place for every scroll-driven effect. Markup opts in with:
 *   data-anim="rise"  – words slide up out of a mask (use <Split>)
 *   data-anim="chars" – letters flip up one by one (use <Split mode="chars">)
 *   data-anim="fill"  – words brighten as you scroll through (scrubbed)
 *   data-magnetic     – element is pulled toward the cursor
 */
export default function ScrollFX() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    const cleanups: (() => void)[] = [];

    const stop = onLoaded(() => {
      ctx = gsap.context(() => {
        // Scroll progress bar
        gsap.to(".scroll-progress span", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        });

        // Hero parallax out
        const heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
        gsap.to(".hero-copy", { y: -90, opacity: 0.25, ease: "none", scrollTrigger: heroST });
        gsap.to(".hero-art", { y: 110, ease: "none", scrollTrigger: heroST });
        gsap.to(".sky", { yPercent: 18, opacity: 0.35, ease: "none", scrollTrigger: heroST });

        // Word rise
        gsap.utils.toArray<HTMLElement>('[data-anim="rise"]').forEach((el) => {
          gsap.from(el.querySelectorAll(".split-i"), {
            yPercent: 115,
            rotate: 4,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.045,
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          });
        });

        // Letter flip
        gsap.utils.toArray<HTMLElement>('[data-anim="chars"]').forEach((el) => {
          gsap.from(el.querySelectorAll(".split-i"), {
            yPercent: 120,
            rotateX: -90,
            opacity: 0,
            transformOrigin: "50% 100%",
            duration: 1,
            ease: "back.out(1.6)",
            stagger: 0.04,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        // Scrubbed word fill
        gsap.utils.toArray<HTMLElement>('[data-anim="fill"]').forEach((el) => {
          gsap.fromTo(
            el.querySelectorAll(".split-i"),
            { opacity: 0.12, filter: "blur(2px)" },
            {
              opacity: 1,
              filter: "blur(0px)",
              ease: "none",
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 48%", scrub: true },
            }
          );
        });

        // Section dividers draw across
        gsap.utils.toArray<HTMLElement>(".rule").forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.6,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });

        // Company logos: each cell wipes open, then its logo pops up out of a blur
        const clients = document.querySelector<HTMLElement>(".clients");
        if (clients) {
          const cells = clients.querySelectorAll(".client");
          const logos = clients.querySelectorAll(".client-logo");
          gsap
            .timeline({ scrollTrigger: { trigger: clients, start: "top 88%", once: true } })
            .from(cells, {
              clipPath: "inset(100% 0% 0% 0%)",
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.12,
            })
            .from(
              logos,
              {
                yPercent: 120,
                scale: 0.6,
                rotate: -8,
                opacity: 0,
                filter: "blur(12px)",
                duration: 1.1,
                ease: "back.out(1.7)",
                stagger: 0.12,
                clearProps: "filter,transform",
              },
              0.15
            );

          // gentle drift while scrolling past — alternate logos move opposite ways
          clients.querySelectorAll(".client-drift").forEach((drift, i) => {
            gsap.fromTo(
              drift,
              { y: i % 2 ? 14 : -14 },
              {
                y: i % 2 ? -14 : 14,
                ease: "none",
                scrollTrigger: { trigger: clients, start: "top bottom", end: "bottom top", scrub: true },
              }
            );
          });
        }


        // Footer slides up from beneath the page
        gsap.from(".footer-inner", {
          y: -140,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true },
        });

        // Quote scales in slightly
        gsap.from(".quote blockquote", {
          scale: 0.92,
          ease: "none",
          scrollTrigger: { trigger: ".quote", start: "top bottom", end: "center center", scrub: true },
        });
      });

      // Magnetic hover (precise pointers only)
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
          const strength = Number(el.dataset.magnetic) || 0.3;
          const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * strength);
            yTo((e.clientY - (r.top + r.height / 2)) * strength);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
            gsap.set(el, { x: 0, y: 0 });
          });
        });
      }

      ScrollTrigger.refresh();
    });

    return () => {
      stop();
      ctx?.revert();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
