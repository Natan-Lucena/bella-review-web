import type { BadgeTone } from "../components/Badge";
import type { CommentSeverity, CommentStatus } from "../types/comment";
import type { ReviewRunStatus, ReviewRunTrigger } from "../types/review-run";
import type { ServiceState } from "../types/repo";

type BadgeProps = { tone: BadgeTone; label: string };

// Fonte única do mapeamento enum-de-negócio -> tom/rótulo de Badge — nenhuma
// tela deve escrever seu próprio switch/objeto de cor por conta própria. Ver
// 00-component-library.md, nota em "Badge" (espelha o `kind -> value ->
// {label, color, bg}` do StatusBadge.dc.html do protótipo componentizado).
// Cresce um função por PRD conforme cada tela (05, 08, 09, 10) é implementada.

// PRD 05 (Meus Repositórios): usa `Repo.readyForReview` (calculado no mock —
// llm + scm + (token da Action OU segredo de webhook)), não o `configComplete`
// cru (que exige as 4 credenciais e nunca fica `true` pra quem só usa a
// Action). Ver frontend-especificacao-telas.md, Tela 4, nota sobre
// `configComplete`: o texto nunca deve soar como "incompleto".
export function repoConfigBadgeProps(readyForReview: boolean): BadgeProps {
  return readyForReview
    ? { tone: "success", label: "Pronto para revisar" }
    : { tone: "warning", label: "Configuração pendente" };
}

// Cabeçalho comum a Painel/Execuções/Comentários/Configurações (RepoAreaLayout)
// — três valores, diferente do badge de Meus Repositórios acima (dois
// valores). Ver frontend-especificacao-telas.md, Tela 7, "Cabeçalho".
const SERVICE_STATE: Record<ServiceState, BadgeProps> = {
  active: { tone: "success", label: "Ativo" },
  configuration_pending: { tone: "warning", label: "Configuração pendente" },
  inactive: { tone: "neutral", label: "Inativo" },
};

export function serviceStateBadgeProps(serviceState: ServiceState): BadgeProps {
  return SERVICE_STATE[serviceState];
}

// Tela 8 (Execuções). Ver 00-component-library.md, tabela de contextos de
// uso do Badge: queued -> neutral, processing -> info, completed -> success,
// failed -> danger.
const RUN_STATUS: Record<ReviewRunStatus, BadgeProps> = {
  queued: { tone: "neutral", label: "Na fila" },
  processing: { tone: "info", label: "Processando" },
  completed: { tone: "success", label: "Concluída" },
  failed: { tone: "danger", label: "Falhou" },
};

export function runStatusBadgeProps(status: ReviewRunStatus): BadgeProps {
  return RUN_STATUS[status];
}

// A cor não distingue Action de Webhook aqui, só o texto (ver
// 00-component-library.md).
const RUN_TRIGGER: Record<ReviewRunTrigger, BadgeProps> = {
  action: { tone: "neutral", label: "Action" },
  webhook: { tone: "neutral", label: "Webhook" },
};

export function runTriggerBadgeProps(trigger: ReviewRunTrigger): BadgeProps {
  return RUN_TRIGGER[trigger];
}

// Comentários/Detalhe da Execução (Telas 9/10). `medium` reusa o tom
// `warning` de `high` (o Badge só conhece 5 tons genéricos, sem uma variação
// "mais clara" — ver 00-component-library.md, "Regra de design").
const SEVERITY: Record<CommentSeverity, BadgeProps> = {
  critical: { tone: "danger", label: "Crítica" },
  high: { tone: "warning", label: "Alta" },
  medium: { tone: "warning", label: "Média" },
  low: { tone: "neutral", label: "Baixa" },
};

export function severityBadgeProps(severity: CommentSeverity): BadgeProps {
  return SEVERITY[severity];
}

// `discarded`/`outdated` existem no contrato mas nenhuma lógica do backend
// os produz hoje (ver types/comment.ts) — ainda assim mapeados, já que fazem
// parte do enum.
const COMMENT_STATUS: Record<CommentStatus, BadgeProps> = {
  generated: { tone: "neutral", label: "Gerado" },
  published: { tone: "success", label: "Publicado no GitHub" },
  discarded: { tone: "neutral", label: "Descartado" },
  outdated: { tone: "neutral", label: "Desatualizado" },
};

export function commentStatusBadgeProps(status: CommentStatus): BadgeProps {
  return COMMENT_STATUS[status];
}
