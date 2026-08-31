export type CostRunType = "review" | "comment_reply";

export type CostBreakdownEntry = {
  category: string;
  runType: CostRunType;
  totalCost: number;
  count: number;
};

export type CostStats = {
  totalCost: number;
  totalCostByRunType: Array<{ runType: CostRunType; totalCost: number; count: number }>;
  // Já vem ordenado por totalCost descendente do backend (ver PRD 22).
  breakdown: CostBreakdownEntry[];
  previousPeriod: { totalCost: number };
};
