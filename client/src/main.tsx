import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const apiBase = import.meta.env.VITE_API_URL?.trim();
const trpcUrl = apiBase
  ? (apiBase.endsWith("/trpc") ? apiBase : `${apiBase.replace(/\/$/, "")}/api/trpc`)
  : "/api/trpc";
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: trpcUrl,
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

// Register Service Worker for PWA and Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[SW] ✅ Service Worker registered:', registration.scope);
        
        // Check service worker status
        registration.addEventListener('updatefound', () => {
          console.log('[SW] Update found, installing new version...');
        });
        
        if (registration.active) {
          console.log('[SW] ✅ Service worker is active');
        }
        
        // Request notification permission (will be requested again when admin logs in)
        if ('Notification' in window) {
          console.log('[Notification] Current permission:', Notification.permission);
          if (Notification.permission === 'default') {
            console.log('[Notification] Permission not yet requested, will request on admin login');
          }
        } else {
          console.warn('[Notification] ❌ Not supported in this browser');
        }
      })
      .catch((error) => {
        console.error('[SW] ❌ Registration failed:', error);
      });
  });
} else {
  console.warn('[SW] ❌ Service Workers not supported in this browser');
}

// Handle install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] Install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  
  // You can show a custom install button here
  // For now, browser will show its own prompt
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  deferredPrompt = null;
});
