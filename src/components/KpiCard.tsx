import { useId } from "react";

import { cn } from "../lib/cn";
import { Card } from "./Card";

type KpiCardProps = {
  label: string;
  value: string;
  tooltip?: string;
  unavailable?: boolean;
  // Legenda pequena abaixo do valor — hoje só usada por "Custo estimado" pra
  // explicar por que o valor é "—" (ver 08-tela-painel.md, "Casos especiais").
  hint?: string;
};

// Especializa Card pra uma métrica única (rótulo + valor grande), com tooltip
// opcional e um modo "indisponível" (esmaece o valor) — evita 4 Card quase
// idênticos com ifs espalhados no Painel. Ver 00-component-library.md, "KpiCard".
export function KpiCard({ label, value, tooltip, unavailable = false, hint }: KpiCardProps) {
  const tooltipId = useId();

  return (
    <Card padding="lg">
      <div className="flex items-center gap-1.5 text-[13.5px] text-ink-muted">
        {label}
        {tooltip && (
          <span
            title={tooltip}
            aria-describedby={tooltipId}
            className="flex h-[15px] w-[15px] flex-none cursor-help items-center justify-center rounded-full border border-surface-border text-[10px] text-ink-muted"
          >
            ?
            <span id={tooltipId} className="sr-only">
              {tooltip}
            </span>
          </span>
        )}
      </div>
      <div
        className={cn(
          "mt-3 text-[30px] font-light tracking-tight",
          unavailable ? "text-ink-muted" : "text-ink",
        )}
      >
        {value}
      </div>
      {hint && <p className="mt-2 text-xs leading-relaxed text-ink-muted">{hint}</p>}
    </Card>
  );
}
