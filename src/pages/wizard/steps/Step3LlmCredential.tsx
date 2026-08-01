import { useState } from "react";

import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { PasswordField } from "../../../components/PasswordField";
import { useSetLlmCredential } from "../../../data/repos";

type Step3LlmCredentialProps = {
  repoId: string;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  onBack: () => void;
  onAdvance: () => void;
};

// Passo 3 — Credencial do Gemini. Sempre obrigatório, independente do método
// escolhido no Passo 2 (é usado pra gerar a revisão em si) — ver PRD 06.
export function Step3LlmCredential({
  repoId,
  apiKey,
  onApiKeyChange,
  onBack,
  onAdvance,
}: Step3LlmCredentialProps) {
  const setLlmCredential = useSetLlmCredential(repoId);
  const [formError, setFormError] = useState<string | null>(null);
  const valid = apiKey.trim().length > 0;

  async function handleNext() {
    if (!valid) {
      return;
    }
    setFormError(null);
    try {
      await setLlmCredential.mutateAsync(apiKey.trim());
      onAdvance();
    } catch (error) {
      console.error(error);
      setFormError("Não foi possível salvar a chave agora. Tente novamente.");
    }
  }

  return (
    <div>
      <PageHeader
        level="h1"
        title="Sua chave do Gemini"
        description="A revisão roda no seu próprio provedor — a chave é sua e o consumo vai para a sua conta do Google AI Studio."
      />

      <div className="mt-8">
        <PasswordField
          label="Chave da API"
          htmlFor="wizard-api-key"
          placeholder="cole sua chave de API do Gemini"
          value={apiKey}
          onChange={onApiKeyChange}
          error={formError ?? undefined}
        />
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-muted">
          Depois de salva, ela nunca é devolvida pela API — nem para você, nem mascarada. Só ficamos
          sabendo que existe.
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
        <Button
          variant="primary"
          disabled={!valid}
          loading={setLlmCredential.isPending}
          onClick={handleNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
