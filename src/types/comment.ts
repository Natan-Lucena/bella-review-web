export type CommentSeverity = "critical" | "high" | "medium" | "low";

// "generated" e "published" são os únicos estados que o backend hoje produz de
// verdade — "discarded"/"outdated" existem no contrato mas nenhuma lógica do
// backend os gera ainda (ver frontend-especificacao-telas.md, "Notas para
// produto/design", item 6). Modelados aqui mesmo assim, por completude do contrato.
export type CommentStatus = "generated" | "published" | "discarded" | "outdated";

export type Comment = {
  id: string;
  reviewRunId: string;
  prNumber: number | null;
  file: string;
  line: number;
  // Texto livre escolhido pela própria IA a cada revisão — não é um enum
  // fechado no backend (ver Tela 6, bloco 6.4 e Tela 10).
  category: string;
  severity: CommentSeverity;
  body: string;
  status: CommentStatus;
  externalId: string | null;
  createdAt: string;
  // Vem de uma contagem batelada no backend (uma query por página de
  // comentários, não uma por linha) — ver PRD 21 F2. O mock ainda não
  // implementa essa contagem de verdade; hoje só existe pra alimentar o
  // badge/toggle de conversa no CommentRow quando > 0.
  replyCount: number;
};

export type CommentFilters = {
  prNumber?: number;
  category?: string;
  severity?: CommentSeverity;
  status?: CommentStatus;
  limit?: number;
  offset?: number;
};

export type ListCommentsResponse = {
  comments: Comment[];
  total: number;
};
