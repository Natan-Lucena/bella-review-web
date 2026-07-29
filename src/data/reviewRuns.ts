import { useQuery } from "@tanstack/react-query";

import * as apiClient from "../mocks/api-client";
import type { ReviewRunFilters } from "../types/review-run";
import { queryKeys } from "./query-keys";

const STALE_TIME_MS = 60_000;

export function useReviewRuns(repoId: string, filters: ReviewRunFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reviewRuns(repoId, filters),
    queryFn: () => apiClient.listReviewRuns(repoId, filters),
    staleTime: STALE_TIME_MS,
  });
}

export function useReviewRunDetail(repoId: string, runId: string) {
  return useQuery({
    queryKey: queryKeys.reviewRunDetail(repoId, runId),
    queryFn: () => apiClient.getReviewRunDetail(repoId, runId),
    staleTime: STALE_TIME_MS,
  });
}
