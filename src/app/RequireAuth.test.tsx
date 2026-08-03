import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router-dom";

import { resetMockData } from "../mocks/api-client";
import { SessionProvider } from "../data/SessionProvider";
import { useSession } from "../data/useSession";
import { RequireAuth } from "./RequireAuth";

function LoginProbe() {
  const [params] = useSearchParams();
  return <div>Login page (redirect={params.get("redirect")})</div>;
}

function ProtectedRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginProbe />} />
      <Route
        path="/repos"
        element={
          <RequireAuth>
            <div>Repos page</div>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

// Logs in first, and only mounts the routes once `isAuthenticated` is
// already true — mounting them before that would let RequireAuth's very
// first render see `isAuthenticated: false` and redirect to /login before
// the login() effect below ever runs (effects fire after the render they
// were scheduled in, so the redirect would already have happened).
function LoginThenProtectedRoutes() {
  const { login, isAuthenticated } = useSession();
  useEffect(() => {
    login({ id: "test-user", email: "test@example.com" });
  }, [login]);

  if (!isAuthenticated) {
    return null;
  }

  return <ProtectedRoutes />;
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{ui}</SessionProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("RequireAuth", () => {
  it("redirects to /login, preserving the original path + query string", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/repos?tab=runs"]}>
        <ProtectedRoutes />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Login page (redirect=/repos?tab=runs)"),
    ).toBeInTheDocument();
  });

  it("renders the protected content once authenticated", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/repos"]}>
        <LoginThenProtectedRoutes />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Repos page")).toBeInTheDocument();
  });
});
