import { Button } from "./Button";

type LoadMoreButtonProps = {
  onClick: () => void;
  loading?: boolean;
  hasMore: boolean;
};

// Paginação incremental ("carregar mais"), não numerada — ver
// frontend-especificacao-telas.md e 00-component-library.md, "LoadMoreButton".
export function LoadMoreButton({ onClick, loading = false, hasMore }: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className="flex justify-center py-3">
      <Button variant="secondary" onClick={onClick} loading={loading}>
        Carregar mais
      </Button>
    </div>
  );
}
