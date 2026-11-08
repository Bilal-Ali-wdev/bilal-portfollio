"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { OPEN_CONTACT_EVENT, field, sendEnquiry } from "@/lib/contact";
import { gmailComposeUrl, site } from "@/data/site";
import SuccessBurst from "./SuccessBurst";
import "./BookCallModal.css";

const TOPICS = ["Full stack app", "Gen AI feature", "DevOps & cloud", "Something else"];
const CLOSE_MS = 320;

/**
 * "Book a call" popup. Opens on the `contact:open` event (see lib/contact.ts).
 * Submissions are emailed straight to Bilal through /api/contact.
 */
export default function BookCallModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const lenis = useLenis();
  const [closing, setClosing] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    const open = () => {
      const d = dialog.current;
      if (!d || d.open) return;
      returnFocus.current = document.activeElement as HTMLElement | null;
      setSent(false);
      setError("");
      d.showModal();
      lenis?.stop();
      requestAnimationFrame(() => nameInput.current?.focus({ preventScroll: true }));
    };
    window.addEventListener(OPEN_CONTACT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, open);
  }, [lenis]);

  const close = () => {
    const d = dialog.current;
    if (!d?.open || closing) return;
    setClosing(true);
    window.setTimeout(() => {
      d.close();
      setClosing(false);
    }, CLOSE_MS);
  };

  // clicking the dimmed backdrop (the dialog itself, outside the panel) closes it
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setError("");
    const result = await sendEnquiry({
      name: field(data, "name"),
      email: field(data, "email"),
      phone: field(data, "phone"),
      message: field(data, "message"),
      topic: topic || undefined,
      company: field(data, "company"),
      source: "Book a call popup",
    });
    setSending(false);
    if (result.ok) {
      form.reset();
      setTopic("");
      setSent(true);
    } else {
      setError(result.error);
    }
  };

  return (
    <dialog
      ref={dialog}
      className={`contact-modal${closing ? " is-closing" : ""}`}
      aria-labelledby="contact-title"
      data-lenis-prevent
      onClick={onBackdrop}
      onCancel={(e) => {
        e.preventDefault(); // animate out instead of vanishing on Esc
        close();
      }}
      onClose={() => {
        lenis?.start();
        returnFocus.current?.focus({ preventScroll: true });
      }}
    >
      <div className="contact-panel">
        {/* grab handle — only shown when the panel is a bottom sheet on phones */}
        <span className="contact-handle" aria-hidden="true" />
        <button type="button" className="contact-close" onClick={close} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {/* Left: who you're talking to */}
        <aside className="contact-aside">
          <span className="contact-status">
            <span className="contact-status-dot" aria-hidden="true" />
            Available for new projects
          </span>

          <h2 id="contact-title" className="contact-title">
            Let&apos;s build
            <br />
            <span>something that scales.</span>
          </h2>
          <p className="contact-lead">
            Tell me about your product — full stack, Gen AI or DevOps — and let&apos;s find a time to talk.
          </p>

          <div className="contact-cards">
            <a className="contact-card" href={gmailComposeUrl()} target="_blank" rel="noreferrer">
              <span className="contact-card-logo">
                <Image src="/contact-logos/gmail.svg" alt="" width={26} height={26} />
              </span>
              <span className="contact-card-text">
                <small>Email</small>
                <strong>{site.email}</strong>
              </span>
              <span className="contact-card-arrow" aria-hidden="true">
                ↗
              </span>
            </a>

            <a className="contact-card" href={site.linkedin} target="_blank" rel="noreferrer">
              <span className="contact-card-logo">
                <Image src="/contact-logos/linkedin.svg" alt="" width={26} height={26} />
              </span>
              <span className="contact-card-text">
                <small>LinkedIn</small>
                <strong>in/bilal-ali-dev</strong>
              </span>
              <span className="contact-card-arrow" aria-hidden="true">
                ↗
              </span>
            </a>

            <a className="contact-card" href={site.github} target="_blank" rel="noreferrer">
              <span className="contact-card-logo">
                <Image src="/stack-logos/github.svg" alt="" width={26} height={26} />
              </span>
              <span className="contact-card-text">
                <small>GitHub</small>
                <strong>Bilalwebdev26</strong>
              </span>
              <span className="contact-card-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </aside>

        {/* Right: the form, or a confirmation once sent */}
        <div className="contact-main">
          {sent ? (
            <div className="contact-sent">
              <SuccessBurst title="Delivered to Bilal's inbox">
                Your message is flying over — expect a reply by email or a call back soon.
              </SuccessBurst>
              <button type="button" className="contact-link-btn" onClick={() => setSent(false)}>
                ← Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <p className="mono contact-eyebrow">(Book a call)</p>
              <h3 className="contact-form-title">Start a conversation</h3>

              <div className="contact-row">
                <div className="field">
                  <input ref={nameInput} id="cf-name" name="name" type="text" placeholder=" " autoComplete="name" required />
                  <label htmlFor="cf-name">Your name</label>
                </div>

                <div className="field">
                  <input id="cf-email" name="email" type="email" placeholder=" " autoComplete="email" required />
                  <label htmlFor="cf-email">Email address</label>
                </div>
              </div>

              <div className="field">
                <input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  placeholder=" "
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="[+()0-9\s\-]{7,20}"
                  title="Digits, spaces, +, - or brackets (7–20 characters)"
                  required
                />
                <label htmlFor="cf-phone">Contact number</label>
              </div>

              {/* honeypot — hidden from people, tempting to bots */}
              <input name="company" type="text" tabIndex={-1} autoComplete="off" className="hp-field" aria-hidden="true" />

              <fieldset className="topics">
                <legend className="mono">What do you need?</legend>
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="topic"
                    aria-pressed={topic === t}
                    onClick={() => setTopic(topic === t ? "" : t)}
                  >
                    {t}
                  </button>
                ))}
              </fieldset>

              <div className="field">
                <textarea id="cf-message" name="message" placeholder=" " rows={4} required />
                <label htmlFor="cf-message">Tell me about yourself and your project</label>
              </div>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className={`contact-submit${sending ? " is-sending" : ""}`} disabled={sending}>
                <span>{sending ? "Sending…" : "Send message"}</span>
                <span className="contact-submit-icon" aria-hidden="true">
                  {sending ? <span className="btn-spinner" /> : "↗"}
                </span>
              </button>
              <p className="contact-note">Goes straight to Bilal&apos;s inbox — nothing is shared with anyone else.</p>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
