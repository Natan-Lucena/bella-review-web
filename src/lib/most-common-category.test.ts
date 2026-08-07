import { describe, expect, it } from "vitest";

import type { Comment } from "../types/comment";
import { mostCommonCategory } from "./most-common-category";

function comment(category: string): Comment {
  return {
    id: `${category}-${Math.random()}`,
    reviewRunId: "run-1",
    prNumber: 1,
    file: "src/index.ts",
    line: 1,
    category,
    severity: "high",
    body: "example",
    status: "published",
    externalId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("mostCommonCategory", () => {
  it("returns the category that appears most often", () => {
    const comments = [comment("security"), comment("performance"), comment("security")];
    expect(mostCommonCategory(comments)).toBe("security");
  });

  it("returns null for an empty list", () => {
    expect(mostCommonCategory([])).toBeNull();
  });
});
