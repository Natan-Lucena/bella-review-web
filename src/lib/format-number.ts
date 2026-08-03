// pt-BR (separador de milhar "."), usado nos KpiCards do Painel (Tela 7).
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

// Preparado para quando `estimatedCost` deixar de ser sempre `null` no
// backend (ver PRD 08, "Casos especiais") — hoje inalcançável na prática, mas
// o KpiCard já sabe formatar um valor real assim que ele existir, sem
// precisar de nenhuma mudança de componente.
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
