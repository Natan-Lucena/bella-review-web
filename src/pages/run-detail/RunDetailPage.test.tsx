import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as apiClient from "../../mocks/api-client";
import { resetMockData } from "../../mocks/api-client";
import { RunDetailPage } from "./RunDetailPage";

function renderDetail(repoId: string, runId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/repos/${repoId}/runs/${runId}`]}>
        <Routes>
          <Route path="/repos/:id/runs" element={<div>Lista de execuções</div>} />
          <Route path="/repos/:id/runs/:runId" element={<RunDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RunDetailPage", () => {
  it("shows a loading skeleton before the run resolves", () => {
    renderDetail("repo-bella-web", "run-bella-web-completed");
    expect(screen.getAllByRole("presentation", { hidden: true }).length).toBeGreaterThan(0);
  });

  it("renders the header, a real turn as a list item, and the comments (without a PR link, per Tela 9)", async () => {
    renderDetail("repo-bella-web", "run-bella-web-completed");
    expect(await screen.findByText("PR #2")).toBeInTheDocument();
    expect(screen.getByText("Turno 0")).toBeInTheDocument();
    expect(screen.getByText("15.438")).toBeInTheDocument(); // inputTokens
    expect(screen.getByText("1.901")).toBeInTheDocument(); // reasoningTokens

    expect(
      screen.getByText(
        "O guard de autenticação não trata o caso de sessão expirada durante a navegação.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /PR #/ })).not.toBeInTheDocument();
  });

  it("flags the one 'generated' (not published) comment as orphaned", async () => {
    renderDetail("repo-bella-web", "run-bella-web-completed");
    await screen.findByText("PR #2");
    expect(screen.getByText(/nunca publicado no Pull Request/)).toBeInTheDocument();
  });

  it("shows the full, untruncated errorReason for a failed run", async () => {
    renderDetail("repo-bella-web", "run-bella-web-failed");
    const heading = await screen.findByText("Motivo da falha");
    // The fixture's lone turn happens to share the same errorReason string as
    // the run itself, so scope the assertion to the header block specifically.
    expect(
      within(heading.parentElement!).getByText("Gemini request exceeded token limit"),
    ).toBeInTheDocument();
  });

  it("falls back gracefully when a run has no turns and no comments yet", async () => {
    renderDetail("repo-bella-web", "run-bella-web-processing");
    expect(await screen.findByText("Nenhum turno registrado ainda.")).toBeInTheDocument();
    expect(screen.getByText("Esta execução não gerou nenhum comentário.")).toBeInTheDocument();
  });

  it("shows a generic 'not found' message (never distinguishing missing vs. wrong-owner) for an invalid runId", async () => {
    renderDetail("repo-bella-web", "does-not-exist");
    expect(await screen.findByText("Execução não encontrada")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Voltar para execuções" }));
    expect(await screen.findByText("Lista de execuções")).toBeInTheDocument();
  });

  it("shows a retryable error (not the 'not found' message) when the fetch itself fails", async () => {
    vi.spyOn(apiClient, "getReviewRunDetail").mockRejectedValueOnce(new Error("network error"));
    renderDetail("repo-bella-web", "run-bella-web-completed");

    expect(await screen.findByText("Não foi possível carregar esta execução")).toBeInTheDocument();
    expect(screen.queryByText("Execução não encontrada")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("PR #2")).toBeInTheDocument();
  });
});
