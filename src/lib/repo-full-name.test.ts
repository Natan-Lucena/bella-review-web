import { describe, expect, it } from "vitest";

import { isValidRepoFullName } from "./repo-full-name";

describe("isValidRepoFullName", () => {
  it.each([
    ["minha-org/meu-repositorio", true],
    ["Natan-Lucena/bella-reviewer-api", true],
    ["  org/repo  ", true],
    ["", false],
    ["sem-barra", false],
    ["org/repo/extra", false],
    ["org com espaco/repo", false],
    ["org/repo com espaco", false],
    ["/repo", false],
    ["org/", false],
  ])("%s -> %s", (value, expected) => {
    expect(isValidRepoFullName(value)).toBe(expected);
  });
});
