import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Card } from "./Card";

describe("Card", () => {
  it("renders as a plain container by default", () => {
    render(<Card>conteúdo</Card>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("renders as a real, focusable button when as='button'", async () => {
    const onClick = vi.fn();
    render(
      <Card as="button" onClick={onClick}>
        Repositório
      </Card>,
    );
    const button = screen.getByRole("button", { name: "Repositório" });
    button.focus();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
