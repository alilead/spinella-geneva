import { useState, useMemo, useEffect } from "react";
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
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getTimeSlotsForDate, isSunday, isRequestOnlySlot, isRequestOnlyPartySize } from "@/lib/blockedSlots";

function buildBookingSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t("booking.validation.nameMin")),
    email: z.string().email(t("booking.validation.emailInvalid")),
    phone: z.string().min(10, t("booking.validation.phoneMin")),
    date: z.string().min(1, t("booking.validation.dateRequired")),
    time: z.string().min(1, t("booking.validation.timeRequired")),
    partySize: z.string().min(1, t("booking.validation.partySizeRequired")),
    specialRequests: z.string().optional(),
  });
}

type BookingForm = z.infer<ReturnType<typeof buildBookingSchema>>;

/** Mon–Wed last slot 22:00; Thu–Sat 22:30. Sunday has no slots (see getTimeSlotsForDate). */

const RESTAURANT_EMAIL = "info@spinella.ch";

function buildMailtoUrl(data: BookingForm): string {
  const subject = `Reservation request - ${data.name} - ${data.date} at ${data.time}`;
  const body = [
    `Reservation request for Spinella`,
    ``,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Date: ${data.date}`,
    `Time: ${data.time}`,
    `Number of guests: ${data.partySize}`,
    ...(data.specialRequests?.trim() ? [`Special requests: ${data.specialRequests.trim()}`] : []),
  ].join("\n");
  return `mailto:${RESTAURANT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Booking() {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFailedData, setLastFailedData] = useState<BookingForm | null>(null);
  const [wasAutoConfirmed, setWasAutoConfirmed] = useState(false);

  const bookingSchema = useMemo(() => buildBookingSchema(t), [t]);
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

  useEffect(() => {
    if (selectedDate && isSunday(selectedDate)) setValue("time", "");
  }, [selectedDate, setValue]);

  const onSubmit = async (data: BookingForm) => {
    setLastFailedData(null);
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          date: data.date,
          time: data.time,
          partySize: data.partySize === "21" ? 21 : parseInt(data.partySize, 10),
          specialRequests: data.specialRequests || null,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setWasAutoConfirmed(Boolean(json.confirmed));
        setIsSubmitted(true);
        toast.success(t("booking.successToast"));
      } else {
        setLastFailedData(data);
        toast.error(t("booking.errorMessage"));
      }
    } catch {
      clearTimeout(timeoutId);
      setLastFailedData(data);
      toast.error(t("booking.errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getTimeSlotsForDate(selectedDate);
  }, [selectedDate]);

  // When date changes, clear time if it's no longer in the available slots (e.g. switch to Saturday = evening only).
  // Prevents Radix Select removeChild error when the selected value disappears from the list.
  useEffect(() => {
    if (selectedTime && timeSlots.length > 0 && !timeSlots.includes(selectedTime)) {
      setValue("time", "");
    }
  }, [selectedDate, selectedTime, timeSlots, setValue]);

  const partySizes = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
  const partySizeRaw = watch("partySize");
  const selectedPartySizeNum = partySizeRaw
    ? (parseInt(partySizeRaw, 10) || (partySizeRaw === "21" ? 21 : 0))
    : 0;
  const isLargeTable = isRequestOnlyPartySize(selectedPartySizeNum);
  const isGroupEvent = selectedPartySizeNum >= 21;

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center cream-bg">
        <div className="container max-w-2xl text-center">
          <div className="bg-card p-12 rounded-lg shadow-xl text-card-foreground">
            <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {wasAutoConfirmed ? t("booking.bookingConfirmed") : t("booking.bookingRequestTitle")}
            </h1>
            <div className="gold-divider"></div>
            <p className="text-lg mb-6">
              {wasAutoConfirmed
                ? t("booking.bookingConfirmedDescAuto")
                : t("booking.bookingConfirmedDesc")}
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
      <section className="relative min-h-[280px] sm:min-h-[320px] md:h-80 lg:h-96 flex items-center justify-center">
        <div
          className="hero-bg absolute inset-0"
          style={{ backgroundImage: "url(/spinella_exterior.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0" />
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

                {selectedDate && isSunday(selectedDate) && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-foreground">
                    <p className="text-sm font-medium">{t("booking.sundayClosed")}</p>
                  </div>
                )}
                {selectedDate && selectedTime && isRequestOnlySlot(selectedDate, selectedTime) && (
                  <div className="p-4 rounded-lg gold-bg/20 border border-[oklch(0.62_0.15_85/0.4)] text-foreground">
                    <p className="text-sm font-medium">{t("booking.valentinesNotice")}</p>
                  </div>
                )}
                {isLargeTable && (
                  <div className="p-4 rounded-lg gold-bg/20 border border-[oklch(0.62_0.15_85/0.4)] text-foreground">
                    <p className="text-sm font-medium">{t("booking.largeTableNotice")}</p>
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
                    <Select
                      value={selectedTime || undefined}
                      onValueChange={(value) => setValue("time", value)}
                    >
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
                        <SelectItem value="21">{t("booking.groupEventOption")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.partySize && (
                      <p className="text-sm text-red-500 mt-1">{errors.partySize.message}</p>
                    )}
                    {isLargeTable && (
                      <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
                        {t("booking.largeTableNotice")}
                      </p>
                    )}
                    {isGroupEvent && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {t("booking.groupEventNotice")}
                      </p>
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
                  disabled={isSubmitting || (!!selectedDate && isSunday(selectedDate))}
                >
                  {isSubmitting ? t("booking.submitting") : t("booking.submit")}
                </Button>
              </div>

              {lastFailedData && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-foreground">
                  <p className="text-sm font-medium mb-2">{t("booking.errorMessage")}</p>
                  <a
                    href={buildMailtoUrl(lastFailedData)}
                    className="inline-flex items-center text-sm font-semibold text-[oklch(0.62_0.15_85)] hover:underline"
                  >
                    {t("booking.sendByEmail")}
                  </a>
                </div>
              )}

              <p className="text-sm text-muted-foreground text-center">
                {t("booking.formAgreement")}
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
