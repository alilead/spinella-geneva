import { useState } from "react";
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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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

export default function Booking() {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Booking request submitted successfully!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to submit booking. Please try again.");
    },
  });

  const onSubmit = (data: BookingForm) => {
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

  const timeSlots = [
    "12:00", "12:30", "13:00", "13:30", "14:00",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
  ];

  const partySizes = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center cream-bg">
        <div className="container max-w-2xl text-center">
          <div className="bg-white p-12 rounded-lg shadow-xl">
            <div className="w-20 h-20 gold-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
            <div className="gold-divider"></div>
            <p className="text-lg mb-6">
              Thank you for your reservation request. We've sent a confirmation email to your address.
              Our team will review your booking and confirm within 10-20 minutes.
            </p>
            <p className="text-gray-600 mb-8">
              If you have any questions, please contact us at{" "}
              <a href="tel:+41225034186" className="gold-text font-semibold hover:underline">
                +41 22 503 41 86
              </a>
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="gold-bg text-black hover:bg-[oklch(0.52_0.15_85)] font-semibold"
            >
              Make Another Booking
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
          style={{ backgroundImage: "url(/outdoor_terrace_garden.jpg)" }}
        >
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        
        <div className="relative z-10 container text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Book a Table</h1>
          <div className="gold-divider"></div>
          <p className="text-xl">Reserve Your Authentic Italian Experience</p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section-spacing cream-bg">
        <div className="container max-w-3xl">
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Your Information</h2>
                
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+41 22 123 45 67"
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
                <h2 className="text-2xl font-bold mb-4">Reservation Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date" className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date *
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
                      Time *
                    </Label>
                    <Select onValueChange={(value) => setValue("time", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select time" />
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
                      Guests *
                    </Label>
                    <Select onValueChange={(value) => setValue("partySize", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select guests" />
                      </SelectTrigger>
                      <SelectContent>
                        {partySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size} {parseInt(size) === 1 ? "guest" : "guests"}
                          </SelectItem>
                        ))}
                        <SelectItem value="10+">10+ guests</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.partySize && (
                      <p className="text-sm text-red-500 mt-1">{errors.partySize.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    {...register("specialRequests")}
                    placeholder="Dietary restrictions, allergies, special occasions, etc."
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
                  {createBooking.isPending ? "Submitting..." : "Confirm Booking"}
                </Button>
              </div>

              <p className="text-sm text-gray-600 text-center">
                By submitting this form, you agree to receive a confirmation email. 
                We'll review your request and confirm within 10-20 minutes.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
