import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isVisitDateTimeInPast,
  normalizeVisitTime,
  visitCreateRequestSchema,
  visitFormBaseSchema,
  visitManualFormSchema,
} from "./visit";

const memberId = "00000000-0000-4000-8000-000000000001";
const eventTypeId = "00000000-0000-4000-8000-000000000002";
const staffId = "00000000-0000-4000-8000-000000000003";

const futureVisit = {
  memberId,
  eventTypeId,
  date: "2026-12-01",
  time: "10:00",
};

describe("normalizeVisitTime", () => {
  it("returns HH:mm from ISO datetime strings", () => {
    expect(normalizeVisitTime("2026-06-18T14:30:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
  });

  it("truncates time strings to five characters", () => {
    expect(normalizeVisitTime("14:30:00")).toBe("14:30");
  });
});

describe("isVisitDateTimeInPast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 18, 14, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("detects past visit datetimes", () => {
    expect(isVisitDateTimeInPast("2026-06-18", "13:00")).toBe(true);
    expect(isVisitDateTimeInPast("2026-06-17", "15:00")).toBe(true);
  });

  it("allows future visit datetimes", () => {
    expect(isVisitDateTimeInPast("2026-06-18", "15:00")).toBe(false);
    expect(isVisitDateTimeInPast("2026-12-01", "10:00")).toBe(false);
  });
});

describe("visitFormBaseSchema", () => {
  it("accepts valid base visit fields", () => {
    expect(visitFormBaseSchema.safeParse(futureVisit).success).toBe(true);
  });

  it("rejects invalid UUIDs and time format", () => {
    expect(visitFormBaseSchema.safeParse({ ...futureVisit, memberId: "bad" }).success).toBe(false);
    expect(visitFormBaseSchema.safeParse({ ...futureVisit, time: "25:99" }).success).toBe(false);
  });
});

describe("visitCreateRequestSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts guided booking without staffId", () => {
    const result = visitCreateRequestSchema.safeParse({
      ...futureVisit,
      bookingMode: "guided",
    });
    expect(result.success).toBe(true);
  });

  it("requires staffId for manual booking", () => {
    const withoutStaff = visitCreateRequestSchema.safeParse({
      ...futureVisit,
      bookingMode: "manual",
    });
    expect(withoutStaff.success).toBe(false);

    const withStaff = visitCreateRequestSchema.safeParse({
      ...futureVisit,
      bookingMode: "manual",
      staffId,
    });
    expect(withStaff.success).toBe(true);
  });

  it("rejects past appointments on manual schema", () => {
    vi.setSystemTime(new Date(2026, 5, 18, 14, 0, 0));
    const result = visitManualFormSchema.safeParse({
      ...futureVisit,
      date: "2026-06-18",
      time: "13:00",
      staffId,
    });
    expect(result.success).toBe(false);
  });
});
