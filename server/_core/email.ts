import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string | null;
}

const FROM_EMAIL = 'Spinella Geneva <reservations@spinella-geneva.ch>';
const BCC_EMAIL = 'info@spinella.ch';

export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] Resend API key not configured');
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.email],
      bcc: [BCC_EMAIL],
      subject: `Booking Confirmation - ${data.name}`,
      html: generateBookingEmailHTML(data),
    });

    if (error) {
      console.error('[Email] Failed to send confirmation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

/** Sends a copy of the booking to the restaurant (us) via Resend. */
export async function sendBookingNotificationToRestaurant(data: BookingEmailData): Promise<boolean> {
  const to = process.env.RESTAURANT_EMAIL?.trim();
  if (!to) {
    console.warn('[Email] RESTAURANT_EMAIL not set; skipping restaurant notification');
    return false;
  }
  if (!process.env.RESEND_API_KEY) {
    return false;
  }

  try {
    const displayDate = formatDisplayDate(data.date);
    const html = `
      <p><strong>New reservation request</strong></p>
      <ul>
        <li><strong>Name:</strong> ${data.name}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Phone:</strong> ${data.phone}</li>
        <li><strong>Date:</strong> ${displayDate}</li>
        <li><strong>Time:</strong> ${data.time}</li>
        <li><strong>Guests:</strong> ${data.partySize}</li>
        ${data.specialRequests ? `<li><strong>Special requests:</strong> ${data.specialRequests}</li>` : ''}
      </ul>
    `;
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      bcc: [BCC_EMAIL],
      subject: `[Spinella] New booking: ${data.name} – ${data.date} ${data.time}`,
      html,
    });
    if (error) {
      console.error('[Email] Failed to send restaurant notification:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Email] Error sending restaurant notification:', error);
    return false;
  }
}

function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function generateBookingEmailHTML(data: BookingEmailData): string {
  const displayDate = formatDisplayDate(data.date);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reservation Request — Spinella Geneva</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#0c0c0c; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0c0c0c;">
    <tr>
      <td align="center" style="padding: 48px 24px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%; background-color:#111111; border: 1px solid #2a2520;">
          <!-- Top gold rule -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, transparent, #c9a227 20%, #e8d48b 50%, #c9a227 80%, transparent);"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center;">
              <p style="margin:0 0 8px 0; font-size: 11px; letter-spacing: 4px; color: #8a7a5c; text-transform: uppercase;">Restaurant & Bar</p>
              <h1 style="margin:0; font-size: 42px; font-weight: 700; letter-spacing: 6px; color: #d4af37;">SPINELLA</h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; letter-spacing: 3px; color: #b8a574;">GENEVA</p>
              <table role="presentation" width="120" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-top: 24px;">
                <tr><td style="height: 1px; background: linear-gradient(90deg, transparent, #c9a227, transparent);"></td></tr>
              </table>
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin:0; font-size: 18px; line-height: 1.7; color: #e8e4dc;">Dear ${data.name},</p>
              <p style="margin: 20px 0 0 0; font-size: 16px; line-height: 1.7; color: #c4bfb5;">
                Thank you for your reservation request. We have received it and our team will confirm your table within <strong style="color: #d4af37;">10–20 minutes</strong> by email.
              </p>
            </td>
          </tr>
          <!-- Reservation details card -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(180deg, #1a1814 0%, #151310 100%); border: 1px solid #2a2520;">
                <tr>
                  <td style="padding: 28px 32px;">
                    <p style="margin: 0 0 20px 0; font-size: 11px; letter-spacing: 3px; color: #d4af37; text-transform: uppercase;">Your reservation</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #2a2520;">
                          <span style="font-size: 14px; color: #8a7a5c;">Date</span>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #2a2520; text-align: right;">
                          <span style="font-size: 15px; color: #e8e4dc;">${displayDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #2a2520;">
                          <span style="font-size: 14px; color: #8a7a5c;">Time</span>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #2a2520; text-align: right;">
                          <span style="font-size: 15px; color: #e8e4dc;">${data.time}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #2a2520;">
                          <span style="font-size: 14px; color: #8a7a5c;">Guests</span>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #2a2520; text-align: right;">
                          <span style="font-size: 15px; color: #e8e4dc;">${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="font-size: 14px; color: #8a7a5c;">Phone</span>
                        </td>
                        <td style="padding: 10px 0; text-align: right;">
                          <span style="font-size: 15px; color: #e8e4dc;">${data.phone}</span>
                        </td>
                      </tr>
                      ${data.specialRequests ? `
                      <tr>
                        <td colspan="2" style="padding: 16px 0 0 0; border-top: 1px solid #2a2520;">
                          <p style="margin: 0 0 6px 0; font-size: 14px; color: #8a7a5c;">Special requests</p>
                          <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #e8e4dc;">${data.specialRequests}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Note -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #c4bfb5;">
                To modify or cancel, please contact us at least 24 hours in advance. We look forward to welcoming you.
              </p>
            </td>
          </tr>
          <!-- Quote -->
          <tr>
            <td style="padding: 32px 40px 40px; text-align: center;">
              <table role="presentation" width="80" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-bottom: 16px;">
                <tr><td style="height: 1px; background: linear-gradient(90deg, transparent, #c9a227, transparent);"></td></tr>
              </table>
              <p style="margin: 0; font-size: 20px; font-style: italic; color: #d4af37;">"Partager un repas, c'est créer du lien."</p>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #8a7a5c;">Sharing a meal is creating a bond.</p>
            </td>
          </tr>
          <!-- Contact strip -->
          <tr>
            <td style="padding: 24px 40px; background-color: #0f0e0c; border-top: 1px solid #2a2520;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 13px; color: #8a7a5c;">Rue Liotard 4, 1202 Geneva</td>
                </tr>
                <tr>
                  <td style="padding-top: 6px;">
                    <a href="tel:+41225034186" style="font-size: 13px; color: #d4af37; text-decoration: none;">+41 22 503 41 86</a>
                    <span style="color: #4a4540;"> · </span>
                    <a href="mailto:info@spinella.ch" style="font-size: 13px; color: #d4af37; text-decoration: none;">info@spinella.ch</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; letter-spacing: 2px; color: #d4af37;">SPINELLA</p>
              <p style="margin: 0 0 16px 0; font-size: 11px; color: #6a6358;">Authentic Sicilian cuisine in the heart of Geneva</p>
              <p style="margin: 0; font-size: 11px; color: #4a4540;">© ${new Date().getFullYear()} Spinella Restaurant & Bar. All rights reserved.</p>
            </td>
          </tr>
          <!-- Bottom gold rule -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, transparent, #c9a227 20%, #e8d48b 50%, #c9a227 80%, transparent);"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
