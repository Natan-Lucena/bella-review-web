import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KpiCard } from "./KpiCard";

describe("KpiCard", () => {
  it("renders the label and value", () => {
    render(<KpiCard label="Tokens de entrada" value="1.842.900" />);
    expect(screen.getByText("Tokens de entrada")).toBeInTheDocument();
    expect(screen.getByText("1.842.900")).toBeInTheDocument();
  });

  it("does not render a tooltip icon by default", () => {
    render(<KpiCard label="Tokens de entrada" value="1.842.900" />);
    expect(screen.queryByTitle(/./)).not.toBeInTheDocument();
  });

  it("associates the tooltip text via aria-describedby when provided", () => {
    render(
      <KpiCard
        label="Tokens de raciocínio"
        value="118.600"
        tooltip="Tokens gastos pelo modelo pensando antes de responder."
      />,
    );
    const icon = screen.getByTitle("Tokens gastos pelo modelo pensando antes de responder.");
    const describedBy = icon.getAttribute("aria-describedby");
    expect(document.getElementById(describedBy!)).toHaveTextContent(
      "Tokens gastos pelo modelo pensando antes de responder.",
    );
  });

  it("mutes the value color when unavailable", () => {
    render(<KpiCard label="Custo estimado" value="—" unavailable />);
    expect(screen.getByText("—")).toHaveClass("text-ink-muted");
  });

  it("shows the hint text below the value when provided", () => {
    render(
      <KpiCard
        label="Custo estimado"
        value="—"
        unavailable
        hint="O cálculo de custo por modelo ainda não existe no backend."
      />,
    );
    expect(
      screen.getByText("O cálculo de custo por modelo ainda não existe no backend."),
    ).toBeInTheDocument();
  });
});
