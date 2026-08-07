import { describe, expect, it } from "vitest";

import type { Comment } from "../types/comment";
import { findCommentById } from "./find-comment-by-id";

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

describe("findCommentById", () => {
  it("returns the matching comment", () => {
    const comments = [comment("a"), comment("b")];
    expect(findCommentById(comments, "b")).toBe(comments[1]);
  });

  it("returns undefined when no comment matches", () => {
    expect(findCommentById([comment("a")], "z")).toBeUndefined();
  });
});
