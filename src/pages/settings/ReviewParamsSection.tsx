import { useState } from "react";

import { Accordion } from "../../components/Accordion";
import { Button } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { TagInput } from "../../components/TagInput";
import type { RepoConfigPatch } from "../../types/repo-config";

const CATEGORY_SUGGESTIONS = ["security", "performance", "correctness", "error-handling"];
const MODEL_SUGGESTIONS = ["gemini-2.5-flash", "gemini-2.5-pro"];
const MODEL_PLACEHOLDER = "gemini-2.5-flash";
const TOKEN_LIMIT_PLACEHOLDER = "100000";
// Valor neutro só pra o slider ter uma posição inicial — não é enviado
// a menos que o usuário efetivamente mexa nele (ver `temperatureTouched`).
const TEMPERATURE_NEUTRAL = 1;

type ReviewParamsSectionProps = {
  isPending: boolean;
  onSave: (patch: RepoConfigPatch) => Promise<unknown>;
};

// Bloco 6.4 — Parâmetros de review. Deliberadamente fora do wizard (os
// padrões já funcionam sozinhos). Sem endpoint de leitura (ver PRD da Fase 2,
// "Tela 6 escreve às cegas"), este bloco não sabe os valores atuais — cada
// campo nasce vazio/neutro (só placeholder visual) e rastreia se o usuário
// de fato mexeu nele. O PATCH enviado inclui só os campos tocados, nunca um
// valor "razoável" não mexido — evita sobrescrever silenciosamente uma
// configuração real já salva no backend.
export function ReviewParamsSection({ isPending, onSave }: ReviewParamsSectionProps) {
  const [model, setModel] = useState("");
  const [modelTouched, setModelTouched] = useState(false);
  const [tokenLimit, setTokenLimit] = useState("");
  const [tokenLimitTouched, setTokenLimitTouched] = useState(false);
  const [temperature, setTemperature] = useState(TEMPERATURE_NEUTRAL);
  const [temperatureTouched, setTemperatureTouched] = useState(false);
  const [enabledCategories, setEnabledCategories] = useState<string[]>([]);
  const [categoriesTouched, setCategoriesTouched] = useState(false);
  const [saved, setSaved] = useState(false);

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
            placeholder={MODEL_PLACEHOLDER}
            className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] font-mono text-[15px] text-ink"
          />
          <datalist id="settings-model-options">
            {MODEL_SUGGESTIONS.map((suggestion) => (
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
          <label
            htmlFor="settings-temperature"
            className="mb-3 flex max-w-[420px] justify-between text-[13.5px] text-ink-muted"
          >
            Temperatura{" "}
            <span className="font-mono text-ink">
              {temperatureTouched ? temperature : "não alterada"}
            </span>
          </label>
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
