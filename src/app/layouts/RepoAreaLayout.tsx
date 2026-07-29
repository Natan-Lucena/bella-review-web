import { Outlet, useParams } from "react-router-dom";

import { Badge } from "../../components/Badge";
import { Breadcrumb } from "../../components/Breadcrumb";
import { RepoAreaTabs } from "../../components/RepoAreaTabs";

// Cabeçalho comum às 5 sub-rotas de um repositório (Painel/Execuções/
// Comentários/Configurações) — renderizado uma única vez aqui, com <Outlet />
// para cada sub-tela, diferente do protótipo (que reconstrói esse cabeçalho
// dentro de cada bloco). Ver frontend-especificacao-telas.md, Tela 7.
//
// TODO(PRD 02): nome do repositório e badge de serviceState são placeholders
// — ainda não existe uma camada de dados (useRepo(id)) para buscar o valor
// real. A estrutura do cabeçalho já é a definitiva, só o conteúdo é mockado
// aqui.
export function RepoAreaLayout() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  const placeholderFullName = `Repositório ${id}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Breadcrumb
          items={[{ label: "Repositórios", to: "/repos" }, { label: placeholderFullName }]}
        />
        <Badge tone="success">Ativo</Badge>
      </div>
      <RepoAreaTabs repoId={id} />
      <Outlet />
    </div>
  );
}
