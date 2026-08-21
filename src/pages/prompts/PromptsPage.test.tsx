import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as apiClient from "../../mocks/api-client";
import { login, resetMockData } from "../../mocks/api-client";
import { PromptsPage } from "./PromptsPage";

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PromptsPage />
    </QueryClientProvider>,
  );
}

// listPrompts (e as demais funções de prompts) exigem uma sessão mock ativa
// (escopo por userId, ver mocks/api-client.ts, requireCurrentUserId) —
// diferente de listRepos, que não checa autenticação. Login com o usuário
// seed antes de cada teste, mesmo padrão de mocks/api-client.test.ts.
beforeEach(async () => {
  resetMockData();
  await login("ana@example.com", "senha1234");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PromptsPage", () => {
  it("shows a loading skeleton before the prompts resolve", () => {
    renderPage();
    expect(screen.getAllByRole("presentation", { hidden: true })).toHaveLength(3);
  });

  it("renders each seeded prompt with its name and a content preview, plus Editar/Excluir buttons", async () => {
    renderPage();

    expect(await screen.findByText("Security-first review")).toBeInTheDocument();
    expect(screen.getByText("Concise comments")).toBeInTheDocument();

    expect(screen.getByText(/Focus primarily on security vulnerabilities/)).toBeInTheDocument();
    expect(screen.getByText(/Keep every comment to at most two sentences/)).toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: "Editar" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Excluir" })).toHaveLength(2);
  });

  it("shows the 'Novo prompt' button at the top when the list is non-empty", async () => {
    renderPage();

    expect(await screen.findByText("Security-first review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo prompt" })).toBeInTheDocument();
  });

  it("shows the empty state with its own 'Novo prompt' CTA when there are no prompts", async () => {
    vi.spyOn(apiClient, "listPrompts").mockResolvedValueOnce({ prompts: [] });
    renderPage();

    expect(await screen.findByText("Você ainda não tem nenhum prompt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo prompt" })).toBeInTheDocument();
  });

  it("shows a distinct error state when prompts fail to load, and retry refetches", async () => {
    vi.spyOn(apiClient, "listPrompts").mockRejectedValueOnce(new Error("network error"));
    renderPage();

    expect(await screen.findByText("Não foi possível carregar seus prompts")).toBeInTheDocument();
    expect(screen.queryByText("Você ainda não tem nenhum prompt")).not.toBeInTheDocument();
  });

  it("'Novo prompt' opens the create modal, and saving adds the new prompt to the list without a reload", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Security-first review");
    await user.click(screen.getByRole("button", { name: "Novo prompt" }));

    expect(screen.getByRole("heading", { name: "Novo prompt" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("");
    expect(screen.getByLabelText("Conteúdo")).toHaveValue("");

    await user.type(screen.getByLabelText("Nome"), "Testing focus");
    await user.type(
      screen.getByLabelText("Conteúdo"),
      "Always ask for tests covering the new behavior.",
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    // Modal closes and the list picks up the new prompt via the automatic
    // ["prompts"] invalidation on mutation success (src/data/prompts.ts) —
    // no manual refetch call, no page reload.
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(await screen.findByText("Testing focus")).toBeInTheDocument();
    expect(screen.getByText("Always ask for tests covering the new behavior.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Editar" })).toHaveLength(3);
  });

  it("'Editar' opens the modal pre-filled with that prompt's data, and saving updates what's shown in the list", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Security-first review");
    const card = screen.getByText("Security-first review").closest("div")!.parentElement!
      .parentElement!;
    await user.click(within(card).getByRole("button", { name: "Editar" }));

    expect(screen.getByRole("heading", { name: "Editar prompt" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("Security-first review");
    expect(screen.getByLabelText("Conteúdo")).toHaveValue(
      "Focus primarily on security vulnerabilities: injection, auth bypass, secrets committed to the repo, unsafe deserialization. Only flag other categories if the issue is severe.",
    );

    await user.clear(screen.getByLabelText("Conteúdo"));
    await user.type(screen.getByLabelText("Conteúdo"), "Updated review instructions.");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    // Name unchanged, content preview reflects the edit.
    expect(await screen.findByText("Updated review instructions.")).toBeInTheDocument();
    expect(
      screen.queryByText(/Focus primarily on security vulnerabilities/),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Security-first review")).toBeInTheDocument();
  });

  it("'Excluir' opens the delete confirmation, and confirming removes the prompt from the list", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Concise comments");
    const card = screen.getByText("Concise comments").closest("div")!.parentElement!.parentElement!;
    await user.click(within(card).getByRole("button", { name: "Excluir" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Tem certeza que quer apagar o prompt/)).toBeInTheDocument();
    expect(within(dialog).getByText("Concise comments")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText("Concise comments")).not.toBeInTheDocument());
    expect(screen.getByText("Security-first review")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Editar" })).toHaveLength(1);
  });
});
