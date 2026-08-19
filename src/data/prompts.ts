import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UpdatePromptInput } from "../types/prompt";
import { apiClient } from "./api-client";
import { queryKeys } from "./query-keys";

export function usePrompts() {
  return useQuery({ queryKey: queryKeys.prompts(), queryFn: () => apiClient.listPrompts() });
}

// Deletar/atualizar um prompt não invalida ["repos"] — a lista de
// repositórios não muda por causa disso (só promptId de algum RepoConfig
// pode mudar, no caso do delete, e a tela de Configurações já revalida via a
// própria mutation de updateRepoConfig). Ver PRD 19, seção 5.
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
  const invalidate = useInvalidatePrompts();
  return useMutation({ mutationFn: apiClient.deletePrompt, onSuccess: invalidate });
}
