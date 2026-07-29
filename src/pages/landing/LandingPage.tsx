import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Logo } from "../../components/Logo";
import { PageHeader } from "../../components/PageHeader";
import { WorkflowYamlBlock } from "./WorkflowYamlBlock";

// Conteúdo/copy vem de frontend-especificacao-telas.md, Tela 1 — este
// arquivo só implementa a composição (ver 03-tela-landing.md).
const FEATURES = [
  {
    icon: "🔍",
    title: "Revisão automática por PR",
    description:
      "Analisa o diff completo do Pull Request e comenta diretamente nas linhas, como um revisor humano faria.",
  },
  {
    icon: "⚡",
    title: "Assíncrono, não trava seu CI",
    description:
      "A Action só confirma o recebimento (segundos); a análise roda em segundo plano e os comentários aparecem no PR minutos depois.",
  },
  {
    icon: "🔑",
    title: "Você escolhe o modelo e paga sua própria conta",
    description:
      "A chave de API do Gemini é seu próprio provedor, configurada no painel — a plataforma não é um intermediário de custo.",
  },
  {
    icon: "📊",
    title: "Histórico e consumo de tokens visíveis",
    description:
      "Todo comentário gerado, toda execução, todo token gasto fica registrado e visível no painel.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-surface-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-medium text-ink">Bella Reviewer</span>
          </div>
          <Button variant="primary" to="/signup">
            Criar conta
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-20 px-6 py-16">
        <section className="flex flex-col items-center gap-6 text-center">
          <Logo size={72} />
          <PageHeader
            level="h1"
            title="Bella Reviewer"
            description="Revisão de código por IA que entra no seu CI como qualquer outra Action — sem servidor pra manter, sem processo novo pra aprender."
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="primary" to="/signup">
              Criar conta
            </Button>
            <Button variant="secondary" to="/login">
              Já tenho conta
            </Button>
          </div>
        </section>

        <section className="flex flex-col items-center gap-6">
          <PageHeader
            title="Plug-and-play: cole ~10 linhas de YAML"
            description="O mesmo workflow documentado no README real da Action — sem servidor pra hospedar, sem agente pra rodar."
          />
          <div className="w-full max-w-xl">
            <WorkflowYamlBlock />
            <p className="mt-3 text-center text-sm text-ink-muted">
              Cole isso, gere um token no painel, e pronto — a partir do próximo Pull Request, a
              Bella já está revisando.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title} padding="lg">
              <div className="flex flex-col gap-2">
                <span aria-hidden="true" className="text-2xl">
                  {feature.icon}
                </span>
                <h3 className="font-medium text-ink">{feature.title}</h3>
                <p className="text-sm text-ink-muted">{feature.description}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="flex flex-col items-center gap-4 border-t border-surface-border pt-16 text-center">
          <PageHeader title="Pronto para revisar seu primeiro Pull Request?" />
          <Button variant="primary" to="/signup">
            Criar conta
          </Button>
        </section>
      </main>
    </div>
  );
}
