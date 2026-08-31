import type { CommentFilters } from "../types/comment";
import type { DashboardPeriod } from "../types/dashboard";
import type { ReviewRunFilters } from "../types/review-run";

// Sempre inclui todos os parâmetros que afetam o resultado — uma queryKey sem
// os filtros não re-busca quando eles mudam (ver react.md, "TanStack Query v5").
export const queryKeys = {
  repos: () => ["repos"] as const,
  prompts: () => ["prompts"] as const,
  repoDashboard: (repoId: string, period: DashboardPeriod) =>
    ["repos", repoId, "dashboard", period] as const,
  repoAcceptanceMetrics: (repoId: string, period: DashboardPeriod) =>
    ["repos", repoId, "acceptance-metrics", period] as const,
  reviewRuns: (repoId: string, filters: ReviewRunFilters) =>
    ["repos", repoId, "runs", filters] as const,
  reviewRunDetail: (repoId: string, runId: string) => ["repos", repoId, "runs", runId] as const,
  comments: (repoId: string, filters: CommentFilters) =>
    ["repos", repoId, "comments", filters] as const,
  commentReplies: (repoId: string, commentId: string) =>
    ["repos", repoId, "comments", commentId, "replies"] as const,
};
