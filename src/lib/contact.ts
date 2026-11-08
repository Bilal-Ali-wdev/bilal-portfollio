"use client";

/** Fired anywhere on the page to open the "Book a call" popup. */
export const OPEN_CONTACT_EVENT = "contact:open";

export function openContact() {
  window.dispatchEvent(new Event(OPEN_CONTACT_EVENT));
}

export type EnquiryPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
  topic?: string;
  when?: string;
  source: string;
  company?: string; // honeypot — left empty by real visitors
};

/** Sends an enquiry to /api/contact, which emails it to Bilal. */
export async function sendEnquiry(payload: EnquiryPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (res.ok && data.ok) return { ok: true };
    return { ok: false, error: data.error ?? "Couldn't send right now — please try again." };
  } catch {
    return { ok: false, error: "You seem to be offline — please check your connection and try again." };
  }
}

/** Reads a FormData field as a trimmed string. */
export const field = (f: FormData, key: string) => String(f.get(key) ?? "").trim();
