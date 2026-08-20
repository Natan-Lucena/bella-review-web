import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { queryKeys } from "../../data/query-keys";
import * as apiClient from "../../mocks/api-client";
import { resetMockData } from "../../mocks/api-client";
import type { Prompt } from "../../types/prompt";
import { DeletePromptModal } from "./DeletePromptModal";

// Espelha exatamente o seed de src/mocks/fixtures.ts (seedPrompts[0]) — o id
// precisa bater com o de um prompt de verdade pro filtro de affectedRepos
// (promptId === prompt.id) funcionar nos testes que apontam um repo pra ele.
const SECURITY_PROMPT: Prompt = {
  id: "prompt-security-focus",
  name: "Security-first review",
  content: "Focus primarily on security vulnerabilities...",
  createdAt: "2026-06-01T12:00:00.000Z",
  updatedAt: "2026-06-01T12:00:00.000Z",
};

function renderModal(prompt: Prompt, onClose = vi.fn(), onDeleted = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    onClose,
    onDeleted,
    ...render(
      <QueryClientProvider client={queryClient}>
        <DeletePromptModal open prompt={prompt} onClose={onClose} onDeleted={onDeleted} />
      </QueryClientProvider>,
    ),
  };
}

beforeEach(async () => {
  resetMockData();
  // deletePrompt (e listPrompts) exigem uma sessão mock ativa — useRepos()
  // sozinho não exige, mas a mutation de exclusão sim.
  await apiClient.login("ana@example.com", "senha1234");
});

describe("DeletePromptModal", () => {
  it("renders nothing when closed", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <DeletePromptModal open={false} prompt={SECURITY_PROMPT} onClose={vi.fn()} />
      </QueryClientProvider>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a simple confirmation with no repo mention when no repo uses the prompt", async () => {
    renderModal(SECURITY_PROMPT);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // useRepos() ainda está em voo logo após o mount (ver teste de loading
    // acima) — espera a resposta real chegar antes de checar a cópia final.
    expect(await screen.findByText(/Tem certeza que quer apagar o prompt/)).toBeInTheDocument();
    expect(screen.getByText("Security-first review")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByText(/Bella Default Skill/)).not.toBeInTheDocument();
  });

  it("shows a loading state — not the zero-affected-repos copy, and Excluir disabled — while useRepos() is still in flight", () => {
    renderModal(SECURITY_PROMPT);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Verificando quais repositórios usam/)).toBeInTheDocument();
    expect(screen.queryByText(/Tem certeza que quer apagar/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeDisabled();
  });

  it("falls back to a warning (Excluir still enabled) instead of asserting zero affected repos when useRepos() fails", async () => {
    vi.spyOn(apiClient, "listRepos").mockRejectedValueOnce(new Error("network error"));

    renderModal(SECURITY_PROMPT);

    expect(
      await screen.findByText(/Não foi possível verificar quais repositórios usam/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Tem certeza que quer apagar/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeEnabled();
  });

  it("lists every affected repo by fullName (not just a count) and mentions the Bella Default Skill", async () => {
    await apiClient.updateRepoConfig("repo-bella-api", { promptId: SECURITY_PROMPT.id });
    await apiClient.updateRepoConfig("repo-bella-web", { promptId: SECURITY_PROMPT.id });

    renderModal(SECURITY_PROMPT);

    // useRepos() resolve com um pequeno delay simulado — findByText espera a
    // resposta real chegar (a UI mostra "Verificando..." até lá, ver teste
    // de loading acima).
    expect(await screen.findByText("Natan-Lucena/bella-reviewer-api")).toBeInTheDocument();
    expect(screen.getByText("Natan-Lucena/bella-review-web")).toBeInTheDocument();
    // repo-bella-action never pointed to this prompt — shouldn't be listed.
    expect(screen.queryByText("Natan-Lucena/bella-review-action")).not.toBeInTheDocument();
    expect(screen.getByText(/vão voltar para o Bella Default Skill/)).toBeInTheDocument();
    // Não é só uma contagem — os dois <li> de fato existem.
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("calls the delete mutation and closes the modal when 'Excluir' is clicked", async () => {
    const user = userEvent.setup();
    const { onClose, onDeleted } = renderModal(SECURITY_PROMPT);

    await screen.findByRole("dialog");
    // Excluir fica desabilitado até useRepos() resolver (ver teste de
    // loading acima) — espera o texto de confirmação real aparecer antes de
    // clicar, senão o clique bate num botão ainda desabilitado.
    await screen.findByText(/Tem certeza que quer apagar/);
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    // A mutation (deletePrompt) tem latência simulada — o clique só dispara
    // handleDelete, que resolve depois; onClose/onDeleted só rodam quando a
    // Promise de fato resolve.
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onDeleted).toHaveBeenCalledTimes(1);

    const { prompts } = await apiClient.listPrompts();
    expect(prompts.find((prompt) => prompt.id === SECURITY_PROMPT.id)).toBeUndefined();
  });

  it("invalidates the ['repos'] cache after deleting an in-use prompt — deletion changes repo config server-side (onDelete: SetNull) with no repo mutation to trigger a refetch otherwise", async () => {
    await apiClient.updateRepoConfig("repo-bella-api", { promptId: SECURITY_PROMPT.id });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <DeletePromptModal open prompt={SECURITY_PROMPT} onClose={vi.fn()} />
      </QueryClientProvider>,
    );

    await screen.findByText("Natan-Lucena/bella-reviewer-api");
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => {
      const cached = queryClient.getQueryData<{
        repos: { id: string; promptId: string | null }[];
      }>(queryKeys.repos());
      const repo = cached?.repos.find((r) => r.id === "repo-bella-api");
      expect(repo?.promptId).toBeNull();
    });
  });

  it("calls onClose (without deleting) when 'Cancelar' is clicked", async () => {
    const user = userEvent.setup();
    const { onClose, onDeleted } = renderModal(SECURITY_PROMPT);

    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDeleted).not.toHaveBeenCalled();

    const { prompts } = await apiClient.listPrompts();
    expect(prompts.find((prompt) => prompt.id === SECURITY_PROMPT.id)).toBeDefined();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal(SECURITY_PROMPT);

    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a click outside the dialog", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal(SECURITY_PROMPT);

    const overlay = (await screen.findByRole("dialog")).parentElement!;
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
