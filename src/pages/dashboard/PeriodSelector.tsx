import { cn } from "../../lib/cn";
import type { DashboardPeriod } from "../../types/dashboard";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
];

type PeriodSelectorProps = {
  period: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
};

// Seletor segmentado de período — trocar só muda o parâmetro de
// useRepoDashboard (period já faz parte da queryKey), refazendo a busca sem
// recarregar a página. Ver PRD 08.
export function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Período"
      className="inline-flex gap-1.5 rounded-xl bg-background p-1"
    >
      {PERIODS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={period === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg px-4 py-2 text-[13.5px] font-medium",
            period === option.value ? "bg-surface text-ink" : "text-ink-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
