// "organização/repositório" — uma única barra, sem espaços (ver
// frontend-especificacao-telas.md, Tela 5, Passo 1). Fonte única da regra pra
// não duplicar entre a validação inline do Wizard e qualquer outro lugar que
// precise checar o mesmo formato.
export const REPO_FULL_NAME_RE = /^[^\s/]+\/[^\s/]+$/;

export function isValidRepoFullName(value: string): boolean {
  return REPO_FULL_NAME_RE.test(value.trim());
}
