import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createBooking, getAllBookings, getBookingsByDate, subscribeNewsletter, getAllNewsletterSubscribers } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  bookings: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          phone: z.string().min(10),
          date: z.string(),
          time: z.string(),
          partySize: z.number().int().positive(),
          specialRequests: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const booking = await createBooking({
          name: input.name,
          email: input.email,
          phone: input.phone,
          date: input.date,
          time: input.time,
          partySize: input.partySize,
          specialRequests: input.specialRequests || null,
          status: "pending",
        });

        // Send notification to owner
        await notifyOwner({
          title: "New Table Booking Request",
          content: `New booking from ${input.name} for ${input.partySize} guests on ${input.date} at ${input.time}. Email: ${input.email}, Phone: ${input.phone}`,
        });

        return { success: true, bookingId: booking };
      }),
    list: protectedProcedure.query(async () => {
      return await getAllBookings();
    }),
    getByDate: publicProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }) => {
        return await getBookingsByDate(input.date);
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const result = await subscribeNewsletter(input.email);
        if (!result.success) {
          throw new Error(result.error || "Failed to subscribe");
        }
        return { success: true };
      }),
    list: protectedProcedure.query(async () => {
      return await getAllNewsletterSubscribers();
    }),
  }),
});

export type AppRouter = typeof appRouter;
