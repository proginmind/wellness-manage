import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getTrialStatus, TRIAL_ALLOWED_RESOURCES } from "./trial";

describe("getTrialStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-18T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("treats null trial end as grandfathered (no enforcement)", () => {
    expect(getTrialStatus(null, false)).toEqual({
      isOnTrial: false,
      isExpired: false,
      endsAt: null,
      daysLeft: 0,
    });
  });

  it("returns active trial when end date is in the future", () => {
    const endsAt = new Date("2026-06-25T12:00:00Z");
    expect(getTrialStatus(endsAt, false)).toEqual({
      isOnTrial: true,
      isExpired: false,
      endsAt,
      daysLeft: 7,
    });
  });

  it("returns expired trial when end date is in the past", () => {
    const endsAt = new Date("2026-06-10T12:00:00Z");
    expect(getTrialStatus(endsAt, false)).toEqual({
      isOnTrial: false,
      isExpired: true,
      endsAt,
      daysLeft: 0,
    });
  });

  it("ignores trial when org has an active subscription", () => {
    const endsAt = new Date("2026-06-10T12:00:00Z");
    expect(getTrialStatus(endsAt, true)).toEqual({
      isOnTrial: false,
      isExpired: false,
      endsAt,
      daysLeft: 0,
    });
  });
});

describe("TRIAL_ALLOWED_RESOURCES", () => {
  it("includes billing escape hatches for expired trials", () => {
    const allowed = [...TRIAL_ALLOWED_RESOURCES];
    expect(allowed).toContain("billing");
    expect(allowed).toContain("plans");
    expect(allowed).not.toContain("members");
  });
});
