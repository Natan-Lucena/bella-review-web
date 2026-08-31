import type { AcceptanceMetrics } from "../types/acceptance-metrics";
import type { Comment, CommentSeverity, CommentStatus } from "../types/comment";
import type { CommentReply } from "../types/comment-reply";
import type { Credential } from "../types/credential";
import type { CostStats } from "../types/cost-stats";
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

// Escopado por userId, mesmo padrão de RepoRecord/RepoConfig — cada prompt
// pertence a um usuário só (ver PRD 27, seção 1, "unique([userId, name])").
export type PromptRecord = {
  id: string;
  userId: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
  // Só para a Tela 6 (Configurações) — "Token gerado em {data}"/"Segredo
  // gerado em {data}". A API real não expõe isso hoje (ver PRD 07, "Nota
  // sobre a Fase 2"); a Fase 1 lê livremente porque tudo é mock em memória.
  actionTokenGeneratedAt: string | null;
  webhookSecretGeneratedAt: string | null;
  config: RepoConfig;
  dashboardUsageByPeriod: Record<DashboardPeriod, DashboardUsage>;
  // Pré-calculado à mão, não derivado de `comments` — o `Comment` mock não tem
  // `kind`/`applyStatus` (fora do escopo da PRD 12, ver
  // frontend-prds/12-metricas-de-aceitacao-no-painel.md, "Fixtures").
  acceptanceMetricsByPeriod: Record<DashboardPeriod, AcceptanceMetrics>;
  // Idem, pré-calculado à mão — ver PRD 22 (gráfico de custos no painel).
  costStatsByPeriod: Record<DashboardPeriod, CostStats>;
  reviewRuns: ReviewRunRecord[];
  comments: Comment[];
  // Chaveado por comment.id — só existe entrada aqui para comentários que de
  // fato têm alguma reply (ver PRD 21); ausência de chave é equivalente a
  // lista vazia, tratado assim em listCommentReplies().
  commentRepliesByCommentId: Record<string, CommentReply[]>;
};

const BASE_DATE = "2026-07-01T12:00:00.000Z";

function isoOffset(daysAgo: number, hoursAgo = 0): string {
  const date = new Date(BASE_DATE);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(date.getUTCHours() - hoursAgo);
  return date.toISOString();
}

// Um padStart ingênuo faria os dígitos que variam por seed caírem sempre no
// final da string, deixando os 7 primeiros caracteres (a versão curta
// exibida na Tela 8) idênticos em quase toda execução — dá uma dispersão
// pseudo-aleatória (hash multiplicativo de Knuth) pra parecer um SHA de
// verdade, com o prefixo curto realmente distinguível entre execuções.
function commitSha(seed: number): string {
  const scrambled = ((seed * 2654435761) >>> 0).toString(16).padStart(8, "0");
  return scrambled.repeat(5).slice(0, 40);
}

// Nenhuma sugestão gerada no período — usado por bella-action (repositório
// vazio/inativo) nos três períodos. Ver PRD 12, "Fixtures" (caso "sem dado").
// bella-web (que tem sugestão, só ainda não decidida) monta seu próprio
// objeto abaixo — array vazio aqui é "sem comentário nenhum", diferente de
// "tem comentário, nada decidido ainda".
function noDecisionsYet(actionableCount: number, observationCount: number): AcceptanceMetrics {
  const total = actionableCount + observationCount;
  return {
    applyRate: { value: null, decidedCount: 0, appliedCount: 0 },
    applyRateByCategory: [],
    applyRateBySeverity: [],
    coverage: {
      actionableCount,
      observationCount,
      actionableShare: total === 0 ? null : (actionableCount / total) * 100,
    },
    costPerAppliedSuggestion: null,
    previousPeriod: { applyRate: { value: null }, costPerAppliedSuggestion: null },
  };
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

// Nenhum repositório seed referencia um destes por padrão (RepoRecord.config.promptId
// nasce null em todos os três, mesmo estado do backend real após a migração da PRD
// 27) — mantém o dataset inicial simples; um teste que precise de um repositório já
// apontando para um prompt pode montar isso explicitamente.
export const seedPrompts: PromptRecord[] = [
  {
    id: "prompt-security-focus",
    userId: "user-1",
    name: "Security-first review",
    content:
      "Focus primarily on security vulnerabilities: injection, auth bypass, secrets committed to the repo, unsafe deserialization. Only flag other categories if the issue is severe.",
    createdAt: isoOffset(30, 0),
    updatedAt: isoOffset(30, 0),
  },
  {
    id: "prompt-concise-style",
    userId: "user-1",
    name: "Concise comments",
    content:
      "Keep every comment to at most two sentences. Skip style nitpicks entirely — only point out correctness and security issues.",
    createdAt: isoOffset(15, 0),
    updatedAt: isoOffset(10, 0),
  },
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
    // Nenhum destes tem reply no dataset (commentRepliesByCommentId de
    // bella-api é {}) — ver PRD 21 F2.
    replyCount: 0,
  } satisfies Comment;
});

// Repositório maduro — números reais, com uma linha de severidade
// (`critical`) sem nenhuma decisão ainda (`value: null` dentro de uma tabela
// que já tem outras linhas com dado), e uma tendência real entre
// `previousPeriod` e o período atual. Ver PRD 12, "Fixtures".
const bellaApiAcceptanceMetrics: Record<DashboardPeriod, AcceptanceMetrics> = {
  "7d": {
    // decidedCount/appliedCount deliberately produce a value (66,7%) that
    // doesn't collide with any breakdown row below — see AcceptanceMetricsSection.test.tsx.
    applyRate: { value: 66.66666666666667, decidedCount: 3, appliedCount: 2 },
    applyRateByCategory: [
      { category: "security", value: 100, decidedCount: 2 },
      { category: "performance", value: 0, decidedCount: 1 },
    ],
    applyRateBySeverity: [
      { severity: "critical", value: null, decidedCount: 0 },
      { severity: "high", value: 50, decidedCount: 2 },
      { severity: "medium", value: 100, decidedCount: 1 },
      { severity: "low", value: null, decidedCount: 0 },
    ],
    coverage: { actionableCount: 5, observationCount: 3, actionableShare: 62.5 },
    costPerAppliedSuggestion: 3.9,
    previousPeriod: { applyRate: { value: null }, costPerAppliedSuggestion: null },
  },
  "30d": {
    applyRate: { value: 75, decidedCount: 20, appliedCount: 15 },
    applyRateByCategory: [
      { category: "security", value: 80, decidedCount: 10 },
      { category: "performance", value: 60, decidedCount: 5 },
      { category: "correctness", value: 80, decidedCount: 5 },
    ],
    applyRateBySeverity: [
      { severity: "critical", value: null, decidedCount: 0 },
      { severity: "high", value: 87.5, decidedCount: 8 },
      { severity: "medium", value: 50, decidedCount: 8 },
      { severity: "low", value: 100, decidedCount: 4 },
    ],
    coverage: { actionableCount: 26, observationCount: 14, actionableShare: 65 },
    costPerAppliedSuggestion: 3.8,
    previousPeriod: { applyRate: { value: 62 }, costPerAppliedSuggestion: 4.5 },
  },
  "90d": {
    applyRate: { value: 75, decidedCount: 40, appliedCount: 30 },
    applyRateByCategory: [
      { category: "security", value: 80, decidedCount: 20 },
      { category: "performance", value: 60, decidedCount: 10 },
      { category: "correctness", value: 80, decidedCount: 10 },
    ],
    applyRateBySeverity: [
      { severity: "critical", value: null, decidedCount: 0 },
      { severity: "high", value: 87.5, decidedCount: 16 },
      { severity: "medium", value: 50, decidedCount: 16 },
      { severity: "low", value: 100, decidedCount: 8 },
    ],
    coverage: { actionableCount: 52, observationCount: 28, actionableShare: 65 },
    costPerAppliedSuggestion: 4.1,
    previousPeriod: { applyRate: { value: 70 }, costPerAppliedSuggestion: 4.6 },
  },
};

// Custo real, com as duas runType (review + comment_reply) e a categoria
// "security" aparecendo nas duas — exercita o empilhamento por runType de um
// futuro gráfico (ver PRD 22, "Fixtures"). previousPeriod difere do total
// atual em todos os períodos (uma alta, uma queda), pra dar dado real a uma
// eventual UI de variação percentual.
//
// byModel: bella-api trocou de modelo há pouco — claude-sonnet-5 entrou em
// uso há ~2 dias, então seu totalCost/count são os mesmos nos três períodos
// (toda a janela de uso dele cabe dentro de 7d/30d/90d), enquanto
// gemini-2.5-flash (modelo configurado desde sempre, ver `config.model`
// abaixo) cresce com a janela — exercita o gráfico por modelo da PRD 23 com
// dois modelos de verdade, não só um placeholder.
const bellaApiCostStats: Record<DashboardPeriod, CostStats> = {
  "7d": {
    totalCost: 12.45,
    totalCostByRunType: [
      { runType: "review", totalCost: 9.8, count: 18 },
      { runType: "comment_reply", totalCost: 2.65, count: 7 },
    ],
    breakdown: [
      { category: "security", runType: "review", totalCost: 4.2, count: 6 },
      { category: "performance", runType: "review", totalCost: 3.1, count: 5 },
      { category: "correctness", runType: "review", totalCost: 2.5, count: 7 },
      { category: "security", runType: "comment_reply", totalCost: 1.5, count: 4 },
      { category: "performance", runType: "comment_reply", totalCost: 1.15, count: 3 },
    ],
    byModel: [
      {
        provider: "gemini",
        model: "gemini-2.5-flash",
        totalCost: 9.85,
        count: 20,
        firstUsedAt: isoOffset(6, 20),
        lastUsedAt: isoOffset(0, 2),
      },
      {
        provider: "claude",
        model: "claude-sonnet-5",
        totalCost: 2.6,
        count: 5,
        firstUsedAt: isoOffset(2, 0),
        lastUsedAt: isoOffset(0, 1),
      },
    ],
    previousPeriod: { totalCost: 10.9 },
  },
  "30d": {
    totalCost: 48.6,
    totalCostByRunType: [
      { runType: "review", totalCost: 38.75, count: 72 },
      { runType: "comment_reply", totalCost: 9.85, count: 26 },
    ],
    breakdown: [
      { category: "security", runType: "review", totalCost: 15.4, count: 24 },
      { category: "performance", runType: "review", totalCost: 12.2, count: 20 },
      { category: "correctness", runType: "review", totalCost: 11.15, count: 28 },
      { category: "security", runType: "comment_reply", totalCost: 5.6, count: 14 },
      { category: "performance", runType: "comment_reply", totalCost: 4.25, count: 12 },
    ],
    byModel: [
      {
        provider: "gemini",
        model: "gemini-2.5-flash",
        totalCost: 46.0,
        count: 93,
        firstUsedAt: isoOffset(29, 18),
        lastUsedAt: isoOffset(0, 2),
      },
      {
        provider: "claude",
        model: "claude-sonnet-5",
        totalCost: 2.6,
        count: 5,
        firstUsedAt: isoOffset(2, 0),
        lastUsedAt: isoOffset(0, 1),
      },
    ],
    previousPeriod: { totalCost: 41.2 },
  },
  "90d": {
    totalCost: 132.9,
    totalCostByRunType: [
      { runType: "review", totalCost: 104.3, count: 180 },
      { runType: "comment_reply", totalCost: 28.6, count: 64 },
    ],
    breakdown: [
      { category: "security", runType: "review", totalCost: 42.1, count: 60 },
      { category: "performance", runType: "review", totalCost: 31.8, count: 50 },
      { category: "correctness", runType: "review", totalCost: 30.4, count: 70 },
      { category: "security", runType: "comment_reply", totalCost: 16.2, count: 36 },
      { category: "performance", runType: "comment_reply", totalCost: 12.4, count: 28 },
    ],
    byModel: [
      {
        provider: "gemini",
        model: "gemini-2.5-flash",
        totalCost: 130.3,
        count: 239,
        firstUsedAt: isoOffset(88, 10),
        lastUsedAt: isoOffset(0, 2),
      },
      {
        provider: "claude",
        model: "claude-sonnet-5",
        totalCost: 2.6,
        count: 5,
        firstUsedAt: isoOffset(2, 0),
        lastUsedAt: isoOffset(0, 1),
      },
    ],
    previousPeriod: { totalCost: 145.5 },
  },
};

const bellaApi: RepoRecord = {
  id: "repo-bella-api",
  fullName: "Natan-Lucena/bella-reviewer-api",
  active: true,
  llmCredential: {
    type: "llm",
    provider: "gemini",
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
  actionTokenGeneratedAt: isoOffset(60, 0),
  webhookSecretGeneratedAt: isoOffset(60, 0),
  config: {
    llmProvider: "gemini",
    model: "gemini-2.5-flash",
    tokenLimit: 100000,
    temperature: 0.2,
    enabledCategories: ["security", "performance"],
    promptId: null,
    reviewLanguage: "en",
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
  acceptanceMetricsByPeriod: bellaApiAcceptanceMetrics,
  costStatsByPeriod: bellaApiCostStats,
  reviewRuns: [...bellaApiCompletedRuns, ...bellaApiOtherRuns],
  comments: bellaApiComments,
  commentRepliesByCommentId: {},
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

const bellaWebAcceptanceMetrics: AcceptanceMetrics = {
  applyRate: { value: null, decidedCount: 0, appliedCount: 0 },
  applyRateByCategory: [{ category: "correctness", value: null, decidedCount: 0 }],
  applyRateBySeverity: [{ severity: "high", value: null, decidedCount: 0 }],
  coverage: { actionableCount: 1, observationCount: 1, actionableShare: 50 },
  costPerAppliedSuggestion: null,
  previousPeriod: { applyRate: { value: null }, costPerAppliedSuggestion: null },
};

// Repositório pequeno — mesmo valor nos três períodos (idem
// bellaWebAcceptanceMetrics), mas ainda com as duas runType e uma categoria
// ("correctness") repetida entre elas. previousPeriod.totalCost em 0: repo
// novo, sem custo no período anterior.
const bellaWebCostStats: CostStats = {
  totalCost: 3.85,
  totalCostByRunType: [
    { runType: "review", totalCost: 1.2, count: 1 },
    { runType: "comment_reply", totalCost: 2.65, count: 5 },
  ],
  breakdown: [
    { category: "correctness", runType: "comment_reply", totalCost: 1.6, count: 3 },
    { category: "correctness", runType: "review", totalCost: 1.2, count: 1 },
    { category: "readability", runType: "comment_reply", totalCost: 1.05, count: 2 },
  ],
  // Repositório pequeno, só usou o modelo configurado (config.model abaixo) —
  // caso de um modelo só, diferente do caso multi-modelo de bella-api acima.
  byModel: [
    {
      provider: "gemini",
      model: "gemini-2.5-flash",
      totalCost: 3.85,
      count: 6,
      firstUsedAt: isoOffset(2, 0),
      lastUsedAt: isoOffset(0, 0),
    },
  ],
  previousPeriod: { totalCost: 0 },
};

// Replies do comment-bella-web-1 (guard de autenticação) — cobre os três
// estados de status que a Tela de replies (PRD 21) precisa distinguir:
// "completed" com categoria já classificada (duas categorias diferentes,
// pra não parecer que só existe uma), e "queued" ainda sem bellaBody/
// category/completedAt (mesmo racional de acceptanceMetricsByPeriod acima —
// null é o estado real, não um array/string vazios).
const bellaWebComment1Replies: CommentReply[] = [
  {
    id: "reply-bella-web-1-1",
    humanBody:
      "Isso não quebra o fluxo de SSR, onde não existe `window` disponível pra checar a sessão?",
    humanAuthor: "juliana.dev",
    status: "completed",
    category: "clarification",
    bellaBody:
      "Não quebra — a checagem de expiração proposta roda só no guard client-side (useEffect), " +
      "então em SSR ela simplesmente não executa e a página renderiza normalmente até a hidratação.",
    bellaSuggestedCode: null,
    createdAt: isoOffset(2, 0),
    completedAt: isoOffset(1, 23),
  },
  {
    id: "reply-bella-web-1-2",
    humanBody:
      "Discordo que isso seja high severity — o middleware do Next já redireciona pra /login antes disso.",
    humanAuthor: "marcos.silva",
    status: "completed",
    category: "disagreement",
    bellaBody:
      "O middleware cobre a navegação inicial, mas não uma sessão que expira enquanto o usuário já " +
      "está com a página aberta (SPA navigation) — nesse caso o guard client-side é o único ponto que " +
      "trata o caso, daí a severidade.",
    bellaSuggestedCode: null,
    createdAt: isoOffset(1, 20),
    completedAt: isoOffset(1, 18),
  },
  {
    id: "reply-bella-web-1-4",
    humanBody: "Dá pra sugerir o trecho certo pra corrigir isso?",
    humanAuthor: "marcos.silva",
    status: "completed",
    category: "fix",
    bellaBody:
      "Segue uma checagem adicional no guard, cobrindo o caso de sessão que expira com a página já aberta.",
    bellaSuggestedCode:
      "if (session?.expiresAt && session.expiresAt < Date.now()) {\n  redirectToLogin();\n}",
    createdAt: isoOffset(1, 14),
    completedAt: isoOffset(1, 13),
  },
  {
    id: "reply-bella-web-1-5",
    humanBody: "Aplicado, ficou bom — obrigada!",
    humanAuthor: "juliana.dev",
    status: "completed",
    category: "acknowledgment",
    bellaBody: "Que bom que ajudou!",
    bellaSuggestedCode: null,
    createdAt: isoOffset(1, 8),
    completedAt: isoOffset(1, 7),
  },
  {
    id: "reply-bella-web-1-6",
    humanBody: "Só documentando aqui: já sabíamos desse comportamento, não é bug novo.",
    humanAuthor: "marcos.silva",
    status: "completed",
    category: "other",
    bellaBody: "Entendido, mantendo registrado no histórico do comentário.",
    bellaSuggestedCode: null,
    createdAt: isoOffset(1, 2),
    completedAt: isoOffset(1, 1),
  },
  {
    id: "reply-bella-web-1-3",
    humanBody: "Vou aplicar a sugestão, só confirma o snippet certo pra colar aqui.",
    humanAuthor: "juliana.dev",
    status: "queued",
    category: null,
    bellaBody: null,
    bellaSuggestedCode: null,
    createdAt: isoOffset(0, 1),
    completedAt: null,
  },
  {
    id: "reply-bella-web-1-7",
    humanBody: "Ficou faltando revisar o outro branch desse guard também.",
    humanAuthor: "marcos.silva",
    status: "processing",
    category: null,
    bellaBody: null,
    bellaSuggestedCode: null,
    createdAt: isoOffset(0, 0),
    completedAt: null,
  },
];

const bellaWeb: RepoRecord = {
  id: "repo-bella-web",
  fullName: "Natan-Lucena/bella-review-web",
  active: true,
  llmCredential: {
    type: "llm",
    provider: "gemini",
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
  actionTokenGeneratedAt: isoOffset(10, 0),
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
  // Tem sugestão (o comentário 1 abaixo é acionável em espírito), mas ainda
  // nada foi decidido — value: null nas linhas, não array vazio, distinto do
  // "sem comentário nenhum" de bella-action logo abaixo.
  acceptanceMetricsByPeriod: {
    "7d": bellaWebAcceptanceMetrics,
    "30d": bellaWebAcceptanceMetrics,
    "90d": bellaWebAcceptanceMetrics,
  },
  costStatsByPeriod: {
    "7d": bellaWebCostStats,
    "30d": bellaWebCostStats,
    "90d": bellaWebCostStats,
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
      // Espelha o tamanho de bellaWebComment1Replies abaixo — único comentário
      // do dataset com replies de verdade (ver PRD 21 F2).
      replyCount: bellaWebComment1Replies.length,
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
      replyCount: 0,
    },
  ],
  commentRepliesByCommentId: {
    "comment-bella-web-1": bellaWebComment1Replies,
  },
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
  acceptanceMetricsByPeriod: {
    "7d": noDecisionsYet(0, 0),
    "30d": noDecisionsYet(0, 0),
    "90d": noDecisionsYet(0, 0),
  },
  // Sem nenhuma execução, então sem custo nenhum — array vazio, não linhas com
  // totalCost 0, mesmo racional de noDecisionsYet() acima para
  // applyRateByCategory/applyRateBySeverity.
  costStatsByPeriod: {
    "7d": {
      totalCost: 0,
      totalCostByRunType: [],
      breakdown: [],
      byModel: [],
      previousPeriod: { totalCost: 0 },
    },
    "30d": {
      totalCost: 0,
      totalCostByRunType: [],
      breakdown: [],
      byModel: [],
      previousPeriod: { totalCost: 0 },
    },
    "90d": {
      totalCost: 0,
      totalCostByRunType: [],
      breakdown: [],
      byModel: [],
      previousPeriod: { totalCost: 0 },
    },
  },
  reviewRuns: [],
  comments: [],
  commentRepliesByCommentId: {},
};

export const seedRepos: RepoRecord[] = [bellaApi, bellaWeb, bellaAction];
