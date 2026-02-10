import crypto from "node:crypto";

const DEFAULT_ADMIN_PASSWORD = "spinella*10";

export function getDailyToken(): string {
  const secret = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const date = new Date().toISOString().slice(0, 10);
  return crypto.createHmac("sha256", secret).update(date).digest("hex");
}

export function verifyAdminToken(token: string): boolean {
  return Boolean(token && token === getDailyToken());
}

export function getAuthTokenFromRequest(req: { headers?: { authorization?: string } }): string {
  const auth = req.headers?.authorization;
  return auth?.startsWith("Bearer ") ? auth.slice(7) : "";
}
