import { useState, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Utensils, Wine } from "lucide-react";
import Reviews from "@/components/Reviews";
import { useLanguage } from "@/contexts/LanguageContext";

const HERO_POSTER = "/spinella_interior.jpg";

export default function Home() {
  const { t } = useLanguage();
  const [videoReady, setVideoReady] = useState(false);

  const onCanPlay = useCallback(() => setVideoReady(true), []);

  return (
    <div className="min-h-screen pt-20 md:pt-20">
      {/* Hero: poster is always LCP (mobile + desktop); video fades in when ready for autoplay */}
      <section
        className="relative flex items-center justify-center overflow-hidden min-h-[100dvh] min-h-[calc(100vh-5rem)] aspect-[16/10] md:aspect-auto"
        style={{ minHeight: "min(100dvh, calc(100vh - 5rem))" }}
      >
        {/* Poster: visible until video can play (keeps LCP = image, then video autoplays) */}
        <div
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-500 ${videoReady ? "opacity-0 pointer-events-none" : ""}`}
          style={{ backgroundImage: `url(${HERO_POSTER})` }}
          aria-hidden
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={HERO_POSTER}
          onCanPlay={onCanPlay}
          className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover transition-opacity duration-500"
          style={{ opacity: videoReady ? 1 : 0 }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay absolute inset-0" />
        
        <div className="relative z-10 container text-center text-foreground">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 min-h-[3.5rem] md:min-h-[4.5rem] lg:min-h-[5rem]">
              {t("home.welcome")} <span className="brand-font gold-text">Spinella</span>
            </h1>
            <p className="text-lg md:text-xl mb-4 font-light max-w-2xl mx-auto">
              {t("home.heroParagraph1")}
            </p>
            <p className="text-base md:text-lg mb-4 font-light max-w-2xl mx-auto">
              {t("home.heroParagraph2")}
            </p>
            <p className="text-xl md:text-2xl gold-text font-medium mb-8">
              {t("home.welcomeHome")}
            </p>
            <div className="gold-divider"></div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/reservations">
                <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold text-lg px-8">
                  {t("home.bookYourTable")}
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-2 border-[oklch(0.62_0.15_85)] text-foreground hover:bg-[oklch(0.62_0.15_85)] hover:text-black font-semibold text-lg px-8">
                  {t("home.meetBrothers")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-12 md:py-16 bg-background text-foreground">
        <div className="container max-w-3xl text-center">
          <p className="text-2xl md:text-3xl font-serif gold-text mb-4 italic">
            « {t("home.philosophyQuote")} »
          </p>
          <p className="text-base md:text-lg text-muted-foreground">
            {t("home.philosophySubline")}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("home.experienceTitle")}</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/reservations">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full hover:ring-2 hover:ring-[oklch(0.62_0.15_85)] hover:ring-offset-2 hover:ring-offset-background">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t("home.easyBooking")}</h3>
                  <p className="text-muted-foreground">
                    {t("home.easyBookingDesc")}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/menu">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full hover:ring-2 hover:ring-[oklch(0.62_0.15_85)] hover:ring-offset-2 hover:ring-offset-background">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t("home.authenticCuisine")}</h3>
                  <p className="text-muted-foreground">
                    {t("home.authenticCuisineDesc")}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wine className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("home.cocktailBar")}</h3>
                <p className="text-muted-foreground">
                  {t("home.cocktailBarDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("home.privateEvents")}</h3>
                <p className="text-muted-foreground">
                  {t("home.privateEventsDesc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="section-spacing bg-background text-foreground">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("home.threeBrothersTitle")}</h2>
              <div className="gold-divider mx-0"></div>
              <p className="text-lg mb-6 leading-relaxed">
                {t("home.threeBrothersDesc1")}
              </p>
              <p className="text-lg mb-8 leading-relaxed">
                {t("home.threeBrothersDesc2")}
              </p>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-2 border-[oklch(0.62_0.15_85)] text-foreground hover:bg-[oklch(0.62_0.15_85)] hover:text-black font-semibold">
                  {t("home.ourStory")}
                </Button>
              </Link>
            </div>
            <div className="relative min-h-[240px] sm:min-h-[280px] lg:min-h-[380px] w-full overflow-hidden rounded-lg aspect-[4/3]">
              <img
                src="/interior_brothers.jpg"
                alt="The three Spinella brothers"
                width={800}
                height={600}
                className="w-full h-full object-cover object-center rounded-lg shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <Reviews />

      {/* Location Preview */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative min-h-[240px] sm:min-h-[280px] lg:min-h-[380px] w-full overflow-hidden rounded-lg aspect-[4/3]">
              <img
                src="/spinella_exterior.jpg"
                alt="Spinella exterior"
                width={800}
                height={600}
                className="w-full h-full object-cover object-center rounded-lg shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("home.visitTitle")}</h2>
              <div className="gold-divider mx-0"></div>
              <p className="text-lg mb-6 leading-relaxed">
                {t("home.visitDesc1")}
              </p>
              <p className="text-lg mb-8 leading-relaxed">
                {t("home.visitDesc2")}
              </p>
              <Link href="/contact">
                <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
                  {t("home.getDirections")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
