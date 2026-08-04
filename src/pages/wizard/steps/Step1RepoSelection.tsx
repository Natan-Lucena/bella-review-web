import { useState } from "react";

import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { PasswordField } from "../../../components/PasswordField";
import { useCreateRepo, useListGithubRepos } from "../../../data/repos";
import { GITHUB_TOKEN_URL } from "../../../lib/github-url";
import type { GithubRepoOption } from "../../../types/github";
import { GithubRepoPicker } from "./GithubRepoPicker";
import { InstallChoice } from "./InstallChoice";
import { Step1Name } from "./Step1Name";

type Step1RepoSelectionProps = {
  fullName: string;
  onFullNameChange: (value: string) => void;
  pat: string;
  onPatChange: (value: string) => void;
  onRepoCreated: (repoId: string) => void;
  onAdvance: () => void;
};

type View =
  | { kind: "connect" }
  | { kind: "manual" }
  | { kind: "picker"; repos: GithubRepoOption[] }
  | { kind: "choice"; repoId: string; selectedFullName: string };

// Passo 1 redesenhado (Fase 2, PRD 11) — substitui o campo de texto livre por
// conectar ao GitHub -> escolher da lista -> manual ou instalação automática
// da Action. `pat` é o mesmo campo do reducer que o Passo 4 usa (ver
// WizardPage) — reaproveitado de propósito, não duplicado num `githubPat`
// à parte, pra que o Passo 4 já nasça pré-preenchido sem esforço extra. O
// link "Prefiro digitar o nome manualmente" cai direto no Step1Name
// original, sem nenhuma mudança nele — mesmo comportamento de antes da
// Fase 2 pra quem não quer colar um token aqui.
export function Step1RepoSelection({
  fullName,
  onFullNameChange,
  pat,
  onPatChange,
  onRepoCreated,
  onAdvance,
}: Step1RepoSelectionProps) {
  const [view, setView] = useState<View>({ kind: "connect" });
  const [connectError, setConnectError] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const listGithubRepos = useListGithubRepos();
  const createRepo = useCreateRepo();

  async function handleConnect() {
    if (!pat.trim()) {
      return;
    }
    setConnectError(null);
    try {
      const { repos } = await listGithubRepos.mutateAsync(pat.trim());
      setView({ kind: "picker", repos });
    } catch (error) {
      console.error("Failed to list GitHub repos:", error);
      setConnectError("Não foi possível conectar. Confira o token e tente de novo.");
    }
  }

  async function handleSelectRepo(repo: GithubRepoOption) {
    setPickerError(null);
    try {
      const created = await createRepo.mutateAsync(repo.fullName);
      onFullNameChange(repo.fullName);
      onRepoCreated(created.id);
      setView({ kind: "choice", repoId: created.id, selectedFullName: repo.fullName });
    } catch (error) {
      console.error(`Failed to create repository ${repo.fullName}:`, error);
      setPickerError("Não foi possível cadastrar esse repositório agora. Tente de novo.");
    }
  }

  if (view.kind === "manual") {
    return (
      <Step1Name
        fullName={fullName}
        onFullNameChange={onFullNameChange}
        onAdvance={(repoId) => {
          onRepoCreated(repoId);
          onAdvance();
        }}
      />
    );
  }

  if (view.kind === "picker") {
    return (
      <GithubRepoPicker
        repos={view.repos}
        isCreating={createRepo.isPending}
        error={pickerError}
        onSelect={handleSelectRepo}
        onBack={() => setView({ kind: "connect" })}
      />
    );
  }

  if (view.kind === "choice") {
    return (
      <InstallChoice
        fullName={view.selectedFullName}
        repoId={view.repoId}
        pat={pat}
        onSkip={onAdvance}
        onInstalled={onAdvance}
      />
    );
  }

  return (
    <div>
      <PageHeader
        level="h1"
        title="Qual repositório a Bella vai revisar?"
        description="Conecte com um token do GitHub pra escolher da sua lista de repositórios."
      />

      <div className="mt-8">
        <PasswordField
          label="Personal Access Token"
          htmlFor="wizard-connect-pat"
          placeholder="ghp_..."
          value={pat}
          onChange={onPatChange}
          error={connectError ?? undefined}
        />
        <a
          href={GITHUB_TOKEN_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 inline-block text-[13px] text-accent hover:underline"
        >
          Gerar token no GitHub
        </a>
      </div>

      <div className="mt-8 flex gap-3">
        <Button
          variant="primary"
          disabled={!pat.trim()}
          loading={listGithubRepos.isPending}
          onClick={handleConnect}
        >
          Conectar
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setView({ kind: "manual" })}
        className="mt-4 text-[13px] text-ink-muted hover:text-ink hover:underline"
      >
        Prefiro digitar o nome manualmente
      </button>
    </div>
  );
}
