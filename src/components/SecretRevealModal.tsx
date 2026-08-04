import { useEffect, useRef, useState } from "react";

import { Button } from "./Button";
import { SecretValueBlock } from "./SecretValueBlock";

type SecretRevealModalProps = {
  open: boolean;
  kind: "action_token" | "webhook_secret";
  value: string;
  webhookUrl?: string;
  // Só usado pra montar o link direto do secret de Action — sem endpoint de
  // leitura (Fase 2), a Tela 6 nem sempre sabe o fullName do repositório.
  repoFullName?: string;
  onClose: () => void;
};

const COPY: Record<
  SecretRevealModalProps["kind"],
  { title: string; instruction: string; valueLabel: string }
> = {
  action_token: {
    title: "Token da Action gerado",
    instruction:
      "Configure este valor como o secret BELLA_TOKEN do repositório no GitHub — Repository secret, não Environment secret (repositórios com o app do Vercel instalado ganham ambientes \"Production\"/\"Preview\" que também aparecem nessa tela; um secret criado neles não fica visível pra este workflow).",
    valueLabel: "Token",
  },
  webhook_secret: {
    title: "Segredo de webhook gerado",
    instruction:
      "Configure isso no GitHub: Settings → Webhooks → Add webhook, colando a URL e o segredo abaixo.",
    valueLabel: "Segredo",
  },
};

// Único ponto de revelação de segredo fora do wizard (ver SecretValueBlock para o
// bloco compartilhado com o Passo 6 do wizard). Deliberadamente sem fechar por Esc
// ou clique fora — o valor é irrecuperável depois de fechado, então só o botão
// "Fechar", bloqueado até o checkbox de confirmação, pode fechar o modal. Ver
// 00-component-library.md, "SecretRevealModal".
export function SecretRevealModal({
  open,
  kind,
  value,
  webhookUrl,
  repoFullName,
  onClose,
}: SecretRevealModalProps) {
  if (!open) {
    return null;
  }

  // `key={value}` força uma instância nova (estado do checkbox reiniciado do zero)
  // sempre que um segredo novo é revelado, sem precisar resetar estado num efeito
  // (o próprio React desaconselha isso — ver "You Might Not Need an Effect").
  return (
    <SecretRevealDialog
      key={value}
      kind={kind}
      value={value}
      webhookUrl={webhookUrl}
      repoFullName={repoFullName}
      onClose={onClose}
    />
  );
}

type SecretRevealDialogProps = Omit<SecretRevealModalProps, "open">;

function SecretRevealDialog({
  kind,
  value,
  webhookUrl,
  repoFullName,
  onClose,
}: SecretRevealDialogProps) {
  const [ack, setAck] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Mover o foco pro modal ao abrir é uma sincronização legítima com o DOM (um
  // sistema externo ao React), diferente de resetar estado — por isso continua
  // sendo feito num efeito.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const copy = COPY[kind];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="secret-modal-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-lg bg-surface p-6"
      >
        <h2 id="secret-modal-title" className="text-lg font-medium text-ink">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Esse valor não pode ser recuperado depois — copie agora.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {kind === "webhook_secret" && webhookUrl && (
            <SecretValueBlock label="URL do webhook" value={webhookUrl} />
          )}
          <SecretValueBlock label={copy.valueLabel} value={value} />
        </div>

        <p className="mt-4 text-sm text-ink-muted">{copy.instruction}</p>

        {kind === "action_token" && repoFullName && (
          <a
            href={`https://github.com/${repoFullName}/settings/secrets/actions/new`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            Abrir a tela de novo secret no GitHub
          </a>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={ack} onChange={(event) => setAck(event.target.checked)} />
          Já copiei/configurei
        </label>

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" disabled={!ack} onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
