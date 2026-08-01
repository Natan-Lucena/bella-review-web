import { useState } from "react";

import { Button } from "../../../components/Button";
import { FormField } from "../../../components/FormField";
import { PageHeader } from "../../../components/PageHeader";
import { useCreateRepo } from "../../../data/repos";
import { isValidRepoFullName } from "../../../lib/repo-full-name";

type Step1NameProps = {
  fullName: string;
  onFullNameChange: (value: string) => void;
  onAdvance: (repoId: string) => void;
};

// Passo 1 — Nome do repositório. Validação de formato é só local (regex) —
// não simulamos um `validation_error` de backend aqui: a espec
// (frontend-especificacao-telas.md, Tela 5, Passo 1) documenta que
// `CreateRepoError` é literalmente `never` no backend real, o cadastro sempre
// funciona se o formato bater, e o botão "Continuar" já fica desabilitado até
// bater — não existe caminho pelo qual o mock receberia um formato inválido.
export function Step1Name({ fullName, onFullNameChange, onAdvance }: Step1NameProps) {
  const createRepo = useCreateRepo();
  const [formError, setFormError] = useState<string | null>(null);
  const valid = isValidRepoFullName(fullName);
  const touched = fullName.length > 0;

  async function handleNext() {
    if (!valid) {
      return;
    }
    setFormError(null);
    try {
      const repo = await createRepo.mutateAsync(fullName.trim());
      onAdvance(repo.id);
    } catch {
      setFormError("Não foi possível cadastrar o repositório agora. Tente novamente.");
    }
  }

  return (
    <div>
      <PageHeader
        level="h1"
        title="Qual repositório a Bella vai revisar?"
        description="Use o nome completo, no formato organização/repositório."
      />

      <div className="mt-8">
        <FormField
          label="Nome do repositório"
          htmlFor="wizard-full-name"
          error={
            touched && !valid
              ? "Use o formato organização/repositório, com uma única barra e sem espaços."
              : (formError ?? undefined)
          }
        >
          <input
            id="wizard-full-name"
            value={fullName}
            onChange={(event) => onFullNameChange(event.target.value)}
            placeholder="ex: minha-org/meu-repositorio"
            aria-invalid={touched && !valid ? true : undefined}
            aria-describedby={touched && !valid ? "wizard-full-name-error" : undefined}
            className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] font-mono text-[15px] text-ink"
          />
        </FormField>
      </div>

      <div className="mt-8 flex gap-3">
        <Button
          variant="primary"
          disabled={!valid}
          loading={createRepo.isPending}
          onClick={handleNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
