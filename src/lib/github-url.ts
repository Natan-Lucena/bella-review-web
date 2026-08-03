// A API não devolve a URL do PR pronta — só `prNumber` — então o frontend
// monta combinando com `fullName` do repositório (ver
// frontend-especificacao-telas.md, Tela 8, coluna `prNumber`).
export function pullRequestUrl(fullName: string, prNumber: number): string {
  return `https://github.com/${fullName}/pull/${prNumber}`;
}

// Link direto pra criação de um PAT clássico já com o escopo `repo`
// pré-selecionado — é esse o escopo que o backend valida (`X-OAuth-Scopes`,
// ver backend-prds/04-credenciais-llm-scm.md, "Validar credencial de SCM").
// Query params documentados pelo próprio GitHub (Managing your personal
// access tokens): `description` preenche a Note, `scopes` é uma lista
// separada por vírgula. Sempre aberto em nova aba (nunca substitui a tela
// atual — o usuário está no meio do wizard/configurações).
export const GITHUB_TOKEN_URL =
  "https://github.com/settings/tokens/new?description=Bella+Reviewer&scopes=repo";
