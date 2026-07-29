import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../mocks/api-client";
import { createQueryWrapper } from "../test/query-client-wrapper";
import { useRepoDashboard } from "./dashboard";

beforeEach(() => {
  resetMockData();
});

describe("useRepoDashboard", () => {
  it("re-fetches when the period changes (queryKey includes the period)", async () => {
    const wrapper = createQueryWrapper();
    const { result, rerender } = renderHook(
      ({ period }) => useRepoDashboard("repo-bella-api", period),
      {
        wrapper,
        initialProps: { period: "7d" as const },
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const sevenDayTokens = result.current.data?.usage.inputTokens;

    rerender({ period: "90d" });
    await waitFor(() => expect(result.current.data?.period).toBe("90d"));
    expect(result.current.data?.usage.inputTokens).not.toEqual(sevenDayTokens);
  });
});
