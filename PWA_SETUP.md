# PWA Setup Guide - Spinella Restaurant

## What's a PWA (Progressive Web App)?

Your website is now a **Progressive Web App**, which means users can:
- ✅ **Install it on their phone** like a native app
- ✅ **Receive push notifications** for new reservations
- ✅ **Use it offline** (basic functionality)
- ✅ **Get a better mobile experience** with app-like navigation

---

## How to Install on Phone

### iPhone (iOS)
1. Open **Safari** (must use Safari, not Chrome)
2. Go to `https://www.spinella.ch`
3. Tap the **Share button** (square with arrow pointing up)
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"** in the top right
6. The Spinella app icon will appear on your home screen

### Android
1. Open **Chrome** or **Edge**
2. Go to `https://www.spinella.ch`
3. Tap the **menu** (three dots)
4. Tap **"Add to Home screen"** or **"Install app"**
5. Tap **"Add"** or **"Install"**
6. The Spinella app will appear on your home screen

---

## Push Notifications

### How They Work
- **Admin dashboard**: When logged in as admin, the app will ask for notification permission
- **New reservations**: You'll receive a notification on your phone when new bookings arrive (every 30 seconds the app checks for new reservations)
- **Works even when app is closed**: Notifications will appear on your phone's lock screen

### Enable Notifications

#### iPhone
1. Install the app (see above)
2. Open the installed app
3. When prompted, tap **"Allow"** for notifications
4. If you missed the prompt: Settings → Spinella → Notifications → Allow

#### Android
1. Install the app (see above)
2. Open the installed app
3. When prompted, tap **"Allow"** for notifications
4. If you missed the prompt: Settings → Apps → Spinella → Notifications → Enable

---

## Features

### ✅ Currently Working
- Install to home screen (iOS & Android)
- App icon and splash screen
- Offline support (basic pages cached)
- Push notifications for new reservations (admin only)
- Desktop notifications (when admin dashboard is open)

### 🔔 Notification Scenarios
1. **Admin logged in**: Toast notification + push notification
2. **App in background**: Push notification on lock screen
3. **App closed**: Push notification still works (service worker running)

---

## Technical Details

### Files Added
- `client/public/manifest.json` - PWA configuration
- `client/public/sw.js` - Service worker (handles offline & notifications)
- `client/public/icon-192.png` - App icon (192x192)
- `client/public/icon-512.png` - App icon (512x512)
- `client/src/lib/pushNotifications.ts` - Notification utilities

### Configuration
- **Theme color**: Gold (#d4af37) - matches brand
- **Background**: Dark (#0c0c0c)
- **Name**: "Spinella Restaurant & Bar"
- **Short name**: "Spinella"

### Browser Support
- ✅ iOS Safari (14+)
- ✅ Android Chrome (90+)
- ✅ Desktop Chrome/Edge (90+)
- ⚠️ iOS Chrome (limited - redirects to Safari for install)
- ❌ Internet Explorer

---

## Testing

### Test Install
1. Open site on phone
2. Follow install steps above
3. Check that icon appears on home screen
4. Open the app - should open in standalone mode (no browser bar)

### Test Notifications (Admin)
1. Install app on phone
2. Log in to admin dashboard
3. Allow notifications when prompted
4. Have someone submit a test reservation
5. Within 30 seconds, you should receive:
   - Toast notification in the app
   - Push notification on your phone

---

## Troubleshooting

### "Add to Home Screen" not showing
- **iPhone**: Must use Safari browser
- **Android**: Try Chrome or Edge
- Make sure you're on HTTPS (not HTTP)

### Notifications not working
- Check notification permission: Settings → App → Notifications
- Make sure you're logged in as admin
- Check browser console for errors
- Try closing and reopening the app

### App not updating
- Close the app completely
- Clear browser cache
- Reinstall the app (delete from home screen, then reinstall)

---

## Server Push Notifications (Configured)

### ✅ VAPID Keys Setup
The app now has server-side push capabilities using Web Push API:

1. **VAPID keys generated** and stored in `.env`:
   - `VAPID_PUBLIC_KEY` - For client subscriptions
   - `VAPID_PRIVATE_KEY` - For server sending (keep secret!)

2. **API endpoints created**:
   - `GET /api/push/vapid-public-key` - Returns public key for subscriptions
   - `POST /api/push/subscribe` - Stores push subscriptions (admin only)
   - `POST /api/push/send` - Sends push notifications to all subscribed clients (admin only)

3. **Auto-subscribe**: Admin users are automatically subscribed to push when they log in

### Send Push Notification from Server

You can send push notifications using the API:

```bash
curl -X POST https://www.spinella.ch/api/push/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Nouvelle réservation",
    "body": "Client - 14 Feb à 19:30",
    "url": "/admin"
  }'
```

### Production Setup

For Vercel/Netlify, add these environment variables:
- `VAPID_PUBLIC_KEY` - The public key from `.env`
- `VAPID_PRIVATE_KEY` - The private key from `.env`

**⚠️ Important**: Never commit `.env` to git - it contains your private key!

### Better Icons
- Create custom 192x192 and 512x512 icons (currently using logo.png)
- Use a tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)

### Offline Booking
- Cache booking form
- Store submissions in IndexedDB when offline
- Sync when back online using Background Sync API

---

## Deploy Notes

After deploying, users need to:
1. **First-time users**: Just visit the site and install
2. **Existing users**: May need to refresh or reinstall to get PWA features
3. **Service worker updates**: Automatic on next visit (cache busting)

The PWA will work immediately after deploy on Vercel/Netlify - no extra configuration needed!
