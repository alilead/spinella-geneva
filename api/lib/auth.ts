const DEFAULT_ADMIN_PASSWORD = "spinella*10";

/**
 * Use Web Crypto API (works in Node 15+ and Vercel Edge) so login works in all runtimes.
 */
async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getDailyToken(): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const date = new Date().toISOString().slice(0, 10);
  return hmacSha256Hex(secret, date);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token) return false;
  const expected = await getDailyToken();
  return token === expected;
}

export function getAuthTokenFromRequest(req: { headers?: { authorization?: string } }): string {
  const auth = req.headers?.authorization;
  return auth?.startsWith("Bearer ") ? auth.slice(7) : "";
}
