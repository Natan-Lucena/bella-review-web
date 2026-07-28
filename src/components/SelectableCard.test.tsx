import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SelectableCard } from "./SelectableCard";

describe("SelectableCard", () => {
  it("exposes role=radio and reflects aria-checked", () => {
    render(<SelectableCard selected title="Via GitHub Action" onSelect={() => {}} />);
    const radio = screen.getByRole("radio", { name: "Via GitHub Action" });
    expect(radio).toHaveAttribute("aria-checked", "true");
  });

  it("calls onSelect on click, Enter and Space", async () => {
    const onSelect = vi.fn();
    render(<SelectableCard selected={false} title="Via webhook nativo" onSelect={onSelect} />);
    const radio = screen.getByRole("radio", { name: "Via webhook nativo" });

    await userEvent.click(radio);
    expect(onSelect).toHaveBeenCalledTimes(1);

    radio.focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(2);

    await userEvent.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(3);
  });

  it("is not in the tab order when not selected", () => {
    render(<SelectableCard selected={false} title="Via webhook nativo" onSelect={() => {}} />);
    expect(screen.getByRole("radio")).toHaveAttribute("tabIndex", "-1");
  });
});
