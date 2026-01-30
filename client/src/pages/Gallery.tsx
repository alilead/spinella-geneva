import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Gallery() {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Gallery image array — comment out any of these 3 to remove from gallery:
  // 1) Image with Christmas tinsel
  // 2) Image of the woman in the pink jumper
  // 3) Bar image with two men (one obscured)
  const images = [
    // Interior — new Spinella photos
    { src: "/spinella_interior.jpg", alt: "Spinella interior", categoryKey: "gallery.interior" },
    { src: "/interior_main.jpg", alt: "Interior view", categoryKey: "gallery.interior" },
    { src: "/interior_brothers.jpg", alt: "The three brothers", categoryKey: "gallery.brothers" },
    { src: "/interior_1.jpg", alt: "Interior ambiance", categoryKey: "gallery.interior" },
    { src: "/interior_4.jpg", alt: "Dining space", categoryKey: "gallery.interior" },
    { src: "/interior_5.jpg", alt: "Restaurant interior", categoryKey: "gallery.interior" },
    { src: "/interior_6.jpg", alt: "Interior detail", categoryKey: "gallery.interior" },
    { src: "/interior_7.jpg", alt: "Ambiance", categoryKey: "gallery.interior" },
    { src: "/interior_9.jpg", alt: "Interior", categoryKey: "gallery.interior" },
    { src: "/interior_2.jpg", alt: "Interior", categoryKey: "gallery.interior" },
    { src: "/interior_3.jpg", alt: "Interior", categoryKey: "gallery.interior" },
    { src: "/interior_8.jpg", alt: "Interior", categoryKey: "gallery.interior" },
    { src: "/interior_10.jpg", alt: "Interior", categoryKey: "gallery.interior" },
    { src: "/interior_11.jpg", alt: "Interior", categoryKey: "gallery.interior" },
    // Exterior
    { src: "/spinella_exterior.jpg", alt: "Spinella exterior", categoryKey: "gallery.exterior" },
    { src: "/exterior_night_new.jpg", alt: "Exterior at night", categoryKey: "gallery.exterior" },
    // Chef / team
    { src: "/a_maybe.jpg", alt: "Chef with desserts", categoryKey: "gallery.chef" },
    // Food — new Spinella photos
    { src: "/food_1.jpg", alt: "Dish", categoryKey: "gallery.food" },
    { src: "/food_2.jpg", alt: "Dish", categoryKey: "gallery.food" },
    { src: "/food_3.jpg", alt: "Dish", categoryKey: "gallery.food" },
    { src: "/food_5.jpg", alt: "Dish", categoryKey: "gallery.food" },
    { src: "/food_6.jpg", alt: "Dish", categoryKey: "gallery.food" },
    { src: "/food_7.jpg", alt: "Dish", categoryKey: "gallery.food" },
    { src: "/food_8.jpg", alt: "Dish", categoryKey: "gallery.food" },
    { src: "/food_9.jpg", alt: "Food presentation", categoryKey: "gallery.food" },
    { src: "/food_10.jpg", alt: "Dish", categoryKey: "gallery.food" },
    { src: "/food_11.jpg", alt: "Dish", categoryKey: "gallery.food" },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/spinella_exterior.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        
        <div className="relative z-10 container text-center text-foreground">
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
                    e.currentTarget.style.opacity = '1';
                  }}
                  onError={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.display = "none";
                  }}
                />
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
