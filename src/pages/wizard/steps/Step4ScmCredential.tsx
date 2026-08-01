import { useState } from "react";

import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { PasswordField } from "../../../components/PasswordField";
import { useSetScmCredential } from "../../../data/repos";

type Step4ScmCredentialProps = {
  repoId: string;
  pat: string;
  onPatChange: (value: string) => void;
  onBack: () => void;
  onAdvance: () => void;
};

// Passo 4 — Personal Access Token do GitHub. Também sempre obrigatório: é o
// backend, não a Action, quem publica os comentários no PR — ver PRD 06 e
// frontend-especificacao-telas.md, Tela 5, Passo 4.
export function Step4ScmCredential({
  repoId,
  pat,
  onPatChange,
  onBack,
  onAdvance,
}: Step4ScmCredentialProps) {
  const setScmCredential = useSetScmCredential(repoId);
  const [formError, setFormError] = useState<string | null>(null);
  const valid = pat.trim().length > 0;

  async function handleNext() {
    if (!valid) {
      return;
    }
    setFormError(null);
    try {
      await setScmCredential.mutateAsync(pat.trim());
      onAdvance();
    } catch (error) {
      console.error(`Failed to set SCM credential for repo ${repoId}:`, error);
      setFormError("Não foi possível salvar o token agora. Tente novamente.");
    }
  }

  return (
    <div>
      <PageHeader
        level="h1"
        title="Seu Personal Access Token do GitHub"
        description="Usado pelo backend para publicar os comentários de revisão diretamente no seu Pull Request. Precisa de permissão de leitura e escrita em Pull Requests."
      />

      <div className="mt-8">
        <PasswordField
          label="Personal Access Token"
          htmlFor="wizard-pat"
          placeholder="ghp_..."
          value={pat}
          onChange={onPatChange}
          error={formError ?? undefined}
        />
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-muted">
          É o backend que publica, não a Action — por isso ele é necessário mesmo em quem só usa a
          Action. A Action só envia o diff para análise.
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
        <Button
          variant="primary"
          disabled={!valid}
          loading={setScmCredential.isPending}
          onClick={handleNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
