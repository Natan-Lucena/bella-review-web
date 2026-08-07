import { useId, useState } from "react";

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
//
// O "?" é um <button> de verdade (não <span title>) — o atributo title nativo
// é lento pra aparecer, não funciona em toque, e é fácil de nunca perceber.
// Abre em hover, foco de teclado, ou clique/toque — mesmo padrão de disclosure
// widget já usado no Accordion (aria-expanded + painel só montado quando aberto).
export function KpiCard({ label, value, tooltip, unavailable = false, hint }: KpiCardProps) {
  const tooltipId = useId();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <Card padding="lg">
      <div className="flex items-center gap-1.5 text-[13.5px] text-ink-muted">
        {label}
        {tooltip && (
          <span className="relative inline-flex">
            <button
              type="button"
              aria-label={`Mais informações sobre ${label}`}
              aria-expanded={tooltipOpen}
              aria-describedby={tooltipOpen ? tooltipId : undefined}
              // Não alterna (toggle): um clique real do mouse já dispara
              // mouseenter logo antes (abrindo via hover) — um toggle aqui
              // fecharia de novo no mesmo gesto. Clique só garante aberto;
              // fechar é sempre via mouseleave/blur, que já cobrem os dois
              // casos (mouse afasta, foco sai) sem esse conflito.
              onClick={() => setTooltipOpen(true)}
              onMouseEnter={() => setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
              onFocus={() => setTooltipOpen(true)}
              onBlur={() => setTooltipOpen(false)}
              className="flex h-[15px] w-[15px] flex-none cursor-help items-center justify-center rounded-full border border-surface-border text-[10px] text-ink-muted"
            >
              ?
            </button>
            {tooltipOpen && (
              <span
                id={tooltipId}
                role="tooltip"
                className="absolute top-full left-1/2 z-10 mt-2 w-56 -translate-x-1/2 rounded-lg bg-surface-border px-3 py-2 text-xs leading-relaxed text-ink shadow-lg shadow-black/30"
              >
                {tooltip}
              </span>
            )}
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
