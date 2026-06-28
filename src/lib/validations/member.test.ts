import { describe, expect, it } from "vitest";

import { memberFormSchema } from "./member";

const validMember = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  dateOfBirth: "1990-01-15",
  dateJoined: "2024-01-01",
};

describe("memberFormSchema", () => {
  it("accepts valid member input", () => {
    expect(memberFormSchema.safeParse(validMember).success).toBe(true);
  });

  it("rejects names that are too short", () => {
    const result = memberFormSchema.safeParse({ ...validMember, firstName: "J" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("at least 2 characters");
    }
  });

  it("rejects invalid email", () => {
    const result = memberFormSchema.safeParse({ ...validMember, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects future date joined", () => {
    const result = memberFormSchema.safeParse({ ...validMember, dateJoined: "2099-01-01" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("future"))).toBe(true);
    }
  });

  it("allows empty optional phone and image", () => {
    expect(memberFormSchema.safeParse({ ...validMember, phoneNumber: "", image: "" }).success).toBe(
      true
    );
  });
});
