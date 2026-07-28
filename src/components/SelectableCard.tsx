import { cn } from "../lib/cn";

type SelectableCardProps = {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
};

// Uma opção dentro de um grupo de escolha única apresentado como cards (ex.: método
// de integração do wizard). O container pai é responsável por role="radiogroup" e
// pela navegação por seta do teclado entre as opções — este componente só expõe
// role="radio"/aria-checked/roving tabindex. Ver 00-component-library.md,
// "SelectableCard".
export function SelectableCard({ selected, onSelect, title, description }: SelectableCardProps) {
  return (
    <div
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
        "cursor-pointer rounded-lg border-2 bg-surface p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected ? "border-accent" : "border-surface-border",
      )}
    >
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
    </div>
  );
}
