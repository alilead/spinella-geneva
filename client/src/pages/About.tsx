import { Heart, Users, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[280px] sm:min-h-[320px] md:h-80 lg:h-96 flex items-center justify-center">
        <div
          className="hero-bg absolute inset-0"
          style={{ backgroundImage: "url(/food_1.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0" />
        </div>
        
        <div className="relative z-10 container text-center text-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t("about.title")}</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">{t("about.subtitle")}</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-spacing cream-bg">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("home.threeBrothersTitle")}</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-lg leading-relaxed mb-6">
              {t("about.story1")}
            </p>

            <p className="text-lg leading-relaxed mb-6">
              {t("about.story2")}
            </p>

            <p className="text-lg leading-relaxed mb-6">
              {t("about.story3")}
            </p>

            <p className="text-xl font-semibold gold-text text-center">
              {t("about.storyOpening")}
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy & Brothers */}
      <section className="section-spacing bg-background text-foreground">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("about.ourMission")}</h2>
            <div className="gold-divider"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
              {t("about.missionDesc")}
            </p>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 gold-text">
            {t("home.meetBrothers")}
          </h3>

          <div className="space-y-16">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold gold-text mb-2">{t("about.salvatore")} — {t("about.salvatoreTitle")}</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("about.salvatoreDesc")}
              </p>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold gold-text mb-2">{t("about.marco")} — {t("about.marcoTitle")}</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("about.marcoDesc")}
              </p>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold gold-text mb-2">{t("about.gabriele")} — {t("about.gabrieleTitle")}</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("about.gabrieleDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Pillars */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("about.ourValues")}</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gold-text">{t("about.passion")}</h3>
              <p className="text-lg text-muted-foreground">
                {t("about.passionDesc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gold-text">{t("about.respect")}</h3>
              <p className="text-lg text-muted-foreground">
                {t("about.respectDesc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gold-text">{t("about.authenticity")}</h3>
              <p className="text-lg text-muted-foreground">
                {t("about.authenticityDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("about.experienceTitle")}</h2>
              <div className="gold-divider mx-0"></div>
              <p className="text-lg mb-6 leading-relaxed">
                {t("about.experienceDesc1")}
              </p>
              <p className="text-lg mb-6 leading-relaxed">
                {t("about.experienceDesc2")}
              </p>
              <p className="text-lg leading-relaxed">
                {t("about.experienceDesc3")}
              </p>
            </div>
            <div className="relative min-h-[240px] sm:min-h-[280px] lg:min-h-[380px] w-full overflow-hidden rounded-lg">
              <img
                src="/interior_main.jpg"
                alt="Spinella interior ambiance"
                className="w-full h-full object-cover object-center rounded-lg shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
