import { useQuery } from "@tanstack/react-query";

import * as apiClient from "../mocks/api-client";
import type { DashboardPeriod } from "../types/dashboard";
import { queryKeys } from "./query-keys";

const STALE_TIME_MS = 60_000;

export function useRepoDashboard(repoId: string, period: DashboardPeriod) {
  return useQuery({
    queryKey: queryKeys.repoDashboard(repoId, period),
    queryFn: () => apiClient.getDashboard(repoId, period),
    staleTime: STALE_TIME_MS,
  });
}
