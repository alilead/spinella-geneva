import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Users, CheckCircle, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { isSlotBlocked, isRequestOnlySlot } from "@/lib/blockedSlots";

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  partySize: z.string().min(1, "Please select party size"),
  specialRequests: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const ALL_TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"
];

export default function Booking() {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [formDataForFallback, setFormDataForFallback] = useState<BookingForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");

  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      setApiUnavailable(false);
      setIsSubmitted(true);
      toast.success("Booking request submitted successfully!");
    },
    onError: (error: { message?: string }) => {
      const isJsonOrNetworkError =
        typeof error?.message === "string" &&
        (error.message.includes("not valid JSON") ||
          error.message.includes("DOCTYPE") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError"));
      if (isJsonOrNetworkError) {
        setApiUnavailable(true);
        toast.error(t("booking.apiUnavailable"));
      } else {
        toast.error(error?.message || t("booking.errorMessage"));
      }
    },
  });

  const onSubmit = (data: BookingForm) => {
    setFormDataForFallback(data);
    createBooking.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: data.date,
      time: data.time,
      partySize: parseInt(data.partySize),
      specialRequests: data.specialRequests || null,
    });
  };

  const timeSlots = useMemo(() => {
    if (!selectedDate) return ALL_TIME_SLOTS;
    return ALL_TIME_SLOTS.filter((time) => !isSlotBlocked(selectedDate, time));
  }, [selectedDate]);

  const partySizes = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center cream-bg">
        <div className="container max-w-2xl text-center">
          <div className="bg-card p-12 rounded-lg shadow-xl text-card-foreground">
            <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{t("booking.bookingConfirmed")}</h1>
            <div className="gold-divider"></div>
            <p className="text-lg mb-6">
              {t("booking.bookingConfirmedDesc")}
            </p>
            <p className="text-muted-foreground mb-8">
              {t("booking.questionsContact")}{" "}
              <a href="tel:+41225034186" className="gold-text font-semibold hover:underline">
                +41 22 503 41 86
              </a>
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold"
            >
              {t("booking.makeAnotherBooking")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/spinella_exterior.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        
        <div className="relative z-10 container text-center text-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t("booking.title")}</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">{t("booking.subtitle")}</p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section-spacing cream-bg">
        <div className="container max-w-3xl">
          <div className="bg-card p-8 md:p-12 rounded-lg shadow-xl text-card-foreground">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">{t("booking.yourInformation")}</h2>
                
                <div>
                  <Label htmlFor="name">{t("booking.name")} *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder={t("booking.name")}
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">{t("booking.email")} *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder={t("booking.email")}
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">{t("booking.phone")} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder={t("booking.phone")}
                    className="mt-1"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="gold-divider"></div>

              {/* Reservation Details */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">{t("booking.reservationDetails")}</h2>

                {selectedDate && selectedTime && isRequestOnlySlot(selectedDate, selectedTime) && (
                  <div className="p-4 rounded-lg gold-bg/20 border border-[oklch(0.62_0.15_85/0.4)] text-foreground">
                    <p className="text-sm font-medium">{t("booking.valentinesNotice")}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date" className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t("booking.date")} *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      {...register("date")}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1"
                    />
                    {errors.date && (
                      <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="time" className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {t("booking.time")} *
                    </Label>
                    <Select onValueChange={(value) => setValue("time", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t("booking.selectTime")} />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.time && (
                      <p className="text-sm text-red-500 mt-1">{errors.time.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="partySize" className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {t("booking.guests")} *
                    </Label>
                    <Select onValueChange={(value) => setValue("partySize", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t("booking.selectGuests")} />
                      </SelectTrigger>
                      <SelectContent>
                        {partySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size} {parseInt(size) === 1 ? t("booking.guest") : t("booking.guestsPlural")}
                          </SelectItem>
                        ))}
                        <SelectItem value="10+">10+ {t("booking.guestsPlural")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.partySize && (
                      <p className="text-sm text-red-500 mt-1">{errors.partySize.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialRequests">{t("booking.specialRequests")}</Label>
                  <Textarea
                    id="specialRequests"
                    {...register("specialRequests")}
                    placeholder={t("booking.specialRequestsPlaceholder")}
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold text-lg"
                  disabled={createBooking.isPending}
                >
                  {createBooking.isPending ? t("booking.submitting") : t("booking.submit")}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                {t("booking.formAgreement")}
              </p>

              {apiUnavailable && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-foreground mb-3">
                    {t("booking.apiUnavailable")}
                  </p>
                  <a
                    href={
                      formDataForFallback
                        ? (() => {
                            const d = formDataForFallback;
                            const subject = encodeURIComponent(
                              `Reservation request – ${d.date} ${d.time} – ${d.name}`
                            );
                            const body = encodeURIComponent(
                              `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nDate: ${d.date}\nTime: ${d.time}\nGuests: ${d.partySize}${d.specialRequests ? `\nSpecial requests: ${d.specialRequests}` : ""}`
                            );
                            return `mailto:info@spinella.ch?subject=${subject}&body=${body}`;
                          })()
                        : "mailto:info@spinella.ch?subject=Reservation request"
                    }
                    className="inline-flex items-center gap-2 gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {t("booking.sendByEmail")}
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
