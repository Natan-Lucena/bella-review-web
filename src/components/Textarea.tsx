import { FormField } from "./FormField";

type TextareaProps = {
  label: string;
  htmlFor: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
  maxLength?: number;
};

// Primeiro campo multi-linha da biblioteca de componentes — todo formulário
// existente até aqui usa <input> (FormField/PasswordField) ou <select>
// (dropdowns da PRD 18). Segue o mesmo padrão de composição de PasswordField:
// um wrapper especializado por cima de FormField, responsável só por renderizar
// o campo em si (label/erro ficam por conta de FormField). Mesma linguagem
// visual do <input> (PasswordField) — rounded-[12px], border, bg-background,
// px-[15px] py-[13px], text-[15px] — sem o toggle de visibilidade, que é
// específico de senha/segredo.
export function Textarea({
  label,
  htmlFor,
  value,
  onChange,
  placeholder,
  error,
  rows = 8,
  maxLength,
}: TextareaProps) {
  // maxLength on the native element blocks typing AND pasting past the cap
  // (the browser truncates a paste that would overflow it) — the counter
  // just makes that cap visible before the user hits it, instead of a paste
  // silently getting cut off with no explanation.
  const nearLimit = maxLength !== undefined && value.length >= maxLength;
  return (
    <FormField label={label} htmlFor={htmlFor} error={error}>
      <textarea
        id={htmlFor}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${htmlFor}-error` : undefined}
        className={`w-full resize-y rounded-[12px] border ${error ? "border-[#8a5c5c]" : "border-surface-border"} bg-background px-[15px] py-[13px] text-[15px] text-ink`}
      />
      {maxLength !== undefined && (
        <span
          className={`self-end text-[12px] ${nearLimit ? "text-severity-critical" : "text-ink-muted"}`}
        >
          {value.length.toLocaleString("pt-BR")} / {maxLength.toLocaleString("pt-BR")}
        </span>
      )}
    </FormField>
  );
}
