import { useId, useState } from "react";
import type { ReactNode } from "react";

type AccordionProps = {
  // ReactNode (não só string) pra permitir um cabeçalho composto (ex.: título +
  // texto de status) — o nome acessível do botão continua sendo todo o texto
  // visível ali dentro, então isso não quebra leitor de tela.
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
};

// Seção expansível/recolhível — padrão WAI-ARIA de disclosure widget. Ver
// 00-component-library.md, "Accordion".
export function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="rounded-lg bg-surface">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-ink"
      >
        {title}
        <Chevron open={open} />
      </button>
      {open && (
        <div id={panelId} className="border-t border-surface-border px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={open ? "rotate-180 transition-transform" : "transition-transform"}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
