import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PasswordField } from "./PasswordField";

describe("PasswordField", () => {
  it("starts masked and toggles visibility", async () => {
    render(
      <PasswordField label="Chave da API" htmlFor="apiKey" value="secret" onChange={vi.fn()} />,
    );
    const input = screen.getByLabelText("Chave da API");
    expect(input).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(input).toHaveAttribute("type", "text");

    await userEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<PasswordField label="Chave da API" htmlFor="apiKey" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Chave da API"), "abc");
    expect(onChange).toHaveBeenCalledTimes(3);
  });
});
