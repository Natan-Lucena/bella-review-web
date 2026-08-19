import { useEffect, useRef, useState } from "react";

import { Button } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { PasswordField } from "../../components/PasswordField";
import { ProviderLogo } from "../../components/ProviderLogo";
import { SelectableCard } from "../../components/SelectableCard";
import { useSetLlmCredential, useUpdateRepoConfig } from "../../data/repos";
import { LLM_PROVIDER_CATALOG, LLM_PROVIDERS } from "../../lib/llm-provider-catalog";
import type { LlmProvider } from "../../types/llm-provider";

type ActiveConfigModalProps = {
  open: boolean;
  onClose: () => void;
  repoId: string;
  currentProvider: LlmProvider | undefined;
  currentModel: string | undefined;
};

// Modal disparado pelo chip de "modelo ativo" do Painel (18-...md, revisão de
// UX). Nasce sempre em modo leitura (provedor/modelo atuais, sem formulário
// nenhum à vista) — só ao clicar em "Editar modelo" os campos de
// provedor/chave/modelo aparecem. `key`-remount via `open ? <Dialog /> : null`
// garante que reabrir o modal sempre volta pro modo leitura, sem precisar de
// um efeito resetando estado (mesma técnica do SecretRevealModal).
export function ActiveConfigModal(props: ActiveConfigModalProps) {
  if (!props.open) {
    return null;
  }
  return <ActiveConfigDialog {...props} />;
}

type DialogProps = Omit<ActiveConfigModalProps, "open">;

function ActiveConfigDialog({ onClose, repoId, currentProvider, currentModel }: DialogProps) {
  const knownProvider = currentProvider ?? "gemini";
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [selectedProvider, setSelectedProvider] = useState<LlmProvider>(knownProvider);
  const [apiKey, setApiKey] = useState("");
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [modelTouched, setModelTouched] = useState(false);

  const setLlmCredential = useSetLlmCredential(repoId);
  const updateRepoConfig = useUpdateRepoConfig(repoId);
  const catalogEntry = LLM_PROVIDER_CATALOG[selectedProvider];
  const configured = currentProvider && currentModel;

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSaveCredential() {
    if (!apiKey.trim()) {
      return;
    }
    setCredentialError(null);
    try {
      await setLlmCredential.mutateAsync({ provider: selectedProvider, apiKey: apiKey.trim() });
      setApiKey("");
      setMode("view");
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
    setModelTouched(false);
    setMode("view");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="active-config-modal-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-surface p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="active-config-modal-title" className="text-lg font-medium text-ink">
            Configuração de LLM
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>

        {mode === "view" ? (
          <div className="mt-5 flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-background px-4 py-3.5">
              {configured ? (
                <>
                  <ProviderLogo provider={currentProvider} size={32} />
                  <div>
                    <p className="text-[15px] font-medium text-ink">
                      {LLM_PROVIDER_CATALOG[currentProvider].name}
                    </p>
                    <p className="font-mono text-sm text-ink-muted">{currentModel}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink-muted">Ainda não configurada</p>
              )}
            </div>
            <Button variant="primary" onClick={() => setMode("edit")}>
              Editar modelo
            </Button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div role="radiogroup" aria-label="Provedor de LLM" className="flex flex-col gap-3">
                {LLM_PROVIDERS.map((option) => (
                  <SelectableCard
                    key={option.provider}
                    selected={selectedProvider === option.provider}
                    onSelect={() => {
                      setSelectedProvider(option.provider);
                      // O provedor mudou — a lista de modelos do dropdown é
                      // outra agora, então qualquer seleção anterior deixa de
                      // fazer sentido.
                      setModel("");
                      setModelTouched(false);
                    }}
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
                <select
                  id="active-config-model"
                  value={model}
                  onChange={(event) => {
                    setModel(event.target.value);
                    setModelTouched(true);
                  }}
                  className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] font-mono text-[15px] text-ink"
                >
                  <option value="" disabled>
                    Selecione um modelo
                  </option>
                  {catalogEntry.modelSuggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion}>
                      {suggestion}
                    </option>
                  ))}
                </select>
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

            <Button variant="secondary" size="sm" onClick={() => setMode("view")}>
              Voltar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
