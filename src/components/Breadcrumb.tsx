import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

// Trilha "onde estou" — o último item (sem `to`) é a página atual, não é um link.
// Ver 00-component-library.md, "Breadcrumb".
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.to && !isLast ? (
                <Link to={item.to} className="hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "text-ink" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
