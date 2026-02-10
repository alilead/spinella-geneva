import { getDailyToken, verifyAdminToken, getAuthTokenFromRequest } from "../lib/auth";

const ADMIN_USERNAME = "spinella";
const DEFAULT_ADMIN_PASSWORD = "spinella*10";

type Req = {
  method?: string;
  body?: string | { username?: string; password?: string };
  headers?: { authorization?: string };
};
type Res = {
  status: (code: number) => { json: (body: object) => void };
  setHeader?: (name: string, value: string) => void;
};

function sendJson(res: Res, code: number, body: object) {
  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(code).json(body);
}

export default async function handler(req: Req, res: Res) {
  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    if (req.method === "POST") {
      let body: { username?: string; password?: string } = {};
      try {
        body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {}) as object;
      } catch {
        body = {};
      }
      const username = typeof body.username === "string" ? body.username.trim() : "";
      const password = typeof body.password === "string" ? body.password : "";
      const expectedPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
      if (username === ADMIN_USERNAME && password === expectedPassword) {
        sendJson(res, 200, { token: getDailyToken() });
        return;
      }
      sendJson(res, 401, { error: "Invalid username or password" });
      return;
    }

    if (req.method === "GET") {
      const token = getAuthTokenFromRequest(req);
      if (verifyAdminToken(token)) {
        sendJson(res, 200, { ok: true });
        return;
      }
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/login]", err);
    sendJson(res, 500, { error: "Server error" });
  }
}
