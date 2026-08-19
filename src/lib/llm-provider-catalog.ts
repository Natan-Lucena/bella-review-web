import claudeLogo from "../assets/providers/claude.webp";
import geminiLogo from "../assets/providers/gemini.webp";
import openaiLogo from "../assets/providers/openai.webp";
import type { LlmProvider } from "../types/llm-provider";

export type LlmProviderCatalogEntry = {
  provider: LlmProvider;
  name: string;
  logo: string;
  modelSuggestions: string[];
  modelPlaceholder: string;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  helpLink: { label: string; href: string };
};

// Espelha backend-prds/23-catalogo-de-provedores-llm.md à mão (sem pacote
// compartilhado, ver CONVENTIONS.md) — mantido em sincronia por convenção
// sempre que o catálogo do backend mudar. `modelPlaceholder` precisa
// continuar igual ao `defaultModel` do backend (o modelo usado quando
// POST /repos/:id/credentials/llm omite `model`).
export const LLM_PROVIDER_CATALOG: Record<LlmProvider, LlmProviderCatalogEntry> = {
  gemini: {
    provider: "gemini",
    name: "Gemini",
    logo: geminiLogo,
    // Só modelos GA (sem "-preview") — o tier Pro da geração 3.x (gemini-3.1-pro-preview)
    // ainda não tem sucessor estável do 2.5 Pro, então continua fora da lista até sair
    // do preview. Verificado em ai.google.dev/gemini-api/docs/models em 2026-08-18.
    modelSuggestions: ["gemini-3.7-flash", "gemini-2.5-pro", "gemini-2.5-flash"],
    modelPlaceholder: "gemini-3.7-flash",
    apiKeyLabel: "Chave da API do Gemini",
    apiKeyPlaceholder: "cole sua chave de API do Gemini",
    helpLink: {
      label: "Gerar chave no Google AI Studio",
      href: "https://aistudio.google.com/apikey",
    },
  },
  claude: {
    provider: "claude",
    name: "Claude",
    logo: claudeLogo,
    // Verificado em platform.claude.com/docs/en/about-claude/models/overview em
    // 2026-08-18 — geração atual (não a lista "Legacy models" do mesmo catálogo).
    modelSuggestions: ["claude-sonnet-5", "claude-opus-5", "claude-haiku-4-5"],
    modelPlaceholder: "claude-sonnet-5",
    apiKeyLabel: "Chave da API da Anthropic",
    apiKeyPlaceholder: "cole sua chave de API da Anthropic",
    helpLink: {
      label: "Gerar chave no Console da Anthropic",
      href: "https://console.anthropic.com/settings/keys",
    },
  },
  openai: {
    provider: "openai",
    name: "GPT",
    logo: openaiLogo,
    // Verificado em developers.openai.com/api/docs/models em 2026-08-18 — "gpt-5.6"
    // é o alias curto de "gpt-5.6-sol", mesmo padrão de nome curto que "gpt-5" usava.
    modelSuggestions: ["gpt-5.6", "gpt-5.6-terra", "gpt-5.6-luna"],
    modelPlaceholder: "gpt-5.6",
    apiKeyLabel: "Chave da API da OpenAI",
    apiKeyPlaceholder: "cole sua chave de API da OpenAI",
    helpLink: {
      label: "Gerar chave na Platform da OpenAI",
      href: "https://platform.openai.com/api-keys",
    },
  },
};

export const LLM_PROVIDERS: LlmProviderCatalogEntry[] = Object.values(LLM_PROVIDER_CATALOG);

export function getDefaultModelForProvider(provider: LlmProvider): string {
  return LLM_PROVIDER_CATALOG[provider].modelPlaceholder;
}
