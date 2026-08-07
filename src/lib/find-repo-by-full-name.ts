import type { Repo } from "../types/repo";

// Resolve o repositório clicado na busca do wizard (Passo 1b) contra a lista
// que já foi carregada, evitando uma nova chamada só pra confirmar o id.
  return repos.find((repo) => repo.fullName === fullName);
  return repos.find((repo) => repo.fullName === fullName);
}
