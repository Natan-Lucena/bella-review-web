import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
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

// Passo 1 nasce no fluxo de conexão com o GitHub (PRD 11) — os testes que só
// precisam passar do Passo 1 sem exercitar esse fluxo em si usam o escape
// hatch manual, que cai exatamente no formulário de antes da Fase 2.
async function completeStep1(user: ReturnType<typeof userEvent.setup>, fullName: string) {
  await user.click(screen.getByRole("button", { name: "Prefiro digitar o nome manualmente" }));
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
  it("keeps 'Continuar' disabled on the manual fallback until the fullName format is valid", async () => {
    renderWizard();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Prefiro digitar o nome manualmente" }));

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

  it("connects with a PAT, lists repos flagging the already-added ones, and picking one creates it", async () => {
    renderWizard();
    const user = userEvent.setup();

    expect(screen.getByRole("heading", { name: "Qual repositório a Bella vai revisar?" })).toBeInTheDocument();
    const connectButton = screen.getByRole("button", { name: "Conectar" });
    expect(connectButton).toBeDisabled();

    await user.type(screen.getByLabelText("Personal Access Token"), "ghp_connect_token");
    expect(connectButton).toBeEnabled();
    await user.click(connectButton);

    await screen.findByRole("heading", { name: "Escolha o repositório" });
    await screen.findByText("Natan-Lucena/side-project");

    // Repo já cadastrado (fixture do seed) aparece desabilitado, com o badge certo.
    const alreadyAddedButton = screen.getByRole("button", {
      name: /Natan-Lucena\/bella-reviewer-api/,
    });
    expect(alreadyAddedButton).toBeDisabled();
    expect(within(alreadyAddedButton).getByText("já adicionado")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Natan-Lucena\/side-project/ }));

    await screen.findByRole("heading", { name: "Como instalar a Action?" });
    expect(screen.getByText("Repositório: Natan-Lucena/side-project")).toBeInTheDocument();
  });

  it("filters the repo picker as the user types", async () => {
    renderWizard();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Personal Access Token"), "ghp_connect_token");
    await user.click(screen.getByRole("button", { name: "Conectar" }));
    await screen.findByText("Natan-Lucena/side-project");

    await user.type(screen.getByLabelText("Buscar repositório"), "outro-repositorio");

    expect(screen.queryByText("Natan-Lucena/side-project")).not.toBeInTheDocument();
    expect(screen.getByText("minha-org/outro-repositorio")).toBeInTheDocument();
  });

  it("choosing 'vou colar eu mesmo' skips straight to Step 2, without calling install-action", async () => {
    renderWizard();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Personal Access Token"), "ghp_connect_token");
    await user.click(screen.getByRole("button", { name: "Conectar" }));
    await screen.findByText("Natan-Lucena/side-project");
    await user.click(screen.getByRole("button", { name: /Natan-Lucena\/side-project/ }));
    await screen.findByRole("heading", { name: "Como instalar a Action?" });

    // "Vou colar eu mesmo" já vem selecionado por padrão.
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: "Como a Bella vai ser acionada?" });
  });

  it("choosing the automatic install shows a consent notice, then the opened PR link before advancing", async () => {
    renderWizard();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Personal Access Token"), "ghp_connect_token");
    await user.click(screen.getByRole("button", { name: "Conectar" }));
    await screen.findByText("Natan-Lucena/side-project");
    await user.click(screen.getByRole("button", { name: /Natan-Lucena\/side-project/ }));
    await screen.findByRole("heading", { name: "Como instalar a Action?" });

    await user.click(screen.getByRole("radio", { name: /Deixa a Bella abrir o Pull Request/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText(/vai usar o GitHub que você acabou de conectar/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar e abrir PR" }));

    const prLink = await screen.findByRole("link", { name: "Abrir PR no GitHub" });
    expect(prLink).toHaveAttribute("href", "https://github.com/Natan-Lucena/side-project/pull/1");

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByRole("heading", { name: "Como a Bella vai ser acionada?" });
  });

  it("pre-fills Step 4's PAT field with the token connected back in Step 1", async () => {
    renderWizard();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Personal Access Token"), "ghp_reused_token");
    await user.click(screen.getByRole("button", { name: "Conectar" }));
    await screen.findByText("Natan-Lucena/side-project");
    await user.click(screen.getByRole("button", { name: /Natan-Lucena\/side-project/ }));
    await screen.findByRole("heading", { name: "Como instalar a Action?" });
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: "Como a Bella vai ser acionada?" });
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByRole("heading", { name: "Sua chave do Gemini" });
    await user.type(screen.getByLabelText("Chave da API"), "gemini-key-123");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: "Seu Personal Access Token do GitHub" });
    expect(screen.getByLabelText("Personal Access Token")).toHaveValue("ghp_reused_token");
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
    // Volta pro sub-passo padrão (conectar) — a navegação local do Passo 1
    // não é retomada, mas o valor em si sobrevive no reducer, visível de novo
    // ao reabrir o formulário manual.
    await user.click(screen.getByRole("button", { name: "Prefiro digitar o nome manualmente" }));
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
