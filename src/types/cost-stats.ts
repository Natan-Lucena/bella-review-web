export type CostRunType = "review" | "comment_reply";

export type CostBreakdownEntry = {
  category: string;
  runType: CostRunType;
  totalCost: number;
  count: number;
};

export type CostByModelEntry = {
  provider: string;
  model: string;
  totalCost: number;
  count: number;
  firstUsedAt: string; // ISO
  lastUsedAt: string; // ISO
};

export type CostStats = {
  totalCost: number;
  totalCostByRunType: Array<{ runType: CostRunType; totalCost: number; count: number }>;
  // Já vem ordenado por totalCost descendente do backend (ver PRD 22).
  breakdown: CostBreakdownEntry[];
  // Já vem ordenado por totalCost descendente do backend (ver PRD 23).
  byModel: CostByModelEntry[];
  previousPeriod: { totalCost: number };
};
