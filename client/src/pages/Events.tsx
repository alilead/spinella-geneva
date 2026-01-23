import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, PartyPopper, Utensils, Music, Wine } from "lucide-react";

export default function Events() {
  const eventTypes = [
    {
      icon: PartyPopper,
      title: "Birthday Celebrations",
      description: "Make your special day unforgettable with authentic Italian cuisine and a vibrant atmosphere.",
    },
    {
      icon: Briefcase,
      title: "Business Dinners",
      description: "Impress clients and colleagues in our sophisticated setting with exceptional service.",
    },
    {
      icon: Users,
      title: "Private Parties",
      description: "Host intimate gatherings or larger celebrations in our exclusive space.",
    },
    {
      icon: Wine,
      title: "Wine Tastings",
      description: "Explore our curated Italian wine collection with guided tasting experiences.",
    },
  ];

  const features = [
    {
      icon: Utensils,
      title: "Customized Menus",
      description: "Work with our chefs to create a personalized menu that suits your event and dietary preferences.",
    },
    {
      icon: Music,
      title: "Ambiance Control",
      description: "We'll set the perfect mood with lighting and music tailored to your occasion.",
    },
    {
      icon: Users,
      title: "Dedicated Service",
      description: "Our experienced staff ensures every detail is handled with care and professionalism.",
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/interior_dining_area.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        
        <div className="relative z-10 container text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Private Events</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">Celebrate Your Special Moments with Us</p>
        </div>
      </section>

      {/* Introduction */}
      <section className="section-spacing cream-bg">
        <div className="container max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Host Your Event at Spinella</h2>
          <div className="gold-divider"></div>
          <p className="text-lg leading-relaxed mb-8">
            Whether you're planning a birthday celebration, business dinner, or any special occasion, 
            Spinella offers the perfect setting. Our team is prepared to make your event memorable 
            with authentic Italian cuisine, exceptional service, and a warm, inviting atmosphere.
          </p>
        </div>
      </section>

      {/* Event Types */}
      <section className="section-spacing dark-bg text-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Event Types</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {eventTypes.map((type, idx) => (
              <Card key={idx} className="bg-white/10 border-none text-white hover:bg-white/20 transition-colors">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <type.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 gold-text">{type.title}</h3>
                  <p className="text-gray-200">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What We Offer</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lg text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capacity & Details */}
      <section className="section-spacing dark-bg text-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Event Details</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 gold-text">Capacity</h3>
              <ul className="space-y-3 text-lg">
                <li>• Intimate gatherings: 10-20 guests</li>
                <li>• Medium events: 20-40 guests</li>
                <li>• Full venue: Up to 60 guests</li>
                <li>• Outdoor terrace: Additional seating available</li>
              </ul>
            </div>

            <div className="bg-white/10 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 gold-text">Services Included</h3>
              <ul className="space-y-3 text-lg">
                <li>• Personalized menu planning</li>
                <li>• Professional wait staff</li>
                <li>• Table setup and decoration</li>
                <li>• Audio system for music/speeches</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-white/10 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 gold-text">Booking Information</h3>
            <p className="text-lg mb-4">
              We recommend booking your event at least 2-3 weeks in advance to ensure availability 
              and allow time for menu customization. Our team will work closely with you to plan 
              every detail.
            </p>
            <p className="text-lg">
              For weekend events and larger parties, we suggest booking even earlier. Contact us 
              to discuss your specific needs and receive a customized quote.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-spacing cream-bg">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Plan Your Event?</h2>
          <div className="gold-divider"></div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get in touch with us to discuss your event requirements and receive a personalized proposal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+41225034186">
              <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
                Call Us: +41 22 503 41 86
              </Button>
            </a>
            <a href="mailto:info@spinella.ch">
              <Button size="lg" variant="outline" className="border-2 border-black hover:bg-black hover:text-white font-semibold">
                Email: info@spinella.ch
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
