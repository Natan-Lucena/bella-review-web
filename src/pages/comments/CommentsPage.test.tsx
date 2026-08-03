import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { CommentsPage } from "./CommentsPage";

function renderComments(repoId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/repos/${repoId}/comments`]}>
        <Routes>
          <Route path="/repos/:id/comments" element={<CommentsPage />} />
          <Route path="/repos/:id/runs/:runId" element={<div>Detalhe da execução</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("CommentsPage", () => {
  it("renders the full history with the total count", async () => {
    renderComments("repo-bella-api");
    expect(await screen.findByText("24 comentários")).toBeInTheDocument();
  });

  it("links a comment's PR to the run detail page (Tela 9), not to GitHub", async () => {
    renderComments("repo-bella-api");
    const link = await screen.findAllByRole("link", { name: /PR #/ });
    expect(link[0]).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/repos\/repo-bella-api\/runs\//),
    );
  });

  it("filters by category as free text (substring, not exact match) and re-fetches", async () => {
    renderComments("repo-bella-api");
    await screen.findByText("24 comentários");

    await userEvent.type(screen.getByLabelText("Filtrar por categoria"), "sec");
    expect(await screen.findByText("4 comentários")).toBeInTheDocument();
    expect(screen.getAllByText("security")).toHaveLength(4);
  });

  it("filters by severity via the closed dropdown", async () => {
    renderComments("repo-bella-api");
    await screen.findByText("24 comentários");

    await userEvent.selectOptions(screen.getByLabelText("Filtrar por severidade"), "critical");
    expect(await screen.findByText("6 comentários")).toBeInTheDocument();
  });

  it("filters by status and shows the correct badge label", async () => {
    renderComments("repo-bella-api");
    await screen.findByText("24 comentários");

    await userEvent.selectOptions(screen.getByLabelText("Filtrar por status"), "discarded");
    expect(await screen.findByText("1 comentário")).toBeInTheDocument();
    // "Descartado" also appears as the <option> label in the status <select> —
    // the badge on the comment row itself is the <span>, not the <option>.
    const badge = screen.getAllByText("Descartado").find((el) => el.tagName === "SPAN");
    expect(badge).toBeInTheDocument();
  });

  it("highlights an orphaned 'generated' comment with the warning box", async () => {
    renderComments("repo-bella-api");
    await screen.findByText("24 comentários");

    await userEvent.selectOptions(screen.getByLabelText("Filtrar por status"), "generated");
    expect(await screen.findByText("6 comentários")).toBeInTheDocument();
    expect(screen.getAllByText(/nunca publicado no Pull Request/).length).toBe(6);
  });

  it("shows the no-filter empty state for a repo with zero comments", async () => {
    renderComments("repo-bella-action");
    expect(await screen.findByText("Nenhum comentário gerado ainda")).toBeInTheDocument();
  });

  it("shows a different empty state (with a clear-filters action) when filters are too restrictive", async () => {
    renderComments("repo-bella-api");
    await screen.findByText("24 comentários");

    await userEvent.type(
      screen.getByLabelText("Filtrar por categoria"),
      "não existe categoria assim",
    );
    expect(await screen.findByText("Nenhum comentário encontrado")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(await screen.findByText("24 comentários")).toBeInTheDocument();
  });

  it("loads more comments and appends without duplicating", async () => {
    renderComments("repo-bella-api");
    await screen.findByText("24 comentários");
    expect(screen.getAllByText(/Comentário de exemplo/)).toHaveLength(20);

    await userEvent.click(screen.getByRole("button", { name: "Carregar mais" }));
    await screen.findByText("Comentário de exemplo #24 gerado pela IA sobre este trecho.");
    expect(screen.getAllByText(/Comentário de exemplo/)).toHaveLength(24);
    expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
  });
});
