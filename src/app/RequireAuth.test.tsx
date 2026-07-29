import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router-dom";

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
    login();
  }, [login]);

  if (!isAuthenticated) {
    return null;
  }

  return <ProtectedRoutes />;
}

describe("RequireAuth", () => {
  it("redirects to /login, preserving the original path + query string", () => {
    render(
      <SessionProvider>
        <MemoryRouter initialEntries={["/repos?tab=runs"]}>
          <ProtectedRoutes />
        </MemoryRouter>
      </SessionProvider>,
    );

    expect(screen.getByText("Login page (redirect=/repos?tab=runs)")).toBeInTheDocument();
  });

  it("renders the protected content once authenticated", () => {
    render(
      <SessionProvider>
        <MemoryRouter initialEntries={["/repos"]}>
          <LoginThenProtectedRoutes />
        </MemoryRouter>
      </SessionProvider>,
    );

    expect(screen.getByText("Repos page")).toBeInTheDocument();
  });
});
