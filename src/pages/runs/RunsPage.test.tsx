import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { RunsPage } from "./RunsPage";

function renderRuns(repoId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/repos/${repoId}/runs`]}>
        <Routes>
          <Route path="/repos/:id/runs" element={<RunsPage />} />
          <Route path="/repos/:id/runs/:runId" element={<div>Detalhe da execução</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("RunsPage", () => {
  it("renders the first page of runs as a real <table>, with the total count", async () => {
    renderRuns("repo-bella-api");
    const table = await screen.findByRole("table");
    expect(screen.getByText("24 execuções")).toBeInTheDocument();
    // Only data rows get role="button" (the clickable <tr>s) — the header
    // row keeps its implicit "row" role, so this cleanly counts just the data.
    expect(within(table).getAllByRole("button")).toHaveLength(20);
  });

  it("shows the error reason inline on a failed row, not just in the detail page", async () => {
    renderRuns("repo-bella-api");
    await screen.findByRole("table");
    await userEvent.selectOptions(screen.getByRole("combobox"), "failed");
    expect(await screen.findByText("LLM credential not configured")).toBeInTheDocument();
  });

  it("re-fetches (not client-side filters) when the status changes", async () => {
    renderRuns("repo-bella-api");
    await screen.findByRole("table");
    await userEvent.selectOptions(screen.getByRole("combobox"), "queued");
    expect(await screen.findByText("1 execução")).toBeInTheDocument();
  });

  it("loads more runs and appends without duplicating or losing the load-more control", async () => {
    renderRuns("repo-bella-api");
    const table = await screen.findByRole("table");
    expect(within(table).getAllByRole("button")).toHaveLength(20);

    await userEvent.click(screen.getByRole("button", { name: "Carregar mais" }));
    await screen.findByText("PR #121");
    expect(within(table).getAllByRole("button")).toHaveLength(24);
    expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
  });

  it("navigates to the run detail page when a row is clicked", async () => {
    renderRuns("repo-bella-api");
    await screen.findByRole("table");
    await userEvent.selectOptions(screen.getByRole("combobox"), "queued");

    const prLink = await screen.findByText("PR #121");
    await userEvent.click(prLink.closest("tr")!);
    expect(await screen.findByText("Detalhe da execução")).toBeInTheDocument();
  });

  it("shows the 'no runs at all' empty state for a repo with none", async () => {
    renderRuns("repo-bella-action");
    expect(await screen.findByText("Nenhuma execução ainda")).toBeInTheDocument();
  });

  it("shows a different empty message when the filter (not the repo) is what's empty", async () => {
    renderRuns("repo-bella-web");
    await screen.findByRole("table");
    // bella-web has completed/processing/failed runs but none "queued".
    await userEvent.selectOptions(screen.getByRole("combobox"), "queued");
    expect(await screen.findByText("Nenhuma execução com esse status")).toBeInTheDocument();
  });
});
