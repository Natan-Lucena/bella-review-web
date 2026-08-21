import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("associates the label with the textarea via htmlFor/id", () => {
    render(<Textarea label="Conteúdo" htmlFor="content" value="" onChange={vi.fn()} />);
    const field = screen.getByLabelText("Conteúdo");
    expect(field.tagName).toBe("TEXTAREA");
  });

  it("shows the current value", () => {
    render(<Textarea label="Conteúdo" htmlFor="content" value="Foca em segurança" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Conteúdo")).toHaveValue("Foca em segurança");
  });

  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<Textarea label="Conteúdo" htmlFor="content" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Conteúdo"), "abc");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("renders the error as an alert and marks the field invalid", () => {
    render(
      <Textarea label="Conteúdo" htmlFor="content" value="" onChange={vi.fn()} error="Obrigatório" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Obrigatório");
    expect(screen.getByLabelText("Conteúdo")).toHaveAttribute("aria-invalid", "true");
  });

  it("uses a default of 8 rows when none is given", () => {
    render(<Textarea label="Conteúdo" htmlFor="content" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Conteúdo")).toHaveAttribute("rows", "8");
  });

  it("respects a custom rows count", () => {
    render(<Textarea label="Conteúdo" htmlFor="content" value="" onChange={vi.fn()} rows={4} />);
    expect(screen.getByLabelText("Conteúdo")).toHaveAttribute("rows", "4");
  });
});
