import { describe, expect, it } from "vitest";

import {
  assertPermission,
  can,
  canAll,
  canAny,
  getActions,
  getPermissions,
  hasPermission,
  isOwner,
  isStaff,
  PermissionError,
} from "./permissions";

describe("permissions", () => {
  it("allows owner to delete members and denies staff", () => {
    expect(can("owner", "members", "delete")).toBe(true);
    expect(can("staff", "members", "delete")).toBe(false);
  });

  it("restricts billing and plans to owner", () => {
    expect(can("owner", "billing", "view")).toBe(true);
    expect(can("staff", "billing", "view")).toBe(false);
    expect(can("staff", "plans", "view")).toBe(false);
  });

  it("allows staff day-to-day member operations without permanent delete", () => {
    expect(getActions("staff", "members")).toEqual([
      "view",
      "create",
      "update",
      "archive",
      "export",
    ]);
  });

  it("checks permission strings via hasPermission", () => {
    expect(hasPermission("owner", "staff.remove")).toBe(true);
    expect(hasPermission("staff", "staff.remove")).toBe(false);
  });

  it("evaluates canAny and canAll", () => {
    expect(canAny("staff", "members", ["delete", "archive"])).toBe(true);
    expect(canAll("owner", "members", ["view", "create"])).toBe(true);
    expect(canAll("staff", "members", ["view", "delete"])).toBe(false);
  });

  it("lists all permissions for a role", () => {
    const staffPermissions = getPermissions("staff");
    expect(staffPermissions).toContain("visits.create");
    expect(staffPermissions).not.toContain("billing.view");
  });

  it("throws PermissionError when assertPermission fails", () => {
    expect(() => assertPermission("staff", "members", "delete")).toThrow(PermissionError);
    expect(() => assertPermission("staff", "members", "delete")).toThrow(
      "Permission denied: staff cannot delete members"
    );
    expect(() => assertPermission("owner", "members", "delete")).not.toThrow();
  });

  it("identifies role helpers", () => {
    expect(isOwner("owner")).toBe(true);
    expect(isStaff("staff")).toBe(true);
    expect(isOwner("staff")).toBe(false);
  });
});
