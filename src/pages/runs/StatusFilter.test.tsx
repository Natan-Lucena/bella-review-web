import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StatusFilter } from "./StatusFilter";

describe("StatusFilter", () => {
  it("renders all 5 options with the current value selected", () => {
    render(<StatusFilter value="failed" onChange={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveValue("failed");
    expect(screen.getByRole("option", { name: "Falhou" })).toBeInTheDocument();
  });

  it("calls onChange with the selected status", async () => {
    const onChange = vi.fn();
    render(<StatusFilter value="all" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "completed");
    expect(onChange).toHaveBeenCalledWith("completed");
  });
});
