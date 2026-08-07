import type { Repo } from "../types/repo";

// Resolve o repositório clicado na busca do wizard (Passo 1b) contra a lista
// que já foi carregada, evitando uma nova chamada só pra confirmar o id.
export function findRepoByFullName(repos: Repo[], fullName: string): Repo | undefined {
  return repos.find((repo) => repo.fullName === fullName);
}
