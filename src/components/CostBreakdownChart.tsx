import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { pivotByCategory } from "../lib/cost-breakdown";
import { formatCurrency } from "../lib/format-number";
import type { CostBreakdownEntry, CostRunType } from "../types/cost-stats";

const RUN_TYPE_LABEL: Record<CostRunType, string> = {
  review: "Revisão padrão",
  comment_reply: "Comentário no PR",
};

// Barras horizontais empilhadas (uma por categoria, duas cores: review vs.
// comment_reply) — horizontal porque `category` é texto livre de comentário de
// review e pode ser longo, lê melhor no eixo Y do que espremido como label do
// eixo X. Ver PRD 22 ("gráfico de custos").
export function CostBreakdownChart({ breakdown }: { breakdown: CostBreakdownEntry[] }) {
  const data = pivotByCategory(breakdown);
  const height = Math.max(180, data.length * 44);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(value: number) => formatCurrency(value)} />
        <YAxis type="category" dataKey="category" width={120} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend formatter={(key: string) => RUN_TYPE_LABEL[key as CostRunType]} />
        <Bar dataKey="review" stackId="cost" fill="var(--color-accent)" name="review" />
        <Bar dataKey="comment_reply" stackId="cost" fill="var(--color-severity-medium)" name="comment_reply" />
      </BarChart>
    </ResponsiveContainer>
  );
}
