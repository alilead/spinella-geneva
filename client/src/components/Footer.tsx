import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from "lucide-react";

/** TripAdvisor logo (owl) – inline SVG for footer link */
function TripAdvisorIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 0 0 4.04 10.43 5.976 5.976 0 0 0 4.075-1.6L12 19.705l1.922-2.09a5.976 5.976 0 0 0 4.075 1.6 5.997 5.997 0 0 0 4.04-10.43L24 6.648h-4.35a13.573 13.573 0 0 0-7.644-2.353zM12 6.255c1.531 0 3.063.303 4.504.91a7.273 7.273 0 0 1 3.104 2.587 7.272 7.272 0 0 1-3.104 2.586 10.02 10.02 0 0 1-4.504.91 10.02 10.02 0 0 1-4.504-.91 7.272 7.272 0 0 1-3.104-2.586 7.272 7.272 0 0 1 3.104-2.587A10.02 10.02 0 0 1 12 6.255z" />
    </svg>
  );
}

/** TikTok logo – inline SVG for footer link */
function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-background text-foreground">
      <div className="container section-spacing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="brand-font text-2xl font-bold gold-text mb-6">Spinella</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 gold-text flex-shrink-0 mt-0.5" />
                <span>Rue Liotard 4<br />1202 Geneva, Switzerland</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 gold-text flex-shrink-0" />
                <a href="tel:+41225034186" className="hover:text-[oklch(0.62_0.15_85)] transition-colors">
                  +41 22 503 41 86
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 gold-text flex-shrink-0" />
                <a href="mailto:info@spinella.ch" className="hover:text-[oklch(0.62_0.15_85)] transition-colors">
                  info@spinella.ch
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Clock className="w-5 h-5 gold-text mr-2" />
              {t("footer.openingHours")}
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">{t("contact.kitchenHoursTitle")}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("contact.monWed")}:</span>
                    <span className="gold-text">{t("contact.monWedHours")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contact.thuFri")}:</span>
                    <span className="gold-text">{t("contact.thuFriHours")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contact.saturday")}:</span>
                    <span className="gold-text">{t("contact.satHours")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contact.sunday")}:</span>
                    <span className="gold-text">{t("contact.sundayHours")}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t("contact.barHoursTitle")}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("contact.monWed")}:</span>
                    <span className="gold-text">{t("contact.monWedBarHours")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contact.thuFri")}:</span>
                    <span className="gold-text">{t("contact.thuFriBarHours")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contact.saturday")}:</span>
                    <span className="gold-text">{t("contact.satBarHours")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contact.sunday")}:</span>
                    <span className="gold-text">{t("contact.sundayBarHours")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6">{t("footer.stayConnected")}</h3>
            <p className="text-sm mb-4">
              {t("footer.followUs")}
            </p>
            <div className="flex space-x-4 mb-6">
              <a
                href="https://www.instagram.com/spinellageneve/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full gold-bg flex items-center justify-center text-black hover:bg-[oklch(0.52_0.15_85)] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/spinellageneve"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full gold-bg flex items-center justify-center text-black hover:bg-[oklch(0.52_0.15_85)] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@spinellageneve"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full gold-bg flex items-center justify-center text-black hover:bg-[oklch(0.52_0.15_85)] transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon size={20} />
              </a>
              <a
                href="https://www.tripadvisor.com/Restaurant_Review-g188057-d18930037-Reviews-Spinella_Restaurant_Bar-Geneva.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full gold-bg flex items-center justify-center text-black hover:bg-[oklch(0.52_0.15_85)] transition-colors"
                aria-label="TripAdvisor"
              >
                <TripAdvisorIcon size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Spinella Restaurant & Bar. {t("footer.allRightsReserved")}.</p>
        </div>
      </div>
    </footer>
  );
}
