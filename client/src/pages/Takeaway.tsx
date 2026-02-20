import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Link } from "wouter";

const TAKEAWAY_ITEMS = [
  { id: "tiramisu", nameEn: "Pistachio Tiramisu", nameFr: "Tiramisu à la pistache", price: 12 },
  { id: "pasta", nameEn: "Pasta of the day", nameFr: "Pâtes du jour", price: 18 },
  { id: "antipasti", nameEn: "Antipasti selection", nameFr: "Sélection antipasti", price: 22 },
];

export default function Takeaway() {
  const { t, language } = useLanguage();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = (item: (typeof TAKEAWAY_ITEMS)[0]) =>
    language === "fr" ? item.nameFr : item.nameEn;

  const add = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: string) =>
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      if (n <= 0) {
        const next = { ...c };
        delete next[id];
        return next;
      }
      return { ...c, [id]: n };
    });

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalChf = TAKEAWAY_ITEMS.reduce(
    (sum, item) => sum + (cart[item.id] ?? 0) * item.price,
    0
  );

  const handleCheckout = async () => {
    if (totalItems === 0) return;
    setError(null);
    setCheckingOut(true);
    try {
      const res = await fetch("/api/stripe-create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: Object.entries(cart).map(([id, qty]) => ({ id, quantity: qty })),
          locale: language === "fr" ? "fr" : language === "de" ? "de" : "en",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Checkout unavailable. Please contact us to order.");
    } catch {
      setError("Checkout unavailable. Please contact us to order.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="relative min-h-[200px] flex items-center justify-center bg-background">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span>{language === "fr" ? "À emporter" : language === "de" ? "Takeaway" : language === "es" ? "Para llevar" : "Take away"}</span>
          </h1>
          <div className="gold-divider mx-auto"></div>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            <span>{language === "fr"
              ? "Commandez en ligne et payez par carte. Récupérez votre commande au restaurant."
              : "Order online and pay by card. Pick up your order at the restaurant."}</span>
          </p>
        </div>
      </section>

      <section className="section-spacing cream-bg">
        <div className="container max-w-2xl">
          <div className="space-y-4">
            {TAKEAWAY_ITEMS.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{name(item)}</h3>
                    <p className="text-muted-foreground">{item.price} CHF</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove(item.id)}
                      disabled={(cart[item.id] ?? 0) === 0}
                    >
                      −
                    </Button>
                    <span className="w-8 text-center font-medium">{cart[item.id] ?? 0}</span>
                    <Button variant="outline" size="sm" onClick={() => add(item.id)}>
                      +
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalItems > 0 && (
            <div className="mt-8 p-4 rounded-lg bg-muted/50">
              <p className="text-lg font-semibold">
                Total: {totalChf} CHF (<span>{totalItems} {totalItems === 1 ? "item" : "items"}</span>)
              </p>
              <Button
                className="mt-4 w-full gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold"
                size="lg"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-2" />
                )}
                <span>{language === "fr" ? "Payer avec Stripe" : "Pay with Stripe"}</span>
              </Button>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <p className="mt-6 text-sm text-muted-foreground text-center">
            <span>{language === "fr"
              ? "Vous préférez commander par téléphone ? "
              : "Prefer to order by phone? "}</span>
            <a href="tel:+41227345898" className="gold-text font-medium hover:underline">
              +41 22 734 58 98
            </a>
          </p>
          <div className="text-center mt-4">
            <Link href="/contact">
              <Button variant="outline"><span>{language === "fr" ? "Nous contacter" : "Contact us"}</span></Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
