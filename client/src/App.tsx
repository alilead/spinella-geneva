import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import SeoHead from "./components/SeoHead";
import Home from "./pages/Home";

// Lazy-load non-home routes; Booking loaded eagerly to avoid chunk load failures on slow networks
const Menu = lazy(() => import("./pages/Menu"));
const Gallery = lazy(() => import("./pages/Gallery"));
const About = lazy(() => import("./pages/About"));
const Events = lazy(() => import("./pages/Events"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Takeaway = lazy(() => import("./pages/Takeaway"));
import Booking from "./pages/Booking";
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RedirectToReservations() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/reservations");
  }, [setLocation]);
  return null;
}

function ScrollToTop() {
  const [pathname] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function Router() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <ScrollToTop />
      <SeoHead />
      <Navigation />
      <Suspense fallback={<div className="min-h-[60vh]" aria-hidden />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/menu" component={Menu} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/about" component={About} />
          <Route path="/events" component={Events} />
          <Route path="/faq" component={FAQ} />
          <Route path="/contact" component={Contact} />
          <Route path="/booking" component={RedirectToReservations} />
          <Route path="/reservations" component={Booking} />
          <Route path="/takeaway" component={Takeaway} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/" component={Admin} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      <Footer />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
