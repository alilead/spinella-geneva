import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/gallery", label: "Gallery" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 dark-bg text-white shadow-lg">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <span className="text-2xl font-bold gold-text">SPINELLA</span>
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
                      : "text-white hover:text-[oklch(0.62_0.15_85)]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            <Link href="/booking">
              <Button className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
                Book a Table
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`block text-sm font-medium transition-colors cursor-pointer ${
                      isActive(item.href)
                        ? "gold-text"
                        : "text-white hover:text-[oklch(0.62_0.15_85)]"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <Link href="/booking">
                <Button
                  className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Book a Table
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
