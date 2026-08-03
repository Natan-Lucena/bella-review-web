import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CredentialSection } from "./CredentialSection";

const BASE_PROPS = {
  title: "Credencial do LLM · Gemini",
  fieldLabel: "Chave da API",
  htmlForPrefix: "settings-llm",
  placeholder: "cole sua chave de API do Gemini",
  hint: "A chave nunca é devolvida pela API depois de salva.",
  saveLabel: "Salvar chave",
  isPending: false,
};

describe("CredentialSection", () => {
  it("starts collapsed, with no status text (sem endpoint de leitura na Fase 2)", async () => {
    render(<CredentialSection {...BASE_PROPS} onSave={vi.fn()} />);
    expect(screen.queryByText(/configurada/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Credencial do LLM/ }));
    expect(screen.getByRole("button", { name: "Salvar chave" })).toBeInTheDocument();
  });

  it("keeps save disabled until a value is typed, then saves and clears the field", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<CredentialSection {...BASE_PROPS} onSave={onSave} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Credencial do LLM/ }));

    const saveButton = screen.getByRole("button", { name: "Salvar chave" });
    expect(saveButton).toBeDisabled();

    const input = screen.getByLabelText("Chave da API");
    await user.type(input, "minha-chave-123");
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);
    expect(onSave).toHaveBeenCalledWith("minha-chave-123");
    expect(input).toHaveValue("");
  });

  it("shows an inline error and keeps the value when saving fails", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("boom"));
    render(<CredentialSection {...BASE_PROPS} onSave={onSave} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Credencial do LLM/ }));
    await user.type(screen.getByLabelText("Chave da API"), "minha-chave-123");
    await user.click(screen.getByRole("button", { name: "Salvar chave" }));

    expect(
      await screen.findByText("Não foi possível salvar agora. Tente novamente."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Chave da API")).toHaveValue("minha-chave-123");
  });

  it("omits the help link by default, and renders it (opening in a new tab) when provided", async () => {
    const { rerender } = render(<CredentialSection {...BASE_PROPS} onSave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /Credencial do LLM/ }));
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    rerender(
      <CredentialSection
        {...BASE_PROPS}
        onSave={vi.fn()}
        helpLink={{
          label: "Gerar token no GitHub",
          href: "https://github.com/settings/tokens/new",
        }}
      />,
    );
    const link = screen.getByRole("link", { name: "Gerar token no GitHub" });
    expect(link).toHaveAttribute("href", "https://github.com/settings/tokens/new");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});
