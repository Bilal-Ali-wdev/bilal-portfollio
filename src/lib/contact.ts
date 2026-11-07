"use client";

/** Fired anywhere on the page to open the "Book a call" popup. */
export const OPEN_CONTACT_EVENT = "contact:open";

export function openContact() {
  window.dispatchEvent(new Event(OPEN_CONTACT_EVENT));
}
