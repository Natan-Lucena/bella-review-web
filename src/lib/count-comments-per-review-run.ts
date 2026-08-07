import type { Comment } from "../types/comment";
import type { ReviewRunSummary } from "../types/review-run";

// Recalcula a contagem de comentários publicados por execução no cliente —
// usado como fallback na tela de Execuções quando o filtro local (por
// categoria/severidade) muda e o `commentCount` que veio da API não reflete
// mais o subconjunto filtrado.
export function countCommentsPerReviewRun(
  runs: ReviewRunSummary[],
  comments: Comment[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const run of runs) {
    counts[run.id] = comments.filter(
      (comment) => comment.reviewRunId === run.id && comment.status === "published",
    ).length;
  }
  return counts;
}
