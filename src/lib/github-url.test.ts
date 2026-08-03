import { describe, expect, it } from "vitest";

import { pullRequestUrl } from "./github-url";

describe("pullRequestUrl", () => {
  it("combines fullName and prNumber into a GitHub PR URL", () => {
    expect(pullRequestUrl("Natan-Lucena/bella-reviewer-api", 142)).toBe(
      "https://github.com/Natan-Lucena/bella-reviewer-api/pull/142",
    );
  });
});
