import { describe, expect, it } from "vitest";

import { toServiceState } from "./service-state";

describe("toServiceState", () => {
  it("is 'inactive' whenever active is false, regardless of configComplete", () => {
    expect(toServiceState({ active: false, configComplete: true })).toBe("inactive");
    expect(toServiceState({ active: false, configComplete: false })).toBe("inactive");
  });

  it("is 'active' when active and configComplete", () => {
    expect(toServiceState({ active: true, configComplete: true })).toBe("active");
  });

  it("is 'configuration_pending' when active but not configComplete", () => {
    expect(toServiceState({ active: true, configComplete: false })).toBe("configuration_pending");
  });
});
