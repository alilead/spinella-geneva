import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Wine, Sparkles } from "lucide-react";
import Reviews from "@/components/Reviews";

export default function Home() {
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
        
        <div className="relative z-10 container text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Welcome to <span className="gold-text">Spinella</span>
            </h1>
            <div className="gold-divider"></div>
            <p className="text-xl md:text-2xl mb-8 font-light">
              A Sicilian Story of Love, Passion & Authentic Italian Cuisine
            </p>
            <p className="text-lg mb-12 max-w-2xl mx-auto">
              Three brothers bringing the soul of Sicily to Geneva. Experience traditional Italian dishes,
              handcrafted cocktails, and warm hospitality in a casual-chic setting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold text-lg px-8">
                  Book Your Table
                </Button>
              </Link>
              <Link href="/menu">
                <Button size="lg" variant="outline" className="border-2 border-[oklch(0.62_0.15_85)] text-white hover:bg-[oklch(0.62_0.15_85)] hover:text-black font-semibold text-lg px-8">
                  View Menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Experience Spinella</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">Easy Booking</h3>
                <p className="text-gray-600">
                  Reserve your table online in seconds. Choose your date, time, and party size with instant confirmation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wine className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">Authentic Cuisine</h3>
                <p className="text-gray-600">
                  Traditional Sicilian recipes prepared with fresh, high-quality ingredients and passion.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">Cocktail Bar</h3>
                <p className="text-gray-600">
                  Handcrafted cocktails, curated wine selection, and craft beers in a vibrant atmosphere.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">Private Events</h3>
                <p className="text-gray-600">
                  Host your special occasions with us. Perfect for birthdays, business dinners, and celebrations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="section-spacing dark-bg text-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">The Three Brothers</h2>
              <div className="gold-divider mx-0"></div>
              <p className="text-lg mb-6 leading-relaxed">
                Spinella is a story of love and adventure. Three brothers from Sicily united by one passion:
                to transmit the soul of their homeland to the heart of Geneva.
              </p>
              <p className="text-lg mb-8 leading-relaxed">
                In a casual-chic setting, just steps from Cornavin station and Lake Geneva, traditional
                Italian cuisine meets trendy cocktails in a perfect blend of taste and style.
              </p>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-2 border-[oklch(0.62_0.15_85)] text-white hover:bg-[oklch(0.62_0.15_85)] hover:text-black font-semibold">
                  Our Story
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
                src="/exterior_facade.jpg"
                alt="Spinella exterior"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Visit Us in Geneva</h2>
              <div className="gold-divider mx-0"></div>
              <p className="text-lg mb-6 leading-relaxed">
                Located in the vibrant Charmilles neighborhood, Spinella is easily accessible from
                Cornavin central station, Geneva city center, and the beautiful lakefront.
              </p>
              <p className="text-lg mb-8 leading-relaxed">
                Whether you're looking for a romantic dinner, business lunch, or evening cocktails
                with friends, we welcome you with authentic Sicilian hospitality.
              </p>
              <Link href="/contact">
                <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
                  Get Directions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
