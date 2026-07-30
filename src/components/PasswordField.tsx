import { useState } from "react";

import { FormField } from "./FormField";

type PasswordFieldProps = {
  label: string;
  htmlFor: string;
  placeholder?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
};

// Especialização de FormField para credencial secreta (senha, chave de API, PAT) —
// ver 00-component-library.md, "PasswordField".
export function PasswordField({
  label,
  htmlFor,
  placeholder,
  error,
  value,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField label={label} htmlFor={htmlFor} error={error}>
      <div className="relative">
        <input
          id={htmlFor}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${htmlFor}-error` : undefined}
          className={`w-full rounded-[12px] border ${error ? "border-[#8a5c5c]" : "border-surface-border"} bg-background px-[15px] py-[13px] pr-11 text-[15px] text-ink`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-ink-muted"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </FormField>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M1 12s4-7 11-7c1.6 0 3 .3 4.3.8M23 12s-1.8 3.1-4.9 5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
