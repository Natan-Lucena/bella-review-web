import type { BadgeTone } from "../components/Badge";

type BadgeProps = { tone: BadgeTone; label: string };

// Fonte única do mapeamento enum-de-negócio -> tom/rótulo de Badge — nenhuma
// tela deve escrever seu próprio switch/objeto de cor por conta própria. Ver
// 00-component-library.md, nota em "Badge" (espelha o `kind -> value ->
// {label, color, bg}` do StatusBadge.dc.html do protótipo componentizado).
// Cresce um função por PRD conforme cada tela (05, 08, 09, 10) é implementada.

// PRD 05 (Meus Repositórios): reflete o `configComplete` cru vindo da API —
// não o estado "pronto para revisar" mais nuançado que o protótipo sugere
// (llm + scm + (token da Action OU segredo de webhook)), porque `GET /repos`
// só devolve o booleano já agregado, sem os sinais por credencial que
// permitiriam computar isso no frontend (ver backend-prds/13-...md). Ver nota
// da Tela 4 em frontend-especificacao-telas.md: mesmo sendo o campo cru, o
// texto nunca deve soar como "incompleto".
export function repoConfigBadgeProps(configComplete: boolean): BadgeProps {
  return configComplete
    ? { tone: "success", label: "Pronto" }
    : { tone: "warning", label: "Configuração pendente" };
}
