import { useState } from "react";

import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { PasswordField } from "../../../components/PasswordField";
import { ProviderLogo } from "../../../components/ProviderLogo";
import { SelectableCard } from "../../../components/SelectableCard";
import { useSetLlmCredential } from "../../../data/repos";
import { LLM_PROVIDERS, LLM_PROVIDER_CATALOG } from "../../../lib/llm-provider-catalog";
import type { LlmProvider } from "../../../types/llm-provider";

type Step3LlmCredentialProps = {
  repoId: string;
  provider: LlmProvider;
  onProviderChange: (provider: LlmProvider) => void;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  onBack: () => void;
  onAdvance: () => void;
};

// Passo 3 — Provedor + credencial do LLM. Sempre obrigatório, independente do
// método escolhido no Passo 2 (é usado pra gerar a revisão em si) — ver
// PRD 06/17. `provider` sempre tem uma seleção (default "gemini",
// wizardReducer) — nunca enviado como indefinido.
export function Step3LlmCredential({
  repoId,
  provider,
  onProviderChange,
  apiKey,
  onApiKeyChange,
  onBack,
  onAdvance,
}: Step3LlmCredentialProps) {
  const setLlmCredential = useSetLlmCredential(repoId);
  const [formError, setFormError] = useState<string | null>(null);
  const entry = LLM_PROVIDER_CATALOG[provider];
  const valid = apiKey.trim().length > 0;

  async function handleNext() {
    if (!valid) {
      return;
    }
    setFormError(null);
    try {
      await setLlmCredential.mutateAsync({ provider, apiKey: apiKey.trim() });
      onAdvance();
    } catch (error) {
      console.error(`Failed to set LLM credential for repo ${repoId}:`, error);
      setFormError("Não foi possível salvar a chave agora. Tente novamente.");
    }
  }

  return (
    <div>
      <PageHeader
        level="h1"
        title="Escolha o provedor de LLM"
        description="A revisão roda no seu próprio provedor — a chave é sua e o consumo vai para a sua conta."
      />

      <div role="radiogroup" aria-label="Provedor de LLM" className="mt-8 flex flex-col gap-3">
        {LLM_PROVIDERS.map((option) => (
          <SelectableCard
            key={option.provider}
            selected={provider === option.provider}
            onSelect={() => onProviderChange(option.provider)}
            title={option.name}
            icon={<ProviderLogo provider={option.provider} />}
          />
        ))}
      </div>

      <div className="mt-8">
        <PasswordField
          label={entry.apiKeyLabel}
          htmlFor="wizard-api-key"
          placeholder={entry.apiKeyPlaceholder}
          value={apiKey}
          onChange={onApiKeyChange}
          error={formError ?? undefined}
        />
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-muted">
          Depois de salva, ela nunca é devolvida pela API — nem para você, nem mascarada. Só ficamos
          sabendo que existe.
        </p>
        <a
          href={entry.helpLink.href}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 inline-block text-[13px] text-accent hover:underline"
        >
          {entry.helpLink.label}
        </a>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
        <Button
          variant="primary"
          disabled={!valid}
          loading={setLlmCredential.isPending}
          onClick={handleNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
