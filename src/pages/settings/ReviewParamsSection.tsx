import { useState } from "react";

import { Accordion } from "../../components/Accordion";
import { Button } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { TagInput } from "../../components/TagInput";
import { Tooltip } from "../../components/Tooltip";
import { usePrompts } from "../../data/prompts";
import { LLM_PROVIDER_CATALOG } from "../../lib/llm-provider-catalog";
import type { LlmProvider } from "../../types/llm-provider";
import type { RepoConfigPatch } from "../../types/repo-config";
import { REVIEW_LANGUAGE_LABELS } from "../../types/review-language";
import type { ReviewLanguage } from "../../types/review-language";

const CATEGORY_SUGGESTIONS = ["security", "performance", "correctness", "error-handling"];
const TOKEN_LIMIT_PLACEHOLDER = "100000";
// Valor neutro só pra o slider ter uma posição inicial — não é enviado
// a menos que o usuário efetivamente mexa nele (ver `temperatureTouched`).
const TEMPERATURE_NEUTRAL = 1;
const REVIEW_LANGUAGE_OPTIONS = Object.entries(REVIEW_LANGUAGE_LABELS) as [
  ReviewLanguage,
  string,
][];

type ReviewParamsSectionProps = {
  isPending: boolean;
  onSave: (patch: RepoConfigPatch) => Promise<unknown>;
  // Provedor conhecido do repositório (repo?.llmProvider, useRepo(repoId) em
  // SettingsPage) — decide de qual provedor vêm as sugestões/placeholder de
  // modelo. "gemini" (o default da plataforma) quando ainda não é conhecido
  // (cache vazio). Ver 17-...md.
  currentProvider: LlmProvider;
  // promptId conhecido do repositório (repo?.promptId, useRepo(repoId) em
  // SettingsPage) — diferente de todo outro campo deste componente, este É
  // exposto por GET /repos, então o seletor nasce pré-preenchido com o valor
  // real em vez de vazio/neutro. Ver PRD 19, seção 6, "Motivação e contexto".
  currentPromptId: string | null;
  // reviewLanguage conhecido do repositório (repo?.reviewLanguage,
  // useRepo(repoId) em SettingsPage) — mesma exceção de currentPromptId: É
  // exposto por GET /repos, então o seletor nasce pré-preenchido com o valor
  // real. Ver PRD 20, seção 3.
  currentReviewLanguage: ReviewLanguage;
};

// Bloco 6.4 — Parâmetros de review. Deliberadamente fora do wizard (os
// padrões já funcionam sozinhos). Sem endpoint de leitura (ver PRD da Fase 2,
// "Tela 6 escreve às cegas"), este bloco não sabe os valores atuais de
// model/tokenLimit/temperature/enabledCategories — cada um desses nasce
// vazio/neutro (só placeholder visual) e rastreia se o usuário de fato mexeu
// nele. `promptId` é a exceção deliberada: GET /repos já expõe esse campo,
// então o seletor de prompt nasce pré-preenchido com o valor real
// (`currentPromptId`) em vez de vazio — ver PRD 19, seção 6. Todo campo
// (inclusive o prompt) só entra no PATCH se de fato tocado; nunca um valor
// "razoável" não mexido — evita sobrescrever silenciosamente uma
// configuração real já salva no backend.
export function ReviewParamsSection({
  isPending,
  onSave,
  currentProvider,
  currentPromptId,
  currentReviewLanguage,
}: ReviewParamsSectionProps) {
  const catalogEntry = LLM_PROVIDER_CATALOG[currentProvider];
  const { data: promptsData, isPending: promptsPending } = usePrompts();
  const prompts = promptsData?.prompts ?? [];
  const [model, setModel] = useState("");
  const [modelTouched, setModelTouched] = useState(false);
  const [tokenLimit, setTokenLimit] = useState("");
  const [tokenLimitTouched, setTokenLimitTouched] = useState(false);
  const [temperature, setTemperature] = useState(TEMPERATURE_NEUTRAL);
  const [temperatureTouched, setTemperatureTouched] = useState(false);
  const [enabledCategories, setEnabledCategories] = useState<string[]>([]);
  const [categoriesTouched, setCategoriesTouched] = useState(false);
  // Diferente dos campos acima, promptId É exposto por GET /repos — nasce
  // pré-preenchido com o valor real (currentPromptId), não vazio/neutro. Ver
  // PRD 19, seção 6.
  const [promptSelection, setPromptSelection] = useState(currentPromptId ?? "");
  const [promptTouched, setPromptTouched] = useState(false);
  // Mesma exceção de promptId — reviewLanguage É exposto por GET /repos,
  // então nasce pré-preenchido com o valor real. Ver PRD 20, seção 3.
  const [reviewLanguageSelection, setReviewLanguageSelection] =
    useState<ReviewLanguage>(currentReviewLanguage);
  const [reviewLanguageTouched, setReviewLanguageTouched] = useState(false);
  const [saved, setSaved] = useState(false);

  // `useState(currentPromptId ?? "")` só captura o valor no mount — em
  // SettingsPage.tsx, `useRepo(repoId)` (por trás de `useRepos()`) ainda não
  // resolveu na primeira renderização real da tela (é um fetch de rede, não
  // instantâneo), então `currentPromptId` chega `null` no mount e o select
  // travaria em "Bella Default Skill" pra sempre, mesmo depois do fetch
  // trazer o valor real (confirmado ao vivo contra o backend real). Ajuste
  // durante a própria renderização (não um efeito — "You Might Not Need an
  // Effect") sempre que o valor real chega, mas só enquanto o usuário não
  // mexeu no campo — não sobrescreve uma escolha já feita na mesma sessão.
  const [lastSeenPromptId, setLastSeenPromptId] = useState(currentPromptId);
  if (currentPromptId !== lastSeenPromptId) {
    setLastSeenPromptId(currentPromptId);
    if (!promptTouched) {
      setPromptSelection(currentPromptId ?? "");
    }
  }

  // Mesmo padrão de ajuste durante a renderização usado acima para
  // promptId — currentReviewLanguage também chega assíncrono (useRepo(repoId)
  // ainda não resolveu no mount). Ver PRD 20, seção 3.
  const [lastSeenReviewLanguage, setLastSeenReviewLanguage] = useState(currentReviewLanguage);
  if (currentReviewLanguage !== lastSeenReviewLanguage) {
    setLastSeenReviewLanguage(currentReviewLanguage);
    if (!reviewLanguageTouched) {
      setReviewLanguageSelection(currentReviewLanguage);
    }
  }

  async function handleSave() {
    const patch: RepoConfigPatch = {};
    if (modelTouched && model.trim().length > 0) {
      patch.model = model.trim();
    }
    if (tokenLimitTouched && tokenLimit.trim().length > 0) {
      patch.tokenLimit = Number(tokenLimit);
    }
    if (temperatureTouched) {
      patch.temperature = temperature;
    }
    if (categoriesTouched) {
      patch.enabledCategories = enabledCategories;
    }
    if (promptTouched) {
      patch.promptId = promptSelection === "" ? null : promptSelection;
    }
    if (reviewLanguageTouched) {
      patch.reviewLanguage = reviewLanguageSelection;
    }
    if (Object.keys(patch).length === 0) {
      return;
    }
    await onSave(patch);
    setSaved(true);
  }

  return (
    <Accordion title="Parâmetros de review">
      <div className="flex flex-col gap-6">
        <FormField label="Modelo" htmlFor="settings-model">
          <input
            id="settings-model"
            list="settings-model-options"
            value={model}
            onChange={(event) => {
              setModel(event.target.value);
              setModelTouched(true);
              setSaved(false);
            }}
            placeholder={catalogEntry.modelPlaceholder}
            className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] font-mono text-[15px] text-ink"
          />
          <datalist id="settings-model-options">
            {catalogEntry.modelSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </FormField>

        <div className="max-w-60">
          <FormField label="Limite de tokens por execução" htmlFor="settings-token-limit">
            <input
              id="settings-token-limit"
              type="number"
              min={1}
              value={tokenLimit}
              onChange={(event) => {
                setTokenLimit(event.target.value);
                setTokenLimitTouched(true);
                setSaved(false);
              }}
              placeholder={TOKEN_LIMIT_PLACEHOLDER}
              className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] font-mono text-[15px] text-ink"
            />
          </FormField>
        </div>

        <div>
          <div className="mb-3 flex max-w-[420px] items-center justify-between text-[13.5px] text-ink-muted">
            <span className="flex items-center gap-1.5">
              <label htmlFor="settings-temperature">Temperatura</label>
              <Tooltip
                label="Temperatura"
                content="Controla a aleatoriedade das respostas do modelo: valores baixos (perto de 0) deixam o review mais determinístico e conservador; valores altos (perto de 2) deixam as respostas mais variadas e criativas, mas menos previsíveis."
              />
            </span>
            <span className="font-mono text-ink">
              {temperatureTouched ? temperature : "não alterada"}
            </span>
          </div>
          <input
            id="settings-temperature"
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(event) => {
              setTemperature(Number(event.target.value));
              setTemperatureTouched(true);
              setSaved(false);
            }}
            className="w-full max-w-[420px] accent-accent"
          />
        </div>

        <FormField label="Prompt de review" htmlFor="settings-prompt">
          <select
            id="settings-prompt"
            value={promptSelection}
            disabled={promptsPending}
            onChange={(event) => {
              setPromptSelection(event.target.value);
              setPromptTouched(true);
              setSaved(false);
            }}
            className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] font-mono text-[15px] text-ink disabled:opacity-60"
          >
            {/* Desabilitado enquanto usePrompts() ainda não resolveu — mesmo
                com staleTime (fica warm depois), a primeira busca de verdade
                nesta sessão ainda é assíncrona; um <select> controlado com
                um value que ainda não tem <option> correspondente pode
                mostrar um valor diferente do que o estado interno guarda. */}
            <option value="">Bella Default Skill</option>
            {prompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Idioma dos comentários" htmlFor="settings-review-language">
          <select
            id="settings-review-language"
            value={reviewLanguageSelection}
            onChange={(event) => {
              setReviewLanguageSelection(event.target.value as ReviewLanguage);
              setReviewLanguageTouched(true);
              setSaved(false);
            }}
            className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] font-mono text-[15px] text-ink"
          >
            {REVIEW_LANGUAGE_OPTIONS.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <div>
          <span className="mb-2.5 block text-[13.5px] text-ink-muted">Categorias habilitadas</span>
          <TagInput
            value={enabledCategories}
            onChange={(next) => {
              setEnabledCategories(next);
              setCategoriesTouched(true);
              setSaved(false);
            }}
            suggestions={CATEGORY_SUGGESTIONS}
          />
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">
            Vazio = todas as categorias. A categoria é escolhida livremente pelo modelo a cada
            revisão, então qualquer palavra vale.
          </p>
        </div>

        <div className="flex items-center gap-3.5">
          <Button variant="primary" size="sm" loading={isPending} onClick={handleSave}>
            Salvar parâmetros
          </Button>
          {saved && <span className="text-[13.5px] text-status-completed">Parâmetros salvos.</span>}
        </div>
      </div>
    </Accordion>
  );
}
