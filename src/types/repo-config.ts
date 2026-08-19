import type { LlmProvider } from "./llm-provider";

export type RepoConfig = {
  llmProvider: LlmProvider;
  model: string;
  tokenLimit: number;
  temperature: number;
  enabledCategories: string[];
  promptId: string | null;
};

// PATCH /repos/:id/config aceita um patch parcial de verdade — só os campos
// enviados são alterados, o resto permanece como estava. `llmProvider` fica
// de fora de propósito: esse endpoint nunca aceita esse campo — o único
// caminho para mudar o provedor é POST /repos/:id/credentials/llm
// (backend-prds/25-selecao-de-provedor-e-credencial.md) — trocar de provedor
// sem trocar de credencial nunca autentica.
export type RepoConfigPatch = Partial<Omit<RepoConfig, "llmProvider">>;
