import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../mocks/api-client";
import { createQueryWrapper, trackQueryResult } from "../test/query-client-wrapper";
import {
  useCreateRepo,
  useGenerateActionToken,
  useGenerateWebhookSecret,
  useRepo,
  useRepos,
  useSetLlmCredential,
  useSetScmCredential,
} from "./repos";

beforeEach(() => {
  resetMockData();
});

describe("useRepos", () => {
  it("loads the seeded repos via a real useQuery", async () => {
    const { result } = renderHook(() => useRepos(), { wrapper: createQueryWrapper() });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.repos.map((repo) => repo.id)).toContain("repo-bella-api");
  });
});

describe("useRepo", () => {
  it("derives a single repo from useRepos by id", async () => {
    const { result } = renderHook(() => useRepo("repo-bella-web"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.fullName).toBe("Natan-Lucena/bella-review-web");
  });

  it("returns undefined data for an id that does not exist", async () => {
    const { result } = renderHook(() => useRepo("repo-does-not-exist"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe("useCreateRepo", () => {
  it("invalidates the repos list so the new repo shows up afterwards", async () => {
    const wrapper = createQueryWrapper();
    const { result: reposResult } = renderHook(() => trackQueryResult(useRepos()), { wrapper });
    await waitFor(() => expect(reposResult.current.isSuccess).toBe(true));
    const initialCount = reposResult.current.data?.repos.length ?? 0;

    const { result: mutationResult } = renderHook(() => useCreateRepo(), { wrapper });
    mutationResult.current.mutate("org/novo-repo");
    await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

    await waitFor(() => expect(reposResult.current.data?.repos.length).toBe(initialCount + 1));
  });
});

describe("credential and token mutations", () => {
  it("resolve with the Credential/token/secret shape returned by the mock", async () => {
    const wrapper = createQueryWrapper();

    const { result: llmResult } = renderHook(() => useSetLlmCredential("repo-bella-action"), {
      wrapper,
    });
    llmResult.current.mutate("gemini-key");
    await waitFor(() => expect(llmResult.current.isSuccess).toBe(true));
    expect(llmResult.current.data).toMatchObject({
      type: "llm",
      provider: "Gemini",
      configured: true,
    });

    const { result: scmResult } = renderHook(() => useSetScmCredential("repo-bella-action"), {
      wrapper,
    });
    scmResult.current.mutate("github-pat");
    await waitFor(() => expect(scmResult.current.isSuccess).toBe(true));
    expect(scmResult.current.data).toMatchObject({
      type: "scm",
      provider: "GitHub",
      configured: true,
    });

    const { result: actionTokenResult } = renderHook(
      () => useGenerateActionToken("repo-bella-action"),
      { wrapper },
    );
    actionTokenResult.current.mutate();
    await waitFor(() => expect(actionTokenResult.current.isSuccess).toBe(true));
    expect(actionTokenResult.current.data).toMatchObject({ type: "action_token" });

    const { result: webhookResult } = renderHook(
      () => useGenerateWebhookSecret("repo-bella-action"),
      { wrapper },
    );
    webhookResult.current.mutate();
    await waitFor(() => expect(webhookResult.current.isSuccess).toBe(true));
    expect(webhookResult.current.data).toMatchObject({
      type: "webhook_secret",
      webhookUrl: "https://bella-reviewer-api.vercel.app/webhooks/github",
    });
  });

  it("invalidates the repos list so useRepos reflects the new credential", async () => {
    const wrapper = createQueryWrapper();
    const { result: reposResult } = renderHook(() => trackQueryResult(useRepos()), { wrapper });
    await waitFor(() => expect(reposResult.current.isSuccess).toBe(true));

    const { result: llmResult } = renderHook(() => useSetLlmCredential("repo-bella-action"), {
      wrapper,
    });
    llmResult.current.mutate("gemini-key");
    await waitFor(() => expect(llmResult.current.isSuccess).toBe(true));

    await waitFor(() =>
      expect(
        reposResult.current.data?.repos.find((repo) => repo.id === "repo-bella-action"),
      ).toMatchObject({
        llmProvider: "Gemini",
      }),
    );
  });
});
