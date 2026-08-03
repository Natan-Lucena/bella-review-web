import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReviewParamsSection } from "./ReviewParamsSection";

const CONFIG = {
  model: "gemini-2.5-flash",
  tokenLimit: 100000,
  temperature: 0.2,
  enabledCategories: ["security"],
};

function renderOpen(onSave = vi.fn().mockResolvedValue(undefined)) {
  const utils = render(<ReviewParamsSection config={CONFIG} isPending={false} onSave={onSave} />);
  return { onSave, ...utils };
}

describe("ReviewParamsSection", () => {
  it("starts collapsed", () => {
    renderOpen();
    expect(screen.queryByLabelText("Modelo")).not.toBeInTheDocument();
  });

  it("sends only the fields that actually changed (real partial patch)", async () => {
    const { onSave } = renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    const modelInput = screen.getByLabelText("Modelo");
    await user.clear(modelInput);
    await user.type(modelInput, "gemini-2.5-pro");

    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));
    expect(onSave).toHaveBeenCalledWith({ model: "gemini-2.5-pro" });
  });

  it("does nothing when 'Salvar' is clicked without any change", async () => {
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
    await user.clear(tokenLimitInput);
    await user.type(tokenLimitInput, "50000");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(onSave).toHaveBeenCalledWith({ tokenLimit: 50000 });
    expect(await screen.findByText("Parâmetros salvos.")).toBeInTheDocument();
  });

  it("adds a category via TagInput and includes it in the patch", async () => {
    const { onSave } = renderOpen();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));

    await user.type(screen.getByPlaceholderText("Digite e pressione Enter"), "performance{Enter}");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(onSave).toHaveBeenCalledWith({ enabledCategories: ["security", "performance"] });
  });
});
