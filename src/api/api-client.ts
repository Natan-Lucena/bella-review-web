import type { AcceptanceMetrics } from "../types/acceptance-metrics";
import type { CommentFilters, ListCommentsResponse } from "../types/comment";
import type { ActionTokenResponse, Credential, WebhookSecretResponse } from "../types/credential";
import type { Dashboard, DashboardPeriod } from "../types/dashboard";
import type { InstallActionResult, ListGithubReposResponse } from "../types/github";
import type { LlmProvider } from "../types/llm-provider";
import type { ListReposResponse } from "../types/repo";
import type { RepoConfig, RepoConfigPatch } from "../types/repo-config";
import type {
  ListReviewRunsResponse,
  ReviewRunDetail,
  ReviewRunFilters,
} from "../types/review-run";
import type { LoginResponse, SignupResponse, User } from "../types/user";
import { request } from "./http-client";

// Cliente real da Fase 2 — mesma lista de funções (mesma assinatura) que
// src/mocks/api-client.ts, cada uma batendo no endpoint real documentado em
// backend-prds/*.md. Nenhuma tela importa isto diretamente — sempre via
// src/data/api-client.ts (o barrel que decide mock vs. real). Sem
// `resetMockData` (não existe fora de teste) nem `getRepoSettings` (não
// existe no backend — ver PRD da Fase 2, "Tela 6 escreve às cegas").

export function signup(email: string, password: string): Promise<SignupResponse> {
  return request("/auth/signup", { method: "POST", body: { email, password } });
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return request("/auth/login", { method: "POST", body: { email, password } });
}

export function getCurrentUser(): Promise<User> {
  return request("/auth/me");
}

export function listRepos(): Promise<ListReposResponse> {
  return request("/repos");
}

// O backend devolve um shape bem diferente do item de GET /repos (sem
// configComplete/llmProvider/model, com um `config` aninhado) — só `.id`
// importa pra quem chama (o wizard usa isso pra montar as próximas chamadas).
export function createRepo(fullName: string): Promise<{ id: string }> {
  return request("/repos", { method: "POST", body: { fullName } });
}

export function setLlmCredential(
  repoId: string,
  params: { provider: LlmProvider; apiKey: string },
): Promise<Credential> {
  return request(`/repos/${repoId}/credentials/llm`, { method: "POST", body: params });
}

export function setScmCredential(repoId: string, pat: string): Promise<Credential> {
  return request(`/repos/${repoId}/credentials/scm`, { method: "POST", body: { pat } });
}

// Onboarding-only: o pat nunca é persistido por essas duas chamadas — só
// pelo setScmCredential acima, quando o usuário de fato confirma o passo de
// credencial SCM do wizard. Ver backend-prds/15-....md.
export function listGithubRepos(pat: string): Promise<ListGithubReposResponse> {
  return request("/github/repos", { method: "POST", body: { pat } });
}

export function installAction(repoId: string, pat: string): Promise<InstallActionResult> {
  return request(`/repos/${repoId}/install-action`, { method: "POST", body: { pat } });
}

export function generateActionToken(repoId: string): Promise<ActionTokenResponse> {
  return request(`/repos/${repoId}/action-token`, { method: "POST" });
}

export function generateWebhookSecret(repoId: string): Promise<WebhookSecretResponse> {
  return request(`/repos/${repoId}/webhook-secret`, { method: "POST" });
}

export function updateRepoConfig(repoId: string, patch: RepoConfigPatch): Promise<RepoConfig> {
  return request(`/repos/${repoId}/config`, { method: "PATCH", body: patch });
}

export function getDashboard(repoId: string, period: DashboardPeriod): Promise<Dashboard> {
  return request(`/repos/${repoId}/dashboard`, { query: { period } });
}

export function getAcceptanceMetrics(
  repoId: string,
  period: DashboardPeriod,
): Promise<AcceptanceMetrics> {
  return request(`/repos/${repoId}/acceptance-metrics`, { query: { period } });
}

export function listReviewRuns(
  repoId: string,
  filters: ReviewRunFilters = {},
): Promise<ListReviewRunsResponse> {
  return request(`/repos/${repoId}/review-runs`, { query: filters });
}

export function getReviewRunDetail(repoId: string, runId: string): Promise<ReviewRunDetail> {
  return request(`/repos/${repoId}/review-runs/${runId}`);
}

export function listComments(
  repoId: string,
  filters: CommentFilters = {},
): Promise<ListCommentsResponse> {
  return request(`/repos/${repoId}/comments`, { query: filters });
}
