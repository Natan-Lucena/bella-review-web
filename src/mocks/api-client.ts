import type { Comment, CommentFilters, ListCommentsResponse } from "../types/comment";
import type { ActionTokenResponse, Credential, WebhookSecretResponse } from "../types/credential";
import type { Dashboard, DashboardPeriod, DashboardUsage } from "../types/dashboard";
import type { ListReposResponse, Repo, ServiceState } from "../types/repo";
import type { RepoConfig, RepoConfigPatch } from "../types/repo-config";
import type {
  ListReviewRunsResponse,
  ReviewRunDetail,
  ReviewRunFilters,
  ReviewRunSummary,
} from "../types/review-run";
import type { LoginResponse, SignupResponse } from "../types/user";
import { ApiError } from "../lib/api-error";
import { seedRepos, seedUsers } from "./fixtures";
import type { RepoRecord, ReviewRunRecord, SeedUser } from "./fixtures";

// "Backend fake": funções assíncronas que espelham exatamente o formato de
// request/response de cada endpoint documentado em
// ../../frontend-especificacao-telas.md, com latência artificial e um dataset
// em memória mutado pelas mutações. Ver PRD 02 (02-camada-de-acesso-a-dados-mockada.md).
// Nenhum componente de página deve importar este módulo diretamente — sempre
// através de um hook de `src/data/`.

let users: SeedUser[] = structuredClone(seedUsers);
let repos: RepoRecord[] = structuredClone(seedRepos);
let nextRepoSeq = 1;
let secretSeq = 1;

// Só para uso em testes: reinicia o dataset para o estado inicial dos fixtures.
export function resetMockData(): void {
  users = structuredClone(seedUsers);
  repos = structuredClone(seedRepos);
  nextRepoSeq = 1;
  secretSeq = 1;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emptyUsage(): DashboardUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    estimatedCost: null,
    percentageChangeFromPreviousPeriod: null,
  };
}

function generateSecretValue(prefix: string): string {
  secretSeq += 1;
  return `${prefix}_${secretSeq}_${Math.random().toString(36).slice(2, 10)}`;
}

function findRepoOrThrow(repoId: string): RepoRecord {
  const repo = repos.find((r) => r.id === repoId);
  if (!repo) {
    throw new ApiError("repo_not_found");
  }
  return repo;
}

// O backend só considera a configuração "completa" quando as quatro
// credenciais existem (LLM + SCM + token da Action E segredo de webhook) —
// mesmo os dois últimos sendo caminhos alternativos de disparo na prática
// (ver frontend-especificacao-telas.md, "Notas para produto/design", item 1).
// O mock reproduz essa regra tal como ela é hoje, não como "deveria ser".
function toRepo(record: RepoRecord): Repo {
  const configComplete =
    record.llmCredential !== null &&
    record.scmCredential !== null &&
    record.actionTokenGenerated &&
    record.webhookSecretGenerated;

  // Mais permissivo que `configComplete`: um repositório configurado só com a
  // Action (sem webhook) é plenamente funcional, não "incompleto" — ver
  // frontend-especificacao-telas.md, Tela 4, nota sobre `configComplete`, e
  // Repo.readyForReview.
  const readyForReview =
    record.llmCredential !== null &&
    record.scmCredential !== null &&
    (record.actionTokenGenerated || record.webhookSecretGenerated);

  return {
    id: record.id,
    fullName: record.fullName,
    active: record.active,
    configComplete,
    readyForReview,
    llmProvider: record.llmCredential?.provider ?? "",
    model: record.llmCredential ? record.config.model : "",
  };
}

function toServiceState(record: RepoRecord): ServiceState {
  if (!record.active) {
    return "inactive";
  }
  return toRepo(record).configComplete ? "active" : "configuration_pending";
}

function totalTokensForRun(run: ReviewRunRecord): number {
  return run.turns.reduce(
    (sum, turn) => sum + turn.inputTokens + turn.outputTokens + turn.reasoningTokens,
    0,
  );
}

function publishedCommentCountForRun(repo: RepoRecord, runId: string): number {
  return repo.comments.filter(
    (comment) => comment.reviewRunId === runId && comment.status === "published",
  ).length;
}

function toReviewRunSummary(repo: RepoRecord, run: ReviewRunRecord): ReviewRunSummary {
  return {
    id: run.id,
    prNumber: run.prNumber,
    commitSha: run.commitSha,
    trigger: run.trigger,
    status: run.status,
    errorReason: run.errorReason,
    durationMs: run.durationMs,
    commentCount: publishedCommentCountForRun(repo, run.id),
    totalTokens: totalTokensForRun(run),
    startedAt: run.startedAt,
    completedAt: run.completedAt,
  };
}

export async function signup(email: string, password: string): Promise<SignupResponse> {
  await delay(400);
  const alreadyExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
  if (alreadyExists) {
    throw new ApiError("email_already_registered");
  }
  const user: SeedUser = { id: `user-${users.length + 1}`, email, password };
  users.push(user);
  return { id: user.id, email: user.email, createdAt: new Date().toISOString() };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  await delay(400);
  const user = users.find(
    (candidate) =>
      candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password,
  );
  if (!user) {
    throw new ApiError("invalid_credentials");
  }
  return { id: user.id, email: user.email };
}

export async function listRepos(): Promise<ListReposResponse> {
  await delay(300);
  return { repos: repos.map(toRepo) };
}

// O backend não verifica duplicidade nem existência real no GitHub — esta
// função nunca rejeita (ver frontend-especificacao-telas.md, Tela 5, Passo 1).
export async function createRepo(fullName: string): Promise<Repo> {
  await delay(500);
  const record: RepoRecord = {
    id: `repo-created-${nextRepoSeq++}`,
    fullName,
    active: true,
    llmCredential: null,
    scmCredential: null,
    actionTokenGenerated: false,
    webhookSecretGenerated: false,
    config: {
      model: "gemini-2.5-flash",
      tokenLimit: 100000,
      temperature: 0.2,
      enabledCategories: [],
    },
    dashboardUsageByPeriod: { "7d": emptyUsage(), "30d": emptyUsage(), "90d": emptyUsage() },
    reviewRuns: [],
    comments: [],
  };
  repos.push(record);
  return toRepo(record);
}

export async function setLlmCredential(repoId: string, apiKey: string): Promise<Credential> {
  await delay(500);
  const repo = findRepoOrThrow(repoId);
  if (!apiKey) {
    throw new ApiError("validation_error", "apiKey is required");
  }
  const now = new Date().toISOString();
  const credential: Credential = {
    type: "llm",
    provider: "Gemini",
    configured: true,
    lastValidatedAt: now,
    updatedAt: now,
  };
  repo.llmCredential = credential;
  return credential;
}

export async function setScmCredential(repoId: string, pat: string): Promise<Credential> {
  await delay(500);
  const repo = findRepoOrThrow(repoId);
  if (!pat) {
    throw new ApiError("validation_error", "pat is required");
  }
  const now = new Date().toISOString();
  const credential: Credential = {
    type: "scm",
    provider: "GitHub",
    configured: true,
    lastValidatedAt: now,
    updatedAt: now,
  };
  repo.scmCredential = credential;
  return credential;
}

// Gera uma string nova a cada chamada — nunca reaproveita a anterior (rotação real).
export async function generateActionToken(repoId: string): Promise<ActionTokenResponse> {
  await delay(500);
  const repo = findRepoOrThrow(repoId);
  repo.actionTokenGenerated = true;
  return {
    type: "action_token",
    token: generateSecretValue("bella_at"),
    warning:
      "This value cannot be retrieved again. Save it as the BELLA_TOKEN secret in your GitHub Actions workflow.",
  };
}

export async function generateWebhookSecret(repoId: string): Promise<WebhookSecretResponse> {
  await delay(500);
  const repo = findRepoOrThrow(repoId);
  repo.webhookSecretGenerated = true;
  return {
    type: "webhook_secret",
    secret: generateSecretValue("bella_whs"),
    webhookUrl: "https://bella-reviewer-api.vercel.app/webhooks/github",
    warning:
      "This value cannot be retrieved again. Configure it on GitHub under Settings > Webhooks, along with the URL above.",
  };
}

// Patch parcial de verdade — mescla com o config existente, não substitui.
export async function updateRepoConfig(
  repoId: string,
  patch: RepoConfigPatch,
): Promise<RepoConfig> {
  await delay(400);
  const repo = findRepoOrThrow(repoId);
  repo.config = { ...repo.config, ...patch };
  return repo.config;
}

export async function getDashboard(repoId: string, period: DashboardPeriod): Promise<Dashboard> {
  await delay(350);
  const repo = findRepoOrThrow(repoId);
  return {
    repo: { id: repo.id, fullName: repo.fullName, serviceState: toServiceState(repo) },
    period,
    usage: repo.dashboardUsageByPeriod[period],
    activeLlmProvider: repo.llmCredential?.provider ?? "",
    activeModel: repo.llmCredential ? repo.config.model : "",
  };
}

export async function listReviewRuns(
  repoId: string,
  filters: ReviewRunFilters = {},
): Promise<ListReviewRunsResponse> {
  await delay(350);
  const repo = findRepoOrThrow(repoId);
  const filtered = repo.reviewRuns.filter(
    (run) => !filters.status || run.status === filters.status,
  );
  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 20;
  const page = filtered.slice(offset, offset + limit);
  return { reviewRuns: page.map((run) => toReviewRunSummary(repo, run)), total: filtered.length };
}

export async function getReviewRunDetail(repoId: string, runId: string): Promise<ReviewRunDetail> {
  await delay(300);
  const repo = findRepoOrThrow(repoId);
  const run = repo.reviewRuns.find((candidate) => candidate.id === runId);
  if (!run) {
    throw new ApiError("review_run_not_found");
  }
  return {
    id: run.id,
    prNumber: run.prNumber,
    commitSha: run.commitSha,
    status: run.status,
    errorReason: run.errorReason,
    turns: run.turns,
    comments: repo.comments.filter((comment) => comment.reviewRunId === run.id),
  };
}

export async function listComments(
  repoId: string,
  filters: CommentFilters = {},
): Promise<ListCommentsResponse> {
  await delay(350);
  const repo = findRepoOrThrow(repoId);
  const filtered = repo.comments.filter((comment) => matchesCommentFilters(comment, filters));
  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 20;
  const page = filtered.slice(offset, offset + limit);
  return { comments: page, total: filtered.length };
}

function matchesCommentFilters(comment: Comment, filters: CommentFilters): boolean {
  if (filters.prNumber !== undefined && comment.prNumber !== filters.prNumber) {
    return false;
  }
  if (filters.category !== undefined && comment.category !== filters.category) {
    return false;
  }
  if (filters.severity !== undefined && comment.severity !== filters.severity) {
    return false;
  }
  if (filters.status !== undefined && comment.status !== filters.status) {
    return false;
  }
  return true;
}
