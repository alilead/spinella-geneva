import { Resend } from "resend";
import { getSupabase, BOOKINGS_TABLE } from "./lib/supabase.js";

const FROM = "Spinella Geneva <info@spinella.ch>";
const BCC = "info@spinella.ch";

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function guestEmailHtml(data: {
  name: string;
  date: string;
  time: string;
  partySize: number;
  phone: string;
  specialRequests?: string | null;
}): string {
  const displayDate = formatDate(data.date);
  return `
<!DOCTYPE html><html lang="en"><body style="margin:0;padding:0;background:#0c0c0c;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0c;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid #2a2520;">
<tr><td style="padding:32px 24px;text-align:center;"><p style="margin:0;font-size:11px;letter-spacing:4px;color:#8a7a5c;">Restaurant &amp; Bar</p>
<h1 style="margin:8px 0 0;font-size:32px;letter-spacing:4px;color:#d4af37;">SPINELLA</h1><p style="margin:4px 0 0;font-size:12px;color:#b8a574;">GENEVA</p></td></tr>
<tr><td style="padding:0 24px 24px;"><p style="margin:0;font-size:16px;color:#e8e4dc;">Dear ${data.name},</p>
<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#c4bfb5;">Thank you for your reservation request. We have received it and our team will confirm your table within <strong style="color:#d4af37;">10–20 minutes</strong> by email.</p></td></tr>
<tr><td style="padding:0 24px 24px;"><table width="100%" cellpadding="12" cellspacing="0" style="background:#1a1814;border:1px solid #2a2520;">
<tr><td style="font-size:13px;color:#8a7a5c;">Date</td><td style="text-align:right;font-size:14px;color:#e8e4dc;">${displayDate}</td></tr>
<tr><td style="font-size:13px;color:#8a7a5c;">Time</td><td style="text-align:right;font-size:14px;color:#e8e4dc;">${data.time}</td></tr>
<tr><td style="font-size:13px;color:#8a7a5c;">Guests</td><td style="text-align:right;font-size:14px;color:#e8e4dc;">${data.partySize}</td></tr>
<tr><td style="font-size:13px;color:#8a7a5c;">Phone</td><td style="text-align:right;font-size:14px;color:#e8e4dc;">${data.phone}</td></tr>
${data.specialRequests ? `<tr><td colspan="2" style="padding-top:12px;border-top:1px solid #2a2520;font-size:13px;color:#8a7a5c;">Special requests</td></tr><tr><td colspan="2" style="font-size:14px;color:#e8e4dc;">${data.specialRequests}</td></tr>` : ""}
</table></td></tr>
<tr><td style="padding:24px;text-align:center;font-size:13px;color:#8a7a5c;">Rue Liotard 4, 1202 Geneva · <a href="tel:+41225034186" style="color:#d4af37;">+41 22 503 41 86</a> · <a href="mailto:info@spinella.ch" style="color:#d4af37;">info@spinella.ch</a></td></tr>
</table></td></tr></table></body></html>`;
}

function restaurantEmailHtml(data: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string | null;
}): string {
  const displayDate = formatDate(data.date);
  return `<p><strong>New reservation request</strong></p><ul>
<li><strong>Name:</strong> ${data.name}</li>
<li><strong>Email:</strong> ${data.email}</li>
<li><strong>Phone:</strong> ${data.phone}</li>
<li><strong>Date:</strong> ${displayDate}</li>
<li><strong>Time:</strong> ${data.time}</li>
<li><strong>Guests:</strong> ${data.partySize}</li>
${data.specialRequests ? `<li><strong>Special requests:</strong> ${data.specialRequests}</li>` : ""}
</ul>`;
}

/** Vercel serverless: respond to POST only; use Node (req, res) so response is always sent. */
export default async function handler(
  req: { method?: string; body?: string | object },
  res: { status: (code: number) => { json: (body: object) => void; end: () => void }; setHeader: (name: string, value: string) => void }
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.RESEND_API_KEY;
  const restaurantEmail = process.env.RESTAURANT_EMAIL?.trim();
  if (!key) {
    console.error("[booking] RESEND_API_KEY not set");
    res.status(503).json({ error: "Booking service not configured" });
    return;
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const o = (body ?? {}) as Record<string, unknown>;
  const name = typeof o?.name === "string" ? o.name.trim() : "";
  const email = typeof o?.email === "string" ? o.email.trim() : "";
  const phone = typeof o?.phone === "string" ? o.phone.trim() : "";
  const date = typeof o?.date === "string" ? o.date.trim() : "";
  const time = typeof o?.time === "string" ? o.time.trim() : "";
  const partySize = typeof o?.partySize === "number" ? o.partySize : Number(o?.partySize);
  const specialRequests =
    o?.specialRequests != null && o.specialRequests !== "" ? String(o.specialRequests) : null;

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 10 || !date || !time || !Number.isInteger(partySize) || partySize < 1 || partySize > 70) {
    res.status(400).json({ error: "Invalid booking data" });
    return;
  }

  const dateObj = new Date(date + "T12:00:00");
  if (dateObj.getDay() === 0) {
    res.status(400).json({ error: "We are closed on Sundays" });
    return;
  }

  const resend = new Resend(key);
  const data = { name, email, phone, date, time, partySize, specialRequests };

  try {
    const { error: err1 } = await resend.emails.send({
      from: FROM,
      to: [email],
      bcc: [BCC],
      subject: `Booking Confirmation - ${name}`,
      html: guestEmailHtml(data),
    });
    if (err1) {
      console.error("[booking] Guest email failed:", err1);
      res.status(500).json({ error: "Failed to send confirmation email" });
      return;
    }

    if (restaurantEmail) {
      const { error: err2 } = await resend.emails.send({
        from: FROM,
        to: [restaurantEmail],
        bcc: [BCC],
        subject: `[Spinella] New booking: ${name} – ${date} ${time}`,
        html: restaurantEmailHtml(data),
      });
      if (err2) console.error("[booking] Restaurant email failed:", err2);
    }

    // Optional: store in Supabase for admin (view/accept/import). Booking works with Resend only; Supabase is for data management.
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = getSupabase();
        const status = partySize >= 8 ? "request" : "pending";
        await supabase.from(BOOKINGS_TABLE).insert({
          name,
          email,
          phone,
          date,
          time,
          party_size: partySize,
          special_requests: specialRequests ?? null,
          status,
        });
      } catch (dbErr) {
        console.error("[booking] Supabase save failed:", dbErr);
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[booking] Error:", err);
    res.status(500).json({ error: "Failed to process booking" });
  }
}
