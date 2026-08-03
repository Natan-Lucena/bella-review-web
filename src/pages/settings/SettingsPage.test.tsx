import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { SettingsPage } from "./SettingsPage";

function renderSettings(repoId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/repos/${repoId}/settings`]}>
        <Routes>
          <Route path="/repos/:id/settings" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("SettingsPage", () => {
  it("shows a loading skeleton before the settings snapshot resolves", () => {
    renderSettings("repo-bella-api");
    expect(screen.getAllByRole("presentation", { hidden: true }).length).toBeGreaterThan(0);
  });

  it("shows the configured status for both credentials of a fully-set-up repo", async () => {
    renderSettings("repo-bella-api");
    expect(await screen.findAllByText(/•••••••• configurado em/)).toHaveLength(2);
  });

  it("shows 'Ainda não configurada' for a repo with no credentials at all", async () => {
    renderSettings("repo-bella-action");
    expect(await screen.findAllByText("Ainda não configurada")).toHaveLength(2);
    expect(screen.getByText("Nenhum token gerado ainda")).toBeInTheDocument();
    expect(screen.getByText("Nenhum segredo gerado ainda")).toBeInTheDocument();
  });

  it("saves the LLM credential and reflects the new status after refetch", async () => {
    renderSettings("repo-bella-action");
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: /Credencial do LLM · Gemini/ }));
    await user.type(screen.getByLabelText("Chave da API"), "nova-chave-123");
    await user.click(screen.getByRole("button", { name: "Salvar chave" }));

    expect(await screen.findByText(/•••••••• configurado em/)).toBeInTheDocument();
  });

  it("generating an Action token opens the SecretRevealModal with the value, gated by the ack checkbox", async () => {
    renderSettings("repo-bella-action");
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Gerar token" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: "Já copiei/configurei" }));
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("generating a webhook secret shows both the URL and the secret in the modal", async () => {
    renderSettings("repo-bella-action");
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Gerar segredo" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("URL do webhook");
    expect(dialog).toHaveTextContent("https://bella-reviewer-api.vercel.app/webhooks/github");
  });

  it("requires confirmation before rotating an already-generated Action token", async () => {
    renderSettings("repo-bella-api");
    const user = userEvent.setup();

    const rotateButton = await screen.findByRole("button", { name: "Gerar novo token" });
    await user.click(rotateButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar rotação" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("edits review params and sends only the changed fields", async () => {
    renderSettings("repo-bella-api");
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Parâmetros de review" }));
    const modelInput = screen.getByLabelText("Modelo");
    await user.clear(modelInput);
    await user.type(modelInput, "gemini-2.5-pro");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(await screen.findByText("Parâmetros salvos.")).toBeInTheDocument();
  });
});
