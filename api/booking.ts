import { Resend } from "resend";
import { getSupabase, BOOKINGS_TABLE, CLIENTS_TABLE } from "./_lib/supabase.js";
import { VALENTINES_DATE, getBaseUrl, valentinesGuestEmailHtml, valentinesRequestReceivedEmailHtml } from "./_lib/valentinesEmail.js";
import { confirmedEmailHtml } from "./_lib/confirmedEmail.js";
import {
  isDateBlocked,
  getBlockedDateReason,
  isEveningBlockedOnLunchOnlyDate,
  isPastTime,
  isRequestOnlyDate,
} from "./_lib/blockedDates.js";
import { isBlockedByAdminRules, type ReservationBlockRow } from "./_lib/reservationBlocks.js";
import { sendPushToAllSubscriptions } from "./_lib/pushSend.js";

const FROM = "Spinella Geneva <info@spinella.ch>";
const BCC = "info@spinella.ch";

/** Same guest + slot within this window = retry, not a new booking (stops duplicate rows). */
const DUPLICATE_WINDOW_MS = 30 * 60 * 1000;

function resendErrorInfo(err: unknown): { message: string; isQuota: boolean; isRateLimit: boolean } {
  const e = err as { message?: string; name?: string; statusCode?: number } | null;
  const message = [e?.name, e?.message].filter(Boolean).join(": ") || String(err);
  const lower = message.toLowerCase();
  const isQuota =
    lower.includes("daily_quota") ||
    lower.includes("monthly_quota") ||
    lower.includes("quota exceeded");
  const isRateLimit =
    e?.statusCode === 429 ||
    lower.includes("rate_limit") ||
    lower.includes("too many requests") ||
    isQuota;
  return { message, isQuota, isRateLimit };
}

async function sendWithRetry(
  send: () => Promise<{ data: unknown; error: unknown }>
): Promise<{ data: unknown; error: unknown; retried: boolean }> {
  let result = await send();
  if (!result.error) return { ...result, retried: false };
  const info = resendErrorInfo(result.error);
  if (!info.isRateLimit) return { ...result, retried: false };
  // Brief backoff: helps when deposit campaigns or bursts hit Resend's 10 req/s or daily quota edge.
  await new Promise((r) => setTimeout(r, 1200));
  result = await send();
  return { ...result, retried: true };
}

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
  dietaryRequirements?: string | null;
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
${data.dietaryRequirements ? `<tr><td colspan="2" style="padding-top:12px;border-top:1px solid #2a2520;font-size:13px;color:#8a7a5c;">Dietary / allergies</td></tr><tr><td colspan="2" style="font-size:14px;color:#e8e4dc;">${data.dietaryRequirements}</td></tr>` : ""}
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
  dietaryRequirements?: string | null;
}): string {
  const displayDate = formatDate(data.date);
  return `<p><strong>New reservation request</strong></p><ul>
<li><strong>Name:</strong> ${data.name}</li>
<li><strong>Email:</strong> ${data.email}</li>
<li><strong>Phone:</strong> ${data.phone}</li>
<li><strong>Date:</strong> ${displayDate}</li>
<li><strong>Time:</strong> ${data.time}</li>
<li><strong>Guests:</strong> ${data.partySize}</li>
${data.dietaryRequirements ? `<li><strong>Dietary / allergies:</strong> ${data.dietaryRequirements}</li>` : ""}
${data.specialRequests ? `<li><strong>Special requests:</strong> ${data.specialRequests}</li>` : ""}
</ul>`;
}

/** Vercel serverless: respond to POST only; use Node (req, res) so response is always sent. */
export default async function handler(
  req: { method?: string; body?: string | object },
  res: { status: (code: number) => { json: (body: object) => void; end: () => void }; setHeader: (name: string, value: string) => void }
): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
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
  const dietaryRequirements =
    o?.dietaryRequirements != null && o.dietaryRequirements !== "" ? String(o.dietaryRequirements) : null;

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 10 || !date || !time || !Number.isInteger(partySize) || partySize < 1 || partySize > 70) {
    res.status(400).json({ error: "Invalid booking data" });
    return;
  }

  const dateObj = new Date(date + "T12:00:00");
  if (dateObj.getDay() === 0) {
    res.status(400).json({ error: "We are closed on Sundays" });
    return;
  }

  if (isDateBlocked(date)) {
    const reason = getBlockedDateReason(date);
    res.status(400).json({
      error: reason
        ? "Désolés, nous ne sommes pas disponibles à cette période. Veuillez réserver une autre date."
        : "Cette date est indisponible pour les réservations",
    });
    return;
  }

  // April 15: evening booked for event; reject evening, allow lunch only
  if (isEveningBlockedOnLunchOnlyDate(date, time)) {
    res.status(400).json({
      error: "Désolés, nous sommes réservés pour un événement le soir — seul le déjeuner est disponible ce jour-là.",
    });
    return;
  }

  // Reject past times for today
  if (isPastTime(date, time)) {
    res.status(400).json({
      error: "Cette heure est déjà passée. Veuillez choisir une heure ultérieure.",
    });
    return;
  }

  const resend = new Resend(key);
  const data = { name, email, phone, date, time, partySize, specialRequests, dietaryRequirements };

  const isValentines = date === VALENTINES_DATE;
  const flyerUrl = `${getBaseUrl()}/valentines-menu.jpeg`;

  // Request-only: Valentine's, 8+ people, or 14–18 April (manual approval for all tables) → guest gets "request received", admin must Accept.
  const requestOnly = isValentines || partySize >= 8 || isRequestOnlyDate(date);
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
    // Admin-configured dynamic blocks (single day, hours, range/week)
    const { data: dynamicBlocks } = await supabase
      .from("reservation_blocks")
      .select("id, start_date, end_date, start_time, end_time, reason, is_active")
      .eq("is_active", true);
    const dynamicResult = isBlockedByAdminRules(
      date,
      time,
      (dynamicBlocks ?? []) as ReservationBlockRow[]
    );
    if (dynamicResult.blocked) {
      res.status(400).json({
        error:
          dynamicResult.reason ||
          "Désolés, nous ne pouvons pas prendre de réservation en ligne pour cette date ou ce créneau.",
      });
      return;
    }
    // Deduplicate: guest retries after "Failed to send confirmation email" used to create
    // many identical rows for the same date/time (the booking was already saved before email).
    const sinceIso = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
    const { data: existingRows } = await supabase
      .from(BOOKINGS_TABLE)
      .select("id, status, sent_emails, created_at")
      .eq("email", email)
      .eq("date", date)
      .eq("time", time)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(1);

    const existing = (existingRows?.[0] ?? null) as {
      id: string;
      status: string;
      sent_emails?: { id?: string; type?: string }[] | null;
      created_at?: string;
    } | null;

    let bookingId: string;
    let reusedExisting = false;
    let skipPush = false;

    if (existing?.id) {
      bookingId = existing.id;
      reusedExisting = true;
      skipPush = true;
      console.warn(
        "[booking] Reusing recent duplicate booking",
        bookingId,
        email,
        date,
        time,
        existing.created_at
      );
    } else {
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
          dietary_requirements: dietaryRequirements ?? null,
          status,
        })
        .select("id")
        .single();
      if (insertErr || !inserted) {
        const errMsg = insertErr?.message ?? "";
        const errCode = (insertErr as { code?: string } | null)?.code ?? "";
        console.error("[booking] Supabase insert failed:", errCode, errMsg, insertErr);
        const isSchemaError = /column .* does not exist|relation .* does not exist/i.test(errMsg);
        res.status(500).json({
          error: "Failed to save reservation",
          ...(isSchemaError && {
            details:
              "Database schema may be out of date. Check SUPABASE_SETUP.md and run the bookings table migrations.",
          }),
        });
        return;
      }
      bookingId = (inserted as { id: string }).id;
    }

    const { error: clientErr } = await supabase.from(CLIENTS_TABLE).upsert(
      { name, email, phone: phone || null, source: "booking" },
      { onConflict: "email" }
    );
    if (clientErr) console.error("[booking] Clients upsert failed:", clientErr);

    const appendSentEmail = async (resendId: string, type: string) => {
      const { data: row } = await supabase.from(BOOKINGS_TABLE).select("sent_emails").eq("id", bookingId).single();
      const prev = (row as { sent_emails?: unknown[] } | null)?.sent_emails ?? [];
      const next = [...prev, { id: resendId, type, sentAt: new Date().toISOString() }];
      await supabase.from(BOOKINGS_TABLE).update({ sent_emails: next }).eq("id", bookingId);
    };

    const alreadySentGuest =
      Array.isArray(existing?.sent_emails) &&
      existing!.sent_emails!.some((e) =>
        requestOnly ? e?.type === "request" : e?.type === "confirmation" || e?.type === "confirmed"
      );

    let emailSent = alreadySentGuest;
    let emailError: string | null = null;

    // Guest email — never fail the reservation if Resend is down / out of quota.
    // (Old behaviour returned 500 after insert → guest retried → duplicate bookings for days.)
    if (!alreadySentGuest) {
      if (requestOnly) {
        const { data: sendData, error: err1 } = await sendWithRetry(() =>
          resend.emails.send({
            from: FROM,
            to: [email],
            bcc: [BCC],
            subject: isValentines ? `Demande en attente – Spinella Geneva` : `Booking Request - ${name}`,
            html: isValentines ? valentinesRequestReceivedEmailHtml(name) : guestEmailHtml(data),
          })
        );
        if (err1) {
          const info = resendErrorInfo(err1);
          emailError = info.message;
          console.error(
            "[booking] Guest request email failed:",
            info.message,
            info.isQuota ? "(Resend quota — check https://resend.com/overview)" : "",
            err1
          );
        } else {
          emailSent = true;
          const resendId = (sendData as { id?: string })?.id;
          if (resendId) await appendSentEmail(resendId, "request");
        }
      } else {
        const { data: sendData, error: err1 } = await sendWithRetry(() =>
          resend.emails.send({
            from: FROM,
            to: [email],
            bcc: [BCC],
            subject: `Réservation confirmée – Spinella Genève`,
            html: confirmedEmailHtml(data),
          })
        );
        if (err1) {
          const info = resendErrorInfo(err1);
          emailError = info.message;
          console.error(
            "[booking] Guest confirmation email failed:",
            info.message,
            info.isQuota ? "(Resend quota — check https://resend.com/overview)" : "",
            err1
          );
        } else {
          emailSent = true;
          const resendId = (sendData as { id?: string })?.id;
          if (resendId) await appendSentEmail(resendId, "confirmation");
        }
      }
    }

    // Restaurant notification (skip if BCC already went to info@ via guest email, unless custom RESTAURANT_EMAIL)
    if (restaurantEmail && restaurantEmail.toLowerCase() !== BCC.toLowerCase()) {
      const { error: err2 } = await resend.emails.send({
        from: FROM,
        to: [restaurantEmail],
        subject: requestOnly
          ? `[Spinella] Demande de réservation : ${name} – ${date} ${time}`
          : `[Spinella] Nouvelle réservation (confirmée) : ${name} – ${date} ${time}`,
        html: restaurantEmailHtml(data),
      });
      if (err2) console.error("[booking] Restaurant email failed:", err2);
    }

    if (!skipPush) {
      sendPushToAllSubscriptions({
        title: "Spinella",
        body: `Nouvelle réservation : ${name} – ${date} ${time}`,
        url: "/admin",
        tag: "spinella-new-booking",
      }).catch((err) => console.error("[booking] Push notification failed:", err));
    }

    const confirmed = existing ? existing.status === "confirmed" : !requestOnly;
    res.status(200).json({
      success: true,
      confirmed,
      emailSent,
      ...(emailError && !emailSent ? { emailWarning: "confirmation_email_failed" } : {}),
      ...(reusedExisting ? { reused: true } : {}),
    });
  } catch (err) {
    console.error("[booking] Error:", err);
    res.status(500).json({ error: "Failed to process booking" });
  }
}
