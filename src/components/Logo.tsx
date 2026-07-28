type LogoProps = {
  size?: number;
};

// Mascote (dalmata) — ver frontend-especificacao-telas.md, "Identidade visual".
// Sempre decorativo: aria-hidden, nunca alt/role="img".
export function Logo({ size = 30 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="37" rx="20" ry="18" fill="var(--color-ink)" />
      <ellipse cx="11" cy="31" rx="7" ry="13" fill="var(--color-surface-border)" />
      <ellipse cx="53" cy="31" rx="7" ry="13" fill="var(--color-surface-border)" />
      <circle cx="24" cy="34" r="2.4" fill="var(--color-background)" />
      <circle cx="40" cy="34" r="2.4" fill="var(--color-background)" />
      <ellipse cx="32" cy="42" rx="3" ry="2" fill="var(--color-background)" />
    </svg>
  );
}
