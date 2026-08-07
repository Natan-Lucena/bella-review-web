import { describe, expect, it } from "vitest";

import type { ReviewRunSummary } from "../types/review-run";
import { findReviewRunByCommitSha } from "./find-review-run-by-commit-sha";

function run(commitSha: string): ReviewRunSummary {
  return {
    id: `run-${commitSha}`,
    prNumber: 1,
    commitSha,
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

describe("findReviewRunByCommitSha", () => {
  it("returns the run with the matching commit sha", () => {
    const runs = [run("abc123"), run("def456")];
    expect(findReviewRunByCommitSha(runs, "def456")).toBe(runs[1]);
  });

  it("returns undefined when no run matches", () => {
    expect(findReviewRunByCommitSha([run("abc123")], "zzz")).toBeUndefined();
  });
});
