import type { CommentSeverity } from "./comment";

export type AcceptanceMetrics = {
  applyRate: { value: number | null; decidedCount: number; appliedCount: number };
  applyRateByCategory: Array<{ category: string; value: number | null; decidedCount: number }>;
  applyRateBySeverity: Array<{
    severity: CommentSeverity;
    value: number | null;
    decidedCount: number;
  }>;
  coverage: {
    actionableCount: number;
    observationCount: number;
    actionableShare: number | null;
  };
  costPerAppliedSuggestion: number | null;
  previousPeriod: {
    applyRate: { value: number | null };
    costPerAppliedSuggestion: number | null;
  };
};
