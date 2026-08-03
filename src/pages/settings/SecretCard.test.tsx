import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SecretCard } from "./SecretCard";

describe("SecretCard", () => {
  it("generates immediately (no confirmation) when nothing was generated yet", async () => {
    const onGenerate = vi.fn();
    render(
      <SecretCard
        title="GitHub Action"
        statusText="Nenhum token gerado ainda"
        generateLabel="Gerar token"
        rotateWarningText="Gerar um novo token invalida o anterior imediatamente."
        alreadyGenerated={false}
        isPending={false}
        onGenerate={onGenerate}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Gerar token" }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it("requires a separate confirmation click before rotating an existing token", async () => {
    const onGenerate = vi.fn();
    render(
      <SecretCard
        title="GitHub Action"
        statusText="Token gerado em 12/07/2026"
        generateLabel="Gerar novo token"
        rotateWarningText="Gerar um novo token invalida o anterior imediatamente."
        alreadyGenerated
        isPending={false}
        onGenerate={onGenerate}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Gerar novo token" }));

    expect(onGenerate).not.toHaveBeenCalled();
    expect(
      screen.getByText("Gerar um novo token invalida o anterior imediatamente."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar rotação" }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it("cancels the pending rotation without calling onGenerate", async () => {
    const onGenerate = vi.fn();
    render(
      <SecretCard
        title="GitHub Action"
        statusText="Token gerado em 12/07/2026"
        generateLabel="Gerar novo token"
        rotateWarningText="Gerar um novo token invalida o anterior imediatamente."
        alreadyGenerated
        isPending={false}
        onGenerate={onGenerate}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Gerar novo token" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onGenerate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Gerar novo token" })).toBeInTheDocument();
  });

  it("shows the permanent help text only when not confirming a rotation", async () => {
    render(
      <SecretCard
        title="Webhook nativo"
        statusText="Nenhum segredo gerado ainda"
        generateLabel="Gerar segredo"
        rotateWarningText="Gerar um novo segredo invalida o anterior imediatamente."
        helpText="Só necessário se você quiser integrar via webhook nativo do GitHub."
        alreadyGenerated={false}
        isPending={false}
        onGenerate={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Só necessário se você quiser integrar via webhook nativo do GitHub."),
    ).toBeInTheDocument();
  });
});
