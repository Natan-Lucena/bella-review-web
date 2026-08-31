import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "../lib/format-number";
import type { CostByModelEntry } from "../types/cost-stats";

// Barras horizontais (uma por par provider/model), NÃO empilhadas — ao
// contrário de CostBreakdownChart (categoria × runType), aqui não há uma
// segunda dimensão: cada barra já é o total daquele modelo. Ordem vem de
// `byModel` (já ordenado por totalCost descendente pelo backend, ver PRD 23 em
// types/cost-stats.ts) — não reordenar aqui. Ver PRD 23
// (23-custo-por-modelo.md).
export function ModelCostChart({ byModel }: { byModel: CostByModelEntry[] }) {
  const data = byModel.map((entry) => ({ label: `${entry.provider} / ${entry.model}`, totalCost: entry.totalCost }));
  const height = Math.max(140, data.length * 40);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(value: number) => formatCurrency(value)} />
        <YAxis type="category" dataKey="label" width={160} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Bar dataKey="totalCost" fill="var(--color-accent)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
