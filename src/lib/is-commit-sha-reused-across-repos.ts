import type { ReviewRunSummary } from "../types/review-run";

// Alerta defensivo (deveria ser impossível na prática — SHAs de commit não se
// repetem entre repositórios distintos) usado só como checagem de sanidade
// antes de deduplicar execuções ao combinar o histórico de mais de um
// repositório numa mesma visualização.
export function isCommitShaReusedAcrossRepos(
  runsFromRepoA: ReviewRunSummary[],
  runsFromRepoB: ReviewRunSummary[],
): boolean {
  return runsFromRepoA.some((runA) =>
    runsFromRepoB.some((runB) => runB.commitSha === runA.commitSha),
  );
}
