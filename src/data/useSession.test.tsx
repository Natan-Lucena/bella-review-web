import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SessionProvider } from "./SessionProvider";
import { useSession } from "./useSession";

function Probe() {
  const { isAuthenticated, login, logout } = useSession();
  return (
    <div>
      <span>{isAuthenticated ? "logged-in" : "logged-out"}</span>
      <button onClick={login}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("useSession", () => {
  it("starts unauthenticated and toggles via login/logout", async () => {
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );

    expect(screen.getByText("logged-out")).toBeInTheDocument();

    await act(async () => {
      screen.getByRole("button", { name: "login" }).click();
    });
    expect(screen.getByText("logged-in")).toBeInTheDocument();

    await act(async () => {
      screen.getByRole("button", { name: "logout" }).click();
    });
    expect(screen.getByText("logged-out")).toBeInTheDocument();
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
