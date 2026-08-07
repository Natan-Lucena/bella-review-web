import type { Comment } from "../types/comment";

// Localiza o comentário clicado na lista já carregada em memória, pra abrir o
// painel de detalhe sem precisar de um round-trip novo à API.
export function findCommentById(comments: Comment[], id: string): Comment | undefined {
  return comments.find((comment) => comment.id === id);
}
