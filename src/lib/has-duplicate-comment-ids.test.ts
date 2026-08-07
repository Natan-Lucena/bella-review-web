import { describe, expect, it } from "vitest";

import type { Comment } from "../types/comment";
import { hasDuplicateCommentIds } from "./has-duplicate-comment-ids";

function comment(id: string): Comment {
  return {
    id,
    reviewRunId: "run-1",
    prNumber: 1,
    file: "src/index.ts",
    line: 1,
    category: "security",
    severity: "high",
    body: "example",
    status: "published",
    externalId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("hasDuplicateCommentIds", () => {
  it("returns false when every id is unique", () => {
    expect(hasDuplicateCommentIds([comment("a"), comment("b")])).toBe(false);
  });

  it("returns true when an id repeats", () => {
    expect(hasDuplicateCommentIds([comment("a"), comment("b"), comment("a")])).toBe(true);
  });
});
