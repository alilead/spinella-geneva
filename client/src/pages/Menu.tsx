import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Menu() {
  const { language, t } = useLanguage();
  const menuSections = [
    {
      title: "Antipasti",
      description: "Starters and Homemade Delicacies",
      items: [
        {
          name: "Involtini di Bresaola della Valtellina IGP",
          description: "Bresaola rolls with Parmigiano mousse and Sicilian pistachios",
          price: "32 .-",
        },
        {
          name: "Burrata Pugliese",
          description: "Fresh burrata with cherry tomatoes, basil, and extra virgin olive oil",
          price: "28 .-",
        },
        {
          name: "Carpaccio di Manzo",
          description: "Beef carpaccio with arugula, Parmigiano shavings, and truffle oil",
          price: "30 .-",
        },
        {
          name: "Tagliere Siciliano",
          description: "Selection of Sicilian cured meats and cheeses",
          price: "35 .-",
        },
      ],
    },
    {
      title: "Primi Piatti",
      description: "Pasta & Risotto",
      items: [
        {
          name: "Risotto alla Milanese",
          description: "Sicilian saffron risotto with Parmigiano cheese",
          price: "32 .-",
        },
        {
          name: "Pasta alla Norma",
          description: "Traditional Sicilian pasta with eggplant, tomato, and ricotta salata",
          price: "28 .-",
        },
        {
          name: "Spaghetti alle Vongole",
          description: "Spaghetti with fresh clams, white wine, garlic, and parsley",
          price: "34 .-",
        },
        {
          name: "Tagliatelle al Tartufo",
          description: "Fresh tagliatelle with black truffle and cream",
          price: "38 .-",
        },
      ],
    },
    {
      title: "Secondi Piatti",
      description: "Main Courses",
      items: [
        {
          name: "Ossobuco alla Milanese",
          description: "Braised veal shank with saffron risotto",
          price: "45 .-",
        },
        {
          name: "Branzino al Forno",
          description: "Oven-baked sea bass with herbs and lemon",
          price: "42 .-",
        },
        {
          name: "Tagliata di Manzo",
          description: "Sliced beef tenderloin with arugula and Parmigiano",
          price: "48 .-",
        },
        {
          name: "Pollo alla Siciliana",
          description: "Sicilian-style chicken with olives, capers, and tomatoes",
          price: "36 .-",
        },
      ],
    },
    {
      title: "Dolci",
      description: "Homemade Desserts",
      items: [
        {
          name: "Tiramisù Classico",
          description: "Traditional Sicilian coffee-flavored dessert",
          price: "14 .-",
        },
        {
          name: "Cannoli Siciliani",
          description: "Sicilian pastry filled with sweet ricotta and pistachios",
          price: "12 .-",
        },
        {
          name: "Panna Cotta",
          description: "Vanilla panna cotta with berry coulis",
          price: "12 .-",
        },
        {
          name: "Cassata Siciliana",
          description: "Traditional Sicilian cake with ricotta and candied fruits",
          price: "14 .-",
        },
      ],
    },
  ];

  const drinks = [
    {
      title: "Cocktails",
      items: [
        { name: "Negroni", price: "18 .-" },
        { name: "Aperol Spritz", price: "16 .-" },
        { name: "Mojito", price: "17 .-" },
        { name: "Signature Spinella", price: "20 .-" },
      ],
    },
    {
      title: "Wines",
      items: [
        { name: "Prosecco DOC (glass)", price: "12 .-" },
        { name: "Chianti Classico (glass)", price: "14 .-" },
        { name: "Pinot Grigio (glass)", price: "13 .-" },
        { name: "House Wine Selection", price: "Ask server" },
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/spinella_interior.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        
        <div className="relative z-10 container text-center text-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t("menu.title")}</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">{t("menu.subtitle")}</p>
          <div className="mt-8">
            <a
              href={language === 'fr' ? '/menu_fr.pdf' : '/menu_en.pdf'}
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

      {/* Menu Content */}
      <section className="section-spacing cream-bg">
        <div className="container max-w-6xl">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("menu.introStory")}
            </p>
          </div>
          <div className="space-y-16">
            {menuSections.map((section, idx) => (
              <div key={idx}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-2">{section.title}</h2>
                  <p className="text-lg gold-text font-medium">{section.description}</p>
                  <div className="gold-divider"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-card-foreground"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold flex-1">{item.name}</h3>
                        <span className="text-xl font-bold gold-text ml-4">{item.price}</span>
                      </div>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drinks Section */}
      <section className="section-spacing bg-background text-foreground">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("menu.drinks")}</h2>
            <div className="gold-divider"></div>
            <p className="text-lg">{t("menu.drinks")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {drinks.map((category, idx) => (
              <div key={idx}>
                <h3 className="text-3xl font-bold mb-6 gold-text">{category.title}</h3>
                <div className="space-y-4">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex justify-between items-center pb-3 border-b border-gray-200"
                    >
                      <span className="text-lg">{item.name}</span>
                      <span className="text-lg font-semibold gold-text">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg mb-2">
              <span className="gold-text font-semibold">Note:</span> Menu items and prices are subject to change based on seasonal availability.
            </p>
            <p className="text-sm text-muted-foreground">
              Please inform our staff of any dietary restrictions or allergies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
