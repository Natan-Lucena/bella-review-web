import { LLM_PROVIDER_CATALOG } from "../lib/llm-provider-catalog";
import type { LlmProvider } from "../types/llm-provider";

type ProviderLogoProps = {
  provider: LlmProvider;
  size?: number;
};

export function ProviderLogo({ provider, size = 24 }: ProviderLogoProps) {
  const entry = LLM_PROVIDER_CATALOG[provider];
  return (
    <img
      src={entry.logo}
      alt={entry.name}
      width={size}
      height={size}
      className="flex-none rounded-lg"
    />
  );
}
