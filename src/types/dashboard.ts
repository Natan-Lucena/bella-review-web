import type { ServiceState } from "./repo";

export type DashboardPeriod = "7d" | "30d" | "90d";

export type DashboardUsage = {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  // Sempre null na prática hoje — o backend nunca calcula o custo real por
  // modelo (ver frontend-especificacao-telas.md, "Notas para produto/design", item 2).
  estimatedCost: number | null;
  // null quando o período anterior não teve nenhum uso (evita divisão por
  // zero no backend) — tratar diferente de 0%, ver Tela 7.
  percentageChangeFromPreviousPeriod: number | null;
};

export type Dashboard = {
  period: DashboardPeriod;
  usage: DashboardUsage;
  activeLlmProvider: string;
  activeModel: string;
  serviceState: ServiceState;
};
