import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SecretValueBlock } from "./SecretValueBlock";

describe("SecretValueBlock", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText } });
  });

  afterEach(() => {
    writeText.mockClear();
    vi.useRealTimers();
  });

  it("shows the value and copies it to the clipboard", async () => {
    render(<SecretValueBlock label="Token" value="bella_at_abc123" />);
    expect(screen.getByText("bella_at_abc123")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Copiar" }));
    expect(writeText).toHaveBeenCalledWith("bella_at_abc123");
    expect(screen.getByRole("button", { name: "Copiado" })).toBeInTheDocument();
  });
});
