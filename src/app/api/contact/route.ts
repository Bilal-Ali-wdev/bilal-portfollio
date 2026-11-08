import nodemailer, { type Transporter } from "nodemailer";
import { contactHtml, contactSubject, contactText, type Enquiry } from "@/lib/email/contactTemplate";

/**
 * Contact / "Book a call" submissions → branded email to Bilal via SMTP (Nodemailer).
 * The visitor's address is set as Reply-To, so replying in Gmail answers them directly.
 */

const RATE_LIMIT = 8; // sends…
const RATE_WINDOW_MS = 10 * 60 * 1000; // …per 10 minutes per visitor
const hits = new Map<string, { count: number; reset: number }>();

function limited(ip: string) {
  // only protect the live site — never block yourself while developing
  if (process.env.NODE_ENV !== "production") return false;
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

let transporter: Transporter | null = null;
function getTransporter() {
  if (transporter) return transporter;
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT ?? 587),
    secure: EMAIL_SECURE === "true", // false on 587 → upgrades with STARTTLS
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s-]{7,20}$/;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // hidden "company" field — real people never fill it, bots usually do
  if (clean(body.company, 100)) return Response.json({ ok: true });

  const enquiry: Enquiry = {
    name: clean(body.name, 80),
    email: clean(body.email, 120),
    phone: clean(body.phone, 20),
    message: clean(body.message, 3000),
    topic: clean(body.topic, 60) || undefined,
    when: clean(body.when, 80) || undefined,
    source: clean(body.source, 40) || "Website",
  };

  if (!enquiry.name || !enquiry.message) {
    return Response.json({ error: "Please add your name and what you'd like to discuss." }, { status: 400 });
  }
  if (!EMAIL_RE.test(enquiry.email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!PHONE_RE.test(enquiry.phone)) {
    return Response.json({ error: "Please enter a valid contact number." }, { status: 400 });
  }

  // counted only once the form is valid, so typos don't use up a visitor's sends
  if (limited(ip)) {
    return Response.json({ error: "You've sent a few messages already — please try again in a few minutes." }, { status: 429 });
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.error("[contact] EMAIL_* environment variables are missing");
    return Response.json({ error: "Email isn't configured yet — please email Bilal directly." }, { status: 500 });
  }

  try {
    await mailer.sendMail({
      from: { name: "Bilal Ali · Portfolio", address: process.env.EMAIL_FROM || process.env.EMAIL_USER! },
      to: process.env.CONTACT_TO || "bilalwdev26@gmail.com",
      replyTo: { name: enquiry.name, address: enquiry.email },
      subject: contactSubject(enquiry),
      html: contactHtml(enquiry),
      text: contactText(enquiry),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed:", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Couldn't send right now — please email bilalwdev26@gmail.com directly." },
      { status: 502 }
    );
  }
}
