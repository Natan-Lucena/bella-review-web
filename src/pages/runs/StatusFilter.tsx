import type { ChangeEvent } from "react";

import type { ReviewRunStatus } from "../../types/review-run";

export type StatusFilterValue = ReviewRunStatus | "all";

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "queued", label: "Na fila" },
  { value: "processing", label: "Processando" },
  { value: "completed", label: "Concluída" },
  { value: "failed", label: "Falhou" },
];

type StatusFilterProps = {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
};

// Trocar o valor sempre refaz a busca (o valor entra na queryKey de
// useReviewRuns) — nunca filtra a lista já carregada no client. Ver PRD 09.
export function StatusFilter({ value, onChange }: StatusFilterProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value as StatusFilterValue);
  }

  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor="run-status-filter" className="text-[13.5px] text-ink-muted">
        Status
      </label>
      <select
        id="run-status-filter"
        value={value}
        onChange={handleChange}
        className="rounded-[11px] border border-surface-border bg-background px-3.5 py-2 text-[13.5px] text-ink"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
