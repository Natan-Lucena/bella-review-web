import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SubmitButton } from "./SubmitButton";

// useFormStatus só funciona dentro de um <form action>, então o teste
// precisa de um form real em volta em vez de renderizar o botão sozinho.
function Form({ pendingDelayMs, disabled }: { pendingDelayMs: number; disabled?: boolean }) {
  async function action() {
    await new Promise((resolve) => setTimeout(resolve, pendingDelayMs));
  }
  return (
    <form action={action}>
      <SubmitButton disabled={disabled}>Entrar</SubmitButton>
    </form>
  );
}

describe("SubmitButton", () => {
  it("renders as a real submit button with the given label", () => {
    render(<Form pendingDelayMs={0} />);
    expect(screen.getByRole("button", { name: "Entrar" })).toHaveAttribute("type", "submit");
  });

  it("respects the disabled prop", () => {
    render(<Form pendingDelayMs={0} disabled />);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();
  });

  it("reflects the nearest form action's pending state via useFormStatus", async () => {
    render(<Form pendingDelayMs={50} />);
    const button = screen.getByRole("button", { name: "Entrar" });
    expect(button).not.toHaveAttribute("aria-busy", "true");

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-busy", "true");

    await vi.waitFor(() => expect(button).not.toHaveAttribute("aria-busy", "true"));
  });
});
