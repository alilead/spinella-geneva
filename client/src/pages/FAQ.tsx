import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FAQ() {
  const { t } = useLanguage();

  const allFaqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
    { question: t("faq.q7"), answer: t("faq.a7") },
    { question: t("faq.q8"), answer: t("faq.a8") },
  ];
  // Dress code (index 4) removed for a more welcoming image.
  const faqs = allFaqs.filter((_, i) => i !== 4);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[240px] sm:min-h-[280px] md:h-72 lg:h-80 flex items-center justify-center">
        <div
          className="hero-bg absolute inset-0"
          style={{ backgroundImage: "url(/spinella_interior.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0" />
        </div>
        
        <div className="relative z-10 container text-center text-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t("faq.title")}</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">{t("faq.subtitle")}</p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section-spacing cream-bg">
        <div className="container max-w-4xl">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-lg px-6 shadow-md"
              >
                <AccordionTrigger className="text-lg font-semibold text-left hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-card p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">{t("faq.stillHaveQuestions")}</h3>
            <p className="text-muted-foreground mb-6">
              {t("faq.contactPrompt")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold">
                  {t("faq.contactUs")}
                </Button>
              </Link>
              <Link href="/reservations">
                <Button size="lg" variant="outline" className="border-2 border-[oklch(0.62_0.15_85)] text-[oklch(0.62_0.15_85)] hover:bg-[oklch(0.62_0.15_85)] hover:text-black font-semibold">
                  {t("faq.bookTable")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
