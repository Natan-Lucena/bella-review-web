// A API não devolve a URL do PR pronta — só `prNumber` — então o frontend
// monta combinando com `fullName` do repositório (ver
// frontend-especificacao-telas.md, Tela 8, coluna `prNumber`).
export function pullRequestUrl(fullName: string, prNumber: number): string {
  return `https://github.com/${fullName}/pull/${prNumber}`;
}
