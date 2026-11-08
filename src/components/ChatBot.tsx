"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { gmailComposeUrl, labProjects, projects, site, techLogos } from "@/data/site";
import { seeded } from "@/lib/loader";
import { field, sendEnquiry } from "@/lib/contact";
import SuccessBurst from "./SuccessBurst";
import "./ChatBot.css";

// Floating particles for the background — positions are seeded, so server and
// client render the same markup. Every 5th one is a little four-point sparkle.
const PARTICLES = Array.from({ length: 34 }, (_, i) => {
  const r = (k: number) => seeded(i * 7.3 + k);
  return {
    star: i % 5 === 0,
    style: {
      "--x": `${(r(1) * 100).toFixed(2)}%`,
      "--s": `${(2 + r(2) * 4).toFixed(1)}px`,
      "--d": `${(9 + r(3) * 12).toFixed(1)}s`,
      "--delay": `${(-r(4) * 20).toFixed(1)}s`,
      "--drift": `${((r(5) - 0.5) * 18).toFixed(1)}vw`,
    } as CSSProperties,
  };
});

type Show = "projects" | "automations" | null;
type Msg = {
  id: number;
  from: "user" | "ai";
  text: string;
  typing?: boolean;
  show?: Show; // render project / automation cards under the reply
  contact?: boolean; // show "Book a call" + "Email" buttons
  links?: LinkKind[]; // LinkedIn / GitHub / email cards
};
type LinkKind = "linkedin" | "github" | "email";

const SUGGESTIONS = ["Show me your projects", "What's your tech stack?", "Show your n8n automations", "Are you available for work?"];

const FALLBACK_REPLY = "I couldn't reach my brain just now. You can still book a call or email Bilal directly.";

/**
 * Floating AI chat: an orb in the bottom-right that morphs into a long input bar.
 * Sending a prompt sweeps a gradient across the page from the bottom-right corner.
 */
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false); // a prompt has been sent → gradient + messages
  const [messages, setMessages] = useState<Msg[]>([]);
  const [value, setValue] = useState("");
  const thinking = messages.some((m) => m.typing);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  const lenis = useLenis();

  // focus the field once the bar has grown open
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 380);
    return () => window.clearTimeout(t);
  }, [open]);

  // pause page scrolling while the conversation covers the page
  useEffect(() => {
    if (active) lenis?.stop();
    else lenis?.start();
  }, [active, lenis]);

  // spotlight that follows the pointer across the background
  const wash = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        wash.current?.style.setProperty("--mx", `${e.clientX}px`);
        wash.current?.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  // Esc closes everything (reads the latest close() through a ref)
  const closeRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // While the AI is working, keep the bottom in view. When a reply lands, scroll so
  // the question that started it sits at the top — long replies never hide it.
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    if (last?.from === "ai" && !last.typing) {
      const questions = el.querySelectorAll<HTMLElement>(".chat-msg.is-user");
      const q = questions[questions.length - 1];
      if (q) {
        el.scrollTo({ top: Math.max(0, q.offsetTop - 20), behavior: "smooth" });
        return;
      }
    }
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const close = () => {
    setActive(false);
    // let the gradient sweep back before the bar collapses
    const t = window.setTimeout(() => {
      setOpen(false);
      setMessages([]);
    }, active ? 650 : 0);
    timers.current.push(t);
  };

  useEffect(() => {
    closeRef.current = close;
  });

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || thinking) return;
    const userMsg: Msg = { id: nextId.current++, from: "user", text: prompt };
    const aiId = nextId.current++;
    // short history for context (the server trims it again)
    const history = [...messages.filter((m) => !m.typing), userMsg].slice(-6).map((m) => ({
      role: m.from,
      text: m.show ? `${m.text} (showed ${m.show} cards)` : m.text,
    }));
    setMessages((m) => [...m, userMsg, { id: aiId, from: "ai", text: "", typing: true }]);
    setValue("");
    setActive(true);

    const finish = (patch: Partial<Msg>) =>
      setMessages((m) => m.map((x) => (x.id === aiId ? { ...x, typing: false, ...patch } : x)));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = (await res.json()) as {
        reply?: string;
        show?: Show;
        contact?: boolean;
        links?: LinkKind[];
        error?: string;
      };
      if (!res.ok || !data.reply) {
        finish({ text: data.error ?? FALLBACK_REPLY, contact: true });
        return;
      }
      finish({ text: data.reply, show: data.show ?? null, contact: data.contact, links: data.links ?? [] });
    } catch {
      finish({ text: FALLBACK_REPLY, contact: true });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(value);
  };

  const sentCount = messages.filter((m) => m.from === "user").length;

  return (
    <>
      {/* gradient wash: grows from the bottom-right corner over the whole page */}
      <div
        ref={wash}
        className={`chat-wash${active ? " is-on" : ""}${thinking ? " is-thinking" : ""}`}
        aria-hidden="true"
        onClick={close}
      >
        <span className="chat-wash-blob is-a" />
        <span className="chat-wash-blob is-b" />
        <span className="chat-wash-blob is-c" />
        {/* slow searchlight beams — faster while the AI is "thinking" */}
        <span className="chat-wash-beam" />
        {/* perspective grid floor gliding toward the viewer */}
        <span className="chat-wash-floor" />
        {/* soft light that follows the pointer */}
        <span className="chat-wash-spot" />
        {/* stardust rising */}
        <span className="chat-wash-particles">
          {PARTICLES.map((p, i) => (
            <i key={i} className={p.star ? "is-star" : undefined} style={p.style} />
          ))}
        </span>
        {/* a ripple pulses out from the bar each time a message is sent */}
        {sentCount > 0 && <span key={sentCount} className="chat-wash-ripple" />}
      </div>

      {/* launcher orb */}
      <button
        type="button"
        className={`chat-orb${open ? " is-hidden" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Ask my AI assistant"
        aria-expanded={open}
      >
        <span className="chat-orb-ring" aria-hidden="true" />
        <span className="chat-orb-core" aria-hidden="true">
          <SparkIcon />
        </span>
        <span className="chat-orb-label" aria-hidden="true">
          Ask AI
        </span>
      </button>

      <div className={`chat-dock${open ? " is-open" : ""}${active ? " is-active" : ""}`} aria-hidden={!open}>
        {/* conversation */}
        {active && (
          <div className="chat-thread" ref={list} aria-live="polite" data-lenis-prevent>
            {messages.map((m) =>
              m.from === "user" ? (
                <div key={m.id} className="chat-msg is-user">
                  {m.text}
                </div>
              ) : (
                <div
                  key={m.id}
                  className={`chat-msg is-ai${m.show || m.links?.length || m.contact ? " has-cards" : ""}`}
                >
                  <span className="chat-avatar" aria-hidden="true">
                    <SparkIcon />
                  </span>
                  {m.typing ? (
                    <Generating />
                  ) : (
                    <div className="chat-reply">
                      <p>
                        <Linkified text={m.text} />
                      </p>
                      {m.show && <ChatCards kind={m.show} />}
                      {/* links on the left, an inline "Book a call" card on the right */}
                      {(!!m.links?.length || m.contact) && (
                        <div className={`chat-contact${m.links?.length ? "" : " is-solo"}`}>
                          {!!m.links?.length && <ChatLinks kinds={m.links} />}
                          <ChatBookCall />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* quick prompts, before the first message */}
        {!active && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={s}
                type="button"
                className="chat-chip"
                style={{ transitionDelay: open ? `${0.25 + i * 0.05}s` : "0s" }}
                onClick={() => send(s)}
                tabIndex={open ? 0 : -1}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* the long input bar */}
        <form className="chat-bar" onSubmit={onSubmit} aria-label="Ask my AI assistant">
          <span className="chat-bar-glow" aria-hidden="true" />
          <span className="chat-bar-icon" aria-hidden="true">
            <SparkIcon />
          </span>
          <input
            ref={input}
            className="chat-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask about my projects, stack or availability…"
            aria-label="Your question"
            tabIndex={open ? 0 : -1}
          />
          <button type="submit" className="chat-send" aria-label="Send" disabled={!value.trim()} tabIndex={open ? 0 : -1}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
          <button type="button" className="chat-close" onClick={close} aria-label="Close chat" tabIndex={open ? 0 : -1}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}

/** Turns plain URLs in a reply into links that open in a new tab. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part.replace(/[.,]$/, "")} target="_blank" rel="noopener noreferrer" className="chat-link">
            {part.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * Project / automation cards, rendered from the site's own data so the model
 * never spends tokens listing them. 2 per row on wide screens, 1 on small.
 */
function ChatCards({ kind }: { kind: "projects" | "automations" }) {
  const items =
    kind === "projects"
      ? projects.map((p) => ({
          title: p.name,
          badge: p.badge,
          blurb: p.highlight,
          image: p.image,
          tech: p.tech,
          href: p.href,
          accent: p.accent,
        }))
      : labProjects.map((p) => ({
          title: p.title,
          badge: p.badge,
          blurb: p.points[0],
          image: p.image,
          tech: p.tools,
          href: "",
          accent: p.accent,
        }));

  return (
    <div className="chat-cards">
      {items.map((item, i) => (
        <div key={item.title} className="chat-card" style={{ animationDelay: `${0.08 * i}s` }}>
          {/* 200×200 brand-coloured tile with a mini browser window holding the full screenshot */}
          <span
            className="chat-card-shot"
            style={{ "--acc-deep": item.accent[0], "--acc": item.accent[1] } as CSSProperties}
          >
            <span className="chat-card-window">
              <span className="chat-card-window-bar" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="chat-card-window-screen">
                <Image src={item.image} alt={`${item.title} preview`} fill sizes="180px" quality={90} />
              </span>
            </span>
            <span className="chat-card-num">{String(i + 1).padStart(2, "0")}</span>
          </span>

          {/* title, short line, stack logos, then the action */}
          <span className="chat-card-body">
            <span className="chat-card-badge">{item.badge}</span>
            <strong className="chat-card-title">{item.title}</strong>
            <span className="chat-card-blurb">{item.blurb}</span>
            <span className="chat-card-tech">
              {item.tech.map((t) => {
                const icon = techLogos[t];
                return icon ? (
                  <span key={t} className="chat-card-logo" title={t}>
                    <Image src={icon.logo} alt={t} width={22} height={22} className={icon.invertDark ? "invert-dark" : undefined} />
                  </span>
                ) : (
                  <span key={t} className="chat-card-logo is-text">
                    {t}
                  </span>
                );
              })}
            </span>
            {item.href && (
              <a className="chat-card-open" href={item.href} target="_blank" rel="noopener noreferrer">
                <span>
                  Open<span className="chat-card-open-word"> project</span>
                </span>
                <span className="chat-card-open-icon" aria-hidden="true">
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

const LINKS = {
  linkedin: {
    name: "LinkedIn",
    handle: "in/bilal-ali-dev",
    note: "Experience & recommendations",
    logo: "/contact-logos/linkedin.svg",
    action: "View profile",
    brand: "#0a66c2",
  },
  github: {
    name: "GitHub",
    handle: "@Bilalwebdev26",
    note: "Code & repositories",
    logo: "/stack-logos/github.svg",
    action: "View profile",
    brand: "#6e7681",
  },
  email: {
    name: "Gmail",
    handle: site.email,
    note: "Best for project enquiries",
    logo: "/contact-logos/gmail.svg",
    action: "Send email",
    brand: "#ea4335",
  },
} as const;

const linkHref = (k: LinkKind) => (k === "linkedin" ? site.linkedin : k === "github" ? site.github : gmailComposeUrl());

/** One tidy panel listing LinkedIn / GitHub / Gmail with logos and clear actions. */
function ChatLinks({ kinds }: { kinds: LinkKind[] }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — Send email still works */
    }
  };

  return (
    <div className="chat-links">
      <div className="chat-panel-head">
        <span className="chat-panel-kicker">Connect with Bilal</span>
        <span className="chat-panel-meta">
          {kinds.length} {kinds.length === 1 ? "channel" : "channels"}
        </span>
      </div>
      {kinds.map((k, i) => {
        const l = LINKS[k];
        return (
          <div
            key={k}
            className="chat-link-row"
            style={{ "--brand": l.brand, animationDelay: `${0.07 * i}s` } as CSSProperties}
          >
            <span className="chat-link-logo">
              <Image src={l.logo} alt="" width={26} height={26} />
            </span>
            <span className="chat-link-text">
              <strong>{l.name}</strong>
              <span>{l.handle}</span>
            </span>
            <span className="chat-link-actions">
              {k === "email" && (
                <button
                  type="button"
                  className="chat-icon-btn"
                  onClick={copyEmail}
                  aria-label={copied ? "Email copied" : "Copy email address"}
                  title={copied ? "Copied" : "Copy email"}
                >
                  {copied ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                    </svg>
                  )}
                </button>
              )}
              <a className="chat-link-btn" href={linkHref(k)} target="_blank" rel="noopener noreferrer">
                {l.action}
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * "Book a call" right inside the chat. Pressing it builds a booking form in place
 * (skeleton → fields reveal one by one, like the AI wrote it). Submissions are
 * emailed straight to Bilal through /api/contact.
 */
function ChatBookCall() {
  const [stage, setStage] = useState<"idle" | "building" | "form" | "sent">("idle");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const start = () => {
    setStage("building");
    window.setTimeout(() => setStage("form"), 1100);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const f = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    const result = await sendEnquiry({
      name: field(f, "name"),
      email: field(f, "email"),
      phone: field(f, "phone"),
      when: field(f, "when") || undefined,
      message: field(f, "about"),
      company: field(f, "company"),
      source: "AI chat",
    });
    setSending(false);
    if (result.ok) setStage("sent");
    else setError(result.error);
  };

  return (
    <div className={`chat-book is-${stage}`}>
      {stage === "idle" && (
        <>
          <span className="chat-book-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h6" />
            </svg>
          </span>
          <strong className="chat-book-title">Book a call</strong>
          <p className="chat-book-text">A short intro call about your product — full stack, Gen AI or DevOps.</p>
          <ul className="chat-book-facts">
            <li>20–30 min</li>
            <li>Google Meet</li>
            <li>Free</li>
          </ul>
          <button type="button" className="chat-book-start" onClick={start}>
            Book a call
            <span aria-hidden="true">→</span>
          </button>
        </>
      )}

      {stage === "building" && (
        <div className="chat-book-building" role="status" aria-label="Preparing your booking form">
          <span className="chat-book-kicker">
            <SparkIcon /> Preparing your booking form…
          </span>
          <span className="chat-skel" style={{ width: "100%" }} />
          <span className="chat-skel" style={{ width: "100%" }} />
          <span className="chat-skel" style={{ width: "62%" }} />
          <span className="chat-skel is-tall" style={{ width: "100%" }} />
        </div>
      )}

      {stage === "form" && (
        <form className="chat-book-form" onSubmit={submit}>
          <span className="chat-book-kicker">
            <SparkIcon /> Booking form
          </span>
          <div className="chat-book-row">
            <label className="chat-field">
              <span>Name</span>
              <input name="name" autoComplete="name" required autoFocus />
            </label>
            <label className="chat-field">
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>
          <div className="chat-book-row">
            <label className="chat-field">
              <span>Contact number</span>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+92 300 1234567"
                pattern="[+()0-9\s\-]{7,20}"
                title="Digits, spaces, +, - or brackets (7–20 characters)"
                required
              />
            </label>
            <label className="chat-field">
              <span>Preferred day &amp; time</span>
              <input name="when" placeholder="e.g. Tue, 3 pm PKT" />
            </label>
          </div>
          <label className="chat-field">
            <span>What would you like to discuss?</span>
            <textarea name="about" rows={3} required />
          </label>
          {/* honeypot — hidden from people, tempting to bots */}
          <input name="company" type="text" tabIndex={-1} autoComplete="off" className="hp-field" aria-hidden="true" />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="chat-book-start" disabled={sending}>
            {sending ? (
              <>
                <span className="btn-spinner" aria-hidden="true" /> Sending…
              </>
            ) : (
              <>
                Request call
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
          <span className="chat-book-note">Goes straight to Bilal&apos;s inbox.</span>
        </form>
      )}

      {stage === "sent" && (
        <div className="chat-book-sent">
          <SuccessBurst title="Your call request is on its way" compact>
            Bilal has your details and will reach out to lock in a time.
          </SuccessBurst>
          <button type="button" className="chat-book-link" onClick={() => setStage("form")}>
            ← Send another request
          </button>
        </div>
      )}
    </div>
  );
}

const GENERATING_STEPS = ["Reading Bilal's profile", "Checking projects & stack", "Composing a reply"];

/** "Generating response" status shown while the model is working. */
function Generating() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => Math.min(s + 1, GENERATING_STEPS.length - 1)), 900);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="chat-generating" role="status" aria-live="polite">
      <span className="chat-generating-ring" aria-hidden="true" />
      <span className="chat-generating-text">
        <strong>Generating response</strong>
        <span key={step} className="chat-generating-step">
          {GENERATING_STEPS[step]}…
        </span>
      </span>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c.7 4.7 2.6 7.4 10 10-7.4 2.6-9.3 5.3-10 10-.7-4.7-2.6-7.4-10-10 7.4-2.6 9.3-5.3 10-10Z" />
      <path d="M19 2.5c.2 1.4.8 2.2 2.5 2.5-1.7.3-2.3 1.1-2.5 2.5-.2-1.4-.8-2.2-2.5-2.5 1.7-.3 2.3-1.1 2.5-2.5Z" opacity=".7" />
    </svg>
  );
}
