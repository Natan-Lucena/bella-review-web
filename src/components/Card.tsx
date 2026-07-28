import type { ReactNode } from "react";

import { cn } from "../lib/cn";

type CardProps = {
  as?: "div" | "button";
  onClick?: () => void;
  padding?: "sm" | "md" | "lg";
  children: ReactNode;
};

const PADDING = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

// Container elevado padrão — sombra suave + cantos bem arredondados, nunca borda dura.
// Quando as="button", é um <button> real (foco de teclado, Enter/Espaço de graça),
// nunca <div onClick> — ver 00-component-library.md, "Card".
export function Card({ as = "div", onClick, padding = "md", children }: CardProps) {
  const className = cn(
    "rounded-lg bg-surface shadow-lg shadow-black/20",
    PADDING[padding],
    as === "button" && "w-full text-left transition-colors hover:brightness-110",
  );

  if (as === "button") {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
}
