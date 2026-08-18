import type { ReactNode, Ref } from "react";

import { cn } from "../lib/cn";

type SelectableCardProps = {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  // Selo curto ao lado do título (ex. "recomendado") — tom próprio (accent),
  // não faz parte de `title` pra não virar texto corrido na mesma cor.
  badge?: string;
  // Ícone opcional à esquerda do bloco de texto (ex.: <ProviderLogo
  // provider="gemini" />) — puramente decorativo, aria-hidden; a informação
  // textual equivalente já vem do `alt` do próprio ícone, se ele tiver um.
  icon?: ReactNode;
  // Opcional: o container do grupo (ex.: Wizard Passo 2) usa isso pra mover o
  // foco de verdade pro card recém-selecionado ao navegar por seta do teclado
  // — React 19 aceita `ref` como prop comum, sem precisar de forwardRef.
  ref?: Ref<HTMLDivElement>;
};

// Uma opção dentro de um grupo de escolha única apresentado como cards (ex.: método
// de integração do wizard). O container pai é responsável por role="radiogroup" e
// pela navegação por seta do teclado entre as opções — este componente só expõe
// role="radio"/aria-checked/roving tabindex. Ver 00-component-library.md,
// "SelectableCard".
export function SelectableCard({
  selected,
  onSelect,
  title,
  description,
  badge,
  icon,
  ref,
}: SelectableCardProps) {
  return (
    <div
      ref={ref}
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-2xl border bg-surface px-6 py-[22px] shadow-lg shadow-black/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected ? "border-accent" : "border-transparent",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-2",
          selected ? "border-accent" : "border-surface-border",
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      {icon && (
        <span aria-hidden="true" className="mt-0.5 flex-none">
          {icon}
        </span>
      )}
      <div>
        <p className="text-[16px] font-medium text-ink">
          {title}
          {badge && <span className="ml-1.5 text-[12.5px] font-normal text-accent">{badge}</span>}
        </p>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>
    </div>
  );
}
