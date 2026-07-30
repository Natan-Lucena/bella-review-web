import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../../mocks/api-client";
import { SignupPage } from "./SignupPage";

function renderSignup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/signup"]}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<h1>Entrar</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("SignupPage", () => {
  it("keeps the submit button disabled until email/password/confirmation are all valid", async () => {
    renderSignup();
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Criar conta" });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText("Email"), "nova@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha1234");
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText("Confirmar senha"), "senha1234");
    expect(button).toBeEnabled();
  });

  it("redirects to /login with the account-created notice and prefilled email on success", async () => {
    renderSignup();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "nova@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha1234");
    await user.type(screen.getByLabelText("Confirmar senha"), "senha1234");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });

  it("shows an inline error for an already-registered email, without navigating", async () => {
    renderSignup();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha1234");
    await user.type(screen.getByLabelText("Confirmar senha"), "senha1234");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Este email já está cadastrado.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();
  });
});
