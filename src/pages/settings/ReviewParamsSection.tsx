import { useState } from "react";

import { Accordion } from "../../components/Accordion";
import { Button } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { TagInput } from "../../components/TagInput";
import type { RepoConfig, RepoConfigPatch } from "../../types/repo-config";

const CATEGORY_SUGGESTIONS = ["security", "performance", "correctness", "error-handling"];
const MODEL_SUGGESTIONS = ["gemini-2.5-flash", "gemini-2.5-pro"];

type ReviewParamsSectionProps = {
  config: RepoConfig;
  isPending: boolean;
  onSave: (patch: RepoConfigPatch) => Promise<unknown>;
};

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

// Bloco 6.4 — Parâmetros de review. Deliberadamente fora do wizard (os
// padrões já funcionam sozinhos). O PATCH só envia os campos que realmente
// mudaram em relação ao `config` recebido — patch parcial de verdade, não
// reenvia tudo a cada save. Ver PRD 07, Bloco 6.4.
export function ReviewParamsSection({ config, isPending, onSave }: ReviewParamsSectionProps) {
  const [model, setModel] = useState(config.model);
  const [tokenLimit, setTokenLimit] = useState(config.tokenLimit);
  const [temperature, setTemperature] = useState(config.temperature);
  const [enabledCategories, setEnabledCategories] = useState(config.enabledCategories);
  const [saved, setSaved] = useState(false);

  function markDirty() {
    setSaved(false);
  }

  async function handleSave() {
    const patch: RepoConfigPatch = {};
    if (model !== config.model) {
      patch.model = model;
    }
    if (tokenLimit !== config.tokenLimit) {
      patch.tokenLimit = tokenLimit;
    }
    if (temperature !== config.temperature) {
      patch.temperature = temperature;
    }
    if (!arraysEqual(enabledCategories, config.enabledCategories)) {
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
              markDirty();
            }}
            placeholder="gemini-2.5-flash"
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
                setTokenLimit(Number(event.target.value));
                markDirty();
              }}
              className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] font-mono text-[15px] text-ink"
            />
          </FormField>
        </div>

        <div>
          <label
            htmlFor="settings-temperature"
            className="mb-3 flex max-w-[420px] justify-between text-[13.5px] text-ink-muted"
          >
            Temperatura <span className="font-mono text-ink">{temperature}</span>
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
              markDirty();
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
              markDirty();
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
