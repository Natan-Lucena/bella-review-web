import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DataTable } from "./DataTable";

type Run = { id: string; prNumber: number };

const rows: Run[] = [
  { id: "1", prNumber: 42 },
  { id: "2", prNumber: 43 },
];

describe("DataTable", () => {
  it("renders a real semantic table", () => {
    render(
      <DataTable
        columns={[{ header: "PR", render: (row: Run) => `#${row.prNumber}` }]}
        rows={rows}
        getRowKey={(row) => row.id}
      />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "PR" })).toBeInTheDocument();
    expect(screen.getByText("#42")).toBeInTheDocument();
  });

  it("makes rows keyboard-clickable when onRowClick is provided", async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={[{ header: "PR", render: (row: Run) => `#${row.prNumber}` }]}
        rows={rows}
        getRowKey={(row) => row.id}
        onRowClick={onRowClick}
      />,
    );
    const firstRow = screen.getAllByRole("button")[0];
    firstRow.focus();
    await userEvent.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it("rows are not buttons when onRowClick is absent", () => {
    render(
      <DataTable
        columns={[{ header: "PR", render: (row: Run) => `#${row.prNumber}` }]}
        rows={rows}
        getRowKey={(row) => row.id}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
