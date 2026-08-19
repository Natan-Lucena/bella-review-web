import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { DashboardPage } from "./DashboardPage";

function renderDashboard(repoId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/repos/${repoId}`]}>
        <Routes>
          <Route path="/repos/:id" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("DashboardPage", () => {
  it("shows a loading skeleton before the dashboard resolves", () => {
    renderDashboard("repo-bella-api");
    expect(screen.getAllByRole("presentation", { hidden: true }).length).toBeGreaterThan(0);
  });

  it("renders the 4 KPI cards, formatted, for the default 30d period", async () => {
    renderDashboard("repo-bella-api");
    expect(await screen.findByText("512.000")).toBeInTheDocument(); // inputTokens
    expect(screen.getByText("gemini-2.5-flash")).toBeInTheDocument();
  });

  it("always shows '—' for estimated cost, with the explanatory hint, never a monetary value", async () => {
    renderDashboard("repo-bella-api");
    await screen.findByText("gemini-2.5-flash");
    expect(screen.getByText("Custo estimado")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível calcular o custo para o modelo configurado."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });

  it("explains, via tooltip, that the estimated cost is a paid-tier projection, not necessarily real spend", async () => {
    renderDashboard("repo-bella-api");
    const user = userEvent.setup();
    await screen.findByText("Custo estimado");

    await user.hover(screen.getByRole("button", { name: "Mais informações sobre Custo estimado" }));
    expect(
      screen.getByText(/Uma chave no tier gratuito do Google AI Studio tem custo real zero\./),
    ).toBeInTheDocument();
  });

  it("shows 'sem dado do período anterior' instead of '↑ 0%' when there is no previous-period comparison", async () => {
    renderDashboard("repo-bella-web");
    expect(await screen.findByText("sem dado do período anterior")).toBeInTheDocument();
    expect(screen.queryByText(/↑ 0%/)).not.toBeInTheDocument();
  });

  it("shows a down arrow in a positive (completed) tone when usage decreased", async () => {
    // repo-bella-api's 30d period has percentageChangeFromPreviousPeriod: -4.2
    renderDashboard("repo-bella-api");
    const change = await screen.findByText("↓ 4.2% vs. período anterior");
    expect(change).toHaveClass("text-status-completed");
  });

  it("shows an up arrow in a warning tone when usage increased (more spend, not 'progress')", async () => {
    renderDashboard("repo-bella-api");
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "7 dias" }));

    const change = await screen.findByText("↑ 12.5% vs. período anterior");
    expect(change).toHaveClass("text-severity-high");
  });

  it("shows the friendly no-usage banner (not an error) when everything is zero", async () => {
    renderDashboard("repo-bella-action");
    expect(
      await screen.findByText(/Nenhuma execução registrada neste período ainda/),
    ).toBeInTheDocument();
    expect(screen.getByText("Configurar modelo")).toBeInTheDocument();
  });

  it("re-fetches and updates the cards when the period changes, without a page reload", async () => {
    renderDashboard("repo-bella-api");
    const user = userEvent.setup();
    expect(await screen.findByText("512.000")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "90 dias" }));
    expect(await screen.findByText("1.340.000")).toBeInTheDocument();
    expect(screen.queryByText("512.000")).not.toBeInTheDocument();
  });

  it("renders the acceptance-metrics section, and updates it too when the period changes", async () => {
    renderDashboard("repo-bella-api");
    const user = userEvent.setup();
    expect(await screen.findByText("Sugestões e aceitação")).toBeInTheDocument();
    expect(await screen.findByText("75%")).toBeInTheDocument(); // 30d applyRate

    await user.click(screen.getByRole("button", { name: "7 dias" }));
    expect(await screen.findByText("66,7%")).toBeInTheDocument(); // 7d applyRate
    expect(screen.queryByText("75%")).not.toBeInTheDocument();
  });

  describe("editing the active LLM config (18-configuracao-de-llm-no-painel.md)", () => {
    it("shows only the active model in the trigger chip, not the provider/model form", async () => {
      renderDashboard("repo-bella-api");
      expect(await screen.findByText("gemini-2.5-flash")).toBeInTheDocument();
      expect(screen.queryByRole("radiogroup", { name: "Provedor de LLM" })).not.toBeInTheDocument();
    });

    it("clicking the chip opens a modal in read-only mode, with an 'Editar modelo' button", async () => {
      renderDashboard("repo-bella-api");
      const user = userEvent.setup();
      await screen.findByText("gemini-2.5-flash");
      await user.click(screen.getByRole("button", { name: /Configuração ativa/ }));

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveTextContent("Gemini");
      expect(dialog).toHaveTextContent("gemini-2.5-flash");
      expect(screen.queryByRole("radiogroup", { name: "Provedor de LLM" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Editar modelo" })).toBeInTheDocument();
    });

    it("switching provider + saving a new key updates the chip, with no manual invalidation needed", async () => {
      renderDashboard("repo-bella-api");
      const user = userEvent.setup();
      await screen.findByText("gemini-2.5-flash");
      await user.click(screen.getByRole("button", { name: /Configuração ativa/ }));
      await user.click(screen.getByRole("button", { name: "Editar modelo" }));

      await user.click(screen.getByRole("radio", { name: "Claude" }));
      await user.type(screen.getByLabelText("Chave da API da Anthropic"), "fake-claude-key-123");
      await user.click(screen.getByRole("button", { name: "Salvar provedor e chave" }));

      // Default model for the new provider, from the catalog — this repo's
      // saved model wasn't touched, only the provider/key were. Saving
      // returns the modal to read-only mode showing it. `selector: "p"`
      // targets the read-only view's text specifically — the edit-mode
      // dropdown, unlike the old free-text datalist, has real <option> text
      // nodes (e.g. "claude-sonnet-5" is one of Claude's own suggestions),
      // so an unscoped findByText can match those before the save round-trip
      // (and its dashboard refetch) actually finishes.
      const dialog = screen.getByRole("dialog");
      await within(dialog).findByText("claude-sonnet-5", { selector: "p" });
      expect(dialog).toHaveTextContent("Claude");

      // Closing the modal reveals the chip underneath, already updated —
      // no manual invalidation needed, same hierarchical query-key
      // mechanism the rest of the app already relies on.
      await user.click(screen.getByRole("button", { name: "Fechar" }));
      expect(
        await screen.findByRole("button", { name: /claude-sonnet-5/ }),
      ).toBeInTheDocument();
    });

    it("switching only the model doesn't require filling the API key field", async () => {
      renderDashboard("repo-bella-api");
      const user = userEvent.setup();
      await screen.findByText("gemini-2.5-flash");
      await user.click(screen.getByRole("button", { name: /Configuração ativa/ }));
      await user.click(screen.getByRole("button", { name: "Editar modelo" }));

      expect(screen.getByLabelText("Chave da API do Gemini")).toHaveValue("");
      await user.selectOptions(screen.getByLabelText("Modelo"), "gemini-2.5-pro");
      await user.click(screen.getByRole("button", { name: "Salvar modelo" }));

      // `selector: "p"` — see the analogous comment above; "gemini-2.5-pro"
      // is also one of Gemini's own dropdown options.
      await within(screen.getByRole("dialog")).findByText("gemini-2.5-pro", { selector: "p" });
    });

    it("offers only the current provider's catalog models in the dropdown, not free text", async () => {
      renderDashboard("repo-bella-api");
      const user = userEvent.setup();
      await screen.findByText("gemini-2.5-flash");
      await user.click(screen.getByRole("button", { name: /Configuração ativa/ }));
      await user.click(screen.getByRole("button", { name: "Editar modelo" }));

      const modelSelect = screen.getByLabelText("Modelo") as HTMLSelectElement;
      expect(modelSelect.tagName).toBe("SELECT");
      const optionValues = Array.from(modelSelect.options).map((option) => option.value);
      expect(optionValues).toEqual(["", "gemini-3.7-flash", "gemini-2.5-pro", "gemini-2.5-flash"]);
    });

    it("keeps 'Salvar provedor e chave' disabled until a key is typed", async () => {
      renderDashboard("repo-bella-api");
      const user = userEvent.setup();
      await screen.findByText("gemini-2.5-flash");
      await user.click(screen.getByRole("button", { name: /Configuração ativa/ }));
      await user.click(screen.getByRole("button", { name: "Editar modelo" }));

      expect(screen.getByRole("button", { name: "Salvar provedor e chave" })).toBeDisabled();
      await user.type(screen.getByLabelText("Chave da API do Gemini"), "x");
      expect(screen.getByRole("button", { name: "Salvar provedor e chave" })).toBeEnabled();
    });

    it("closes the modal via the close button", async () => {
      renderDashboard("repo-bella-api");
      const user = userEvent.setup();
      await screen.findByText("gemini-2.5-flash");
      await user.click(screen.getByRole("button", { name: /Configuração ativa/ }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Fechar" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
