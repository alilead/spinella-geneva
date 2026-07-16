# Email Configuration with Resend

This project uses [Resend](https://resend.com) to send booking confirmation emails to customers.

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. The free tier includes 100 emails/day and 3,000 emails/month

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "Spinella Production")
5. Copy the API key (it starts with `re_`)

### 3. Configure Your Domain (Optional but Recommended)

For production use, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `spinella-geneva.ch`)
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

### 4. Add API Key to Environment Variables

Add the following to your `.env` file:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

### 5. Update Email Sender Address

Once your domain is verified, update the sender email in `server/_core/email.ts`:

```typescript
from: 'Spinella Geneva <reservations@spinella-geneva.ch>',
```

Replace with your actual verified domain email.

## Email Features

The booking confirmation email includes:

- **Elegant Design**: Black and gold theme matching Spinella's brand
- **Booking Details**: Date, time, party size, phone, and special requests
- **Restaurant Information**: Address, phone, email
- **Responsive Layout**: Works on all devices
- **Professional Branding**: Spinella logo and tagline

## Testing

For development/testing without a verified domain, you can use:

```typescript
from: 'onboarding@resend.dev',
to: ['delivered@resend.dev'], // Resend test email
```

This will show in your Resend dashboard but won't actually send emails.

## Email Template Customization

The email template is in `server/_core/email.ts` in the `generateBookingEmailHTML()` function. You can customize:

- Colors and styling
- Content and messaging
- Social media links
- Footer information

## Troubleshooting

### "Failed to send confirmation email" / guest sees an error but booking exists?

**Cause (fixed in code):** The API used to save the booking in Supabase first, then send the Resend email. If Resend failed (often **daily quota**), the API returned 500. Guests clicked **Confirm** again → **duplicate reservations** for the same day/time.

**Current behaviour:** If the booking is saved, the guest always gets success. Email failures are logged; the form shows a soft “email pending” message. Retries within 30 minutes reuse the same booking (same email + date + time).

### Hitting Resend limits?

Free Resend: **100 emails/day** and **3,000/month**. BCC and `To` each count. Deposit / newsletter campaigns can burn the daily quota and then booking confirmations fail.

1. Open [resend.com/overview](https://resend.com/overview) and check **Usage** / daily quota.
2. In Vercel logs, look for `[booking] Guest confirmation email failed` and `quota`.
3. Upgrade Resend, or wait for the daily reset, and avoid bulk sends on the same API key as bookings.

### Emails not sending?

1. Check that `RESEND_API_KEY` is set in Vercel (Production) and `.env` locally
2. Verify the API key is valid in Resend dashboard
3. Check server logs for error messages
4. Ensure your domain (`spinella.ch`) is verified for production

### Emails going to spam?

1. Verify your domain with Resend
2. Add SPF, DKIM, and DMARC records
3. Use a professional sender address
4. Avoid spam trigger words in subject/content

## Cost

Resend pricing:
- **Free**: 100 emails/day, 3,000/month
- **Pro**: paid plans remove the daily cap (see [resend.com/pricing](https://resend.com/pricing))

For a restaurant with ~10–20 bookings/day, free tier is usually enough **unless** you also send deposit campaigns or newsletters from the same account.

## Support

- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- API Status: https://status.resend.com