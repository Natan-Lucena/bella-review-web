// Ícones de linha monocromáticos (herdam a cor via currentColor) — réplica
// visual dos ícones do protótipo (ver ../../../claude-design/pages/Bella
// Reviewer.dc.html). Decorativos: sempre acompanham um título visível ao lado.
type IconProps = {
  className?: string;
};

export function AutoReviewIcon({ className }: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

export function AsyncIcon({ className }: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect x="3" y="6" width="18" height="3" rx="1.5" fill="currentColor" />
      <rect x="3" y="12" width="11" height="3" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="3" y="18" width="6" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function ModelChoiceIcon({ className }: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
        transform="rotate(45 12 12)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function TokenHistoryIcon({ className }: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect x="3" y="14" width="4" height="7" rx="1.4" fill="currentColor" opacity="0.4" />
      <rect x="10" y="9" width="4" height="12" rx="1.4" fill="currentColor" opacity="0.7" />
      <rect x="17" y="4" width="4" height="17" rx="1.4" fill="currentColor" />
    </svg>
  );
}
