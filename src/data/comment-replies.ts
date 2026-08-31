import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./api-client";
import { queryKeys } from "./query-keys";

const STALE_TIME_MS = 60_000;

// `enabled` é controlado por quem chama — a Tela lista vários comentários de
// uma vez, e não queremos buscar as replies de todos eles simultaneamente;
// só quando um comentário específico é expandido (ver PRD 21).
export function useCommentReplies(repoId: string, commentId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.commentReplies(repoId, commentId),
    queryFn: () => apiClient.listCommentReplies(repoId, commentId),
    staleTime: STALE_TIME_MS,
    enabled,
  });
}
