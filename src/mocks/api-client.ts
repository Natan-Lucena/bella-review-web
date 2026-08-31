import type { AcceptanceMetrics } from "../types/acceptance-metrics";
import type { Comment, CommentFilters, ListCommentsResponse } from "../types/comment";
import type { ListCommentRepliesResponse } from "../types/comment-reply";
import type { ActionTokenResponse, Credential, WebhookSecretResponse } from "../types/credential";
import type { Dashboard, DashboardPeriod, DashboardUsage } from "../types/dashboard";
import type {
  GithubRepoOption,
  InstallActionResult,
  ListGithubReposResponse,
} from "../types/github";
import type { LlmProvider } from "../types/llm-provider";
import type {
  CreatePromptInput,
  ListPromptsResponse,
  Prompt,
  UpdatePromptInput,
} from "../types/prompt";
import type { ListReposResponse, Repo, ServiceState } from "../types/repo";
import type { RepoConfig, RepoConfigPatch } from "../types/repo-config";
import type {
  ListReviewRunsResponse,
  ReviewRunComment,
  ReviewRunDetail,
  ReviewRunFilters,
  ReviewRunSummary,
} from "../types/review-run";
import type { LoginResponse, SignupResponse, User } from "../types/user";
import { ApiError } from "../lib/api-error";
import { getDefaultModelForProvider } from "../lib/llm-provider-catalog";
import { seedPrompts, seedRepos, seedUsers } from "./fixtures";
import type { PromptRecord, RepoRecord, ReviewRunRecord, SeedUser } from "./fixtures";

// "Backend fake": funções assíncronas que espelham exatamente o formato de
// request/response de cada endpoint documentado em
// ../../frontend-especificacao-telas.md, com latência artificial e um dataset
// em memória mutado pelas mutações. Ver PRD 02 (02-camada-de-acesso-a-dados-mockada.md).
// Nenhum componente de página deve importar este módulo diretamente — sempre
// através de um hook de `src/data/`.

let users: SeedUser[] = structuredClone(seedUsers);
let repos: RepoRecord[] = structuredClone(seedRepos);
let prompts: PromptRecord[] = structuredClone(seedPrompts);
let nextRepoSeq = 1;
let nextPromptSeq = 1;
let secretSeq = 1;
// "Sessão" da Fase 1: o real usa um cookie httpOnly que o navegador manda
// sozinho; aqui é só esse id em memória de módulo, setado por login() e lido
// por getCurrentUser() — o suficiente pra SessionProvider (Fase 2) tratar os
// dois clientes de forma idêntica via GET /auth/me. Ver PRD da Fase 2.
let currentUserId: string | null = null;

// Só para uso em testes: reinicia o dataset para o estado inicial dos fixtures.
export function resetMockData(): void {
  users = structuredClone(seedUsers);
  repos = structuredClone(seedRepos);
  prompts = structuredClone(seedPrompts);
  nextRepoSeq = 1;
  nextPromptSeq = 1;
  secretSeq = 1;
  currentUserId = null;
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

function emptyAcceptanceMetrics(): AcceptanceMetrics {
  return {
    applyRate: { value: null, decidedCount: 0, appliedCount: 0 },
    applyRateByCategory: [],
    applyRateBySeverity: [],
    coverage: { actionableCount: 0, observationCount: 0, actionableShare: null },
    costPerAppliedSuggestion: null,
    previousPeriod: { applyRate: { value: null }, costPerAppliedSuggestion: null },
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

// Prompt é escopado por usuário (ver PRD 27, seção 1) — toda função de
// prompts precisa da sessão mock atual, mesmo padrão de getCurrentUser().
function requireCurrentUserId(): string {
  if (!currentUserId) {
    throw new ApiError("not_authenticated");
  }
  return currentUserId;
}

function toPrompt(record: PromptRecord): Prompt {
  return {
    id: record.id,
    name: record.name,
    content: record.content,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// Não encontrado e não-dono devolvem o mesmo erro, mesmo raciocínio de
// findRepoOrThrow / do use case real (ver PRD 27, seção 4) — nunca confirma
// existência a quem não é dono.
function findPromptOrThrow(id: string, userId: string): PromptRecord {
  const prompt = prompts.find((candidate) => candidate.id === id && candidate.userId === userId);
  if (!prompt) {
    throw new ApiError("prompt_not_found");
  }
  return prompt;
}

// O backend só considera a configuração "completa" quando as quatro
// credenciais existem (LLM + SCM + token da Action E segredo de webhook) —
// mesmo os dois últimos sendo caminhos alternativos de disparo na prática
// (ver frontend-especificacao-telas.md, "Notas para produto/design", item 1).
// O mock reproduz essa regra tal como ela é hoje, não como "deveria ser".
function toRepo(record: RepoRecord): Repo {
  const hasCoreCredentials = record.llmCredential !== null && record.scmCredential !== null;
  const configComplete =
    hasCoreCredentials && record.actionTokenGenerated && record.webhookSecretGenerated;

  return {
    id: record.id,
    fullName: record.fullName,
    active: record.active,
    configComplete,
    // Vem de RepoConfig, não de Credential — igual ao backend real
    // (RepoConfig.llmProvider sempre existe, com default "gemini", desde a
    // criação do repo, independente de já haver credencial salva ou não).
    llmProvider: record.config.llmProvider,
    model: record.llmCredential ? record.config.model : "",
    promptId: record.config.promptId,
    reviewLanguage: record.config.reviewLanguage,
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

// Espelha o shape mais estreito que GET .../review-runs/:runId de fato
// devolve pros comentários embutidos (sem createdAt/reviewRunId/prNumber) —
// ver types/review-run.ts, ReviewRunComment.
function toReviewRunComment(comment: Comment): ReviewRunComment {
  return {
    id: comment.id,
    file: comment.file,
    line: comment.line,
    category: comment.category,
    severity: comment.severity,
    body: comment.body,
    status: comment.status,
    externalId: comment.externalId,
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
  currentUserId = user.id;
  return { id: user.id, email: user.email };
}

export async function getCurrentUser(): Promise<User> {
  await delay(200);
  const user = currentUserId ? users.find((candidate) => candidate.id === currentUserId) : null;
  if (!user) {
    throw new ApiError("not_authenticated");
  }
  return { id: user.id, email: user.email };
}

export async function listRepos(): Promise<ListReposResponse> {
  await delay(300);
  return { repos: repos.map(toRepo) };
}

// O backend não verifica duplicidade nem existência real no GitHub — esta
// função nunca rejeita (ver frontend-especificacao-telas.md, Tela 5, Passo 1).
// Tipo de retorno é só `{ id }` de propósito, não `Repo` — o real `POST
// /repos` devolve um shape bem diferente do item de `GET /repos` (sem
// configComplete/llmProvider/model), e `.id` é a única coisa que quem chama
// isto (o wizard) de fato usa. Ver PRD da Fase 2.
export async function createRepo(fullName: string): Promise<{ id: string }> {
  await delay(500);
  const record: RepoRecord = {
    id: `repo-created-${nextRepoSeq++}`,
    fullName,
    active: true,
    llmCredential: null,
    scmCredential: null,
    actionTokenGenerated: false,
    webhookSecretGenerated: false,
    actionTokenGeneratedAt: null,
    webhookSecretGeneratedAt: null,
    config: {
      llmProvider: "gemini",
      model: "gemini-2.5-flash",
      tokenLimit: 100000,
      temperature: 0.2,
      enabledCategories: [],
      promptId: null,
      reviewLanguage: "en",
    },
    dashboardUsageByPeriod: { "7d": emptyUsage(), "30d": emptyUsage(), "90d": emptyUsage() },
    acceptanceMetricsByPeriod: {
      "7d": emptyAcceptanceMetrics(),
      "30d": emptyAcceptanceMetrics(),
      "90d": emptyAcceptanceMetrics(),
    },
    reviewRuns: [],
    comments: [],
    commentRepliesByCommentId: {},
  };
  repos.push(record);
  return toRepo(record);
}

export async function setLlmCredential(
  repoId: string,
  params: { provider: LlmProvider; apiKey: string },
): Promise<Credential> {
  await delay(500);
  const repo = findRepoOrThrow(repoId);
  if (!params.apiKey) {
    throw new ApiError("validation_error", "apiKey is required");
  }
  const now = new Date().toISOString();
  const credential: Credential = {
    type: "llm",
    provider: params.provider,
    configured: true,
    lastValidatedAt: now,
    updatedAt: now,
  };
  repo.llmCredential = credential;
  // Mesmo comportamento do SetLlmCredentialUseCase real
  // (backend-prds/25-...md): configurar a credencial LLM é o que muda o
  // provedor ativo, e o modelo cai pro default do catálogo do provedor novo.
  repo.config.llmProvider = params.provider;
  repo.config.model = getDefaultModelForProvider(params.provider);
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

// Fixture fixa (Fase 1) — na vida real vem de GET /user/repos, com o PAT que o
// usuário acabou de colar; o mock nem confere se o pat "funciona" de verdade,
// só se ele foi informado. Os dois primeiros nomes propositalmente coincidem
// com repositórios do dataset seed (repo-bella-api/repo-bella-action), pra
// exercitar `alreadyAdded: true` sem depender de um repo criado nesta sessão.
const GITHUB_REPO_FIXTURES: Array<Omit<GithubRepoOption, "alreadyAdded">> = [
  { fullName: "Natan-Lucena/bella-reviewer-api", private: true, defaultBranch: "main" },
  { fullName: "Natan-Lucena/bella-review-action", private: false, defaultBranch: "main" },
  { fullName: "Natan-Lucena/side-project", private: false, defaultBranch: "main" },
  { fullName: "minha-org/outro-repositorio", private: true, defaultBranch: "trunk" },
];

export async function listGithubRepos(pat: string): Promise<ListGithubReposResponse> {
  await delay(500);
  if (!pat) {
    throw new ApiError("validation_error", "pat is required");
  }
  return {
    repos: GITHUB_REPO_FIXTURES.map((repo) => ({
      ...repo,
      alreadyAdded: repos.some((existing) => existing.fullName === repo.fullName),
    })),
  };
}

export async function installAction(repoId: string, pat: string): Promise<InstallActionResult> {
  await delay(700);
  const repo = findRepoOrThrow(repoId);
  if (!pat) {
    throw new ApiError("validation_error", "pat is required");
  }
  return { prUrl: `https://github.com/${repo.fullName}/pull/1` };
}

// Gera uma string nova a cada chamada — nunca reaproveita a anterior (rotação real).
export async function generateActionToken(repoId: string): Promise<ActionTokenResponse> {
  await delay(500);
  const repo = findRepoOrThrow(repoId);
  repo.actionTokenGenerated = true;
  repo.actionTokenGeneratedAt = new Date().toISOString();
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
  repo.webhookSecretGeneratedAt = new Date().toISOString();
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
    period,
    usage: repo.dashboardUsageByPeriod[period],
    // Vem de RepoConfig, não de Credential — mesmo racional de toRepo()
    // acima (RepoConfig.llmProvider sempre existe, com default "gemini").
    activeLlmProvider: repo.config.llmProvider,
    activeModel: repo.llmCredential ? repo.config.model : "",
    serviceState: toServiceState(repo),
  };
}

export async function getAcceptanceMetrics(
  repoId: string,
  period: DashboardPeriod,
): Promise<AcceptanceMetrics> {
  await delay(350);
  return findRepoOrThrow(repoId).acceptanceMetricsByPeriod[period];
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
    comments: repo.comments
      .filter((comment) => comment.reviewRunId === run.id)
      .map(toReviewRunComment),
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
  // Categoria é texto livre (não um enum fechado, ao contrário de severity/
  // status abaixo) — substring case-insensitive, não igualdade exata, senão
  // digitar "sec" nunca acharia "security" até a palavra inteira ser
  // completada. Ver frontend-especificacao-telas.md, Tela 10.
  if (
    filters.category !== undefined &&
    !comment.category.toLowerCase().includes(filters.category.toLowerCase())
  ) {
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

// Comentário sem entrada em commentRepliesByCommentId (a maioria) devolve
// lista vazia em vez de 404 — a existência do próprio comentário não é
// verificada aqui (não há endpoint de detalhe de comentário na PRD 21).
export async function listCommentReplies(
  repoId: string,
  commentId: string,
): Promise<ListCommentRepliesResponse> {
  await delay(300);
  const repo = findRepoOrThrow(repoId);
  return { replies: repo.commentRepliesByCommentId[commentId] ?? [] };
}

export async function listPrompts(): Promise<ListPromptsResponse> {
  await delay(300);
  const userId = requireCurrentUserId();
  return { prompts: prompts.filter((prompt) => prompt.userId === userId).map(toPrompt) };
}

// Replica a checagem de nome duplicado do backend (mesmo comparação exata,
// case-sensitive) — 409 prompt_name_already_exists, mesmo ApiError já usado
// nos outros pontos do mock (ex.: email_already_registered em signup()).
export async function createPrompt(input: CreatePromptInput): Promise<Prompt> {
  await delay(400);
  const userId = requireCurrentUserId();
  const alreadyExists = prompts.some(
    (prompt) => prompt.userId === userId && prompt.name === input.name,
  );
  if (alreadyExists) {
    throw new ApiError("prompt_name_already_exists");
  }
  const now = new Date().toISOString();
  const record: PromptRecord = {
    id: `prompt-created-${nextPromptSeq++}`,
    userId,
    name: input.name,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  };
  prompts.push(record);
  return toPrompt(record);
}

export async function updatePrompt(id: string, patch: UpdatePromptInput): Promise<Prompt> {
  await delay(400);
  const userId = requireCurrentUserId();
  const record = findPromptOrThrow(id, userId);
  if (patch.name !== undefined) {
    const duplicate = prompts.some(
      (prompt) => prompt.userId === userId && prompt.name === patch.name && prompt.id !== id,
    );
    if (duplicate) {
      throw new ApiError("prompt_name_already_exists");
    }
  }
  record.name = patch.name ?? record.name;
  record.content = patch.content ?? record.content;
  record.updatedAt = new Date().toISOString();
  return toPrompt(record);
}

// Simula onDelete: SetNull do backend (ver PRD 27, seção 1) — qualquer
// RepoRecord cujo config.promptId apontava para este prompt volta para
// null, sem código de aplicação real no Postgres (a constraint faz isso
// sozinha lá); aqui precisa ser feito à mão.
export async function deletePrompt(id: string): Promise<void> {
  await delay(400);
  const userId = requireCurrentUserId();
  const record = findPromptOrThrow(id, userId);
  prompts = prompts.filter((prompt) => prompt.id !== record.id);
  for (const repo of repos) {
    if (repo.config.promptId === record.id) {
      repo.config = { ...repo.config, promptId: null };
    }
  }
}
