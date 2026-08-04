import { Button } from "../../../components/Button";
import { CodeBlock } from "../../../components/CodeBlock";
import { Logo } from "../../../components/Logo";
import { SecretValueBlock } from "../../../components/SecretValueBlock";
import type { RevealedSecret } from "../wizardReducer";

type Step6SuccessProps = {
  fullName: string;
  revealedSecret: RevealedSecret;
  ack: boolean;
  onAckChange: (ack: boolean) => void;
  onFinish: () => void;
};

const ACTION_SNIPPET = [
  "- uses: Natan-Lucena/bella-review-action@v1",
  "  with:",
  "    bella-token: ${{ secrets.BELLA_TOKEN }}",
].join("\n");

// Passo 6 — Sucesso. Não chama nenhum endpoint novo, só reapresenta o que o
// Passo 5a/5b já gerou (ver PRD 06). Checkbox obrigatório: o botão "Ir para o
// painel" fica desabilitado até ser marcado — é a última chance de garantir
// que o valor (irrecuperável depois) foi copiado.
export function Step6Success({
  fullName,
  revealedSecret,
  ack,
  onAckChange,
  onFinish,
}: Step6SuccessProps) {
  return (
    <div>
      <div className="text-center">
        <div className="flex justify-center">
          <Logo size={104} />
        </div>
        <h1 className="mt-5 text-[30px] font-light tracking-tight text-ink">
          {fullName} está pronto
        </h1>
        <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-muted">
          Falta um passo, e ele é no GitHub.
        </p>
      </div>

      {revealedSecret.kind === "action_token" && (
        <div className="mt-8">
          <SecretValueBlock label="Seu token" value={revealedSecret.value} />
          <p className="mt-5 text-[14.5px] leading-relaxed text-ink-muted">
            Configure este valor como o secret{" "}
            <span className="font-mono text-ink">BELLA_TOKEN</span> do repositório —{" "}
            <span className="font-medium text-ink">Repository secret, não Environment secret</span>{" "}
            (repositórios com o app do Vercel instalado ganham ambientes "Production"/"Preview" que
            também aparecem nessa tela; um secret criado neles não fica visível pra este workflow).
            Depois, cole o passo abaixo no seu workflow.
          </p>
          <a
            href={`https://github.com/${fullName}/settings/secrets/actions/new`}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 inline-block text-[13px] text-accent hover:underline"
          >
            Abrir a tela de novo secret no GitHub
          </a>
          <div className="mt-4">
            <CodeBlock code={ACTION_SNIPPET} showDots={false} />
          </div>
        </div>
      )}

      {revealedSecret.kind === "webhook_secret" && (
        <div className="mt-8 flex flex-col gap-4">
          <SecretValueBlock label="URL do webhook" value={revealedSecret.webhookUrl} />
          <SecretValueBlock label="Segredo" value={revealedSecret.value} />
          <p className="text-[14.5px] leading-relaxed text-ink-muted">
            Configure isso no GitHub: Settings → Webhooks → Add webhook, colando a URL e o segredo
            acima.
          </p>
        </div>
      )}

      <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-xl bg-background px-[18px] py-4">
        <input
          type="checkbox"
          checked={ack}
          onChange={(event) => onAckChange(event.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] accent-accent"
        />
        <span className="text-[14.5px] leading-relaxed text-ink">
          Já copiei e configurei no GitHub
          <span className="mt-1 block text-[13px] text-ink-muted">
            Não dá pra recuperar esse valor depois — esta é a última vez que ele aparece.
          </span>
        </span>
      </label>

      <div className="mt-7 flex justify-center">
        <Button variant="primary" size="lg" disabled={!ack} onClick={onFinish}>
          Ir para o painel
        </Button>
      </div>
    </div>
  );
}
