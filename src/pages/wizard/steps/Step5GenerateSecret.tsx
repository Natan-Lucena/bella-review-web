import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { SecretValueBlock } from "../../../components/SecretValueBlock";
import { useGenerateActionToken, useGenerateWebhookSecret } from "../../../data/repos";
import type { IntegrationMethod, RevealedSecret } from "../wizardReducer";

type Step5GenerateSecretProps = {
  repoId: string;
  fullName: string;
  method: IntegrationMethod;
  revealedSecret: RevealedSecret | null;
  onReveal: (secret: RevealedSecret) => void;
  onBack: () => void;
  onAdvance: () => void;
};

const COPY = {
  action: {
    title: "Gere o token da Action",
    subtitle:
      "É com ele que a Action se autentica no backend. O valor aparece uma única vez — depois guardamos só o hash.",
    generateLabel: "Gerar token",
    warning:
      "Este valor não pode ser recuperado depois. Salve-o como o secret BELLA_TOKEN do seu workflow do GitHub Actions.",
  },
  webhook: {
    title: "Gere o segredo do webhook",
    subtitle:
      "São dois valores para copiar: a URL do webhook e o segredo. O segredo aparece uma única vez.",
    generateLabel: "Gerar segredo",
    warning:
      "O segredo não pode ser recuperado depois. Configure-o no GitHub em Settings → Webhooks, junto com a URL acima.",
  },
} as const;

// Passo 5a/5b — Gerar token da Action ou segredo de webhook, condicional por
// `method`. Ao gerar, o valor entra direto no reducer (REVEAL_SECRET) e fica
// visível aqui mesmo (sem avançar sozinho) — só o clique em "Continuar"
// avança pro Passo 6, dando um momento pra copiar antes de sair da tela (o
// valor também continua disponível no Passo 6, então nada se perde de
// qualquer forma). Ver PRD 06, Passo 5a/5b.
export function Step5GenerateSecret({
  repoId,
  fullName,
  method,
  revealedSecret,
  onReveal,
  onBack,
  onAdvance,
}: Step5GenerateSecretProps) {
  const generateActionToken = useGenerateActionToken(repoId);
  const generateWebhookSecret = useGenerateWebhookSecret(repoId);
  const copy = COPY[method];
  const isPending =
    method === "action" ? generateActionToken.isPending : generateWebhookSecret.isPending;

  async function handleGenerate() {
    if (method === "action") {
      const response = await generateActionToken.mutateAsync();
      onReveal({ kind: "action_token", value: response.token });
    } else {
      const response = await generateWebhookSecret.mutateAsync();
      onReveal({ kind: "webhook_secret", value: response.secret, webhookUrl: response.webhookUrl });
    }
  }

  return (
    <div>
      <PageHeader level="h1" title={copy.title} description={copy.subtitle} />

      {!revealedSecret && (
        <div className="mt-8">
          <Button variant="primary" size="lg" loading={isPending} onClick={handleGenerate}>
            {copy.generateLabel}
          </Button>
        </div>
      )}

      {revealedSecret && (
        <div className="mt-8 flex flex-col gap-4">
          {revealedSecret.kind === "webhook_secret" && (
            <SecretValueBlock label="URL do webhook" value={revealedSecret.webhookUrl} />
          )}
          <SecretValueBlock
            label={revealedSecret.kind === "action_token" ? "Seu token" : "Segredo"}
            value={revealedSecret.value}
          />
          <p className="rounded bg-severity-medium/[0.08] px-4 py-3 text-[13px] leading-relaxed text-severity-medium">
            {copy.warning}
          </p>
          {revealedSecret.kind === "action_token" && (
            <a
              href={`https://github.com/${fullName}/settings/secrets/actions/new`}
              target="_blank"
              rel="noreferrer"
              className="-mt-2 inline-block text-[13px] text-accent hover:underline"
            >
              Abrir a tela de novo secret no GitHub (Repository secret, não Environment secret)
            </a>
          )}
          <div className="flex gap-3">
            <Button variant="primary" onClick={onAdvance}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      <div className="mt-7 flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
