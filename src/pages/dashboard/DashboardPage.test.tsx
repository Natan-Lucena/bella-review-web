import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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
    expect(screen.getByText("Gemini · gemini-2.5-flash")).toBeInTheDocument();
  });

  it("always shows '—' for estimated cost, with the explanatory hint, never a monetary value", async () => {
    renderDashboard("repo-bella-api");
    await screen.findByText("Gemini · gemini-2.5-flash");
    expect(screen.getByText("Custo estimado")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(
      screen.getByText("O cálculo de custo por modelo ainda não existe no backend."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
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
    expect(screen.getByText("Ainda não configurada")).toBeInTheDocument();
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
});
