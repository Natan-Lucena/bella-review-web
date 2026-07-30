import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as apiClient from "../../mocks/api-client";
import { resetMockData } from "../../mocks/api-client";
import { ReposListPage } from "./ReposListPage";

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/repos"]}>
        <Routes>
          <Route path="/repos" element={<ReposListPage />} />
          <Route path="/repos/new" element={<h1>Adicionar repositório</h1>} />
          <Route path="/repos/:id" element={<RepoIdProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function RepoIdProbe() {
  return <h1>Painel do repositório</h1>;
}

beforeEach(() => {
  resetMockData();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ReposListPage", () => {
  it("shows a loading skeleton before the repos resolve", () => {
    renderPage();
    expect(screen.getAllByRole("presentation", { hidden: true })).toHaveLength(3);
  });

  it("renders each seeded repo with its config badge and model line", async () => {
    renderPage();

    expect(await screen.findByText("Natan-Lucena/bella-reviewer-api")).toBeInTheDocument();
    expect(screen.getByText("Natan-Lucena/bella-review-web")).toBeInTheDocument();
    expect(screen.getByText("Natan-Lucena/bella-review-action")).toBeInTheDocument();

    // bella-reviewer-api e bella-review-web: llm+scm+(token OU webhook) ->
    // "Pronto para revisar" (bella-review-web tem token da Action mesmo sem
    // segredo de webhook, e ainda assim conta como pronto).
    expect(screen.getAllByText("Pronto para revisar")).toHaveLength(2);
    // bella-review-action (nada configurado) -> "Configuração pendente".
    expect(screen.getAllByText("Configuração pendente")).toHaveLength(1);

    // bella-review-web tem llm configurado -> o modelo real aparece, não
    // "ainda não configurado".
    expect(screen.getAllByText("Gemini · gemini-2.5-flash")).toHaveLength(2);
    // bella-review-action nunca configurou llm -> texto de fallback.
    expect(screen.getByText("Ainda não configurado")).toBeInTheDocument();
  });

  it("shows the explanatory callout about the 'pronto para revisar' badge only when there are repos", async () => {
    renderPage();
    expect(await screen.findByText("Natan-Lucena/bella-reviewer-api")).toBeInTheDocument();
    expect(screen.getByText(/Sobre o selo "pronto para revisar"/)).toBeInTheDocument();
  });

  it("does not show the callout in the empty state", async () => {
    vi.spyOn(apiClient, "listRepos").mockResolvedValueOnce({ repos: [] });
    renderPage();
    expect(await screen.findByText("Você ainda não tem nenhum repositório")).toBeInTheDocument();
    expect(screen.queryByText(/Sobre o selo/)).not.toBeInTheDocument();
  });

  it("navigates to /repos/:id when a repo card is clicked", async () => {
    renderPage();
    const user = userEvent.setup();

    const card = await screen.findByRole("button", { name: /bella-reviewer-api/ });
    await user.click(card);

    expect(
      await screen.findByRole("heading", { name: "Painel do repositório" }),
    ).toBeInTheDocument();
  });

  it("navigates to /repos/new when 'Adicionar repositório' is clicked", async () => {
    renderPage();
    const user = userEvent.setup();

    const link = await screen.findByRole("link", { name: "Adicionar repositório" });
    await user.click(link);

    expect(
      await screen.findByRole("heading", { name: "Adicionar repositório" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state and its CTA navigates to /repos/new", async () => {
    vi.spyOn(apiClient, "listRepos").mockResolvedValueOnce({ repos: [] });
    renderPage();
    const user = userEvent.setup();

    expect(await screen.findByText("Você ainda não tem nenhum repositório")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Adicionar repositório" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Adicionar repositório" }));
    expect(
      await screen.findByRole("heading", { name: "Adicionar repositório" }),
    ).toBeInTheDocument();
  });
});
