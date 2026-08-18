import { describe, expect, it } from "vitest";

import { initialWizardState, wizardReducer } from "./wizardReducer";
import type { WizardState } from "./wizardReducer";

describe("wizardReducer", () => {
  it("advances step by one, clamped at 6", () => {
    let state: WizardState = { ...initialWizardState, step: 5 };
    state = wizardReducer(state, { type: "ADVANCE" });
    expect(state.step).toBe(6);
    state = wizardReducer(state, { type: "ADVANCE" });
    expect(state.step).toBe(6);
  });

  it("goes back one step, clamped at 1", () => {
    let state: WizardState = { ...initialWizardState, step: 1 };
    state = wizardReducer(state, { type: "BACK" });
    expect(state.step).toBe(1);

    state = { ...initialWizardState, step: 3 };
    state = wizardReducer(state, { type: "BACK" });
    expect(state.step).toBe(2);
  });

  it("BACK never clears repoId, method or field values already set", () => {
    const state: WizardState = {
      ...initialWizardState,
      step: 4,
      repoId: "repo-1",
      method: "action",
      fullName: "org/repo",
      apiKey: "key",
    };
    const next = wizardReducer(state, { type: "BACK" });
    expect(next).toMatchObject({
      step: 3,
      repoId: "repo-1",
      method: "action",
      fullName: "org/repo",
      apiKey: "key",
    });
  });

  it("sets the integration method", () => {
    const state = wizardReducer(initialWizardState, { type: "SET_METHOD", method: "webhook" });
    expect(state.method).toBe("webhook");
  });

  it("sets an individual field by name", () => {
    let state = wizardReducer(initialWizardState, {
      type: "SET_FIELD",
      field: "fullName",
      value: "org/repo",
    });
    expect(state.fullName).toBe("org/repo");

    state = wizardReducer(state, { type: "SET_FIELD", field: "apiKey", value: "abc" });
    expect(state.apiKey).toBe("abc");
    expect(state.fullName).toBe("org/repo");
  });

  it("defaults the provider to gemini and lets it be changed", () => {
    expect(initialWizardState.provider).toBe("gemini");
    const state = wizardReducer(initialWizardState, { type: "SET_PROVIDER", provider: "claude" });
    expect(state.provider).toBe("claude");
  });

  it("stores the repoId once the repo is created", () => {
    const state = wizardReducer(initialWizardState, { type: "SET_REPO_ID", repoId: "repo-9" });
    expect(state.repoId).toBe("repo-9");
  });

  it("stores the revealed secret", () => {
    const state = wizardReducer(initialWizardState, {
      type: "REVEAL_SECRET",
      secret: { kind: "action_token", value: "bella_at_1" },
    });
    expect(state.revealedSecret).toEqual({ kind: "action_token", value: "bella_at_1" });
  });

  it("toggles the confirmation checkbox", () => {
    let state = wizardReducer(initialWizardState, { type: "SET_ACK", ack: true });
    expect(state.ack).toBe(true);
    state = wizardReducer(state, { type: "SET_ACK", ack: false });
    expect(state.ack).toBe(false);
  });
});
