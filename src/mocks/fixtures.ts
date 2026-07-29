import type { Comment, CommentSeverity, CommentStatus } from "../types/comment";
import type { Credential } from "../types/credential";
import type { DashboardPeriod, DashboardUsage } from "../types/dashboard";
import type { RepoConfig } from "../types/repo-config";
import type { ReviewRunTrigger, ReviewRunTurn } from "../types/review-run";

// Dataset em memória usado pelo "backend fake" (api-client.ts). Cobre, no
// mínimo, um exemplo de cada estado documentado em
// ../../frontend-especificacao-telas.md (ver PRD 02, "fixtures.ts — dataset
// inicial") — não só o caminho feliz.

export type SeedUser = {
  id: string;
  email: string;
  password: string;
};

export type ReviewRunRecord = {
  id: string;
  prNumber: number;
  commitSha: string;
  trigger: ReviewRunTrigger;
  status: "queued" | "processing" | "completed" | "failed";
  errorReason: string | null;
  durationMs: number | null;
  startedAt: string | null;
  completedAt: string | null;
  turns: ReviewRunTurn[];
};

export type RepoRecord = {
  id: string;
  fullName: string;
  active: boolean;
  llmCredential: Credential | null;
  scmCredential: Credential | null;
  actionTokenGenerated: boolean;
  webhookSecretGenerated: boolean;
  config: RepoConfig;
  dashboardUsageByPeriod: Record<DashboardPeriod, DashboardUsage>;
  reviewRuns: ReviewRunRecord[];
  comments: Comment[];
};

const BASE_DATE = "2026-07-01T12:00:00.000Z";

function isoOffset(daysAgo: number, hoursAgo = 0): string {
  const date = new Date(BASE_DATE);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(date.getUTCHours() - hoursAgo);
  return date.toISOString();
}

function commitSha(seed: number): string {
  return seed.toString(16).padStart(40, "0");
}

function agentTurn(
  inputTokens: number,
  outputTokens: number,
  reasoningTokens: number,
  errorReason: string | null = null,
): ReviewRunTurn {
  return { index: 0, inputTokens, outputTokens, reasoningTokens, source: "agent", errorReason };
}

export const seedUsers: SeedUser[] = [
  { id: "user-1", email: "ana@example.com", password: "senha1234" },
];

// bella-api: repositório maduro, totalmente configurado — serviceState
// "active", configComplete true, e com dados suficientes (>20 execuções e
// comentários) para exercitar o LoadMoreButton nas Telas 8/10.
const bellaApiCompletedRuns: ReviewRunRecord[] = Array.from({ length: 20 }, (_, i) => {
  const index = i + 1;
  return {
    id: `run-bella-api-${index}`,
    prNumber: 100 + index,
    commitSha: commitSha(1000 + index),
    trigger: index % 5 === 0 ? "webhook" : "action",
    status: "completed",
    errorReason: null,
    durationMs: 8000 + index * 350,
    startedAt: isoOffset(20 - index, 1),
    completedAt: isoOffset(20 - index, 0),
    turns: [agentTurn(12000 + index * 200, 400 + index * 10, 1500 + index * 30)],
  } satisfies ReviewRunRecord;
});

const bellaApiOtherRuns: ReviewRunRecord[] = [
  {
    id: "run-bella-api-queued",
    prNumber: 121,
    commitSha: commitSha(1121),
    trigger: "action",
    status: "queued",
    errorReason: null,
    durationMs: null,
    startedAt: null,
    completedAt: null,
    turns: [],
  },
  {
    id: "run-bella-api-processing",
    prNumber: 122,
    commitSha: commitSha(1122),
    trigger: "action",
    status: "processing",
    errorReason: null,
    durationMs: null,
    startedAt: isoOffset(0, 1),
    completedAt: null,
    turns: [],
  },
  {
    id: "run-bella-api-failed-credential",
    prNumber: 95,
    commitSha: commitSha(995),
    trigger: "action",
    status: "failed",
    errorReason: "LLM credential not configured",
    durationMs: 1200,
    startedAt: isoOffset(45, 2),
    completedAt: isoOffset(45, 1),
    turns: [],
  },
  {
    id: "run-bella-api-failed-provider",
    prNumber: 118,
    commitSha: commitSha(1118),
    trigger: "action",
    status: "failed",
    errorReason: "Provider request failed: 429 Too Many Requests",
    durationMs: 6400,
    startedAt: isoOffset(3, 2),
    completedAt: isoOffset(3, 1),
    turns: [agentTurn(9800, 0, 0, "Provider request failed: 429 Too Many Requests")],
  },
];

const severityCycle: CommentSeverity[] = ["critical", "high", "medium", "low"];
const categoryCycle = [
  "security",
  "performance",
  "correctness",
  "error-handling",
  "readability",
  "testing",
];

// 24 comentários: maioria "published", ~1 a cada 4 "generated" (inclui o caso
// de comentário órfão da Tela 10), 1 "discarded", 1 "outdated" e 1 com
// `prNumber: null` (borda rara documentada na especificação).
const bellaApiComments: Comment[] = Array.from({ length: 24 }, (_, i) => {
  const index = i + 1;
  const run = bellaApiCompletedRuns[i % 20];
  let status: CommentStatus = index % 4 === 0 ? "generated" : "published";
  if (index === 21) status = "discarded";
  if (index === 22) status = "outdated";

  return {
    id: `comment-bella-api-${index}`,
    reviewRunId: run.id,
    prNumber: index === 23 ? null : run.prNumber,
    file: `src/module-${(i % 6) + 1}/file.ts`,
    line: 10 + i,
    category: categoryCycle[i % categoryCycle.length],
    severity: severityCycle[i % severityCycle.length],
    body: `Comentário de exemplo #${index} gerado pela IA sobre este trecho.`,
    status,
    externalId: status === "published" ? `gh-comment-${index}` : null,
    createdAt: isoOffset(20 - (i % 20), 0),
  } satisfies Comment;
});

const bellaApi: RepoRecord = {
  id: "repo-bella-api",
  fullName: "Natan-Lucena/bella-reviewer-api",
  active: true,
  llmCredential: {
    type: "llm",
    provider: "Gemini",
    configured: true,
    lastValidatedAt: isoOffset(60, 0),
    updatedAt: isoOffset(60, 0),
  },
  scmCredential: {
    type: "scm",
    provider: "GitHub",
    configured: true,
    lastValidatedAt: isoOffset(60, 0),
    updatedAt: isoOffset(60, 0),
  },
  actionTokenGenerated: true,
  webhookSecretGenerated: true,
  config: {
    model: "gemini-2.5-flash",
    tokenLimit: 100000,
    temperature: 0.2,
    enabledCategories: ["security", "performance"],
  },
  dashboardUsageByPeriod: {
    "7d": {
      inputTokens: 145000,
      outputTokens: 8200,
      reasoningTokens: 21000,
      estimatedCost: null,
      percentageChangeFromPreviousPeriod: 12.5,
    },
    "30d": {
      inputTokens: 512000,
      outputTokens: 30500,
      reasoningTokens: 76000,
      estimatedCost: null,
      percentageChangeFromPreviousPeriod: -4.2,
    },
    "90d": {
      inputTokens: 1340000,
      outputTokens: 79800,
      reasoningTokens: 198000,
      estimatedCost: null,
      percentageChangeFromPreviousPeriod: 8.9,
    },
  },
  reviewRuns: [...bellaApiCompletedRuns, ...bellaApiOtherRuns],
  comments: bellaApiComments,
};

// bella-web: só configurou Action (llm + scm + token da Action), nunca gerou
// o segredo de webhook — ilustra exatamente a "Nota para produto/design" item
// 1: configComplete fica false para sempre, mesmo seguindo o caminho
// recomendado pela própria Tela 1. serviceState => "configuration_pending".
const bellaWebCompletedRun: ReviewRunRecord = {
  id: "run-bella-web-completed",
  prNumber: 2,
  commitSha: commitSha(2002),
  trigger: "action",
  status: "completed",
  errorReason: null,
  durationMs: 5400,
  startedAt: isoOffset(2, 1),
  completedAt: isoOffset(2, 0),
  turns: [agentTurn(15438, 14, 1901)],
};

const bellaWeb: RepoRecord = {
  id: "repo-bella-web",
  fullName: "Natan-Lucena/bella-review-web",
  active: true,
  llmCredential: {
    type: "llm",
    provider: "Gemini",
    configured: true,
    lastValidatedAt: isoOffset(10, 0),
    updatedAt: isoOffset(10, 0),
  },
  scmCredential: {
    type: "scm",
    provider: "GitHub",
    configured: true,
    lastValidatedAt: isoOffset(10, 0),
    updatedAt: isoOffset(10, 0),
  },
  actionTokenGenerated: true,
  webhookSecretGenerated: false,
  config: {
    model: "gemini-2.5-flash",
    tokenLimit: 100000,
    temperature: 0.2,
    enabledCategories: [],
  },
  dashboardUsageByPeriod: {
    "7d": {
      inputTokens: 15438,
      outputTokens: 14,
      reasoningTokens: 1901,
      estimatedCost: null,
      percentageChangeFromPreviousPeriod: null,
    },
    "30d": {
      inputTokens: 15438,
      outputTokens: 14,
      reasoningTokens: 1901,
      estimatedCost: null,
      percentageChangeFromPreviousPeriod: null,
    },
    "90d": {
      inputTokens: 15438,
      outputTokens: 14,
      reasoningTokens: 1901,
      estimatedCost: null,
      percentageChangeFromPreviousPeriod: null,
    },
  },
  reviewRuns: [
    bellaWebCompletedRun,
    {
      id: "run-bella-web-processing",
      prNumber: 3,
      commitSha: commitSha(2003),
      trigger: "action",
      status: "processing",
      errorReason: null,
      durationMs: null,
      startedAt: isoOffset(0, 0),
      completedAt: null,
      turns: [],
    },
    {
      id: "run-bella-web-failed",
      prNumber: 1,
      commitSha: commitSha(2001),
      trigger: "action",
      status: "failed",
      errorReason: "Gemini request exceeded token limit",
      durationMs: 3100,
      startedAt: isoOffset(5, 2),
      completedAt: isoOffset(5, 1),
      turns: [agentTurn(98000, 0, 0, "Gemini request exceeded token limit")],
    },
  ],
  comments: [
    {
      id: "comment-bella-web-1",
      reviewRunId: bellaWebCompletedRun.id,
      prNumber: bellaWebCompletedRun.prNumber,
      file: "src/app/App.tsx",
      line: 42,
      category: "correctness",
      severity: "high",
      body: "O guard de autenticação não trata o caso de sessão expirada durante a navegação.",
      status: "published",
      externalId: "gh-comment-web-1",
      createdAt: isoOffset(2, 0),
    },
    {
      id: "comment-bella-web-2",
      reviewRunId: bellaWebCompletedRun.id,
      prNumber: bellaWebCompletedRun.prNumber,
      file: "src/data/SessionProvider.tsx",
      line: 15,
      category: "readability",
      severity: "medium",
      body: "Vale um comentário explicando por que a sessão só vive em memória nesta fase.",
      status: "generated",
      externalId: null,
      createdAt: isoOffset(2, 0),
    },
  ],
};

// bella-action: repositório desativado (active: false => serviceState
// "inactive") e nunca configurado — cobre tanto o estado "inactive" quanto o
// vazio (zero execuções/comentários) das Telas 7/8/10 ao mesmo tempo.
const bellaAction: RepoRecord = {
  id: "repo-bella-action",
  fullName: "Natan-Lucena/bella-review-action",
  active: false,
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
  dashboardUsageByPeriod: {
    "7d": {
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      estimatedCost: null,
      percentageChangeFromPreviousPeriod: null,
    },
    "30d": {
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      estimatedCost: null,
      percentageChangeFromPreviousPeriod: null,
    },
    "90d": {
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      estimatedCost: null,
      percentageChangeFromPreviousPeriod: null,
    },
  },
  reviewRuns: [],
  comments: [],
};

export const seedRepos: RepoRecord[] = [bellaApi, bellaWeb, bellaAction];
