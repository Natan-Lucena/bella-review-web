import { useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "../../components/Logo";
import { StepProgress } from "../../components/StepProgress";
import { LLM_PROVIDER_CATALOG } from "../../lib/llm-provider-catalog";
import { Step1RepoSelection } from "./steps/Step1RepoSelection";
import { Step2Method } from "./steps/Step2Method";
import { Step3LlmCredential } from "./steps/Step3LlmCredential";
import { Step4ScmCredential } from "./steps/Step4ScmCredential";
import { Step5GenerateSecret } from "./steps/Step5GenerateSecret";
import { Step6Success } from "./steps/Step6Success";
import { initialWizardState, wizardReducer } from "./wizardReducer";
import type { WizardStep } from "./wizardReducer";

// Passo 6 (sucesso) não tem entrada aqui de propósito: StepProgress some
// nesse passo (ver `state.step < 6` abaixo), então ele nunca precisa de um
// nome — não é uma omissão, é o passo terminal, fora da contagem "Passo X de 5".
// Passo 3 não entra aqui — depende do provedor escolhido (LLM_PROVIDER_CATALOG),
// calculado junto de `stepName` abaixo.
const STEP_NAMES: Record<Exclude<WizardStep, 3 | 6>, string> = {
  1: "Repositório",
  2: "Integração",
  4: "GitHub",
  5: "Token da Action",
};

// Tela 5 — Wizard de Configuração do Repositório (frontend-especificacao-telas.md).
// Rota "/repos/new", tela cheia fora do AppLayout (ver PRD 06, "Apresentação e
// navegação do wizard"). Fechar/navegar pra fora a qualquer momento é seguro —
// só o que já foi de fato salvo via mutation persiste; reabrir sempre começa
// do zero (não tenta retomar), retomar de verdade acontece pela Tela 6
// (Configurações), nunca reabrindo o wizard no meio.
export function WizardPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);

  const method = state.method ?? "action";
  const stepName =
    state.step === 5
      ? method === "action"
        ? "Token da Action"
        : "Segredo do webhook"
      : state.step === 3
        ? LLM_PROVIDER_CATALOG[state.provider].name
        : STEP_NAMES[state.step as Exclude<WizardStep, 3 | 6>];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-surface-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-5 px-8 py-4.5">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-[15px] font-medium text-ink">Novo repositório</span>
          </div>
          <Link to="/repos" className="text-sm text-ink-muted hover:text-ink">
            Fechar
          </Link>
        </div>
      </div>

      {state.step < 6 && (
        <div className="mx-auto w-full max-w-2xl px-8 pt-8">
          <StepProgress step={state.step} total={5} stepName={stepName} />
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl flex-1 px-8 py-11">
        {state.step === 1 && (
          <Step1RepoSelection
            fullName={state.fullName}
            onFullNameChange={(value) => dispatch({ type: "SET_FIELD", field: "fullName", value })}
            pat={state.pat}
            onPatChange={(value) => dispatch({ type: "SET_FIELD", field: "pat", value })}
            onRepoCreated={(repoId) => dispatch({ type: "SET_REPO_ID", repoId })}
            onAdvance={() => dispatch({ type: "ADVANCE" })}
          />
        )}

        {state.step === 2 && (
          <Step2Method
            method={method}
            onMethodChange={(next) => dispatch({ type: "SET_METHOD", method: next })}
            onBack={() => dispatch({ type: "BACK" })}
            onNext={() => dispatch({ type: "ADVANCE" })}
          />
        )}

        {state.step === 3 && state.repoId && (
          <Step3LlmCredential
            repoId={state.repoId}
            provider={state.provider}
            onProviderChange={(provider) => dispatch({ type: "SET_PROVIDER", provider })}
            apiKey={state.apiKey}
            onApiKeyChange={(value) => dispatch({ type: "SET_FIELD", field: "apiKey", value })}
            onBack={() => dispatch({ type: "BACK" })}
            onAdvance={() => dispatch({ type: "ADVANCE" })}
          />
        )}

        {state.step === 4 && state.repoId && (
          <Step4ScmCredential
            repoId={state.repoId}
            pat={state.pat}
            onPatChange={(value) => dispatch({ type: "SET_FIELD", field: "pat", value })}
            onBack={() => dispatch({ type: "BACK" })}
            onAdvance={() => dispatch({ type: "ADVANCE" })}
          />
        )}

        {state.step === 5 && state.repoId && (
          <Step5GenerateSecret
            repoId={state.repoId}
            fullName={state.fullName}
            method={method}
            revealedSecret={state.revealedSecret}
            onReveal={(secret) => dispatch({ type: "REVEAL_SECRET", secret })}
            onBack={() => dispatch({ type: "BACK" })}
            onAdvance={() => dispatch({ type: "ADVANCE" })}
          />
        )}

        {state.step === 6 && state.repoId && state.revealedSecret && (
          <Step6Success
            fullName={state.fullName}
            revealedSecret={state.revealedSecret}
            ack={state.ack}
            onAckChange={(ack) => dispatch({ type: "SET_ACK", ack })}
            onFinish={() => navigate(`/repos/${state.repoId}`)}
          />
        )}
      </div>
    </div>
  );
}
