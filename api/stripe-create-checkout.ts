/**
 * Create a Stripe Checkout Session for takeaway orders.
 * Requires: STRIPE_SECRET_KEY, and price IDs (e.g. STRIPE_PRICE_TIRAMISU, STRIPE_PRICE_PASTA, STRIPE_PRICE_ANTIPASTI).
 * In Stripe Dashboard create Products/Prices and set env vars.
 */
type Req = { method?: string; body?: string | object };
type Res = { status: (code: number) => { json: (body: object) => void }; setHeader?: (name: string, value: string) => void };

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.setHeader?.("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(503).json({
      error: "Stripe is not configured. Set STRIPE_SECRET_KEY and create Products/Prices in Stripe Dashboard, then set STRIPE_PRICE_* env vars.",
    });
    return;
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const o = body as { items?: { id: string; quantity: number }[]; locale?: string };
  const items = Array.isArray(o?.items) ? o.items : [];
  const locale = typeof o?.locale === "string" ? o.locale : "en";

  if (items.length === 0) {
    res.status(400).json({ error: "No items" });
    return;
  }

  // Map frontend id to Stripe Price ID from env (e.g. STRIPE_PRICE_TIRAMISU)
  const priceIdMap: Record<string, string> = {
    tiramisu: process.env.STRIPE_PRICE_TIRAMISU ?? "",
    pasta: process.env.STRIPE_PRICE_PASTA ?? "",
    antipasti: process.env.STRIPE_PRICE_ANTIPASTI ?? "",
  };

  const lineItems: { price: string; quantity: number }[] = [];
  for (const it of items) {
    const priceId = priceIdMap[it.id];
    if (priceId && it.quantity > 0) {
      lineItems.push({ price: priceId, quantity: it.quantity });
    }
  }

  if (lineItems.length === 0) {
    res.status(400).json({
      error: "No valid items. Configure STRIPE_PRICE_TIRAMISU, STRIPE_PRICE_PASTA, STRIPE_PRICE_ANTIPASTI in env.",
    });
    return;
  }

  try {
    // pnpm add stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BASE_URL ?? "https://www.spinella.ch";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      locale: locale === "fr" ? "fr" : locale === "de" ? "de" : "en",
      success_url: `${baseUrl}/takeaway?success=1`,
      cancel_url: `${baseUrl}/takeaway?cancel=1`,
    });

    res.status(200).json({ url: session.url ?? null });
  } catch (err) {
    console.error("[stripe-create-checkout]", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to create checkout session",
    });
  }
}
