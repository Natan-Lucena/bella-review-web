import { Button } from "./Button";
import { Logo } from "./Logo";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
};

// Ver 00-component-library.md, "EmptyState" — o mascote na ilustração é requisito,
// não sugestão (ver frontend-especificacao-telas.md, "Identidade visual").
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Logo size={64} />
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      <p className="max-w-sm text-sm text-ink-muted">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
