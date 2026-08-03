import { describe, expect, it } from "vitest";

import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("formats an ISO date as dd/mm/aaaa", () => {
    expect(formatDate("2026-07-12T10:00:00.000Z")).toBe("12/07/2026");
  });
});
