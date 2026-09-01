import type { ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "../lib/cn";

export type ChartConfig = Record<string, { label: string; color: string }>;

type ChartContainerProps = {
  height: number;
  children: ReactElement;
};

// Wrapper fino sobre ResponsiveContainer, mesmo espírito do ChartContainer do
// shadcn/ui (https://ui.shadcn.com/docs/components/chart) adaptado aos tokens
// de cor já existentes em index.css — não precisa injetar CSS vars por
// instância, elas já são globais. Só normaliza o visual "cru" que o recharts
// aplica por padrão (contorno de foco no SVG, cor de texto default) pros
// tokens semânticos deste projeto.
export function ChartContainer({ height, children }: ChartContainerProps) {
  return (
    <div
      className={cn(
        "[&_.recharts-cartesian-axis-tick_text]:fill-ink-muted",
        "[&_.recharts-cartesian-grid_line]:stroke-surface-border",
        "[&_.recharts-cartesian-axis-line]:stroke-surface-border",
        "[&_svg]:outline-none",
      )}
    >
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

type TooltipPayloadEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  config: ChartConfig;
  formatter?: (value: number) => string;
};

// Substitui o tooltip default (cinza cru, sem indicador de cor) por um card
// no mesmo estilo visual do resto do painel — mesma ideia do
// ChartTooltipContent do shadcn/ui, mas usando Card/tokens já existentes
// aqui em vez de reimplementar o sistema de temas deles.
export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  formatter,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="min-w-[10rem] rounded-lg border border-surface-border bg-surface px-3 py-2 shadow-lg shadow-black/30">
      {label && <div className="mb-1.5 text-xs font-medium text-ink">{label}</div>}
      <div className="flex flex-col gap-1">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? "");
          const meta = config[key];
          const numericValue = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
          return (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-2 flex-none rounded-full"
                style={{ backgroundColor: entry.color ?? meta?.color }}
              />
              <span className="text-ink-muted">{meta?.label ?? entry.name}</span>
              <span className="ml-auto font-medium text-ink">
                {formatter ? formatter(numericValue) : numericValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type LegendPayloadEntry = {
  dataKey?: string | number;
  value?: string;
  color?: string;
};

type ChartLegendContentProps = {
  payload?: LegendPayloadEntry[];
  config: ChartConfig;
};

// Mesma ideia: bolinha colorida + rótulo legível, em vez do quadradinho
// default do recharts com o nome cru da dataKey.
export function ChartLegendContent({ payload, config }: ChartLegendContentProps) {
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
      {payload.map((entry) => {
        const key = String(entry.dataKey ?? entry.value ?? "");
        const meta = config[key];
        return (
          <div key={key} className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span
              className="h-2 w-2 flex-none rounded-full"
              style={{ backgroundColor: entry.color ?? meta?.color }}
            />
            {meta?.label ?? entry.value}
          </div>
        );
      })}
    </div>
  );
}
