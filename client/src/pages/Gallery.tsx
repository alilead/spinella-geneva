import { useState } from "react";
import { X } from "lucide-react";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    { src: "/interior_ambiance.jpg", alt: "Interior ambiance with elegant lighting", category: "Interior" },
    { src: "/interior_dining_area.jpg", alt: "Dining area with chandeliers", category: "Interior" },
    { src: "/exterior_facade.jpg", alt: "Restaurant exterior with outdoor seating", category: "Exterior" },
    { src: "/exterior_entrance.jpg", alt: "Restaurant entrance at night", category: "Exterior" },
    { src: "/exterior_night.jpg", alt: "Evening exterior view", category: "Exterior" },
    { src: "/outdoor_terrace_garden.jpg", alt: "Outdoor terrace with garden seating", category: "Terrace" },
    { src: "/aquarium_bar.jpg", alt: "Bar area with aquarium feature", category: "Bar" },
    { src: "/food_platter.jpg", alt: "Food presentation", category: "Food" },
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
        
        <div className="relative z-10 container text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Gallery</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">Experience the Ambiance of Spinella</p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, idx) => (
              <div
                key={idx}
                className="group relative aspect-square overflow-hidden rounded-lg shadow-lg cursor-pointer"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.category}
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
            className="absolute top-4 right-4 text-white hover:text-[oklch(0.62_0.15_85)] transition-colors"
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
          />
        </div>
      )}

      {/* Visit CTA */}
      <section className="section-spacing dark-bg text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Visit Us Today</h2>
          <div className="gold-divider"></div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the warmth and authenticity of Spinella in person. Reserve your table and
            discover why we're one of Geneva's favorite Italian restaurants.
          </p>
          <a href="/booking">
            <button className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold text-lg px-8 py-3 rounded-md transition-colors">
              Book a Table
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
