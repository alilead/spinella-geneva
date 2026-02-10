import { getDailyToken, verifyAdminToken, getAuthTokenFromRequest } from "../lib/auth";

const ADMIN_USERNAME = "spinella";
const DEFAULT_ADMIN_PASSWORD = "spinella*10";

type Req = {
  method?: string;
  body?: string | { username?: string; password?: string };
  headers?: { authorization?: string };
};
type Res = { status: (code: number) => { json: (body: object) => void } };

export default async function handler(req: Req, res: Res) {
  if (req.method === "POST") {
    let body: { username?: string; password?: string } = {};
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    } catch {
      /* ignore */
    }
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const expectedPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
    if (username === ADMIN_USERNAME && password === expectedPassword) {
      res.status(200).json({ token: getDailyToken() });
      return;
    }
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  if (req.method === "GET") {
    const token = getAuthTokenFromRequest(req);
    if (verifyAdminToken(token)) {
      res.status(200).json({ ok: true });
      return;
    }
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
