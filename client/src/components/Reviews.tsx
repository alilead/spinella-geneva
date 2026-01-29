import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Reviews() {
  const { t } = useLanguage();
  
  const reviews = [
    { text: t("reviews.review1"), author: t("reviews.author1"), rating: 5, source: "TripAdvisor" },
    { text: t("reviews.review2"), author: t("reviews.author2"), rating: 5, source: "TripAdvisor" },
    { text: t("reviews.review3"), author: t("reviews.author3"), rating: 5, source: "TripAdvisor" },
    { text: t("reviews.review4"), author: t("reviews.author4"), rating: 5, source: "TripAdvisor" }
  ];

  return (
    <section className="section-spacing cream-bg">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("home.reviewsTitle")}</h2>
          <div className="gold-divider"></div>
          <p className="text-lg text-muted-foreground mb-6">{t("home.reviewsSubtitle")}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-xl font-semibold">{t("home.ratedNumber1")}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 gold-text" fill="currentColor" />
              ))}
            </div>
            <span className="text-muted-foreground">{t("home.onTripAdvisor")}</span>
          </div>
          <p className="text-lg text-muted-foreground mt-2">{t("home.basedOnReviews")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((review, idx) => (
            <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="flex items-start mb-4">
                  <Quote className="w-8 h-8 gold-text flex-shrink-0 mr-3" />
                  <div className="flex-1">
                    <div className="flex mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 gold-text" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-foreground italic mb-4 leading-relaxed">
                      "{review.text}"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">— {review.author}</p>
                      <p className="text-sm text-muted-foreground">{review.source}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.tripadvisor.com/Restaurant_Review-g188057-d18930037-Reviews-Spinella_Restaurant_Bar-Geneva.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold px-6 py-3 rounded-md transition-colors"
          >
            <Star size={20} fill="currentColor" />
            {t("home.readMoreReviews")}
          </a>
        </div>
      </div>
    </section>
  );
}
