import { Resend } from "resend";
import { getSupabase, BOOKINGS_TABLE, CLIENTS_TABLE } from "./_lib/supabase.js";
import { VALENTINES_DATE, getBaseUrl, valentinesGuestEmailHtml, valentinesRequestReceivedEmailHtml } from "./_lib/valentinesEmail.js";
import { confirmedEmailHtml } from "./_lib/confirmedEmail.js";

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
<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#c4bfb5;">Thank you for your reservation request. We have received it. Request pending, we will give you an answer as soon as possible. We have sent an email to your address.</p></td></tr>
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

  const isValentines = date === VALENTINES_DATE;
  const flyerUrl = `${getBaseUrl()}/valentines-menu.jpeg`;

  // Request-only: special day (e.g. 14 Feb) or 8+ people → guest gets "request received", admin must Accept. Otherwise: auto-confirm + confirmation email to guest.
  const requestOnly = isValentines || partySize >= 8;
  const status = requestOnly ? "request" : "confirmed";

  // Require Supabase so every booking that sends an email also appears on the dashboard.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[booking] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
    res.status(503).json({ error: "Booking service not configured" });
    return;
  }

  try {
    // Save to Supabase FIRST so the dashboard always has the booking when the guest gets the email.
    const supabase = getSupabase();
    const { data: inserted, error: insertErr } = await supabase
      .from(BOOKINGS_TABLE)
      .insert({
        name,
        email,
        phone,
        date,
        time,
        party_size: partySize,
        special_requests: specialRequests ?? null,
        status,
      })
      .select("id")
      .single();
    if (insertErr || !inserted) {
      console.error("[booking] Supabase insert failed:", insertErr);
      res.status(500).json({ error: "Failed to save reservation" });
      return;
    }
    const bookingId = (inserted as { id: string }).id;
    const { error: clientErr } = await supabase.from(CLIENTS_TABLE).upsert(
      { name, email, phone: phone || null, source: "booking" },
      { onConflict: "email", doUpdate: { name, phone: phone || null, updated_at: new Date().toISOString() } }
    );
    if (clientErr) console.error("[booking] Clients upsert failed:", clientErr);

    const appendSentEmail = async (resendId: string, type: string) => {
      const { data: row } = await supabase.from(BOOKINGS_TABLE).select("sent_emails").eq("id", bookingId).single();
      const prev = (row as { sent_emails?: unknown[] } | null)?.sent_emails ?? [];
      const next = [...prev, { id: resendId, type, sentAt: new Date().toISOString() }];
      await supabase.from(BOOKINGS_TABLE).update({ sent_emails: next }).eq("id", bookingId);
    };

    // Then send email(s).
    if (requestOnly) {
      const { data: sendData, error: err1 } = await resend.emails.send({
        from: FROM,
        to: [email],
        bcc: [BCC],
        subject: isValentines ? `Saint-Valentin à Spinella – Demande reçue` : `Booking Request - ${name}`,
        html: isValentines ? valentinesRequestReceivedEmailHtml(name) : guestEmailHtml(data),
      });
      if (err1) {
        console.error("[booking] Guest email failed:", err1);
        res.status(500).json({ error: "Failed to send request email" });
        return;
      }
      const resendId = (sendData as { id?: string })?.id;
      if (resendId) await appendSentEmail(resendId, "request");
    } else {
      const { data: sendData, error: err1 } = await resend.emails.send({
        from: FROM,
        to: [email],
        subject: `Réservation confirmée – Spinella Genève`,
        html: confirmedEmailHtml(data),
      });
      if (err1) {
        console.error("[booking] Guest confirmation email failed:", err1);
        res.status(500).json({ error: "Failed to send confirmation email" });
        return;
      }
      const resendId = (sendData as { id?: string })?.id;
      if (resendId) await appendSentEmail(resendId, "confirmation");
      if (restaurantEmail) {
        const { error: err2 } = await resend.emails.send({
          from: FROM,
          to: [restaurantEmail],
          subject: `[Spinella] Nouvelle réservation (confirmée) : ${name} – ${date} ${time}`,
          html: restaurantEmailHtml(data),
        });
        if (err2) console.error("[booking] Restaurant email failed:", err2);
      }
    }

    if (requestOnly && restaurantEmail) {
      const { error: err2 } = await resend.emails.send({
        from: FROM,
        to: [restaurantEmail],
        subject: `[Spinella] Demande de réservation : ${name} – ${date} ${time}`,
        html: restaurantEmailHtml(data),
      });
      if (err2) console.error("[booking] Restaurant email failed:", err2);
    }

    res.status(200).json({ success: true, confirmed: !requestOnly });
  } catch (err) {
    console.error("[booking] Error:", err);
    res.status(500).json({ error: "Failed to process booking" });
  }
}
