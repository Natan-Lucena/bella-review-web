import { describe, expect, it } from "vitest";

import type { Repo } from "../types/repo";
import { findRepoByFullName } from "./find-repo-by-full-name";

function repo(fullName: string): Repo {
  return {
    id: `repo-${fullName}`,
    fullName,
    active: true,
    configComplete: true,
    llmProvider: "Gemini",
    model: "gemini-2.5-flash",
  };
}

describe("findRepoByFullName", () => {
  it("returns the repo with the matching full name", () => {
    const repos = [repo("org/a"), repo("org/b")];
    expect(findRepoByFullName(repos, "org/b")).toBe(repos[1]);
  });

  it("returns undefined when no repo matches", () => {
    expect(findRepoByFullName([repo("org/a")], "org/z")).toBeUndefined();
  });
});
