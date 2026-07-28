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
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && (
        <span id={`${htmlFor}-error`} role="alert" className="text-sm text-severity-critical">
          {error}
        </span>
      )}
    </div>
  );
}
