import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import type { Column } from "../../components/DataTable";
import { DataTable } from "../../components/DataTable";
import { KpiCard } from "../../components/KpiCard";
import { Skeleton } from "../../components/Skeleton";
import { useAcceptanceMetrics } from "../../data/dashboard";
import { ESTIMATED_COST_TOOLTIP } from "../../lib/cost-copy";
import { formatCurrency, formatPercent } from "../../lib/format-number";
import { severityBadgeProps } from "../../lib/status-badges";
import type { AcceptanceMetrics } from "../../types/acceptance-metrics";
import type { DashboardPeriod } from "../../types/dashboard";

type AcceptanceMetricsSectionProps = {
  repoId: string;
  period: DashboardPeriod;
};

const SECTION_DESCRIPTION =
  "Mede o quanto o desenvolvedor concorda com as sugestões da Bella na prática — quantas foram de fato aplicadas, e o custo real de gerar cada uma que emplacou.";
const APPLY_RATE_TOOLTIP =
  "Percentual das sugestões de código geradas neste período que foram aplicadas pelo desenvolvedor (pelo botão de aplicar ou manualmente) — entre as que já tiveram uma decisão tomada.";
const COVERAGE_TOOLTIP =
  "Percentual dos comentários gerados neste período que vieram com uma sugestão de código aplicável, em vez de só uma observação.";
const DECIDED_TOOLTIP =
  "Sugestões ainda pendentes de decisão, ou substituídas por uma versão mais nova antes de o dev decidir, não entram nesta contagem.";
const APPLY_RATE_UNAVAILABLE_HINT = "Nenhuma sugestão decidida neste período ainda";
const COST_UNAVAILABLE_HINT = "Nenhuma sugestão aplicada neste período ainda";
const NO_DATA_TEXT = "Nenhum comentário gerado neste período ainda.";

// null !== 0 aqui — mesma distinção já estabelecida para
// percentageChangeFromPreviousPeriod no bloco de uso (ver PRD 08): "sem dado
// suficiente" e "0%" são informações diferentes.
function rateOrDash(value: number | null): string {
  return value === null ? "—" : formatPercent(value);
}

function previousApplyRateHint(previousValue: number | null): string {
  return previousValue === null
    ? "Sem dado do período anterior"
    : `Período anterior: ${formatPercent(previousValue)}`;
}

type CategoryRow = AcceptanceMetrics["applyRateByCategory"][number];
type SeverityRow = AcceptanceMetrics["applyRateBySeverity"][number];

const categoryColumns: Column<CategoryRow>[] = [
  { header: "Categoria", render: (row) => row.category },
  { header: "Taxa", render: (row) => rateOrDash(row.value) },
  { header: "Decididas", render: (row) => row.decidedCount },
];

const severityColumns: Column<SeverityRow>[] = [
  {
    header: "Severidade",
    render: (row) => {
      const { tone, label } = severityBadgeProps(row.severity);
      return <Badge tone={tone}>{label}</Badge>;
    },
  },
  { header: "Taxa", render: (row) => rateOrDash(row.value) },
  { header: "Decididas", render: (row) => row.decidedCount },
];

// Seção nova do Painel (Tela 7) — apply rate, cobertura acionável vs.
// observação, e custo por sugestão aplicada, consumindo
// GET /repos/:id/acceptance-metrics. Ver PRD 12
// (12-metricas-de-aceitacao-no-painel.md). Extraída da DashboardPage para não
// ultrapassar o limite de ~200 linhas por componente.
export function AcceptanceMetricsSection({ repoId, period }: AcceptanceMetricsSectionProps) {
  const { data: metrics, isPending } = useAcceptanceMetrics(repoId, period);

  const heading = (
    <div>
      <h3 className="text-[17px] font-medium tracking-tight text-ink">Sugestões e aceitação</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{SECTION_DESCRIPTION}</p>
    </div>
  );

  if (isPending || !metrics) {
    return (
      <div className="flex flex-col gap-4">
        {heading}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton shape="block" height="8.25rem" />
          <Skeleton shape="block" height="8.25rem" />
          <Skeleton shape="block" height="8.25rem" />
        </div>
      </div>
    );
  }

  const {
    applyRate,
    applyRateByCategory,
    applyRateBySeverity,
    coverage,
    costPerAppliedSuggestion,
  } = metrics;
  const hasAnyComment = coverage.actionableCount + coverage.observationCount > 0;

  return (
    <div className="flex flex-col gap-4">
      {heading}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          label="Taxa de aplicação"
          value={rateOrDash(applyRate.value)}
          unavailable={applyRate.value === null}
          tooltip={APPLY_RATE_TOOLTIP}
          hint={
            applyRate.value === null
              ? APPLY_RATE_UNAVAILABLE_HINT
              : previousApplyRateHint(metrics.previousPeriod.applyRate.value)
          }
        />
        <KpiCard
          label="Cobertura acionável"
          value={rateOrDash(coverage.actionableShare)}
          unavailable={coverage.actionableShare === null}
          tooltip={COVERAGE_TOOLTIP}
        />
        <KpiCard
          label="Custo por sugestão aplicada"
          value={costPerAppliedSuggestion === null ? "—" : formatCurrency(costPerAppliedSuggestion)}
          unavailable={costPerAppliedSuggestion === null}
          tooltip={ESTIMATED_COST_TOOLTIP}
          hint={costPerAppliedSuggestion === null ? COST_UNAVAILABLE_HINT : undefined}
        />
      </div>

      {hasAnyComment ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card padding="lg">
            <h4 className="mb-1 text-[13.5px] font-medium text-ink-muted">Por categoria</h4>
            <p className="mb-3 text-xs leading-relaxed text-ink-muted/80">
              Taxa de aplicação de cada categoria de achado (segurança, performance, etc). {DECIDED_TOOLTIP}
            </p>
            <DataTable
              columns={categoryColumns}
              rows={applyRateByCategory}
              getRowKey={(row) => row.category}
            />
          </Card>
          <Card padding="lg">
            <h4 className="mb-1 text-[13.5px] font-medium text-ink-muted">Por severidade</h4>
            <p className="mb-3 text-xs leading-relaxed text-ink-muted/80">
              O mesmo recorte, agora por severidade do achado (crítica → baixa).
            </p>
            <DataTable
              columns={severityColumns}
              rows={applyRateBySeverity}
              getRowKey={(row) => row.severity}
            />
          </Card>
        </div>
      ) : (
        <div className="rounded-2xl bg-accent/[0.07] px-5 py-4 text-sm leading-relaxed text-ink-muted">
          {NO_DATA_TEXT}
        </div>
      )}
    </div>
  );
}
