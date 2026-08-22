import type { LlmProvider } from "./llm-provider";
import type { ReviewLanguage } from "./review-language";

export type ServiceState = "active" | "configuration_pending" | "inactive";

export type Repo = {
  id: string;
  fullName: string;
  active: boolean;
  // Exige as 4 credenciais (incluindo webhook_secret, mesmo pra quem só usa
  // a Action) — regra real do backend (`GET /repos`), não computável de
  // outro jeito no cliente: não existe endpoint que exponha o status
  // individual de cada credencial. Ver PRD da Fase 2.
  configComplete: boolean;
  llmProvider: LlmProvider;
  model: string;
  promptId: string | null;
  reviewLanguage: ReviewLanguage;
};

export type ListReposResponse = {
  repos: Repo[];
};
