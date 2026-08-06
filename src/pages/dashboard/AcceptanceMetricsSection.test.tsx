import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { AcceptanceMetricsSection } from "./AcceptanceMetricsSection";

function renderSection(repoId: string, period: "7d" | "30d" | "90d" = "30d") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AcceptanceMetricsSection repoId={repoId} period={period} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("AcceptanceMetricsSection", () => {
  it("shows a loading skeleton before the metrics resolve", () => {
    renderSection("repo-bella-api");
    expect(screen.getAllByRole("presentation", { hidden: true }).length).toBeGreaterThan(0);
  });

  it("renders the 3 KPI cards, formatted, for a repo with real data", async () => {
    renderSection("repo-bella-api");
    expect(await screen.findByText("75%")).toBeInTheDocument(); // applyRate
    expect(screen.getByText("65%")).toBeInTheDocument(); // coverage.actionableShare
    expect(screen.getByText("R$ 3,80")).toBeInTheDocument(); // costPerAppliedSuggestion
    expect(screen.getByText("Período anterior: 62%")).toBeInTheDocument();
  });

  it("shows '—' with the explanatory hint when applyRate/cost are null, never 0%/R$ 0,00", async () => {
    renderSection("repo-bella-web");
    expect(
      await screen.findByText("Nenhuma sugestão decidida neste período ainda"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nenhuma sugestão aplicada neste período ainda")).toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.queryByText(/R\$ 0/)).not.toBeInTheDocument();
  });

  it("shows a null row ('—') inside an otherwise-populated severity table, without hiding the row", async () => {
    renderSection("repo-bella-api");
    const row = await screen.findByText("Crítica");
    expect(row.closest("tr")).toHaveTextContent("—");
  });

  it("shows the 'no data' banner instead of the tables when there are no comments at all", async () => {
    renderSection("repo-bella-action");
    expect(
      await screen.findByText("Nenhum comentário gerado neste período ainda."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Por categoria")).not.toBeInTheDocument();
  });

  it("does NOT show the 'no data' banner when comments exist but nothing has been decided yet", async () => {
    renderSection("repo-bella-web");
    expect(await screen.findByText("Por categoria")).toBeInTheDocument();
    expect(
      screen.queryByText("Nenhum comentário gerado neste período ainda."),
    ).not.toBeInTheDocument();
  });

  it("re-fetches when the period prop changes", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <AcceptanceMetricsSection repoId="repo-bella-api" period="30d" />
      </QueryClientProvider>,
    );
    expect(await screen.findByText("75%")).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={queryClient}>
        <AcceptanceMetricsSection repoId="repo-bella-api" period="7d" />
      </QueryClientProvider>,
    );
    expect(await screen.findByText("66,7%")).toBeInTheDocument();
  });
});
