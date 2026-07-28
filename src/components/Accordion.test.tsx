import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Accordion } from "./Accordion";

describe("Accordion", () => {
  it("starts closed by default and toggles aria-expanded", async () => {
    render(<Accordion title="Credencial LLM">conteúdo</Accordion>);
    const button = screen.getByRole("button", { name: "Credencial LLM" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("conteúdo")).not.toBeInTheDocument();

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("starts open when defaultOpen is true", () => {
    render(
      <Accordion title="Parâmetros de review" defaultOpen>
        conteúdo
      </Accordion>,
    );
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("associates the trigger with the panel via aria-controls", () => {
    render(
      <Accordion title="Credencial LLM" defaultOpen>
        conteúdo
      </Accordion>,
    );
    const button = screen.getByRole("button", { name: "Credencial LLM" });
    const controls = button.getAttribute("aria-controls");
    expect(document.getElementById(controls!)).toHaveTextContent("conteúdo");
  });
});
