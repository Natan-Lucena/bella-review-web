import { useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

type SecretCardProps = {
  title: string;
  statusText: string;
  generateLabel: string;
  rotateWarningText: string;
  helpText?: string;
  alreadyGenerated: boolean;
  isPending: boolean;
  onGenerate: () => void;
};

// Bloco 6.3 — um cartão por método (GitHub Action / Webhook nativo), os dois
// sempre visíveis lado a lado (diferente do wizard, que só mostra um). Gerar
// de novo quando já existe um valor é rotação destrutiva (o anterior para de
// funcionar na hora) — exige um clique de confirmação separado antes de
// executar, não só um aviso passivo ao lado do botão. Ver PRD 07, critérios
// de aceite.
export function SecretCard({
  title,
  statusText,
  generateLabel,
  rotateWarningText,
  helpText,
  alreadyGenerated,
  isPending,
  onGenerate,
}: SecretCardProps) {
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (alreadyGenerated && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onGenerate();
  }

  return (
    <Card padding="lg">
      <h2 className="text-[17px] font-medium tracking-tight text-ink">{title}</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{statusText}</p>

      <div className="mt-4 flex items-center gap-2">
        <Button
          variant={confirming ? "primary" : "secondary"}
          size="sm"
          loading={isPending}
          onClick={handleClick}
        >
          {confirming ? "Confirmar rotação" : generateLabel}
        </Button>
        {confirming && (
          <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
        )}
      </div>

      {confirming && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-severity-medium">
          {rotateWarningText}
        </p>
      )}
      {!confirming && helpText && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">{helpText}</p>
      )}
    </Card>
  );
}
