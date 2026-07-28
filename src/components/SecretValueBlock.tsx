import { useState } from "react";

import { cn } from "../lib/cn";
import { Button } from "./Button";

type SecretValueBlockProps = {
  label: string;
  value: string;
  mono?: boolean;
};

// Valor secreto gerado (token/segredo), copiável, mostrado uma única vez —
// reaproveitado tanto pela tela de sucesso do wizard quanto pelo SecretRevealModal.
// Ver 00-component-library.md, "SecretValueBlock".
export function SecretValueBlock({ label, value, mono = true }: SecretValueBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center justify-between gap-2 rounded border border-surface-border bg-background px-3 py-2">
        <code className={cn("truncate text-sm text-ink", mono && "font-mono")}>{value}</code>
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? "Copiado!" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}
