import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import * as apiClient from "../mocks/api-client";
import { SessionProvider } from "../data/SessionProvider";
import { useSession } from "../data/useSession";
import { App } from "./App";

function renderAt(path: string) {
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

// Logs in first, and only mounts the router (with <App />) once
// `isAuthenticated` is already true — mounting the router before that would
// let RequireAuth's very first render see `isAuthenticated: false` and
// redirect to /login before the login() effect below ever gets a chance to
// run, since effects fire after the render they were scheduled in.
function LoginThenMountApp({ path }: { path: string }) {
  const { login, isAuthenticated } = useSession();
  useEffect(() => {
    login();
  }, [login]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

function renderAuthenticatedAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <LoginThenMountApp path={path} />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App routing", () => {
  it("renders the landing page at /", () => {
    renderAt("/");
    expect(
      screen.getByRole("heading", { level: 1, name: /Revisão de código por IA que entra/ }),
    ).toBeInTheDocument();
  });

  it("renders signup and login pages", () => {
    renderAt("/signup");
    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();

    renderAt("/login");
    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });

  it("navigates for real from the landing page's CTAs (URL changes, not just a visual swap)", async () => {
    renderAt("/");

    await userEvent.click(screen.getAllByRole("link", { name: "Criar conta" })[0]);
    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();
  });

  it("navigates to the login page from the landing page's secondary CTA", async () => {
    renderAt("/");

    await userEvent.click(screen.getAllByRole("link", { name: "Já tenho conta" })[0]);
    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });

  it("redirects unauthenticated access to /repos to the login page", () => {
    renderAt("/repos");
    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });

  it("renders the app shell (header + link) for an authenticated /repos", () => {
    renderAuthenticatedAt("/repos");
    expect(screen.getByRole("link", { name: "Meus repositórios" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Meus repositórios" })).toBeInTheDocument();
  });

  it("renders the repo area (breadcrumb + tabs) and the dashboard on the index route", async () => {
    renderAuthenticatedAt("/repos/repo-bella-api");
    expect(await screen.findByText("Natan-Lucena/bella-reviewer-api")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Painel" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: "Painel" })).toBeInTheDocument();
  });

  it("renders the runs page under the repo area, with the Runs tab active", async () => {
    renderAuthenticatedAt("/repos/repo-bella-api/runs");
    expect(await screen.findByRole("heading", { name: "Execuções" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Execuções" })).toHaveAttribute("aria-current", "page");
  });

  it("redirects an unknown repo id (repo_not_found) to Meus Repositórios", async () => {
    renderAuthenticatedAt("/repos/does-not-exist");
    expect(await screen.findByRole("heading", { name: "Meus repositórios" })).toBeInTheDocument();
  });

  it("shows a retryable error instead of redirecting when the repo fetch itself fails", async () => {
    vi.spyOn(apiClient, "listRepos").mockRejectedValueOnce(new Error("network error"));
    renderAuthenticatedAt("/repos/repo-bella-api");

    expect(
      await screen.findByText("Não foi possível carregar este repositório"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Meus repositórios" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Natan-Lucena/bella-reviewer-api")).toBeInTheDocument();
  });

  it("renders the wizard full-screen, without the AppLayout header", () => {
    renderAuthenticatedAt("/repos/new");
    expect(
      screen.getByRole("heading", { name: "Qual repositório a Bella vai revisar?" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Meus repositórios" })).not.toBeInTheDocument();
  });

  it("redirects unauthenticated access to /repos/new to the login page", () => {
    renderAt("/repos/new");
    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });

  it("renders the not-found page for an unknown route", () => {
    renderAt("/this-route-does-not-exist");
    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
  });
});
