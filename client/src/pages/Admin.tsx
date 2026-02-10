import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Check, List, LogOut, Loader2, Upload } from "lucide-react";

const ADMIN_TOKEN_KEY = "spinella_admin_token";

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

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (t) setToken(t);
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
    localStorage.removeItem(ADMIN_TOKEN_KEY);
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
        setFetchError("Failed to load reservations");
      }
    } catch {
      setFetchError("Failed to load reservations");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setToken(data.token);
        setUsername("");
        setPassword("");
      } else {
        setLoginError("Invalid username or password");
      }
    } catch {
      setLoginError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
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

  if (verified === null) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!token || !verified) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <h1 className="text-2xl font-bold">Admin</h1>
            <p className="text-sm text-muted-foreground">Reservations</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  placeholder="Username"
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </div>
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Checking..." : "Log in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Reservations</h1>
          <div className="flex items-center gap-2">
            <label>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importing} />
              <Button type="button" variant="outline" asChild disabled={importing}>
                <span>
                  {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Import JSON
                </span>
              </Button>
            </label>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>

        {fetchError && <p className="text-sm text-destructive mb-4">{fetchError}</p>}
        <p className="text-sm text-muted-foreground mb-6">
          Reservations are stored in Supabase. Accept pending or request-only bookings to confirm them. Import from the old site: export as JSON (name, email, phone, date YYYY-MM-DD, time, partySize) and upload here.
        </p>

        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardContent className="p-0">
                {sortedBookings.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No reservations. They will appear here when saved to Supabase (new bookings or import).</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Time</th>
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Guests</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Phone</th>
                          <th className="text-left p-3">Email</th>
                          <th className="text-left p-3 w-24">Action</th>
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
                                {b.status === "request" ? "Request" : b.status === "pending" ? "Pending" : b.status === "cancelled" ? "Cancelled" : "Confirmed"}
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
                                  Accept
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
                  <div className="text-center text-muted-foreground py-8">No reservations. Import a JSON file.</div>
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
                                <span className="text-muted-foreground">({b.partySize} guests)</span>
                                <span className={b.status === "confirmed" ? "text-green-600" : b.status === "request" ? "text-amber-600" : "text-muted-foreground"}>
                                  {b.status === "request" ? "Request" : b.status === "pending" ? "Pending" : "Confirmed"}
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
        </Tabs>
      </div>
    </div>
  );
}
