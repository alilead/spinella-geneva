import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Gallery() {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    { src: "/gallery_1.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_2.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_3.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_4.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_5.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_6.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_7.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_8.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_9.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_10.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_11.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_12.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_13.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_14.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
    { src: "/gallery_15.jpeg", alt: "Spinella", categoryKey: "gallery.interior" },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[280px] sm:min-h-[320px] md:h-80 lg:h-96 flex items-center justify-center">
        <div
          className="hero-bg absolute inset-0"
          style={{ backgroundImage: "url(/gallery_1.jpeg)" }}
        >
          <div className="hero-overlay absolute inset-0" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {images.map((image, idx) => (
              <div
                key={idx}
                className="group relative aspect-square overflow-hidden rounded-lg shadow-lg cursor-pointer bg-muted min-h-[200px] sm:min-h-0"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 sm:group-hover:scale-110 relative z-0"
                  loading="lazy"
                  decoding="async"
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = "1";
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
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-[oklch(0.62_0.15_85)] transition-colors z-10 rounded-full hover:bg-white/10"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            <X size={28} className="sm:w-8 sm:h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Selected"
            className="max-w-full max-h-[85vh] sm:max-h-[90vh] w-auto h-auto object-contain rounded"
            onClick={(e) => e.stopPropagation()}
            decoding="async"
            onError={(e) => {
              console.error(`Failed to load image in lightbox: ${selectedImage}`);
              e.currentTarget.style.display = "none";
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
