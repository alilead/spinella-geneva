/** Valentine's Day: date and guest email HTML (shared by booking + valentines bulk send). */
export const VALENTINES_DATE = "2026-02-14";

export function getBaseUrl(): string {
  const v = process.env.VERCEL_URL;
  return v ? `https://${v}` : "https://www.spinella.ch";
}

const VALENTINES_MENU_HTML = `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1814;border:1px solid #2a2520;border-collapse:collapse;">
<tr><td style="padding:24px;border-bottom:1px solid #2a2520;">
  <p style="margin:0 0 16px;font-size:14px;letter-spacing:3px;color:#d4af37;text-transform:uppercase;">Menu Saint-Valentin</p>
  <p style="margin:0;font-size:15px;font-weight:600;color:#e8e4dc;">Entrée : Salade sfiziosa</p>
  <p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#c4bfb5;">Risotto aux asperges, pecorino moliterno à la truffe, betterave et tuiles de parmigiano</p>
  <p style="margin:12px 0 0;font-size:14px;line-height:1.5;color:#c4bfb5;">Gnocchis à la pistache de Sicile, tomates cerises confites et stracciatella</p>
  <p style="margin:12px 0 0;font-size:15px;font-weight:600;color:#e8e4dc;">Dessert : Tiramisu à la fraise</p>
  <p style="margin:16px 0 0;font-size:18px;font-weight:700;color:#d4af37;">69 CHF par personne</p>
</td></tr>
</table>`;

export function valentinesGuestEmailHtml(name: string, _flyerUrl?: string): string {
  return `
<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:0;background:#0c0c0c;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0c;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid #2a2520;">
<tr><td style="padding:32px 24px;text-align:center;"><p style="margin:0;font-size:11px;letter-spacing:4px;color:#8a7a5c;">Restaurant &amp; Bar</p>
<h1 style="margin:8px 0 0;font-size:32px;letter-spacing:4px;color:#d4af37;">SPINELLA</h1><p style="margin:4px 0 0;font-size:12px;color:#b8a574;">GENEVA</p></td></tr>
<tr><td style="padding:24px 24px 0;"><p style="margin:0;font-size:16px;color:#e8e4dc;">Bonjour ${name},</p>
<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#c4bfb5;">Votre table est réservée. Pour ce jour spécial il y aura uniquement ce menu ; seule une petite sélection sera mise en place en cas d'intolérances alimentaires et d'allergies le jour même.</p>
<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#c4bfb5;"><strong style="color:#d4af37;">Uniquement le soir dès 17h30 à 22h30.</strong></p></td></tr>
<tr><td style="padding:20px 24px;">${VALENTINES_MENU_HTML}</td></tr>
<tr><td style="padding:24px;text-align:center;font-size:13px;color:#8a7a5c;">Rue Liotard 4, 1202 Genève · <a href="tel:+41225034186" style="color:#d4af37;">+41 22 503 41 86</a> · <a href="mailto:info@spinella.ch" style="color:#d4af37;">info@spinella.ch</a></td></tr>
</table></td></tr></table></body></html>`;
}
