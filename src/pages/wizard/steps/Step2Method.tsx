import { useRef } from "react";
import type { KeyboardEvent } from "react";

import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { SelectableCard } from "../../../components/SelectableCard";
import type { IntegrationMethod } from "../wizardReducer";

type Step2MethodProps = {
  method: IntegrationMethod | null;
  onMethodChange: (method: IntegrationMethod) => void;
  onBack: () => void;
  onNext: () => void;
};

const ARROW_KEYS = new Set(["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"]);

// Passo 2 — Método de integração. Sem endpoint próprio (só `SET_METHOD` local
// — ver PRD 06). Pré-selecionado em "action" por padrão (é o caminho vendido
// na Tela 1). O container implementa a navegação por seta do teclado que
// `SelectableCard` documenta como responsabilidade de quem o usa.
export function Step2Method({ method, onMethodChange, onBack, onNext }: Step2MethodProps) {
  const selected = method ?? "action";
  const actionRef = useRef<HTMLDivElement>(null);
  const webhookRef = useRef<HTMLDivElement>(null);

  function selectAndFocus(next: IntegrationMethod) {
    onMethodChange(next);
    (next === "action" ? actionRef : webhookRef).current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!ARROW_KEYS.has(event.key)) {
      return;
    }
    event.preventDefault();
    selectAndFocus(selected === "action" ? "webhook" : "action");
  }

  // "action" é o padrão visual (pré-selecionado) mesmo antes do usuário tocar
  // num card — garantir que o reducer reflita isso ao avançar, em vez de
  // deixar `method` null se ninguém clicou em nada (ver PRD 06, Passo 2).
  function handleContinue() {
    onMethodChange(selected);
    onNext();
  }

  return (
    <div>
      <PageHeader
        level="h1"
        title="Como a Bella vai ser acionada?"
        description="Você pode ativar a outra forma depois, nas configurações do repositório — comece pela que preferir agora."
      />

      <div
        role="radiogroup"
        aria-label="Método de integração"
        onKeyDown={handleKeyDown}
        className="mt-8 flex flex-col gap-3"
      >
        <SelectableCard
          ref={actionRef}
          selected={selected === "action"}
          onSelect={() => selectAndFocus("action")}
          title="Via GitHub Action"
          badge="recomendado"
          description="Dez linhas de YAML no workflow do repositório. Nada pra hospedar."
        />
        <SelectableCard
          ref={webhookRef}
          selected={selected === "webhook"}
          onSelect={() => selectAndFocus("webhook")}
          title="Via webhook nativo do GitHub"
          description="Configurado em Settings → Webhooks do repositório, sem tocar no CI."
        />
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
        <Button variant="primary" onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
