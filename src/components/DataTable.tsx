import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  getRowKey: (row: T) => string;
};

// Tabela semântica de verdade — substitui o grid de <div> do protótipo (lista de
// execuções). Uma linha clicável tem role="button"/tabIndex/onKeyDown além do
// onClick — nunca depende só de mouse. Ver 00-component-library.md, "DataTable".
export function DataTable<T>({ columns, rows, onRowClick, getRowKey }: DataTableProps<T>) {
  const clickable = Boolean(onRowClick);

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.header}
              scope="col"
              className="border-b border-surface-border px-3 py-2 font-medium text-ink-muted"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={getRowKey(row)}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onRowClick?.(row) : undefined}
            onKeyDown={
              clickable
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onRowClick?.(row);
                    }
                  }
                : undefined
            }
            className={cn(
              "border-b border-surface-border",
              clickable && "cursor-pointer hover:bg-surface",
            )}
          >
            {columns.map((column) => (
              <td key={column.header} className="px-3 py-2 text-ink">
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
