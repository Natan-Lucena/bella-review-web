import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { LandingPage } from "./LandingPage";

// Sem QueryClientProvider de propósito: a Tela 1 não busca dado nenhum (ver
// 03-tela-landing.md, "Estado") — se algum componente aqui chamasse
// useQuery/useMutation, este teste já falharia por falta de um QueryClient.
function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe("LandingPage", () => {
  it("renders the eyebrow, hero heading (the pitch, not just the brand name) and the pitch paragraph", () => {
    renderLanding();
    expect(screen.getByText("Revisão de código por IA · GitHub Actions")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /Revisão de código por IA que entra/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sem servidor pra manter, sem processo novo pra aprender/),
    ).toBeInTheDocument();
  });

  it("shows the brand name in the header, not as a heading", () => {
    renderLanding();
    const header = screen.getByRole("banner");
    expect(within(header).getByText("Bella Reviewer", { selector: "span" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Bella Reviewer" })).not.toBeInTheDocument();
  });

  it("renders both CTAs as real links (not onClick-driven buttons), repeated across header/hero/closing", () => {
    renderLanding();
    const signupLinks = screen.getAllByRole("link", { name: "Criar conta" });
    expect(signupLinks.length).toBeGreaterThanOrEqual(3);
    for (const link of signupLinks) {
      expect(link).toHaveAttribute("href", "/signup");
    }

    const loginLinks = screen.getAllByRole("link", { name: "Já tenho conta" });
    expect(loginLinks.length).toBeGreaterThanOrEqual(3);
    for (const link of loginLinks) {
      expect(link).toHaveAttribute("href", "/login");
    }
  });

  it("renders the workflow YAML as real, copyable text inside a <pre><code> block, with the filename chrome", () => {
    const { container } = renderLanding();
    const code = container.querySelector("pre code");
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toContain("name: Bella Reviewer");
    expect(code?.textContent).toContain("BELLA_TOKEN");
    expect(screen.getByText(".github/workflows/bella.yml")).toBeInTheDocument();
  });

  it("renders the four feature cards", () => {
    renderLanding();
    expect(screen.getByRole("heading", { name: "Revisão automática por PR" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Assíncrono, não trava seu CI" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Você escolhe o modelo e paga sua própria conta" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Histórico e consumo de tokens visíveis" }),
    ).toBeInTheDocument();
  });

  it("renders the closing CTA card and the footer tagline", () => {
    renderLanding();
    expect(
      screen.getByRole("heading", { name: "Dez linhas de YAML e a próxima revisão é da Bella." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bella Reviewer · revisão de Pull Requests com Gemini, no seu GitHub"),
    ).toBeInTheDocument();
  });
});
