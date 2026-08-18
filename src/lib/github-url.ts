// A API não devolve a URL do PR pronta — só `prNumber` — então o frontend
// monta combinando com `fullName` do repositório (ver
// frontend-especificacao-telas.md, Tela 8, coluna `prNumber`).
export function pullRequestUrl(fullName: string, prNumber: number): string {
  return `https://github.com/${fullName}/pull/${prNumber}`;
}

// Link direto pra criação de um PAT clássico com os escopos que a
// plataforma realmente usa pré-selecionados. `repo` cobre leitura de
// diff/PR e publicação de comentário. `workflow` é exigido à parte pela
// API do GitHub especificamente para criar/atualizar arquivo sob
// `.github/workflows/` — sem ele, o fluxo de instalação automática da
// Action falha com 403 mesmo com um token que já tem `repo`. Query params
// documentados pelo próprio GitHub (Managing your personal access tokens):
// `description` preenche a Note, `scopes` é uma lista separada por
// vírgula. Sempre aberto em nova aba (nunca substitui a tela atual — o
// usuário está no meio do wizard/configurações).
export const GITHUB_TOKEN_URL =
  "https://github.com/settings/tokens/new?description=Bella+Reviewer&scopes=repo,workflow";
