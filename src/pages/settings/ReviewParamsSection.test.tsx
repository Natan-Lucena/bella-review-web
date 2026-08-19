import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { LlmProvider } from "../../types/llm-provider";
import { ReviewParamsSection } from "./ReviewParamsSection";

function renderOpen(
  onSave = vi.fn().mockResolvedValue(undefined),
  currentProvider: LlmProvider = "gemini",
) {
  const utils = render(
    <ReviewParamsSection isPending={false} onSave={onSave} currentProvider={currentProvider} />,
  );
  return { onSave, ...utils };
}

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
});
