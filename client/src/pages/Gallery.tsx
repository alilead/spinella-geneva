import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Gallery() {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    { src: "/interior_ambiance.jpg", alt: "Interior ambiance with elegant lighting", categoryKey: "gallery.interior" },
    { src: "/interior_dining_area.jpg", alt: "Dining area with chandeliers", categoryKey: "gallery.interior" },
    { src: "/exterior_entrance.jpg", alt: "Restaurant entrance at night", categoryKey: "gallery.exterior" },
    { src: "/exterior_night.jpg", alt: "Evening exterior view", categoryKey: "gallery.exterior" },
    { src: "/outdoor_terrace_garden.jpg", alt: "Outdoor terrace with garden seating", categoryKey: "gallery.terrace" },
    { src: "/aquarium_bar.jpg", alt: "Bar area with aquarium feature", categoryKey: "gallery.bar" },
    { src: "/food_platter.jpg", alt: "Food presentation", categoryKey: "gallery.food" },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/exterior_night.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        
        <div className="relative z-10 container text-center text-black">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t("gallery.title")}</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">{t("gallery.subtitle")}</p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, idx) => (
              <div
                key={idx}
                className="group relative aspect-square overflow-hidden rounded-lg shadow-lg cursor-pointer bg-gray-100"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 relative z-0"
                  loading="lazy"
                  onLoad={(e) => {
                    // Ensure image is visible when loaded
                    e.currentTarget.style.opacity = '1';
                  }}
                  onError={(e) => {
                    console.error(`Failed to load image: ${image.src}`);
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.style.backgroundColor = '#f3f4f6';
                      parent.innerHTML = `<div class="flex items-center justify-center h-full text-muted-foreground">${t(image.categoryKey)}</div>`;
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                    {t(image.categoryKey)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-[oklch(0.62_0.15_85)] transition-colors z-10"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Selected"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              console.error(`Failed to load image in lightbox: ${selectedImage}`);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Visit CTA */}
      <section className="section-spacing bg-background text-foreground">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("home.visitTitle")}</h2>
          <div className="gold-divider"></div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t("home.visitDesc1")} {t("home.visitDesc2")}
          </p>
          <Link href="/booking">
            <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold text-lg px-8">
              {t("nav.bookTable")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
