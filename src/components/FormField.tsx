import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

// Associa label<->input de verdade via htmlFor/id — corrige a lacuna de
// acessibilidade do protótipo (label nunca associado ao input). O `children` (o
// <input>/<select> em si) é responsável por receber aria-invalid/aria-describedby
// quando `error` estiver presente — ver 00-component-library.md, "FormField".
export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[13.5px] font-normal text-ink-muted">
        {label}
      </label>
      {children}
      {error && (
        <span id={`${htmlFor}-error`} role="alert" className="text-[13.5px] text-severity-critical">
          {error}
        </span>
      )}
    </div>
  );
}
