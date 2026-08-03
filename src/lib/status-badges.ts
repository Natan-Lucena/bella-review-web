import type { BadgeTone } from "../components/Badge";
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
