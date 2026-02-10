import { verifySupabaseToken, isAllowedAdmin } from "../lib/supabaseAuth";

type Req = { method?: string; headers?: { authorization?: string } };
type Res = {
  status: (code: number) => { json: (body: object) => void };
  setHeader?: (name: string, value: string) => void;
};

function getAuthTokenFromRequest(req: Req): string {
  const auth = req.headers?.authorization;
  return auth?.startsWith("Bearer ") ? auth.slice(7) : "";
}

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
    if (req.method === "GET") {
      const token = getAuthTokenFromRequest(req);
      const user = await verifySupabaseToken(token);
      if (isAllowedAdmin(user)) {
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
