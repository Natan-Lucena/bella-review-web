import { useState } from "react";

import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import type { GithubRepoOption } from "../../../types/github";

type GithubRepoPickerProps = {
  repos: GithubRepoOption[];
  isCreating: boolean;
  error: string | null;
  onSelect: (repo: GithubRepoOption) => void;
  onBack: () => void;
};

// Sub-passo 1b (PRD 11) — lista os repositórios que o PAT informado em 1a
// enxerga. Filtro é só client-side (a lista inteira já veio numa chamada só).
// Um item com `alreadyAdded` fica desabilitado — não faz sentido cadastrar de
// novo um repositório que já está na conta.
export function GithubRepoPicker({ repos, isCreating, error, onSelect, onBack }: GithubRepoPickerProps) {
  const [query, setQuery] = useState("");
  const filtered = repos.filter((repo) =>
    repo.fullName.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        level="h1"
        title="Escolha o repositório"
        description="Repositórios que o token informado consegue ver."
      />

      <div className="mt-6">
        <label htmlFor="wizard-repo-search" className="sr-only">
          Buscar repositório
        </label>
        <input
          id="wizard-repo-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar repositório..."
          className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] text-[15px] text-ink"
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[13.5px] text-severity-critical">
          {error}
        </p>
      )}

      <ul className="mt-4 flex max-h-80 flex-col gap-2 overflow-y-auto">
        {filtered.map((repo) => (
          <li key={repo.fullName}>
            <button
              type="button"
              disabled={repo.alreadyAdded || isCreating}
              onClick={() => onSelect(repo)}
              className="flex w-full items-center justify-between gap-3 rounded-[12px] border border-surface-border bg-surface px-[15px] py-[13px] text-left text-[15px] text-ink enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="truncate font-mono">{repo.fullName}</span>
              <span className="flex flex-none gap-1.5">
                {repo.private && <Badge tone="neutral">privado</Badge>}
                {repo.alreadyAdded && <Badge tone="info">já adicionado</Badge>}
              </span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-[13.5px] text-ink-muted">Nenhum repositório encontrado.</li>
        )}
      </ul>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
