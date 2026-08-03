import type { ChangeEvent } from "react";

import type { CommentSeverity, CommentStatus } from "../../types/comment";

// Categorias vistas nos fixtures (PRD 02) — só sugestões de um <input> de
// texto livre, nunca uma lista fechada (ver frontend-especificacao-telas.md,
// Tela 10: category é texto livre escolhido pela IA, diferente de severity).
const CATEGORY_SUGGESTIONS = [
  "security",
  "performance",
  "correctness",
  "error-handling",
  "readability",
  "testing",
];

const SEVERITY_OPTIONS: { value: CommentSeverity | "all"; label: string }[] = [
  { value: "all", label: "Todas as severidades" },
  { value: "critical", label: "Crítica" },
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

const STATUS_OPTIONS: { value: CommentStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos os status" },
  { value: "generated", label: "Gerado" },
  { value: "published", label: "Publicado no GitHub" },
  { value: "discarded", label: "Descartado" },
  { value: "outdated", label: "Desatualizado" },
];

const INPUT_CLASS =
  "w-full rounded-[11px] border border-surface-border bg-background px-3.5 py-2.5 text-[13.5px] text-ink outline-none";

type CommentFilterBarProps = {
  prNumber: string;
  onPrNumberChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  severity: CommentSeverity | "all";
  onSeverityChange: (value: CommentSeverity | "all") => void;
  status: CommentStatus | "all";
  onStatusChange: (value: CommentStatus | "all") => void;
  countLabel?: string;
};

// Bloco de filtros da Tela 10 — os 4 campos são opcionais e combináveis, e
// cada mudança refaz a busca no servidor (queryKey inclui os filtros, ver
// useComments) — nunca filtra a lista já carregada no client. Ver PRD 10.
export function CommentFilterBar({
  prNumber,
  onPrNumberChange,
  category,
  onCategoryChange,
  severity,
  onSeverityChange,
  status,
  onStatusChange,
  countLabel,
}: CommentFilterBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 rounded-2xl bg-surface p-4.5 shadow-lg shadow-black/20 md:grid-cols-[130px_1fr_170px_190px_auto] md:items-center">
      <input
        type="number"
        inputMode="numeric"
        value={prNumber}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onPrNumberChange(event.target.value)}
        placeholder="PR nº"
        aria-label="Filtrar por número do PR"
        className={INPUT_CLASS}
      />
      <input
        type="text"
        list="comment-category-suggestions"
        value={category}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onCategoryChange(event.target.value)}
        placeholder="categoria (texto livre)"
        aria-label="Filtrar por categoria"
        className={INPUT_CLASS}
      />
      <datalist id="comment-category-suggestions">
        {CATEGORY_SUGGESTIONS.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      <select
        value={severity}
        onChange={(event) => onSeverityChange(event.target.value as CommentSeverity | "all")}
        aria-label="Filtrar por severidade"
        className={INPUT_CLASS}
      >
        {SEVERITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as CommentStatus | "all")}
        aria-label="Filtrar por status"
        className={INPUT_CLASS}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {countLabel && (
        <span className="text-[13px] whitespace-nowrap text-ink-muted">{countLabel}</span>
      )}
    </div>
  );
}
