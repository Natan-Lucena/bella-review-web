import { useState } from "react";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
};

// Campo de tags livres — nunca um <select> fechado. A categoria de um comentário é
// texto livre escolhido pela própria IA a cada revisão, não um enum fixo no backend.
// Ver 00-component-library.md, "TagInput".
export function TagInput({ value, onChange, suggestions = [] }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((existing) => existing !== tag));
  }

  const availableSuggestions = suggestions.filter((suggestion) => !value.includes(suggestion));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs text-ink"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remover categoria ${tag}`}
              className="text-ink-muted hover:text-ink"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(draft);
          }
        }}
        placeholder="Digite e pressione Enter"
        className="rounded border border-surface-border bg-background px-3 py-2 text-ink"
      />
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="rounded-full border border-surface-border px-2.5 py-1 text-xs text-ink-muted hover:text-ink"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
