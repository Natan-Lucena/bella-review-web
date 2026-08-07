import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { KpiCard } from "./KpiCard";

describe("KpiCard", () => {
  it("renders the label and value", () => {
    render(<KpiCard label="Tokens de entrada" value="1.842.900" />);
    expect(screen.getByText("Tokens de entrada")).toBeInTheDocument();
    expect(screen.getByText("1.842.900")).toBeInTheDocument();
  });

  it("does not render a tooltip trigger by default", () => {
    render(<KpiCard label="Tokens de entrada" value="1.842.900" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("reveals the tooltip text on hover, and hides it again when the mouse leaves", async () => {
    const user = userEvent.setup();
    render(
      <KpiCard
        label="Tokens de raciocínio"
        value="118.600"
        tooltip="Tokens gastos pelo modelo pensando antes de responder."
      />,
    );
    const trigger = screen.getByRole("button", {
      name: "Mais informações sobre Tokens de raciocínio",
    });
    expect(
      screen.queryByText("Tokens gastos pelo modelo pensando antes de responder."),
    ).not.toBeInTheDocument();

    await user.hover(trigger);
    expect(
      screen.getByText("Tokens gastos pelo modelo pensando antes de responder."),
    ).toBeInTheDocument();

    await user.unhover(trigger);
    expect(
      screen.queryByText("Tokens gastos pelo modelo pensando antes de responder."),
    ).not.toBeInTheDocument();
  });

  it("opens the tooltip on click, for touch devices without hover", async () => {
    const user = userEvent.setup();
    render(<KpiCard label="Cobertura acionável" value="65%" tooltip="Definição da métrica." />);
    const trigger = screen.getByRole("button", {
      name: "Mais informações sobre Cobertura acionável",
    });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Definição da métrica.")).toBeInTheDocument();
  });

  it("closes the tooltip when the trigger loses focus", async () => {
    const user = userEvent.setup();
    render(
      <>
        <KpiCard label="Cobertura acionável" value="65%" tooltip="Definição da métrica." />
        <button type="button">Outro elemento</button>
      </>,
    );
    const trigger = screen.getByRole("button", {
      name: "Mais informações sobre Cobertura acionável",
    });

    await user.click(trigger);
    expect(screen.getByText("Definição da métrica.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outro elemento" }));
    expect(screen.queryByText("Definição da métrica.")).not.toBeInTheDocument();
  });

  it("reveals the tooltip on keyboard focus, associated via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<KpiCard label="Cobertura acionável" value="65%" tooltip="Definição da métrica." />);

    await user.tab();
    const trigger = screen.getByRole("button", {
      name: "Mais informações sobre Cobertura acionável",
    });
    expect(trigger).toHaveFocus();
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Definição da métrica.");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
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
