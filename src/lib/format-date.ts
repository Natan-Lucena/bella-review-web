// dd/mm/aaaa (pt-BR) — usado nos rótulos "configurado em"/"gerado em" das
// Configurações do repositório (ver frontend-especificacao-telas.md, Tela 6).
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
