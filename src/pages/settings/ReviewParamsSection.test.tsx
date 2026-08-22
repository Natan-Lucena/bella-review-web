import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as apiClient from "../../mocks/api-client";
import { resetMockData } from "../../mocks/api-client";
import type { LlmProvider } from "../../types/llm-provider";
import type { ReviewLanguage } from "../../types/review-language";
import { ReviewParamsSection } from "./ReviewParamsSection";

function renderOpen(
  onSave = vi.fn().mockResolvedValue(undefined),
  currentProvider: LlmProvider = "gemini",
  currentPromptId: string | null = null,
  currentReviewLanguage: ReviewLanguage = "en",
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <ReviewParamsSection
        isPending={false}
        onSave={onSave}
        currentProvider={currentProvider}
        currentPromptId={currentPromptId}
        currentReviewLanguage={currentReviewLanguage}
      />
    </QueryClientProvider>,
  );
  return { onSave, ...utils };
}

beforeEach(async () => {
  resetMockData();
  // usePrompts() (listPrompts) exige uma sessão mock ativa, mesmo padrão de
  // DeletePromptModal.test.tsx.
  await apiClient.login("ana@example.com", "senha1234");
});

describe("ReviewParamsSection", () => {
  it("starts collapsed", () => {
    renderOpen();
    expect(screen.queryByLabelText("Modelo")).not.toBeInTheDocument();
  });

  it("fields start empty/neutral, with the current defaults only as placeholders (sem endpoint de leitura)", async () => {
    renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    expect(screen.getByLabelText("Modelo")).toHaveValue("");
    expect(screen.getByLabelText("Modelo")).toHaveAttribute("placeholder", "gemini-3.7-flash");
    expect(screen.getByLabelText("Limite de tokens por execução")).toHaveValue(null);
    // Sem currentPromptId, o seletor de prompt nasce em "Bella Default
    // Skill" (value=""), o mesmo estado neutro dos demais campos.
    expect(screen.getByLabelText("Prompt de review")).toHaveValue("");
  });

  it("reveals an explanation of what temperature does on hover", async () => {
    renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    const trigger = screen.getByRole("button", { name: "Mais informações sobre Temperatura" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await user.hover(trigger);
    expect(screen.getByRole("tooltip")).toHaveTextContent(/aleatoriedade das respostas/);
  });

  it("unlike model/tokenLimit (blind, no read endpoint), the prompt select starts pre-filled with currentPromptId, since promptId IS exposed by GET /repos", async () => {
    renderOpen(vi.fn(), "gemini", "prompt-security-focus");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    expect(
      await screen.findByRole("option", { name: "Security-first review" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Prompt de review")).toHaveValue("prompt-security-focus");
    // Confirms the asymmetry explicitly: model/tokenLimit stay blank even
    // though this same render call also has a real prompt pre-selected.
    expect(screen.getByLabelText("Modelo")).toHaveValue("");
  });

  it("shows model suggestions/placeholder for the given provider, not always Gemini", async () => {
    renderOpen(vi.fn(), "claude");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    expect(screen.getByLabelText("Modelo")).toHaveAttribute("placeholder", "claude-sonnet-5");
  });

  it("sends only the fields the user actually touched (real partial patch)", async () => {
    const { onSave } = renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    const modelInput = screen.getByLabelText("Modelo");
    await user.type(modelInput, "gemini-2.5-pro");

    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));
    expect(onSave).toHaveBeenCalledWith({ model: "gemini-2.5-pro" });
  });

  it("does nothing when 'Salvar' is clicked without touching any field", async () => {
    const { onSave } = renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("shows a transient 'Parâmetros salvos.' confirmation after a successful save", async () => {
    const { onSave } = renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    expect(screen.queryByText("Parâmetros salvos.")).not.toBeInTheDocument();

    const tokenLimitInput = screen.getByLabelText("Limite de tokens por execução");
    await user.type(tokenLimitInput, "50000");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(onSave).toHaveBeenCalledWith({ tokenLimit: 50000 });
    expect(await screen.findByText("Parâmetros salvos.")).toBeInTheDocument();
  });

  it("adds a category via TagInput and includes only that field in the patch", async () => {
    const { onSave } = renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    await user.type(screen.getByPlaceholderText("Digite e pressione Enter"), "performance{Enter}");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(onSave).toHaveBeenCalledWith({ enabledCategories: ["performance"] });
  });

  it("selecting a different prompt and saving sends promptId as that prompt's id string", async () => {
    const { onSave } = renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    await screen.findByRole("option", { name: "Concise comments" });
    await user.selectOptions(screen.getByLabelText("Prompt de review"), "prompt-concise-style");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(onSave).toHaveBeenCalledWith({ promptId: "prompt-concise-style" });
  });

  it("selecting 'Bella Default Skill' after a prompt was already selected sends promptId: null, not an absent key", async () => {
    const { onSave } = renderOpen(
      vi.fn().mockResolvedValue(undefined),
      "gemini",
      "prompt-security-focus",
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    await screen.findByRole("option", { name: "Security-first review" });
    await user.selectOptions(screen.getByLabelText("Prompt de review"), "");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(onSave).toHaveBeenCalledWith({ promptId: null });
  });

  it("catches up to the real promptId once it arrives after mount (repo data resolves async in the real app)", async () => {
    // Reproduces the real SettingsPage race: useRepo(repoId) hasn't resolved
    // on first render, so currentPromptId starts null and only becomes the
    // real value on a later render — useState(currentPromptId ?? "") alone
    // would freeze on "" forever in that case (confirmed live in the browser
    // against the real backend), since it only reads the prop at mount.
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <ReviewParamsSection
          isPending={false}
          onSave={vi.fn().mockResolvedValue(undefined)}
          currentProvider="gemini"
          currentPromptId={null}
          currentReviewLanguage="en"
        />
      </QueryClientProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));
    expect(screen.getByLabelText("Prompt de review")).toHaveValue("");

    rerender(
      <QueryClientProvider client={queryClient}>
        <ReviewParamsSection
          isPending={false}
          onSave={vi.fn().mockResolvedValue(undefined)}
          currentProvider="gemini"
          currentPromptId="prompt-security-focus"
          currentReviewLanguage="en"
        />
      </QueryClientProvider>,
    );

    await screen.findByRole("option", { name: "Security-first review" });
    expect(screen.getByLabelText("Prompt de review")).toHaveValue("prompt-security-focus");
  });

  it("not touching the prompt select at all does not include promptId in the patch", async () => {
    const { onSave } = renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    const modelInput = screen.getByLabelText("Modelo");
    await user.type(modelInput, "gemini-2.5-pro");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(onSave).toHaveBeenCalledWith({ model: "gemini-2.5-pro" });
    const [patch] = onSave.mock.calls[0] as [Record<string, unknown>];
    expect(patch).not.toHaveProperty("promptId");
  });

  it("unlike model/tokenLimit, the review language select starts pre-filled with currentReviewLanguage, not 'Inglês' by default", async () => {
    renderOpen(vi.fn(), "gemini", null, "pt");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    expect(screen.getByLabelText("Idioma dos comentários")).toHaveValue("pt");
  });

  it("changing the language and saving includes reviewLanguage in the patch", async () => {
    const { onSave } = renderOpen(vi.fn().mockResolvedValue(undefined), "gemini", null, "en");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    await user.selectOptions(screen.getByLabelText("Idioma dos comentários"), "es");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(onSave).toHaveBeenCalledWith({ reviewLanguage: "es" });
  });

  it("not touching the review language select at all does not include reviewLanguage in the patch", async () => {
    const { onSave } = renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    const modelInput = screen.getByLabelText("Modelo");
    await user.type(modelInput, "gemini-2.5-pro");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(onSave).toHaveBeenCalledWith({ model: "gemini-2.5-pro" });
    const [patch] = onSave.mock.calls[0] as [Record<string, unknown>];
    expect(patch).not.toHaveProperty("reviewLanguage");
  });
});
