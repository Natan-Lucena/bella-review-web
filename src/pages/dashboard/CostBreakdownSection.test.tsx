import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { CostBreakdownSection } from "./CostBreakdownSection";

// recharts' ResponsiveContainer só mede o container (e produz dimensões
// positivas pro BarChart renderizar de fato) quando `ResizeObserver` existe
// no ambiente — jsdom não implementa isso nativamente. O stub abaixo não
// precisa disparar callbacks de resize: o próprio efeito de montagem do
// recharts já chama `getBoundingClientRect()` direto (ver
// node_modules/recharts/es6/component/ResponsiveContainer.js), então mockar
// esse retorno com um tamanho positivo já é suficiente pra o gráfico sair do
// estado "aguardando medição" e renderizar os eixos/barras.
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
      <CostBreakdownSection repoId={repoId} period={period} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("CostBreakdownSection", () => {
  it("shows a loading skeleton before the cost stats resolve", () => {
    renderSection("repo-bella-api");
    expect(screen.getAllByRole("presentation", { hidden: true }).length).toBeGreaterThan(0);
  });

  it("shows the 'no data' banner instead of KPI cards/chart when breakdown is empty", async () => {
    renderSection("repo-bella-action");
    expect(
      await screen.findByText("Nenhum custo registrado neste período ainda."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Revisão padrão")).not.toBeInTheDocument();
    expect(screen.queryByText("Comentário no PR")).not.toBeInTheDocument();
  });

  it("renders the KPI cards (cost by runType) and the chart for a repo with real data", async () => {
    const { container } = renderSection("repo-bella-api", "30d");

    // KPI cards: cost by runType, formatted as currency.
    expect(await screen.findByText("R$ 38,75")).toBeInTheDocument(); // review
    expect(screen.getByText("R$ 9,85")).toBeInTheDocument(); // comment_reply
    expect(screen.getAllByText("Revisão padrão").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Comentário no PR").length).toBeGreaterThan(0);

    // Chart: confirm ResponsiveContainer actually measured a positive size
    // and mounted the chart's root <svg> — not just an empty/pre-measurement
    // container. jsdom has no real text-layout engine (no canvas measureText
    // / getComputedTextLength), so recharts' category-axis tick generation
    // silently produces zero ticks there; asserting on individual tick labels
    // (e.g. "security") would be flaky for reasons unrelated to this
    // component's correctness. The mounted, correctly-sized <svg> is the
    // reliable signal that CostBreakdownChart rendered real chart content.
    // Scoped to a direct child of .recharts-wrapper — the Legend's own icons
    // are tiny <svg class="recharts-surface"> too (14px), so an unscoped
    // query can match one of those instead of the chart's main surface.
    const svg = container.querySelector(".recharts-wrapper > svg.recharts-surface");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "600");
  });

  it("re-fetches when the period prop changes", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <CostBreakdownSection repoId="repo-bella-api" period="30d" />
      </QueryClientProvider>,
    );
    expect(await screen.findByText("R$ 38,75")).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={queryClient}>
        <CostBreakdownSection repoId="repo-bella-api" period="7d" />
      </QueryClientProvider>,
    );
    expect(await screen.findByText("R$ 9,80")).toBeInTheDocument();
  });
});
