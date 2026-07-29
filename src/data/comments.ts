import { useQuery } from "@tanstack/react-query";

import * as apiClient from "../mocks/api-client";
import type { CommentFilters } from "../types/comment";
import { queryKeys } from "./query-keys";

const STALE_TIME_MS = 60_000;

export function useComments(repoId: string, filters: CommentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.comments(repoId, filters),
    queryFn: () => apiClient.listComments(repoId, filters),
    staleTime: STALE_TIME_MS,
  });
}
