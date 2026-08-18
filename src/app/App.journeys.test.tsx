import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { SessionProvider } from "../data/SessionProvider";
import { resetMockData } from "../mocks/api-client";
import { App } from "./App";

function renderApp(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </SessionProvider>
    </QueryClientProvider>,
  );
}

async function login(user: ReturnType<typeof userEvent.setup>, email: string, password: string) {
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Senha"), password);
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

beforeEach(() => {
  resetMockData();
});

// Jornadas ponta a ponta, atravessando várias telas via <App /> de verdade —
// diferente dos testes por-tela (isolados numa única rota) e do restante de
// App.test.tsx (que autentica via useSession().login() como atalho), aqui o
// caminho inteiro é exercitado clique a clique: formulário de cadastro/login
// de verdade, navegação real entre abas, o wizard completo. Ver PRD 06/09,
// critérios de aceite que pedem exatamente esse tipo de fluxo encadeado.
describe("App journeys", () => {
  it("onboarding completo: cadastro -> login -> repos -> wizard -> painel do repo novo", async () => {
    const user = userEvent.setup();
    renderApp("/signup");

    await user.type(screen.getByLabelText("Email"), "nova@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha12345");
    await user.type(screen.getByLabelText("Confirmar senha"), "senha12345");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    // Volta pra Login com o aviso e o email já pré-preenchido.
    await screen.findByRole("heading", { name: "Entrar" });
    expect(screen.getByText("Conta criada — faça login para continuar.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("nova@example.com");

    await user.type(screen.getByLabelText("Senha"), "senha12345");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    // A Fase 1 (mock) não isola repositórios por dono — qualquer usuário
    // autenticado vê os mesmos repositórios seed (ver PRD 02).
    await screen.findByRole("heading", { name: "Meus repositórios" });
    await screen.findByText("Natan-Lucena/bella-reviewer-api");
    await user.click(screen.getByRole("link", { name: "Adicionar repositório" }));

    // Wizard completo (método Action) até o final — passo 1 pelo escape hatch
    // manual (o fluxo de conexão com o GitHub em si já é coberto em
    // WizardPage.test.tsx).
    await screen.findByRole("heading", { name: "Qual repositório a Bella vai revisar?" });
    await user.click(screen.getByRole("button", { name: "Prefiro digitar o nome manualmente" }));
    await user.type(screen.getByLabelText("Nome do repositório"), "nova-org/repo-novo");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: "Como a Bella vai ser acionada?" });
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: "Escolha o provedor de LLM" });
    await user.type(screen.getByLabelText("Chave da API do Gemini"), "gemini-key-nova");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: "Seu Personal Access Token do GitHub" });
    await user.type(screen.getByLabelText("Personal Access Token"), "ghp_nova123");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: "Gere o token da Action" });
    await user.click(screen.getByRole("button", { name: "Gerar token" }));
    await screen.findByText("Seu token");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByRole("heading", { name: "nova-org/repo-novo está pronto" });
    await user.click(screen.getByRole("checkbox", { name: /Já copiei e configurei/ }));
    await user.click(screen.getByRole("button", { name: "Ir para o painel" }));

    // Chega no Painel do repositório recém-criado (breadcrumb + aba ativa certos).
    expect(await screen.findByText("nova-org/repo-novo")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Painel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Painel" })).toHaveAttribute("aria-current", "page");
    // Jornada com muitos passos reais (cadastro + login + os 6 passos do
    // wizard, cada um com o delay artificial do mock) — acima do timeout
    // padrão de 5s por teste.
  }, 15000);

  it("sessão expirada preserva o destino: rota profunda -> login -> volta exatamente pra lá", async () => {
    const user = userEvent.setup();
    renderApp("/repos/repo-bella-api/settings");

    // RequireAuth redireciona pra /login?redirect=... sem sessão nenhuma.
    await screen.findByRole("heading", { name: "Entrar" });

    await login(user, "ana@example.com", "senha1234");

    // Volta exatamente pra Configurações do repositório, não pra /repos genérico.
    expect(await screen.findByRole("heading", { name: "Configurações" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configurações" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("navega pelas 4 abas de um repositório já configurado sem perder o contexto", async () => {
    const user = userEvent.setup();
    renderApp("/login");

    await login(user, "ana@example.com", "senha1234");
    await screen.findByRole("heading", { name: "Meus repositórios" });
    await user.click(await screen.findByText("Natan-Lucena/bella-reviewer-api"));

    // Painel (rota índice).
    await screen.findByRole("heading", { name: "Painel" });

    // Execuções -> abre o detalhe de uma execução -> volta pra lista.
    await user.click(screen.getByRole("link", { name: "Execuções" }));
    await screen.findByRole("heading", { name: "Execuções" });
    const table = await screen.findByRole("table");
    await user.click(within(table).getAllByRole("button")[0]);
    await screen.findByText("Turnos");
    await user.click(screen.getByRole("link", { name: "‹ Voltar para execuções" }));
    await screen.findByRole("heading", { name: "Execuções" });

    // Comentários -> filtra por severidade (refaz a busca).
    await user.click(screen.getByRole("link", { name: "Comentários" }));
    await screen.findByRole("heading", { name: "Comentários" });
    await user.selectOptions(screen.getByLabelText("Filtrar por severidade"), "critical");
    await screen.findByText(/^\d+ comentários?$/);

    // Configurações.
    await user.click(screen.getByRole("link", { name: "Configurações" }));
    expect(await screen.findByRole("heading", { name: "Configurações" })).toBeInTheDocument();

    // Volta pro Painel clicando na própria aba.
    await user.click(screen.getByRole("link", { name: "Painel" }));
    expect(await screen.findByRole("heading", { name: "Painel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Painel" })).toHaveAttribute("aria-current", "page");
  });

  it("rotaciona o token da Action (confirmação em 2 passos) e edita parâmetros de review, sem sair do fluxo real da tela", async () => {
    const user = userEvent.setup();
    renderApp("/login");

    await login(user, "ana@example.com", "senha1234");
    await screen.findByRole("heading", { name: "Meus repositórios" });
    await user.click(await screen.findByText("Natan-Lucena/bella-reviewer-api"));
    await screen.findByRole("heading", { name: "Painel" });

    await user.click(screen.getByRole("link", { name: "Configurações" }));
    await screen.findByRole("heading", { name: "Configurações" });

    // Rotação destrutiva: primeiro clique só arma a confirmação, não gera
    // nada ainda — o segundo clique ("Confirmar rotação") é que executa.
    const generateButton = screen.getByRole("button", { name: "Gerar novo token" });
    await user.click(generateButton);
    expect(screen.getByText(/invalida o anterior imediatamente/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar rotação" }));

    // O novo token só aparece uma vez, no modal — precisa marcar o checkbox
    // pra poder fechar (SecretRevealModal, ver 00-component-library.md).
    await screen.findByRole("heading", { name: "Token da Action gerado" });
    const closeButton = screen.getByRole("button", { name: "Fechar" });
    expect(closeButton).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "Já copiei/configurei" }));
    await user.click(closeButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Parâmetros de review — Accordion começa fechado, precisa abrir.
    await user.click(screen.getByRole("button", { name: "Parâmetros de review" }));
    const temperatureSlider = await screen.findByLabelText(/Temperatura/);
    fireEvent.change(temperatureSlider, { target: { value: "1.2" } });
    await user.click(screen.getByRole("button", { name: "Salvar parâmetros" }));
    expect(await screen.findByText("Parâmetros salvos.")).toBeInTheDocument();

    // O resto da tela continua íntegro depois das duas mutations — navegar
    // pra outra aba e voltar não perde o contexto do repositório.
    await user.click(screen.getByRole("link", { name: "Painel" }));
    expect(await screen.findByRole("heading", { name: "Painel" })).toBeInTheDocument();
    expect(screen.getByText("Natan-Lucena/bella-reviewer-api")).toBeInTheDocument();
  });

  it("cadastro com email já existente mostra erro inline e permite corrigir e logar com uma conta existente", async () => {
    const user = userEvent.setup();
    renderApp("/signup");

    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "outrasenha1");
    await user.type(screen.getByLabelText("Confirmar senha"), "outrasenha1");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    // Erro inline, sem navegar pra Login.
    expect(await screen.findByText("Este email já está cadastrado.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Entrar" })).not.toBeInTheDocument();

    // O link de erro leva pra Login de verdade, onde a conta já existente
    // funciona (há dois links "Entrar" na tela — o do erro e o do rodapé —,
    // qualquer um leva pro mesmo lugar).
    await user.click(screen.getAllByRole("link", { name: "Entrar" })[0]);
    await screen.findByRole("heading", { name: "Entrar" });
    await login(user, "ana@example.com", "senha1234");

    expect(await screen.findByRole("heading", { name: "Meus repositórios" })).toBeInTheDocument();
  });
});
