import type { CostBreakdownEntry } from "../types/cost-stats";

export type CostBreakdownChartRow = { category: string; review: number; comment_reply: number };

// Agrupa por categoria preservando a ordem de chegada de `breakdown` (já vem
// ordenado por custo total descendente do backend, ver PRD 22 — um Map
// preserva ordem de inserção, então NÃO reordenar aqui). Usado por
// CostBreakdownChart; extraído para este módulo (em vez de exportado direto
// do arquivo do componente) porque react-refresh/only-export-components não
// permite um arquivo de componente exportar mais do que componentes.
export function pivotByCategory(breakdown: CostBreakdownEntry[]): CostBreakdownChartRow[] {
  const byCategory = new Map<string, CostBreakdownChartRow>();
  for (const entry of breakdown) {
    const row = byCategory.get(entry.category) ?? { category: entry.category, review: 0, comment_reply: 0 };
    row[entry.runType] = entry.totalCost;
    byCategory.set(entry.category, row);
  }
  return Array.from(byCategory.values());
}
