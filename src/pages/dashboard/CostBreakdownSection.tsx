import { Card } from "../../components/Card";
import { CostBreakdownChart } from "../../components/CostBreakdownChart";
import { KpiCard } from "../../components/KpiCard";
import { Skeleton } from "../../components/Skeleton";
import { useCostStats } from "../../data/dashboard";
import { formatCurrency } from "../../lib/format-number";
import type { CostRunType } from "../../types/cost-stats";
import type { DashboardPeriod } from "../../types/dashboard";

type CostBreakdownSectionProps = {
  repoId: string;
  period: DashboardPeriod;
};

const RUN_TYPE_LABEL: Record<CostRunType, string> = {
  review: "Revisão padrão",
  comment_reply: "Comentário no PR",
};

const NO_DATA_TEXT = "Nenhum custo registrado neste período ainda.";

// Seção nova do Painel (Tela 7) — custo por categoria e por tipo de execução
// (review vs. comment_reply), consumindo GET /repos/:id/cost-stats. Ver PRD 22
// (22-grafico-de-custos.md). Mesmo esqueleto de loading/vazio de
// AcceptanceMetricsSection, para não divergir a experiência entre as duas
// seções do Painel.
export function CostBreakdownSection({ repoId, period }: CostBreakdownSectionProps) {
  const { data: stats, isPending } = useCostStats(repoId, period);

  const heading = <h3 className="text-[17px] font-medium tracking-tight text-ink">Custo por categoria</h3>;

  if (isPending || !stats) {
    return (
      <div className="flex flex-col gap-4">
        {heading}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton shape="block" height="8.25rem" />
          <Skeleton shape="block" height="8.25rem" />
        </div>
      </div>
    );
  }

  const { breakdown, totalCostByRunType } = stats;

  if (breakdown.length === 0) {
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {totalCostByRunType.map((entry) => (
          <KpiCard
            key={entry.runType}
            label={RUN_TYPE_LABEL[entry.runType]}
            value={formatCurrency(entry.totalCost)}
          />
        ))}
      </div>

      <Card padding="lg">
        <CostBreakdownChart breakdown={breakdown} />
      </Card>
    </div>
  );
}
