/** Confirmation email (guest only) – used for auto-confirm and when admin accepts. */

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function confirmedEmailHtml(data: {
  name: string;
  date: string;
  time: string;
  partySize: number;
  phone: string;
  specialRequests?: string | null;
}): string {
  const displayDate = formatDate(data.date);
  return `
<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:0;background:#0c0c0c;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0c;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid #2a2520;">
<tr><td style="padding:32px 24px;text-align:center;"><p style="margin:0;font-size:11px;letter-spacing:4px;color:#8a7a5c;">Restaurant &amp; Bar</p>
<h1 style="margin:8px 0 0;font-size:32px;letter-spacing:4px;color:#d4af37;">SPINELLA</h1><p style="margin:4px 0 0;font-size:12px;color:#b8a574;">GENEVA</p></td></tr>
<tr><td style="padding:0 24px 24px;"><p style="margin:0;font-size:16px;color:#e8e4dc;">Bonjour ${data.name},</p>
<p style="margin:16px 0 0;font-size:17px;line-height:1.5;color:#e8e4dc;"><strong style="color:#d4af37;">Your table is booked.</strong></p>
<p style="margin:8px 0 0;font-size:17px;line-height:1.5;color:#e8e4dc;"><strong style="color:#d4af37;">Votre table a été réservée.</strong></p>
<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#c4bfb5;">We look forward to welcoming you. / Nous avons hâte de vous accueillir.</p></td></tr>
<tr><td style="padding:0 24px 24px;"><table width="100%" cellpadding="12" cellspacing="0" style="background:#1a1814;border:1px solid #2a2520;">
<tr><td style="font-size:13px;color:#8a7a5c;">Date</td><td style="text-align:right;font-size:14px;color:#e8e4dc;">${displayDate}</td></tr>
<tr><td style="font-size:13px;color:#8a7a5c;">Heure</td><td style="text-align:right;font-size:14px;color:#e8e4dc;">${data.time}</td></tr>
<tr><td style="font-size:13px;color:#8a7a5c;">Nombre de personnes</td><td style="text-align:right;font-size:14px;color:#e8e4dc;">${data.partySize}</td></tr>
<tr><td style="font-size:13px;color:#8a7a5c;">Téléphone</td><td style="text-align:right;font-size:14px;color:#e8e4dc;">${data.phone}</td></tr>
${data.specialRequests ? `<tr><td colspan="2" style="padding-top:12px;border-top:1px solid #2a2520;font-size:13px;color:#8a7a5c;">Demandes spéciales</td></tr><tr><td colspan="2" style="font-size:14px;color:#e8e4dc;">${data.specialRequests}</td></tr>` : ""}
</table></td></tr>
<tr><td style="padding:24px;text-align:center;font-size:13px;color:#8a7a5c;">Rue Liotard 4, 1202 Genève · <a href="tel:+41225034186" style="color:#d4af37;">+41 22 503 41 86</a> · <a href="mailto:info@spinella.ch" style="color:#d4af37;">info@spinella.ch</a></td></tr>
</table></td></tr></table></body></html>`;
}
