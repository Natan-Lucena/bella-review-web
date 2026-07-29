import type { Comment } from "./comment";

export type ReviewRunStatus = "queued" | "processing" | "completed" | "failed";
export type ReviewRunTrigger = "action" | "webhook";

export type ReviewRunSummary = {
  id: string;
  prNumber: number;
  commitSha: string;
  trigger: ReviewRunTrigger;
  status: ReviewRunStatus;
  errorReason: string | null;
  durationMs: number | null;
  // Conta só comentários com status "published" — ver frontend-especificacao-telas.md, Tela 8.
  commentCount: number;
  totalTokens: number;
  startedAt: string | null;
  completedAt: string | null;
};

export type ReviewRunTurn = {
  index: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  // Hoje sempre "agent" — o backend já reserva o campo para turnos futuros
  // gerados/editados por um humano (ponto de extensão HITL do TCC).
  source: string;
  errorReason: string | null;
};

export type ReviewRunDetail = {
  id: string;
  prNumber: number;
  commitSha: string;
  status: ReviewRunStatus;
  errorReason: string | null;
  turns: ReviewRunTurn[];
  comments: Comment[];
};

export type ReviewRunFilters = {
  status?: ReviewRunStatus;
  limit?: number;
  offset?: number;
};

export type ListReviewRunsResponse = {
  reviewRuns: ReviewRunSummary[];
  total: number;
};
