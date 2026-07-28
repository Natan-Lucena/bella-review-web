import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LoadMoreButton } from "./LoadMoreButton";

describe("LoadMoreButton", () => {
  it("renders nothing when hasMore is false", () => {
    const { container } = render(<LoadMoreButton onClick={vi.fn()} hasMore={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<LoadMoreButton onClick={onClick} hasMore />);
    await userEvent.click(screen.getByRole("button", { name: "Carregar mais" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
