import { describe, expect, it } from "vitest";

import { dedupeCategories } from "./dedupe-categories";

describe("dedupeCategories", () => {
  it("removes repeated entries while keeping the first-seen order", () => {
    expect(dedupeCategories(["security", "performance", "security", "testing"])).toEqual([
      "security",
      "performance",
      "testing",
    ]);
  });

  it("returns an empty list unchanged", () => {
    expect(dedupeCategories([])).toEqual([]);
  });
});
