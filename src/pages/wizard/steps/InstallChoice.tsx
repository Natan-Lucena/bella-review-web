import { useState } from "react";

import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { SelectableCard } from "../../../components/SelectableCard";
import { useInstallAction } from "../../../data/repos";
import { ApiError } from "../../../lib/api-error";

type InstallChoiceProps = {
  fullName: string;
  repoId: string;
  pat: string;
  onSkip: () => void;
  onInstalled: () => void;
};

type Choice = "manual" | "auto";

// Sub-passo 1c (PRD 11) — bifurcação entre colar o YAML manualmente (segue
// pro Passo 2 normal, sem chamar nada) e deixar a plataforma abrir o PR
// automático. A chamada de instalação só dispara depois de uma confirmação
// explícita separada da simples seleção do card — texto de consentimento
// visível antes de qualquer requisição de verdade.
export function InstallChoice({ fullName, repoId, pat, onSkip, onInstalled }: InstallChoiceProps) {
  const [choice, setChoice] = useState<Choice>("manual");
  const [confirming, setConfirming] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const installAction = useInstallAction(repoId);

  function handleContinue() {
    if (choice === "manual") {
      onSkip();
      return;
    }
    setConfirming(true);
  }

  async function handleConfirmInstall() {
    setError(null);
    try {
      const result = await installAction.mutateAsync(pat);
      setPrUrl(result.prUrl);
    } catch (err) {
      console.error(`Failed to install the Action on ${fullName}:`, err);
      if (err instanceof ApiError && err.code === "github_insufficient_scope") {
        setError(
          "O token conectado não tem permissão para criar o workflow. Gere um novo token " +
            'com o escopo "workflow" habilitado e cole-o de novo no passo anterior.',
        );
        return;
      }
      setError("Não foi possível abrir o Pull Request agora. Tente de novo ou siga manualmente.");
    }
  }

  if (prUrl) {
    return (
      <div>
        <PageHeader
          level="h1"
          title="Pull Request aberto"
          description={`Um PR foi aberto em ${fullName} com o workflow da Action.`}
        />
        <a
          href={prUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-[14px] text-accent hover:underline"
        >
          Abrir PR no GitHub
        </a>
        <div className="mt-8 flex gap-3">
          <Button variant="primary" onClick={onInstalled}>
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        level="h1"
        title="Como instalar a Action?"
        description={`Repositório: ${fullName}`}
      />

      <div
        role="radiogroup"
        aria-label="Como instalar a Action"
        className="mt-8 flex flex-col gap-3"
      >
        <SelectableCard
          selected={choice === "manual"}
          onSelect={() => {
            setChoice("manual");
            setConfirming(false);
          }}
          title="Vou colar o YAML eu mesmo"
          description="Você recebe o trecho pra colar no workflow no próximo passo, do jeito de sempre."
        />
        <SelectableCard
          selected={choice === "auto"}
          onSelect={() => setChoice("auto")}
          title="Deixa a Bella abrir o Pull Request"
          description="Cria uma branch e abre um PR com o workflow já pronto, usando o token que você acabou de conectar."
        />
      </div>

      {choice === "auto" && confirming && (
        <p className="mt-4 text-[13.5px] leading-relaxed text-severity-medium">
          Isso vai usar o GitHub que você acabou de conectar pra criar uma branch e abrir um Pull
          Request em {fullName}, com o arquivo do workflow já pronto.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[13.5px] text-severity-critical">
          {error}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        {!confirming && (
          <Button variant="primary" onClick={handleContinue}>
            Continuar
          </Button>
        )}
        {confirming && (
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              loading={installAction.isPending}
              onClick={handleConfirmInstall}
            >
              Confirmar e abrir PR
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
