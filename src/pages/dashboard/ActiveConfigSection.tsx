import { useState } from "react";

import { ProviderLogo } from "../../components/ProviderLogo";
import { LLM_PROVIDER_CATALOG } from "../../lib/llm-provider-catalog";
import type { LlmProvider } from "../../types/llm-provider";
import { ActiveConfigModal } from "./ActiveConfigModal";

type ActiveConfigSectionProps = {
  repoId: string;
  currentProvider: LlmProvider | undefined;
  currentModel: string | undefined;
};

// Chip do Painel mostrando só o modelo ativo (18-...md, revisão de UX) — sem
// formulário nenhum aqui, todo o fluxo de edição vive em ActiveConfigModal,
// disparado ao clicar. O nome acessível do botão carrega provedor + modelo por
// extenso mesmo quando a marcação visual mostra só o nome do modelo, pra não
// perder informação pra leitor de tela.
export function ActiveConfigSection({
  repoId,
  currentProvider,
  currentModel,
}: ActiveConfigSectionProps) {
  const [open, setOpen] = useState(false);
  const configured = currentProvider && currentModel;
  const accessibleLabel = configured
    ? `Configuração ativa: ${LLM_PROVIDER_CATALOG[currentProvider].name}, ${currentModel}. Editar.`
    : "Configuração ativa: ainda não configurada. Editar.";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={accessibleLabel}
        className="flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3.5 py-1.5 text-ink transition-colors hover:border-accent"
      >
        {configured && <ProviderLogo provider={currentProvider} size={18} />}
        <span className="font-mono text-[13.5px]">
          {configured ? currentModel : "Configurar modelo"}
        </span>
      </button>
      <ActiveConfigModal
        open={open}
        onClose={() => setOpen(false)}
        repoId={repoId}
        currentProvider={currentProvider}
        currentModel={currentModel}
      />
    </>
  );
}
