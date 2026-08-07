import { describe, expect, it } from "vitest";

import type { Comment } from "../types/comment";
import type { ReviewRunSummary } from "../types/review-run";
import { countCommentsPerReviewRun } from "./count-comments-per-review-run";

function run(id: string): ReviewRunSummary {
  return {
    id,
    prNumber: 1,
    commitSha: "abc123",
    trigger: "action",
    status: "completed",
    errorReason: null,
    durationMs: 1000,
    commentCount: 0,
    totalTokens: 0,
    startedAt: null,
    completedAt: null,
  };
}

function comment(reviewRunId: string, status: Comment["status"] = "published"): Comment {
  return {
    id: `${reviewRunId}-${Math.random()}`,
    reviewRunId,
    prNumber: 1,
    file: "src/index.ts",
    line: 1,
    category: "security",
    severity: "high",
    body: "example",
    status,
    externalId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("countCommentsPerReviewRun", () => {
  it("counts only published comments, grouped by run", () => {
    const runs = [run("run-1"), run("run-2")];
    const comments = [
      comment("run-1"),
      comment("run-1"),
      comment("run-1", "generated"),
      comment("run-2"),
    ];
    expect(countCommentsPerReviewRun(runs, comments)).toEqual({ "run-1": 2, "run-2": 1 });
  });

  it("returns 0 for a run with no published comments", () => {
    expect(countCommentsPerReviewRun([run("run-1")], [])).toEqual({ "run-1": 0 });
  });
});
