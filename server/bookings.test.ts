import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("bookings.create", () => {
  it("creates a booking with valid data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.bookings.create({
      name: "John Doe",
      email: "john@example.com",
      phone: "+41 22 123 45 67",
      date: "2026-02-15",
      time: "19:00",
      partySize: 4,
      specialRequests: "Window seat preferred",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("bookingId");
  });

  it("validates required fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.bookings.create({
        name: "J", // Too short
        email: "invalid-email",
        phone: "123", // Too short
        date: "2026-02-15",
        time: "19:00",
        partySize: 4,
      })
    ).rejects.toThrow();
  });

  it("validates email format", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.bookings.create({
        name: "John Doe",
        email: "not-an-email",
        phone: "+41 22 123 45 67",
        date: "2026-02-15",
        time: "19:00",
        partySize: 4,
      })
    ).rejects.toThrow();
  });

  it("validates party size is positive", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.bookings.create({
        name: "John Doe",
        email: "john@example.com",
        phone: "+41 22 123 45 67",
        date: "2026-02-15",
        time: "19:00",
        partySize: -1, // Invalid
      })
    ).rejects.toThrow();
  });
});

describe("newsletter.subscribe", () => {
  it("subscribes with valid email", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const timestamp = Date.now();
    const result = await caller.newsletter.subscribe({
      email: `test${timestamp}@example.com`,
    });

    expect(result).toHaveProperty("success", true);
  });

  it("validates email format", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.newsletter.subscribe({
        email: "invalid-email",
      })
    ).rejects.toThrow();
  });
});
