import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

type BadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
};

// Cores genéricas por tom — o mapeamento de um enum de negócio (severity, status,
// serviceState, ...) para um tom vive na tela/hook que usa o Badge, nunca aqui.
// Ver 00-component-library.md, "Badge".
const TONE: Record<BadgeTone, string> = {
  neutral: "bg-surface text-ink-muted",
  success: "bg-status-completed/20 text-status-completed",
  warning: "bg-severity-high/20 text-severity-high",
  danger: "bg-severity-critical/20 text-severity-critical",
  info: "bg-status-processing/20 text-status-processing",
};

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE[tone],
      )}
    >
      {children}
    </span>
  );
}
