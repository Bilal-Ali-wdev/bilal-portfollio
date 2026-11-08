/**
 * Branded email for a new enquiry / call request. Table-based layout with inline
 * styles so it renders the same in Gmail, Outlook and Apple Mail.
 */
export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  message: string;
  topic?: string;
  when?: string;
  source: string; // where it came from: "Book a call popup" / "AI chat"
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace";

function row(label: string, valueHtml: string) {
  return `
  <tr>
    <td style="padding:14px 0;border-bottom:1px solid #ececec;width:150px;vertical-align:top;font:600 11px/1.4 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:#8a8a8a;">${label}</td>
    <td style="padding:14px 0;border-bottom:1px solid #ececec;vertical-align:top;font:500 15px/1.5 ${FONT};color:#111111;">${valueHtml}</td>
  </tr>`;
}

export function contactSubject(e: Enquiry) {
  // strip line breaks so nothing can be injected into the header
  const name = e.name.replace(/[\r\n]+/g, " ").slice(0, 80);
  return `New call request — ${name}${e.topic ? ` · ${e.topic.replace(/[\r\n]+/g, " ").slice(0, 40)}` : ""}`;
}

export function contactHtml(e: Enquiry) {
  const received = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  });
  const tel = e.phone.replace(/[^\d+]/g, "");

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(contactSubject(e))}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <!-- preheader (inbox preview line) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(e.name)} wants to talk${e.topic ? ` about ${esc(e.topic)}` : ""} — ${esc(e.message.slice(0, 90))}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e7e7ea;">

        <!-- header -->
        <tr><td style="background:#0b0b0d;padding:28px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font:800 20px/1 ${FONT};color:#ffffff;letter-spacing:-.02em;">Bilal Ali</td>
            <td align="right" style="font:600 10px/1 ${MONO};letter-spacing:.1em;text-transform:uppercase;color:#a1a1aa;">Portfolio · ${esc(e.source)}</td>
          </tr></table>
          <div style="margin-top:22px;display:inline-block;padding:5px 11px;border-radius:999px;border:1px solid rgba(255,255,255,.18);font:600 10px/1 ${MONO};letter-spacing:.1em;text-transform:uppercase;color:#4ade80;">&#9679; New call request</div>
          <h1 style="margin:14px 0 0;font:800 28px/1.15 ${FONT};letter-spacing:-.03em;color:#ffffff;">${esc(e.name)} wants to talk</h1>
          <p style="margin:8px 0 0;font:400 14px/1.5 ${FONT};color:#a1a1aa;">Received ${esc(received)} (PKT)</p>
        </td></tr>

        <!-- details -->
        <tr><td style="padding:12px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row("Name", esc(e.name))}
            ${row("Email", `<a href="mailto:${esc(e.email)}" style="color:#111111;text-decoration:underline;">${esc(e.email)}</a>`)}
            ${row("Contact number", `<a href="tel:${esc(tel)}" style="color:#111111;text-decoration:underline;">${esc(e.phone)}</a>`)}
            ${e.topic ? row("Topic", esc(e.topic)) : ""}
            ${e.when ? row("Preferred time", esc(e.when)) : ""}
          </table>
        </td></tr>

        <!-- discussion -->
        <tr><td style="padding:20px 32px 8px;">
          <div style="font:600 11px/1.4 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:#8a8a8a;">What they want to discuss</div>
          <div style="margin-top:10px;padding:18px 20px;border-radius:14px;background:#f6f7f9;border:1px solid #ececec;font:400 15px/1.65 ${FONT};color:#1a1a1a;white-space:pre-wrap;">${esc(e.message)}</div>
        </td></tr>

        <!-- actions -->
        <tr><td style="padding:24px 32px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="border-radius:999px;background:#111111;">
              <a href="mailto:${esc(e.email)}?subject=${encodeURIComponent("Re: your call request")}" style="display:inline-block;padding:13px 22px;font:600 14px/1 ${FONT};color:#ffffff;text-decoration:none;">Reply to ${esc(e.name.split(" ")[0])} &rarr;</a>
            </td>
            <td width="10"></td>
            <td style="border-radius:999px;border:1px solid #d4d4d8;">
              <a href="tel:${esc(tel)}" style="display:inline-block;padding:12px 20px;font:600 14px/1 ${FONT};color:#111111;text-decoration:none;">Call ${esc(e.phone)}</a>
            </td>
          </tr></table>
          <p style="margin:18px 0 0;font:400 12.5px/1.5 ${FONT};color:#8a8a8a;">Tip: just hit Reply — it goes straight to ${esc(e.email)}.</p>
        </td></tr>

        <!-- footer -->
        <tr><td style="padding:18px 32px;border-top:1px solid #ececec;background:#fafafa;font:400 12px/1.5 ${FONT};color:#9a9a9a;">
          Sent from the contact form on Bilal Ali's portfolio.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function contactText(e: Enquiry) {
  return [
    `New call request — ${e.source}`,
    ``,
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    `Contact number: ${e.phone}`,
    e.topic ? `Topic: ${e.topic}` : "",
    e.when ? `Preferred time: ${e.when}` : "",
    ``,
    `What they want to discuss:`,
    e.message,
    ``,
    `Reply to this email to answer ${e.name} directly.`,
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
}
