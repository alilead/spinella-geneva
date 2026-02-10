# Valentine's Day email flyer

Place the Valentine's menu flyer image here so it is sent in the automatic emails for 14 February:

- **Filename:** `valentines-menu.png` (or update the URL in `api/booking.ts` and `api/bookings/valentines.ts` if you use `.jpg`)
- **Location:** this folder (`client/public/`) so it is deployed and available at `https://www.spinella.ch/valentines-menu.png`

Once the image is in place and the site is deployed:
- All new bookings for 14 February will receive the Saint-Valentin email with the flyer.
- You can use the admin button "Envoyer email Saint-Valentin (14 fév.)" to send the same email to everyone who already has a reservation on that date.
- The **Events** page shows the flyer in the "Menu Saint-Valentin" section (`/events#saint-valentin`), and the **home page** banner links to it.
