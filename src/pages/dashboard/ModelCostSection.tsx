import { Card } from "../../components/Card";
import type { Column } from "../../components/DataTable";
import { DataTable } from "../../components/DataTable";
import { ModelCostChart } from "../../components/ModelCostChart";
import { Skeleton } from "../../components/Skeleton";
import { useCostStats } from "../../data/dashboard";
import { formatDate } from "../../lib/format-date";
import { formatCurrency } from "../../lib/format-number";
import type { CostByModelEntry } from "../../types/cost-stats";
import type { DashboardPeriod } from "../../types/dashboard";

type ModelCostSectionProps = {
  repoId: string;
  period: DashboardPeriod;
};

const SECTION_DESCRIPTION =
  "Quanto cada modelo de LLM configurado ao longo do tempo custou neste período — útil pra comparar antes/depois de trocar de provedor ou modelo. Execuções de antes desse rastreamento existir não aparecem aqui.";
const NO_DATA_TEXT = "Nenhum custo por modelo registrado neste período ainda.";

const modelColumns: Column<CostByModelEntry>[] = [
  { header: "Modelo", render: (row) => `${row.provider} / ${row.model}` },
  { header: "Custo total", render: (row) => formatCurrency(row.totalCost) },
  { header: "Execuções", render: (row) => row.count },
  // "Usado de/até" é a janela de datas em que esse modelo gerou custo dentro
  // do período selecionado — não a data em que ele foi configurado no
  // repositório, que pode ser bem anterior.
  { header: "Usado de", render: (row) => formatDate(row.firstUsedAt) },
  { header: "Usado até", render: (row) => formatDate(row.lastUsedAt) },
];

// Seção nova do Painel (Tela 7) — custo por par provider/modelo, consumindo o
// mesmo GET /repos/:id/cost-stats já usado por CostBreakdownSection (campo
// `byModel`, ver PRD 22). Mesmo esqueleto de loading/vazio das outras seções
// do Painel, pra não divergir a experiência. Ver PRD 23
// (23-custo-por-modelo.md).
export function ModelCostSection({ repoId, period }: ModelCostSectionProps) {
  const { data: stats, isPending } = useCostStats(repoId, period);

  const heading = (
    <div>
      <h3 className="text-[17px] font-medium tracking-tight text-ink">Custo por modelo</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{SECTION_DESCRIPTION}</p>
    </div>
  );

  if (isPending || !stats) {
    return (
      <div className="flex flex-col gap-4">
        {heading}
        <Skeleton shape="block" height="8.25rem" />
      </div>
    );
  }

  const { byModel } = stats;

  if (byModel.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {heading}
        <div className="rounded-2xl bg-accent/[0.07] px-5 py-4 text-sm leading-relaxed text-ink-muted">
          {NO_DATA_TEXT}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {heading}

      <Card padding="lg">
        <ModelCostChart byModel={byModel} />
      </Card>

      <Card padding="lg">
        <DataTable
          columns={modelColumns}
          rows={byModel}
          getRowKey={(row) => `${row.provider}/${row.model}`}
        />
      </Card>
    </div>
  );
}
