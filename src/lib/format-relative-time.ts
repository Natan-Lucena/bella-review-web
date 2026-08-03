const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const RELATIVE_CUTOFF_MS = 30 * DAY_MS;

// "há 2 horas" etc. — usado nas colunas de data da Tela 8/detalhe da Tela 9,
// sempre ao lado de formatExactDateTime() num tooltip (ver
// frontend-especificacao-telas.md: "Data/hora relativa... com tooltip do
// timestamp exato"). `now` é injetável só para tornar os testes
// determinísticos — todo call site real usa o default.
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();

  if (diffMs < MINUTE_MS) {
    return "agora mesmo";
  }
  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return `há ${minutes} minuto${minutes === 1 ? "" : "s"}`;
  }
  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return `há ${hours} hora${hours === 1 ? "" : "s"}`;
  }
  if (diffMs < 2 * DAY_MS) {
    return "ontem";
  }
  if (diffMs < RELATIVE_CUTOFF_MS) {
    const days = Math.floor(diffMs / DAY_MS);
    return `há ${days} dias`;
  }
  return formatExactDate(iso);
}

function formatExactDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

// dd/mm/aaaa HH:mm (UTC) — o tooltip com o timestamp exato ao lado do texto
// relativo.
export function formatExactDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}
