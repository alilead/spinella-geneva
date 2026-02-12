/**
 * Returns the VAPID public key for Web Push subscriptions
 */

type Res = { status: (code: number) => { json: (body: object) => void }; setHeader?: (name: string, value: string) => void };

export default async function handler(
  req: { method?: string },
  res: Res
): Promise<void> {
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  
  if (!publicKey) {
    res.status(503).json({ error: "Push notifications not configured" });
    return;
  }

  res.status(200).json({ publicKey });
}
