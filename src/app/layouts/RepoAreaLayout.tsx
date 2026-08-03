import { Navigate, Outlet, useParams } from "react-router-dom";

import { Badge } from "../../components/Badge";
import { Breadcrumb } from "../../components/Breadcrumb";
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
  const { data: repo, isPending } = useRepo(id ?? "");

  if (!id) {
    return null;
  }

  // repo_not_found (404) — ver frontend-especificacao-telas.md, Tela 6,
  // "Estados gerais": redireciona silenciosamente pra Meus Repositórios.
  if (!isPending && !repo) {
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
