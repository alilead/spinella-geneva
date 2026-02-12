/**
 * Push Notifications Utility for Spinella PWA
 * Handles permission requests and sending notifications
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Notifications] ❌ Not supported in this browser');
    return 'denied';
  }

  console.log('[Notifications] Current permission:', Notification.permission);

  if (Notification.permission === 'granted') {
    console.log('[Notifications] ✅ Permission already granted');
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    console.log('[Notifications] Requesting permission...');
    const permission = await Notification.requestPermission();
    console.log('[Notifications] Permission response:', permission);
    return permission;
  }

  console.warn('[Notifications] ⚠️ Permission was previously denied');
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
  console.log('[Notifications] Attempting to send notification:', options.title);
  
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.warn('[Notifications] ⚠️ Cannot send notification - permission:', permission);
    return;
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // Use service worker to show notification (better for PWA)
    console.log('[Notifications] Using service worker to show notification');
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
    console.log('[Notifications] ✅ Notification sent via service worker');
  } else {
    // Fallback to regular notification
    console.log('[Notifications] Service worker not ready, using regular notification');
    new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      tag: options.tag || 'spinella-notification',
      data: options.data,
    });
    console.log('[Notifications] ✅ Notification sent (fallback)');
  }
}

export async function subscribeUserToPush(authToken?: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] ❌ Not supported in this browser');
    return null;
  }

  console.log('[Push] Starting subscription process...');

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.warn('[Push] ⚠️ Cannot subscribe - permission not granted:', permission);
    return null;
  }

  try {
    console.log('[Push] Waiting for service worker to be ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[Push] ✅ Service worker ready');
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('[Push] ✅ Already subscribed:', subscription.endpoint.substring(0, 50) + '...');
      return subscription;
    }
    
    console.log('[Push] No existing subscription, creating new one...');
    
    // Get VAPID public key from server
    console.log('[Push] Fetching VAPID public key...');
    const response = await fetch('/api/push/vapid-public-key');
    const { publicKey } = await response.json();
    
    if (!publicKey) {
      console.error('[Push] ❌ No VAPID public key available from server');
      return null;
    }
    
    console.log('[Push] ✅ Got VAPID public key:', publicKey.substring(0, 20) + '...');
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    
    console.log('[Push] ✅ Subscribed:', subscription.endpoint.substring(0, 50) + '...');
    
    // Send subscription to your server to store it
    console.log('[Push] Sending subscription to server...');
    const storeResponse = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify(subscription),
    });
    
    if (storeResponse.ok) {
      console.log('[Push] ✅ Subscription stored on server');
    } else {
      console.error('[Push] ❌ Failed to store subscription:', await storeResponse.text());
    }
    
    return subscription;
  } catch (error) {
    console.error('[Push] ❌ Subscription failed:', error);
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
