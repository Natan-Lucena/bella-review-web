import { useState } from "react";
import { useParams } from "react-router-dom";

import { CommentRow } from "../../components/CommentRow";
import { EmptyState } from "../../components/EmptyState";
import { LoadMoreButton } from "../../components/LoadMoreButton";
import { PageHeader } from "../../components/PageHeader";
import { Skeleton } from "../../components/Skeleton";
import { useComments } from "../../data/comments";
import type { CommentSeverity, CommentStatus } from "../../types/comment";
import { CommentFilterBar } from "./CommentFilterBar";

const PAGE_SIZE = 20;

function parsePrNumber(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// Tela 10 — Comentários: histórico pesquisável de tudo que a IA já apontou
// no repositório, através de todas as execuções (diferente da Tela 9, que
// mostra só os comentários de UMA execução). Ver PRD 10.
export function CommentsPage() {
  const { id } = useParams<{ id: string }>();
  const repoId = id ?? "";

  const [prNumberInput, setPrNumberInput] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState<CommentSeverity | "all">("all");
  const [status, setStatus] = useState<CommentStatus | "all">("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const isFiltering =
    prNumberInput.trim() !== "" || category.trim() !== "" || severity !== "all" || status !== "all";

  const { data, isPending, isError, isFetching, refetch } = useComments(repoId, {
    prNumber: parsePrNumber(prNumberInput),
    category: category.trim() || undefined,
    severity: severity === "all" ? undefined : severity,
    status: status === "all" ? undefined : status,
    limit,
  });

  function handlePrNumberChange(value: string) {
    setPrNumberInput(value);
    setLimit(PAGE_SIZE);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setLimit(PAGE_SIZE);
  }

  function handleSeverityChange(value: CommentSeverity | "all") {
    setSeverity(value);
    setLimit(PAGE_SIZE);
  }

  function handleStatusChange(value: CommentStatus | "all") {
    setStatus(value);
    setLimit(PAGE_SIZE);
  }

  function handleClearFilters() {
    setPrNumberInput("");
    setCategory("");
    setSeverity("all");
    setStatus("all");
    setLimit(PAGE_SIZE);
  }

  const comments = data?.comments ?? [];
  const total = data?.total ?? 0;
  const hasMore = comments.length < total;
  const isRefetching = isFetching && !isPending;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Comentários" />

      <CommentFilterBar
        prNumber={prNumberInput}
        onPrNumberChange={handlePrNumberChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        severity={severity}
        onSeverityChange={handleSeverityChange}
        status={status}
        onStatusChange={handleStatusChange}
        countLabel={
          !isPending && !isError ? `${total} comentário${total === 1 ? "" : "s"}` : undefined
        }
      />

      {isPending && (
        <div className="flex flex-col gap-2.5">
          <Skeleton shape="block" height="7rem" />
          <Skeleton shape="block" height="7rem" />
          <Skeleton shape="block" height="7rem" />
        </div>
      )}

      {!isPending && isError && (
        <EmptyState
          title="Não foi possível carregar os comentários"
          description="Algo deu errado ao buscar a lista. Tente novamente."
          action={{ label: "Tentar novamente", onClick: () => refetch() }}
        />
      )}

      {!isPending && !isError && comments.length === 0 && !isFiltering && (
        <EmptyState
          title="Nenhum comentário gerado ainda"
          description="Quando a Bella revisar um Pull Request deste repositório, os apontamentos aparecem aqui."
        />
      )}

      {!isPending && !isError && comments.length === 0 && isFiltering && (
        <EmptyState
          title="Nenhum comentário encontrado"
          description="Nenhum comentário bate com esses filtros — tente ajustá-los."
          action={{ label: "Limpar filtros", onClick: handleClearFilters }}
        />
      )}

      {!isPending && !isError && comments.length > 0 && (
        <>
          <div className="flex flex-col gap-2.5">
            {comments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} repoId={repoId} />
            ))}
          </div>
          <LoadMoreButton
            onClick={() => setLimit((current) => current + PAGE_SIZE)}
            loading={isRefetching}
            hasMore={hasMore}
          />
        </>
      )}
    </div>
  );
}
