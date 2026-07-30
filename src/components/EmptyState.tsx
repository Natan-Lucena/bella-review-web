import { Button } from "./Button";
import { Logo } from "./Logo";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
};

// Ver 00-component-library.md, "EmptyState" — o mascote na ilustração é requisito,
// não sugestão (ver frontend-especificacao-telas.md, "Identidade visual"). O
// container próprio (não só conteúdo centralizado solto) espelha
// EmptyState.dc.html do protótipo componentizado.
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[20px] bg-surface px-10 py-16 text-center shadow-lg shadow-black/25">
      <div className="flex justify-center">
        <Logo size={112} />
      </div>
      <h2 className="mt-5 text-[22px] font-normal tracking-tight text-ink">{title}</h2>
      <p className="mx-auto mt-2.5 max-w-xl text-[15px] leading-relaxed text-ink-muted">
        {description}
      </p>
      {action && (
        <div className="mt-7 flex justify-center">
          <Button variant="primary" size="lg" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
