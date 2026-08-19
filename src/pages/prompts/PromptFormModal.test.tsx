import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { login, resetMockData } from "../../mocks/api-client";
import type { Prompt } from "../../types/prompt";
import { PromptFormModal } from "./PromptFormModal";

const EXISTING_PROMPT: Prompt = {
  id: "prompt-security-focus",
  name: "Security-first review",
  content:
    "Focus primarily on security vulnerabilities: injection, auth bypass, secrets committed to the repo, unsafe deserialization. Only flag other categories if the issue is severe.",
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

function renderModal(props: Partial<ComponentProps<typeof PromptFormModal>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onClose = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <PromptFormModal open onClose={onClose} {...props} />
    </QueryClientProvider>,
  );
  return { onClose };
}

// createPrompt/updatePrompt exigem uma sessão mock ativa (escopo por
// userId, ver mocks/api-client.ts, requireCurrentUserId) — mesmo padrão de
// PromptsPage.test.tsx.
beforeEach(async () => {
  resetMockData();
  await login("ana@example.com", "senha1234");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PromptFormModal", () => {
  it("opens in create mode with empty fields and the 'Novo prompt' title", () => {
    renderModal();

    expect(screen.getByRole("heading", { name: "Novo prompt" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("");
    expect(screen.getByLabelText("Conteúdo")).toHaveValue("");
  });

  it("opens in edit mode pre-filled from initialPrompt, with the 'Editar prompt' title", () => {
    renderModal({ initialPrompt: EXISTING_PROMPT });

    expect(screen.getByRole("heading", { name: "Editar prompt" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue(EXISTING_PROMPT.name);
    expect(screen.getByLabelText("Conteúdo")).toHaveValue(EXISTING_PROMPT.content);
  });

  it("keeps Salvar disabled while the name or content is empty or whitespace-only", async () => {
    renderModal();
    const saveButton = screen.getByRole("button", { name: "Salvar" });
    expect(saveButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Nome"), "   ");
    expect(saveButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Nome"), "Meu prompt");
    expect(saveButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Conteúdo"), "   ");
    expect(saveButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Conteúdo"), "Instruções de review");
    expect(saveButton).toBeEnabled();
  });

  it("creates a new prompt and closes the modal on success", async () => {
    const { onClose } = renderModal();

    await userEvent.type(screen.getByLabelText("Nome"), "Novo prompt de teste");
    await userEvent.type(screen.getByLabelText("Conteúdo"), "Conteúdo do prompt de teste");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("saves an edited prompt and closes the modal on success", async () => {
    const { onClose } = renderModal({ initialPrompt: EXISTING_PROMPT });

    await userEvent.clear(screen.getByLabelText("Conteúdo"));
    await userEvent.type(screen.getByLabelText("Conteúdo"), "Conteúdo atualizado");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("shows a friendly message for a duplicate name and keeps the modal open", async () => {
    const { onClose } = renderModal();

    // "Security-first review" já existe no seed do mock — dispara
    // prompt_name_already_exists (409), mesma checagem do backend real.
    await userEvent.type(screen.getByLabelText("Nome"), EXISTING_PROMPT.name);
    await userEvent.type(screen.getByLabelText("Conteúdo"), "Conteúdo qualquer");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Você já tem um prompt com esse nome.",
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders nothing when open is false", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <PromptFormModal open={false} onClose={vi.fn()} />
      </QueryClientProvider>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
