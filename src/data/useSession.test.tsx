import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetMockData } from "../mocks/api-client";
import { SessionProvider } from "./SessionProvider";
import { useSession } from "./useSession";

const TEST_USER = { id: "test-user", email: "test@example.com" };

function Probe() {
  const { isAuthenticated, login, logout } = useSession();
  return (
    <div>
      <span>{isAuthenticated ? "logged-in" : "logged-out"}</span>
      <button onClick={() => login(TEST_USER)}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderProbe() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Probe />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

describe("useSession", () => {
  it("starts unauthenticated and toggles via login/logout", async () => {
    renderProbe();
    const user = userEvent.setup();

    expect(await screen.findByText("logged-out")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "login" }));
    expect(await screen.findByText("logged-in")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "logout" }));
    expect(await screen.findByText("logged-out")).toBeInTheDocument();
  });

  it("throws when used outside a SessionProvider", () => {
    function BadProbe() {
      useSession();
      return null;
    }
    // Suppress the expected React error boundary console noise for this case.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<BadProbe />)).toThrow("useSession must be used within a SessionProvider");
    spy.mockRestore();
  });
});
