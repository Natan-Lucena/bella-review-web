import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../mocks/api-client";
import { createQueryWrapper } from "../test/query-client-wrapper";
import { useReviewRunDetail, useReviewRuns } from "./reviewRuns";

beforeEach(() => {
  resetMockData();
});

describe("useReviewRuns", () => {
  it("re-fetches when the status filter changes (queryKey includes the filters)", async () => {
    const wrapper = createQueryWrapper();
    const { result, rerender } = renderHook(
      ({ status }) => useReviewRuns("repo-bella-api", status ? { status } : {}),
      { wrapper, initialProps: { status: undefined as "failed" | undefined } },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const allCount = result.current.data?.reviewRuns.length ?? 0;

    rerender({ status: "failed" });
    await waitFor(() =>
      expect(result.current.data?.reviewRuns.every((run) => run.status === "failed")).toBe(true),
    );
    expect(result.current.data?.reviewRuns.length).toBeLessThan(allCount);
  });
});

describe("useReviewRunDetail", () => {
  it("loads the run detail with its turns and comments", async () => {
    const { result } = renderHook(() => useReviewRunDetail("repo-bella-api", "run-bella-api-1"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.turns).toHaveLength(1);
  });

  it("surfaces review_run_not_found as an error for an unknown run", async () => {
    const { result } = renderHook(() => useReviewRunDetail("repo-bella-api", "does-not-exist"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ code: "review_run_not_found" });
  });
});
