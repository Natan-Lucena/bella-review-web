import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltipContent } from "./Chart";
import type { ChartConfig } from "./Chart";
import { formatCurrency } from "../lib/format-number";
import type { CostByModelEntry } from "../types/cost-stats";

const chartConfig: ChartConfig = {
  totalCost: { label: "Custo total", color: "var(--color-accent)" },
};

// Barras horizontais (uma por par provider/model), NÃO empilhadas — ao
// contrário de CostBreakdownChart (categoria × runType), aqui não há uma
// segunda dimensão: cada barra já é o total daquele modelo. Ordem vem de
// `byModel` (já ordenado por totalCost descendente pelo backend, ver PRD 23 em
// types/cost-stats.ts) — não reordenar aqui. Ver PRD 23
// (23-custo-por-modelo.md).
export function ModelCostChart({ byModel }: { byModel: CostByModelEntry[] }) {
  const data = byModel.map((entry) => ({ label: `${entry.provider} / ${entry.model}`, totalCost: entry.totalCost }));
  const height = Math.max(140, data.length * 44);

  return (
    <ChartContainer height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={168}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--color-surface-border)", opacity: 0.35 }}
          content={<ChartTooltipContent config={chartConfig} formatter={formatCurrency} />}
        />
        <Bar dataKey="totalCost" fill={chartConfig.totalCost.color} radius={[0, 4, 4, 0]} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  );
}
