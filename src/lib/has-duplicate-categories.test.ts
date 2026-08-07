import { describe, expect, it } from "vitest";

import { hasDuplicateCategories } from "./has-duplicate-categories";

describe("hasDuplicateCategories", () => {
  it("returns false for a list without duplicates", () => {
    expect(hasDuplicateCategories(["security", "performance"])).toBe(false);
  });

  it("returns true when the same category appears twice", () => {
    expect(hasDuplicateCategories(["security", "performance", "security"])).toBe(true);
  });

  it("returns false for an empty list", () => {
    expect(hasDuplicateCategories([])).toBe(false);
  });
});
