import { describe, expect, it } from "vitest";

import type { ReviewRunSummary } from "../types/review-run";
import { isCommitShaReusedAcrossRepos } from "./is-commit-sha-reused-across-repos";

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

describe("isCommitShaReusedAcrossRepos", () => {
  it("returns true when the same commit sha appears in both lists", () => {
    expect(isCommitShaReusedAcrossRepos([run("abc")], [run("abc")])).toBe(true);
  });

  it("returns false when the lists don't overlap", () => {
    expect(isCommitShaReusedAcrossRepos([run("abc")], [run("def")])).toBe(false);
  });
});
