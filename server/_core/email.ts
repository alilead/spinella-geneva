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

export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] Resend API key not configured');
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Spinella Geneva <reservations@spinella-geneva.ch>',
      to: [data.email],
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

function generateBookingEmailHTML(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - Spinella Geneva</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #FFF8E7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #FFFFFF; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Gold Border -->
          <tr>
            <td style="padding: 0;">
              <div style="background: linear-gradient(135deg, #000000 0%, #1A1A1A 100%); padding: 40px 30px; text-align: center; border-top: 4px solid #D4AF37;">
                <h1 style="margin: 0; color: #D4AF37; font-size: 36px; font-weight: bold; letter-spacing: 2px;">SPINELLA</h1>
                <p style="margin: 10px 0 0 0; color: #F4E4C1; font-size: 14px; letter-spacing: 1px;">GENEVA</p>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 28px; font-weight: bold;">Booking Confirmation</h2>
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Dear ${data.name},
              </p>
              <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for choosing Spinella! We're delighted to confirm your reservation. Our team will review your booking and send final confirmation within 10-20 minutes.
              </p>
              
              <!-- Booking Details Box -->
              <div style="background-color: #FFF8E7; border-left: 4px solid #D4AF37; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 20px 0; color: #D4AF37; font-size: 20px; font-weight: bold;">Your Reservation Details</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold;">Date:</td>
                    <td style="padding: 8px 0; color: #000000; font-size: 14px; text-align: right;">${data.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold;">Time:</td>
                    <td style="padding: 8px 0; color: #000000; font-size: 14px; text-align: right;">${data.time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold;">Party Size:</td>
                    <td style="padding: 8px 0; color: #000000; font-size: 14px; text-align: right;">${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold;">Phone:</td>
                    <td style="padding: 8px 0; color: #000000; font-size: 14px; text-align: right;">${data.phone}</td>
                  </tr>
                  ${data.specialRequests ? `
                  <tr>
                    <td colspan="2" style="padding: 15px 0 0 0;">
                      <p style="margin: 0; color: #666666; font-size: 14px; font-weight: bold;">Special Requests:</p>
                      <p style="margin: 5px 0 0 0; color: #000000; font-size: 14px;">${data.specialRequests}</p>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <p style="margin: 30px 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                We look forward to welcoming you to our family. If you need to modify or cancel your reservation, please contact us at least 24 hours in advance.
              </p>
              
              <!-- Contact Info -->
              <div style="background-color: #F9F9F9; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px;"><strong>📍 Address:</strong> Rue Liotard 4, 1202 Geneva</p>
                <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px;"><strong>📞 Phone:</strong> +41 22 734 58 98</p>
                <p style="margin: 0; color: #000000; font-size: 14px;"><strong>✉️ Email:</strong> info@spinella-geneva.ch</p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #D4AF37; font-size: 18px; font-style: italic; text-align: center;">
                "Partager un repas, c'est créer du lien."
              </p>
              <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px; text-align: center;">
                Sharing a meal is creating a bond.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1A1A1A; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #D4AF37; font-size: 24px; font-weight: bold; letter-spacing: 2px;">SPINELLA</p>
              <p style="margin: 0 0 15px 0; color: #F4E4C1; font-size: 12px;">Authentic Sicilian Cuisine in Geneva</p>
              <div style="margin: 20px 0;">
                <a href="https://www.instagram.com/spinellageneva" style="color: #D4AF37; text-decoration: none; margin: 0 10px; font-size: 12px;">Instagram</a>
                <span style="color: #666666;">|</span>
                <a href="https://www.facebook.com/spinellageneva" style="color: #D4AF37; text-decoration: none; margin: 0 10px; font-size: 12px;">Facebook</a>
                <span style="color: #666666;">|</span>
                <a href="https://spinella-geneva.ch" style="color: #D4AF37; text-decoration: none; margin: 0 10px; font-size: 12px;">Website</a>
              </div>
              <p style="margin: 15px 0 0 0; color: #999999; font-size: 11px;">
                © ${new Date().getFullYear()} Spinella Geneva. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
