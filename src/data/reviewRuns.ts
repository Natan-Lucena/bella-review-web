import { keepPreviousData, useQuery } from "@tanstack/react-query";

import * as apiClient from "../mocks/api-client";
import type { ReviewRunFilters } from "../types/review-run";
import { queryKeys } from "./query-keys";

const STALE_TIME_MS = 60_000;

// `limit` cresce a cada "carregar mais" e `status` muda com o filtro — os
// dois entram na queryKey (ver query-keys.ts), então cada combinação é um
// cache novo. Sem `keepPreviousData`, `data` voltaria a `undefined` (e a
// tabela inteira sumiria pra um skeleton) a cada clique em "carregar mais",
// já que cada resposta já vem com a lista inteira até aquele limit (não é
// preciso concatenar manualmente no client).
export function useReviewRuns(repoId: string, filters: ReviewRunFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reviewRuns(repoId, filters),
    queryFn: () => apiClient.listReviewRuns(repoId, filters),
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
  });
}

export function useReviewRunDetail(repoId: string, runId: string) {
  return useQuery({
    queryKey: queryKeys.reviewRunDetail(repoId, runId),
    queryFn: () => apiClient.getReviewRunDetail(repoId, runId),
    staleTime: STALE_TIME_MS,
  });
}
