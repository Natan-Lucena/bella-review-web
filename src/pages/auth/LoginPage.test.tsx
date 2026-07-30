import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { SessionProvider } from "../../data/SessionProvider";
import { useSession } from "../../data/useSession";
import { LoginPage } from "./LoginPage";

function AuthenticatedProbe() {
  const { isAuthenticated } = useSession();
  return <span data-testid="auth-state">{isAuthenticated ? "authenticated" : "guest"}</span>;
}

function renderLogin(initialPath = "/login") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <AuthenticatedProbe />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/repos" element={<h1>Meus repositórios</h1>} />
            <Route path="/wizard" element={<h1>Wizard destino</h1>} />
          </Routes>
        </MemoryRouter>
      </SessionProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("LoginPage", () => {
  it("shows the account-created notice and prefills the email from the query string", () => {
    renderLogin("/login?notice=account-created&email=ana%40example.com");
    expect(screen.getByText("Conta criada — faça login para continuar.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("ana@example.com");
  });

  it("authenticates and navigates to /repos on valid credentials", async () => {
    renderLogin();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha1234");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("heading", { name: "Meus repositórios" })).toBeInTheDocument();
    expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated");
  });

  it("navigates to the redirect target instead of /repos when present", async () => {
    renderLogin("/login?redirect=%2Fwizard");
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha1234");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("heading", { name: "Wizard destino" })).toBeInTheDocument();
  });

  it("shows a single generic error for wrong credentials, never distinguishing the reason", async () => {
    renderLogin();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha-errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Email ou senha incorretos.")).toBeInTheDocument();
  });

  it("never renders a 'forgot password' link", () => {
    renderLogin();
    expect(screen.queryByText(/esqueci minha senha/i)).not.toBeInTheDocument();
  });
});
