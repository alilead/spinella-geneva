import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { sendLocalNotification, subscribeUserToPush } from "@/lib/pushNotifications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Download, Eye, List, Loader2, LogOut, Plus, Trash2, Upload, UserCheck, Users, X } from "lucide-react";
import { supabase, isSupabaseAuthConfigured } from "@/lib/supabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";

export type BookingRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string | null;
  status: string;
};

export type ClientRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  createdAt?: string;
  lastBookingDate?: string | null;
};

function getAuthHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const POLL_INTERVAL_MS = 45_000;

export default function Admin() {
  const { t } = useLanguage();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [valentinesSending, setValentinesSending] = useState(false);
  const [valentinesMessage, setValentinesMessage] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [clientsError, setClientsError] = useState("");
  const [clientsMessage, setClientsMessage] = useState<string | null>(null);
  const [importingClients, setImportingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clientSort, setClientSort] = useState<"name" | "email" | "date">("date");
  const [bookingSort, setBookingSort] = useState<"created" | "date" | "name">("date");
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addClientName, setAddClientName] = useState("");
  const [addClientEmail, setAddClientEmail] = useState("");
  const [addClientPhone, setAddClientPhone] = useState("");
  const [savingClient, setSavingClient] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [addFromListOpen, setAddFromListOpen] = useState(false);
  const [addFromListText, setAddFromListText] = useState("");
  const [addFromListSaving, setAddFromListSaving] = useState(false);
  const [syncingReservationsToClients, setSyncingReservationsToClients] = useState(false);
  const [syncingFromResend, setSyncingFromResend] = useState(false);
  const [bookingDetailId, setBookingDetailId] = useState<string | null>(null);
  const [bookingDetail, setBookingDetail] = useState<{
    booking: BookingRecord;
    emailStatuses: Array<{ id: string; type: string; sentAt: string; status?: string }>;
  } | null>(null);
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setToken(session.access_token);
        setUserEmail(session.user?.email ?? null);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const verifyToken = async () => {
    if (!token) return false;
    try {
      const res = await fetch("/api/admin/login", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return true;
    } catch {
      /* ignore */
    }
    setToken(null);
    return false;
  };

  const previousBookingIds = useRef<Set<string>>(new Set());

  const fetchBookings = useCallback(async (authToken: string) => {
    setFetchError("");
    try {
      const res = await fetch("/api/bookings", { headers: getAuthHeaders(authToken) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.bookings)) {
        const newBookings = data.bookings as BookingRecord[];
        const newIds = new Set(newBookings.map((b) => b.id));
        const added = newBookings.filter((b) => !previousBookingIds.current.has(b.id));
        if (previousBookingIds.current.size > 0 && added.length > 0) {
          const message = t("admin.newReservationNotification").replace("{count}", String(added.length));
          toast.success(message, {
            duration: 10000,
          });
          
          // Send push notification
          sendLocalNotification({
            title: 'Spinella - Nouvelle réservation',
            body: added.length === 1 
              ? `${added[0].name} - ${added[0].date} à ${added[0].time}`
              : `${added.length} nouvelles réservations reçues`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'new-reservation',
            requireInteraction: true,
            data: { url: '/admin', bookings: added },
            vibrate: [200, 100, 200, 100, 200],
          }).catch((err) => console.error('[Push] Failed to send notification:', err));
        }
        previousBookingIds.current = newIds;
        setBookings(newBookings);
      } else {
        setFetchError(t("admin.fetchError"));
      }
    } catch {
      setFetchError(t("admin.fetchError"));
    }
  }, [t]);

  const fetchClients = useCallback(async (authToken: string) => {
    setClientsError("");
    try {
      const res = await fetch("/api/clients", { headers: getAuthHeaders(authToken) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.clients)) {
        setClients(data.clients);
      } else {
        setClientsError(t("admin.clientsFetchError"));
      }
    } catch {
      setClientsError(t("admin.clientsFetchError"));
    }
  }, [t]);

  const filteredAndSortedClients = useMemo(() => {
    let list = [...clients];
    const q = clientSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (clientSort === "name") return a.name.localeCompare(b.name);
      if (clientSort === "email") return a.email.localeCompare(b.email);
      const aDate = a.lastBookingDate ?? a.createdAt ?? "";
      const bDate = b.lastBookingDate ?? b.createdAt ?? "";
      return bDate.localeCompare(aDate);
    });
    return list;
  }, [clients, clientSearch, clientSort]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !addClientEmail.trim()) return;
    setSavingClient(true);
    setClientsError("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          name: addClientName.trim() || addClientEmail.trim(),
          email: addClientEmail.trim(),
          phone: addClientPhone.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(typeof data?.error === "string" ? data.error : "Failed");
      setAddClientOpen(false);
      setAddClientName("");
      setAddClientEmail("");
      setAddClientPhone("");
      await fetchClients(token);
      setClientsMessage(t("admin.clientsImportSuccess").replace("{count}", "1"));
    } catch (err) {
      setClientsError(err instanceof Error ? err.message : t("admin.clientsImportError"));
    } finally {
      setSavingClient(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!token) return;
    setDeletingClientId(id);
    try {
      const res = await fetch("/api/clients", {
        method: "DELETE",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Failed");
      setDeleteClientId(null);
      await fetchClients(token);
    } catch (err) {
      setClientsError(err instanceof Error ? err.message : t("admin.clientsImportError"));
    } finally {
      setDeletingClientId(null);
    }
  };

  const handleExportCsv = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Added"];
    const rows = filteredAndSortedClients.map((c) => [
      `"${(c.name ?? "").replace(/"/g, '""')}"`,
      `"${(c.email ?? "").replace(/"/g, '""')}"`,
      `"${(c.phone ?? "").replace(/"/g, '""')}"`,
      `"${(c.source ?? "").replace(/"/g, '""')}"`,
      c.createdAt ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spinella-clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleExportBookingsCsv = () => {
    const headers = ["Date", "Time", "Name", "Email", "Phone", "Guests", "Status", "Special requests"];
    const rows = sortedBookings.map((b) => [
      b.date,
      b.time,
      `"${(b.name ?? "").replace(/"/g, '""')}"`,
      b.email,
      `"${(b.phone ?? "").replace(/"/g, '""')}"`,
      b.partySize,
      b.status,
      `"${(b.specialRequests ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spinella-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleAddFromList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !addFromListText.trim()) return;
    const lines = addFromListText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const toImport: { name: string; email: string; phone: string | null }[] = [];
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const line of lines) {
      const parts = line.split(/[\t,]/).map((p) => p.trim()).filter(Boolean);
      let name = "";
      let email = "";
      const phone = (parts[2] ?? "").slice(0, 50) || null;
      if (parts.length >= 2 && emailRe.test(parts[1])) {
        name = (parts[0] ?? "").slice(0, 200);
        email = parts[1].toLowerCase();
      } else if (parts.length >= 2 && emailRe.test(parts[0])) {
        email = parts[0].toLowerCase();
        name = (parts[1] ?? email).slice(0, 200);
      } else if (parts.length === 1 && emailRe.test(parts[0])) {
        email = parts[0].toLowerCase();
        name = email;
      } else continue;
      toImport.push({ name, email, phone });
    }
    if (toImport.length === 0) {
      setClientsError("No valid lines (each line needs at least an email, e.g. Name, Email, Phone).");
      return;
    }
    setAddFromListSaving(true);
    setClientsError("");
    try {
      const BATCH = 200;
      let imported = 0;
      for (let i = 0; i < toImport.length; i += BATCH) {
        const batch = toImport.slice(i, i + BATCH);
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: getAuthHeaders(token),
          body: JSON.stringify({ clients: batch }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(typeof data?.error === "string" ? data.error : "Import failed");
        imported += batch.length;
      }
      setAddFromListOpen(false);
      setAddFromListText("");
      await fetchClients(token);
      setClientsMessage(t("admin.clientsImportSuccess").replace("{count}", String(imported)));
    } catch (err) {
      setClientsError(err instanceof Error ? err.message : t("admin.clientsImportError"));
    } finally {
      setAddFromListSaving(false);
    }
  };

  const handleImportCsvClients = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setImportingClients(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        setClientsError("CSV file is empty or has no data rows");
        return;
      }
      const parseLine = (line: string) => {
        const result: string[] = [];
        let cur = "";
        let inQ = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') inQ = !inQ;
          else if (c === "," && !inQ) {
            result.push(cur.trim());
            cur = "";
          } else cur += c;
        }
        result.push(cur.trim());
        return result;
      };
      const headers = parseLine(lines[0]).map((h) => h.trim());
      // Email: E-mail 1, E-mail, email, etc.
      let emailIdx = headers.findIndex((h) => /e-mail 1|e-mail|^email$/i.test(h));
      if (emailIdx < 0) emailIdx = 2;
      // Name: single "name" or "Name", or Prénom + Nom de famille
      const nameIdx = headers.findIndex((h) => /^name$|^nom$|^nombre$/i.test(h));
      const prenomIdx = headers.findIndex((h) => /prénom|prenom/i.test(h));
      const nomIdx = headers.findIndex((h) => /nom de famille|nom$/i.test(h));
      // Phone: Téléphone 1, Téléphone, phone, etc.
      let phoneIdx = headers.findIndex((h) => /téléphone 1|téléphone|phone|tel/i.test(h));
      if (phoneIdx < 0) phoneIdx = 3;
      const toImport: { name: string; email: string; phone: string | null }[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i]);
        const email = String(cols[emailIdx] ?? cols[2] ?? "").trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
        let name: string;
        if (nameIdx >= 0 && cols[nameIdx]?.trim()) {
          name = String(cols[nameIdx]).trim().slice(0, 200);
        } else {
          const prenom = (cols[prenomIdx] ?? "").trim();
          const nom = (cols[nomIdx] ?? "").trim();
          name = [prenom, nom].filter(Boolean).join(" ") || email;
        }
        const phone = (cols[phoneIdx] ?? cols[3] ?? "").trim().replace(/^['"]|['"]$/g, "").slice(0, 50) || null;
        toImport.push({ name: name.slice(0, 200), email, phone });
      }
      if (toImport.length === 0) {
        setClientsError("No valid contacts with email found in CSV. Use columns: Name (or Prénom, Nom de famille), Email (or E-mail 1), Phone (or Téléphone).");
        return;
      }
      // Send full list in one request so the server can detect duplicates (existing clients are skipped; list is prioritized).
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ clients: toImport }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const serverMsg = typeof data?.details === "string" ? data.details : typeof data?.error === "string" ? data.error : "Import failed";
        throw new Error(serverMsg);
      }
      await fetchClients(token);
      setClientsError("");
      const imported = data.imported ?? 0;
      const skipped = data.skipped ?? 0;
      const msg =
        skipped > 0
          ? t("admin.clientsImportWithSkipped")
            .replace("{imported}", String(imported))
            .replace("{skipped}", String(skipped))
          : t("admin.clientsImportSuccess").replace("{count}", String(imported));
      setClientsMessage(msg);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("admin.clientsImportError");
      setClientsError(message);
    } finally {
      setImportingClients(false);
      e.target.value = "";
    }
  };

  const handleSyncReservationsToClients = async () => {
    if (!token) return;
    setSyncingReservationsToClients(true);
    setClientsError("");
    setClientsMessage(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ syncFromBookings: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Sync failed");
      await fetchClients(token);
      const count = data.synced ?? data.total ?? 0;
      setClientsMessage(t("admin.syncReservationsSuccess").replace("{count}", String(count)));
    } catch (err) {
      setClientsError(err instanceof Error ? err.message : t("admin.clientsImportError"));
    } finally {
      setSyncingReservationsToClients(false);
    }
  };

  const handleSyncFromResend = async () => {
    if (!token) return;
    setSyncingFromResend(true);
    setClientsError("");
    setClientsMessage(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ syncFromResend: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data?.details === "string" ? data.details : data?.error ?? "Sync failed");
      await fetchClients(token);
      if ((data.bookingsCreated ?? 0) > 0 || (data.bookingsUpdated ?? 0) > 0) await fetchBookings(token);
      const imported = data.imported ?? 0;
      const skipped = data.skipped ?? 0;
      const created = data.bookingsCreated ?? 0;
      const updated = data.bookingsUpdated ?? 0;
      let msg =
        skipped > 0
          ? t("admin.syncFromResendWithSkipped").replace("{imported}", String(imported)).replace("{skipped}", String(skipped))
          : t("admin.syncFromResendSuccess").replace("{count}", String(imported));
      if (created > 0 || updated > 0) {
        msg += " " + t("admin.syncFromResendBookings").replace("{created}", String(created)).replace("{updated}", String(updated));
      }
      setClientsMessage(msg);
    } catch (err) {
      setClientsError(err instanceof Error ? err.message : t("admin.clientsImportError"));
    } finally {
      setSyncingFromResend(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    if (!supabase) {
      setLoginError(t("admin.authNotConfigured"));
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginError(error.message || t("admin.invalidCredentials"));
        return;
      }
      if (data.session?.access_token) {
        setToken(data.session.access_token);
        setEmail("");
        setPassword("");
      }
    } catch {
      setLoginError(t("admin.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setToken(null);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const data = JSON.parse(text);
        const list = Array.isArray(data) ? data : data.bookings ? data.bookings : [];
        const normalized = list.map((b: Record<string, unknown>) => ({
          name: String(b.name ?? ""),
          email: String(b.email ?? ""),
          phone: String(b.phone ?? ""),
          date: String(b.date ?? "").slice(0, 10),
          time: String(b.time ?? ""),
          partySize: Number(b.partySize) || 0,
          specialRequests: b.specialRequests != null ? String(b.specialRequests) : null,
          status: b.status != null ? String(b.status) : "confirmed",
        }));
        setImporting(true);
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: getAuthHeaders(token),
          body: JSON.stringify({ bookings: normalized }),
        });
        const result = await res.json().catch(() => ({}));
        if (res.ok) {
          await fetchBookings(token);
        } else {
          alert(result.error ?? "Import failed");
        }
      } catch {
        alert("Invalid JSON file");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAccept = async (id: string) => {
    if (!token) return;
    setAcceptingId(id);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ id, status: "confirmed" }),
      });
      if (res.ok) await fetchBookings(token);
    } finally {
      setAcceptingId(null);
    }
  };

  useEffect(() => {
    if (!bookingDetailId || !token) {
      setBookingDetail(null);
      return;
    }
    setBookingDetailLoading(true);
    setBookingDetail(null);
    fetch(`/api/bookings?id=${encodeURIComponent(bookingDetailId)}`, { headers: getAuthHeaders(token) })
      .then((r) => r.json())
      .then((data) => {
        if (data.booking && Array.isArray(data.emailStatuses)) {
          setBookingDetail({ booking: data.booking, emailStatuses: data.emailStatuses });
        }
      })
      .catch(() => setBookingDetail(null))
      .finally(() => setBookingDetailLoading(false));
  }, [bookingDetailId, token]);

  const VALENTINES_BATCH_DELAY_MS = 2 * 60 * 1000; // 2 minutes between batches

  const sendValentinesBatch = useCallback(
    async (offset: number) => {
      if (!token) return;
      const res = await fetch("/api/bookings/valentines", {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ offset, batchSize: 3 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.sent !== "number") {
        setValentinesMessage(t("admin.valentinesError"));
        setValentinesSending(false);
        return;
      }
      const totalSent = offset + data.sent;
      if (data.remaining > 0) {
        setValentinesMessage(
          t("admin.valentinesBatchProgress")
            .replace("{sent}", String(totalSent))
            .replace("{total}", String(data.total))
            .replace("{remaining}", String(data.remaining))
        );
        setTimeout(() => sendValentinesBatch(data.nextOffset), VALENTINES_BATCH_DELAY_MS);
      } else {
        setValentinesMessage(t("admin.valentinesSent").replace("{count}", String(data.total)));
        setValentinesSending(false);
      }
    },
    [token, t]
  );

  const handleSendValentines = async () => {
    if (!token) return;
    setValentinesMessage(null);
    setValentinesSending(true);
    try {
      await sendValentinesBatch(0);
    } catch {
      setValentinesMessage(t("admin.valentinesError"));
      setValentinesSending(false);
    }
  };

  const [verified, setVerified] = useState<boolean | null>(null);
  useEffect(() => {
    if (!token) {
      setVerified(false);
      return;
    }
    verifyToken().then(setVerified);
  }, [token]);

  useEffect(() => {
    if (token && verified) fetchBookings(token);
  }, [token, verified, fetchBookings]);

  useEffect(() => {
    if (token && verified) fetchClients(token);
  }, [token, verified, fetchClients]);

  useEffect(() => {
    if (!token || !verified) return;
    const interval = setInterval(() => fetchBookings(token), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, verified, fetchBookings]);

  // Subscribe to push notifications when admin logs in
  useEffect(() => {
    if (!token || !verified) return;
    
    console.log('[Admin] Attempting to subscribe to push notifications...');
    
    subscribeUserToPush(token).then((subscription) => {
      if (subscription) {
        console.log('[Admin] ✅ Successfully subscribed to push notifications');
        console.log('[Admin] Subscription endpoint:', subscription.endpoint.substring(0, 50) + '...');
      } else {
        console.warn('[Admin] ⚠️ Push subscription returned null - check permissions');
      }
    }).catch((err) => {
      console.error('[Admin] ❌ Failed to subscribe to push:', err);
    });
  }, [token, verified]);

  const byDate = useMemo(() => {
    const map: Record<string, BookingRecord[]> = {};
    bookings.forEach((b) => {
      if (!b.date) return;
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    Object.keys(map).forEach((d) => map[d].sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [bookings]);

  const calendarGrid = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const first = new Date(year, month, 1);
    const dayOfWeek = first.getDay();
    const mondayOffset = (dayOfWeek + 6) % 7;
    const start = new Date(year, month, 1 - mondayOffset);
    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: m === month,
      });
    }
    return days;
  }, [calendarMonth]);

  const sortedBookings = useMemo(() => {
    const list = [...bookings];
    if (bookingSort === "created") {
      list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    } else if (bookingSort === "date") {
      list.sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : a.time.localeCompare(b.time);
      });
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [bookings, bookingSort]);

  const specialRequestsBookings = useMemo(() => {
    return sortedBookings.filter(
      (b) => b.partySize >= 8 || (b.specialRequests != null && String(b.specialRequests).trim() !== "")
    );
  }, [sortedBookings]);

  if (verified === null) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-muted-foreground">{t("admin.loading")}</p>
      </div>
    );
  }

  if (!isSupabaseAuthConfigured()) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              {t("admin.authNotConfigured")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || !verified) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("admin.reservations")}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="admin-email">{t("admin.email")}</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="admin@spinella.ch"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="admin-password">{t("admin.password")}</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder={t("admin.password")}
                  autoComplete="current-password"
                />
              </div>
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("admin.signingIn") : t("admin.logIn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-12 px-2 sm:px-4">
      <div className="container max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.reservations")}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleExportBookingsCsv} disabled={bookings.length === 0} className="flex-1 sm:flex-initial">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.exportBookingsCsv")}</span>
            </Button>
            <label className="flex-1 sm:flex-initial">
              <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importing} />
              <Button type="button" variant="outline" size="sm" asChild disabled={importing} className="w-full">
                <span>
                  {importing ? <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" /> : <Upload className="w-4 h-4 sm:mr-2" />}
                  <span className="hidden sm:inline">{t("admin.importJson")}</span>
                </span>
              </Button>
            </label>
            <Button variant="outline" size="sm" onClick={handleSendValentines} disabled={valentinesSending} className="hidden sm:flex">
              {valentinesSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {valentinesSending ? t("admin.valentinesSending") : t("admin.valentinesSend")}
            </Button>
            {userEmail && (
              <span className="text-xs sm:text-sm text-muted-foreground mr-2 hidden lg:inline">
                {t("admin.loggedInAs").replace("{email}", userEmail)}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.logOut")}</span>
            </Button>
          </div>
        </div>

        {valentinesMessage && <p className="text-sm mb-4 text-muted-foreground">{valentinesMessage}</p>}
        {fetchError && <p className="text-sm text-destructive mb-4">{fetchError}</p>}
        <p className="text-sm text-muted-foreground mb-6">
          {t("admin.instructions")}
        </p>

        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
            <TabsTrigger value="list" className="text-xs sm:text-sm">
              <List className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.list")}</span>
              <span className="sm:hidden">List</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm">
              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.calendar")}</span>
              <span className="sm:hidden">Cal</span>
            </TabsTrigger>
            <TabsTrigger value="special" className="text-xs sm:text-sm">
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.specialRequests")}</span>
              <span className="sm:hidden">Special</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.clients")}</span>
              <span className="sm:hidden">Clients</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              <span className="text-xs sm:text-sm text-muted-foreground">{t("admin.sortBy")}:</span>
              <Select value={bookingSort} onValueChange={(v) => setBookingSort(v as "created" | "date" | "name")}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">{t("admin.sortByCreatedDate")}</SelectItem>
                  <SelectItem value="date">{t("admin.sortByRequestedDate")}</SelectItem>
                  <SelectItem value="name">{t("admin.sortByName")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Card>
              <CardContent className="p-0">
                {sortedBookings.length === 0 ? (
                  <div className="p-4 sm:p-8 text-center text-sm text-muted-foreground">{t("admin.emptyList")}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2 sm:p-3 w-[80px] sm:w-auto">{t("admin.date")}</th>
                          <th className="text-left p-2 sm:p-3 w-[50px] sm:w-auto">{t("admin.time")}</th>
                          <th className="text-left p-2 sm:p-3 min-w-[100px]">{t("admin.name")}</th>
                          <th className="text-left p-2 sm:p-3 w-[40px] hidden sm:table-cell">{t("admin.guests")}</th>
                          <th className="text-left p-2 sm:p-3 w-[70px] sm:w-auto">{t("admin.status")}</th>
                          <th className="text-left p-2 sm:p-3 hidden md:table-cell">{t("admin.phone")}</th>
                          <th className="text-left p-2 sm:p-3 hidden lg:table-cell">{t("admin.email")}</th>
                          <th className="text-left p-2 sm:p-3 w-[80px] sm:w-auto">{t("admin.action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedBookings.map((b) => (
                          <tr key={b.id} className="border-b">
                            <td className="p-2 sm:p-3 whitespace-nowrap text-[10px] sm:text-xs">{b.date}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap text-[10px] sm:text-xs">{b.time}</td>
                            <td className="p-2 sm:p-3 max-w-[120px] sm:max-w-none truncate">{b.name}</td>
                            <td className="p-2 sm:p-3 hidden sm:table-cell">{b.partySize}</td>
                            <td className="p-2 sm:p-3">
                              <span className={`text-[10px] sm:text-xs ${b.status === "confirmed" ? "text-green-600" : b.status === "request" ? "text-amber-600" : "text-muted-foreground"}`}>
                                {b.status === "request" ? "⚠" : b.status === "pending" ? "⏳" : b.status === "cancelled" ? "❌" : "✓"}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 hidden md:table-cell text-[10px] sm:text-xs">{b.phone}</td>
                            <td className="p-2 sm:p-3 hidden lg:table-cell text-[10px] sm:text-xs">{b.email}</td>
                            <td className="p-2 sm:p-3">
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setBookingDetailId(b.id)} title={t("admin.viewDetails")} className="p-1 h-auto">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {(b.status === "pending" || b.status === "request") && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    disabled={acceptingId !== null}
                                    onClick={() => handleAccept(b.id)}
                                    className="p-1 sm:px-3 sm:py-2 h-auto"
                                    title={t("admin.accept")}
                                  >
                                    {acceptingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 sm:mr-1" />}
                                    <span className="hidden sm:inline">{t("admin.accept")}</span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardContent className="p-2 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-base sm:text-lg font-semibold capitalize">
                    {calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm table-fixed min-w-[600px]">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((wd) => (
                          <th key={wd} className="p-1 sm:p-2 text-center font-medium text-muted-foreground text-xs sm:text-sm">
                            {wd}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 6 }, (_, row) => (
                        <tr key={row} className="border-b last:border-b-0">
                          {calendarGrid.slice(row * 7, row * 7 + 7).map(({ date, dateStr, isCurrentMonth }) => {
                            const dayBookings = byDate[dateStr] ?? [];
                            return (
                              <td
                                key={dateStr}
                                className="align-top p-0.5 sm:p-1 min-h-[100px] sm:min-h-[80px] border-r last:border-r-0 bg-background"
                              >
                                <div
                                  className={`text-center text-xs sm:text-sm font-medium p-1 rounded ${
                                    isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                                  }`}
                                >
                                  {date.getDate()}
                                </div>
                                <div className="space-y-0.5 px-0.5 sm:px-1 pb-1">
                                  {dayBookings.map((b) => (
                                    <button
                                      key={b.id}
                                      type="button"
                                      onClick={() => setBookingDetailId(b.id)}
                                      className={`w-full text-left rounded px-1 sm:px-1.5 py-1 hover:bg-muted text-[10px] sm:text-xs block border-l-2 hover:border-primary leading-tight ${
                                        b.status === "confirmed"
                                          ? "border-l-green-600 bg-green-950/20"
                                          : b.status === "request" || b.status === "pending"
                                            ? "border-l-amber-600 bg-amber-950/20"
                                            : b.status === "cancelled"
                                              ? "border-l-red-600 bg-red-950/20"
                                              : "border-l-transparent"
                                      }`}
                                      title={`${b.time} ${b.name} (${b.partySize}) - ${b.status}`}
                                    >
                                      <div className="flex items-center justify-between gap-0.5">
                                        <span className="font-semibold">{b.time}</span>
                                        {(b.status === "request" || b.status === "pending") && (
                                          <span className="text-amber-400">⚠</span>
                                        )}
                                        {b.partySize >= 8 && (
                                          <span className="text-blue-400">👥</span>
                                        )}
                                      </div>
                                      <div className="truncate">{b.name}</div>
                                      {b.partySize >= 8 && (
                                        <div className="text-[9px] sm:text-[10px] text-muted-foreground">{b.partySize} pers</div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("admin.calendarHint")}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="special" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  {t("admin.specialIntro")}
                </p>
                {specialRequestsBookings.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">{t("admin.emptySpecial")}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3">{t("admin.date")}</th>
                          <th className="text-left p-3">{t("admin.time")}</th>
                          <th className="text-left p-3">{t("admin.name")}</th>
                          <th className="text-left p-3">{t("admin.guests")}</th>
                          <th className="text-left p-3">{t("admin.status")}</th>
                          <th className="text-left p-3">{t("admin.specialRequests")}</th>
                          <th className="text-left p-3 w-24">{t("admin.action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specialRequestsBookings.map((b) => (
                          <tr key={b.id} className="border-b">
                            <td className="p-3">{b.date}</td>
                            <td className="p-3">{b.time}</td>
                            <td className="p-3">{b.name}</td>
                            <td className="p-3">{b.partySize}</td>
                            <td className="p-3">
                              <span className={b.status === "confirmed" ? "text-green-600" : b.status === "request" ? "text-amber-600" : "text-muted-foreground"}>
                                {b.status === "request" ? t("admin.statusRequest") : b.status === "pending" ? t("admin.statusPending") : b.status === "cancelled" ? t("admin.statusCancelled") : t("admin.statusConfirmed")}
                              </span>
                            </td>
                            <td className="p-3 max-w-[200px] truncate" title={b.specialRequests ?? ""}>
                              {b.specialRequests?.trim() || "—"}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setBookingDetailId(b.id)} title={t("admin.viewDetails")}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {(b.status === "pending" || b.status === "request") && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    disabled={acceptingId !== null}
                                    onClick={() => handleAccept(b.id)}
                                  >
                                    {acceptingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                    {t("admin.accept")}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="clients" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    {clients.length === 0
                      ? t("admin.emptyClients")
                      : `${filteredAndSortedClients.length} / ${clients.length} ${t("admin.clients").toLowerCase()}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground mr-1 self-center">{t("admin.importFromResendOrCsv")}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSyncFromResend}
                      disabled={syncingFromResend}
                      title={t("admin.syncFromResend")}
                    >
                      {syncingFromResend ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {syncingFromResend ? t("admin.syncingFromResend") : t("admin.syncFromResend")}
                    </Button>
                    <label>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleImportCsvClients}
                        disabled={importingClients}
                      />
                      <Button type="button" variant="outline" size="sm" asChild disabled={importingClients}>
                        <span>
                          {importingClients ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          {importingClients ? t("admin.importingClients") : t("admin.importCsvClients")}
                        </span>
                      </Button>
                    </label>
                    <span className="text-xs text-muted-foreground self-center">|</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => setAddClientOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("admin.addClient")}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setAddFromListOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("admin.addFromList")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSyncReservationsToClients}
                      disabled={syncingReservationsToClients}
                    >
                      {syncingReservationsToClients ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                      {syncingReservationsToClients ? t("admin.syncingReservationsToClients") : t("admin.syncReservationsToClients")}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleExportCsv} disabled={clients.length === 0}>
                      <Download className="w-4 h-4 mr-2" />
                      {t("admin.exportCsv")}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <Input
                    type="search"
                    placeholder={t("admin.searchClients")}
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <Select value={clientSort} onValueChange={(v) => setClientSort(v as "name" | "email" | "date")}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t("admin.sortBy")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">{t("admin.sortByDate")}</SelectItem>
                      <SelectItem value="name">{t("admin.sortByName")}</SelectItem>
                      <SelectItem value="email">{t("admin.sortByAlphabet")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {clientsMessage && <p className="text-sm text-green-600 mb-4">{clientsMessage}</p>}
                {clientsError && <p className="text-sm text-destructive mb-4">{clientsError}</p>}
                {clients.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">{t("admin.emptyClients")}</div>
                ) : filteredAndSortedClients.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    {clientSearch.trim() ? "No clients match your search." : t("admin.emptyClients")}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 w-14">{t("admin.rank")}</th>
                          <th className="text-left p-3">{t("admin.name")}</th>
                          <th className="text-left p-3">{t("admin.email")}</th>
                          <th className="text-left p-3">{t("admin.phone")}</th>
                          <th className="text-left p-3">{t("admin.lastBooked")}</th>
                          <th className="text-left p-3">{t("admin.source")}</th>
                          <th className="text-left p-3 w-20">{t("admin.action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedClients.map((c, index) => (
                          <tr key={c.id} className="border-b">
                            <td className="p-3 text-muted-foreground tabular-nums">{index + 1}</td>
                            <td className="p-3">{c.name}</td>
                            <td className="p-3">{c.email}</td>
                            <td className="p-3">{c.phone ?? "—"}</td>
                            <td className="p-3 text-muted-foreground">
                              {c.lastBookingDate
                                ? new Date(c.lastBookingDate + "T12:00:00").toLocaleDateString(undefined, {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td className="p-3 text-muted-foreground">{c.source}</td>
                            <td className="p-3">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                disabled={deletingClientId !== null}
                                onClick={() => setDeleteClientId(c.id)}
                              >
                                {deletingClientId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                <span className="sr-only">{t("admin.deleteClient")}</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
            <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("admin.addClient")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div>
                    <Label htmlFor="add-client-name">{t("admin.name")}</Label>
                    <Input
                      id="add-client-name"
                      value={addClientName}
                      onChange={(e) => setAddClientName(e.target.value)}
                      placeholder={t("admin.name")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-client-email">{t("admin.email")} *</Label>
                    <Input
                      id="add-client-email"
                      type="email"
                      value={addClientEmail}
                      onChange={(e) => setAddClientEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-client-phone">{t("admin.phone")}</Label>
                    <Input
                      id="add-client-phone"
                      value={addClientPhone}
                      onChange={(e) => setAddClientPhone(e.target.value)}
                      placeholder={t("admin.phone")}
                      className="mt-1"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddClientOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={savingClient}>
                      {savingClient ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {savingClient ? "..." : t("admin.addClient")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={addFromListOpen} onOpenChange={setAddFromListOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("admin.addFromList")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddFromList} className="space-y-4">
                  <div>
                    <Label htmlFor="add-from-list-text">{t("admin.addFromListPlaceholder")}</Label>
                    <Textarea
                      id="add-from-list-text"
                      value={addFromListText}
                      onChange={(e) => setAddFromListText(e.target.value)}
                      placeholder="John Doe, john@example.com, +41 22 123 45 67"
                      rows={8}
                      className="mt-2 font-mono text-sm"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddFromListOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addFromListSaving || !addFromListText.trim()}>
                      {addFromListSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {addFromListSaving ? "..." : t("admin.addFromListSubmit")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <AlertDialog open={deleteClientId !== null} onOpenChange={(open) => !open && setDeleteClientId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("admin.deleteClient")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("admin.confirmDeleteClient")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteClientId && handleDeleteClient(deleteClientId)}
                  >
                    {t("admin.deleteClient")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
        </Tabs>

        {/* Booking Detail Dialog - accessible from all tabs */}
        <Dialog open={!!bookingDetailId} onOpenChange={(open) => !open && setBookingDetailId(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("admin.reservationDetails")}</DialogTitle>
            </DialogHeader>
            {bookingDetailLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : bookingDetail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">{t("admin.date")}</span>
                  <span>{bookingDetail.booking.date}</span>
                  <span className="text-muted-foreground">{t("admin.time")}</span>
                  <span>{bookingDetail.booking.time}</span>
                  <span className="text-muted-foreground">{t("admin.name")}</span>
                  <span>{bookingDetail.booking.name}</span>
                  <span className="text-muted-foreground">{t("admin.email")}</span>
                  <span>{bookingDetail.booking.email}</span>
                  <span className="text-muted-foreground">{t("admin.phone")}</span>
                  <span>{bookingDetail.booking.phone}</span>
                  <span className="text-muted-foreground">{t("admin.guests")}</span>
                  <span>{bookingDetail.booking.partySize}</span>
                  <span className="text-muted-foreground">{t("admin.status")}</span>
                  <span className={`font-semibold ${
                    bookingDetail.booking.status === "confirmed" 
                      ? "text-green-600" 
                      : bookingDetail.booking.status === "request" || bookingDetail.booking.status === "pending"
                        ? "text-amber-600"
                        : bookingDetail.booking.status === "cancelled"
                          ? "text-red-600"
                          : ""
                  }`}>
                    {bookingDetail.booking.status === "request"
                      ? t("admin.statusRequest")
                      : bookingDetail.booking.status === "confirmed"
                        ? t("admin.statusConfirmed")
                        : bookingDetail.booking.status === "cancelled"
                          ? t("admin.statusCancelled")
                          : t("admin.statusPending")}
                  </span>
                </div>
                {bookingDetail.booking.specialRequests && (
                  <>
                    <span className="text-sm text-muted-foreground">{t("admin.specialRequests")}</span>
                    <p className="text-sm">{bookingDetail.booking.specialRequests}</p>
                  </>
                )}
                <div>
                  <h4 className="text-sm font-medium mb-2">{t("admin.emailsSent")}</h4>
                  {bookingDetail.emailStatuses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("admin.noEmailsSent")}</p>
                  ) : (
                    <table className="w-full text-sm border rounded">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2">{t("admin.emailType")}</th>
                          <th className="text-left p-2">{t("admin.date")}</th>
                          <th className="text-left p-2">{t("admin.emailStatus")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingDetail.emailStatuses.map((e) => (
                          <tr key={e.id} className="border-b">
                            <td className="p-2">{e.type}</td>
                            <td className="p-2">{e.sentAt ? new Date(e.sentAt).toLocaleString() : "—"}</td>
                            <td className="p-2">{e.status ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {(bookingDetail.booking.status === "request" || bookingDetail.booking.status === "pending") && (
                  <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button
                      variant="default"
                      onClick={() => {
                        handleAccept(bookingDetail.booking.id);
                        setBookingDetailId(null);
                      }}
                      disabled={acceptingId !== null}
                      className="flex-1 sm:flex-initial"
                    >
                      {acceptingId === bookingDetail.booking.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      {t("admin.accept")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDecline(bookingDetail.booking.id);
                        setBookingDetailId(null);
                      }}
                      disabled={acceptingId !== null}
                      className="flex-1 sm:flex-initial"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t("admin.decline")}
                    </Button>
                  </DialogFooter>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("admin.loading")}</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
