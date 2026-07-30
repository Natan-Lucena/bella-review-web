import { useNavigate } from "react-router-dom";

import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { PageHeader } from "../../components/PageHeader";
import { Skeleton } from "../../components/Skeleton";
import { useRepos } from "../../data/repos";
import { repoConfigBadgeProps } from "../../lib/status-badges";

// Tela 4 — Meus Repositórios (frontend-especificacao-telas.md). Hub central
// pós-login: cada card já mostra o suficiente pra saber se aquele repositório
// está pronto pra uso sem precisar entrar. A sessão mockada "expirada" é
// tratada genericamente por RequireAuth na definição de rotas (App.tsx) —
// nada específico a fazer aqui.
export function ReposListPage() {
  const navigate = useNavigate();
  const { data, isPending } = useRepos();
  const repos = data?.repos ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          level="h1"
          title="Meus repositórios"
          description="Cada repositório tem suas próprias credenciais, histórico e consumo."
        />
        {/* Só aparece com a lista não-vazia — no vazio, o CTA já vive no
            EmptyState logo abaixo; duplicar aqui seria redundante. */}
        {!isPending && repos.length > 0 && (
          <Button variant="primary" to="/repos/new">
            Adicionar repositório
          </Button>
        )}
      </div>

      {isPending && (
        <div className="flex flex-col gap-3">
          <Skeleton shape="block" height="5.75rem" />
          <Skeleton shape="block" height="5.75rem" />
          <Skeleton shape="block" height="5.75rem" />
        </div>
      )}

      {!isPending && repos.length === 0 && (
        <EmptyState
          title="Você ainda não tem nenhum repositório"
          description="Cadastre o primeiro para gerar o token da Action e começar a receber revisões nos seus Pull Requests."
          action={{ label: "Adicionar repositório", onClick: () => navigate("/repos/new") }}
        />
      )}

      {!isPending && repos.length > 0 && (
        <div className="flex flex-col gap-3">
          {repos.map((repo) => {
            const badge = repoConfigBadgeProps(repo.configComplete);
            return (
              <Card
                key={repo.id}
                as="button"
                padding="lg"
                onClick={() => navigate(`/repos/${repo.id}`)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[16.5px] font-medium text-ink">{repo.fullName}</p>
                    <p className="mt-1.5 text-[13.5px] text-ink-muted">
                      {repo.model ? `${repo.llmProvider} · ${repo.model}` : "Ainda não configurado"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                    <span aria-hidden="true" className="text-xl text-ink-muted">
                      ›
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
