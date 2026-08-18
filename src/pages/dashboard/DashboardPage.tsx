import { useState } from "react";
import { useParams } from "react-router-dom";

import { Card } from "../../components/Card";
import { KpiCard } from "../../components/KpiCard";
import { PageHeader } from "../../components/PageHeader";
import { Skeleton } from "../../components/Skeleton";
import { useRepoDashboard } from "../../data/dashboard";
import { cn } from "../../lib/cn";
import { ESTIMATED_COST_TOOLTIP } from "../../lib/cost-copy";
import { formatCurrency, formatNumber } from "../../lib/format-number";
import type { DashboardPeriod } from "../../types/dashboard";
import { AcceptanceMetricsSection } from "./AcceptanceMetricsSection";
import { ActiveConfigSection } from "./ActiveConfigSection";
import { PeriodSelector } from "./PeriodSelector";

const REASONING_TOOLTIP =
  'Tokens gastos pelo modelo "pensando" antes de responder — cobrados à parte em modelos com essa capacidade.';
const COST_UNAVAILABLE_HINT = "Não foi possível calcular o custo para o modelo configurado.";
const NO_USAGE_TEXT =
  "Nenhuma execução registrada neste período ainda. Depois que a Action rodar em um Pull Request, os dados aparecem aqui.";

// Mais tokens usados de um período pro outro é um sinal de alerta (gastando
// mais), não de progresso — cores invertidas em relação ao que normalmente se
// esperaria de um indicador "para cima é bom" (ver ScreenDashboard.dc.html do
// protótipo). `null` é um caso à parte (sem período anterior pra comparar,
// não é o mesmo que "sem mudança") — nunca mostrar "↑ 0%" nesse caso.
function changeIndicator(change: number | null): { label: string; className: string } {
  if (change === null) {
    return { label: "sem dado do período anterior", className: "text-ink-muted" };
  }
  const arrow = change > 0 ? "↑" : "↓";
  return {
    label: `${arrow} ${Math.abs(change)}% vs. período anterior`,
    className: change > 0 ? "text-severity-high" : "text-status-completed",
  };
}

// Tela 7 — Painel do Repositório (Overview). O cabeçalho (nome, badge de
// serviceState, abas) já vem do RepoAreaLayout — esta página só implementa o
// conteúdo dentro do <Outlet />. Ver PRD 08.
export function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const repoId = id ?? "";
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const { data: dashboard, isPending } = useRepoDashboard(repoId, period);

  const header = (
    <>
      <PageHeader level="h2" title="Painel" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ActiveConfigSection
          repoId={repoId}
          currentProvider={dashboard?.activeLlmProvider}
          currentModel={dashboard?.activeModel}
        />
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>
    </>
  );

  if (isPending || !dashboard) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton shape="block" height="8.25rem" />
          <Skeleton shape="block" height="8.25rem" />
          <Skeleton shape="block" height="8.25rem" />
          <Skeleton shape="block" height="8.25rem" />
        </div>
      </div>
    );
  }

  const { usage } = dashboard;
  const total = usage.inputTokens + usage.outputTokens + usage.reasoningTokens;
  const change = changeIndicator(usage.percentageChangeFromPreviousPeriod);
  const costValue = usage.estimatedCost;

  return (
    <div className="flex flex-col gap-4">
      {header}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Tokens de entrada" value={formatNumber(usage.inputTokens)} />
        <KpiCard label="Tokens de saída" value={formatNumber(usage.outputTokens)} />
        <KpiCard
          label="Tokens de raciocínio"
          value={formatNumber(usage.reasoningTokens)}
          tooltip={REASONING_TOOLTIP}
        />
        <KpiCard
          label="Custo estimado"
          value={costValue === null ? "—" : formatCurrency(costValue)}
          unavailable={costValue === null}
          tooltip={ESTIMATED_COST_TOOLTIP}
          hint={costValue === null ? COST_UNAVAILABLE_HINT : undefined}
        />
      </div>

      <Card padding="lg">
        <div className="flex flex-wrap items-baseline gap-4">
          <span className="text-[13.5px] text-ink-muted">Total de tokens no período</span>
          <span className="text-[26px] font-light tracking-tight text-ink">
            {formatNumber(total)}
          </span>
          <span className={cn("text-[13.5px]", change.className)}>{change.label}</span>
        </div>
      </Card>

      {total === 0 && (
        <div className="rounded-2xl bg-accent/[0.07] px-5 py-4 text-sm leading-relaxed text-ink-muted">
          {NO_USAGE_TEXT}
        </div>
      )}

      <AcceptanceMetricsSection repoId={repoId} period={period} />
    </div>
  );
}
