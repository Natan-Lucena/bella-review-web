import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartLegendContent, ChartTooltipContent } from "./Chart";
import type { ChartConfig } from "./Chart";
import { pivotByCategory } from "../lib/cost-breakdown";
import { formatCurrency } from "../lib/format-number";
import type { CostBreakdownEntry } from "../types/cost-stats";

const chartConfig: ChartConfig = {
  review: { label: "Revisão padrão", color: "var(--color-accent)" },
  comment_reply: { label: "Comentário no PR", color: "var(--color-severity-medium)" },
};

// Barras horizontais empilhadas (uma por categoria, duas cores: review vs.
// comment_reply) — horizontal porque `category` é texto livre de comentário de
// review e pode ser longo, lê melhor no eixo Y do que espremido como label do
// eixo X. Ver PRD 22 ("gráfico de custos").
export function CostBreakdownChart({ breakdown }: { breakdown: CostBreakdownEntry[] }) {
  const data = pivotByCategory(breakdown);
  const height = Math.max(180, data.length * 48);

  return (
    <ChartContainer height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barGap={4}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="category"
          width={128}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--color-surface-border)", opacity: 0.35 }}
          content={<ChartTooltipContent config={chartConfig} formatter={formatCurrency} />}
        />
        <Legend content={<ChartLegendContent config={chartConfig} />} />
        <Bar dataKey="review" stackId="cost" fill={chartConfig.review.color} radius={[4, 0, 0, 4]} maxBarSize={28} />
        <Bar
          dataKey="comment_reply"
          stackId="cost"
          fill={chartConfig.comment_reply.color}
          radius={[0, 4, 4, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ChartContainer>
  );
}
