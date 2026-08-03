import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PeriodSelector } from "./PeriodSelector";

describe("PeriodSelector", () => {
  it("marks the active period as pressed", () => {
    render(<PeriodSelector period="30d" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "30 dias" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "7 dias" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the selected period", async () => {
    const onChange = vi.fn();
    render(<PeriodSelector period="30d" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "90 dias" }));
    expect(onChange).toHaveBeenCalledWith("90d");
  });
});
