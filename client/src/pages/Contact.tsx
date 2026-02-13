import { MapPin, Phone, Mail, Clock, Bus, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[280px] sm:min-h-[320px] md:h-80 lg:h-96 flex items-center justify-center">
        <div
          className="hero-bg absolute inset-0"
          style={{ backgroundImage: "url(/spinella_exterior.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0" />
        </div>
        
        <div className="relative z-10 container text-center text-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t("contact.title")}</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">{t("contact.subtitle")}</p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section-spacing cream-bg">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-4xl font-bold mb-4">{t("contact.getInTouch")}</h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t("contact.getInTouchWelcome")}
              </p>
              <div className="space-y-6">
                <Card className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 gold-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{t("contact.address")}</h3>
                        <p className="text-muted-foreground">
                          Rue Liotard 4<br />
                          1202 Geneva<br />
                          Switzerland
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 gold-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{t("contact.phone")}</h3>
                        <a href="tel:+41225034186" className="text-lg text-muted-foreground hover:text-[oklch(0.62_0.15_85)] transition-colors">
                          +41 22 503 41 86
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 gold-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{t("contact.email")}</h3>
                        <a href="mailto:info@spinella.ch" className="text-lg text-muted-foreground hover:text-[oklch(0.62_0.15_85)] transition-colors">
                          info@spinella.ch
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 gold-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-black" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold mb-2">{t("contact.hours")}</h3>
                        <div>
                          <h4 className="font-semibold mb-2">{t("contact.kitchenHoursTitle")}</h4>
                          <div className="text-muted-foreground overflow-x-auto">
                            <table className="w-full border border-border rounded-md overflow-hidden text-sm">
                              <tbody>
                                <tr className="border-b border-border"><td className="p-2 font-medium">{t("contact.monWed")}</td><td className="p-2">{t("contact.monWedHours")}</td></tr>
                                <tr className="border-b border-border"><td className="p-2 font-medium">{t("contact.thuFri")}</td><td className="p-2">{t("contact.thuFriHours")}</td></tr>
                                <tr className="border-b border-border"><td className="p-2 font-medium">{t("contact.saturday")}</td><td className="p-2">{t("contact.satHours")}</td></tr>
                                <tr><td className="p-2 font-medium">{t("contact.sunday")}</td><td className="p-2">{t("contact.sundayHours")}</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">{t("contact.barHoursTitle")}</h4>
                          <div className="text-muted-foreground overflow-x-auto">
                            <table className="w-full border border-border rounded-md overflow-hidden text-sm">
                              <tbody>
                                <tr className="border-b border-border"><td className="p-2 font-medium">{t("contact.monWed")}</td><td className="p-2">{t("contact.monWedBarHours")}</td></tr>
                                <tr className="border-b border-border"><td className="p-2 font-medium">{t("contact.thuFri")}</td><td className="p-2">{t("contact.thuFriBarHours")}</td></tr>
                                <tr className="border-b border-border"><td className="p-2 font-medium">{t("contact.saturday")}</td><td className="p-2">{t("contact.satBarHours")}</td></tr>
                                <tr><td className="p-2 font-medium">{t("contact.sunday")}</td><td className="p-2">{t("contact.sundayBarHours")}</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-4xl font-bold mb-8">{t("contact.findUs")}</h2>
              <div className="aspect-square w-full rounded-lg overflow-hidden shadow-lg mb-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2760.0847891234567!2d6.1389!3d46.2109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478c653c05c19e47%3A0x7e9b1e8e8e8e8e8e!2sRue%20Liotard%204%2C%201202%20Gen%C3%A8ve%2C%20Switzerland!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Spinella location map"
                ></iframe>
              </div>

              <div className="space-y-4">
                <Card className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <Bus className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">{t("contact.publicTransport")}</h3>
                        <p className="text-sm text-muted-foreground">
                          <strong>Bus Stop: Prairie</strong> - Lines 9, 19, 10, 6, NC<br />
                          <strong>Bus Stop: Poterie</strong> - Lines 3, 14, 18, A2, NA, NE<br />
                          <strong>Bus Stop: Musée Voltaire</strong> - Lines 9, A1, A6
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <Car className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">{t("contact.parking")}</h3>
                        <p className="text-sm text-muted-foreground">
                          École des Ingénieurs parking available nearby<br />
                          Street parking also available
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-background text-foreground">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("contact.readyToVisit")}</h2>
          <div className="gold-divider"></div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t("contact.readyToVisitDesc")}
          </p>
          <Link href="/reservations">
            <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold text-lg px-8">
              {t("nav.bookTable")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
