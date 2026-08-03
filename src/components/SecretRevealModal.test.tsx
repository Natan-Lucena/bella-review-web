import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SecretRevealModal } from "./SecretRevealModal";

describe("SecretRevealModal", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it("renders nothing when closed", () => {
    render(<SecretRevealModal open={false} kind="action_token" value="tok" onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a single value block for action_token", () => {
    render(<SecretRevealModal open kind="action_token" value="bella_at_123" onClose={vi.fn()} />);
    expect(screen.getByText("bella_at_123")).toBeInTheDocument();
    expect(screen.queryByText("URL do webhook")).not.toBeInTheDocument();
  });

  it("shows two value blocks for webhook_secret", () => {
    render(
      <SecretRevealModal
        open
        kind="webhook_secret"
        value="whsec_123"
        webhookUrl="https://bella-reviewer-api.vercel.app/webhooks/github"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("whsec_123")).toBeInTheDocument();
    expect(
      screen.getByText("https://bella-reviewer-api.vercel.app/webhooks/github"),
    ).toBeInTheDocument();
  });

  it("keeps Close disabled until the confirmation checkbox is checked", async () => {
    const onClose = vi.fn();
    render(<SecretRevealModal open kind="action_token" value="tok" onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: "Fechar" });
    expect(closeButton).toBeDisabled();

    await userEvent.click(screen.getByRole("checkbox", { name: "Já copiei/configurei" }));
    expect(closeButton).toBeEnabled();

    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on Escape", async () => {
    const onClose = vi.fn();
    render(<SecretRevealModal open kind="action_token" value="tok" onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not close on a click outside the dialog (the overlay has no click handler)", async () => {
    const onClose = vi.fn();
    render(<SecretRevealModal open kind="action_token" value="tok" onClose={onClose} />);
    const overlay = screen.getByRole("dialog").parentElement!;
    await userEvent.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });
});
