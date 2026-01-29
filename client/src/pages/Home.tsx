import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Wine, Sparkles } from "lucide-react";
import Reviews from "@/components/Reviews";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/interior_ambiance.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        
        <div className="relative z-10 container text-center text-foreground">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              {t("home.welcome")} <span className="gold-text">Spinella</span>
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
              <Link href="/booking">
                <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold text-lg px-8">
                  {t("home.bookYourTable")}
                </Button>
              </Link>
              <Link href="/menu">
                <Button size="lg" variant="outline" className="border-2 border-[oklch(0.62_0.15_85)] text-foreground hover:bg-[oklch(0.62_0.15_85)] hover:text-black font-semibold text-lg px-8">
                  {t("home.viewMenu")}
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
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
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

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wine className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("home.authenticCuisine")}</h3>
                <p className="text-muted-foreground">
                  {t("home.authenticCuisineDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-black" />
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
              <Link href="/booking">
                <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
                  {t("home.bookYourTable")}
                </Button>
              </Link>
            </div>
            <div className="relative h-96 lg:h-full">
              <img
                src="/food_platter.jpg"
                alt="The Spinella brothers"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
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
            <div className="order-2 lg:order-1 relative h-96 lg:h-full">
              <img
                src="/exterior_night_new.jpg"
                alt="Spinella exterior"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
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
