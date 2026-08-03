import { keepPreviousData, useQuery } from "@tanstack/react-query";

import * as apiClient from "../mocks/api-client";
import type { CommentFilters } from "../types/comment";
import { queryKeys } from "./query-keys";

const STALE_TIME_MS = 60_000;

// keepPreviousData pelo mesmo motivo de useReviewRuns (PRD 09): `limit`
// entra na queryKey, então "carregar mais" (e trocar qualquer filtro) muda
// de cache — sem isso a lista some pra um skeleton a cada mudança em vez de
// atualizar no lugar.
export function useComments(repoId: string, filters: CommentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.comments(repoId, filters),
    queryFn: () => apiClient.listComments(repoId, filters),
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
  });
}
