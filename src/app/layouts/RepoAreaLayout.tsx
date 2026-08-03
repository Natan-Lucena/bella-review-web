import { Navigate, Outlet, useParams } from "react-router-dom";

import { Badge } from "../../components/Badge";
import { Breadcrumb } from "../../components/Breadcrumb";
import { EmptyState } from "../../components/EmptyState";
import { RepoAreaTabs } from "../../components/RepoAreaTabs";
import { useRepo } from "../../data/repos";
import { serviceStateBadgeProps } from "../../lib/status-badges";
import { toServiceState } from "../../lib/service-state";

// Cabeçalho comum às 5 sub-rotas de um repositório (Painel/Execuções/
// Comentários/Configurações) — renderizado uma única vez aqui, com <Outlet />
// para cada sub-tela, diferente do protótipo (que reconstrói esse cabeçalho
// dentro de cada bloco). Ver frontend-especificacao-telas.md, Tela 7.
export function RepoAreaLayout() {
  const { id } = useParams<{ id: string }>();
  const { data: repo, isPending, isError, isFetching, refetch } = useRepo(id ?? "");

  if (!id) {
    return null;
  }

  // Uma falha de rede/500 em useRepos() também deixa `repo` undefined — sem
  // distinguir isso de "esse id não existe", redirecionaria pra Meus
  // Repositórios mesmo quando um simples retry resolveria (mesmo bug já
  // corrigido em ReposListPage, PRD 05).
  if (!isPending && isError) {
    return (
      <EmptyState
        title="Não foi possível carregar este repositório"
        description="Algo deu errado ao buscar os dados. Tente novamente."
        action={{ label: "Tentar novamente", onClick: () => refetch() }}
      />
    );
  }

  // repo_not_found (404) — ver frontend-especificacao-telas.md, Tela 6,
  // "Estados gerais": redireciona silenciosamente pra Meus Repositórios.
  //
  // `isFetching` entra aqui por um bug real pego por um teste de jornada
  // (criar um repo no wizard e navegar direto pro painel dele): a mutation
  // de criação só invalida ["repos"] (não escreve o repo novo no cache), e
  // como não havia nenhum observer ativo de useRepos() durante o wizard, a
  // invalidação não refaz a busca ali — só quando este layout monta e
  // observa a query pela primeira vez. Nesse instante `isPending` já é
  // `false` (o cache antigo, sem o repo novo, ainda está lá), mas um
  // refetch acabou de começar; sem checar `isFetching`, isso redirecionava
  // pra Meus Repositórios antes do refetch trazer o repo recém-criado.
  if (!isPending && !isFetching && !repo) {
    return <Navigate to="/repos" replace />;
  }

  const badge = repo ? serviceStateBadgeProps(toServiceState(repo)) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Breadcrumb
          items={[{ label: "Repositórios", to: "/repos" }, { label: repo?.fullName ?? id }]}
        />
        {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
      </div>
      <RepoAreaTabs repoId={id} />
      <Outlet />
    </div>
  );
}
