import { useState } from "react";

import { Accordion } from "../../components/Accordion";
import { Button } from "../../components/Button";
import { PasswordField } from "../../components/PasswordField";
import { ProviderLogo } from "../../components/ProviderLogo";
import { SelectableCard } from "../../components/SelectableCard";
import { LLM_PROVIDERS } from "../../lib/llm-provider-catalog";
import type { LlmProvider } from "../../types/llm-provider";

type CredentialSectionProps = {
  title: string;
  fieldLabel: string;
  htmlForPrefix: string;
  placeholder: string;
  hint: string;
  saveLabel: string;
  isPending: boolean;
  onSave: (value: string) => Promise<unknown>;
  // Link pra onde gerar o valor deste campo (ex.: a página de criação de
  // PAT do GitHub) — nem toda credencial tem um destino óbvio pra isso.
  helpLink?: { label: string; href: string };
  // Só o bloco de credencial LLM passa isso — o de SCM continua idêntico,
  // sem seletor (só existe um provedor de SCM). Ver 17-...md.
  providerPicker?: {
    currentProvider: LlmProvider;
    onProviderChange: (provider: LlmProvider) => void;
  };
};

// Blocos 6.1/6.2 (Credencial LLM/SCM) — composição idêntica, só muda rótulo,
// mutation e texto de ajuda (ver PRD 07, "Composição": vale extrair um
// componente local em vez de duplicar o mesmo JSX duas vezes). O valor real
// nunca é reexibido depois de salvo — e, na Fase 2, sem endpoint de leitura,
// nem sequer sabemos se já existe uma credencial salva (ver PRD da Fase 2,
// "Tela 6 escreve às cegas") — por isso o bloco nasce sempre "colapsado",
// sem status nenhum, e o botão é sempre "Salvar", nunca "Substituir".
export function CredentialSection({
  title,
  fieldLabel,
  htmlForPrefix,
  placeholder,
  hint,
  saveLabel,
  isPending,
  onSave,
  helpLink,
  providerPicker,
}: CredentialSectionProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const valid = value.trim().length > 0;

  async function handleSave() {
    if (!valid) {
      return;
    }
    setError(null);
    try {
      await onSave(value.trim());
      setValue("");
    } catch (saveError) {
      console.error(`Failed to save credential (${htmlForPrefix}):`, saveError);
      setError("Não foi possível salvar agora. Tente novamente.");
    }
  }

  return (
    <Accordion
      title={<div className="text-[17px] font-medium tracking-tight text-ink">{title}</div>}
    >
      <div className="flex flex-col gap-4">
        {providerPicker && (
          <div role="radiogroup" aria-label="Provedor de LLM" className="flex flex-col gap-3">
            {LLM_PROVIDERS.map((option) => (
              <SelectableCard
                key={option.provider}
                selected={providerPicker.currentProvider === option.provider}
                onSelect={() => providerPicker.onProviderChange(option.provider)}
                title={option.name}
                icon={<ProviderLogo provider={option.provider} />}
              />
            ))}
          </div>
        )}
        <PasswordField
          label={fieldLabel}
          htmlFor={`${htmlForPrefix}-value`}
          placeholder={placeholder}
          value={value}
          onChange={setValue}
          error={error ?? undefined}
        />
        {helpLink && (
          <a
            href={helpLink.href}
            target="_blank"
            rel="noreferrer"
            className="-mt-2 inline-block text-[13px] text-accent hover:underline"
          >
            {helpLink.label}
          </a>
        )}
        <p className="text-[12.5px] leading-relaxed text-ink-muted">{hint}</p>
        <div>
          <Button
            variant="primary"
            size="sm"
            disabled={!valid}
            loading={isPending}
            onClick={handleSave}
          >
            {saveLabel}
          </Button>
        </div>
      </div>
    </Accordion>
  );
}
