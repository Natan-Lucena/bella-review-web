import { useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { Skeleton } from "../../components/Skeleton";
import { usePrompts } from "../../data/prompts";
import type { Prompt } from "../../types/prompt";
import { DeletePromptModal } from "./DeletePromptModal";
import { PromptFormModal } from "./PromptFormModal";

// Tela nova — Meus prompts (PRD 19, seção 4). Integração final (agente F5):
// "Novo prompt"/"Editar" abrem PromptFormModal (criação/edição); "Excluir"
// abre DeletePromptModal. As duas mutations de PromptFormModal/DeletePromptModal
// já invalidam ["prompts"] no sucesso (ver src/data/prompts.ts) — usePrompts()
// aqui refaz o fetch sozinho, sem nenhuma chamada manual de refetch/onSaved.

const CARD_HEIGHT = "5.75rem";

export function PromptsPage() {
  const { data, isPending, isError, refetch } = usePrompts();
  const prompts = data?.prompts ?? [];
  const showEmpty = !isPending && !isError && prompts.length === 0;
  const showList = !isPending && !isError && prompts.length > 0;

  const [isCreating, setIsCreating] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);

  function closeFormModal() {
    setIsCreating(false);
    setEditingPrompt(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          level="h1"
          title="Meus prompts"
          description="Guarde suas próprias instruções de review e escolha qual repositório usa qual prompt."
        />
        {showList && (
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            Novo prompt
          </Button>
        )}
      </div>

      {isPending && (
        <div className="flex flex-col gap-3">
          <Skeleton shape="block" height={CARD_HEIGHT} />
          <Skeleton shape="block" height={CARD_HEIGHT} />
          <Skeleton shape="block" height={CARD_HEIGHT} />
        </div>
      )}

      {!isPending && isError && (
        <EmptyState
          title="Não foi possível carregar seus prompts"
          description="Algo deu errado ao buscar a lista. Tente novamente."
          action={{ label: "Tentar novamente", onClick: () => refetch() }}
        />
      )}

      {showEmpty && (
        <EmptyState
          title="Você ainda não tem nenhum prompt"
          description="Crie o primeiro para dar instruções específicas de review e usá-lo nos seus repositórios."
          action={{ label: "Novo prompt", onClick: () => setIsCreating(true) }}
        />
      )}

      {showList && (
        <div className="flex flex-col gap-3">
          {prompts.map((prompt) => (
            <Card key={prompt.id} padding="lg">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{prompt.name}</p>
                  <p className="mt-1.5 line-clamp-2 text-[13.5px] text-ink-muted">
                    {prompt.content}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="secondary" onClick={() => setEditingPrompt(prompt)}>
                    Editar
                  </Button>
                  <Button variant="secondary" onClick={() => setDeletingPrompt(prompt)}>
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PromptFormModal
        open={isCreating || editingPrompt !== null}
        onClose={closeFormModal}
        initialPrompt={editingPrompt ?? undefined}
      />

      {deletingPrompt && (
        <DeletePromptModal open prompt={deletingPrompt} onClose={() => setDeletingPrompt(null)} />
      )}
    </div>
  );
}
