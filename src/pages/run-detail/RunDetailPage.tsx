import { useParams } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";

// Conteúdo real: PRD 09 (frontend-prds/09-tela-execucoes-e-detalhe.md).
export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  return <PageHeader title={`Execução ${runId}`} description="Detalhe — PRD 09" />;
}
