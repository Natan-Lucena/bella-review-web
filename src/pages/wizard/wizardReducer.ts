export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export type IntegrationMethod = "action" | "webhook";

export type RevealedSecret =
  | { kind: "action_token"; value: string }
  | { kind: "webhook_secret"; value: string; webhookUrl: string };

export type WizardState = {
  step: WizardStep;
  method: IntegrationMethod | null;
  repoId: string | null;
  fullName: string;
  apiKey: string;
  pat: string;
  revealedSecret: RevealedSecret | null;
  ack: boolean;
};

export const initialWizardState: WizardState = {
  step: 1,
  method: null,
  repoId: null,
  fullName: "",
  apiKey: "",
  pat: "",
  revealedSecret: null,
  ack: false,
};

export type WizardAction =
  | { type: "ADVANCE" }
  | { type: "BACK" }
  | { type: "SET_METHOD"; method: IntegrationMethod }
  | { type: "SET_FIELD"; field: "fullName" | "apiKey" | "pat"; value: string }
  | { type: "SET_REPO_ID"; repoId: string }
  | { type: "REVEAL_SECRET"; secret: RevealedSecret }
  | { type: "SET_ACK"; ack: boolean };

// Máquina de estado do wizard (6 passos) — ver PRD 06, "Máquina de estado
// (useReducer)". `step` nunca sai de [1,6], mesmo com ADVANCE/BACK repetidos.
// BACK nunca limpa nenhum campo (nem `repoId`/`method`) — voltar é só
// navegação, o que já foi de fato salvo na API continua salvo.
export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "ADVANCE":
      return { ...state, step: Math.min(6, state.step + 1) as WizardStep };
    case "BACK":
      return { ...state, step: Math.max(1, state.step - 1) as WizardStep };
    case "SET_METHOD":
      return { ...state, method: action.method };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_REPO_ID":
      return { ...state, repoId: action.repoId };
    case "REVEAL_SECRET":
      return { ...state, revealedSecret: action.secret };
    case "SET_ACK":
      return { ...state, ack: action.ack };
    default:
      return state;
  }
}
