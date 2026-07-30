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

// Altura do Card real de repositório (padding="lg" + duas linhas de texto) —
// mantém o skeleton do mesmo tamanho do conteúdo que ele antecede.
const CARD_HEIGHT = "5.75rem";

export function ReposListPage() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useRepos();
  const repos = data?.repos ?? [];
  const showEmpty = !isPending && !isError && repos.length === 0;
  const showList = !isPending && !isError && repos.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          level="h1"
          title="Meus repositórios"
          description="Cada repositório tem suas próprias credenciais, histórico e consumo."
        />
        {/* Só aparece com a lista não-vazia — no vazio/erro, o CTA (ou o botão
            de tentar de novo) já vive no EmptyState logo abaixo; duplicar
            aqui seria redundante. */}
        {showList && (
          <Button variant="primary" to="/repos/new">
            Adicionar repositório
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
          title="Não foi possível carregar seus repositórios"
          description="Algo deu errado ao buscar a lista. Tente novamente."
          action={{ label: "Tentar novamente", onClick: () => refetch() }}
        />
      )}

      {showEmpty && (
        <EmptyState
          title="Você ainda não tem nenhum repositório"
          description="Cadastre o primeiro para gerar o token da Action e começar a receber revisões nos seus Pull Requests."
          action={{ label: "Adicionar repositório", onClick: () => navigate("/repos/new") }}
        />
      )}

      {showList && (
        <div className="flex flex-col gap-3">
          {repos.map((repo) => {
            const badge = repoConfigBadgeProps(repo.readyForReview);
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

      {/* Medida de transição pra Fase 1 (mock): explica uma divergência
          real do backend hoje (configComplete vs readyForReview), mas é um
          detalhe de implementação que não deveria vazar pro usuário num
          produto final. Remover quando a Fase 2 fizer o backend calcular
          readyForReview de verdade (ver commit que introduziu esse campo). */}
      {showList && (
        <div className="rounded bg-severity-medium/[0.07] px-[18px] py-4 text-[13.5px] leading-[1.65] text-ink-muted">
          <span className="text-severity-medium">Sobre o selo "pronto para revisar":</span> ele é
          calculado aqui no painel a partir de chave do Gemini + PAT do GitHub + (token da Action{" "}
          <span className="italic">ou</span> segredo de webhook). O campo{" "}
          <span className="font-mono">configComplete</span> do backend exige os quatro ao mesmo
          tempo, o que marcaria como incompleto quem seguiu o caminho recomendado.
        </div>
      )}
    </div>
  );
}
