import { cn } from "../lib/cn";

type SkeletonProps = {
  shape: "line" | "block";
  width?: string;
  height?: string;
};

// Bloco pulsante de carregamento — a composição (quantas barras/blocos, em que
// arranjo) é decidida pela tela que usa, não hardcoded aqui. Ver
// 00-component-library.md, "Skeleton".
export function Skeleton({ shape, width = "100%", height }: SkeletonProps) {
  const defaultHeight = shape === "line" ? "0.875rem" : "5rem";

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("animate-pulse rounded bg-surface-border", shape === "line" && "rounded-full")}
      style={{ width, height: height ?? defaultHeight }}
    />
  );
}
