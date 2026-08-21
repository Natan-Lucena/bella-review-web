import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UpdatePromptInput } from "../types/prompt";
import { apiClient } from "./api-client";
import { useInvalidateRepos } from "./repos";
import { queryKeys } from "./query-keys";

const STALE_TIME_MS = 60_000;

export function usePrompts() {
  return useQuery({
    queryKey: queryKeys.prompts(),
    queryFn: () => apiClient.listPrompts(),
    staleTime: STALE_TIME_MS,
  });
}

function useInvalidatePrompts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.prompts() });
}

export function useCreatePrompt() {
  const invalidate = useInvalidatePrompts();
  return useMutation({ mutationFn: apiClient.createPrompt, onSuccess: invalidate });
}

export function useUpdatePrompt(id: string) {
  const invalidate = useInvalidatePrompts();
  return useMutation({
    mutationFn: (patch: UpdatePromptInput) => apiClient.updatePrompt(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeletePrompt() {
  const invalidatePrompts = useInvalidatePrompts();
  const invalidateRepos = useInvalidateRepos();
  return useMutation({
    mutationFn: (id: string) => apiClient.deletePrompt(id),
    // Único dos três que também precisa invalidar ["repos"]: apagar um
    // prompt aciona o onDelete: SetNull do Postgres direto no backend, sem
    // nenhuma mutation de repositório no meio — diferente de
    // create/update, nada mais revalida esse cache por conta própria.
    onSuccess: () => {
      invalidatePrompts();
      invalidateRepos();
    },
  });
}
