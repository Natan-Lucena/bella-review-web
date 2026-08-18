import { useState } from "react";

import { Accordion } from "../../components/Accordion";
import { Button } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { PasswordField } from "../../components/PasswordField";
import { ProviderLogo } from "../../components/ProviderLogo";
import { SelectableCard } from "../../components/SelectableCard";
import { useSetLlmCredential, useUpdateRepoConfig } from "../../data/repos";
import { LLM_PROVIDER_CATALOG, LLM_PROVIDERS } from "../../lib/llm-provider-catalog";
import type { LlmProvider } from "../../types/llm-provider";

type ActiveConfigSectionProps = {
  repoId: string;
  currentProvider: LlmProvider | undefined;
  currentModel: string | undefined;
};

// Substitui a linha de texto "Configuração ativa" do Painel (18-...md) por um
// bloco editável — sem duplicar a lógica de mutation de Configurações
// (07-...md/17-...md): mesmos hooks (useSetLlmCredential/useUpdateRepoConfig),
// mesmos primitivos de UI (SelectableCard/ProviderLogo/PasswordField), só uma
// composição de apresentação diferente, num Accordion só — CredentialSection
// não é reaproveitado aqui como componente porque ele já embrulha o próprio
// Accordion, e um Accordion dentro de outro Accordion (título "Configuração
// ativa" por fora, "Credencial do LLM" por dentro) seria confuso.
//
// Dois botões de salvar, não um só: trocar só o modelo (mesmo provedor) usa
// PATCH .../config, sem precisar da chave de novo — juntar tudo numa chamada
// só a POST .../credentials/llm forçaria reenviar a chave toda vez que o
// usuário só quisesse ajustar o modelo, já que esse campo é obrigatório
// naquele endpoint.
export function ActiveConfigSection({
  repoId,
  currentProvider,
  currentModel,
}: ActiveConfigSectionProps) {
  const knownProvider = currentProvider ?? "gemini";
  const [selectedProvider, setSelectedProvider] = useState<LlmProvider>(knownProvider);
  const [apiKey, setApiKey] = useState("");
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [modelTouched, setModelTouched] = useState(false);

  const setLlmCredential = useSetLlmCredential(repoId);
  const updateRepoConfig = useUpdateRepoConfig(repoId);

  const catalogEntry = LLM_PROVIDER_CATALOG[selectedProvider];
  const modelLine =
    currentProvider && currentModel
      ? `${LLM_PROVIDER_CATALOG[currentProvider].name} · ${currentModel}`
      : "Ainda não configurada";

  async function handleSaveCredential() {
    if (!apiKey.trim()) {
      return;
    }
    setCredentialError(null);
    try {
      await setLlmCredential.mutateAsync({ provider: selectedProvider, apiKey: apiKey.trim() });
      setApiKey("");
    } catch (error) {
      console.error(`Failed to set LLM credential for repo ${repoId}:`, error);
      setCredentialError("Não foi possível salvar agora. Tente novamente.");
    }
  }

  async function handleSaveModel() {
    if (!modelTouched || model.trim().length === 0) {
      return;
    }
    await updateRepoConfig.mutateAsync({ model: model.trim() });
  }

  return (
    <Accordion
      title={
        <span className="text-sm font-normal text-ink-muted">
          Configuração ativa · <span className="text-ink">{modelLine}</span>
        </span>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div role="radiogroup" aria-label="Provedor de LLM" className="flex flex-col gap-3">
            {LLM_PROVIDERS.map((option) => (
              <SelectableCard
                key={option.provider}
                selected={selectedProvider === option.provider}
                onSelect={() => setSelectedProvider(option.provider)}
                title={option.name}
                icon={<ProviderLogo provider={option.provider} />}
              />
            ))}
          </div>
          <PasswordField
            label={catalogEntry.apiKeyLabel}
            htmlFor="active-config-api-key"
            placeholder={catalogEntry.apiKeyPlaceholder}
            value={apiKey}
            onChange={setApiKey}
            error={credentialError ?? undefined}
          />
          <div>
            <Button
              variant="primary"
              size="sm"
              disabled={!apiKey.trim()}
              loading={setLlmCredential.isPending}
              onClick={handleSaveCredential}
            >
              Salvar provedor e chave
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-surface-border pt-4">
          <FormField label="Modelo" htmlFor="active-config-model">
            <input
              id="active-config-model"
              list="active-config-model-options"
              value={model}
              onChange={(event) => {
                setModel(event.target.value);
                setModelTouched(true);
              }}
              placeholder={catalogEntry.modelPlaceholder}
              className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] font-mono text-[15px] text-ink"
            />
            <datalist id="active-config-model-options">
              {catalogEntry.modelSuggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </FormField>
          <div>
            <Button
              variant="primary"
              size="sm"
              disabled={!modelTouched || model.trim().length === 0}
              loading={updateRepoConfig.isPending}
              onClick={handleSaveModel}
            >
              Salvar modelo
            </Button>
          </div>
        </div>
      </div>
    </Accordion>
  );
}
