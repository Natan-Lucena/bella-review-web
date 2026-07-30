export type ServiceState = "active" | "configuration_pending" | "inactive";

export type Repo = {
  id: string;
  fullName: string;
  active: boolean;
  configComplete: boolean;
  // Estado calculado só no frontend (mock, por enquanto) — llm + scm + (token
  // da Action OU segredo de webhook). Mais permissivo que `configComplete`
  // (que exige as 4 credenciais), porque um repositório configurado só com a
  // Action é um caso plenamente funcional, não "incompleto" — ver
  // frontend-especificacao-telas.md, Tela 4, nota sobre `configComplete`.
  readyForReview: boolean;
  llmProvider: string;
  model: string;
};

export type ListReposResponse = {
  repos: Repo[];
};
