import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is hidden from the accessibility tree", () => {
    const { container } = render(<Skeleton shape="block" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("respects explicit width/height", () => {
    const { container } = render(<Skeleton shape="line" width="40px" height="8px" />);
    expect(container.firstChild).toHaveStyle({ width: "40px", height: "8px" });
  });
});
