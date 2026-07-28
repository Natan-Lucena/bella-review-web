import { useState } from "react";

import { Accordion } from "../components/Accordion";
import { Badge } from "../components/Badge";
import { Breadcrumb } from "../components/Breadcrumb";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { LoadMoreButton } from "../components/LoadMoreButton";
import { Logo } from "../components/Logo";
import { PageHeader } from "../components/PageHeader";
import { PasswordField } from "../components/PasswordField";
import { SecretRevealModal } from "../components/SecretRevealModal";
import { SecretValueBlock } from "../components/SecretValueBlock";
import { SelectableCard } from "../components/SelectableCard";
import { Skeleton } from "../components/Skeleton";
import { TagInput } from "../components/TagInput";

// Vitrine temporária da biblioteca de componentes (PRD 00) — existe só para
// desenvolvimento visual manual enquanto o roteamento real (PRD 01) e as telas
// (PRDs 03-10) ainda não existem. Será substituída pelo <RouterProvider> real.
export function App() {
  const [password, setPassword] = useState("");
  const [categories, setCategories] = useState<string[]>(["security"]);
  const [method, setMethod] = useState<"action" | "webhook">("action");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
      <header className="flex items-center gap-3">
        <Logo />
        <h1 className="text-lg font-medium">Bella Reviewer — vitrine de componentes</h1>
      </header>

      <section className="flex flex-col gap-3">
        <PageHeader title="Button" description="Variantes e estados" />
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="primary" disabled>
            Desabilitado
          </Button>
          <Button variant="primary" loading>
            Carregando
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <PageHeader title="Badge" />
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Na fila</Badge>
          <Badge tone="info">Processando</Badge>
          <Badge tone="success">Concluída</Badge>
          <Badge tone="danger">Falhou</Badge>
          <Badge tone="warning">Configuração pendente</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <PageHeader title="Card / SelectableCard" />
        <Card as="button" onClick={() => {}}>
          Repositório clicável
        </Card>
        <div role="radiogroup" aria-label="Método de integração" className="flex gap-3">
          <SelectableCard
            title="Via GitHub Action"
            description="Recomendado"
            selected={method === "action"}
            onSelect={() => setMethod("action")}
          />
          <SelectableCard
            title="Via webhook nativo"
            selected={method === "webhook"}
            onSelect={() => setMethod("webhook")}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <PageHeader title="Formulários" />
        <FormField label="Nome do repositório" htmlFor="fullName">
          <input
            id="fullName"
            className="rounded border border-surface-border bg-background px-3 py-2 text-ink"
          />
        </FormField>
        <PasswordField
          label="Chave da API Gemini"
          htmlFor="apiKey"
          value={password}
          onChange={setPassword}
        />
        <TagInput
          value={categories}
          onChange={setCategories}
          suggestions={["security", "performance", "correctness", "error-handling"]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <PageHeader title="Estados" />
        <EmptyState
          title="Você ainda não tem nenhum repositório."
          description="Cadastre o primeiro para gerar o token da Action."
          action={{ label: "Adicionar repositório", onClick: () => {} }}
        />
        <div className="flex flex-col gap-2">
          <Skeleton shape="block" />
          <Skeleton shape="line" width="60%" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <PageHeader title="Segredos" />
        <SecretValueBlock label="Token" value="bella_at_exemplo123" />
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Gerar token (abrir modal)
        </Button>
        <SecretRevealModal
          open={modalOpen}
          kind="action_token"
          value="bella_at_exemplo123"
          onClose={() => setModalOpen(false)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <PageHeader title="Navegação" />
        <Breadcrumb
          items={[{ label: "Repositórios", to: "/repos" }, { label: "bella-reviewer-api" }]}
        />
        <LoadMoreButton onClick={() => {}} hasMore />
      </section>

      <section className="flex flex-col gap-3">
        <PageHeader title="Accordion" />
        <Accordion title="Credencial do LLM (Gemini)">Conteúdo do bloco.</Accordion>
      </section>
    </main>
  );
}
