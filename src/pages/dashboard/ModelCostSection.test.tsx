import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { ModelCostSection } from "./ModelCostSection";

// Mesma justificativa de CostBreakdownSection.test.tsx: ResponsiveContainer
// só mede o container (e produz dimensões positivas pro BarChart renderizar
// de fato) quando `ResizeObserver` existe no ambiente — jsdom não implementa
// isso nativamente.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let getBoundingClientRectSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  getBoundingClientRectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 600,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 600,
    x: 0,
    y: 0,
    toJSON() {},
  } as DOMRect);
});

afterAll(() => {
  getBoundingClientRectSpy.mockRestore();
  vi.unstubAllGlobals();
});

function renderSection(repoId: string, period: "7d" | "30d" | "90d" = "30d") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ModelCostSection repoId={repoId} period={period} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("ModelCostSection", () => {
  it("shows a loading skeleton before the cost stats resolve", () => {
    renderSection("repo-bella-api");
    expect(screen.getAllByRole("presentation", { hidden: true }).length).toBeGreaterThan(0);
  });

  it("shows the 'no data' banner instead of the chart/table when byModel is empty", async () => {
    renderSection("repo-bella-action");
    expect(
      await screen.findByText("Nenhum custo por modelo registrado neste período ainda."),
    ).toBeInTheDocument();
    expect(screen.queryByText("gemini / gemini-2.5-flash")).not.toBeInTheDocument();
  });

  it("renders the chart and table for a repo with multiple models", async () => {
    const { container } = renderSection("repo-bella-api", "30d");

    // Table: one row per byModel entry (provider/model, cost, count, dates).
    // Ver isoOffset()/BASE_DATE em mocks/fixtures.ts para os valores de data
    // esperados abaixo (fixture determinística, não depende do dia real).
    expect(await screen.findByText("gemini / gemini-2.5-flash")).toBeInTheDocument();
    expect(screen.getByText("claude / claude-sonnet-5")).toBeInTheDocument();
    expect(screen.getByText("R$ 46,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 2,60")).toBeInTheDocument();
    expect(screen.getByText("93")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("01/06/2026")).toBeInTheDocument(); // gemini firstUsedAt
    expect(screen.getByText("29/06/2026")).toBeInTheDocument(); // claude firstUsedAt
    // lastUsedAt is the same date for both rows (both used "today" in the
    // fixture) — appears twice, so getAllByText instead of getByText.
    expect(screen.getAllByText("01/07/2026")).toHaveLength(2);

    // Chart: confirm ResponsiveContainer actually measured a positive size
    // and mounted the chart's root <svg> — not just an empty/pre-measurement
    // container. jsdom has no real text-layout engine, so recharts'
    // category-axis tick generation is unreliable to assert against there
    // (see CostBreakdownChart's test for the fuller rationale); the mounted,
    // correctly-sized <svg> is the reliable signal that ModelCostChart
    // rendered real chart content.
    const svg = container.querySelector(".recharts-wrapper > svg.recharts-surface");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "600");
  });
});
