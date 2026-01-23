import { Heart, Users, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/food_platter.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        
        <div className="relative z-10 container text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Story</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">From Sicily with Love</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-spacing cream-bg">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Three Brothers</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed mb-6">
              Spinella is more than just a restaurant—it's a story of love, adventure, and family. 
              Three brothers from the heart of Sicily embarked on a journey to share their passion 
              for authentic Italian cuisine with the world. United by their heritage and driven by 
              their love for food, they created Spinella as a tribute to their homeland.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Growing up in Sicily, the brothers learned the art of Italian cooking from their 
              grandmother, who taught them that food is not just sustenance—it's a way to bring 
              people together, to celebrate life, and to create lasting memories. Every recipe at 
              Spinella carries the essence of those cherished family moments.
            </p>

            <p className="text-lg leading-relaxed mb-8">
              In Geneva, just steps from Cornavin central station and the beautiful lakefront, 
              they've created a casual-chic space where traditional Sicilian cuisine meets modern 
              sophistication. Here, the warmth of Italian hospitality blends seamlessly with 
              contemporary style, offering guests an authentic taste of Sicily in the heart of 
              Switzerland.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-spacing dark-bg text-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Values</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gold-text">Passion</h3>
              <p className="text-lg">
                Every dish is prepared with love and dedication, honoring the traditions passed 
                down through generations of Sicilian cooking.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gold-text">Family</h3>
              <p className="text-lg">
                We treat every guest as part of our extended family, creating a warm and welcoming 
                atmosphere where everyone feels at home.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gold-text">Quality</h3>
              <p className="text-lg">
                We source only the finest ingredients, from imported Italian products to fresh 
                local produce, ensuring excellence in every bite.
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">The Spinella Experience</h2>
              <div className="gold-divider mx-0"></div>
              <p className="text-lg mb-6 leading-relaxed">
                At Spinella, we believe that dining is about more than just food—it's about creating 
                an experience that engages all the senses. From the moment you step through our doors, 
                you're transported to a world where authentic Italian flavors meet contemporary elegance.
              </p>
              <p className="text-lg mb-6 leading-relaxed">
                Our menu features traditional Sicilian dishes alongside modern Italian classics, 
                complemented by handcrafted cocktails and a carefully curated wine selection. Whether 
                you're joining us for a romantic dinner, business lunch, or evening aperitivo with 
                friends, we promise an unforgettable culinary journey.
              </p>
              <p className="text-lg leading-relaxed">
                The atmosphere is vibrant yet intimate, where you can feel the energy of the Isle of 
                the Sun and listen to its pulsating rhythm. This is the ideal recipe to savor emotions 
                and moments of happiness—the Spinella way.
              </p>
            </div>
            <div className="relative h-96 lg:h-full">
              <img
                src="/interior_ambiance.jpg"
                alt="Spinella interior"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
