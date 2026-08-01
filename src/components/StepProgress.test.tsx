import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StepProgress } from "./StepProgress";

describe("StepProgress", () => {
  it("renders the step count and step name", () => {
    render(<StepProgress step={2} total={5} stepName="Integração" />);
    expect(screen.getByText("Passo 2 de 5")).toBeInTheDocument();
    expect(screen.getByText("Integração")).toBeInTheDocument();
  });

  it("hides the progress bar from the accessibility tree", () => {
    const { container } = render(<StepProgress step={1} total={5} stepName="Repositório" />);
    const bar = container.querySelector('[aria-hidden="true"]');
    expect(bar).toBeInTheDocument();
  });

  it("sizes the bar fill proportionally to step/total", () => {
    const { container } = render(<StepProgress step={3} total={5} stepName="Gemini" />);
    const fill = container.querySelector('[aria-hidden="true"] > div');
    expect(fill).toHaveStyle({ width: "60%" });
  });
});
