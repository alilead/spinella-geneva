import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/menu", label: t("nav.menu") },
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/events", label: t("nav.events") },
    { href: "/about", label: t("nav.about") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background text-foreground shadow-lg">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src="/logo.png"
                alt="Spinella"
                className="h-10 w-auto md:h-12"
              />
              <span className="brand-font text-xl font-bold gold-text hidden sm:inline">SPINELLA</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    isActive(item.href)
                      ? "gold-text"
                      : "text-foreground hover:text-[oklch(0.62_0.15_85)]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : language === "fr" ? "it" : "en")}
              className="flex items-center gap-1.5 text-sm font-medium hover:text-[oklch(0.62_0.15_85)] transition-colors"
              aria-label="Switch language"
            >
              <Languages size={18} />
              <span className="font-semibold">{language === "en" ? "EN" : language === "fr" ? "FR" : "IT"}</span>
            </button>
            <Link href="/reservations">
              <Button className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
                {t("nav.bookTable")}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6 pt-2">
            <div className="flex flex-col">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`block py-3 text-sm font-medium transition-colors cursor-pointer border-b border-border/50 ${
                      isActive(item.href)
                        ? "gold-text"
                        : "text-foreground hover:text-[oklch(0.62_0.15_85)]"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <button
                onClick={() => setLanguage(language === "en" ? "fr" : language === "fr" ? "it" : "en")}
                className="flex items-center gap-2 py-3 min-h-[44px] text-left text-sm font-medium hover:text-[oklch(0.62_0.15_85)] transition-colors border-b border-border/50 w-full"
                aria-label="Switch language"
              >
                <Languages size={18} />
                <span className="font-semibold">{language === "en" ? "FR" : language === "fr" ? "IT" : "EN"}</span>
              </button>
              <Link href="/reservations" className="mt-4">
                <Button
                  className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold w-full min-h-[44px]"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.bookTable")}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
