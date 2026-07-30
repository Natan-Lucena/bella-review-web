import { beforeEach, describe, expect, it } from "vitest";

import { ApiError } from "../lib/api-error";
import {
  createRepo,
  generateActionToken,
  generateWebhookSecret,
  getDashboard,
  getReviewRunDetail,
  listComments,
  listRepos,
  listReviewRuns,
  login,
  resetMockData,
  setLlmCredential,
  setScmCredential,
  signup,
  updateRepoConfig,
} from "./api-client";

beforeEach(() => {
  resetMockData();
});

describe("signup", () => {
  it("creates a new user", async () => {
    const result = await signup("nova@example.com", "senha1234");
    expect(result).toMatchObject({ email: "nova@example.com" });
    expect(result.id).toEqual(expect.any(String));
    expect(result.createdAt).toEqual(expect.any(String));
  });

  it("rejects with email_already_registered for a seeded email", async () => {
    await expect(signup("ana@example.com", "outrasenha")).rejects.toMatchObject({
      code: "email_already_registered",
    } satisfies Partial<ApiError>);
  });
});

describe("login", () => {
  it("succeeds for the seeded user's credentials", async () => {
    const result = await login("ana@example.com", "senha1234");
    expect(result).toEqual({ id: "user-1", email: "ana@example.com" });
  });

  it("rejects with invalid_credentials for a wrong password", async () => {
    await expect(login("ana@example.com", "senha-errada")).rejects.toMatchObject({
      code: "invalid_credentials",
    });
  });

  it("rejects with invalid_credentials for an unknown email", async () => {
    await expect(login("ninguem@example.com", "qualquer")).rejects.toMatchObject({
      code: "invalid_credentials",
    });
  });
});

describe("listRepos", () => {
  it("returns the seeded repos with configComplete computed from the four credentials", async () => {
    const { repos } = await listRepos();
    const bellaApi = repos.find((repo) => repo.id === "repo-bella-api");
    const bellaWeb = repos.find((repo) => repo.id === "repo-bella-web");
    const bellaAction = repos.find((repo) => repo.id === "repo-bella-action");

    expect(bellaApi).toMatchObject({ configComplete: true, readyForReview: true, active: true });
    // Action + LLM + SCM configurados, mas sem webhook secret => configComplete
    // permanece false para sempre (ver frontend-especificacao-telas.md, item 1),
    // mas readyForReview já é true (token da Action cobre o caminho recomendado).
    expect(bellaWeb).toMatchObject({
      configComplete: false,
      readyForReview: true,
      active: true,
      llmProvider: "Gemini",
    });
    expect(bellaAction).toMatchObject({
      configComplete: false,
      readyForReview: false,
      active: false,
      llmProvider: "",
      model: "",
    });
  });
});

describe("createRepo", () => {
  it("never rejects, regardless of the fullName value", async () => {
    const repo = await createRepo("qualquer-coisa sem formato válido");
    expect(repo.fullName).toBe("qualquer-coisa sem formato válido");
    expect(repo.configComplete).toBe(false);
  });

  it("is reflected in a subsequent listRepos call", async () => {
    const created = await createRepo("org/novo-repo");
    const { repos } = await listRepos();
    expect(repos.some((repo) => repo.id === created.id)).toBe(true);
  });
});

describe("credentials and configComplete", () => {
  it("flips configComplete to true only once all four credentials exist", async () => {
    const repo = await createRepo("org/repo-em-configuracao");

    await setLlmCredential(repo.id, "gemini-key");
    await setScmCredential(repo.id, "github-pat");
    await generateActionToken(repo.id);
    let { repos } = await listRepos();
    expect(repos.find((r) => r.id === repo.id)).toMatchObject({ configComplete: false });

    await generateWebhookSecret(repo.id);
    ({ repos } = await listRepos());
    expect(repos.find((r) => r.id === repo.id)).toMatchObject({ configComplete: true });
  });

  it("generates a different token on every call (real rotation)", async () => {
    const repo = await createRepo("org/repo-token");
    const first = await generateActionToken(repo.id);
    const second = await generateActionToken(repo.id);
    expect(first.token).not.toEqual(second.token);
  });
});

describe("updateRepoConfig", () => {
  it("merges a partial patch instead of replacing the whole config", async () => {
    const updated = await updateRepoConfig("repo-bella-api", { temperature: 0.9 });
    expect(updated).toMatchObject({
      temperature: 0.9,
      model: "gemini-2.5-flash",
      enabledCategories: ["security", "performance"],
    });
  });
});

describe("getDashboard", () => {
  it("returns usage that varies by period", async () => {
    const sevenDays = await getDashboard("repo-bella-api", "7d");
    const ninetyDays = await getDashboard("repo-bella-api", "90d");
    expect(sevenDays.usage.inputTokens).not.toEqual(ninetyDays.usage.inputTokens);
  });

  it("reports percentageChangeFromPreviousPeriod as null when there is no prior data", async () => {
    const dashboard = await getDashboard("repo-bella-web", "7d");
    expect(dashboard.usage.percentageChangeFromPreviousPeriod).toBeNull();
  });

  it("reports serviceState 'inactive' for a deactivated repo", async () => {
    const dashboard = await getDashboard("repo-bella-action", "30d");
    expect(dashboard.repo.serviceState).toBe("inactive");
  });

  it("rejects with repo_not_found for an unknown repo id", async () => {
    await expect(getDashboard("repo-does-not-exist", "30d")).rejects.toMatchObject({
      code: "repo_not_found",
    });
  });
});

describe("listReviewRuns", () => {
  it("paginates using limit/offset and reports the total independent of the page", async () => {
    const firstPage = await listReviewRuns("repo-bella-api", { limit: 20, offset: 0 });
    expect(firstPage.reviewRuns).toHaveLength(20);
    expect(firstPage.total).toBeGreaterThan(20);

    const secondPage = await listReviewRuns("repo-bella-api", { limit: 20, offset: 20 });
    expect(secondPage.reviewRuns.length).toBeGreaterThan(0);
  });

  it("filters by status without mutating the total across other statuses", async () => {
    const { reviewRuns, total } = await listReviewRuns("repo-bella-api", { status: "failed" });
    expect(reviewRuns.every((run) => run.status === "failed")).toBe(true);
    expect(total).toBe(reviewRuns.length);
  });

  it("returns an empty list for a repo with no runs yet", async () => {
    const { reviewRuns, total } = await listReviewRuns("repo-bella-action", {});
    expect(reviewRuns).toEqual([]);
    expect(total).toBe(0);
  });
});

describe("getReviewRunDetail", () => {
  it("returns the run's own comments and turns", async () => {
    const detail = await getReviewRunDetail("repo-bella-api", "run-bella-api-1");
    expect(detail.turns).toHaveLength(1);
    expect(detail.comments.every((comment) => comment.reviewRunId === "run-bella-api-1")).toBe(
      true,
    );
  });

  it("rejects with review_run_not_found for an unknown run id", async () => {
    await expect(getReviewRunDetail("repo-bella-api", "run-does-not-exist")).rejects.toMatchObject({
      code: "review_run_not_found",
    });
  });
});

describe("listComments", () => {
  it("paginates and covers more than the default limit for repo-bella-api", async () => {
    const { comments, total } = await listComments("repo-bella-api", {});
    expect(comments).toHaveLength(20);
    expect(total).toBeGreaterThan(20);
  });

  it("filters by severity and status", async () => {
    const { comments } = await listComments("repo-bella-api", {
      severity: "critical",
      status: "published",
    });
    expect(comments.every((c) => c.severity === "critical" && c.status === "published")).toBe(true);
  });

  it("includes at least one generated-but-not-published comment (orphan warning)", async () => {
    const { comments } = await listComments("repo-bella-api", { status: "generated", limit: 24 });
    expect(comments.length).toBeGreaterThan(0);
  });

  it("includes at least one comment with prNumber null", async () => {
    const { comments } = await listComments("repo-bella-api", { limit: 24 });
    expect(comments.some((c) => c.prNumber === null)).toBe(true);
  });
});
