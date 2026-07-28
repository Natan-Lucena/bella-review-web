import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title and description without an action", () => {
    render(
      <EmptyState title="Nenhuma execução ainda." description="Assim que a Action rodar..." />,
    );
    expect(screen.getByText("Nenhuma execução ainda.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders and triggers the action when provided", async () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Sem repositórios"
        description="Cadastre o primeiro."
        action={{ label: "Adicionar repositório", onClick }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Adicionar repositório" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
