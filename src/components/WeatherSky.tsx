"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/loader";

export const SCENES = [
  { id: "sun", label: "Sunshine" },
  { id: "clouds", label: "Cloudy" },
  { id: "rain", label: "Rainfall" },
  { id: "snow", label: "Snowfall" },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

const isDark = () => typeof document !== "undefined" && document.documentElement.dataset.theme === "dark";

/** At night the clear-sky scene is moonlight instead of sunshine. */
export function sceneLabel(scene: (typeof SCENES)[number]) {
  return scene.id === "sun" && isDark() ? "Moonlight" : scene.label;
}

type Star = { x: number; y: number; r: number; phase: number; speed: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

/** Paints a realistic full moon (maria, craters, limb darkening) once into an offscreen canvas. */
function makeMoonSprite(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const R = size / 2;

  g.save();
  g.beginPath();
  g.arc(R, R, R, 0, Math.PI * 2);
  g.clip();

  // base surface, lit slightly from the upper-left
  const base = g.createRadialGradient(R * 0.7, R * 0.65, R * 0.1, R, R, R);
  base.addColorStop(0, "#fbf9f2");
  base.addColorStop(0.6, "#e6e2d6");
  base.addColorStop(1, "#bdb8ab");
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);

  // maria — the dark "seas"
  g.filter = `blur(${Math.max(2, size / 60)}px)`;
  const maria: [number, number, number, number, number][] = [
    [0.38, 0.36, 0.2, 0.15, -0.4],
    [0.6, 0.3, 0.14, 0.11, 0.3],
    [0.66, 0.52, 0.17, 0.13, 0.1],
    [0.45, 0.58, 0.13, 0.17, 0.6],
    [0.3, 0.62, 0.09, 0.07, 0],
    [0.55, 0.72, 0.1, 0.07, -0.2],
  ];
  g.fillStyle = "rgba(122,120,114,0.42)";
  for (const [x, y, rx, ry, rot] of maria) {
    g.beginPath();
    g.ellipse(x * size, y * size, rx * size, ry * size, rot, 0, Math.PI * 2);
    g.fill();
  }
  g.filter = "none";

  // craters with a dark floor and a bright rim
  const craters: [number, number, number][] = [
    [0.52, 0.84, 0.05],
    [0.24, 0.42, 0.035],
    [0.78, 0.4, 0.03],
    [0.7, 0.7, 0.025],
    [0.36, 0.78, 0.022],
    [0.84, 0.6, 0.02],
    [0.2, 0.28, 0.018],
    [0.6, 0.18, 0.02],
  ];
  for (const [x, y, r] of craters) {
    const cx = x * size;
    const cy = y * size;
    const cr = r * size;
    const floor = g.createRadialGradient(cx - cr * 0.3, cy - cr * 0.3, 0, cx, cy, cr);
    floor.addColorStop(0, "rgba(150,146,138,0.55)");
    floor.addColorStop(1, "rgba(150,146,138,0.1)");
    g.fillStyle = floor;
    g.beginPath();
    g.arc(cx, cy, cr, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(255,255,250,0.5)";
    g.lineWidth = Math.max(1, cr * 0.18);
    g.beginPath();
    g.arc(cx, cy, cr, Math.PI * 0.1, Math.PI * 1.1);
    g.stroke();
  }

  // tiny speckle texture
  for (let i = 0; i < 140; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random()) * R;
    g.fillStyle = `rgba(110,106,98,${Math.random() * 0.18})`;
    g.fillRect(R + Math.cos(a) * d, R + Math.sin(a) * d, 1.2, 1.2);
  }

  // limb darkening + a faint shadow on the lower-right edge
  const limb = g.createRadialGradient(R * 0.85, R * 0.8, R * 0.55, R, R, R);
  limb.addColorStop(0, "rgba(0,0,0,0)");
  limb.addColorStop(1, "rgba(20,24,40,0.38)");
  g.fillStyle = limb;
  g.fillRect(0, 0, size, size);
  g.restore();
  return c;
}
export const SCENE_EVENT = "sky:scene";
export const NEXT_SCENE_EVENT = "sky:next";

const SCENE_MS = 8500;

type Flake = { x: number; y: number; r: number; vy: number; phase: number; sway: number };
type Drop = { x: number; y: number; len: number; vy: number };
type Cloud = { x: number; y: number; s: number; v: number; sprite: number };

/** Builds soft, blurred cloud sprites once per colour so drawing them each frame is cheap. */
function makeCloudSprites(color: string) {
  const shapes = [
    [[60, 95, 50], [120, 70, 64], [190, 82, 56], [250, 100, 44], [150, 112, 58]],
    [[70, 100, 46], [130, 80, 60], [200, 70, 70], [270, 92, 50], [180, 115, 55]],
    [[60, 105, 40], [110, 85, 52], [170, 92, 48], [215, 108, 38]],
  ];
  return shapes.map((circles) => {
    const c = document.createElement("canvas");
    c.width = 340;
    c.height = 200;
    const g = c.getContext("2d")!;
    g.filter = "blur(10px)";
    g.fillStyle = color;
    for (const [x, y, r] of circles) {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    return c;
  });
}

export default function WeatherSky() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = prefersReducedMotion();
    let sceneIndex = 0;
    let sceneTimer = 0;

    const setScene = (i: number) => {
      sceneIndex = ((i % SCENES.length) + SCENES.length) % SCENES.length;
      const scene = SCENES[sceneIndex];
      el.dataset.scene = scene.id;
      window.dispatchEvent(new CustomEvent(SCENE_EVENT, { detail: { id: scene.id, label: sceneLabel(scene) } }));
    };

    // Re-announce the scene when the theme flips (Sunshine <-> Moonlight).
    const themeWatch = new MutationObserver(() => setScene(sceneIndex));
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const schedule = () => {
      window.clearInterval(sceneTimer);
      sceneTimer = window.setInterval(() => setScene(sceneIndex + 1), SCENE_MS);
    };
    const onNext = () => {
      setScene(sceneIndex + 1);
      schedule();
    };

    setScene(0);
    schedule();
    window.addEventListener(NEXT_SCENE_EVENT, onNext);

    if (reduce) {
      return () => {
        themeWatch.disconnect();
        window.clearInterval(sceneTimer);
        window.removeEventListener(NEXT_SCENE_EVENT, onNext);
      };
    }

    // ---- canvas setup ----------------------------------------------------
    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let flakes: Flake[] = [];
    let drops: Drop[] = [];
    let clouds: Cloud[] = [];
    let stars: Star[] = [];
    let meteor: Meteor | null = null;
    let nextMeteor = 4;
    let moonSprite: HTMLCanvasElement | null = null;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const populate = () => {
      const nSnow = Math.min(190, Math.round(W / 8));
      const nRain = Math.min(280, Math.round(W / 5));
      flakes = Array.from({ length: nSnow }, () => ({
        x: rand(0, W),
        y: rand(-H, H),
        r: rand(0.8, 3.2),
        vy: rand(22, 70),
        phase: rand(0, Math.PI * 2),
        sway: rand(8, 26),
      }));
      drops = Array.from({ length: nRain }, () => ({
        x: rand(0, W * 1.2),
        y: rand(-H, H),
        len: rand(10, 24),
        vy: rand(620, 980),
      }));
      clouds = Array.from({ length: Math.max(5, Math.round(W / 220)) }, (_, i) => ({
        x: rand(-340, W),
        y: rand(-40, H * 0.42),
        s: rand(0.7, 1.6),
        v: rand(8, 22),
        sprite: i % 3,
      }));
      stars = Array.from({ length: Math.min(170, Math.round(W / 8)) }, () => ({
        x: rand(0, W),
        y: Math.pow(Math.random(), 1.6) * H * 0.7,
        r: Math.random() < 0.08 ? rand(1.2, 1.8) : rand(0.4, 1),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.8, 2.6),
      }));
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      populate();
    };

    // Theme-dependent palette + sprites
    let theme = "";
    let palette = {
      snow: "#ffffff",
      snowEdge: "rgba(90,120,170,0.25)",
      rain: "rgba(70,110,170,0.38)",
      glow: "rgba(255,190,100,",
      flash: "rgba(225,235,255,",
      composite: "source-over" as GlobalCompositeOperation,
    };
    let softClouds: HTMLCanvasElement[] = [];
    let stormClouds: HTMLCanvasElement[] = [];

    const syncTheme = () => {
      const t = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      if (t === theme) return;
      theme = t;
      if (t === "dark") {
        palette = {
          snow: "rgba(240,246,255,0.95)",
          snowEdge: "rgba(0,0,0,0)",
          rain: "rgba(170,200,255,0.32)",
          glow: "rgba(255,190,110,",
          flash: "rgba(200,215,255,",
          composite: "lighter",
        };
        softClouds = makeCloudSprites("rgba(90,104,132,0.55)");
        stormClouds = makeCloudSprites("rgba(44,52,70,0.85)");
      } else {
        palette = {
          snow: "#ffffff",
          snowEdge: "rgba(90,120,170,0.28)",
          rain: "rgba(70,110,170,0.38)",
          glow: "rgba(255,186,90,",
          flash: "rgba(255,255,255,",
          composite: "source-over",
        };
        softClouds = makeCloudSprites("rgba(255,255,255,0.96)");
        stormClouds = makeCloudSprites("rgba(150,162,182,0.9)");
      }
    };

    // ---- simulation ------------------------------------------------------
    const weight = { sun: 0, clouds: 0, rain: 0, snow: 0 };
    let flash = 0;
    let nextFlash = 3;
    let last = performance.now();
    let elapsed = 0;
    let raf = 0;
    let visible = true;

    const drawStars = (amount: number, dt: number) => {
      if (theme !== "dark" || amount < 0.01) return;
      ctx.save();
      ctx.fillStyle = "#ffffff";
      for (const s of stars) {
        const tw = 0.45 + 0.55 * Math.sin(s.phase + elapsed * s.speed);
        ctx.globalAlpha = amount * (0.25 + 0.75 * tw * tw);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // the odd shooting star
      nextMeteor -= dt;
      if (!meteor && nextMeteor <= 0 && amount > 0.6) {
        meteor = { x: rand(W * 0.1, W * 0.7), y: rand(10, H * 0.25), vx: rand(520, 760), vy: rand(160, 260), life: 1 };
        nextMeteor = rand(5, 11);
      }
      if (meteor) {
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        meteor.life -= dt * 1.4;
        const tail = 0.16;
        const g = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * tail, meteor.y - meteor.vy * tail);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(1, "rgba(180,205,255,0)");
        ctx.globalAlpha = amount * Math.max(0, meteor.life);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.vx * tail, meteor.y - meteor.vy * tail);
        ctx.stroke();
        if (meteor.life <= 0 || meteor.x > W + 50) meteor = null;
      }
      ctx.restore();
    };

    const drawMoon = (w: number) => {
      const r = Math.max(36, Math.min(64, W * 0.042));
      const cx = W * 0.82;
      const cy = Math.max(150, H * 0.2);
      if (!moonSprite) moonSprite = makeMoonSprite(Math.round(r * 2 * dpr));

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // wide moonlight wash
      const wash = ctx.createRadialGradient(cx, cy, r, cx, cy, Math.max(W, H) * 0.7);
      wash.addColorStop(0, `rgba(120,150,210,${0.22 * w})`);
      wash.addColorStop(0.4, `rgba(70,95,150,${0.08 * w})`);
      wash.addColorStop(1, "rgba(40,60,110,0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);

      // soft, slowly breathing moonbeams
      ctx.translate(cx, cy);
      ctx.rotate(-elapsed * 0.015);
      const beams = 10;
      for (let i = 0; i < beams; i++) {
        ctx.rotate((Math.PI * 2) / beams);
        const len = r * (4.5 + 1.6 * Math.sin(elapsed * 0.35 + i * 2.1));
        const g = ctx.createLinearGradient(r, 0, len, 0);
        g.addColorStop(0, `rgba(200,215,255,${0.09 * w})`);
        g.addColorStop(1, "rgba(200,215,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(r * 0.8, -r * 0.18);
        ctx.lineTo(len, -len * 0.03);
        ctx.lineTo(len, len * 0.03);
        ctx.lineTo(r * 0.8, r * 0.18);
        ctx.closePath();
        ctx.fill();
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // halo rings
      const halo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 3.2);
      halo.addColorStop(0, `rgba(225,232,255,${0.5 * w})`);
      halo.addColorStop(0.35, `rgba(170,195,255,${0.16 * w})`);
      halo.addColorStop(1, "rgba(150,180,255,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // the moon itself
      ctx.save();
      ctx.globalAlpha = w;
      ctx.shadowColor = "rgba(210,225,255,0.9)";
      ctx.shadowBlur = r * 0.9;
      ctx.drawImage(moonSprite, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
    };

    const drawSun = (w: number) => {
      if (w < 0.01) return;
      if (theme === "dark") {
        drawMoon(w);
        return;
      }
      const cx = W * 0.84;
      const cy = H * 0.06;
      const R = Math.max(W, H) * 0.55;

      ctx.save();
      ctx.globalCompositeOperation = palette.composite;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      glow.addColorStop(0, `${palette.glow}${0.55 * w})`);
      glow.addColorStop(0.25, `${palette.glow}${0.22 * w})`);
      glow.addColorStop(1, `${palette.glow}0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // rotating god-rays
      ctx.translate(cx, cy);
      ctx.rotate(elapsed * 0.04);
      const rays = 14;
      for (let i = 0; i < rays; i++) {
        ctx.rotate((Math.PI * 2) / rays);
        const len = R * (0.9 + 0.25 * Math.sin(elapsed * 0.6 + i * 1.7));
        const g = ctx.createLinearGradient(0, 0, len, 0);
        g.addColorStop(0, `${palette.glow}${0.22 * w})`);
        g.addColorStop(1, `${palette.glow}0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, -len * 0.045);
        ctx.lineTo(len, len * 0.045);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // core
      ctx.save();
      ctx.globalAlpha = w;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
      core.addColorStop(0, "rgba(255,248,225,1)");
      core.addColorStop(0.45, "rgba(255,226,160,0.85)");
      core.addColorStop(1, "rgba(255,210,130,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.fill();

      // lens flare
      for (let i = 1; i <= 3; i++) {
        const fx = cx - (cx - W * 0.35) * (i / 3);
        const fy = cy + (H * 0.55 - cy) * (i / 3);
        ctx.fillStyle = `${palette.glow}${0.12 * w})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 10 + i * 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawClouds = (amount: number, storm: number, dt: number) => {
      for (const c of clouds) {
        c.x += c.v * (1 + storm * 1.5) * dt;
        if (c.x > W + 40) c.x = -340 * c.s - rand(0, 200);
      }
      if (amount < 0.01) return;
      ctx.save();
      for (const c of clouds) {
        const wdt = 340 * c.s;
        const hgt = 200 * c.s;
        if (storm < 0.99) {
          ctx.globalAlpha = amount * (1 - storm);
          ctx.drawImage(softClouds[c.sprite], c.x, c.y, wdt, hgt);
        }
        if (storm > 0.01) {
          ctx.globalAlpha = amount * storm;
          ctx.drawImage(stormClouds[c.sprite], c.x, c.y, wdt, hgt);
        }
      }
      ctx.restore();
    };

    const drawRain = (w: number, dt: number) => {
      const wind = -0.18;
      for (const d of drops) {
        d.y += d.vy * dt;
        d.x += d.vy * wind * dt;
        if (d.y > H + 20) {
          d.y = rand(-60, -10);
          d.x = rand(0, W * 1.25);
        }
      }
      if (w < 0.01) return;
      ctx.save();
      ctx.globalAlpha = w;
      ctx.strokeStyle = palette.rain;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (const d of drops) {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.len * wind, d.y + d.len);
      }
      ctx.stroke();
      ctx.restore();
    };

    const drawSnow = (w: number, dt: number) => {
      for (const f of flakes) {
        f.y += f.vy * dt;
        f.x += Math.sin(f.phase + elapsed * 0.9) * f.sway * dt;
        if (f.y > H + 6) {
          f.y = rand(-30, -4);
          f.x = rand(0, W);
        }
      }
      if (w < 0.01) return;
      ctx.save();
      ctx.globalAlpha = w;
      ctx.fillStyle = palette.snow;
      ctx.strokeStyle = palette.snowEdge;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (const f of flakes) {
        ctx.moveTo(f.x + f.r, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      elapsed += dt;
      syncTheme();

      const target = SCENES[sceneIndex].id;
      const k = Math.min(1, dt * 0.9);
      (Object.keys(weight) as (keyof typeof weight)[]).forEach((key) => {
        weight[key] += ((key === target ? 1 : 0) - weight[key]) * k;
      });

      const cloudAmount = Math.max(weight.clouds, weight.rain * 0.95, weight.snow * 0.7, weight.sun * 0.18);
      const storm = cloudAmount > 0 ? Math.min(1, weight.rain / cloudAmount) : 0;

      ctx.clearRect(0, 0, W, H);
      // stars stay out at night, dimmed behind cloud cover
      drawStars(Math.max(0.15, 1 - cloudAmount * 0.85), dt);
      drawSun(weight.sun);
      drawClouds(cloudAmount, storm, dt);
      drawRain(weight.rain, dt);
      drawSnow(weight.snow, dt);

      // occasional lightning during rain
      if (weight.rain > 0.8) {
        nextFlash -= dt;
        if (nextFlash <= 0) {
          flash = 1;
          nextFlash = rand(4, 8);
        }
      }
      if (flash > 0.01) {
        const f = flash * (0.6 + 0.4 * Math.sin(elapsed * 60));
        ctx.fillStyle = `${palette.flash}${0.28 * f})`;
        ctx.fillRect(0, 0, W, H);
        flash *= Math.pow(0.02, dt);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && document.visibilityState === "visible";
    });
    io.observe(el);
    const onVis = () => {
      visible = document.visibilityState === "visible";
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);

    raf = requestAnimationFrame(frame);

    return () => {
      themeWatch.disconnect();
      cancelAnimationFrame(raf);
      window.clearInterval(sceneTimer);
      window.removeEventListener(NEXT_SCENE_EVENT, onNext);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="sky" data-scene="sun" aria-hidden="true">
      <div className="sky-layer sky-base" />
      <div className="sky-layer sky-sun" />
      <div className="sky-layer sky-clouds" />
      <div className="sky-layer sky-rain" />
      <div className="sky-layer sky-snow" />
      <canvas ref={canvasRef} className="sky-canvas" />
    </div>
  );
}
