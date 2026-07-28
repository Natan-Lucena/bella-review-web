type PageHeaderProps = {
  title: string;
  description?: string;
  level?: "h1" | "h2";
};

// Título + descrição curta — usado em cada passo do wizard e nas seções da landing,
// evitando repetir o par título/parágrafo cru pelo JSX. Ver
// 00-component-library.md, "PageHeader". `level="h1"` deve aparecer só uma vez por
// página renderizada.
export function PageHeader({ title, description, level = "h2" }: PageHeaderProps) {
  const Heading = level;

  return (
    <div className="flex flex-col gap-1">
      <Heading className="text-xl font-medium text-ink">{title}</Heading>
      {description && <p className="text-sm text-ink-muted">{description}</p>}
    </div>
  );
}
