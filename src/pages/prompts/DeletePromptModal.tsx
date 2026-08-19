import { useEffect, useRef, useState } from "react";

import { Button } from "../../components/Button";
import { useDeletePrompt } from "../../data/prompts";
import { useRepos } from "../../data/repos";
import type { Prompt } from "../../types/prompt";

type DeletePromptModalProps = {
  open: boolean;
  prompt: Prompt;
  onClose: () => void;
  // Callback opcional pra um pai reagir depois de uma exclusão bem-sucedida
  // (ex.: PromptFormModal também aberto pra edição do mesmo prompt precisa
  // fechar junto — ver F5, integração final de PromptsPage.tsx).
  onDeleted?: () => void;
};

// Confirmação antes do primeiro DELETE de toda a plataforma (PRD 19, seção
// 4). Diferente de SecretRevealModal (segredo irrecuperável, sem Esc/clique-
// fora), apagar um prompt é uma ação da qual dá pra se recuperar em espírito
// — o usuário sempre pode selecionar outro prompt pro repositório depois —
// então este modal fecha por Esc/clique-fora/Cancelar como ActiveConfigModal,
// sem checkbox de confirmação em duas etapas.
export function DeletePromptModal({ open, prompt, onClose, onDeleted }: DeletePromptModalProps) {
  if (!open) {
    return null;
  }
  return (
    <DeletePromptDialog key={prompt.id} prompt={prompt} onClose={onClose} onDeleted={onDeleted} />
  );
}

type DeletePromptDialogProps = Omit<DeletePromptModalProps, "open">;

function DeletePromptDialog({ prompt, onClose, onDeleted }: DeletePromptDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // affectedRepos: calculado client-side filtrando useRepos() por
  // promptId === prompt.id, sem endpoint dedicado "quem usa este prompt" —
  // ver PRD 19, seção 4.
  const { data: reposData } = useRepos();
  const affectedRepos = (reposData?.repos ?? []).filter((repo) => repo.promptId === prompt.id);

  const deletePrompt = useDeletePrompt();

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

  async function handleDelete() {
    setError(null);
    try {
      await deletePrompt.mutateAsync(prompt.id);
      onClose();
      onDeleted?.();
    } catch (cause) {
      console.error(`Failed to delete prompt ${prompt.id}:`, cause);
      setError("Não foi possível apagar agora. Tente novamente.");
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
        aria-labelledby="delete-prompt-modal-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-lg bg-surface p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-prompt-modal-title" className="text-lg font-medium text-ink">
          Excluir prompt
        </h2>

        {affectedRepos.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            Tem certeza que quer apagar o prompt <strong className="text-ink">{prompt.name}</strong>
            ? Essa ação não pode ser desfeita.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-sm text-ink-muted">
              Os repositórios a seguir usam <strong className="text-ink">{prompt.name}</strong> e
              vão voltar para o Bella Default Skill se você apagar este prompt:
            </p>
            <ul className="list-disc rounded-[12px] border border-surface-border bg-background px-8 py-3 text-sm text-ink">
              {affectedRepos.map((repo) => (
                <li key={repo.id}>{repo.fullName}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-3 text-sm text-severity-critical">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" loading={deletePrompt.isPending} onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
