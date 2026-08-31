import { describe, expect, it } from "vitest";

import { pivotByCategory } from "./cost-breakdown";
import type { CostBreakdownEntry } from "../types/cost-stats";

describe("pivotByCategory", () => {
  it("puts a review-only category's cost in the review column, comment_reply at 0", () => {
    const breakdown: CostBreakdownEntry[] = [
      { category: "security", runType: "review", totalCost: 4.2, count: 6 },
    ];
    expect(pivotByCategory(breakdown)).toEqual([
      { category: "security", review: 4.2, comment_reply: 0 },
    ]);
  });

  it("puts a comment_reply-only category's cost in the comment_reply column, review at 0", () => {
    const breakdown: CostBreakdownEntry[] = [
      { category: "readability", runType: "comment_reply", totalCost: 1.05, count: 2 },
    ];
    expect(pivotByCategory(breakdown)).toEqual([
      { category: "readability", review: 0, comment_reply: 1.05 },
    ]);
  });

  it("merges a category present in both runTypes into a single row, no duplicates", () => {
    const breakdown: CostBreakdownEntry[] = [
      { category: "security", runType: "review", totalCost: 15.4, count: 24 },
      { category: "security", runType: "comment_reply", totalCost: 5.6, count: 14 },
    ];
    const rows = pivotByCategory(breakdown);
    expect(rows).toEqual([{ category: "security", review: 15.4, comment_reply: 5.6 }]);
  });

  it("preserves the arrival order of `breakdown` instead of re-sorting (already cost-descending from the backend)", () => {
    const breakdown: CostBreakdownEntry[] = [
      { category: "security", runType: "review", totalCost: 15.4, count: 24 },
      { category: "performance", runType: "review", totalCost: 12.2, count: 20 },
      { category: "correctness", runType: "comment_reply", totalCost: 1.15, count: 3 },
    ];
    expect(pivotByCategory(breakdown).map((row) => row.category)).toEqual([
      "security",
      "performance",
      "correctness",
    ]);
  });

  it("returns an empty array for an empty breakdown", () => {
    expect(pivotByCategory([])).toEqual([]);
  });
});
