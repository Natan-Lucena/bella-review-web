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
    modelSuggestions: ["gemini-2.5-flash", "gemini-2.5-pro"],
    modelPlaceholder: "gemini-2.5-flash",
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
    modelSuggestions: ["claude-sonnet-4-5", "claude-opus-4-1", "claude-haiku-4-5"],
    modelPlaceholder: "claude-sonnet-4-5",
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
    modelSuggestions: ["gpt-5", "gpt-5-mini", "gpt-4o"],
    modelPlaceholder: "gpt-5",
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
