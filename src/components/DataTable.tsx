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
//
// `border-separate` + `border-spacing-y` (em vez do <tr> com border-bottom de
// antes) é o que permite cada linha ter cantos arredondados e respiro entre
// si, parecido com os cards empilhados de RunRow.dc.html, sem abrir mão da
// semântica de tabela de verdade — os dois não são mutuamente exclusivos.
export function DataTable<T>({ columns, rows, onRowClick, getRowKey }: DataTableProps<T>) {
  const clickable = Boolean(onRowClick);

  return (
    <table className="w-full border-separate border-spacing-x-0 border-spacing-y-2.5 text-left text-sm">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.header}
              scope="col"
              className="px-4 pb-2 text-xs font-medium tracking-[0.03em] text-ink-muted uppercase"
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
            className={cn("bg-surface", clickable && "cursor-pointer hover:brightness-110")}
          >
            {columns.map((column, index) => (
              <td
                key={column.header}
                className={cn(
                  "px-4 py-3.5 text-ink",
                  index === 0 && "rounded-l-xl",
                  index === columns.length - 1 && "rounded-r-xl",
                )}
              >
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
