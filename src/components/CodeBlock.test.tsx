import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CodeBlock } from "./CodeBlock";

const ACTION_SNIPPET = [
  "- uses: Natan-Lucena/bella-review-action@v1",
  "  with:",
  "    bella-token: ${{ secrets.BELLA_TOKEN }}",
].join("\n");

describe("CodeBlock", () => {
  it("renders the exact, copyable code text (real <pre><code>, no image)", () => {
    const { container } = render(<CodeBlock code={ACTION_SNIPPET} />);
    const pre = container.querySelector("pre");
    const code = container.querySelector("code");
    expect(pre).toBeInTheDocument();
    expect(code?.textContent).toBe(`${ACTION_SNIPPET}\n`);
  });

  it("defaults the filename to the workflow path", () => {
    render(<CodeBlock code="name: x" />);
    expect(screen.getByText(".github/workflows/bella.yml")).toBeInTheDocument();
  });

  it("shows a custom filename when provided", () => {
    render(<CodeBlock code="name: x" filename="custom.yml" />);
    expect(screen.getByText("custom.yml")).toBeInTheDocument();
  });

  it("renders the footer only when provided", () => {
    const { rerender } = render(<CodeBlock code="name: x" />);
    expect(screen.queryByText("Legenda")).not.toBeInTheDocument();

    rerender(<CodeBlock code="name: x" footer="Legenda" />);
    expect(screen.getByText("Legenda")).toBeInTheDocument();
  });

  it("omits the window-chrome dots when showDots is false", () => {
    const { container, rerender } = render(<CodeBlock code="name: x" />);
    expect(container.querySelectorAll(".rounded-full").length).toBeGreaterThan(0);

    rerender(<CodeBlock code="name: x" showDots={false} />);
    expect(container.querySelectorAll(".rounded-full").length).toBe(0);
  });

  it("preserves non key:value lines instead of dropping their text", () => {
    const { container } = render(<CodeBlock code={"# a comment\nname: x"} />);
    expect(container.querySelector("code")?.textContent).toBe("# a comment\nname: x\n");
  });
});
