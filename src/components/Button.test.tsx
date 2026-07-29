import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders a real <button> element", () => {
    render(<Button variant="primary">Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        Salvar
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" disabled onClick={onClick}>
        Salvar
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when loading, and marks aria-busy", async () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" loading onClick={onClick}>
        Salvar
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the secondary variant", () => {
    render(<Button variant="secondary">Voltar</Button>);
    expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument();
  });

  it("renders a real <a> (via react-router-dom's Link) when given a 'to' prop, not a <button>", () => {
    render(
      <MemoryRouter>
        <Button variant="primary" to="/signup">
          Criar conta
        </Button>
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Criar conta" });
    expect(link).toHaveAttribute("href", "/signup");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("defaults to the 'sm' size and applies bigger padding for 'lg'", () => {
    const { rerender } = render(<Button variant="primary">Padrão</Button>);
    expect(screen.getByRole("button", { name: "Padrão" }).className).toContain("px-4");

    rerender(
      <Button variant="primary" size="lg">
        Grande
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Grande" }).className).toContain("px-6");
  });
});
