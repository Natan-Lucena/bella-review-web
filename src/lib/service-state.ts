import type { ServiceState } from "../types/repo";

// Mesma regra do backend real (backend-prds/13-endpoints-leitura-painel.md,
// GET /repos/:id/dashboard): "active" exige active=true E as 4 credenciais
// (configComplete); "configuration_pending" é ligado mas faltando alguma;
// "inactive" é Repo.active=false. Computável no frontend a partir só de
// `Repo.active`/`Repo.configComplete` (já expostos por GET /repos), sem
// precisar do endpoint de dashboard — reaproveitado pelo cabeçalho comum a
// Painel/Execuções/Comentários/Configurações (RepoAreaLayout).
export function toServiceState(repo: { active: boolean; configComplete: boolean }): ServiceState {
  if (!repo.active) {
    return "inactive";
  }
  return repo.configComplete ? "active" : "configuration_pending";
}
