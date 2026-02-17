import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, PartyPopper, Utensils, Music, Wine } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Events() {
  const { t } = useLanguage();

  const eventTypes = [
    {
      icon: PartyPopper,
      titleKey: "events.birthdays",
      description: t("events.description"),
    },
    {
      icon: Briefcase,
      titleKey: "events.corporate",
      description: t("events.description"),
    },
    {
      icon: Users,
      titleKey: "events.reunions",
      description: t("events.description"),
    },
    {
      icon: Wine,
      titleKey: "events.cocktails",
      description: t("events.description"),
    },
  ];

  const features = [
    {
      icon: Utensils,
      titleKey: "events.customMenus",
      descriptionKey: "events.customMenusDesc",
    },
    {
      icon: Music,
      titleKey: "events.atmosphere",
      descriptionKey: "events.atmosphereDesc",
    },
    {
      icon: Users,
      titleKey: "events.fullService",
      descriptionKey: "events.fullServiceDesc",
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[280px] sm:min-h-[320px] md:h-80 lg:h-96 flex items-center justify-center">
        <div
          className="hero-bg absolute inset-0"
          style={{ backgroundImage: "url(/interior_main.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0" />
        </div>
        
        <div className="relative z-10 container text-center text-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t("events.title")}</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">{t("events.subtitle")}</p>
        </div>
      </section>

      {/* Introduction */}
      <section className="section-spacing cream-bg">
        <div className="container max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("events.hostEvent")}</h2>
          <div className="gold-divider"></div>
          <p className="text-lg leading-relaxed mb-8">
            {t("events.description")}
          </p>
        </div>
      </section>

      {/* Event Types */}
      <section className="section-spacing bg-background text-foreground">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("events.eventTypes")}</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {eventTypes.map((type, idx) => (
              <Card key={idx} className="bg-card border-none text-card-foreground hover:bg-secondary transition-colors">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <type.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 gold-text">{t(type.titleKey)}</h3>
                  <p className="text-gray-600">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("events.whatWeOffer")}</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t(feature.titleKey)}</h3>
                <p className="text-lg text-muted-foreground">{t(feature.descriptionKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capacity & Details */}
      <section className="section-spacing bg-background text-foreground">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("events.eventDetails")}</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-lg text-card-foreground">
              <h3 className="text-2xl font-bold mb-4 gold-text">{t("events.capacity")}</h3>
              <ul className="space-y-3 text-lg">
                <li>• {t("events.capacityDesc")}</li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-lg text-card-foreground">
              <h3 className="text-2xl font-bold mb-4 gold-text">{t("events.servicesIncluded")}</h3>
              <ul className="space-y-3 text-lg">
                <li>• {t("events.customMenusDesc")}</li>
                <li>• {t("events.fullServiceDesc")}</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-black/5 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 gold-text">{t("events.bookingInfo")}</h3>
            <p className="text-lg mb-4">
              {t("events.bookingInfoDesc1")}
            </p>
            <p className="text-lg">
              {t("events.bookingInfoDesc2")}
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-spacing cream-bg">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("events.readyToPlan")}</h2>
          <div className="gold-divider"></div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t("events.readyToPlanDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+41225034186">
              <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
                {t("contact.phone")}: +41 22 503 41 86
              </Button>
            </a>
            <a href="mailto:info@spinella.ch?subject=Contact%20Spinella%20-%20Website">
              <Button size="lg" variant="outline" className="border-2 border-[oklch(0.62_0.15_85)] text-foreground hover:bg-[oklch(0.62_0.15_85)] hover:text-black font-semibold">
                {t("contact.email")}: info@spinella.ch
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
