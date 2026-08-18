import { describe, expect, it } from "vitest";

import { GITHUB_TOKEN_URL, pullRequestUrl } from "./github-url";

describe("pullRequestUrl", () => {
  it("combines fullName and prNumber into a GitHub PR URL", () => {
    expect(pullRequestUrl("Natan-Lucena/bella-reviewer-api", 142)).toBe(
      "https://github.com/Natan-Lucena/bella-reviewer-api/pull/142",
    );
  });
});

describe("GITHUB_TOKEN_URL", () => {
  it("points to the classic PAT creation page with 'repo' and 'workflow' scopes pre-selected", () => {
    expect(GITHUB_TOKEN_URL).toBe(
      "https://github.com/settings/tokens/new?description=Bella+Reviewer&scopes=repo,workflow",
    );
  });
});
