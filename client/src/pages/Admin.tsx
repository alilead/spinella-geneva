import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Check, List, LogOut, Loader2, Upload, UserCheck } from "lucide-react";
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

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) setToken(session.access_token);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
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

  const fetchBookings = useCallback(async (authToken: string) => {
    setFetchError("");
    try {
      const res = await fetch("/api/bookings", { headers: getAuthHeaders(authToken) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setFetchError(t("admin.fetchError"));
      }
    } catch {
      setFetchError(t("admin.fetchError"));
    }
  }, [t]);

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
    if (!token || !verified) return;
    const interval = setInterval(() => fetchBookings(token), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, verified, fetchBookings]);

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

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      return d !== 0 ? d : a.time.localeCompare(b.time);
    });
  }, [bookings]);

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
    <div className="min-h-screen pt-20 pb-12">
      <div className="container max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">{t("admin.reservations")}</h1>
          <div className="flex items-center gap-2">
            <label>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importing} />
              <Button type="button" variant="outline" asChild disabled={importing}>
                <span>
                  {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {t("admin.importJson")}
                </span>
              </Button>
            </label>
            <Button variant="outline" onClick={handleSendValentines} disabled={valentinesSending}>
              {valentinesSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {valentinesSending ? t("admin.valentinesSending") : t("admin.valentinesSend")}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t("admin.logOut")}
            </Button>
          </div>
        </div>

        {valentinesMessage && <p className="text-sm mb-4 text-muted-foreground">{valentinesMessage}</p>}
        {fetchError && <p className="text-sm text-destructive mb-4">{fetchError}</p>}
        <p className="text-sm text-muted-foreground mb-6">
          {t("admin.instructions")}
        </p>

        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" />
              {t("admin.list")}
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {t("admin.calendar")}
            </TabsTrigger>
            <TabsTrigger value="special">
              <UserCheck className="w-4 h-4 mr-2" />
              {t("admin.specialRequests")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardContent className="p-0">
                {sortedBookings.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">{t("admin.emptyList")}</div>
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
                          <th className="text-left p-3">{t("admin.phone")}</th>
                          <th className="text-left p-3">{t("admin.email")}</th>
                          <th className="text-left p-3 w-24">{t("admin.action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedBookings.map((b) => (
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
                            <td className="p-3">{b.phone}</td>
                            <td className="p-3">{b.email}</td>
                            <td className="p-3">
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
              <CardContent className="p-6">
                {Object.keys(byDate).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">{t("admin.emptyCalendar")}</div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(byDate)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([date, list]) => (
                        <div key={date}>
                          <h3 className="font-semibold text-lg mb-2">{date}</h3>
                          <ul className="space-y-1">
                            {list.map((b) => (
                              <li key={b.id} className="flex flex-wrap gap-2 text-sm items-center">
                                <span className="font-medium">{b.time}</span>
                                <span>{b.name}</span>
                                <span className="text-muted-foreground">({b.partySize} {t("admin.guests").toLowerCase()})</span>
                                <span className={b.status === "confirmed" ? "text-green-600" : b.status === "request" ? "text-amber-600" : b.status === "cancelled" ? "text-red-600" : "text-muted-foreground"}>
                                  {b.status === "request" ? t("admin.statusRequest") : b.status === "pending" ? t("admin.statusPending") : b.status === "cancelled" ? t("admin.statusCancelled") : t("admin.statusConfirmed")}
                                </span>
                                {(b.status === "pending" || b.status === "request") && (
                                  <Button size="sm" variant="outline" disabled={acceptingId !== null} onClick={() => handleAccept(b.id)}>
                                    {acceptingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                  </Button>
                                )}
                                {b.phone && <span className="text-muted-foreground">{b.phone}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                )}
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
        </Tabs>
      </div>
    </div>
  );
}
