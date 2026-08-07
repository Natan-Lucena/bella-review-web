import type { ReviewRunSummary } from "../types/review-run";

// Usado pelo link "ver execução" que o histórico de comentários mostra
// (Tela 10) — resolve o commitSha de volta pra execução já carregada na
// página de Execuções, sem precisar buscar de novo.
export function findReviewRunByCommitSha(
  runs: ReviewRunSummary[],
  commitSha: string,
): ReviewRunSummary | undefined {
  return runs.filter((run) => run.commitSha === commitSha)[0];
}
