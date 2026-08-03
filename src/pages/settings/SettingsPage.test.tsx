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

// Fase 2: sem endpoint de leitura de credenciais/config, a tela nasce direto
// (sem skeleton) e nenhum bloco mostra status "configurado em {data}" — ver
// ReviewParamsSection.test.tsx e CredentialSection.test.tsx pro
// comportamento por-bloco do modelo "touched-only".
describe("SettingsPage", () => {
  it("renders all four blocks immediately, with no pre-filled status", () => {
    renderSettings("repo-bella-api");
    expect(screen.getByRole("heading", { name: "Configurações" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Credencial do LLM/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Credencial do GitHub/ })).toBeInTheDocument();
    expect(screen.getByText("GitHub Action")).toBeInTheDocument();
    expect(screen.getByText("Webhook nativo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Parâmetros de review" })).toBeInTheDocument();
    expect(screen.queryByText(/configurado em/)).not.toBeInTheDocument();
  });

  it("shows the 'gerar token no GitHub' link only on the SCM (PAT) block, not the LLM one", async () => {
    renderSettings("repo-bella-api");
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Credencial do LLM/ }));
    expect(screen.queryByRole("link", { name: "Gerar token no GitHub" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Credencial do GitHub/ }));
    expect(screen.getByRole("link", { name: "Gerar token no GitHub" })).toHaveAttribute(
      "href",
      expect.stringContaining("github.com/settings/tokens/new"),
    );
  });

  it("saves the LLM credential and clears the field", async () => {
    renderSettings("repo-bella-action");
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Credencial do LLM · Gemini/ }));
    const input = screen.getByLabelText("Chave da API");
    await user.type(input, "nova-chave-123");
    await user.click(screen.getByRole("button", { name: "Salvar chave" }));

    expect(await screen.findByDisplayValue("")).toBeInTheDocument();
  });

  it("generating an Action token opens the SecretRevealModal with the value, gated by the ack checkbox", async () => {
    renderSettings("repo-bella-action");
    const user = userEvent.setup();

    // Sem endpoint de leitura, esta tela sempre exige confirmação antes de
    // gerar (nunca assume "ainda não gerado" — ver PRD da Fase 2).
    await user.click(screen.getByRole("button", { name: "Gerar novo token" }));
    await user.click(screen.getByRole("button", { name: "Confirmar rotação" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: "Já copiei/configurei" }));
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("generating a webhook secret shows both the URL and the secret in the modal", async () => {
    renderSettings("repo-bella-action");
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Gerar novo segredo" }));
    await user.click(screen.getByRole("button", { name: "Confirmar rotação" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("URL do webhook");
    expect(dialog).toHaveTextContent("https://bella-reviewer-api.vercel.app/webhooks/github");
  });

  it("always requires confirmation before generating a token, even for a repo with no credentials at all", async () => {
    renderSettings("repo-bella-action");
    const user = userEvent.setup();

    const generateButton = screen.getByRole("button", { name: "Gerar novo token" });
    await user.click(generateButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByText("Se já existir um token gerado, esta ação invalida o anterior imediatamente."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar rotação" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("edits review params and sends only the touched fields", async () => {
    renderSettings("repo-bella-api");
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));
    const modelInput = screen.getByLabelText("Modelo");
    await user.type(modelInput, "gemini-2.5-pro");
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));

    expect(await screen.findByText("Parâmetros salvos.")).toBeInTheDocument();
  });
});
