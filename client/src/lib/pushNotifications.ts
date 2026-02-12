/**
 * Push Notifications Utility for Spinella PWA
 * Handles permission requests and sending notifications
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Not supported in this browser');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
  vibrate?: number[];
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export async function sendLocalNotification(options: NotificationOptions): Promise<void> {
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return;
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // Use service worker to show notification (better for PWA)
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      badge: options.badge || '/icon-192.png',
      tag: options.tag || 'spinella-notification',
      requireInteraction: options.requireInteraction || false,
      data: options.data,
      vibrate: options.vibrate || [200, 100, 200],
      actions: options.actions,
    });
  } else {
    // Fallback to regular notification
    new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      tag: options.tag || 'spinella-notification',
      data: options.data,
    });
  }
}

export async function subscribeUserToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Not supported in this browser');
    return null;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      // You'll need to generate VAPID keys for your server
      // For now, this is a placeholder - you'll need to add your public VAPID key
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      
      // Send subscription to your server to store it
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    }
    
    return subscription;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}
