import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { WizardPage } from "./WizardPage";

function renderWizard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/repos/new"]}>
        <Routes>
          <Route path="/repos/new" element={<WizardPage />} />
          <Route path="/repos" element={<h1>Meus repositórios</h1>} />
          <Route path="/repos/:id" element={<RepoIdProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function RepoIdProbe() {
  return <h1>Painel do repositório</h1>;
}

beforeEach(() => {
  resetMockData();
});

async function completeStep1(user: ReturnType<typeof userEvent.setup>, fullName: string) {
  await user.type(screen.getByLabelText("Nome do repositório"), fullName);
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await screen.findByRole("heading", { name: "Como a Bella vai ser acionada?" });
}

async function completeStep3(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole("heading", { name: "Sua chave do Gemini" });
  await user.type(screen.getByLabelText("Chave da API"), "gemini-key-123");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await screen.findByRole("heading", { name: "Seu Personal Access Token do GitHub" });
}

async function completeStep4(user: ReturnType<typeof userEvent.setup>) {
  expect(screen.getByRole("link", { name: "Gerar token no GitHub" })).toHaveAttribute(
    "href",
    expect.stringContaining("github.com/settings/tokens/new"),
  );
  await user.type(screen.getByLabelText("Personal Access Token"), "ghp_abc123");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await screen.findByRole("button", { name: /^Gerar/ });
}

describe("WizardPage", () => {
  it("keeps 'Continuar' disabled on Step 1 until the fullName format is valid", async () => {
    renderWizard();
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Continuar" });
    expect(button).toBeDisabled();

    const input = screen.getByLabelText("Nome do repositório");
    await user.type(input, "sem-barra-nenhuma");
    expect(button).toBeDisabled();
    expect(
      screen.getByText("Use o formato organização/repositório, com uma única barra e sem espaços."),
    ).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "minha-org/meu-repositorio");
    expect(button).toBeEnabled();
  });

  it("completes the full happy path for the Action method", async () => {
    renderWizard();
    const user = userEvent.setup();

    await completeStep1(user, "minha-org/repo-action");

    // Step 2: "Via GitHub Action" is selected by default.
    expect(screen.getByRole("radio", { name: /Via GitHub Action/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await completeStep3(user);
    await completeStep4(user);

    await screen.findByRole("heading", { name: "Gere o token da Action" });
    expect(
      screen.queryByRole("heading", { level: 1, name: /está pronto/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Gerar token" }));

    expect(await screen.findByText("Seu token")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      await screen.findByRole("heading", { name: "minha-org/repo-action está pronto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("BELLA_TOKEN")).toBeInTheDocument();
    expect(screen.getByText(/Natan-Lucena\/bella-review-action@v1/)).toBeInTheDocument();

    const finishButton = screen.getByRole("button", { name: "Ir para o painel" });
    expect(finishButton).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: /Já copiei e configurei/ }));
    expect(finishButton).toBeEnabled();

    await user.click(finishButton);
    expect(
      await screen.findByRole("heading", { name: "Painel do repositório" }),
    ).toBeInTheDocument();
  });

  it("completes the full happy path for the Webhook method", async () => {
    renderWizard();
    const user = userEvent.setup();

    await completeStep1(user, "minha-org/repo-webhook");

    await user.click(screen.getByRole("radio", { name: /Via webhook nativo/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await completeStep3(user);
    await completeStep4(user);

    await screen.findByRole("heading", { name: "Gere o segredo do webhook" });
    await user.click(screen.getByRole("button", { name: "Gerar segredo" }));

    expect(await screen.findByText("URL do webhook")).toBeInTheDocument();
    expect(screen.getByText("Segredo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      await screen.findByRole("heading", { name: "minha-org/repo-webhook está pronto" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("URL do webhook")).toHaveLength(1);
    expect(screen.getAllByText("Segredo")).toHaveLength(1);
    // No YAML CodeBlock for the webhook flow.
    expect(screen.queryByText(/bella-review-action@v1/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Já copiei e configurei/ }));
    await user.click(screen.getByRole("button", { name: "Ir para o painel" }));
    expect(
      await screen.findByRole("heading", { name: "Painel do repositório" }),
    ).toBeInTheDocument();
  });

  it("supports arrow-key navigation between the two Step 2 options, moving focus", async () => {
    renderWizard();
    const user = userEvent.setup();
    await completeStep1(user, "org/repo");

    const actionRadio = screen.getByRole("radio", { name: /Via GitHub Action/ });
    const webhookRadio = screen.getByRole("radio", { name: /Via webhook nativo/ });
    actionRadio.focus();

    await user.keyboard("{ArrowDown}");
    expect(webhookRadio).toHaveAttribute("aria-checked", "true");
    expect(webhookRadio).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(actionRadio).toHaveAttribute("aria-checked", "true");
    expect(actionRadio).toHaveFocus();
  });

  it("going Back preserves already-entered field values", async () => {
    renderWizard();
    const user = userEvent.setup();
    await completeStep1(user, "org/repo-back");

    await user.click(screen.getByRole("button", { name: "Voltar" }));
    await screen.findByRole("heading", { name: "Qual repositório a Bella vai revisar?" });
    expect(screen.getByLabelText("Nome do repositório")).toHaveValue("org/repo-back");
  });

  it("hides the step progress indicator on Step 6", async () => {
    renderWizard();
    const user = userEvent.setup();
    await completeStep1(user, "org/repo-progress");
    expect(screen.getByText(/Passo 2 de 5/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await completeStep3(user);
    await completeStep4(user);
    await user.click(screen.getByRole("button", { name: "Gerar token" }));
    await screen.findByText("Seu token");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: /está pronto/ });
    expect(screen.queryByText(/Passo \d de 5/)).not.toBeInTheDocument();
  });

  it("'Fechar' is a real link to /repos, not a button", () => {
    renderWizard();
    const closeLink = screen.getByRole("link", { name: "Fechar" });
    expect(closeLink).toHaveAttribute("href", "/repos");
  });

  it("keeps 'Continuar' disabled on Steps 3/4 until the credential field is non-empty", async () => {
    renderWizard();
    const user = userEvent.setup();
    await completeStep1(user, "org/repo-required-fields");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByRole("heading", { name: "Sua chave do Gemini" });

    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
    await user.type(screen.getByLabelText("Chave da API"), "gemini-key");
    expect(screen.getByRole("button", { name: "Continuar" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: "Seu Personal Access Token do GitHub" });
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
    await user.type(screen.getByLabelText("Personal Access Token"), "ghp_token");
    expect(screen.getByRole("button", { name: "Continuar" })).toBeEnabled();
  });
});
