import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../mocks/api-client";
import { createQueryWrapper } from "../test/query-client-wrapper";
import { useComments } from "./comments";

beforeEach(() => {
  resetMockData();
});

describe("useComments", () => {
  it("loads comments for a repo", async () => {
    const { result } = renderHook(() => useComments("repo-bella-api"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBeGreaterThan(20);
  });

  it("re-fetches when the severity filter changes", async () => {
    const wrapper = createQueryWrapper();
    const { result, rerender } = renderHook(
      ({ severity }) => useComments("repo-bella-api", severity ? { severity } : {}),
      { wrapper, initialProps: { severity: undefined as "critical" | undefined } },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ severity: "critical" });
    await waitFor(() =>
      expect(
        result.current.data?.comments.every((comment) => comment.severity === "critical"),
      ).toBe(true),
    );
  });

  it("returns an empty list for a repo with no comments yet", async () => {
    const { result } = renderHook(() => useComments("repo-bella-action"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.comments).toEqual([]);
  });
});
