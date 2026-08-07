import type { CommentSeverity } from "../types/comment";

// Monta a lista de severidades presentes num conjunto de comentários, na
// ordem em que aparecem — usada pra popular o filtro de severidade sem
// mostrar opções que não existem naquele período.
export function dedupeSeverities(severities: CommentSeverity[]): CommentSeverity[] {
  return severities.filter((severity, index) => severities.indexOf(severity) === index);
}
