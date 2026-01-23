import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="dark-bg text-white">
      <div className="container section-spacing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold gold-text mb-6">Spinella</h3>
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
              Opening Hours
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monday - Wednesday:</span>
                <span className="gold-text">10am-3pm, 5pm-12am</span>
              </div>
              <div className="flex justify-between">
                <span>Thursday - Friday:</span>
                <span className="gold-text">10am-3pm, 5pm-2am</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="gold-text">5pm-2am</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="font-semibold gold-text">Kitchen Hours:</p>
                <p className="mt-1">Mon-Wed: 12pm-2pm, 6:30pm-10pm</p>
                <p>Thu-Fri: 12pm-2pm, 6:30pm-10:30pm</p>
                <p>Sat: 6:30pm-10:30pm</p>
              </div>
            </div>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6">Stay Connected</h3>
            <p className="text-sm mb-4">
              Follow us for exclusive offers, events, and special dishes!
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
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Spinella Restaurant & Bar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
