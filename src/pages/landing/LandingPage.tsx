import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { CodeBlock } from "../../components/CodeBlock";
import { Logo } from "../../components/Logo";
import { AsyncIcon, AutoReviewIcon, ModelChoiceIcon, TokenHistoryIcon } from "./FeatureIcons";

// Conteúdo/copy e composição vêm de frontend-especificacao-telas.md, Tela 1,
// e replicam fielmente ../../../claude-design/pages/Bella Reviewer.dc.html
// (a maquete aprovada — ver frontend-prds/README.md, "Ordem de implementação"):
// hero em duas colunas, eyebrow acima do H1, ícones de linha nos cards, CTA
// final dentro de um cartão, rodapé com a assinatura da marca.

// O mesmo YAML documentado no README real da Action (ver
// frontend-especificacao-telas.md, Tela 1). Ver PRD 06: generalizado do antigo
// `WorkflowYamlBlock` local pro `CodeBlock` compartilhado, reaproveitado
// também pelo trecho do Passo 6 do Wizard.
const WORKFLOW_YAML = [
  "name: Bella Reviewer",
  "",
  "on:",
  "  pull_request:",
  "    types: [opened, synchronize, reopened]",
  "  pull_request_review_comment:",
  "    types: [created]",
  "",
  "jobs:",
  "  bella-review:",
  "    runs-on: ubuntu-latest",
  "    permissions:",
  "      pull-requests: read",
  "    steps:",
  "      - uses: Natan-Lucena/bella-review-action@v1",
  "        with:",
  "          bella-token: ${{ secrets.BELLA_TOKEN }}",
].join("\n");

const FEATURES = [
  {
    Icon: AutoReviewIcon,
    title: "Revisão automática por PR",
    description:
      "Analisa o diff completo do Pull Request e comenta diretamente nas linhas, como um revisor humano faria.",
  },
  {
    Icon: AsyncIcon,
    title: "Assíncrono, não trava seu CI",
    description:
      "A Action só confirma o recebimento, em segundos. A análise roda em segundo plano e os comentários aparecem no PR minutos depois.",
  },
  {
    Icon: ModelChoiceIcon,
    title: "Você escolhe o modelo e paga sua própria conta",
    description:
      "A chave de API do Gemini é do seu próprio provedor, configurada no painel. A plataforma não é intermediária de custo.",
  },
  {
    Icon: TokenHistoryIcon,
    title: "Histórico e consumo de tokens visíveis",
    description:
      "Todo comentário gerado, toda execução e todo token gasto fica registrado e visível no painel — transparência total sobre o que a IA fez e quanto custou.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-surface-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Logo className="h-11 w-11 sm:h-[120px] sm:w-[120px]" />
            <span className="text-[17px] font-medium tracking-tight text-ink">Bella Reviewer</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" to="/login">
              Já tenho conta
            </Button>
            <Button variant="primary" to="/signup">
              Criar conta
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="grid items-center gap-10 py-16 md:grid-cols-[1.12fr_0.88fr] md:gap-14 md:py-24">
          <div>
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3.5 py-1.5 text-xs tracking-wide text-accent">
              Revisão de código por IA · GitHub Actions
            </span>
            <h1 className="mt-5 text-4xl leading-[1.1] font-light tracking-tight text-ink md:text-5xl">
              Revisão de código por IA que entra no seu CI como qualquer outra Action.
            </h1>
            <p className="mt-5 max-w-prose text-lg leading-relaxed text-ink-muted">
              Sem servidor pra manter, sem processo novo pra aprender. Cole dez linhas de YAML no
              seu workflow e a Bella passa a revisar cada Pull Request.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" size="lg" to="/signup">
                Criar conta
              </Button>
              <Button variant="secondary" size="lg" to="/login">
                Já tenho conta
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <Logo size={1000} />
          </div>
        </section>

        <section className="grid items-center gap-10 pb-20 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
          <div>
            <h2 className="text-2xl leading-tight font-light tracking-tight text-ink md:text-[34px]">
              Plug-and-play, literalmente
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Não tem servidor pra hospedar, agente pra rodar nem infraestrutura pra mexer. É um
              passo de CI no workflow que seu repositório já tem.
            </p>
          </div>
          <CodeBlock
            code={WORKFLOW_YAML}
            footer="Cole isso, gere um token no painel, e pronto — a partir do próximo Pull Request, a Bella já está revisando."
          />
        </section>

        <section className="grid gap-5 pb-24 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, description }) => (
            <Card key={title} padding="lg">
              <Icon className="text-accent" />
              <h3 className="mt-4 text-lg font-medium tracking-tight text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
            </Card>
          ))}
        </section>

        <section className="pb-16">
          <div className="rounded-xl bg-surface px-8 py-14 text-center shadow-lg shadow-black/25">
            <h2 className="text-2xl leading-tight font-light tracking-tight text-ink md:text-[32px]">
              Dez linhas de YAML e a próxima revisão é da Bella.
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button variant="primary" size="lg" to="/signup">
                Criar conta
              </Button>
              <Button variant="secondary" size="lg" to="/login">
                Já tenho conta
              </Button>
            </div>
          </div>
          <p className="mt-9 text-center text-xs text-ink-muted">
            Bella Reviewer · revisão de Pull Requests com Gemini, no seu GitHub
          </p>
        </section>
      </main>
    </div>
  );
}
