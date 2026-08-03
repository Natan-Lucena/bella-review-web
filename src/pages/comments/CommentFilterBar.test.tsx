import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CommentFilterBar } from "./CommentFilterBar";

function renderBar(overrides: Partial<Parameters<typeof CommentFilterBar>[0]> = {}) {
  const props = {
    prNumber: "",
    onPrNumberChange: vi.fn(),
    category: "",
    onCategoryChange: vi.fn(),
    severity: "all" as const,
    onSeverityChange: vi.fn(),
    status: "all" as const,
    onStatusChange: vi.fn(),
    ...overrides,
  };
  render(<CommentFilterBar {...props} />);
  return props;
}

describe("CommentFilterBar", () => {
  it("renders all 4 filter controls plus the optional count label", () => {
    renderBar({ countLabel: "12 comentários" });
    expect(screen.getByLabelText("Filtrar por número do PR")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por severidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por status")).toBeInTheDocument();
    expect(screen.getByText("12 comentários")).toBeInTheDocument();
  });

  it("the category input is free text with a datalist, never a closed dropdown", () => {
    renderBar();
    const input = screen.getByLabelText("Filtrar por categoria");
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("list", "comment-category-suggestions");
  });

  it("severity and status are closed selects with all 4 enum values plus an 'all' option", () => {
    renderBar();
    expect(screen.getByRole("option", { name: "Crítica" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Todas as severidades" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Publicado no GitHub" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Todos os status" })).toBeInTheDocument();
  });

  it("calls the right callback for each field", async () => {
    const props = renderBar();
    await userEvent.type(screen.getByLabelText("Filtrar por categoria"), "s");
    expect(props.onCategoryChange).toHaveBeenCalledWith("s");

    await userEvent.selectOptions(screen.getByLabelText("Filtrar por severidade"), "critical");
    expect(props.onSeverityChange).toHaveBeenCalledWith("critical");

    await userEvent.selectOptions(screen.getByLabelText("Filtrar por status"), "published");
    expect(props.onStatusChange).toHaveBeenCalledWith("published");
  });
});
