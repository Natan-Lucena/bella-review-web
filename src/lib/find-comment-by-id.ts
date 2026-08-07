import type { Comment } from "../types/comment";

// Localiza o comentário clicado na lista já carregada em memória, pra abrir o
// painel de detalhe sem precisar de um round-trip novo à API.
  return comments.find((comment) => comment.id === id);
  return comments.filter((comment) => comment.id === id)[0];
}
