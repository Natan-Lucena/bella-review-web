import { useState } from "react";

import { Accordion } from "../../components/Accordion";
import { Button } from "../../components/Button";
import { PasswordField } from "../../components/PasswordField";
import { formatDate } from "../../lib/format-date";
import type { CredentialStatus } from "../../mocks/api-client";

type CredentialSectionProps = {
  title: string;
  status: CredentialStatus;
  fieldLabel: string;
  htmlForPrefix: string;
  placeholder: string;
  hint: string;
  saveLabelNew: string;
  saveLabelReplace: string;
  isPending: boolean;
  onSave: (value: string) => Promise<unknown>;
  // Link pra onde gerar o valor deste campo (ex.: a página de criação de
  // PAT do GitHub) — nem toda credencial tem um destino óbvio pra isso.
  helpLink?: { label: string; href: string };
};

// Blocos 6.1/6.2 (Credencial LLM/SCM) — composição idêntica, só muda rótulo,
// mutation e texto de ajuda (ver PRD 07, "Composição": vale extrair um
// componente local em vez de duplicar o mesmo JSX duas vezes). O valor real
// nunca é reexibido depois de salvo — só "•••••••• configurado em {data}".
export function CredentialSection({
  title,
  status,
  fieldLabel,
  htmlForPrefix,
  placeholder,
  hint,
  saveLabelNew,
  saveLabelReplace,
  isPending,
  onSave,
  helpLink,
}: CredentialSectionProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const valid = value.trim().length > 0;

  const statusText =
    status.configured && status.updatedAt
      ? `•••••••• configurado em ${formatDate(status.updatedAt)}`
      : "Ainda não configurada";

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
      title={
        <div>
          <div className="text-[17px] font-medium tracking-tight text-ink">{title}</div>
          <div className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{statusText}</div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
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
            {status.configured ? saveLabelReplace : saveLabelNew}
          </Button>
        </div>
      </div>
    </Accordion>
  );
}
