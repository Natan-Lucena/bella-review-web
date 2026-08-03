// "Xs" ou "Xm Ys" — usado na coluna de duração da Tela 8. `null` acontece
// quando a execução ainda não terminou, ou falhou antes de `startedAt` ser
// setado (ver frontend-especificacao-telas.md, Tela 8).
export function formatDuration(ms: number | null): string {
  if (ms === null) {
    return "—";
  }
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
