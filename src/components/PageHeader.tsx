type PageHeaderProps = {
  title: string;
  description?: string;
  level?: "h1" | "h2";
};

// Título + descrição curta — usado em cada passo do wizard e nas seções da landing,
// evitando repetir o par título/parágrafo cru pelo JSX. Ver
// 00-component-library.md, "PageHeader". `level="h1"` deve aparecer só uma vez por
// página renderizada.
const HEADING_SIZE = {
  h1: "text-3xl md:text-4xl font-semibold tracking-tight",
  h2: "text-xl font-medium",
};

export function PageHeader({ title, description, level = "h2" }: PageHeaderProps) {
  const Heading = level;

  return (
    <div className="flex flex-col gap-2">
      <Heading className={`${HEADING_SIZE[level]} text-ink`}>{title}</Heading>
      {description && <p className="text-sm text-ink-muted">{description}</p>}
    </div>
  );
}
