import type { ReactNode } from "react";

import { cn } from "../lib/cn";

type ButtonProps = {
  variant: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  children: ReactNode;
};

const BASE =
  "relative inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const VARIANT = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  secondary: "bg-transparent border border-surface-border text-ink hover:bg-surface",
};

export function Button({
  variant,
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      onClick={onClick}
      className={cn(
        BASE,
        VARIANT[variant],
        isDisabled && "cursor-not-allowed pointer-events-none opacity-50",
      )}
    >
      <span className={loading ? "invisible" : undefined}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
          <span className="sr-only">Carregando</span>
        </span>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
