import { useId, useState } from "react";

type TooltipProps = {
  // Usado em aria-label ("Mais informações sobre {label}") — não precisa
  // bater com o texto visível ao lado do trigger, só identificar o que a
  // dica explica pra quem usa leitor de tela.
  label: string;
  content: string;
};

// Extraído de KpiCard (Painel) pra ser reutilizável em qualquer rótulo que
// precise de uma explicação curta — primeiro outro uso: "Temperatura" em
// ReviewParamsSection (Configurações).
//
// O "?" é um <button> de verdade (não <span title>) — o atributo title nativo
// é lento pra aparecer, não funciona em toque, e é fácil de nunca perceber.
// Abre em hover, foco de teclado, ou clique/toque — mesmo padrão de disclosure
// widget já usado no Accordion (aria-expanded + painel só montado quando aberto).
export function Tooltip({ label, content }: TooltipProps) {
  const tooltipId = useId();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
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
          {content}
        </span>
      )}
    </span>
  );
}
