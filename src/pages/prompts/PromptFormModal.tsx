import { useEffect, useRef, useState } from "react";

import { Button } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { Textarea } from "../../components/Textarea";
import { useCreatePrompt, useUpdatePrompt } from "../../data/prompts";
import { ApiError } from "../../lib/api-error";
import type { Prompt } from "../../types/prompt";

type PromptFormModalProps = {
  open: boolean;
  onClose: () => void;
  // Presente = modo edição (usa useUpdatePrompt); ausente = modo criação
  // (usa useCreatePrompt) — mesmo modal reutilizado para os dois fluxos, ver
  // PRD 19, seção 4.
  initialPrompt?: Prompt;
};

// Modal de criar/editar prompt. Mesmo padrão estrutural de ActiveConfigModal
// (overlay + role="dialog" + Esc/clique-fora fecham) — mais simples que ele,
// sem alternância entre modo leitura/edição, porque não há segredo
// irrecuperável em jogo aqui (diferente de SecretRevealModal).
export function PromptFormModal(props: PromptFormModalProps) {
  if (!props.open) {
    return null;
  }
  return <PromptFormDialog {...props} />;
}

type DialogProps = Omit<PromptFormModalProps, "open">;

const GENERIC_ERROR = "Não foi possível salvar agora. Tente novamente.";
const DUPLICATE_NAME_ERROR = "Você já tem um prompt com esse nome.";

function PromptFormDialog({ onClose, initialPrompt }: DialogProps) {
  const isEdit = initialPrompt !== undefined;
  const [name, setName] = useState(initialPrompt?.name ?? "");
  const [content, setContent] = useState(initialPrompt?.content ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt(initialPrompt?.id ?? "");
  const mutation = isEdit ? updatePrompt : createPrompt;

  const canSave = name.trim().length > 0 && content.trim().length > 0;

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

  async function handleSave() {
    if (!canSave) {
      return;
    }
    setErrorMessage(null);
    try {
      const input = { name: name.trim(), content: content.trim() };
      if (isEdit) {
        await updatePrompt.mutateAsync(input);
      } else {
        await createPrompt.mutateAsync(input);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save prompt:", error);
      if (error instanceof ApiError && error.code === "prompt_name_already_exists") {
        setErrorMessage(DUPLICATE_NAME_ERROR);
      } else {
        setErrorMessage(GENERIC_ERROR);
      }
    }
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
        aria-labelledby="prompt-form-modal-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="prompt-form-modal-title" className="text-lg font-medium text-ink">
            {isEdit ? "Editar prompt" : "Novo prompt"}
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

        <div className="mt-5 flex flex-col gap-4">
          <FormField label="Nome" htmlFor="prompt-form-name">
            <input
              id="prompt-form-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Security-first review"
              className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] text-[15px] text-ink"
            />
          </FormField>

          <Textarea
            label="Conteúdo"
            htmlFor="prompt-form-content"
            value={content}
            onChange={setContent}
            placeholder="Instruções que o Bella deve seguir ao revisar este repositório..."
          />

          {errorMessage && (
            <p role="alert" className="text-[13.5px] text-severity-critical">
              {errorMessage}
            </p>
          )}

          <div>
            <Button
              variant="primary"
              disabled={!canSave}
              loading={mutation.isPending}
              onClick={handleSave}
            >
              Salvar
            </Button>
          </div>
        </div>
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
