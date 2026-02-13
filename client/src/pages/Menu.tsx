import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const MENU_PDF = "/Menu_Spinella.pdf";

export default function Menu() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[280px] sm:min-h-[320px] md:h-80 lg:h-96 flex items-center justify-center">
        <div
          className="hero-bg absolute inset-0"
          style={{ backgroundImage: "url(/spinella_interior.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0" />
        </div>

        <div className="relative z-10 container text-center text-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t("menu.title")}</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">{t("menu.subtitle")}</p>
          <div className="mt-8">
            <a
              href={MENU_PDF}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
                <Download className="w-5 h-5 mr-2" />
                {t("menu.downloadMenu")}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Menu PDF – carte officielle */}
      <section className="section-spacing cream-bg">
        <div className="container max-w-3xl mx-auto text-center">
          <p className="text-lg leading-relaxed text-muted-foreground mb-8">
            {t("menu.introStory")}
          </p>
          <p className="text-base text-muted-foreground mb-8">
            {t("menu.fullMenuPdf")}
          </p>
          <a
            href={MENU_PDF}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
              <Download className="w-5 h-5 mr-2" />
              {t("menu.downloadMenu")}
            </Button>
          </a>
          <p className="text-xl sm:text-2xl font-medium text-foreground mt-10 leading-relaxed max-w-2xl mx-auto">
            {t("menu.doubleServiceNotice")}
          </p>
        </div>
      </section>
    </div>
  );
}
