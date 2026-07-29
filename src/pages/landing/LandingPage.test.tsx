import { render, screen } from "@testing-library/react";
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
  it("renders the hero heading and the one-sentence pitch", () => {
    renderLanding();
    expect(screen.getByRole("heading", { level: 1, name: "Bella Reviewer" })).toBeInTheDocument();
    expect(screen.getByText(/Revisão de código por IA/)).toBeInTheDocument();
  });

  it("renders both CTAs as real links (not onClick-driven buttons) to /signup and /login", () => {
    renderLanding();
    const signupLinks = screen.getAllByRole("link", { name: "Criar conta" });
    expect(signupLinks.length).toBeGreaterThanOrEqual(2);
    for (const link of signupLinks) {
      expect(link).toHaveAttribute("href", "/signup");
    }

    const loginLink = screen.getByRole("link", { name: "Já tenho conta" });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders the workflow YAML as real, copyable text inside a <pre><code> block", () => {
    const { container } = renderLanding();
    const code = container.querySelector("pre code");
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toContain("name: Bella Reviewer");
    expect(code?.textContent).toContain("BELLA_TOKEN");
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
});
