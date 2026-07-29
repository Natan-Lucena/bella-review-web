import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as apiClient from "../mocks/api-client";
import type { RepoConfigPatch } from "../types/repo-config";
import { queryKeys } from "./query-keys";

const STALE_TIME_MS = 60_000;

export function useRepos() {
  return useQuery({
    queryKey: queryKeys.repos(),
    queryFn: () => apiClient.listRepos(),
    staleTime: STALE_TIME_MS,
  });
}

// Não existe GET /repos/:id na API real ainda (ver frontend-especificacao-telas.md,
// "Notas para produto/design", item 3) — montado por composição client-side a
// partir de useRepos(). A Fase 2 vai precisar decidir se cria o endpoint
// dedicado ou mantém essa composição.
export function useRepo(repoId: string) {
  const query = useRepos();
  return { ...query, data: query.data?.repos.find((repo) => repo.id === repoId) };
}

// Todas as mutations de repositório invalidam ["repos"] inteiro ao suceder —
// a Fase 1 não tem granularidade fina (a Fase 2 pode refinar).
function useInvalidateRepos() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.repos() });
}

export function useCreateRepo() {
  const invalidateRepos = useInvalidateRepos();
  return useMutation({
    mutationFn: (fullName: string) => apiClient.createRepo(fullName),
    onSuccess: invalidateRepos,
  });
}

export function useSetLlmCredential(repoId: string) {
  const invalidateRepos = useInvalidateRepos();
  return useMutation({
    mutationFn: (apiKey: string) => apiClient.setLlmCredential(repoId, apiKey),
    onSuccess: invalidateRepos,
  });
}

export function useSetScmCredential(repoId: string) {
  const invalidateRepos = useInvalidateRepos();
  return useMutation({
    mutationFn: (pat: string) => apiClient.setScmCredential(repoId, pat),
    onSuccess: invalidateRepos,
  });
}

export function useGenerateActionToken(repoId: string) {
  const invalidateRepos = useInvalidateRepos();
  return useMutation({
    mutationFn: () => apiClient.generateActionToken(repoId),
    onSuccess: invalidateRepos,
  });
}

export function useGenerateWebhookSecret(repoId: string) {
  const invalidateRepos = useInvalidateRepos();
  return useMutation({
    mutationFn: () => apiClient.generateWebhookSecret(repoId),
    onSuccess: invalidateRepos,
  });
}

export function useUpdateRepoConfig(repoId: string) {
  const invalidateRepos = useInvalidateRepos();
  return useMutation({
    mutationFn: (patch: RepoConfigPatch) => apiClient.updateRepoConfig(repoId, patch),
    onSuccess: invalidateRepos,
  });
}
